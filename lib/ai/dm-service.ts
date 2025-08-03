import OpenAI from 'openai'
import { prisma } from '@/lib/database/prisma'
import type {
  Campaign,
  Scene,
  GameEvent,
  ActionOption,
  NPC,
} from '@/types/campaign'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface DMActionRequest {
  campaignId: string
  actionId?: string
  customAction?: string
  playerInput: string
}

export interface DMResponse {
  success: boolean
  narrative: string
  newScene?: Scene
  choices: ActionOption[]
  diceRollRequired?: {
    type: 'ability_check' | 'skill_check' | 'saving_throw' | 'attack'
    ability?: string
    skill?: string
    difficulty: number
    description: string
  }
  gameEvent?: Partial<GameEvent>
  error?: string
}

export class DMService {
  /**
   * Process a player action and generate AI DM response
   */
  async processPlayerAction(request: DMActionRequest): Promise<DMResponse> {
    try {
      // Get campaign with context
      const campaign = await this.getCampaignContext(request.campaignId)
      if (!campaign) {
        return {
          success: false,
          error: 'Campaign not found',
          narrative: '',
          choices: [],
        }
      }

      // Get recent game events for context
      const recentEvents = await this.getRecentEvents(request.campaignId, 10)

      // Generate AI response
      const aiResponse = await this.generateDMResponse(
        campaign,
        recentEvents,
        request.playerInput,
        request.actionId
      )

      // Parse and validate AI response
      const dmResponse = await this.parseDMResponse(aiResponse)

      // Save game event
      await this.saveGameEvent(request.campaignId, {
        type: 'action',
        description: `Player: ${request.playerInput}`,
        playerAction: request.playerInput,
        dmResponse: dmResponse.narrative,
        eventData: {
          actionId: request.actionId,
          choices: dmResponse.choices,
        },
      })

      // Update campaign scene if provided
      if (dmResponse.newScene) {
        await this.updateCampaignScene(request.campaignId, dmResponse.newScene)
      }

      return dmResponse
    } catch (error) {
      console.error('Error processing player action:', error)
      return {
        success: false,
        error: 'Failed to process action',
        narrative: 'The DM seems to be thinking... Please try again.',
        choices: [],
      }
    }
  }

