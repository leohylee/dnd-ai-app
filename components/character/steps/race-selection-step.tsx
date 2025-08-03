'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RandomizeButton } from '@/components/character/randomize-button'
import type { CreateCharacterRequest } from '@/types/character'

interface Race {
  id: string
  name: string
  traits: string[]
  abilityScoreIncrease: Record<string, number>
  size: string
  speed: number
  description?: string
}

interface RaceSelectionStepProps {
  characterData: Partial<CreateCharacterRequest>
  onCharacterDataChange: (data: Partial<CreateCharacterRequest>) => void
}

export function RaceSelectionStep({
  characterData,
  onCharacterDataChange,
}: RaceSelectionStepProps) {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await fetch('/api/reference/races')
        if (response.ok) {
          const result = await response.json()
          setRaces(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch races:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRaces()
  }, [])

  useEffect(() => {
    if (characterData.race && races.length > 0) {
      const race = races.find(r => r.name === characterData.race)
      setSelectedRace(race || null)
    }
  }, [characterData.race, races])

  const handleRaceSelect = (race: Race) => {
    setSelectedRace(race)
    onCharacterDataChange({
      ...characterData,
      race: race.name,
    })
  }

  const randomizeRace = () => {
    if (races.length > 0) {
      const randomRace = races[Math.floor(Math.random() * races.length)]
      if (randomRace) {
        handleRaceSelect(randomRace)
      }
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Loading races...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Choose Your Race</h3>
          <RandomizeButton
            onRandomize={randomizeRace}
            disabled={loading || races.length === 0}
            label="Random Race"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {races.map(race => (
            <Card
              key={race.id}
              className={`cursor-pointer transition-colors ${
                selectedRace?.id === race.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleRaceSelect(race)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{race.name}</CardTitle>
                <CardDescription className="text-sm">
                  {race.description ||
                    `A ${race.size.toLowerCase()} race with ${race.speed}ft speed`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">
                      Ability Bonuses:
                    </span>
                    <div className="mt-1 flex gap-1">
                      {Object.entries(race.abilityScoreIncrease).map(
                        ([ability, bonus]) => (
                          <Badge
                            key={ability}
                            variant="secondary"
                            className="text-xs"
                          >
                            {ability.slice(0, 3).toUpperCase()} +{bonus}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  {race.traits.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Traits:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {race.traits.slice(0, 2).map((trait, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {trait}
                          </Badge>
                        ))}
                        {race.traits.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{race.traits.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedRace && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{selectedRace.name} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium">Ability Score Increases</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(selectedRace.abilityScoreIncrease).map(
                    ([ability, bonus]) => (
                      <li key={ability}>
                        {ability.charAt(0).toUpperCase() + ability.slice(1)}: +
                        {bonus}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Racial Traits</h4>
                <ul className="space-y-1 text-sm">
                  {selectedRace.traits.map((trait, index) => (
                    <li key={index}>• {trait}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Size:</span> {selectedRace.size}
              </div>
              <div>
                <span className="font-medium">Speed:</span> {selectedRace.speed}{' '}
                feet
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
