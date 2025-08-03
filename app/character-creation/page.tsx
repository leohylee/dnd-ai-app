'use client'

import { useState } from 'react'
import { CharacterCreationForm } from '@/components/character/character-creation-form'
import { CharacterPreview } from '@/components/character/character-preview'
import type { CreateCharacterRequest } from '@/types/character'

export default function CharacterCreationPage() {
  const [characterData, setCharacterData] = useState<
    Partial<CreateCharacterRequest>
  >({})

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Create Your Character
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Character Creation Form */}
          <div className="lg:col-span-2">
            <CharacterCreationForm
              characterData={characterData}
              onCharacterDataChange={setCharacterData}
            />
          </div>

          {/* Character Preview */}
          <div className="lg:col-span-1">
            <CharacterPreview characterData={characterData} />
          </div>
        </div>
      </div>
    </div>
  )
}
