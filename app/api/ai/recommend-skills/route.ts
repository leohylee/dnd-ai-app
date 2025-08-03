import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
import { z } from 'zod'

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
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
        },
        { status: 400 }
      )
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

    // Create the prompt for OpenAI
    const prompt = `You are a D&D 5e character creation expert. Based on the character details below, recommend exactly ${maxSkills} skills from the available options that would best fit this character.

Character Details:
- Race: ${race}
- Class: ${characterClass}
- Background: ${background}
- Alignment: ${alignment || 'Not specified'}
${backstory ? `- Backstory: ${backstory}` : ''}

Available Skills to Choose From:
${availableSkills.map(skill => `- ${skill}`).join('\n')}

Please recommend exactly ${maxSkills} skills that would be most thematically appropriate and mechanically useful for this character. Consider:
1. The character's class and its typical role in combat and exploration
2. The character's background and what skills would support their story
3. The character's race and any natural inclinations
4. How the skills complement each other for a well-rounded character

Format your response as:

RECOMMENDED SKILLS:
[List exactly ${maxSkills} skills from the available options]

REASONING:
[Brief explanation for why these skills fit the character]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful D&D 5e expert assistant that provides skill recommendations for character creation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse the response to extract skills and reasoning
    const skillsMatch = response.match(
      /RECOMMENDED SKILLS:\s*([\s\S]*?)(?:\n\nREASONING:|$)/i
    )
    const reasoningMatch = response.match(/REASONING:\s*([\s\S]*?)$/i)

    let recommendedSkills: string[] = []
    if (skillsMatch && skillsMatch[1]) {
      // Extract skills from the response, handling various formats
      recommendedSkills = skillsMatch[1]
        .split('\n')
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(skill => skill && availableSkills.includes(skill))
        .slice(0, maxSkills)
    }

    const reasoning =
      reasoningMatch && reasoningMatch[1]
        ? reasoningMatch[1].trim()
        : 'Skills recommended based on character class, background, and race synergy.'

    return NextResponse.json({
      success: true,
      recommendedSkills,
      reasoning,
      maxSkills,
    })
  } catch (error: any) {
    console.error('Error generating skill recommendations:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate skill recommendations',
      },
      { status: 500 }
    )
  }
}
