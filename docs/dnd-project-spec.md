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

### ✅ Phase 3 - COMPLETED (Gameplay Features)

1. **Campaign Management** ✅
   - Campaign creation with character selection
   - Campaign list/dashboard with search and filtering
   - Auto-generated initial scenes with NPCs and actions
   - Campaign state persistence and management
   - Full CRUD API operations with complete character data integration

2. **AI Dungeon Master System** ✅
   - Real-time text-based interactions with GPT-4 powered DM
   - Context-aware narrative generation using campaign and character data
   - Dynamic scene management with NPCs, locations, and available actions
   - Multiple choice option generation based on player context
   - Custom action input processing with AI interpretation
   - Game event logging and campaign history tracking

3. **Dice Rolling System** ✅
   - Complete D&D 5e dice mechanics (d4, d6, d8, d10, d12, d20, d100)
   - Advantage and disadvantage rolling
   - Skill checks, saving throws, attack rolls, and damage rolls
   - Automatic modifier calculations and formatting
   - Integration with AI DM for contextual dice roll suggestions

4. **Interactive Game Session Interface** ✅
   - Real-time chat-style gameplay interface
   - Character stats sidebar with full ability scores, HP, AC, proficiency bonus
   - Quick dice rolling buttons for common rolls
   - Scene information display with atmosphere and environment details
   - Action choice buttons and custom text input for player actions

### 📋 Phase 4 - FUTURE (Advanced Features)

1. **Combat System**
   - Turn-based combat with initiative tracking
   - Spell and ability usage tracking
   - Health and status effect management
   - Tactical combat AI assistance

2. **Character Progression**
   - Experience point tracking and leveling
   - Skill and ability improvements
   - New spell and feat acquisition
   - Character backstory evolution

3. **Advanced AI Features**
   - Multi-session story continuity
   - Dynamic quest generation
   - Character relationship tracking
   - Voice integration for immersive gameplay

4. **Multiplayer Support**
   - Multi-character campaigns
   - Player-to-player interactions
   - Shared campaign management
   - Real-time synchronization

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

### Campaign Management & Gameplay

- **Campaign Creation & Management** - Full campaign lifecycle with character selection
- **Auto-Generated Starting Scenes** - AI-crafted initial scenarios with NPCs and actions
- **Campaign Dashboard** - View active and completed campaigns with search/filter
- **Session Tracking** - Monitor campaign progress and play sessions
- **Campaign State Persistence** - Save and load game states with full history
- **AI Dungeon Master** - Real-time GPT-4 powered DM with contextual responses
- **Interactive Gameplay** - Text-based D&D sessions with choice-driven narratives
- **Dice Rolling System** - Complete D&D 5e mechanics with advantage/disadvantage
- **Game Session Interface** - Chat-style gameplay with character stats integration
- **Dynamic Scene Management** - AI-generated NPCs, locations, and action choices

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
- `GET /api/campaigns/:id` - Load specific campaign with full character data
- `PATCH /api/campaigns/:id` - Update campaign details
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/game-actions` - Process player actions and get AI DM responses
- `POST /api/dice/roll` - Roll dice with D&D 5e mechanics

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

### Immediate Priorities (Phase 4)

1. **Combat System Enhancement**
   - Implement turn-based combat mechanics
   - Add initiative tracking and combat state management
   - Create combat-specific AI DM responses
   - Integrate spell casting and ability usage

2. **Character Progression System**
   - Experience point tracking and automatic leveling
   - Skill point allocation and feat selection
   - Equipment upgrade recommendations
   - Character backstory evolution based on campaign events

3. **Advanced Gameplay Features**
   - Multi-session story continuity with long-term memory
   - Dynamic quest generation based on character actions
   - Environmental interaction and exploration mechanics
   - Inventory management with item usage tracking

### Long-term Goals (Phase 5+)

1. **Multiplayer Campaign Support**
   - Multi-character campaign management
   - Real-time player-to-player interactions
   - Shared campaign state synchronization
   - Collaborative storytelling features

2. **Enhanced AI Integration**
   - Voice-to-text input for natural gameplay
   - Text-to-speech for AI DM responses
   - Visual scene generation using AI image models
   - Personalized DM style adaptation

3. **Platform Extensions**
   - Mobile app development for iOS/Android
   - Discord bot integration for community play
   - Virtual tabletop integration (Roll20, Foundry VTT)
   - API for third-party integrations

## Current System Status

The D&D AI Application is now a **fully functional single-player D&D experience** with:

- ✅ Complete character creation with AI assistance
- ✅ Campaign management and persistence  
- ✅ Real-time AI Dungeon Master interactions
- ✅ Interactive gameplay with dice rolling mechanics
- ✅ Comprehensive D&D 5e rule implementation
- ✅ Responsive web interface for desktop and mobile

The application successfully bridges the gap between traditional tabletop D&D and modern AI-powered digital experiences, providing users with an immersive single-player campaign experience that maintains the core spirit of Dungeons & Dragons.
