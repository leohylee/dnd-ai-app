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

interface CharacterClass {
  id: string
  name: string
  hitDie: number
  primaryAbility: string[]
  savingThrows: string[]
  description?: string
  features?: Record<string, any>
}

interface ClassSelectionStepProps {
  characterData: Partial<CreateCharacterRequest>
  onCharacterDataChange: (data: Partial<CreateCharacterRequest>) => void
}

export function ClassSelectionStep({
  characterData,
  onCharacterDataChange,
}: ClassSelectionStepProps) {
  const [classes, setClasses] = useState<CharacterClass[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(
    null
  )

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/reference/classes')
        if (response.ok) {
          const result = await response.json()
          setClasses(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  useEffect(() => {
    if (characterData.class && classes.length > 0) {
      const characterClass = classes.find(c => c.name === characterData.class)
      setSelectedClass(characterClass || null)
    }
  }, [characterData.class, classes])

  const handleClassSelect = (characterClass: CharacterClass) => {
    setSelectedClass(characterClass)
    onCharacterDataChange({
      ...characterData,
      class: characterClass.name,
    })
  }

  const randomizeClass = () => {
    if (classes.length > 0) {
      const randomClass = classes[Math.floor(Math.random() * classes.length)]
      if (randomClass) {
        handleClassSelect(randomClass)
      }
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Loading classes...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Choose Your Class</h3>
          <RandomizeButton
            onRandomize={randomizeClass}
            disabled={loading || classes.length === 0}
            label="Random Class"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {classes.map(characterClass => (
            <Card
              key={characterClass.id}
              className={`cursor-pointer transition-colors ${
                selectedClass?.id === characterClass.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleClassSelect(characterClass)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {characterClass.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {characterClass.description ||
                    `Hit Die: d${characterClass.hitDie}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">
                      Primary Abilities:
                    </span>
                    <div className="mt-1 flex gap-1">
                      {characterClass.primaryAbility.map(ability => (
                        <Badge
                          key={ability}
                          variant="secondary"
                          className="text-xs"
                        >
                          {ability.charAt(0).toUpperCase() + ability.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Saving Throws:</span>
                    <div className="mt-1 flex gap-1">
                      {characterClass.savingThrows.map(save => (
                        <Badge key={save} variant="outline" className="text-xs">
                          {save.charAt(0).toUpperCase() + save.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedClass && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{selectedClass.name} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium">Class Features</h4>
                <div className="space-y-1 text-sm">
                  <div>Hit Die: d{selectedClass.hitDie}</div>
                  <div>
                    Primary Abilities: {selectedClass.primaryAbility.join(', ')}
                  </div>
                  <div>
                    Saving Throw Proficiencies:{' '}
                    {selectedClass.savingThrows.join(', ')}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-2 font-medium">1st Level Features</h4>
                <div className="space-y-1 text-sm">
                  {selectedClass.features &&
                  Object.keys(selectedClass.features).length > 0 ? (
                    Object.entries(selectedClass.features)
                      .filter(
                        ([_, feature]: [string, any]) => feature.level === 1
                      )
                      .slice(0, 3)
                      .map(([name, _]: [string, any]) => (
                        <div key={name}>• {name}</div>
                      ))
                  ) : (
                    <div className="text-muted-foreground">
                      Features will be determined at character creation
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
