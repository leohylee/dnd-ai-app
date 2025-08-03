import { prisma } from '@/lib/database/prisma'
import type { AbilityScores } from '../validations/character'


export interface CharacterCalculations {
  finalStats: AbilityScores
  hp: { current: number; max: number }
  proficiencyBonus: number
  ac: number
}

/**
 * Calculate ability score modifier from score value
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Calculate proficiency bonus based on character level
 */
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1
}

/**
 * Get racial ability score bonuses from reference data
 */
export async function getRacialBonuses(
  raceName: string
): Promise<Record<string, number>> {
  try {
    const raceData = await prisma.referenceData.findFirst({
      where: {
        type: 'race',
        name: { equals: raceName, mode: 'insensitive' },
      },
    })

    if (!raceData) {
      console.warn(`Race data not found for: ${raceName}`)
      return {}
    }

    const race = raceData.data as any
    return race.abilityScoreIncrease || {}
  } catch (error) {
    console.error('Error fetching racial bonuses:', error)
    return {}
  }
}

/**
 * Get class hit die from reference data
 */
export async function getClassHitDie(className: string): Promise<number> {
  try {
    const classData = await prisma.referenceData.findFirst({
      where: {
        type: 'class',
        name: { equals: className, mode: 'insensitive' },
      },
    })

    if (!classData) {
      console.warn(`Class data not found for: ${className}`)
      return 8 // Default hit die
    }

    const characterClass = classData.data as any
    return characterClass.hitDie || 8
  } catch (error) {
    console.error('Error fetching class hit die:', error)
    return 8 // Default hit die
  }
}

/**
 * Calculate final ability scores with racial bonuses
 */
export async function calculateFinalStats(
  baseStats: AbilityScores,
  raceName: string
): Promise<AbilityScores> {
  const racialBonuses = await getRacialBonuses(raceName)

  return {
    strength: baseStats.strength + (racialBonuses.strength || 0),
    dexterity: baseStats.dexterity + (racialBonuses.dexterity || 0),
    constitution: baseStats.constitution + (racialBonuses.constitution || 0),
    intelligence: baseStats.intelligence + (racialBonuses.intelligence || 0),
    wisdom: baseStats.wisdom + (racialBonuses.wisdom || 0),
    charisma: baseStats.charisma + (racialBonuses.charisma || 0),
  }
}

/**
 * Calculate maximum hit points for a character
 */
export async function calculateMaxHP(
  className: string,
  level: number,
  constitutionModifier: number
): Promise<number> {
  const hitDie = await getClassHitDie(className)

  // First level: max hit die + con modifier
  // Additional levels: average hit die + con modifier per level
  const firstLevelHP = hitDie + constitutionModifier
  const additionalLevelsHP =
    (level - 1) * (Math.floor(hitDie / 2) + 1 + constitutionModifier)

  return Math.max(1, firstLevelHP + additionalLevelsHP)
}

/**
 * Calculate base armor class (10 + dex modifier)
 */
export function calculateBaseAC(dexterityModifier: number): number {
  return 10 + dexterityModifier
}

/**
 * Perform all character calculations
 */
export async function calculateCharacterStats(
  baseStats: AbilityScores,
  raceName: string,
  className: string,
  level: number = 1
): Promise<CharacterCalculations> {
  // Calculate final stats with racial bonuses
  const finalStats = await calculateFinalStats(baseStats, raceName)

  // Calculate modifiers
  const constitutionModifier = getAbilityModifier(finalStats.constitution)
  const dexterityModifier = getAbilityModifier(finalStats.dexterity)

  // Calculate derived stats
  const maxHP = await calculateMaxHP(className, level, constitutionModifier)
  const proficiencyBonus = getProficiencyBonus(level)
  const ac = calculateBaseAC(dexterityModifier)

  return {
    finalStats,
    hp: { current: maxHP, max: maxHP },
    proficiencyBonus,
    ac,
  }
}

/**
 * Validate ability scores for point buy system
 */
export function validatePointBuyStats(stats: AbilityScores): {
  valid: boolean
  error?: string
} {
  const values = Object.values(stats)

  // Check if all values are between 8 and 15 (before racial bonuses)
  if (values.some(val => val < 8 || val > 15)) {
    return {
      valid: false,
      error: 'All ability scores must be between 8 and 15',
    }
  }

  // Calculate point buy cost
  const cost = values.reduce((total, score) => {
    if (score >= 14) return total + (score - 8) + 1 // 14 and 15 cost extra
    return total + Math.max(0, score - 8)
  }, 0)

  if (cost > 27) {
    return { valid: false, error: 'Point buy total exceeds 27 points' }
  }

  return { valid: true }
}

/**
 * Generate default skills based on class and background
 */
export async function getDefaultSkills(
  className: string,
  backgroundName: string
): Promise<string[]> {
  try {
    const [, backgroundData] = await Promise.all([
      prisma.referenceData.findFirst({
        where: {
          type: 'class',
          name: { equals: className, mode: 'insensitive' },
        },
      }),
      prisma.referenceData.findFirst({
        where: {
          type: 'background',
          name: { equals: backgroundName, mode: 'insensitive' },
        },
      }),
    ])

    const skills: string[] = []

    // Add background skills
    if (backgroundData) {
      const background = backgroundData.data as any
      if (
        background.skillProficiencies &&
        Array.isArray(background.skillProficiencies)
      ) {
        skills.push(...background.skillProficiencies)
      }
    }

    // Note: Class skill selection would typically be done during character creation
    // as players choose from available options

    return skills
  } catch (error) {
    console.error('Error getting default skills:', error)
    return []
  }
}
