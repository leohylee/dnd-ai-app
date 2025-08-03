'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dice6 } from 'lucide-react'

interface RandomizeButtonProps {
  onRandomize: () => Promise<void> | void
  disabled?: boolean
  size?: 'default' | 'sm' | 'lg' | 'icon'
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  className?: string
  label?: string
}

export function RandomizeButton({
  onRandomize,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  className = '',
  label = 'Randomize',
}: RandomizeButtonProps) {
  const [isRandomizing, setIsRandomizing] = useState(false)

  const handleRandomize = async () => {
    setIsRandomizing(true)
    try {
      await onRandomize()
    } catch (error) {
      console.error('Randomization error:', error)
    } finally {
      setIsRandomizing(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRandomize}
      disabled={disabled || isRandomizing}
      className={className}
    >
      <Dice6 className="mr-1 h-4 w-4" />
      {isRandomizing ? 'Randomizing...' : label}
    </Button>
  )
}
