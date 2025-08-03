'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CreateCharacterRequest } from '@/types/character'

interface CharacterPreviewProps {
  characterData: Partial<CreateCharacterRequest>
}

const abilityNames = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

export function CharacterPreview({ characterData }: CharacterPreviewProps) {
  const [backgroundSkills, setBackgroundSkills] = useState<string[]>([])

  useEffect(() => {
    const fetchBackgroundSkills = async () => {
      if (characterData.background) {
        try {
          const response = await fetch('/api/reference/backgrounds')
          const data = await response.json()

          if (data.success) {
            const selectedBackground = data.data.find(
              (bg: any) => bg.name === characterData.background
            )

            if (selectedBackground?.skillProficiencies) {
              setBackgroundSkills(selectedBackground.skillProficiencies)
            }
          }
        } catch (error) {
          console.error('Error fetching background skills:', error)
        }
      }
    }

    fetchBackgroundSkills()
  }, [characterData.background])

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  // Combine selected skills and background skills, removing duplicates
  const allProficientSkills = [
    ...(characterData.selectedSkills || []),
    ...backgroundSkills,
  ].filter((skill, index, array) => array.indexOf(skill) === index)

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Character Preview</CardTitle>
        <CardDescription>Your character as you build it</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Character Name */}
        <div className="text-center">
          <h3 className="text-xl font-bold">
            {characterData.name || 'Unnamed Character'}
          </h3>
          {characterData.alignment && (
            <p className="text-sm text-muted-foreground">
              {characterData.alignment}
            </p>
          )}
        </div>

        <Separator />

        {/* Gender, Race, Class, Background */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {characterData.gender && (
              <div className="flex justify-between">
                <span className="font-medium">Gender:</span>
                <span>{characterData.gender}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Race:</span>
              <span>{characterData.race || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Class:</span>
              <span>{characterData.class || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Background:</span>
              <span>{characterData.background || '—'}</span>
            </div>
          </div>
        </div>

        {/* Ability Scores */}
        {characterData.stats && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 text-sm font-medium">Ability Scores</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(abilityNames).map(([ability, abbr]) => {
                  const score =
                    characterData.stats![ability as keyof typeof abilityNames]
                  const modifier = getModifier(score)

                  return (
                    <div
                      key={ability}
                      className="rounded bg-muted p-2 text-center"
                    >
                      <div className="text-xs font-medium">{abbr}</div>
                      <div className="text-sm font-bold">{score}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatModifier(modifier)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* Proficient Skills */}
        {allProficientSkills.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 text-sm font-medium">Proficient Skills</h4>
              <div className="space-y-1">
                {allProficientSkills.slice(0, 6).map((skill, index) => {
                  const isFromBackground = backgroundSkills.includes(skill)
                  const isFromClass =
                    characterData.selectedSkills?.includes(skill)

                  return (
                    <Badge
                      key={index}
                      variant={isFromBackground ? 'secondary' : 'outline'}
                      className="w-full justify-between text-xs"
                    >
                      <span>{skill}</span>
                      <span className="text-xs opacity-70">
                        {isFromBackground && isFromClass
                          ? 'Class + BG'
                          : isFromBackground
                            ? 'Background'
                            : 'Class'}
                      </span>
                    </Badge>
                  )
                })}
                {allProficientSkills.length > 6 && (
                  <p className="text-xs text-muted-foreground">
                    +{allProficientSkills.length - 6} more skills
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Personality Traits */}
        {characterData.personalityTraits &&
          characterData.personalityTraits.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="mb-2 text-sm font-medium">Personality Traits</h4>
                <div className="space-y-1">
                  {characterData.personalityTraits
                    .slice(0, 3)
                    .map((trait, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-xs"
                      >
                        {trait}
                      </Badge>
                    ))}
                  {characterData.personalityTraits.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{characterData.personalityTraits.length - 3} more traits
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

        {/* Backstory Preview */}
        {characterData.backstory && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 text-sm font-medium">Backstory</h4>
              <p className="line-clamp-3 text-xs text-muted-foreground">
                {characterData.backstory}
              </p>
            </div>
          </>
        )}

        {/* Creation Status */}
        <Separator />
        <div className="text-center">
          <div className="text-xs text-muted-foreground">
            {(() => {
              const required = [
                'name',
                'race',
                'class',
                'background',
                'alignment',
                'stats',
                'selectedSkills',
              ]
              const completed = required.filter(
                field => characterData[field as keyof CreateCharacterRequest]
              ).length
              return `${completed}/${required.length} sections completed`
            })()}
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-secondary">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{
                width: `${(() => {
                  const required = [
                    'name',
                    'race',
                    'class',
                    'background',
                    'alignment',
                    'stats',
                    'selectedSkills',
                  ]
                  const completed = required.filter(
                    field =>
                      characterData[field as keyof CreateCharacterRequest]
                  ).length
                  return (completed / required.length) * 100
                })()}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
