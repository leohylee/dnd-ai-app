'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Search,
  Plus,
  AlertCircle,
  Calendar,
  Users,
  MapPin,
  Settings,
  Sword,
} from 'lucide-react'
import type { Campaign, GetCampaignsResponse } from '@/types/campaign'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/campaigns')
        const data: GetCampaignsResponse = await response.json()

        if (data.success) {
          setCampaigns(data.campaigns || [])
        } else {
          setError(data.error || 'Failed to fetch campaigns')
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err)
        setError('Failed to load campaigns')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter(
    campaign =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.character?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      campaign.currentScene.location
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  const activeCampaigns = filteredCampaigns.filter(c => c.isActive)
  const inactiveCampaigns = filteredCampaigns.filter(c => !c.isActive)


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your D&D adventures and continue your stories
          </p>
        </div>
        <Link href="/campaign/create">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Create New Campaign
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder="Search campaigns by name, character, or location..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Campaigns Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sword className="h-4 w-4" />
        <span>
          {filteredCampaigns.length} of {campaigns.length} campaign
          {campaigns.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* No Campaigns */}
      {campaigns.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Sword className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No campaigns yet</h3>
            <p className="mb-4 text-muted-foreground">
              Create your first D&D campaign to begin your adventure!
            </p>
            <Link href="/campaign/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredCampaigns.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No campaigns found</h3>
            <p className="mb-4 text-muted-foreground">
              No campaigns match your search criteria.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Campaigns */}
          {activeCampaigns.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Play className="h-5 w-5" />
                Active Adventures ({activeCampaigns.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Campaigns */}
          {inactiveCampaigns.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Settings className="h-5 w-5" />
                Completed Adventures ({inactiveCampaigns.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inactiveCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle className="line-clamp-1 text-lg">
              {campaign.name}
            </CardTitle>
            {campaign.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {campaign.description}
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={campaign.isActive ? 'default' : 'secondary'}
                className="text-xs"
              >
                {campaign.isActive ? 'Active' : 'Complete'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Session {campaign.sessionCount}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Character Info */}
        {campaign.character && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{campaign.character.name}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Level {campaign.character.level} {campaign.character.race}{' '}
              {campaign.character.class}
            </span>
          </div>
        )}

        {/* Current Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Currently at:</span>
          <span className="font-medium">{campaign.currentScene.location}</span>
        </div>

        <Separator />

        {/* Current Scene Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">{campaign.currentScene.title}</h4>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {campaign.currentScene.description}
          </p>
        </div>

        <Separator />

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>Last played {getTimeAgo(campaign.updatedAt.toString())}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link
            href={
              campaign.isActive
                ? `/campaign/${campaign.id}/play`
                : `/campaign/${campaign.id}`
            }
            className="flex-1"
          >
            <Button
              variant={campaign.isActive ? 'default' : 'outline'}
              size="sm"
              className="w-full"
            >
              {campaign.isActive ? (
                <>
                  <Play className="mr-2 h-3 w-3" />
                  Continue
                </>
              ) : (
                'View Details'
              )}
            </Button>
          </Link>
          <Link href={`/campaign/${campaign.id}`}>
            <Button variant="outline" size="sm">
              <Settings className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
