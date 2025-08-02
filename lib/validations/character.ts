import { z } from 'zod'

// Core ability score schema
export const abilityScoresSchema = z.object({
  strength: z.number().min(1).max(20),
  dexterity: z.number().min(1).max(20),
  constitution: z.number().min(1).max(20),
  intelligence: z.number().min(1).max(20),
  wisdom: z.number().min(1).max(20),
  charisma: z.number().min(1).max(20),
})

// Character creation validation schema
export const createCharacterSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less'),
  race: z.string().min(1, 'Race is required'),
  class: z.string().min(1, 'Class is required'),
  background: z.string().min(1, 'Background is required'),
  alignment: z.string().min(1, 'Alignment is required'),
  stats: abilityScoresSchema,
  personalityTraits: z.array(z.string()).optional(),
  backstory: z
    .string()
    .max(2000, 'Backstory must be 2000 characters or less')
    .optional(),
  useAiBackground: z.boolean().optional(),
})

// AI background generation schema
export const aiBackgroundSchema = z.object({
  race: z.string().min(1, 'Race is required'),
  class: z.string().min(1, 'Class is required'),
  background: z.string().min(1, 'Background is required'),
  alignment: z.string().optional(),
  name: z.string().optional(),
})

// AI trait suggestion schema
export const aiSuggestTraitsSchema = z.object({
  race: z.string().min(1, 'Race is required'),
  class: z.string().min(1, 'Class is required'),
  background: z.string().min(1, 'Background is required'),
  alignment: z.string().optional(),
})

// AI stat recommendation schema
export const aiRecommendStatsSchema = z.object({
  class: z.string().min(1, 'Class is required'),
  race: z.string().optional(),
})

// Common alignment options
export const alignmentOptions = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
] as const

export const alignmentSchema = z.enum(alignmentOptions)

// Export types inferred from schemas
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>
export type AIBackgroundInput = z.infer<typeof aiBackgroundSchema>
export type AISuggestTraitsInput = z.infer<typeof aiSuggestTraitsSchema>
export type AIRecommendStatsInput = z.infer<typeof aiRecommendStatsSchema>
export type AbilityScores = z.infer<typeof abilityScoresSchema>
