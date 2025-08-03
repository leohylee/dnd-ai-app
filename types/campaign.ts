export interface Campaign {
  id: string
  name: string
  description?: string
  characterId: string
  character?: {
    id: string
    name: string
    race: string
    class: string
    level: number
  }
  currentScene: Scene
  gameState?: GameState
  sessionCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  gameEvents?: GameEvent[]
}

export interface Scene {
  id?: string
  title: string
  description: string
  location: string
  npcs: NPC[]
  availableActions: ActionOption[]
  atmosphere?: string
  environment?: string
}

export interface GameState {
  id: string
  campaignId: string
  currentLocation: string
  activeQuests: Quest[]
  completedQuests: Quest[]
  partyInventory: Item[]
  flags: Record<string, boolean>
  variables: Record<string, any>
  combatState?: CombatState
  knownNPCs: NPC[]
  npcRelationships: Record<string, number>
  sessionSummary?: string
  keyEvents: KeyEvent[]
  createdAt: Date
  updatedAt: Date
}

export interface GameEvent {
  id: string
  campaignId: string
  type: 'action' | 'dialogue' | 'combat' | 'exploration' | 'system'
  description: string
  playerAction?: string
  dmResponse?: string
  diceRolls?: DiceRoll[]
  eventData?: any
  timestamp: Date
}

export interface NPC {
  id: string
  name: string
  race?: string
  role: string
  disposition: 'friendly' | 'neutral' | 'hostile'
  description: string
  dialogue?: string[]
}

export interface DialogueOption {
  id: string
  text: string
  response: string
  conditions?: Record<string, any>
}

export interface ActionOption {
  id: string
  type: 'dialogue' | 'exploration' | 'combat' | 'skill_check' | 'custom'
  label: string
  description: string
  difficulty?: number
  skill?: string
  consequences?: string[]
}

export interface Quest {
  id: string
  title: string
  description: string
  objectives: QuestObjective[]
  status: 'active' | 'completed' | 'failed'
  experienceReward?: number
  goldReward?: number
  itemRewards?: Item[]
}

export interface QuestObjective {
  id: string
  description: string
  completed: boolean
  optional: boolean
}

export interface DiceRoll {
  id: string
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'
  count: number
  modifier: number
  result: number[]
  total: number
  purpose: string
  skill?: string
  advantage?: boolean
  disadvantage?: boolean
}

// Additional new interfaces
export interface CombatState {
  isActive: boolean
  round: number
  turn: number
  initiative: InitiativeEntry[]
  participants: CombatParticipant[]
}

export interface InitiativeEntry {
  participantId: string
  initiative: number
  hasActed: boolean
}

export interface CombatParticipant {
  id: string
  name: string
  type: 'player' | 'npc' | 'monster'
  hp: { current: number; max: number }
  ac: number
  status: string[]
}

export interface KeyEvent {
  id: string
  title: string
  description: string
  impact: 'minor' | 'major' | 'critical'
  timestamp: Date
}

export interface Item {
  id: string
  name: string
  type: string
  description: string
  weight: number
  value: number
  quantity: number
  properties?: string[]
}

// API Request/Response Types
export interface CreateCampaignRequest {
  name: string
  description?: string
  characterId: string
}

export interface CreateCampaignResponse {
  success: boolean
  campaign?: Campaign
  error?: string
}

export interface GetCampaignsResponse {
  success: boolean
  campaigns?: Campaign[]
  total?: number
  error?: string
}

export interface GetCampaignResponse {
  success: boolean
  campaign?: Campaign
  error?: string
}

export interface UpdateCampaignRequest {
  name?: string
  description?: string
  isActive?: boolean
  currentScene?: Scene
}

export interface UpdateCampaignResponse {
  success: boolean
  campaign?: Campaign
  error?: string
}
