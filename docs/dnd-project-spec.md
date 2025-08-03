# D&D AI Application - Project Specification

## Project Overview

AI-powered single-player D&D 5e web application with OpenAI integration for intelligent character creation, DM functionality, and immersive gameplay experiences.

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS with Radix UI components
- **Database**: PostgreSQL (development & production)
- **ORM**: Prisma with comprehensive D&D 5e reference data
- **AI**: OpenAI API (GPT-4) for character generation and DM assistance
- **Validation**: Zod schemas for runtime type safety
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **Development**: tsx for TypeScript execution, ESLint + Prettier

## Project Structure

```
dnd-ai-app/
├── app/
│   ├── api/
│   │   ├── ai/                      # AI assistance endpoints
│   │   │   ├── generate-background/
│   │   │   ├── suggest-traits/
│   │   │   └── recommend-stats/
│   │   ├── characters/              # Character CRUD operations
│   │   ├── campaigns/               # Campaign management
│   │   ├── game-actions/            # Game mechanics
│   │   └── reference/               # D&D 5e reference data
│   │       ├── races/
│   │       ├── classes/
│   │       └── backgrounds/
│   ├── auth/                        # Authentication pages
│   ├── character-creation/          # Character creation flow
│   ├── campaign/                    # Campaign pages
│   └── play/                        # Game session interface
├── components/                      # Reusable React components
│   ├── character/
│   ├── dice/
│   ├── game/
│   └── ui/                         # Radix UI base components
├── data/                           # Static D&D 5e reference data
│   └── dnd5e/
│       ├── backgrounds.json
│       ├── classes.json
│       ├── equipment.json
│       ├── races.json
│       ├── skills.json
│       └── spells-complete.json
├── lib/
│   ├── ai/
│   │   └── openai-service.ts       # OpenAI API integration
│   ├── database/                   # Database utilities
│   ├── game-engine/
│   │   └── ability-scores.ts
│   ├── utils/
│   │   └── character-utils.ts      # Character calculations
│   └── validations/
│       └── character.ts            # Zod validation schemas
├── prisma/
│   ├── migrations/                 # Database migrations
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # D&D 5e data seeding script
├── types/                          # TypeScript definitions
│   ├── character.ts               # Character and API types
│   ├── campaign.ts
│   └── game.ts
└── docs/
    └── dnd-project-spec.md
```

## Core Data Models

### Character

```typescript
interface Character {
  id: string
  name: string
  race: Race
  class: Class
  level: number
  experience: number
  stats: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  hp: { current: number; max: number }
  ac: number
  proficiencyBonus: number
  skills: Skill[]
  inventory: Item[]
  spells?: Spell[]
  background: string
  alignment: string
  gender?: string
  // AI-generated fields
  aiGeneratedBackground?: string
  personalityTraits: string[]
  backstory?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### ReferenceData (D&D 5e Database)

```typescript
interface ReferenceData {
  id: string
  type: 'race' | 'class' | 'spell' | 'background' | 'equipment' | 'skill'
  name: string
  data: any // Flexible JSON data for each type
}
```

### Campaign

```typescript
interface Campaign {
  id: string
  name: string
  characterId: string
  currentScene: Scene
  gameState: GameState
  history: GameEvent[]
  createdAt: Date
  updatedAt: Date
}
```

### AI Integration

```typescript
interface AIContext {
  systemPrompt: string
  characterContext: Character
  campaignContext: CampaignSummary
  recentHistory: GameEvent[]
  currentScene: Scene
}
```

## Implementation Status

### ✅ Phase 1 - COMPLETED (Character Creation & Backend)

1. **Character Creation System** ✅
   - Complete character creation API with validation
   - AI-assisted character background generation
   - Personality trait suggestions
   - Ability score recommendations
   - Point-buy validation system

2. **D&D 5e Reference Data** ✅
   - Complete database of races, classes, spells, backgrounds, equipment
   - Automated seeding system
   - Reference data APIs

3. **AI Integration** ✅
   - OpenAI GPT-4 integration
   - Context-aware character generation
   - Lore-appropriate suggestions

4. **Backend Infrastructure** ✅
   - PostgreSQL database with Prisma
   - Type-safe APIs with Zod validation
   - Character stat calculations
   - Error handling and logging

### ✅ Phase 2 - COMPLETED (Frontend Development)

1. **Character Creation UI** ✅
   - Multi-step character creation wizard with validation
   - AI-powered recommendations for stats, skills, and names
   - Real-time character preview with stat calculations
   - Integration with all existing APIs
   - Responsive design for desktop and mobile

2. **Character Management System** ✅
   - Character browsing and search functionality
   - Character cards with detailed information display
   - Character creation workflow integration

### 🚧 Phase 3 - IN PROGRESS (Gameplay Features)

1. **Campaign Management** ✅
   - Campaign creation with character selection
   - Campaign list/dashboard with search and filtering
   - Auto-generated initial scenes with NPCs and actions
   - Campaign state persistence and management
   - Full CRUD API operations

2. **Basic Gameplay Loop** 🔄
   - Text-based interactions with AI DM (pending)
   - Multiple choice options (pending)
   - Custom action input (pending)

3. **Dice Rolling System** 📋
   - Animated dice rolls (planned)
   - D&D 5e mechanics integration (planned)

### 📋 Phase 4 - FUTURE (Advanced Features)

1. **Combat System**
   - Turn-based combat
   - Initiative tracking
   - Spell and ability usage

2. **Advanced AI Features**
   - Dynamic story generation
   - Combat assistance
   - Character progression suggestions

## Key Features Implemented

### Character Creation & Management

- **AI-Powered Background Generation** - Contextual backstories using D&D lore
- **Smart Ability Score Recommendations** - Class-optimized stat distributions
- **AI Skill Recommendations** - Context-aware skill selection assistance
- **AI Name Generation** - Race and gender-appropriate character names
- **Personality Trait Suggestions** - Race/class/background appropriate traits
- **Point-Buy Validation** - Ensures legal D&D 5e character builds
- **Comprehensive Character Calculations** - HP, AC, proficiency bonus, racial bonuses
- **Character Management Dashboard** - Browse, search, and manage characters
- **Multi-Step Creation Wizard** - Guided character creation with real-time preview

### Campaign Management

- **Campaign Creation & Management** - Full campaign lifecycle with character selection
- **Auto-Generated Starting Scenes** - AI-crafted initial scenarios with NPCs and actions
- **Campaign Dashboard** - View active and completed campaigns with search/filter
- **Session Tracking** - Monitor campaign progress and play sessions
- **Campaign State Persistence** - Save and load game states with full history

### D&D 5e Compliance

- **Complete Reference Database** - 250+ official D&D 5e items
- **Accurate Stat Calculations** - Proper racial bonuses and class features
- **Rules Validation** - Enforces D&D 5e character creation rules

### AI Integration

- **OpenAI GPT-4** - Advanced natural language generation
- **Context-Aware Prompts** - AI uses actual D&D reference data
- **Lore Consistency** - Maintains authentic D&D universe feel

### Developer Experience

- **Type Safety** - Full TypeScript coverage with Zod validation
- **Database Seeding** - Automated D&D 5e data import
- **API Documentation** - Comprehensive endpoint documentation
- **Error Handling** - Graceful error management and logging

## AI Behavior Guidelines

- Maintain consistent DM personality
- Follow D&D 5e rules strictly
- Generate 3-5 contextual choices per interaction
- Provide atmospheric descriptions
- Handle combat encounters properly

## API Endpoints

### Character Management

- `POST /api/characters` - Create character with AI assistance
- `GET /api/characters` - Get all characters (with pagination)

### D&D 5e Reference Data

- `GET /api/reference/races` - Get all D&D 5e races
- `GET /api/reference/classes` - Get all D&D 5e classes
- `GET /api/reference/backgrounds` - Get all D&D 5e backgrounds

### AI Assistance (OpenAI Integration)

- `POST /api/ai/generate-background` - Generate AI character background
- `POST /api/ai/suggest-traits` - Get AI personality trait suggestions
- `POST /api/ai/recommend-stats` - Get AI ability score recommendations
- `POST /api/ai/recommend-skills` - Get AI skill recommendations
- `POST /api/ai/generate-name` - Generate character names by race/gender

### Campaign Management

- `POST /api/campaigns` - Create new campaign with initial scene
- `GET /api/campaigns` - Get all campaigns with filtering
- `GET /api/campaigns/:id` - Load specific campaign
- `PATCH /api/campaigns/:id` - Update campaign details
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/game-actions` - Process player action (planned)

