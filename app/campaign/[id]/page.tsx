'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Users,
  MapPin,
  Loader2,
  AlertCircle,
  Play,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { 
  Campaign, 
  GetCampaignResponse
} from '@/types/campaign'

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params.id as string
  const { toast } = useToast()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}`)
        const data: GetCampaignResponse = await response.json()

        if (data.success && data.campaign) {
          setCampaign(data.campaign)
        } else {
          setError(data.error || 'Campaign not found')
        }
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href="/campaigns">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/campaigns">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            {campaign.description && (
              <p className="mt-2 text-muted-foreground">
                {campaign.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                {campaign.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">Session {campaign.sessionCount}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Edit Campaign</Button>
            <Button variant="outline">Export Campaign</Button>
            <Link href={`/campaign/${campaignId}/play`}>
              <Button size="lg">
                <Play className="mr-2 h-4 w-4" />
                Continue Adventure
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Current Scene */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Scene
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {campaign.currentScene.title}
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  Location: {campaign.currentScene.location}
                </p>
                <p className="text-sm leading-relaxed">
                  {campaign.currentScene.description}
                </p>
              </div>

              {campaign.currentScene.atmosphere && (
                <div>
                  <h4 className="text-sm font-medium">Atmosphere</h4>
                  <p className="text-sm text-muted-foreground">
                    {campaign.currentScene.atmosphere}
                  </p>
                </div>
              )}

              {campaign.currentScene.environment && (
                <div>
                  <h4 className="text-sm font-medium">Environment</h4>
                  <p className="text-sm text-muted-foreground">
                    {campaign.currentScene.environment}
                  </p>
                </div>
              )}

              <Separator />

              {/* NPCs */}
              {campaign.currentScene.npcs.length > 0 && (
                <div>
                  <h4 className="mb-3 font-medium">Characters Present</h4>
                  <div className="space-y-2">
                    {campaign.currentScene.npcs.map(npc => (
                      <div
                        key={npc.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{npc.name}</span>
                            {npc.race && (
                              <Badge variant="outline" className="text-xs">
                                {npc.race}
                              </Badge>
                            )}
                            <Badge
                              variant={
                                npc.disposition === 'friendly'
                                  ? 'default'
                                  : npc.disposition === 'hostile'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                              className="text-xs"
                            >
                              {npc.disposition}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {npc.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Available Actions Preview (Read-only) */}
              {campaign.currentScene.availableActions.length > 0 && (
                <div>
                  <h4 className="mb-3 font-medium">Available Actions</h4>
                  <div className="grid gap-2">
                    {campaign.currentScene.availableActions.map(action => (
                      <div
                        key={action.id}
                        className="h-auto justify-start p-3 text-left rounded-md border bg-muted/30"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-muted-foreground">
                            {action.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    💡 Use "Continue Adventure" to start playing and select actions
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Character & Campaign Info */}
        <div className="space-y-6">
          {/* Character */}
          {campaign.character && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Character
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">{campaign.character.name}</h3>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="secondary">
                      Level {campaign.character.level}
                    </Badge>
                    <Badge variant="outline">{campaign.character.race}</Badge>
                    <Badge variant="outline">{campaign.character.class}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign Management */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Sessions:</span>
                  <span>{campaign.sessionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Status:</span>
                  <span>{campaign.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Created:</span>
                  <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Last Updated:</span>
                  <span>{new Date(campaign.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Actions</h4>
                <div className="grid gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    Edit Campaign Details
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Export Adventure Log
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    Campaign Settings
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" disabled>
                    Delete Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          {campaign.gameEvents && campaign.gameEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {campaign.gameEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="rounded border p-2 text-sm">
                      <div className="font-medium">{event.type}</div>
                      <div className="text-muted-foreground">
                        {event.description}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
