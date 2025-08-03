'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type {
  CreateCharacterRequest,
  SkillReference,
  AIRecommendSkillsResponse,
} from '@/types/character'

interface SkillsStepProps {
  characterData: Partial<CreateCharacterRequest>
  onCharacterDataChange: (data: Partial<CreateCharacterRequest>) => void
}

export function SkillsStep({
  characterData,
  onCharacterDataChange,
}: SkillsStepProps) {
  const [allSkills, setAllSkills] = useState<SkillReference[]>([])
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [maxSkills, setMaxSkills] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] =
    useState(false)

  const selectedSkills = characterData.selectedSkills || []
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all skills
        const skillsResponse = await fetch('/api/reference/skills')
        const skillsData = await skillsResponse.json()

        if (!skillsData.success) {
          throw new Error('Failed to fetch skills')
        }

        setAllSkills(skillsData.data)

        // Fetch class data to get skill options and choices
        if (characterData.class) {
          const classResponse = await fetch('/api/reference/classes')
          const classData = await classResponse.json()

          if (classData.success) {
            const selectedClass = classData.data.find(
              (cls: any) => cls.name === characterData.class
            )

            if (selectedClass) {
              // Handle special case where class can choose "All" skills (e.g., Bard)
              let skillOptions = selectedClass.skillOptions || []
              if (skillOptions.includes('All')) {
                // Replace "All" with all available skills using fresh data
                skillOptions = skillsData.data.map((skill: any) => skill.name)
              }
              setAvailableSkills(skillOptions)
              setMaxSkills(selectedClass.skillChoices || 2)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load skills data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [characterData.class])

  const handleSkillToggle = (skillName: string) => {
    const isSelected = selectedSkills.includes(skillName)
    let newSkills: string[]

    if (isSelected) {
      // Remove skill
      newSkills = selectedSkills.filter(skill => skill !== skillName)
    } else {
      // Add skill if under limit
      if (selectedSkills.length < maxSkills) {
        newSkills = [...selectedSkills, skillName]
      } else {
        return // Don't add if at limit
      }
    }

    onCharacterDataChange({
      ...characterData,
      selectedSkills: newSkills,
    })
  }

  const generateAIRecommendations = async () => {
    if (
      !characterData.race ||
      !characterData.class ||
      !characterData.background
    ) {
      toast({
        title: 'Missing Information',
        description:
          'Please complete race, class, and background selection first.',
        variant: 'destructive',
      })
      return
    }

    setIsGeneratingRecommendations(true)
    try {
      const response = await fetch('/api/ai/recommend-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          race: characterData.race,
          class: characterData.class,
          background: characterData.background,
          alignment: characterData.alignment,
          availableSkills,
          maxSkills,
          backstory: characterData.backstory,
        }),
      })

      const data: AIRecommendSkillsResponse = await response.json()

      if (data.success && data.recommendedSkills) {
        onCharacterDataChange({
          ...characterData,
          selectedSkills: data.recommendedSkills,
        })

        toast({
          title: 'AI Recommendations Applied',
          description: `Selected ${data.recommendedSkills.length} recommended skills: ${data.recommendedSkills.join(', ')}`,
          variant: 'success',
        })
      } else {
        throw new Error(data.error || 'Failed to generate recommendations')
      }
    } catch (error) {
      console.error('Error generating skill recommendations:', error)
      toast({
        title: 'Recommendation Failed',
        description:
          'Unable to generate AI skill recommendations. Please select manually.',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const getSkillAbility = (skillName: string) => {
    const skill = allSkills.find(s => s.name === skillName)
    return skill?.ability || 'unknown'
  }

  const getAbilityModifier = (ability: string) => {
    if (!characterData.stats) return 0
    const score = (characterData.stats as any)[ability] || 10
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading skills...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill Proficiencies</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select {maxSkills} skills from your class options to gain
            proficiency.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Counter and AI Button */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Skills Selected: {selectedSkills.length} / {maxSkills}
            </span>
            <div className="flex items-center space-x-2">
              {selectedSkills.length === maxSkills && (
                <Badge variant="secondary">Limit Reached</Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={generateAIRecommendations}
                disabled={isGeneratingRecommendations || !characterData.class}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {isGeneratingRecommendations ? 'Generating...' : 'AI Recommend'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Available Skills */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Available Skills</h4>
            <div className="grid gap-3">
              {availableSkills.map(skillName => {
                const isSelected = selectedSkills.includes(skillName)
                const ability = getSkillAbility(skillName)
                const modifier = getAbilityModifier(ability)
                const proficiencyBonus = 2 // Level 1 proficiency bonus
                const totalModifier =
                  modifier + (isSelected ? proficiencyBonus : 0)

                return (
                  <div
                    key={skillName}
                    className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <Checkbox
                      id={skillName}
                      checked={isSelected}
                      onCheckedChange={() => handleSkillToggle(skillName)}
                      disabled={
                        !isSelected && selectedSkills.length >= maxSkills
                      }
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={skillName}
                          className="cursor-pointer text-sm font-medium"
                        >
                          {skillName}
                        </label>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {ability.substring(0, 3).toUpperCase()}
                          </Badge>
                          <span className="font-mono text-sm">
                            {formatModifier(totalModifier)}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <p className="text-xs text-muted-foreground">
                          Base: {formatModifier(modifier)} + Proficiency: +
                          {proficiencyBonus}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Skills Summary */}
          {selectedSkills.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Selected Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(skillName => {
                    const ability = getSkillAbility(skillName)
                    const modifier = getAbilityModifier(ability)
                    const totalModifier = modifier + 2 // Proficiency bonus

                    return (
                      <Badge
                        key={skillName}
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{skillName}</span>
                        <span className="text-xs">
                          ({formatModifier(totalModifier)})
                        </span>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Warning if no skills selected */}
          {selectedSkills.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You haven't selected any skills yet. Choose {maxSkills} skills
                to gain proficiency.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
