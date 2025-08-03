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

      // Validate the AI-generated scores follow D&D 5e point-buy rules
      const validatePointBuy = (stats: Record<string, number>) => {
        const pointsUsed = Object.values(stats).reduce((total, score) => {
          if (score <= 8) return total
          if (score <= 13) return total + (score - 8) // 1 point each for 9-13
          if (score === 14) return total + 7 // 6 points for 9-13, +1 extra for 14
          if (score === 15) return total + 9 // 6 points for 9-13, +2 extra for 14-15
          return total + Math.max(0, score - 8) // Fallback for invalid scores
        }, 0)

        const maxScore = Math.max(...Object.values(stats))
        const minScore = Math.min(...Object.values(stats))

        return {
          isValid: pointsUsed === 27 && maxScore <= 15 && minScore >= 8,
          pointsUsed,
          maxScore,
          minScore
        }
      }

      const validation = validatePointBuy(recommendation.stats)
      
      if (!validation.isValid) {
        console.warn(`AI generated invalid stats: ${validation.pointsUsed} points, max score: ${validation.maxScore}, min score: ${validation.minScore}`)
        
        // Generate fallback valid stats
        const fallbackStats = {
          strength: 13,
          dexterity: 14,
          constitution: 15,
          intelligence: 12,
          wisdom: 10,
          charisma: 8
        }
        
        return NextResponse.json({
          success: true,
          recommendedStats: fallbackStats,
          explanation: `Generated optimized stats for ${characterClass}. (AI fallback applied)`,
        } as AIRecommendStatsResponse)
      }

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
