import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import { createCharacterSchema } from '@/lib/validations/character'
import {
  calculateCharacterStats,
  getDefaultSkills,
  validatePointBuyStats,
} from '@/lib/utils/character-utils'
import { openaiService } from '@/lib/ai/openai-service'
import type {
  CreateCharacterRequest,
  CreateCharacterResponse,
} from '@/types/character'


export async function POST(request: NextRequest) {
  try {
    const body: CreateCharacterRequest = await request.json()

    // Validate the request body
    const validation = createCharacterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
        } as CreateCharacterResponse,
        { status: 400 }
      )
    }

    const {
      name,
      race,
      class: characterClass,
      background,
      alignment,
      stats,
      personalityTraits = [],
      backstory,
      useAiBackground = false,
    } = validation.data

    // Validate point buy system
    const pointBuyValidation = validatePointBuyStats(stats)
    if (!pointBuyValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: pointBuyValidation.error,
        } as CreateCharacterResponse,
        { status: 400 }
      )
    }

    // Verify that race, class, and background exist in reference data
    const [raceExists, classExists, backgroundExists] = await Promise.all([
      prisma.referenceData.findFirst({
        where: { type: 'race', name: { equals: race, mode: 'insensitive' } },
      }),
      prisma.referenceData.findFirst({
        where: {
          type: 'class',
          name: { equals: characterClass, mode: 'insensitive' },
        },
      }),
      prisma.referenceData.findFirst({
        where: {
          type: 'background',
          name: { equals: background, mode: 'insensitive' },
        },
      }),
    ])

    if (!raceExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Race "${race}" not found in reference data`,
        } as CreateCharacterResponse,
        { status: 400 }
      )
    }

    if (!classExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Class "${characterClass}" not found in reference data`,
        } as CreateCharacterResponse,
        { status: 400 }
      )
    }

    if (!backgroundExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Background "${background}" not found in reference data`,
        } as CreateCharacterResponse,
        { status: 400 }
      )
    }

    // Calculate character stats
    const calculations = await calculateCharacterStats(
      stats,
      race,
      characterClass
    )

    // Get default skills
    const defaultSkills = await getDefaultSkills(characterClass, background)

    // Generate AI background if requested
    let aiGeneratedBackground: string | undefined
    if (useAiBackground) {
      try {
        aiGeneratedBackground = await openaiService.generateCharacterBackground(
          race,
          characterClass,
          background,
          alignment,
          name
        )
      } catch (error) {
        console.error('Failed to generate AI background:', error)
        // Continue without AI background rather than failing the whole request
      }
    }

    // Create the character in the database
    const characterData = {
      name,
      race,
      raceData: raceExists.data as any,
      class: characterClass,
      classData: classExists.data as any,
      level: 1,
      experience: 0,
      stats: calculations.finalStats,
      hp: calculations.hp,
      ac: calculations.ac,
      proficiencyBonus: calculations.proficiencyBonus,
      skills: defaultSkills.map(skill => ({
        name: skill,
        ability: 'wisdom', // This would be determined by skill type
        proficient: true,
        expertise: false,
      })),
      inventory: [], // Start with empty inventory
      spells: [], // Start with empty spells
      background,
      alignment,
      personalityTraits: personalityTraits || [],
      backstory: backstory || null,
      notes: null,
      ...(aiGeneratedBackground && { aiGeneratedBackground }),
    }

    const character = await prisma.character.create({
      data: characterData,
    })

    // Transform the response to match our interface
    const responseCharacter = {
      id: character.id,
      name: character.name,
      race: character.raceData as any,
      class: character.classData as any,
      level: character.level,
      stats: character.stats as any,
      hp: character.hp as any,
      ac: character.ac,
      proficiencyBonus: character.proficiencyBonus,
      skills: character.skills as any,
      inventory: character.inventory as any,
      spells: character.spells as any,
      background: character.background,
      alignment: character.alignment,
      aiGeneratedBackground:
        (character as any).aiGeneratedBackground || undefined,
      personalityTraits:
        ((character as any).personalityTraits as string[]) || [],
      backstory: character.backstory,
      notes: character.notes,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    }

    return NextResponse.json(
      {
        success: true,
        character: responseCharacter,
      } as CreateCharacterResponse,
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating character:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as CreateCharacterResponse,
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const characters = await prisma.character.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    })

    const transformedCharacters = characters.map(character => ({
      id: character.id,
      name: character.name,
      race: character.raceData as any,
      class: character.classData as any,
      level: character.level,
      stats: character.stats as any,
      hp: character.hp as any,
      ac: character.ac,
      proficiencyBonus: character.proficiencyBonus,
      skills: character.skills as any,
      inventory: character.inventory as any,
      spells: character.spells as any,
      background: character.background,
      alignment: character.alignment,
      aiGeneratedBackground:
        (character as any).aiGeneratedBackground || undefined,
      personalityTraits:
        ((character as any).personalityTraits as string[]) || [],
      backstory: character.backstory,
      notes: character.notes,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      characters: transformedCharacters,
      total: await prisma.character.count(),
    })
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
