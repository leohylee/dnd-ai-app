# D&D AI Application - Project Specification

## Project Overview
AI-powered single-player D&D 5e web application with OpenAI integration for DM functionality.

## Tech Stack
- **Frontend**: React 18+ with TypeScript
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: SQLite (development) → PostgreSQL (production)
- **ORM**: Prisma
- **AI**: OpenAI API (GPT-4)
- **State Management**: Zustand or Context API
- **Testing**: Jest + React Testing Library

## Project Structure
```
dnd-ai-app/
├── app/
│   ├── api/
│   │   ├── characters/
│   │   ├── campaigns/
│   │   ├── game-actions/
│   │   └── ai/
│   ├── (auth)/
│   ├── character-creation/
│   ├── campaign/
│   └── play/
├── components/
│   ├── character/
│   ├── dice/
│   ├── game/
│   └── ui/
├── lib/
│   ├── ai/
│   ├── game-engine/
│   ├── database/
│   └── utils/
├── types/
│   ├── character.ts
│   ├── campaign.ts
│   └── game.ts
├── data/
│   └── dnd5e/
└── public/
```

## Core Data Models

### Character
```typescript
interface Character {
  id: string;
  name: string;
  race: Race;
  class: Class;
  level: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hp: { current: number; max: number };
  ac: number;
  proficiencyBonus: number;
  skills: Skill[];
  inventory: Item[];
  spells?: Spell[];
  background: string;
  alignment: string;
}
```

### Campaign
```typescript
interface Campaign {
  id: string;
  name: string;
  characterId: string;
  currentScene: Scene;
  gameState: GameState;
  history: GameEvent[];
  createdAt: Date;
  updatedAt: Date;
}
```

### AI Integration
```typescript
interface AIContext {
  systemPrompt: string;
  characterContext: Character;
  campaignContext: CampaignSummary;
  recentHistory: GameEvent[];
  currentScene: Scene;
}
```

## Phase 1 Goals (MVP)
1. Character creation with AI guidance
2. Basic character sheet display
3. Simple dice rolling system
4. Text-based interactions with multiple choice
5. Campaign persistence

## Key Features
- AI generates contextual multiple-choice options
- Custom text input fallback
- Animated dice rolls
- D&D 5e rules compliance
- Session summarization for context management

## AI Behavior Guidelines
- Maintain consistent DM personality
- Follow D&D 5e rules strictly
- Generate 3-5 contextual choices per interaction
- Provide atmospheric descriptions
- Handle combat encounters properly

## API Endpoints
- `POST /api/characters` - Create character
- `GET /api/characters/:id` - Get character
- `POST /api/campaigns` - Start new campaign
- `GET /api/campaigns/:id` - Load campaign
- `POST /api/game-actions` - Process player action
- `POST /api/ai/generate-choices` - Get AI choices
- `POST /api/ai/process-action` - Process with AI DM

## Database Schema (Simplified)
- Characters table
- Campaigns table
- GameEvents table (for history)
- GameState table (current state)

## Environment Variables
```
DATABASE_URL=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Development Phases
1. **Phase 1**: Character Creation (Current)
2. **Phase 2**: Basic Gameplay Loop
3. **Phase 3**: Combat System
4. **Phase 4**: Advanced Features