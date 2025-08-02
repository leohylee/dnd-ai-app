import { NextRequest, NextResponse } from 'next/server'
import { aiBackgroundSchema } from '@/lib/validations/character'
import { openaiService } from '@/lib/ai/openai-service'
import type {
  AIBackgroundRequest,
  AIBackgroundResponse,
} from '@/types/character'

export async function POST(request: NextRequest) {
  try {
    const body: AIBackgroundRequest = await request.json()

    // Validate the request body
    const validation = aiBackgroundSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
        } as AIBackgroundResponse,
        { status: 400 }
      )
    }

    const {
      race,
      class: characterClass,
      background,
      alignment,
      name,
    } = validation.data

    try {
      const generatedBackground =
        await openaiService.generateCharacterBackground(
          race,
          characterClass,
          background,
          alignment,
          name
        )

      return NextResponse.json({
        success: true,
        background: generatedBackground,
      } as AIBackgroundResponse)
    } catch (aiError) {
      console.error('OpenAI service error:', aiError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate background. Please try again.',
        } as AIBackgroundResponse,
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in generate-background endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as AIBackgroundResponse,
      { status: 500 }
    )
  }
}
