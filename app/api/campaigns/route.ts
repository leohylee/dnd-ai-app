import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { createCampaignSchema } from '@/lib/validations/campaign'
import type {
  CreateCampaignRequest,
  CreateCampaignResponse,
  GetCampaignsResponse,
  Scene,
} from '@/types/campaign'

// Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body: CreateCampaignRequest = await request.json()

    // Validate the request body
    const validation = createCampaignSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
        } as CreateCampaignResponse,
        { status: 400 }
      )
    }

    const { name, description, characterId } = validation.data

    // Verify the character exists
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        race: true,
        class: true,
        level: true,
      },
    })

    if (!character) {
      return NextResponse.json(
        {
          success: false,
          error: 'Character not found',
        } as CreateCampaignResponse,
        { status: 404 }
      )
    }

    // Create initial scene
    const initialScene: Scene = {
      title: 'The Adventure Begins',
      description: `Welcome, ${character.name}! You find yourself at the threshold of a grand adventure. The world stretches out before you, full of mystery and opportunity.`,
      location: 'Crossroads Tavern',
      npcs: [
        {
          id: 'npc-tavern-keeper',
          name: 'Gareth the Innkeeper',
          race: 'Human',
          role: 'Tavern Keeper',
          disposition: 'friendly',
          description: 'A cheerful middle-aged man with a warm smile and stories to tell.',
          dialogue: [
            'Welcome to the Crossroads Tavern! What can I do for you today?',
            'I hear there are opportunities for adventurers in these parts.',
            'The roads have been dangerous lately. Be careful out there.',
          ],
        },
      ],
      availableActions: [
        {
          id: 'action-talk-innkeeper',
          type: 'dialogue',
          label: 'Talk to the Innkeeper',
          description: 'Strike up a conversation with Gareth about local news and opportunities.',
        },
        {
          id: 'action-explore-tavern',
          type: 'exploration',
          label: 'Explore the Tavern',
          description: 'Look around the tavern for interesting people or information.',
        },
        {
          id: 'action-leave-tavern',
          type: 'exploration',
          label: 'Leave the Tavern',
          description: 'Head outside to explore the surrounding area.',
        },
      ],
      atmosphere: 'Warm and welcoming with the scent of hearth fires and ale',
      environment: 'A cozy tavern with wooden tables, flickering candles, and friendly chatter',
    }

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        characterId,
        currentScene: initialScene as any,
        sessionCount: 0,
        isActive: true,
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            race: true,
            class: true,
            level: true,
          },
        },
      },
    })

    // Transform the response
    const responseData = {
      ...campaign,
      character: campaign.character,
      currentScene: campaign.currentScene as Scene,
      gameEvents: [],
    }

    return NextResponse.json(
      {
        success: true,
        campaign: responseData,
      } as CreateCampaignResponse,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as CreateCampaignResponse,
      { status: 500 }
    )
  }
}

// Get all campaigns with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const characterId = searchParams.get('characterId')
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {}
    if (characterId) {
      where.characterId = characterId
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { updatedAt: 'desc' },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            race: true,
            class: true,
            level: true,
          },
        },
        gameEvents: {
          take: 5, // Get last 5 events for preview
          orderBy: { timestamp: 'desc' },
        },
      },
    })

    const transformedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      currentScene: campaign.currentScene as Scene,
      gameEvents: campaign.gameEvents,
    }))

    const total = await prisma.campaign.count({ where })

    return NextResponse.json({
      success: true,
      campaigns: transformedCampaigns,
      total,
    } as GetCampaignsResponse)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as GetCampaignsResponse,
      { status: 500 }
    )
  }
}