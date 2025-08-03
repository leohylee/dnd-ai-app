# D&D AI Web Application

A complete AI-powered D&D 5e web application built with Next.js, featuring intelligent character creation, campaign management, and an AI Dungeon Master for immersive gameplay experiences.

## ✨ Features

### 🎲 Character Creation

- **AI-Powered Background Generation** - Create rich, lore-appropriate character backstories
- **Smart Ability Score Recommendations** - Get optimized stat distributions for your class
- **Personality Trait Suggestions** - AI-generated traits based on race, class, and background
- **Point-Buy Validation** - Ensures legal D&D 5e character builds
- **Complete Stat Calculations** - Automatic HP, AC, proficiency bonus, and racial bonus calculations

### 📖 Character Management

- **View All Characters** - Browse your created characters with detailed previews
- **Character Cards** - Display essential character information at a glance
- **Character Search & Filter** - Find characters by name, race, class, or level

### 🏰 Campaign Management

- **Create Campaigns** - Link characters to campaigns with AI-generated starting scenes
- **Campaign Dashboard** - View campaign details, current scenes, and recent events
- **Session Management** - Track session count and campaign progress
- **Character Integration** - Full character stats and abilities available in campaigns

### 🎮 AI Dungeon Master

- **Interactive Gameplay** - Text-based D&D sessions with AI-powered DM responses
- **Dynamic Storytelling** - Context-aware narrative generation based on player actions
- **Skill Checks & Dice Rolling** - Complete D&D 5e mechanics with advantage/disadvantage
- **Scene Management** - AI manages NPCs, locations, and available actions
- **Game State Persistence** - All actions and events are saved for campaign continuity

### 📚 D&D 5e Reference Database

- **250+ D&D Items** - Complete database of races, classes, spells, backgrounds, equipment, and skills
- **Official Content** - Accurate D&D 5e Player's Handbook data
- **API Access** - RESTful endpoints for all reference data

### 🤖 AI Integration

- **OpenAI GPT-4** - Advanced natural language generation
- **Context-Aware** - AI uses actual D&D reference data for authentic suggestions
- **Lore Consistency** - Maintains authentic D&D universe feel

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with seeded D&D 5e data
- **AI**: OpenAI API (GPT-4)
- **Styling**: Tailwind CSS with Radix UI components
- **Validation**: Zod schemas for type-safe APIs
- **Development**: tsx, ESLint, Prettier

## 🛠️ Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd dnd-ai-app
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dnd_dev"
OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed D&D 5e reference data (250+ items)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📡 API Endpoints

### Character Management

```
POST /api/characters          # Create character with AI assistance
GET  /api/characters          # Get all characters (with pagination)
```

### Campaign Management

```
POST /api/campaigns           # Create new campaign with initial scene
GET  /api/campaigns           # Get all campaigns (with filtering)
GET  /api/campaigns/[id]      # Get specific campaign details with full character data
PATCH /api/campaigns/[id]     # Update campaign (scene, status, etc.)
DELETE /api/campaigns/[id]    # Delete campaign
```

### AI Gameplay

```
POST /api/game-actions        # Process player actions and get AI DM responses
POST /api/dice/roll          # Roll dice with D&D 5e mechanics
```

### D&D 5e Reference Data

```
GET /api/reference/races      # Get all D&D 5e races
GET /api/reference/classes    # Get all D&D 5e classes
GET /api/reference/backgrounds # Get all D&D 5e backgrounds
```

### AI Assistance

```
POST /api/ai/generate-background # Generate AI character background
POST /api/ai/suggest-traits     # Get AI personality trait suggestions
POST /api/ai/recommend-stats    # Get AI ability score recommendations
POST /api/ai/recommend-skills   # Get AI skill recommendations
POST /api/ai/generate-name      # Generate character names by race/gender
```

## 🧪 Testing the APIs

### Using curl

