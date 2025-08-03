'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Users, Shield, Heart, Zap, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { Character } from '@/types/character'
import type {
  CreateCampaignRequest,
  CreateCampaignResponse,
} from '@/types/campaign'

interface CharactersResponse {
  success: boolean
  characters: Character[]
  error?: string
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [campaignDescription, setCampaignDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [charactersLoading, setCharactersLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch characters on component mount
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setCharactersLoading(true)
        const response = await fetch('/api/characters')
        const data: CharactersResponse = await response.json()

        if (data.success) {
          setCharacters(data.characters)
        } else {
          setError(data.error || 'Failed to fetch characters')
        }
      } catch (err) {
        console.error('Error fetching characters:', err)
        setError('Failed to load characters')
      } finally {
        setCharactersLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  const selectedCharacter = characters.find(
    char => char.id === selectedCharacterId
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCharacterId) {
      toast({
        title: 'Character Required',
        description: 'Please select a character for this campaign.',
        variant: 'destructive',
      })
      return
    }

    if (!campaignName.trim()) {
      toast({
        title: 'Campaign Name Required',
        description: 'Please enter a name for your campaign.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const request: CreateCampaignRequest = {
        name: campaignName.trim(),
        description: campaignDescription.trim() || undefined,
        characterId: selectedCharacterId,
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const result: CreateCampaignResponse = await response.json()

      if (result.success && result.campaign) {
        toast({
          title: 'Campaign Created!',
          description: `Your campaign "${campaignName}" has been created successfully.`,
        })

        // Redirect to the campaign page
        router.push(`/campaign/${result.campaign.id}`)
      } else {
        throw new Error(result.error || 'Failed to create campaign')
      }
    } catch (err) {
      console.error('Error creating campaign:', err)
      toast({
        title: 'Creation Failed',
        description:
          err instanceof Error
            ? err.message
            : 'Failed to create campaign. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  if (charactersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading characters...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/characters">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Characters
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create New Campaign</h1>
        <p className="mt-2 text-muted-foreground">
          Start a new adventure with one of your characters
        </p>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Characters Found</h3>
            <p className="mb-4 text-muted-foreground">
              You need to create a character before starting a campaign.
            </p>
            <Link href="/character-creation">
              <Button>Create Your First Character</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Campaign Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter campaign name"
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your campaign..."
                      value={campaignDescription}
                      onChange={e => setCampaignDescription(e.target.value)}
                      maxLength={500}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {campaignDescription.length}/500 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="character">Select Character *</Label>
                    <Select
                      value={selectedCharacterId}
                      onValueChange={setSelectedCharacterId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a character" />
                      </SelectTrigger>
                      <SelectContent>
                        {characters.map(character => (
                          <SelectItem key={character.id} value={character.id}>
                            {character.name} - Level {character.level}{' '}
                            {character.race.name} {character.class.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Campaign...
                      </>
                    ) : (
                      'Create Campaign'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Character Preview */}
          <div className="space-y-6">
            {selectedCharacter ? (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Character</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {selectedCharacter.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        Level {selectedCharacter.level}
                      </Badge>
                      <Badge variant="outline">
                        {selectedCharacter.race.name}
                      </Badge>
                      <Badge variant="outline">
                        {selectedCharacter.class.name}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedCharacter.gender && (
                      <div className="flex justify-between">
                        <span className="font-medium">Gender:</span>
                        <span className="text-muted-foreground">
                          {selectedCharacter.gender}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Background:</span>
                      <span className="text-muted-foreground">
                        {selectedCharacter.background}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-between">
                      <span className="font-medium">Alignment:</span>
                      <span className="text-muted-foreground">
                        {selectedCharacter.alignment}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Core Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium">HP</span>
                      </div>
                      <div className="text-lg font-bold">
                        {selectedCharacter.hp.current}/
                        {selectedCharacter.hp.max}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Shield className="h-3 w-3 text-blue-500" />
                        <span className="text-xs font-medium">AC</span>
                      </div>
                      <div className="text-lg font-bold">
                        {selectedCharacter.ac}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium">Prof</span>
                      </div>
                      <div className="text-lg font-bold">
                        +{selectedCharacter.proficiencyBonus}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Ability Scores */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {Object.entries(selectedCharacter.stats).map(
                      ([ability, score]) => {
                        const modifier = getAbilityModifier(score as number)
                        return (
                          <div key={ability} className="text-center">
                            <div className="font-medium capitalize text-muted-foreground">
                              {ability.substring(0, 3)}
                            </div>
                            <div className="font-bold">{score}</div>
                            <div className="text-muted-foreground">
                              {formatModifier(modifier)}
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Select a character to see their details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
