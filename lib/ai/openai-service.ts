import OpenAI from 'openai'
import { prisma } from '@/lib/database/prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ReferenceDataContext {
  race?: any
  class?: any
  background?: any
}

export class OpenAIService {
  /**
   * Get reference data from the database to provide context for AI prompts
   */
  private async getReferenceData(
    race?: string,
    characterClass?: string,
    background?: string
  ): Promise<ReferenceDataContext> {
    const context: ReferenceDataContext = {}

    try {
      if (race) {
        const raceData = await prisma.referenceData.findFirst({
          where: { type: 'race', name: { equals: race, mode: 'insensitive' } },
        })
        context.race = raceData?.data
      }

      if (characterClass) {
        const classData = await prisma.referenceData.findFirst({
          where: {
            type: 'class',
            name: { equals: characterClass, mode: 'insensitive' },
          },
        })
        context.class = classData?.data
      }

      if (background) {
        const backgroundData = await prisma.referenceData.findFirst({
          where: {
            type: 'background',
            name: { equals: background, mode: 'insensitive' },
          },
        })
        context.background = backgroundData?.data
      }
    } catch (error) {
      console.error('Error fetching reference data:', error)
    }

    return context
  }

  /**
   * Generate a character background story using OpenAI
   */
  async generateCharacterBackground(
    race: string,
    characterClass: string,
    background: string,
    alignment?: string,
    name?: string
  ): Promise<string> {
    const context = await this.getReferenceData(
      race,
      characterClass,
      background
    )

    const raceTraits = context.race
      ? `Race traits: ${JSON.stringify(context.race.traits || [])}`
      : ''
    const classFeatures = context.class
      ? `Class features: ${JSON.stringify(Object.keys(context.class.features || {}).slice(0, 3))}`
      : ''
    const backgroundFeature = context.background?.feature
      ? `Background feature: ${context.background.feature.name}`
      : ''

    const prompt = `Create a compelling D&D 5e character background story for:
- Name: ${name || 'A character'}
- Race: ${race}
- Class: ${characterClass}
- Background: ${background}
- Alignment: ${alignment || 'Not specified'}

${raceTraits}
${classFeatures}
${backgroundFeature}

Write a 2-3 paragraph character backstory that:
1. Incorporates the race's cultural traits and characteristics
2. Explains how they became their chosen class
3. Connects to their background profession/lifestyle
4. Hints at motivations for adventuring
5. Maintains consistency with their alignment (if provided)

Keep it engaging, original, and suitable for a D&D campaign. Focus on personality, relationships, and formative experiences.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a creative D&D dungeon master with expertise in character development and D&D 5e lore. Create engaging, original character backgrounds that feel authentic to the D&D universe.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.8,
      })

      return (
        completion.choices[0]?.message?.content ||
        'Unable to generate background story.'
      )
    } catch (error) {
      console.error('Error generating character background:', error)
      throw new Error('Failed to generate character background')
    }
  }

  /**
   * Suggest personality traits based on character details
   */
  async suggestPersonalityTraits(
    race: string,
    characterClass: string,
    background: string,
    alignment?: string
  ): Promise<string[]> {
    const context = await this.getReferenceData(
      race,
      characterClass,
      background
    )

    const raceTraits = context.race
      ? `Race traits: ${JSON.stringify(context.race.traits || [])}`
      : ''
    const backgroundInfo = context.background
      ? `Background: ${context.background.description || ''}`
      : ''

    const prompt = `Suggest 4-6 personality traits for a D&D 5e character with:
- Race: ${race}
- Class: ${characterClass}
- Background: ${background}
- Alignment: ${alignment || 'Not specified'}

${raceTraits}
${backgroundInfo}

Provide personality traits that:
1. Reflect the character's racial heritage and cultural background
2. Align with their class philosophy and training
3. Connect to their background experiences
4. Are consistent with their alignment (if provided)
5. Are diverse and create interesting roleplay opportunities

Return ONLY a JSON array of 4-6 short personality trait strings, no additional text.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a D&D character creation expert. Respond with only a valid JSON array of personality trait strings.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      try {
        const traits = JSON.parse(response)
        if (Array.isArray(traits)) {
          return traits.slice(0, 6) // Ensure max 6 traits
        }
        throw new Error('Response is not an array')
      } catch {
        // Fallback: extract traits from text response
        const lines = response.split('\n').filter(line => line.trim())
        return lines
          .slice(0, 6)
          .map(line => line.replace(/^[-*]\s*/, '').trim())
      }
    } catch (error) {
      console.error('Error suggesting personality traits:', error)
      throw new Error('Failed to suggest personality traits')
    }
  }

  /**
   * Recommend ability score distribution based on class
   */
  async recommendAbilityScores(
    characterClass: string,
    race?: string
  ): Promise<{ stats: Record<string, number>; explanation: string }> {
    const context = await this.getReferenceData(race, characterClass)

    const classPrimary = context.class?.primaryAbility || []
    const raceBonuses = context.race?.abilityScoreIncrease || {}

    const prompt = `Recommend optimal ability score distribution for a D&D 5e character using STRICT point-buy rules:
- Class: ${characterClass}
- Race: ${race || 'Not specified'}
- Primary abilities: ${JSON.stringify(classPrimary)}
- Racial bonuses: ${JSON.stringify(raceBonuses)}

CRITICAL POINT-BUY RULES:
- All abilities start at 8 (cost: 0 points)
- Scores 9-13 cost 1 point each (so 13 costs 5 points total)
- Score 14 costs 2 points (7 points total)
- Score 15 costs 2 points (9 points total)
- TOTAL BUDGET: Exactly 27 points
- MAXIMUM SCORE: 15 (before racial bonuses)

Provide a distribution that:
1. Prioritizes the class's primary abilities
2. Considers racial ability score bonuses
3. Ensures decent Constitution for survivability
4. Uses EXACTLY 27 points total

Return a JSON object with:
{
  "stats": {
    "strength": number,
    "dexterity": number,
    "constitution": number,
    "intelligence": number,
    "wisdom": number,
    "charisma": number
  },
  "explanation": "Brief explanation of the distribution choices"
}`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a D&D optimization expert. Respond with only valid JSON containing recommended ability scores and a brief explanation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.3,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      const recommendation = JSON.parse(response)

      // Validate the response structure
      if (!recommendation.stats || !recommendation.explanation) {
        throw new Error('Invalid response structure')
      }

      return recommendation
    } catch (error) {
      console.error('Error recommending ability scores:', error)
      throw new Error('Failed to recommend ability scores')
    }
  }

  /**
   * Generate character name suggestions based on race and background
   */
  async suggestCharacterNames(
    race: string,
    background?: string,
    gender?: 'Male' | 'Female' | 'Non-binary' | 'Other' | 'Neutral'
  ): Promise<string[]> {
    const context = await this.getReferenceData(race)

    const prompt = `Suggest 5-8 appropriate names for a D&D 5e character:
- Race: ${race}
- Background: ${background || 'Not specified'}
- Gender: ${gender || 'Any'}

${context.race ? `Race information: ${JSON.stringify(context.race)}` : ''}

Provide names that:
1. Fit the race's cultural naming conventions
2. Sound authentic to D&D fantasy settings
3. Vary in style and length
4. Include both common and unique options

Return ONLY a JSON array of name strings, no additional text.`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a D&D naming expert. Respond with only a valid JSON array of character name strings.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) throw new Error('No response from OpenAI')

      const names = JSON.parse(response)
      if (Array.isArray(names)) {
        return names.slice(0, 8)
      }
      throw new Error('Response is not an array')
    } catch (error) {
      console.error('Error suggesting character names:', error)
      throw new Error('Failed to suggest character names')
    }
  }
}

export const openaiService = new OpenAIService()
