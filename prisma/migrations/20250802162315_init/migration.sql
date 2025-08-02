-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "raceData" JSONB NOT NULL,
    "class" TEXT NOT NULL,
    "classData" JSONB NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "stats" JSONB NOT NULL,
    "hp" JSONB NOT NULL,
    "ac" INTEGER NOT NULL DEFAULT 10,
    "proficiencyBonus" INTEGER NOT NULL DEFAULT 2,
    "skills" JSONB NOT NULL,
    "inventory" JSONB NOT NULL,
    "spells" JSONB,
    "background" TEXT NOT NULL,
    "alignment" TEXT NOT NULL,
    "backstory" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "characterId" TEXT NOT NULL,
    "currentScene" JSONB NOT NULL,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_events" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "playerAction" TEXT,
    "dmResponse" TEXT,
    "diceRolls" JSONB,
    "eventData" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_states" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "currentLocation" TEXT NOT NULL,
    "activeQuests" JSONB NOT NULL,
    "completedQuests" JSONB NOT NULL,
    "partyInventory" JSONB NOT NULL,
    "flags" JSONB NOT NULL,
    "variables" JSONB NOT NULL,
    "combatState" JSONB,
    "knownNPCs" JSONB NOT NULL,
    "npcRelationships" JSONB NOT NULL,
    "sessionSummary" TEXT,
    "keyEvents" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_contexts" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "conversationLog" JSONB NOT NULL,
    "contextSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_data" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "reference_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaigns_characterId_idx" ON "campaigns"("characterId");

-- CreateIndex
CREATE INDEX "game_events_campaignId_idx" ON "game_events"("campaignId");

-- CreateIndex
CREATE INDEX "game_events_timestamp_idx" ON "game_events"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "game_states_campaignId_key" ON "game_states"("campaignId");

-- CreateIndex
CREATE INDEX "ai_contexts_campaignId_idx" ON "ai_contexts"("campaignId");

-- CreateIndex
CREATE INDEX "reference_data_type_idx" ON "reference_data"("type");

-- CreateIndex
CREATE UNIQUE INDEX "reference_data_type_name_key" ON "reference_data"("type", "name");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_events" ADD CONSTRAINT "game_events_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_states" ADD CONSTRAINT "game_states_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