## Database Schema

### Implemented Tables

- **Characters** - Complete character data with stats, skills, inventory, and AI-generated fields
- **Campaigns** - Campaign metadata, current scene, character relationships, and session tracking
- **GameEvents** - Event logging for campaign history with player actions and DM responses
- **GameState** - Current game state with quests, inventory, flags, and combat state
- **ReferenceData** - D&D 5e reference data (races, classes, spells, backgrounds, skills, equipment)
- **AIContext** - AI conversation context and summaries for gameplay continuity

### Schema Key Features

- **PostgreSQL** with Prisma ORM for type-safe database operations
- **JSON fields** for flexible data storage (stats, inventory, scenes, game state)
- **Cascade deletions** for maintaining data integrity
- **Indexed relationships** for optimal query performance
- **Seeded D&D 5e data** - 250+ items including races, classes, spells, backgrounds, equipment, and skills
- **Automated migrations** and database versioning

### Character Schema Highlights

```prisma
model Character {
  id               String @id @default(cuid())
  name             String
  race             String
  raceData         Json   // Complete race details and traits
  class            String  
  classData        Json   // Class features and abilities
  level            Int    @default(1)
  experience       Int    @default(0)
  stats            Json   // Ability scores object
  hp               Json   // Current and max HP
  ac               Int    @default(10)
  proficiencyBonus Int    @default(2)
  skills           Json   // Array of skill proficiencies
  inventory        Json   // Character equipment and items
  spells           Json?  // Spell list for casters
  background       String
  alignment        String
  gender           String?
  backstory        String?
  notes            String?
  aiGeneratedBackground  String?
  personalityTraits      Json
  campaigns        Campaign[]
}
```

### Campaign Schema Highlights

```prisma
model Campaign {
  id             String @id @default(cuid())
  name           String
  description    String?
  characterId    String
  character      Character @relation(fields: [characterId], references: [id])
  currentScene   Json   // Active scene with NPCs and actions
  gameState      GameState?
  sessionCount   Int    @default(0)
  isActive       Boolean @default(true)
  gameEvents     GameEvent[]
}
```

## Environment Variables

```
DATABASE_URL=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Environment Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed D&D 5e reference data
npm run db:seed

# Start development server
npm run dev
```

### Testing the APIs

The backend APIs are fully functional and can be tested with:

- **Postman** - Import the API collection
- **curl** - Use provided examples in PROJECT_OVERVIEW.md
- **Frontend integration** - Connect React components to existing endpoints

## Next Steps for Development

1. **Frontend Implementation** - Build React components for character creation
2. **Campaign System** - Implement campaign management features
3. **Gameplay Loop** - Add AI DM interactions and dice rolling
4. **Advanced Features** - Combat system and character progression
