import { z } from 'zod'

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name must be under 100 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  characterId: z.string().cuid('Invalid character ID'),
})

export const updateCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name must be under 100 characters').optional(),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  isActive: z.boolean().optional(),
  currentScene: z.object({
    title: z.string().min(1, 'Scene title is required'),
    description: z.string().min(1, 'Scene description is required'),
    location: z.string().min(1, 'Location is required'),
    npcs: z.array(z.object({
      id: z.string(),
      name: z.string(),
      race: z.string().optional(),
      role: z.string(),
      disposition: z.enum(['friendly', 'neutral', 'hostile']),
      description: z.string(),
      dialogue: z.array(z.string()).optional(),
    })),
    availableActions: z.array(z.object({
      id: z.string(),
      type: z.enum(['dialogue', 'exploration', 'combat', 'skill_check', 'custom']),
      label: z.string(),
      description: z.string(),
      difficulty: z.number().min(1).max(30).optional(),
      skill: z.string().optional(),
      consequences: z.array(z.string()).optional(),
    })),
    atmosphere: z.string().optional(),
    environment: z.string().optional(),
  }).optional(),
})

export const campaignIdSchema = z.object({
  id: z.string().cuid('Invalid campaign ID'),
})

export const gameEventSchema = z.object({
  type: z.enum(['action', 'dialogue', 'combat', 'exploration', 'system']),
  description: z.string().min(1, 'Event description is required'),
  playerAction: z.string().optional(),
  dmResponse: z.string().optional(),
  diceRolls: z.array(z.object({
    id: z.string(),
    type: z.enum(['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']),
    count: z.number().min(1),
    modifier: z.number(),
    result: z.array(z.number()),
    total: z.number(),
    purpose: z.string(),
    skill: z.string().optional(),
    advantage: z.boolean().optional(),
    disadvantage: z.boolean().optional(),
  })).optional(),
  eventData: z.any().optional(),
})

export const questSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Quest title is required'),
  description: z.string().min(1, 'Quest description is required'),
  objectives: z.array(z.object({
    id: z.string(),
    description: z.string(),
    completed: z.boolean(),
    optional: z.boolean(),
  })),
  status: z.enum(['active', 'completed', 'failed']),
  experienceReward: z.number().min(0).optional(),
  goldReward: z.number().min(0).optional(),
  itemRewards: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    description: z.string(),
    weight: z.number(),
    value: z.number(),
    quantity: z.number(),
    properties: z.array(z.string()).optional(),
  })).optional(),
})