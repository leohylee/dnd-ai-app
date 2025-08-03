'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { RandomizeButton } from '@/components/character/randomize-button'
import { calculateTotalPointsUsed } from '@/lib/utils/point-buy'
import type { CreateCharacterRequest } from '@/types/character'

interface AbilityScoresStepProps {
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

const abilityDescriptions = {
  strength: 'Physical power and athletic ability',
  dexterity: 'Agility, reflexes, and balance',
  constitution: 'Health, stamina, and vital force',
  intelligence: 'Reasoning, memory, and analytical thinking',
  wisdom: 'Awareness, insight, and intuition',
  charisma: 'Force of personality and leadership',
}

export function AbilityScoresStep({
  characterData,
  onCharacterDataChange,
}: AbilityScoresStepProps) {
  const [scores, setScores] = useState({
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  })

  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false)
  const [pointsUsed, setPointsUsed] = useState(0)
  const maxPoints = 27

  useEffect(() => {
    if (characterData.stats) {
      setScores(characterData.stats)
    }
  }, [characterData.stats])

  useEffect(() => {
    // Use centralized point-buy calculation
    const used = calculateTotalPointsUsed(scores)
    setPointsUsed(used)

    // Update character data only if scores actually changed
    const currentStats = characterData.stats
    const scoresChanged =
      !currentStats ||
      Object.keys(scores).some(
        key =>
          scores[key as keyof typeof scores] !==
          currentStats[key as keyof typeof scores]
      )

    if (scoresChanged) {
      onCharacterDataChange({
        ...characterData,
        stats: scores,
      })
    }
  }, [scores, characterData, onCharacterDataChange])

  const handleScoreChange = (ability: keyof typeof scores, value: number) => {
    const newValue = Math.max(8, Math.min(15, value))
    setScores(prev => ({
      ...prev,
      [ability]: newValue,
    }))
  }

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const getAIRecommendation = async () => {
    if (!characterData.class) {
      alert('Please select a class first')
      return
    }

    setIsGettingRecommendation(true)
    try {
      const response = await fetch('/api/ai/recommend-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: characterData.class,
          race: characterData.race,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.recommendedStats) {
          setScores(result.recommendedStats)
        }
      }
    } catch (error) {
      console.error('Failed to get AI recommendation:', error)
    } finally {
      setIsGettingRecommendation(false)
    }
  }

  const randomizeStats = () => {
    // Generate random valid point-buy stats using correct D&D 5e rules
    const availablePoints = 27
    const newScores = {
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    }

    // Helper function to get the cost to increase a score by 1
    const getCostToIncrease = (currentScore: number): number => {
      if (currentScore <= 12) return 1 // 8-13 cost 1 point each
      if (currentScore === 13) return 2 // 14 costs 2 points (1 extra)
      if (currentScore === 14) return 2 // 15 costs 2 points (1 extra)
      return Infinity // Can't go above 15
    }

    let remainingPoints = availablePoints
    const abilities = Object.keys(newScores) as Array<keyof typeof newScores>

    // Randomly distribute points
    let attempts = 0
    const maxAttempts = 1000 // Prevent infinite loops

    while (remainingPoints > 0 && attempts < maxAttempts) {
      attempts++

      // Find all abilities that can still be increased
      const upgradeableAbilities = abilities.filter(ability => {
        const currentScore = newScores[ability]
        const costToIncrease = getCostToIncrease(currentScore)
        return (
          currentScore <= 15 &&
          remainingPoints >= costToIncrease &&
          costToIncrease !== Infinity
        )
      })

      if (upgradeableAbilities.length === 0) {
        // No more abilities can be upgraded with remaining points
        break
      }

      // Pick a random upgradeable ability
      const randomAbility =
        upgradeableAbilities[
          Math.floor(Math.random() * upgradeableAbilities.length)
        ]

      const currentScore = newScores[randomAbility]
      const costToIncrease = getCostToIncrease(currentScore)

      // Only increase if we won't exceed 15 and have enough points
      if (currentScore < 15 && remainingPoints >= costToIncrease) {
        newScores[randomAbility] = currentScore + 1
        remainingPoints -= costToIncrease
      } else {
        break // Safety check
      }
    }

    setScores(newScores)
  }

  const isValidBuild = pointsUsed <= maxPoints

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assign Ability Scores</h3>
          <p className="text-sm text-muted-foreground">
            Use the point buy system (27 points total)
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RandomizeButton onRandomize={randomizeStats} label="Random Stats" />
          <div className="text-right">
            <div
              className={`text-lg font-semibold ${pointsUsed > maxPoints ? 'text-destructive' : ''}`}
            >
              {pointsUsed} / {maxPoints}
            </div>
            <div className="text-sm text-muted-foreground">Points Used</div>
          </div>
        </div>
      </div>

      {characterData.class && (
        <Card>
          <CardContent className="pt-4">
            <Button
              variant="outline"
              onClick={getAIRecommendation}
              disabled={isGettingRecommendation}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isGettingRecommendation
                ? 'Getting Recommendation...'
                : 'Get AI Recommendation'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(abilityNames).map(([ability, displayName]) => {
          const score = scores[ability as keyof typeof scores]
          const modifier = getModifier(score)

          return (
            <Card key={ability}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  {displayName}
                  <Badge variant="secondary">{formatModifier(modifier)}</Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  {
                    abilityDescriptions[
                      ability as keyof typeof abilityDescriptions
                    ]
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleScoreChange(
                        ability as keyof typeof scores,
                        score - 1
                      )
                    }
                    disabled={score <= 8}
                    className="h-8 w-8"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="8"
                    max="15"
                    value={score}
                    onChange={e =>
                      handleScoreChange(
                        ability as keyof typeof scores,
                        parseInt(e.target.value) || 8
                      )
                    }
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      handleScoreChange(
                        ability as keyof typeof scores,
                        score + 1
                      )
                    }
                    disabled={score >= 15 || pointsUsed >= maxPoints}
                    className="h-8 w-8"
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!isValidBuild && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">
              You've exceeded the maximum points allowed. Please reduce some
              ability scores.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Point Buy Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• All abilities start at 8</p>
          <p>• Scores 9-13 cost 1 point each</p>
          <p>• Scores 14-15 cost 2 points each</p>
          <p>• Maximum base score is 15 (before racial bonuses)</p>
          <p>• Total point budget: 27 points</p>
        </CardContent>
      </Card>
    </div>
  )
}
