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

interface Background {
  id: string
  name: string
  description?: string
  skillProficiencies?: string[]
  languageProficiencies?: string[]
  equipmentProficiencies?: string[]
  feature?: {
    name: string
    description: string
  }
}

interface BackgroundStepProps {
  characterData: Partial<CreateCharacterRequest>
  onCharacterDataChange: (data: Partial<CreateCharacterRequest>) => void
}

export function BackgroundStep({
  characterData,
  onCharacterDataChange,
}: BackgroundStepProps) {
  const [backgrounds, setBackgrounds] = useState<Background[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBackground, setSelectedBackground] =
    useState<Background | null>(null)

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const response = await fetch('/api/reference/backgrounds')
        if (response.ok) {
          const result = await response.json()
          setBackgrounds(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch backgrounds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBackgrounds()
  }, [])

  useEffect(() => {
    if (characterData.background && backgrounds.length > 0) {
      const background = backgrounds.find(
        b => b.name === characterData.background
      )
      setSelectedBackground(background || null)
    }
  }, [characterData.background, backgrounds])

  const handleBackgroundSelect = (background: Background) => {
    setSelectedBackground(background)
    onCharacterDataChange({
      ...characterData,
      background: background.name,
    })
  }

  const randomizeBackground = () => {
    if (backgrounds.length > 0) {
      const randomBackground =
        backgrounds[Math.floor(Math.random() * backgrounds.length)]
      if (randomBackground) {
        handleBackgroundSelect(randomBackground)
      }
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Loading backgrounds...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Choose Your Background</h3>
          <RandomizeButton
            onRandomize={randomizeBackground}
            disabled={loading || backgrounds.length === 0}
            label="Random Background"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {backgrounds.map(background => (
            <Card
              key={background.id}
              className={`cursor-pointer transition-colors ${
                selectedBackground?.id === background.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleBackgroundSelect(background)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{background.name}</CardTitle>
                <CardDescription className="text-sm">
                  {background.description || 'A character background'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {background.skillProficiencies &&
                    background.skillProficiencies.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">
                          Skill Proficiencies:
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {background.skillProficiencies.map(skill => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  {background.feature && (
                    <div>
                      <span className="text-sm font-medium">Feature:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {background.feature.name}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedBackground && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{selectedBackground.name} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedBackground.description && (
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedBackground.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectedBackground.skillProficiencies &&
                  selectedBackground.skillProficiencies.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Skill Proficiencies</h4>
                      <ul className="space-y-1 text-sm">
                        {selectedBackground.skillProficiencies.map(skill => (
                          <li key={skill}>• {skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedBackground.languageProficiencies &&
                  selectedBackground.languageProficiencies.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Languages</h4>
                      <ul className="space-y-1 text-sm">
                        {selectedBackground.languageProficiencies.map(
                          language => (
                            <li key={language}>• {language}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>

              {selectedBackground.feature && (
                <div>
                  <h4 className="mb-2 font-medium">Background Feature</h4>
                  <div className="rounded-md bg-muted p-3">
                    <h5 className="text-sm font-medium">
                      {selectedBackground.feature.name}
                    </h5>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedBackground.feature.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
