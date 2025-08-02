import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAbilityScoreUtils() {
  console.log('Generating ability score utilities...');
  
  const prompt = `Create a complete TypeScript module for D&D 5e ability score calculations. The file should include:

1. Type definitions for:
   - AbilityScores object (str, dex, con, int, wis, cha)
   - Ability type union ('strength' | 'dexterity' | etc.)
   - SkillName type with all D&D 5e skills
   - Skill to ability mapping

2. Core functions:
   - getAbilityModifier(score: number): number
     Calculate modifier from ability score using formula: Math.floor((score - 10) / 2)
   
   - getAllModifiers(scores: AbilityScores): Record<Ability, number>
     Return all six ability modifiers for a character
   
   - getProficiencyBonus(level: number): number
     Return proficiency bonus: +2 (levels 1-4), +3 (5-8), +4 (9-12), +5 (13-16), +6 (17-20)
   
   - getSkillModifier(params: { abilityScore: number, proficiencyBonus: number, isProficient: boolean, hasExpertise?: boolean }): number
     Calculate total skill modifier including expertise (double proficiency)
   
   - getAbilityForSkill(skill: SkillName): Ability
     Return which ability score a skill uses

3. Additional utilities:
   - getInitiativeBonus(dexterityScore: number): number
   - getPassivePerception(wisdomScore: number, proficiencyBonus: number, isProficient: boolean): number
   - getSavingThrowModifier (same params as getSkillModifier)
   - getSpellSaveDC(abilityScore: number, proficiencyBonus: number): number (8 + prof + ability mod)
   - getSpellAttackBonus(abilityScore: number, proficiencyBonus: number): number

4. Constants:
   - SKILL_ABILITY_MAP object mapping each skill to its ability
   - MIN_ABILITY_SCORE = 1
   - MAX_ABILITY_SCORE = 30
   - BASE_SPELL_DC = 8

Include JSDoc comments explaining D&D 5e rules for each function.
Export all functions and types.
Use proper TypeScript with strict typing.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert TypeScript developer and D&D 5e rules expert. Generate clean, well-documented TypeScript code following best practices. Output only the code content, no markdown formatting or explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    let code = completion.choices[0].message.content.trim();
    
    // Clean up any markdown formatting
    code = code
      .replace(/^```typescript\s*\n?/, '')
      .replace(/^```ts\s*\n?/, '')
      .replace(/^```\s*\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    // Ensure directories exist
    await fs.mkdir('lib/game-engine', { recursive: true });
    
    // Save the file
    const filePath = path.join('lib/game-engine', 'ability-scores.ts');
    await fs.writeFile(filePath, code, 'utf8');
    
    console.log(`✓ Generated ${filePath}`);
    console.log('  Functions included:');
    console.log('  - getAbilityModifier()');
    console.log('  - getAllModifiers()');
    console.log('  - getProficiencyBonus()');
    console.log('  - getSkillModifier()');
    console.log('  - getAbilityForSkill()');
    console.log('  - Plus additional D&D utilities');
    
  } catch (error) {
    console.error('Error generating ability score utilities:', error);
    
    // If token limit is hit, try a simpler version
    console.log('\nTrying with reduced scope...');
    await generateSimplifiedVersion();
  }
}

async function generateSimplifiedVersion() {
  const simplifiedPrompt = `Create a TypeScript module with essential D&D 5e ability score calculations:

// Types
type AbilityScores = { strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number; }
type Ability = keyof AbilityScores;

// Core function: Calculate modifier from ability score
function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Get all modifiers for a character
function getAllModifiers(scores: AbilityScores): Record<Ability, number>

// Get proficiency bonus by level
function getProficiencyBonus(level: number): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
}

// Calculate skill modifier
function getSkillModifier({ abilityScore, proficiencyBonus, isProficient, hasExpertise }: SkillModifierParams): number

Include other essential functions and export all.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Generate TypeScript code for D&D 5e calculations. Output only code."
        },
        {
          role: "user",
          content: simplifiedPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    let code = completion.choices[0].message.content.trim();
    code = code.replace(/^```[a-z]*\s*\n?/, '').replace(/\n?```$/, '').trim();

    const filePath = path.join('lib/game-engine', 'ability-scores.ts');
    await fs.writeFile(filePath, code, 'utf8');
    
    console.log(`✓ Generated simplified ${filePath}`);
    
  } catch (error) {
    console.error('Error generating simplified version:', error);
  }
}

// Run the generation
generateAbilityScoreUtils();