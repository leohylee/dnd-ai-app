'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RandomizeButton } from '@/components/character/randomize-button'
import type { CreateCharacterRequest } from '@/types/character'
import { alignmentOptions } from '@/lib/validations/character'

interface BasicInfoStepProps {
  characterData: Partial<CreateCharacterRequest>
  onCharacterDataChange: (data: Partial<CreateCharacterRequest>) => void
}

export function BasicInfoStep({
  characterData,
  onCharacterDataChange,
}: BasicInfoStepProps) {
  const [isGeneratingName, setIsGeneratingName] = useState(false)

  const handleInputChange = (
    field: keyof CreateCharacterRequest,
    value: string
  ) => {
    onCharacterDataChange({
      ...characterData,
      [field]: value,
    })
  }

  const randomizeName = async () => {
    if (!characterData.race || !characterData.class) {
      // Generate a generic fantasy name if no race/class selected
      const genericNames = [
        'Aiden',
        'Aria',
        'Bran',
        'Cora',
        'Daven',
        'Elara',
        'Finn',
        'Gwen',
        'Harlan',
        'Iris',
        'Joren',
        'Kira',
        'Liam',
        'Maya',
        'Nolan',
        'Ova',
        'Pike',
        'Quinn',
        'Raven',
        'Sage',
        'Tara',
        'Ulric',
        'Vera',
        'Wren',
        'Xara',
        'Yale',
        'Zara',
      ]
      const randomName =
        genericNames[Math.floor(Math.random() * genericNames.length)]
      if (randomName) {
        handleInputChange('name', randomName)
      }
      return
    }

    try {
      setIsGeneratingName(true)
      const response = await fetch('/api/ai/generate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          race: characterData.race,
          class: characterData.class,
          gender: characterData.gender || 'Neutral',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.names && result.names.length > 0) {
          handleInputChange('name', result.names[0])
        }
      }
    } catch (error) {
      console.error('Failed to generate name:', error)
    } finally {
      setIsGeneratingName(false)
    }
  }

  const randomizeAlignment = () => {
    const randomAlignment =
      alignmentOptions[Math.floor(Math.random() * alignmentOptions.length)]
    if (randomAlignment) {
      handleInputChange('alignment', randomAlignment)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">Character Name</Label>
          <RandomizeButton
            onRandomize={randomizeName}
            disabled={isGeneratingName}
            label="Random"
            size="sm"
          />
        </div>
        <Input
          id="name"
          placeholder="Enter your character's name"
          value={characterData.name || ''}
          onChange={e => handleInputChange('name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender (Optional)</Label>
        <Select
          value={characterData.gender || ''}
          onValueChange={value => handleInputChange('gender', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Non-binary">Non-binary</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="alignment">Alignment</Label>
          <RandomizeButton
            onRandomize={randomizeAlignment}
            label="Random"
            size="sm"
          />
        </div>
        <Select
          value={characterData.alignment || ''}
          onValueChange={value => handleInputChange('alignment', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an alignment" />
          </SelectTrigger>
          <SelectContent>
            {alignmentOptions.map(alignment => (
              <SelectItem key={alignment} value={alignment}>
                {alignment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
