import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import type { ReferenceDataResponse } from '@/types/character'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const backgrounds = await prisma.referenceData.findMany({
      where: { type: 'background' },
      orderBy: { name: 'asc' },
    })

    const transformedBackgrounds = backgrounds.map(background => ({
      id: background.id,
      name: background.name,
      ...(background.data as any),
    }))

    return NextResponse.json({
      success: true,
      data: transformedBackgrounds,
    } as ReferenceDataResponse<any>)
  } catch (error) {
    console.error('Error fetching backgrounds:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as ReferenceDataResponse<any>,
      { status: 500 }
    )
  }
}
