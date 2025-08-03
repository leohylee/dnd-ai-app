import { NextRequest, NextResponse } from 'next/server'
import { openaiService } from '@/lib/ai/openai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { race, gender } = body

    if (!race) {
      return NextResponse.json(
        { success: false, error: 'Race is required' },
        { status: 400 }
      )
    }

    const names = await openaiService.suggestCharacterNames(
      race,
      undefined, // background not needed for names
      gender
    )

    return NextResponse.json({
      success: true,
      names,
    })
  } catch (error) {
    console.error('Error generating character names:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate character names' },
      { status: 500 }
    )
  }
}
