import OpenAI from 'openai'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Function to generate data in chunks
async function generateDataInChunks(prompts, filename, combineResults = true) {
  console.log(`Generating ${filename}...`)

  const results = []

  for (let i = 0; i < prompts.length; i++) {
    console.log(`  Processing chunk ${i + 1}/${prompts.length}...`)

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a D&D 5e expert. Generate accurate JSON data based on official PHB rules. . Output only valid JSON array, no markdown, no code blocks, no explanations, no markdown formatting, just raw JSON.',
          },
          {
            role: 'user',
            content: prompts[i],
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      })

      let jsonStr = completion.choices[0].message.content.trim()

      const jsonData = JSON.parse(jsonStr)

      if (combineResults) {
        results.push(...jsonData)
      } else {
        Object.assign(results, jsonData)
      }

      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1500))
    } catch (error) {
      console.error(`  Error in chunk ${i + 1}:`, error.message)
    }
  }

  // Ensure data directory exists
  await fs.mkdir('data/dnd5e', { recursive: true })

  // Save the file
  const finalData = combineResults ? results : results
  await fs.writeFile(
    path.join('data/dnd5e', filename),
    JSON.stringify(finalData, null, 2),
    'utf8'
  )

  console.log(
    `✓ Generated ${filename} with ${combineResults ? results.length : Object.keys(results).length} items`
  )
  return finalData
}

// Generate Spells
async function generateSpells() {
  const spellPrompts = [
    // Cantrips
    `Generate a JSON array of ALL D&D 5e PHB cantrips. Include every single cantrip from the Player's Handbook. Each spell must have this exact structure:
    {
      "name": "Spell Name",
      "level": 0,
      "school": "School of Magic",
      "castingTime": "1 action",
      "range": "range",
      "components": ["V", "S", "M"],
      "material": "material components if any",
      "duration": "duration",
      "description": "full spell description",
      "classes": ["Class1", "Class2"],
      "damage": "damage dice if applicable",
      "damageType": "damage type if applicable",
      "savingThrow": "ability if applicable"
    }
    Include: Acid Splash, Blade Ward, Chill Touch, Dancing Lights, Druidcraft, Eldritch Blast, Fire Bolt, Friends, Guidance, Light, Mage Hand, Mending, Message, Minor Illusion, Poison Spray, Prestidigitation, Produce Flame, Ray of Frost, Resistance, Sacred Flame, Shillelagh, Shocking Grasp, Spare the Dying, Thaumaturgy, Thorn Whip, True Strike, Vicious Mockery`,

    // Level 1 spells
    `Generate a JSON array of ALL D&D 5e PHB 1st level spells. Include every single 1st level spell. Each spell must have this structure:
    {
      "name": "Spell Name",
      "level": 1,
      "school": "School of Magic",
      "castingTime": "casting time",
      "range": "range",
      "components": ["V", "S", "M"],
      "material": "material components if any",
      "duration": "duration",
      "description": "full spell description",
      "concentration": true/false,
      "ritual": true/false,
      "classes": ["Class1", "Class2"]
    }
    Include: Alarm, Animal Friendship, Armor of Agathys, Arms of Hadar, Bane, Bless, Burning Hands, Charm Person, Chromatic Orb, Color Spray, Command, Compelled Duel, Comprehend Languages, Create or Destroy Water, Cure Wounds, Detect Evil and Good, Detect Magic, Detect Poison and Disease, Disguise Self, Dissonant Whispers, Divine Favor, Ensnaring Strike, Entangle, Expeditious Retreat, Faerie Fire, False Life, Feather Fall, Find Familiar, Fog Cloud, Goodberry, Grease, Guiding Bolt, Hail of Thorns, Healing Word, Hellish Rebuke, Heroism, Hex, Hunter's Mark, Identify, Illusory Script, Inflict Wounds, Jump, Longstrider, Mage Armor, Magic Missile, Protection from Evil and Good, Purify Food and Drink, Ray of Sickness, Sanctuary, Searing Smite, Shield, Shield of Faith, Silent Image, Sleep, Speak with Animals, Tasha's Hideous Laughter, Tenser's Floating Disk, Thunderous Smite, Thunderwave, Unseen Servant, Witch Bolt, Wrathful Smite`,

    // Level 2 spells
    `Generate a JSON array of D&D 5e PHB 2nd level spells. Include all spells. Each spell must have complete details including all components, ranges, durations, and full descriptions.`,

    // Level 3 spells
    `Generate a JSON array of D&D 5e PHB 3rd level spells. Include all spells including Fireball, Counterspell, Haste, Fly, Lightning Bolt, and others. Include complete spell details.`,
  ]

  return await generateDataInChunks(spellPrompts, 'spells.json', true)
}

// Main function
async function generateAllData() {
  try {
    console.log('Starting D&D 5e data generation...\n')

    // Generate spells
    await generateSpells()

    console.log('\n✅ All data generation complete!')
    console.log('Files created in data/dnd5e/')
  } catch (error) {
    console.error('Error generating data:', error)
  }
}

// Run the generation
generateAllData()
