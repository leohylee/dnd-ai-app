# D&D AI Web Application

An AI-powered D&D 5e web application built with Next.js, featuring intelligent character creation with OpenAI integration and comprehensive D&D 5e reference data.

## ✨ Features

### 🎲 Character Creation
- **AI-Powered Background Generation** - Create rich, lore-appropriate character backstories
- **Smart Ability Score Recommendations** - Get optimized stat distributions for your class
- **Personality Trait Suggestions** - AI-generated traits based on race, class, and background
- **Point-Buy Validation** - Ensures legal D&D 5e character builds
- **Complete Stat Calculations** - Automatic HP, AC, proficiency bonus, and racial bonus calculations

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
    },
    "useAiBackground": true
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
├── app/api/                  # API routes
│   ├── ai/                   # AI assistance endpoints
│   ├── characters/           # Character CRUD
│   └── reference/            # D&D 5e reference data
├── components/               # React components
├── data/dnd5e/              # D&D 5e JSON data files
├── lib/
│   ├── ai/                   # OpenAI service
│   ├── utils/                # Character calculations
│   └── validations/          # Zod schemas
├── prisma/                   # Database schema & migrations
├── types/                    # TypeScript definitions
└── docs/                     # Documentation
```

## 🎯 Implementation Status

### ✅ Completed (Phase 1)
- Character creation API with AI assistance
- D&D 5e reference database (250+ items)
- OpenAI integration for background/trait generation
- PostgreSQL database with Prisma
- Type-safe APIs with Zod validation
- Character stat calculations and point-buy validation

### 🔄 In Progress (Phase 2)
- Frontend character creation UI
- React components for reference data browsing

### 📋 Planned (Phase 3+)
- Campaign management system
- AI Dungeon Master interactions
- Dice rolling mechanics
- Combat system
- Character progression

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