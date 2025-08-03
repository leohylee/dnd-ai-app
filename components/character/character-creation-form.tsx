'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { BasicInfoStep } from './steps/basic-info-step'
import { RaceSelectionStep } from './steps/race-selection-step'
import { ClassSelectionStep } from './steps/class-selection-step'
import { AbilityScoresStep } from './steps/ability-scores-step'
import { BackgroundStep } from './steps/background-step'
import { SkillsStep } from './steps/skills-step'
import { PersonalityStep } from './steps/personality-step'
import { ReviewStep } from './steps/review-step'
import type { CreateCharacterRequest } from '@/types/character'

interface CharacterCreationFormProps {
  characterData: Partial<CreateCharacterRequest>
  onCharacterDataChange: (data: Partial<CreateCharacterRequest>) => void
}

const steps = [
  { id: 'basic', title: 'Basic Info', component: BasicInfoStep },
  { id: 'race', title: 'Race', component: RaceSelectionStep },
  { id: 'class', title: 'Class', component: ClassSelectionStep },
  { id: 'abilities', title: 'Ability Scores', component: AbilityScoresStep },
  { id: 'background', title: 'Background', component: BackgroundStep },
  { id: 'skills', title: 'Skills', component: SkillsStep },
  { id: 'personality', title: 'Personality', component: PersonalityStep },
  { id: 'review', title: 'Review', component: ReviewStep },
]

export function CharacterCreationForm({
  characterData,
  onCharacterDataChange,
}: CharacterCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const currentStepComponent = steps[currentStep]
  const StepComponent = currentStepComponent?.component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      })

      if (response.ok) {
        await response.json()

        // Show success toast
        toast({
          title: 'Character created successfully!',
          description: `${characterData.name} has been added to your characters.`,
          variant: 'success',
        })

        // Redirect to home page after a brief delay
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        const errorData = await response.json()
        toast({
          title: 'Failed to create character',
          description:
            errorData.message ||
            'An error occurred while creating your character.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating character:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{currentStepComponent?.title}</span>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </CardTitle>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-secondary">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Step Component */}
        {StepComponent && (
          <StepComponent
            characterData={characterData}
            onCharacterDataChange={onCharacterDataChange}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating Character...' : 'Create Character'}
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
