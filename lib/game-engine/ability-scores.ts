export type AbilityScores = {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export type Ability =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma'

export type AbilityShorthand = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export const ABILITY_SHORTHAND_MAP: Record<AbilityShorthand, Ability> = {
  str: 'strength',
  dex: 'dexterity',
  con: 'constitution',
  int: 'intelligence',
  wis: 'wisdom',
  cha: 'charisma',
}

export type SkillName =
  | 'acrobatics'
  | 'animalHandling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleightOfHand'
  | 'stealth'
  | 'survival'

export const SKILL_ABILITY_MAP: Record<SkillName, Ability> = {
  acrobatics: 'dexterity',
  animalHandling: 'wisdom',
  arcana: 'intelligence',
  athletics: 'strength',
  deception: 'charisma',
  history: 'intelligence',
  insight: 'wisdom',
  intimidation: 'charisma',
  investigation: 'intelligence',
  medicine: 'wisdom',
  nature: 'intelligence',
  perception: 'wisdom',
  performance: 'charisma',
  persuasion: 'charisma',
  religion: 'intelligence',
  sleightOfHand: 'dexterity',
  stealth: 'dexterity',
  survival: 'wisdom',
}

export const MIN_ABILITY_SCORE = 1
export const MAX_ABILITY_SCORE = 30
export const BASE_SPELL_DC = 8

/**
 * Calculate ability modifier from ability score.
 * @param score The ability score.
 * @returns The ability modifier.
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Get all ability modifiers for a character.
 * @param scores The character's ability scores.
 * @returns Object containing all ability modifiers.
 */
export function getAllModifiers(
  scores: AbilityScores
): Record<Ability, number> {
  return {
    strength: getAbilityModifier(scores.strength),
    dexterity: getAbilityModifier(scores.dexterity),
    constitution: getAbilityModifier(scores.constitution),
    intelligence: getAbilityModifier(scores.intelligence),
    wisdom: getAbilityModifier(scores.wisdom),
    charisma: getAbilityModifier(scores.charisma),
  }
}

/**
 * Get proficiency bonus based on character level.
 * @param level The character's level.
 * @returns The proficiency bonus.
 */
export function getProficiencyBonus(level: number): number {
  const index = Math.floor((level - 1) / 4)
  const bonuses = [2, 3, 4, 5, 6]
  return bonuses[Math.min(index, bonuses.length - 1)] ?? 2
}

/**
 * Calculate total skill modifier including proficiency and expertise.
 * @param params Object containing ability score, proficiency bonus, proficiency status, and expertise status.
 * @returns The total skill modifier.
 */
export function getSkillModifier({
  abilityScore,
  proficiencyBonus,
  isProficient,
  hasExpertise = false,
}: {
  abilityScore: number
  proficiencyBonus: number
  isProficient: boolean
  hasExpertise?: boolean
}): number {
  const proficiency = isProficient ? proficiencyBonus : 0
  const expertise = hasExpertise ? proficiencyBonus : 0
  return getAbilityModifier(abilityScore) + proficiency + expertise
}

/**
 * Get the ability score associated with a skill.
 * @param skill The skill name.
 * @returns The ability associated with the skill.
 */
export function getAbilityForSkill(skill: SkillName): Ability {
  return SKILL_ABILITY_MAP[skill]
}

/**
 * Get initiative bonus based on dexterity score.
 * @param dexterityScore The character's dexterity score.
 * @returns The initiative bonus.
 */
export function getInitiativeBonus(dexterityScore: number): number {
  return getAbilityModifier(dexterityScore)
}

/**
 * Get passive perception score.
 * @param wisdomScore The character's wisdom score.
 * @param proficiencyBonus The character's proficiency bonus.
 * @param isProficient Whether the character is proficient in perception.
 * @returns The passive perception score.
 */
export function getPassivePerception(
  wisdomScore: number,
  proficiencyBonus: number,
  isProficient: boolean
): number {
  return (
    10 +
    getSkillModifier({
      abilityScore: wisdomScore,
      proficiencyBonus,
      isProficient,
    })
  )
}

/**
 * Get saving throw modifier.
 * @param params Object containing ability score, proficiency bonus, proficiency status, and expertise status.
 * @returns The saving throw modifier.
 */
export function getSavingThrowModifier({
  abilityScore,
  proficiencyBonus,
  isProficient,
  hasExpertise = false,
}: {
  abilityScore: number
  proficiencyBonus: number
  isProficient: boolean
  hasExpertise?: boolean
}): number {
  return getSkillModifier({
    abilityScore,
    proficiencyBonus,
    isProficient,
    hasExpertise,
  })
}

/**
 * Calculate spell save DC.
 * @param abilityScore The relevant ability score.
 * @param proficiencyBonus The character's proficiency bonus.
 * @returns The spell save DC.
 */
export function getSpellSaveDC(
  abilityScore: number,
  proficiencyBonus: number
): number {
  return BASE_SPELL_DC + proficiencyBonus + getAbilityModifier(abilityScore)
}

/**
 * Calculate spell attack bonus.
 * @param abilityScore The relevant ability score.
 * @param proficiencyBonus The character's proficiency bonus.
 * @returns The spell attack bonus.
 */
export function getSpellAttackBonus(
  abilityScore: number,
  proficiencyBonus: number
): number {
  return proficiencyBonus + getAbilityModifier(abilityScore)
}
