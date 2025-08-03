'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Users, MapPin, Loader2, AlertCircle } from 'lucide-react'
import type { Campaign, GetCampaignResponse } from '@/types/campaign'

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params.id as string
  
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
        <Link href="/characters">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Characters
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/characters">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Characters
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-muted-foreground mt-2">{campaign.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                {campaign.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">Session {campaign.sessionCount}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Edit Campaign</Button>
            <Button>Continue Adventure</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Scene */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Scene
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{campaign.currentScene.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Location: {campaign.currentScene.location}
                </p>
                <p className="text-sm leading-relaxed">{campaign.currentScene.description}</p>
              </div>

              {campaign.currentScene.atmosphere && (
                <div>
                  <h4 className="font-medium text-sm">Atmosphere</h4>
                  <p className="text-sm text-muted-foreground">{campaign.currentScene.atmosphere}</p>
                </div>
              )}

              {campaign.currentScene.environment && (
                <div>
                  <h4 className="font-medium text-sm">Environment</h4>
                  <p className="text-sm text-muted-foreground">{campaign.currentScene.environment}</p>
                </div>
              )}

              <Separator />

              {/* NPCs */}
              {campaign.currentScene.npcs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Characters Present</h4>
                  <div className="space-y-2">
                    {campaign.currentScene.npcs.map((npc) => (
                      <div key={npc.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{npc.name}</span>
                            {npc.race && (
                              <Badge variant="outline" className="text-xs">{npc.race}</Badge>
                            )}
                            <Badge 
                              variant={
                                npc.disposition === 'friendly' ? 'default' : 
                                npc.disposition === 'hostile' ? 'destructive' : 'secondary'
                              } 
                              className="text-xs"
                            >
                              {npc.disposition}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{npc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Available Actions */}
              {campaign.currentScene.availableActions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Available Actions</h4>
                  <div className="grid gap-2">
                    {campaign.currentScene.availableActions.map((action) => (
                      <Button 
                        key={action.id} 
                        variant="outline" 
                        className="justify-start text-left h-auto p-3"
                      >
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-sm text-muted-foreground">{action.description}</div>
                        </div>
                      </Button>
                    ))}
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
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">Level {campaign.character.level}</Badge>
                    <Badge variant="outline">{campaign.character.race}</Badge>
                    <Badge variant="outline">{campaign.character.class}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                  {campaign.gameEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="text-sm p-2 rounded border">
                      <div className="font-medium">{event.type}</div>
                      <div className="text-muted-foreground">{event.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
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