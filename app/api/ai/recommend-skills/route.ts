import { NextRequest } from 'next/server'
import { z } from 'zod'
import { openaiService } from '@/lib/ai/openai-service'
import { createSuccessResponse, createValidationErrorResponse, handleApiError } from '@/lib/api/response-utils'

const recommendSkillsSchema = z.object({
  race: z.string().min(1, 'Race is required'),
  class: z.string().min(1, 'Class is required'),
  background: z.string().min(1, 'Background is required'),
  alignment: z.string().optional(),
  availableSkills: z.array(z.string()),
  maxSkills: z.number().min(1).max(10),
  backstory: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validation = recommendSkillsSchema.safeParse(body)
    if (!validation.success) {
      return createValidationErrorResponse(validation.error)
    }

    const {
      race,
      class: characterClass,
      background,
      alignment,
      availableSkills,
      maxSkills,
      backstory,
    } = validation.data

    // Use centralized OpenAI service
    const { recommendedSkills, reasoning } = await openaiService.recommendSkills(
      race,
      characterClass,
      background,
      availableSkills,
      maxSkills,
      alignment,
      backstory
    )

    return createSuccessResponse({
      recommendedSkills,
      reasoning,
      maxSkills,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