```bash
# Get all races
curl http://localhost:3000/api/reference/races

# Create a character
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thorin Ironforge",
    "race": "Dwarf",
    "class": "Fighter",
    "background": "Soldier",
    "alignment": "Lawful Good",
    "stats": {
      "strength": 15,
      "dexterity": 12,
      "constitution": 14,
      "intelligence": 10,
      "wisdom": 13,
      "charisma": 8
    }
  }'

# Create a campaign
curl -X POST http://localhost:3000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Lost Mine of Phandelver",
    "description": "A classic D&D adventure",
    "characterId": "character-id-here"
  }'

# Start a game session
curl -X POST http://localhost:3000/api/game-actions \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-id-here",
    "action": "start_session"
  }'

# Roll dice
curl -X POST http://localhost:3000/api/dice/roll \
  -H "Content-Type: application/json" \
  -d '{
    "diceType": "d20",
    "advantage": true
  }'

# Generate AI background
curl -X POST http://localhost:3000/api/ai/generate-background \
  -H "Content-Type: application/json" \
  -d '{
    "race": "Elf",
    "class": "Wizard",
    "background": "Sage",
    "alignment": "Neutral Good",
    "name": "Luna Starweaver"
  }'
```

### Using Postman

Import the API collection and test all endpoints with the provided examples.

## 📊 Database

The application uses PostgreSQL with Prisma ORM and includes:

- **Characters** - Complete character data with AI-generated fields
- **Campaigns** - Campaign metadata and scenes
- **GameEvents** - Event logging for campaign history
- **GameState** - Current game state and context
- **ReferenceData** - D&D 5e reference data (seeded automatically)
- **AIContext** - AI conversation context and summaries

### Database Commands

```bash
npm run db:studio     # Open Prisma Studio GUI
npm run db:reset      # Reset database and reseed
npm run db:migrate    # Run migrations
```

## 🏗️ Project Structure

```
dnd-ai-app/
├── app/
│   ├── api/                  # API routes
│   │   ├── ai/               # AI assistance endpoints
│   │   ├── campaigns/        # Campaign management
│   │   ├── characters/       # Character CRUD
│   │   ├── dice/            # Dice rolling mechanics
│   │   ├── game-actions/    # AI DM gameplay
│   │   └── reference/       # D&D 5e reference data
│   ├── campaign/            # Campaign pages
│   ├── campaigns/           # Campaign list
│   ├── character-creation/  # Character creation UI
│   └── characters/          # Character management
├── components/              # React components
│   ├── character/           # Character creation components
│   ├── game/               # Gameplay components
│   └── ui/                 # Reusable UI components
├── data/dnd5e/             # D&D 5e JSON data files
├── lib/
│   ├── ai/                 # OpenAI & AI DM services
│   ├── utils/              # Character & dice calculations
│   └── validations/        # Zod schemas
├── prisma/                 # Database schema & migrations
├── types/                  # TypeScript definitions
└── docs/                   # Documentation
```

## 🎯 Implementation Status

### ✅ Completed (Phase 1)

- Character creation API with AI assistance
- D&D 5e reference database (250+ items)
- OpenAI integration for background/trait generation
- PostgreSQL database with Prisma
- Type-safe APIs with Zod validation
- Character stat calculations and point-buy validation

### ✅ Completed (Phase 2)

- Frontend character creation UI with multi-step wizard
- Character management and viewing system
- AI-powered skill recommendations and ability score optimization
- Complete character preview and validation
- Responsive design for desktop and mobile

### ✅ Completed (Phase 3)

- **Campaign Management System** - Full CRUD operations for campaigns
- **AI Dungeon Master** - GPT-4 powered DM with context-aware responses
- **Interactive Gameplay** - Text-based D&D sessions with real-time AI responses
- **Dice Rolling System** - Complete D&D 5e mechanics with advantage/disadvantage
- **Game State Persistence** - All actions and campaign progress saved
- **Scene Management** - Dynamic NPCs, locations, and action choices
- **Character Integration** - Full character stats available during gameplay

### 📋 Planned (Phase 4+)

- Advanced AI features and dynamic story generation
- Combat system with turn-based mechanics  
- Character progression and leveling
- Spell and ability usage tracking
- Multi-player campaign support
- Voice integration for immersive gameplay

## 🛠️ Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
npm run format        # Format code with Prettier

npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed D&D 5e reference data
npm run db:reset      # Reset database and reseed
npm run db:studio     # Open Prisma Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and ensure tests pass
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎲 About D&D 5e

This application implements official Dungeons & Dragons 5th Edition rules and content. D&D is a trademark of Wizards of the Coast. This project is not affiliated with or endorsed by Wizards of the Coast.

## 🔗 Related Documentation

- [Project Specification](docs/dnd-project-spec.md) - Detailed technical specifications
- [API Documentation](PROJECT_OVERVIEW.md) - Complete API reference and examples
- [Prisma Schema](prisma/schema.prisma) - Database schema definition

---

Built with ❤️ using Next.js, OpenAI, and the power of AI-assisted development.
