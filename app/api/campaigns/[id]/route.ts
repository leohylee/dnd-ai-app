import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import {
  updateCampaignSchema,
  campaignIdSchema,
} from '@/lib/validations/campaign'
import type {
  GetCampaignResponse,
  UpdateCampaignRequest,
  UpdateCampaignResponse,
  Scene,
} from '@/types/campaign'

// Get a specific campaign by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = campaignIdSchema.safeParse({ id: params.id })
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid campaign ID',
        } as GetCampaignResponse,
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        character: true,
        gameState: true,
        gameEvents: {
          orderBy: { timestamp: 'desc' },
          take: 50, // Get recent events
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign not found',
        } as GetCampaignResponse,
        { status: 404 }
      )
    }

    const responseData = {
      ...campaign,
      currentScene: campaign.currentScene as Scene,
      gameEvents: campaign.gameEvents,
    }

    return NextResponse.json({
      success: true,
      campaign: responseData,
    } as GetCampaignResponse)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as GetCampaignResponse,
      { status: 500 }
    )
  }
}

// Update a campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idValidation = campaignIdSchema.safeParse({ id: params.id })
    if (!idValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid campaign ID',
        } as UpdateCampaignResponse,
        { status: 400 }
      )
    }

    const body: UpdateCampaignRequest = await request.json()
    const validation = updateCampaignSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
        } as UpdateCampaignResponse,
        { status: 400 }
      )
    }

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign not found',
        } as UpdateCampaignResponse,
        { status: 404 }
      )
    }

    // Update the campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        ...validation.data,
        currentScene: validation.data.currentScene as any,
        updatedAt: new Date(),
      },
      include: {
        character: true,
        gameState: true,
        gameEvents: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    })

    const responseData = {
      ...updatedCampaign,
      currentScene: updatedCampaign.currentScene as Scene,
      gameEvents: updatedCampaign.gameEvents,
    }

    return NextResponse.json({
      success: true,
      campaign: responseData,
    } as UpdateCampaignResponse)
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as UpdateCampaignResponse,
      { status: 500 }
    )
  }
}

// Delete a campaign
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = campaignIdSchema.safeParse({ id: params.id })
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid campaign ID',
        },
        { status: 400 }
      )
    }

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campaign not found',
        },
        { status: 404 }
      )
    }

    // Delete the campaign (cascade delete will handle related records)
    await prisma.campaign.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
