import { NextRequest, NextResponse } from 'next/server'
import { dmService } from '@/lib/ai/dm-service'
import type { DMActionRequest, DMResponse } from '@/lib/ai/dm-service'
import { z } from 'zod'

const gameActionSchema = z.object({
  campaignId: z.string().cuid('Invalid campaign ID'),
  actionId: z.string().optional(),
  customAction: z.string().optional(),
  playerInput: z
    .string()
    .min(1, 'Player input is required')
    .max(500, 'Input too long'),
})

const startSessionSchema = z.object({
  campaignId: z.string().cuid('Invalid campaign ID'),
  action: z.literal('start_session'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle start session action
    if (body.action === 'start_session') {
      const validation = startSessionSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
            narrative: '',
            choices: [],
          } as DMResponse,
          { status: 400 }
        )
      }

      const response = await dmService.startNewSession(
        validation.data.campaignId
      )
      return NextResponse.json(response)
    }

    // Handle regular game actions
    const validation = gameActionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
          narrative: '',
          choices: [],
        } as DMResponse,
        { status: 400 }
      )
    }

    const actionRequest: DMActionRequest = validation.data
    const response = await dmService.processPlayerAction(actionRequest)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in game-actions endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        narrative:
          'Something went wrong with the game engine. Please try again.',
        choices: [],
      } as DMResponse,
      { status: 500 }
    )
  }
}
