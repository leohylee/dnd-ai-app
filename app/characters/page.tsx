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
  Heart,
  Shield,
  Zap,
  Users,
  Search,
  Plus,
  AlertCircle,
  Calendar,
  User,
} from 'lucide-react'
import type { Character } from '@/types/character'

interface CharactersResponse {
  success: boolean
  characters: Character[]
  total: number
  error?: string
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true)
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
        setLoading(false)
      }
    }

    fetchCharacters()
  }, [])

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.race.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.class.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading characters...</p>
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
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Characters</h1>
          <p className="text-muted-foreground">
            Manage and view your D&D characters
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/campaign/create">
            <Button size="lg" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
          <Link href="/character-creation">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Character
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search characters by name, race, or class..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Characters Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>
          {filteredCharacters.length} of {characters.length} character
          {characters.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            {searchTerm ? (
              <>
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No characters found</h3>
                <p className="text-muted-foreground mb-4">
                  No characters match your search criteria.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No characters yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first D&D character to get started!
                </p>
                <Link href="/character/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Character
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map(character => (
            <Card key={character.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{character.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        Level {character.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {character.race.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {character.class.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {character.gender && (
                    <div className="flex justify-between">
                      <span className="font-medium">Gender:</span>
                      <span className="text-muted-foreground">{character.gender}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Background:</span>
                    <span className="text-muted-foreground">{character.background}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="font-medium">Alignment:</span>
                    <span className="text-muted-foreground">{character.alignment}</span>
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
                    <div className="text-lg font-bold">{character.hp.current}/{character.hp.max}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3 text-blue-500" />
                      <span className="text-xs font-medium">AC</span>
                    </div>
                    <div className="text-lg font-bold">{character.ac}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium">Prof</span>
                    </div>
                    <div className="text-lg font-bold">+{character.proficiencyBonus}</div>
                  </div>
                </div>

                <Separator />

                {/* Ability Scores */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.entries(character.stats).map(([ability, score]) => {
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
                  })}
                </div>

                <Separator />

                {/* Skills Preview */}
                {character.skills && character.skills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Proficient Skills ({character.skills.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {character.skills.slice(0, 3).map((skill: any) => (
                        <Badge key={skill.name} variant="outline" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                      {character.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{character.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDate(character.createdAt)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}