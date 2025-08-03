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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, X, Plus } from 'lucide-react'
import type { CreateCharacterRequest } from '@/types/character'

interface PersonalityStepProps {
  characterData: Partial<CreateCharacterRequest>
  onCharacterDataChange: (data: Partial<CreateCharacterRequest>) => void
}

export function PersonalityStep({
  characterData,
  onCharacterDataChange,
}: PersonalityStepProps) {
  const [traits, setTraits] = useState<string[]>([])
  const [newTrait, setNewTrait] = useState('')
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false)
  const [isGeneratingBackstory, setIsGeneratingBackstory] = useState(false)
  const [showAIBackstory, setShowAIBackstory] = useState(false)

  useEffect(() => {
    if (characterData.personalityTraits) {
      setTraits(characterData.personalityTraits)
    }
    // Check if we should show AI backstory mode when component loads
    if (characterData.backstory && characterData.backstory.length > 100) {
      setShowAIBackstory(true)
    }
  }, [characterData.personalityTraits, characterData.backstory])

  useEffect(() => {
    onCharacterDataChange({
      ...characterData,
      personalityTraits: traits,
    })
  }, [traits])

  const addTrait = () => {
    if (newTrait.trim() && !traits.includes(newTrait.trim())) {
      setTraits(prev => [...prev, newTrait.trim()])
      setNewTrait('')
    }
  }

  const removeTrait = (index: number) => {
    setTraits(prev => prev.filter((_, i) => i !== index))
  }

  const getSuggestedTraits = async () => {
    if (
      !characterData.race ||
      !characterData.class ||
      !characterData.background
    ) {
      alert('Please complete race, class, and background selection first')
      return
    }

    setIsGettingSuggestions(true)
    try {
      const response = await fetch('/api/ai/suggest-traits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          race: characterData.race,
          class: characterData.class,
          background: characterData.background,
          alignment: characterData.alignment,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.traits) {
          // Add suggested traits that aren't already present
          const newTraits = result.traits.filter(
            (trait: string) => !traits.includes(trait)
          )
          setTraits(prev => [...prev, ...newTraits])
        }
      }
    } catch (error) {
      console.error('Failed to get trait suggestions:', error)
    } finally {
      setIsGettingSuggestions(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTrait()
    }
  }

  const generateBackstory = async () => {
    if (
      !characterData.race ||
      !characterData.class ||
      !characterData.background
    ) {
      return
    }

    try {
      setIsGeneratingBackstory(true)
      const response = await fetch('/api/ai/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          race: characterData.race,
          class: characterData.class,
          background: characterData.background,
          alignment: characterData.alignment,
          name: characterData.name || 'A character',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.background) {
          onCharacterDataChange({
            ...characterData,
            backstory: result.background,
          })
          setShowAIBackstory(true)
        }
      }
    } catch (error) {
      console.error('Failed to generate backstory:', error)
    } finally {
      setIsGeneratingBackstory(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Character Personality</h3>
        <p className="text-sm text-muted-foreground">
          Define your character's personality traits and enable AI background
          generation
        </p>
      </div>

      {/* AI Backstory Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Backstory Generation
          </CardTitle>
          <CardDescription>
            Let AI create a compelling backstory based on your character choices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Generate a rich, detailed backstory using AI
            </p>

            {characterData.race &&
            characterData.class &&
            characterData.background ? (
              <Button
                variant="outline"
                size="sm"
                onClick={generateBackstory}
                disabled={isGeneratingBackstory}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGeneratingBackstory ? 'Generating...' : 'Generate Backstory'}
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Backstory
              </Button>
            )}
          </div>

          {showAIBackstory && characterData.backstory && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  AI Generated Backstory
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateBackstory}
                    disabled={isGeneratingBackstory}
                    className="h-7 text-xs"
                  >
                    {isGeneratingBackstory ? '...' : 'Regenerate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIBackstory(false)}
                    className="h-7 text-xs"
                  >
                    Edit Manually
                  </Button>
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto rounded border bg-white p-3">
                <p className="text-sm leading-relaxed text-gray-700">
                  {characterData.backstory}
                </p>
              </div>
            </div>
          )}

          {(!characterData.race ||
            !characterData.class ||
            !characterData.background) && (
            <p className="text-xs text-muted-foreground">
              Complete race, class, and background selection to use AI backstory
              generation.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Personality Traits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personality Traits</CardTitle>
          <CardDescription>
            Add traits that define your character's personality and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Get AI Suggestions */}
          {characterData.race &&
            characterData.class &&
            characterData.background && (
              <Button
                variant="outline"
                onClick={getSuggestedTraits}
                disabled={isGettingSuggestions}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGettingSuggestions
                  ? 'Getting Suggestions...'
                  : 'Get AI Trait Suggestions'}
              </Button>
            )}

          {/* Add Custom Trait */}
          <div className="flex space-x-2">
            <Input
              placeholder="Add a personality trait..."
              value={newTrait}
              onChange={e => setNewTrait(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={addTrait} disabled={!newTrait.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Display Traits */}
          {traits.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Current Traits:</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {traits.map((trait, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {trait}
                    <button
                      onClick={() => removeTrait(index)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {traits.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <p>No personality traits added yet.</p>
              <p className="text-sm">
                Use AI suggestions or add your own custom traits.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Backstory Editing */}
      {!showAIBackstory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Backstory (Optional)</CardTitle>
            <CardDescription>
              Write your own backstory or use AI generation above
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Write your character's backstory here..."
              value={characterData.backstory || ''}
              onChange={e =>
                onCharacterDataChange({
                  ...characterData,
                  backstory: e.target.value,
                })
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
