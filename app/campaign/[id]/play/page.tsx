'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  Send,
  Dice6,
  Heart,
  Shield,
  Zap,
  Users,
  MapPin,
  Loader2,
  AlertCircle,
  MessageCircle,
  Play,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type {
  Campaign,
  GetCampaignResponse,
  GameActionRequest,
  GameActionResponse,
  StartSessionRequest,
  DiceRollRequest,
  DiceRollResponse,
  ActionOption,
} from '@/types/campaign'

interface GameMessage {
  id: string
  type: 'dm' | 'player' | 'system' | 'dice'
  content: string
  timestamp: Date
  choices?: ActionOption[]
  selectedChoiceId?: string // Track which choice was selected by the player
  isHistorical?: boolean // Mark if this is a past event (read-only)
  diceRollRequired?: {
    type: string
    skill?: string
    difficulty: number
    description: string
  }
}

export default function GameSessionPage() {
  const params = useParams()
  const campaignId = params.id as string
  const { toast } = useToast()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<GameMessage[]>([])
  const [playerInput, setPlayerInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [currentChoices, setCurrentChoices] = useState<ActionOption[]>([])
  const [pendingDiceRoll, setPendingDiceRoll] = useState<any>(null)
  const [currentSceneInfo, setCurrentSceneInfo] = useState<{
    title: string
    location: string
    atmosphere?: string
  } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}`)
        const data: GetCampaignResponse = await response.json()

        if (data.success && data.campaign) {
          // Convert date strings to Date objects
          const campaignWithDates = {
            ...data.campaign,
            createdAt: new Date(data.campaign.createdAt),
            updatedAt: new Date(data.campaign.updatedAt),
          }
          setCampaign(campaignWithDates)

          // Initialize current scene info
          setCurrentSceneInfo({
            title: data.campaign.currentScene.title,
            location: data.campaign.currentScene.location,
            atmosphere: data.campaign.currentScene.atmosphere,
          })

          // Convert existing game events to messages for adventure log
          const historicalMessages: GameMessage[] = []
          
          if (data.campaign.gameEvents && data.campaign.gameEvents.length > 0) {
            // Sort events chronologically (oldest first)
            const sortedEvents = [...data.campaign.gameEvents].sort(
              (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            )

            sortedEvents.forEach((event) => {
              // Add player action message
              if (event.playerAction) {
                historicalMessages.push({
                  id: `history_player_${event.id}`,
                  type: 'player',
                  content: event.playerAction,
                  timestamp: new Date(event.timestamp),
                  isHistorical: true,
                })
              }

              // Add DM response message  
              if (event.dmResponse) {
                // Find which choice was selected by matching player action to choice labels
                const selectedChoiceId = event.eventData?.choices?.find(
                  (choice: any) => choice.label === event.playerAction
                )?.id

                historicalMessages.push({
                  id: `history_dm_${event.id}`,
                  type: 'dm',
                  content: event.dmResponse,
                  timestamp: new Date(event.timestamp),
                  choices: event.eventData?.choices || [],
                  selectedChoiceId,
                  isHistorical: true,
                })
              }

              // Add dice roll message if present
              if (event.diceRolls) {
                historicalMessages.push({
                  id: `history_dice_${event.id}`,
                  type: 'dice', 
                  content: `🎲 ${event.diceRolls}`,
                  timestamp: new Date(event.timestamp),
                  isHistorical: true,
                })
              }
            })
          }

          // Add welcome message at the end
          const welcomeMessage: GameMessage = {
            id: 'welcome',
            type: 'system',
            content: historicalMessages.length > 0 
              ? `Welcome back to ${data.campaign.name}! Your adventure continues...`
              : `Welcome to ${data.campaign.name}! Click "Start Session" to begin your adventure.`,
            timestamp: new Date(),
          }

          setMessages([...historicalMessages, welcomeMessage])
        } else {
          setError(data.error || 'Campaign not found')
        }
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Failed to load campaign')
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  useEffect(() => {
    // Small delay to ensure DOM has updated before scrolling
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages])

  const startSession = async () => {
    try {
      setIsProcessing(true)

      const request: StartSessionRequest = {
        campaignId,
        action: 'start_session',
      }

      const response = await fetch('/api/game-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      const result: GameActionResponse = await response.json()

      if (result.success) {
        const sessionMessage: GameMessage = {
          id: `session_${Date.now()}`,
          type: 'dm',
          content: result.narrative,
          choices: result.choices,
          timestamp: new Date(),
        }

        // Add session divider if there are existing messages
        const currentMessages = messages.length > 1 ? [
          ...messages,
          {
            id: 'session-divider',
            type: 'system' as const,
            content: '--- New Session Started ---',
            timestamp: new Date(),
          },
          sessionMessage
        ] : [...messages, sessionMessage]

        setMessages(currentMessages)
        setCurrentChoices(result.choices)
        setSessionStarted(true)

        if (result.diceRollRequired) {
          setPendingDiceRoll(result.diceRollRequired)
        }

        // Update scene information from session start narrative
        updateSceneFromNarrative(result.narrative, result.newScene)
      } else {
        throw new Error(result.error || 'Failed to start session')
      }
    } catch (err) {
      console.error('Error starting session:', err)
      toast({
        title: 'Session Error',
        description:
          err instanceof Error ? err.message : 'Failed to start session',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const sendAction = async (actionText: string, actionId?: string) => {
    if (!actionText.trim() || isProcessing) return

    try {
      setIsProcessing(true)

      // Add player message
      const playerMessage: GameMessage = {
        id: `player_${Date.now()}`,
        type: 'player',
        content: actionText,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, playerMessage])

      const request: GameActionRequest = {
        campaignId,
        actionId,
        playerInput: actionText,
      }

      const response = await fetch('/api/game-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      const result: GameActionResponse = await response.json()

      if (result.success) {
        const dmMessage: GameMessage = {
          id: `dm_${Date.now()}`,
          type: 'dm',
          content: result.narrative,
          choices: result.choices,
          diceRollRequired: result.diceRollRequired,
          timestamp: new Date(),
        }

        setMessages(prev => {
          // Mark the previous DM message with the selected choice
          const updatedMessages = prev.map(msg => {
            if (msg.type === 'dm' && msg.choices === currentChoices && actionId) {
              return { ...msg, selectedChoiceId: actionId }
            }
            return msg
          })
          return [...updatedMessages, dmMessage]
        })
        setCurrentChoices(result.choices)
        setPlayerInput('')

        if (result.diceRollRequired) {
          setPendingDiceRoll(result.diceRollRequired)
        }

        // Update scene information from narrative
        updateSceneFromNarrative(result.narrative, result.newScene)

        // Update campaign data if scene changed
        if (result.newScene && campaign) {
          setCampaign({
            ...campaign,
            currentScene: result.newScene,
          })
        }
      } else {
        throw new Error(result.error || 'Failed to process action')
      }
    } catch (err) {
      console.error('Error sending action:', err)
      toast({
        title: 'Action Failed',
        description:
          err instanceof Error ? err.message : 'Failed to process action',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const rollDice = async (rollRequest?: DiceRollRequest) => {
    try {
      const response = await fetch('/api/dice/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rollRequest || { diceType: 'd20' }),
      })

      const result: DiceRollResponse = await response.json()

      if (result.success && result.roll && result.formatted) {
        const diceMessage: GameMessage = {
          id: `dice_${Date.now()}`,
          type: 'dice',
          content: `🎲 ${result.formatted}`,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, diceMessage])

        if (pendingDiceRoll) {
          const success = result.roll.total >= pendingDiceRoll.difficulty
          const resultMessage: GameMessage = {
            id: `result_${Date.now()}`,
            type: 'system',
            content: `${pendingDiceRoll.description}: ${success ? 'Success!' : 'Failure!'} (DC ${pendingDiceRoll.difficulty})`,
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, resultMessage])
          setPendingDiceRoll(null)
        }

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
        title: 'Dice Roll Failed',
        description: err instanceof Error ? err.message : 'Failed to roll dice',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendAction(playerInput)
  }

  const getAbilityModifier = (score: number) => {
    return Math.floor((score - 10) / 2)
  }

  const formatModifier = (modifier: number) => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  const updateSceneFromNarrative = (narrative: string, newScene?: any) => {
    // If there's an explicit newScene from the API, use it
    if (newScene) {
      setCurrentSceneInfo({
        title: newScene.title,
        location: newScene.location,
        atmosphere: newScene.atmosphere,
      })
      return
    }

    // Otherwise, try to extract location information from the narrative
    const locationKeywords = [
      'you enter', 'you arrive at', 'you find yourself in', 'you move to',
      'you walk into', 'you step into', 'you approach', 'you reach'
    ]
    
    const narrativeLower = narrative.toLowerCase()
    const hasLocationChange = locationKeywords.some(keyword => 
      narrativeLower.includes(keyword)
    )

    if (hasLocationChange && currentSceneInfo) {
      // Try to extract location from narrative (this is a simple approach)
      const sentences = narrative.split(/[.!?]+/)
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase()
        if (locationKeywords.some(keyword => lowerSentence.includes(keyword))) {
          // Update atmosphere based on the narrative context
          setCurrentSceneInfo(prev => prev ? {
            ...prev,
            atmosphere: sentence.trim()
          } : null)
          break
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link href={`/campaign/${campaignId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-screen max-w-7xl px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/campaign/${campaignId}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaign
          </Button>
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {currentSceneInfo?.location || campaign.currentScene.location}
              </span>
            </div>
          </div>
          {!sessionStarted && (
            <Button onClick={startSession} disabled={isProcessing} size="lg">
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Session
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Game Messages - Main Content */}
        <div className="space-y-4 lg:col-span-3">
          {/* Messages */}
          <Card className="flex h-[60vh] flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Adventure Log
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    <p className="text-sm">Loading adventure history...</p>
                  </div>
                </div>
              ) : (
                messages.map(message => (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 ${
                    message.type === 'dm'
                      ? 'border-l-4 border-primary bg-primary/10'
                      : message.type === 'player'
                        ? 'ml-8 bg-secondary/50'
                        : message.type === 'dice'
                          ? 'border border-yellow-200 bg-yellow-50'
                          : 'bg-muted/50'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {message.type === 'dm'
                        ? 'Dungeon Master'
                        : message.type === 'player'
                          ? campaign.character?.name || 'Player'
                          : message.type === 'dice'
                            ? 'Dice Roll'
                            : 'System'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>

                  {/* Dice Roll Required */}
                  {message.diceRollRequired && (
                    <div className={`mt-3 rounded border p-3 ${
                      message.isHistorical 
                        ? 'border-gray-200 bg-gray-50 opacity-60' 
                        : 'border-yellow-200 bg-yellow-50'
                    }`}>
                      <p className="text-sm font-medium">
                        🎲 {message.isHistorical ? 'Past Dice Roll' : 'Dice Roll Required'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {message.diceRollRequired.description}
                      </p>
                      {!message.isHistorical && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            rollDice({
                              type: message.diceRollRequired?.type as any,
                              skill: message.diceRollRequired?.skill,
                            })
                          }
                        >
                          <Dice6 className="mr-2 h-3 w-3" />
                          Roll {message.diceRollRequired.type.replace('_', ' ')}
                        </Button>
                      )}
                      {message.isHistorical && (
                        <div className="text-xs text-gray-500 italic mt-2">
                          This dice roll was resolved in the past
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Choices */}
                  {message.choices && message.choices.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {message.isHistorical ? 'Past Actions:' : 'Available Actions:'}
                      </p>
                      <div className="grid gap-2">
                        {message.choices.map(choice => {
                          const isSelected = message.selectedChoiceId === choice.id
                          const isCurrentChoice = !message.isHistorical && message.choices === currentChoices
                          
                          return (
                            <div
                              key={choice.id}
                              className={`h-auto justify-start p-3 text-left rounded-md border transition-colors ${
                                message.isHistorical
                                  ? isSelected
                                    ? 'bg-green-50 border-green-200 border-2' // Highlight selected historical choice
                                    : 'bg-gray-50 border-gray-200 opacity-60' // Dim unselected historical choices
                                  : 'border-border hover:bg-accent hover:text-accent-foreground cursor-pointer'
                              }`}
                              onClick={
                                !message.isHistorical && isCurrentChoice
                                  ? () => sendAction(choice.label, choice.id)
                                  : undefined
                              }
                              style={{ 
                                cursor: message.isHistorical ? 'default' : (isProcessing ? 'not-allowed' : 'pointer')
                              }}
                            >
                              <div className="flex items-start gap-2">
                                {message.isHistorical && isSelected && (
                                  <div className="text-green-600 text-xs font-medium mt-0.5">✓</div>
                                )}
                                <div className="flex-1">
                                  <div className={`font-medium ${isSelected && message.isHistorical ? 'text-green-800' : ''}`}>
                                    {choice.label}
                                  </div>
                                  <div className={`text-xs ${isSelected && message.isHistorical ? 'text-green-700' : 'text-muted-foreground'}`}>
                                    {choice.description}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {message.isHistorical && message.selectedChoiceId && (
                        <div className="text-xs text-green-600 italic">
                          ✓ Player selected: {message.choices.find(c => c.id === message.selectedChoiceId)?.label}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>
          </Card>

          {/* Input Area */}
          {sessionStarted && (
            <Card>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Textarea
                    placeholder="Describe your action... (e.g., 'I search the room for clues' or 'I talk to the innkeeper about local rumors')"
                    value={playerInput}
                    onChange={e => setPlayerInput(e.target.value)}
                    rows={3}
                    disabled={isProcessing}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!playerInput.trim() || isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Action
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => rollDice()}
                      disabled={isProcessing}
                    >
                      <Dice6 className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Character & Game Info Sidebar */}
        <div className="space-y-4">
          {/* Character Stats */}
          {campaign.character && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  {campaign.character.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    Level {campaign.character.level}
                  </Badge>
                  <Badge variant="outline">{campaign.character.race}</Badge>
                  <Badge variant="outline">{campaign.character.class}</Badge>
                </div>

                <Separator />

                {/* Core Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="h-3 w-3 text-red-500" />
                      <span className="font-medium">HP</span>
                    </div>
                    <div className="font-bold">
                      {typeof campaign.character.hp === 'object'
                        ? `${campaign.character.hp.current}/${campaign.character.hp.max}`
                        : campaign.character.hp}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3 text-blue-500" />
                      <span className="font-medium">AC</span>
                    </div>
                    <div className="font-bold">{campaign.character.ac}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">Prof</span>
                    </div>
                    <div className="font-bold">
                      +{campaign.character.proficiencyBonus}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ability Scores */}
                {campaign.character.stats ? (
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    {Object.entries(campaign.character.stats).map(
                      ([ability, score]) => {
                        const modifier = getAbilityModifier(score as number)
                        return (
                          <div key={ability} className="text-center">
                            <div className="font-medium capitalize text-muted-foreground">
                              {ability.substring(0, 3)}
                            </div>
                            <div className="font-bold">{score}</div>
                            <div className="text-muted-foreground">
                              {formatModifier(modifier)}
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    Character stats not available
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Dice Rolls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Dice6 className="h-4 w-4" />
                Quick Rolls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rollDice({ diceType: 'd20' })}
                >
                  d20
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rollDice({ diceType: 'd6' })}
                >
                  d6
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rollDice({ diceType: 'd4' })}
                >
                  d4
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rollDice({ diceType: 'd8' })}
                >
                  d8
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Scene Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Current Scene
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">
                  {currentSceneInfo?.title || campaign.currentScene.title}
                </span>
              </div>
              <div className="text-muted-foreground">
                {currentSceneInfo?.location || campaign.currentScene.location}
              </div>
              {(currentSceneInfo?.atmosphere || campaign.currentScene.atmosphere) && (
                <div className="text-xs italic text-muted-foreground">
                  {currentSceneInfo?.atmosphere || campaign.currentScene.atmosphere}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
