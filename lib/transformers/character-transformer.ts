import type { Character } from '@/types/character'

/**
 * Transform raw Prisma character data to API response format
 * 
 * This utility consolidates character data transformation logic that was
 * previously duplicated across multiple API endpoints.
 */
export function transformCharacterForApi(character: any): Character {
  return {
    id: character.id,
    name: character.name,
    race: character.raceData as any,
    class: character.classData as any,
    level: character.level,
    experience: character.experience || 0,
    stats: character.stats as any,
    hp: character.hp as any,
    ac: character.ac,
    proficiencyBonus: character.proficiencyBonus,
    skills: character.skills as any,
    inventory: character.inventory as any,
    spells: character.spells as any,
    background: character.background,
    alignment: character.alignment,
    gender: character.gender,
    aiGeneratedBackground: character.aiGeneratedBackground || undefined,
    personalityTraits: (character.personalityTraits as string[]) || [],
    backstory: character.backstory,
    notes: character.notes,
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  }
}

/**
 * Transform multiple characters for API response
 */
export function transformCharactersForApi(characters: any[]): Character[] {
  return characters.map(transformCharacterForApi)
}

/**
 * Transform character for campaign context (includes additional campaign-specific fields)
 */
export function transformCharacterForCampaign(character: any): Character & {
  // Add campaign-specific extensions if needed
  campaignId?: string
} {
  const baseCharacter = transformCharacterForApi(character)
  
  return {
    ...baseCharacter,
    // Add campaign-specific fields if present
    ...(character.campaignId && { campaignId: character.campaignId }),
  }
}

/**
 * Validate character data integrity after transformation
 */
export function validateTransformedCharacter(character: Character): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Basic required fields
  if (!character.id) errors.push('Missing character ID')
  if (!character.name?.trim()) errors.push('Missing character name')
  if (!character.race) errors.push('Missing race data')
  if (!character.class) errors.push('Missing class data')
  if (!character.stats) errors.push('Missing ability scores')
  if (!character.hp) errors.push('Missing HP data')

  // Validate stats structure
  if (character.stats) {
    const requiredStats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
    const missingStats = requiredStats.filter(stat => !(stat in character.stats))
    if (missingStats.length > 0) {
      errors.push(`Missing ability scores: ${missingStats.join(', ')}`)
    }
  }

  // Validate HP structure
  if (character.hp && typeof character.hp === 'object') {
    if (!('current' in character.hp)) errors.push('Missing current HP')
    if (!('max' in character.hp)) errors.push('Missing max HP')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Create a minimal character summary for list views
 */
export function createCharacterSummary(character: any): {
  id: string
  name: string
  race: string
  class: string
  level: number
  hp: { current: number; max: number }
  createdAt: Date
} {
  return {
    id: character.id,
    name: character.name,
    race: character.raceData?.name || character.race,
    class: character.classData?.name || character.class,
    level: character.level,
    hp: character.hp as { current: number; max: number },
    createdAt: character.createdAt,
  }
}

/**
 * Create character summaries for multiple characters
 */
export function createCharacterSummaries(characters: any[]) {
  return characters.map(createCharacterSummary)
}