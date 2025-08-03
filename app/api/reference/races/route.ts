import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import type { ReferenceDataResponse } from '@/types/character'



export async function GET() {
  try {
    const races = await prisma.referenceData.findMany({
      where: { type: 'race' },
      orderBy: { name: 'asc' },
    })

    const transformedRaces = races.map(race => ({
      id: race.id,
      name: race.name,
      ...(race.data as any),
    }))

    return NextResponse.json({
      success: true,
      data: transformedRaces,
    } as ReferenceDataResponse<any>)
  } catch (error) {
    console.error('Error fetching races:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as ReferenceDataResponse<any>,
      { status: 500 }
    )
  }
}
