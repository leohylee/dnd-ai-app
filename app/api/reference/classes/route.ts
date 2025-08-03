import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import type { ReferenceDataResponse } from '@/types/character'

export async function GET() {
  try {
    const classes = await prisma.referenceData.findMany({
      where: { type: 'class' },
      orderBy: { name: 'asc' },
    })

    const transformedClasses = classes.map(characterClass => ({
      id: characterClass.id,
      name: characterClass.name,
      ...(characterClass.data as any),
    }))

    return NextResponse.json({
      success: true,
      data: transformedClasses,
    } as ReferenceDataResponse<any>)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as ReferenceDataResponse<any>,
      { status: 500 }
    )
  }
}
