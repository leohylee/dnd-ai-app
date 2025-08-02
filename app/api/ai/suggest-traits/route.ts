import { NextRequest, NextResponse } from 'next/server'
import { aiSuggestTraitsSchema } from '@/lib/validations/character'
import { openaiService } from '@/lib/ai/openai-service'
import type {
  AISuggestTraitsRequest,
  AISuggestTraitsResponse,
} from '@/types/character'

export async function POST(request: NextRequest) {
  try {
    const body: AISuggestTraitsRequest = await request.json()

    // Validate the request body
    const validation = aiSuggestTraitsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
        } as AISuggestTraitsResponse,
        { status: 400 }
      )
    }

    const {
      race,
      class: characterClass,
      background,
      alignment,
    } = validation.data

    try {
      const suggestedTraits = await openaiService.suggestPersonalityTraits(
        race,
        characterClass,
        background,
        alignment
      )

      return NextResponse.json({
        success: true,
        traits: suggestedTraits,
      } as AISuggestTraitsResponse)
    } catch (aiError) {
      console.error('OpenAI service error:', aiError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to suggest personality traits. Please try again.',
        } as AISuggestTraitsResponse,
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in suggest-traits endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as AISuggestTraitsResponse,
      { status: 500 }
    )
  }
}
