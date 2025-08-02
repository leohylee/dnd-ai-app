export interface Campaign {
  id: string;
  name: string;
  characterId: string;
  currentScene: Scene;
  gameState: GameState;
  history: GameEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  location: string;
  npcs: NPC[];
  availableActions: ActionOption[];
}

export interface GameState {
  currentLocation: string;
  activeQuests: Quest[];
  completedQuests: Quest[];
  inventory: string[];
  flags: Record<string, boolean>;
}

export interface GameEvent {
  id: string;
  timestamp: Date;
  type: 'action' | 'dialogue' | 'combat' | 'exploration';
  description: string;
  playerAction?: string;
  dmResponse?: string;
  diceRolls?: DiceRoll[];
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  disposition: 'friendly' | 'neutral' | 'hostile';
  dialogue: DialogueOption[];
}

export interface DialogueOption {
  id: string;
  text: string;
  response: string;
  conditions?: Record<string, any>;
}

export interface ActionOption {
  id: string;
  text: string;
  type: 'dialogue' | 'skill_check' | 'combat' | 'exploration';
  requirements?: Record<string, any>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  reward: string;
  status: 'active' | 'completed' | 'failed';
}

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface DiceRoll {
  type: string;
  result: number;
  modifier: number;
  total: number;
}