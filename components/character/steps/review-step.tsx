'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CreateCharacterRequest } from '@/types/character'

interface ReviewStepProps {
  characterData: Partial<CreateCharacterRequest>
  onCharacterDataChange: (data: Partial<CreateCharacterRequest>) => void
}

const abilityNames = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

export function ReviewStep({ characterData }: ReviewStepProps) {
  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const isComplete =
    characterData.name &&
    characterData.race &&
    characterData.class &&
    characterData.background &&
    characterData.alignment &&
    characterData.stats

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Review Your Character</h3>
        <p className="text-sm text-muted-foreground">
          Review all details before creating your character
        </p>
      </div>

      {!isComplete && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-800">
              Please complete all required sections before creating your
              character.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div>
              <span className="text-sm font-medium">Name:</span>
              <p className="text-sm">{characterData.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Alignment:</span>
              <p className="text-sm">{characterData.alignment || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Gender:</span>
              <p className="text-sm">
                {characterData.gender || 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Race, Class, Background */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Character Build</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <span className="text-sm font-medium">Race:</span>
              <p className="text-sm">{characterData.race || 'Not selected'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Class:</span>
              <p className="text-sm">{characterData.class || 'Not selected'}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Background:</span>
              <p className="text-sm">
                {characterData.background || 'Not selected'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ability Scores */}
      {characterData.stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ability Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Object.entries(abilityNames).map(([ability, displayName]) => {
                const score =
                  characterData.stats![ability as keyof typeof abilityNames]
                const modifier = getModifier(score)

                return (
                  <div key={ability} className="text-center">
                    <div className="text-sm font-medium">{displayName}</div>
                    <div className="text-lg font-bold">{score}</div>
                    <Badge variant="secondary" className="text-xs">
                      {formatModifier(modifier)}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personality & Background */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personality & Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Personality Traits */}
          {characterData.personalityTraits &&
            characterData.personalityTraits.length > 0 && (
              <div>
                <span className="text-sm font-medium">Personality Traits:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {characterData.personalityTraits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Backstory */}
          {characterData.backstory && (
            <div>
              <span className="text-sm font-medium">Backstory:</span>
              <p className="mt-1 rounded bg-muted p-2 text-sm text-muted-foreground">
                {characterData.backstory}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-green-800">
              ✓ Character is ready to be created! Click "Create Character" to
              proceed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
