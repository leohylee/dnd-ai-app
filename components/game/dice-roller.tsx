'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dice6, RotateCcw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type {
  DiceRollRequest,
  DiceRollResponse,
  DiceRoll,
} from '@/types/campaign'

interface DiceRollerProps {
  onRoll?: (roll: DiceRoll) => void
  className?: string
}

export function DiceRoller({ onRoll, className }: DiceRollerProps) {
  const { toast } = useToast()
  const [diceType, setDiceType] = useState<
    'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'
  >('d20')
  const [count, setCount] = useState(1)
  const [modifier, setModifier] = useState(0)
  const [advantage, setAdvantage] = useState(false)
  const [disadvantage, setDisadvantage] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null)

  const rollDice = async () => {
    try {
      setRolling(true)

      const request: DiceRollRequest = {
        diceType,
        count,
        modifier,
        advantage: advantage && !disadvantage,
        disadvantage: disadvantage && !advantage,
        purpose: `${count}${diceType}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`,
      }

      const response = await fetch('/api/dice/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      const result: DiceRollResponse = await response.json()

      if (result.success && result.roll) {
        setLastRoll(result.roll)
        onRoll?.(result.roll)

        toast({
          title: 'Dice Rolled!',
          description: result.formatted,
        })
      } else {
        throw new Error(result.error || 'Failed to roll dice')
      }
    } catch (err) {
      console.error('Error rolling dice:', err)
      toast({
        title: 'Roll Failed',
        description: err instanceof Error ? err.message : 'Failed to roll dice',
        variant: 'destructive',
      })
    } finally {
      setRolling(false)
    }
  }

  const resetRoll = () => {
    setLastRoll(null)
    setAdvantage(false)
    setDisadvantage(false)
    setModifier(0)
    setCount(1)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dice6 className="h-5 w-5" />
          Dice Roller
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dice Type Selection */}
        <div className="grid grid-cols-4 gap-2">
          {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as const).map(
            dice => (
              <Button
                key={dice}
                variant={diceType === dice ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDiceType(dice)}
              >
                {dice}
              </Button>
            )
          )}
        </div>

        {/* Roll Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="count">Count</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={e =>
                setCount(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modifier">Modifier</Label>
            <Input
              id="modifier"
              type="number"
              min="-50"
              max="50"
              value={modifier}
              onChange={e => setModifier(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Advantage/Disadvantage (only for d20) */}
        {diceType === 'd20' && (
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="advantage"
                checked={advantage}
                onCheckedChange={checked => {
                  setAdvantage(checked as boolean)
                  if (checked) setDisadvantage(false)
                }}
              />
              <Label htmlFor="advantage" className="text-sm">
                Advantage
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disadvantage"
                checked={disadvantage}
                onCheckedChange={checked => {
                  setDisadvantage(checked as boolean)
                  if (checked) setAdvantage(false)
                }}
              />
              <Label htmlFor="disadvantage" className="text-sm">
                Disadvantage
              </Label>
            </div>
          </div>
        )}

        {/* Roll Button */}
        <div className="flex gap-2">
          <Button onClick={rollDice} disabled={rolling} className="flex-1">
            {rolling ? (
              <>
                <Dice6 className="mr-2 h-4 w-4 animate-spin" />
                Rolling...
              </>
            ) : (
              <>
                <Dice6 className="mr-2 h-4 w-4" />
                Roll {count}
                {diceType}
                {modifier !== 0
                  ? modifier > 0
                    ? `+${modifier}`
                    : modifier
                  : ''}
              </>
            )}
          </Button>
          {lastRoll && (
            <Button variant="outline" size="icon" onClick={resetRoll}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Last Roll Result */}
        {lastRoll && (
          <div className="rounded-lg border bg-secondary/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Result</span>
              <Badge variant="secondary">{lastRoll.total}</Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>
                Rolled: [{lastRoll.result.join(', ')}]
                {lastRoll.modifier !== 0 && (
                  <span>
                    {' '}
                    {lastRoll.modifier > 0 ? '+' : ''}
                    {lastRoll.modifier}
                  </span>
                )}
              </div>
              {(lastRoll.advantage || lastRoll.disadvantage) && (
                <div>
                  {lastRoll.advantage ? 'Advantage' : 'Disadvantage'} applied
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
