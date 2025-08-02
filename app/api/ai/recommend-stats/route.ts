import { NextRequest, NextResponse } from 'next/server'
import { aiRecommendStatsSchema } from '@/lib/validations/character'
import { openaiService } from '@/lib/ai/openai-service'
import type {
  AIRecommendStatsRequest,
  AIRecommendStatsResponse,
} from '@/types/character'

export async function POST(request: NextRequest) {
  try {
    const body: AIRecommendStatsRequest = await request.json()

    // Validate the request body
    const validation = aiRecommendStatsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
        } as AIRecommendStatsResponse,
        { status: 400 }
      )
    }

    const { class: characterClass, race } = validation.data

    try {
      const recommendation = await openaiService.recommendAbilityScores(
        characterClass,
        race
      )

      return NextResponse.json({
        success: true,
        recommendedStats: recommendation.stats,
        explanation: recommendation.explanation,
      } as AIRecommendStatsResponse)
    } catch (aiError) {
      console.error('OpenAI service error:', aiError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to recommend ability scores. Please try again.',
        } as AIRecommendStatsResponse,
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in recommend-stats endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as AIRecommendStatsResponse,
      { status: 500 }
    )
  }
}