  /**
   * Get campaign with full context for AI
   */
  private async getCampaignContext(campaignId: string) {
    return await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            race: true,
            raceData: true,
            class: true,
            classData: true,
            level: true,
            stats: true,
            hp: true,
            ac: true,
            skills: true,
            background: true,
            alignment: true,
            personalityTraits: true,
            backstory: true,
          },
        },
        gameState: true,
      },
    })
  }

  /**
   * Get recent game events for context
   */
  private async getRecentEvents(campaignId: string, limit: number = 10) {
    return await prisma.gameEvent.findMany({
      where: { campaignId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })
  }

  /**
   * Generate AI DM response using OpenAI
   */
  private async generateDMResponse(
    campaign: any,
    recentEvents: any[],
    playerInput: string,
    actionId?: string
  ): Promise<string> {
    const character = campaign.character
    const currentScene = campaign.currentScene as Scene

    // Build context for AI
    const characterContext = `
Character: ${character.name}
Race: ${character.race} 
Class: ${character.class}
Level: ${character.level}
Background: ${character.background}
Alignment: ${character.alignment}
Stats: STR ${character.stats.strength}, DEX ${character.stats.dexterity}, CON ${character.stats.constitution}, INT ${character.stats.intelligence}, WIS ${character.stats.wisdom}, CHA ${character.stats.charisma}
HP: ${character.hp.current}/${character.hp.max}
AC: ${character.ac}
Personality: ${character.personalityTraits?.join(', ') || 'Unknown'}
`

    const sceneContext = `
Current Scene: ${currentScene.title}
Location: ${currentScene.location}
Description: ${currentScene.description}
Atmosphere: ${currentScene.atmosphere || 'Standard'}
NPCs Present: ${currentScene.npcs.map(npc => `${npc.name} (${npc.disposition})`).join(', ')}
`

    const recentHistory =
      recentEvents.length > 0
        ? `Recent Events:\n${recentEvents
            .reverse()
            .map(
              event =>
                `- ${event.playerAction || event.description}: ${event.dmResponse || ''}`
            )
            .join('\n')}`
        : 'This is the beginning of the adventure.'

    const systemPrompt = `You are an expert Dungeon Master for D&D 5e. You create immersive, engaging narratives that respond to player actions while maintaining D&D rules and lore consistency.

CORE PRINCIPLES:
- Respond dynamically to player actions with vivid, engaging descriptions
- Maintain story continuity and character consistency
- Follow D&D 5e rules for skill checks, combat, and mechanics
- Create meaningful choices that impact the story
- Keep responses focused and not overly long (2-4 paragraphs max)
- Generate 2-4 action choices that feel natural to the situation

RESPONSE FORMAT (JSON):
{
  "narrative": "Your story response to the player's action (2-4 paragraphs)",
  "choices": [
    {
      "id": "choice_1",
      "type": "dialogue|exploration|skill_check|combat|custom",
      "label": "Short action description",
      "description": "What this action accomplishes",
      "difficulty": 15 (only for skill_check type),
      "skill": "perception" (only for skill_check type)
    }
  ],
  "diceRollRequired": {
    "type": "skill_check",
    "skill": "persuasion", 
    "difficulty": 15,
    "description": "What the roll determines"
  } (only if dice roll needed),
  "newScene": {
    "title": "New scene title",
    "location": "New location", 
    "description": "Scene description",
    "npcs": [...] (if scene changes significantly)
  } (only if location/scene changes significantly)
}`

    const userPrompt = `
${characterContext}

${sceneContext}

${recentHistory}

PLAYER ACTION: "${playerInput}"
${actionId ? `(Selected action ID: ${actionId})` : '(Custom action)'}

Respond as the DM with a narrative response and present meaningful choices for what happens next. If the action requires a dice roll (skill check, attack, etc.), include the diceRollRequired field.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 800,
      temperature: 0.8,
    })

    return completion.choices[0]?.message?.content || ''
  }

  /**
   * Parse AI response and validate structure
   */
  private async parseDMResponse(aiResponse: string): Promise<DMResponse> {
    try {
      const parsed = JSON.parse(aiResponse)

      return {
        success: true,
        narrative: parsed.narrative || 'The DM pauses thoughtfully...',
        newScene: parsed.newScene,
        choices: parsed.choices || [],
        diceRollRequired: parsed.diceRollRequired,
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)

      // Fallback response if parsing fails
      return {
        success: true,
        narrative: aiResponse || 'The adventure continues...',
        choices: [
          {
            id: 'continue',
            type: 'exploration',
            label: 'Continue',
            description: 'See what happens next',
          },
        ],
      }
    }
  }

  /**
   * Save game event to database
   */
  private async saveGameEvent(
    campaignId: string,
    eventData: Partial<GameEvent>
  ) {
    await prisma.gameEvent.create({
      data: {
        campaignId,
        type: eventData.type || 'action',
        description: eventData.description || '',
        playerAction: eventData.playerAction,
        dmResponse: eventData.dmResponse,
        eventData: eventData.eventData as any,
      },
    })
  }

  /**
   * Update campaign scene
   */
  private async updateCampaignScene(campaignId: string, newScene: Scene) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        currentScene: newScene as any,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * Start a new session for a campaign
   */
  async startNewSession(campaignId: string): Promise<DMResponse> {
    try {
      const campaign = await this.getCampaignContext(campaignId)
      if (!campaign) {
        return {
          success: false,
          error: 'Campaign not found',
          narrative: '',
          choices: [],
        }
      }

      // Increment session count
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          sessionCount: { increment: 1 },
          updatedAt: new Date(),
        },
      })

      const currentScene = campaign.currentScene as Scene

      return {
        success: true,
        narrative: `Welcome back, ${campaign.character.name}! ${currentScene.description}`,
        choices: currentScene.availableActions,
      }
    } catch (error) {
      console.error('Error starting new session:', error)
      return {
        success: false,
        error: 'Failed to start session',
        narrative: '',
        choices: [],
      }
    }
  }
}

export const dmService = new DMService()
