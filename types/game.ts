export interface AIContext {
  systemPrompt: string;
  characterContext: Character;
  campaignContext: CampaignSummary;
  recentHistory: GameEvent[];
  currentScene: Scene;
}

export interface CampaignSummary {
  id: string;
  name: string;
  sessionCount: number;
  keyEvents: string[];
  importantNPCs: string[];
  currentObjectives: string[];
}

export interface GameAction {
  type: 'dialogue' | 'skill_check' | 'combat' | 'exploration' | 'custom';
  description: string;
  target?: string;
  skillCheck?: SkillCheck;
  customInput?: string;
}

export interface SkillCheck {
  skill: string;
  difficulty: number;
  advantage?: boolean;
  disadvantage?: boolean;
}

export interface AIResponse {
  narration: string;
  choices: ActionChoice[];
  sceneUpdate?: Partial<Scene>;
  gameStateUpdate?: Partial<GameState>;
  diceRolls?: DiceRoll[];
}

export interface ActionChoice {
  id: string;
  text: string;
  type: GameAction['type'];
  skillCheck?: SkillCheck;
  consequences?: string;
}

export interface CombatState {
  isActive: boolean;
  round: number;
  turn: number;
  initiative: InitiativeEntry[];
  combatants: Combatant[];
}

export interface InitiativeEntry {
  characterId: string;
  initiative: number;
  hasActed: boolean;
}

export interface Combatant {
  id: string;
  name: string;
  type: 'player' | 'enemy' | 'ally';
  hp: { current: number; max: number };
  ac: number;
  status: StatusEffect[];
}

export interface StatusEffect {
  name: string;
  duration: number;
  description: string;
}

import type { Character } from './character';
import type { Scene, GameState, GameEvent, DiceRoll } from './campaign';