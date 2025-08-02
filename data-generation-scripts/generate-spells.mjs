import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Pre-defined spell data structure to ensure consistency
const spellTemplate = {
  cantrips: [
    "Acid Splash", "Blade Ward", "Chill Touch", "Dancing Lights", "Druidcraft",
    "Eldritch Blast", "Fire Bolt", "Friends", "Guidance", "Light",
    "Mage Hand", "Mending", "Message", "Minor Illusion", "Poison Spray",
    "Prestidigitation", "Produce Flame", "Ray of Frost", "Resistance", "Sacred Flame",
    "Shillelagh", "Shocking Grasp", "Spare the Dying", "Thaumaturgy", "Thorn Whip",
    "True Strike", "Vicious Mockery"
  ],
  level1: [
    "Alarm", "Animal Friendship", "Armor of Agathys", "Arms of Hadar", "Bane",
    "Bless", "Burning Hands", "Charm Person", "Chromatic Orb", "Color Spray",
    "Command", "Compelled Duel", "Comprehend Languages", "Create or Destroy Water",
    "Cure Wounds", "Detect Evil and Good", "Detect Magic", "Detect Poison and Disease",
    "Disguise Self", "Dissonant Whispers", "Divine Favor", "Ensnaring Strike",
    "Entangle", "Expeditious Retreat", "Faerie Fire", "False Life", "Feather Fall",
    "Find Familiar", "Fog Cloud", "Goodberry", "Grease", "Guiding Bolt",
    "Hail of Thorns", "Healing Word", "Hellish Rebuke", "Heroism", "Hex",
    "Hunter's Mark", "Identify", "Illusory Script", "Inflict Wounds", "Jump",
    "Longstrider", "Mage Armor", "Magic Missile", "Protection from Evil and Good",
    "Purify Food and Drink", "Ray of Sickness", "Sanctuary", "Searing Smite",
    "Shield", "Shield of Faith", "Silent Image", "Sleep", "Speak with Animals",
    "Tasha's Hideous Laughter", "Tenser's Floating Disk", "Thunderous Smite",
    "Thunderwave", "Unseen Servant", "Witch Bolt", "Wrathful Smite"
  ],
  level2: [
    "Acid Arrow", "Aid", "Alter Self", "Animal Messenger", "Arcane Lock",
    "Augury", "Barkskin", "Beast Sense", "Blindness/Deafness", "Blur",
    "Branding Smite", "Calm Emotions", "Cloud of Daggers", "Continual Flame",
    "Cordon of Arrows", "Crown of Madness", "Darkness", "Darkvision",
    "Detect Thoughts", "Enhance Ability", "Enlarge/Reduce", "Enthrall",
    "Find Steed", "Find Traps", "Flame Blade", "Flaming Sphere", "Gentle Repose",
    "Gust of Wind", "Heat Metal", "Hold Person", "Invisibility", "Knock",
    "Lesser Restoration", "Levitate", "Locate Animals or Plants", "Locate Object",
    "Magic Mouth", "Magic Weapon", "Mirror Image", "Misty Step", "Moonbeam",
    "Pass without Trace", "Prayer of Healing", "Protection from Poison",
    "Ray of Enfeeblement", "Rope Trick", "Scorching Ray", "See Invisibility",
    "Shatter", "Silence", "Spider Climb", "Spike Growth", "Spiritual Weapon",
    "Suggestion", "Warding Bond", "Web", "Zone of Truth"
  ],
  level3: [
    "Animate Dead", "Aura of Vitality", "Beacon of Hope", "Bestow Curse",
    "Blink", "Call Lightning", "Clairvoyance", "Conjure Animals", "Conjure Barrage",
    "Counterspell", "Create Food and Water", "Crusader's Mantle", "Daylight",
    "Dispel Magic", "Elemental Weapon", "Fear", "Feign Death", "Fireball",
    "Fly", "Gaseous Form", "Glyph of Warding", "Haste", "Hunger of Hadar",
    "Hypnotic Pattern", "Lightning Arrow", "Lightning Bolt", "Magic Circle",
    "Major Image", "Mass Healing Word", "Meld into Stone", "Nondetection",
    "Phantom Steed", "Plant Growth", "Protection from Energy", "Remove Curse",
    "Revivify", "Sending", "Sleet Storm", "Slow", "Speak with Dead",
    "Speak with Plants", "Spirit Guardians", "Stinking Cloud", "Tiny Hut",
    "Tongues", "Vampiric Touch", "Water Breathing", "Water Walk", "Wind Wall"
  ]
};

async function generateSpellDetails(spellName, level) {
  const prompt = `For the D&D 5e spell "${spellName}" (level ${level}), provide ONLY these details in a simple format:
School: [school name]
Casting Time: [time]
Range: [range]
Components: [V, S, M]
Duration: [duration]
Classes: [comma-separated list]
Description: [one paragraph description]`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a D&D 5e expert. Provide accurate spell information in the exact format requested. Be concise."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;

    console.log(spellName + ": " + response);
    
    // Parse the response into a spell object
    const lines = response.split('\n');
    const spell = {
      name: spellName,
      level: level,
      school: "",
      castingTime: "",
      range: "",
      components: [],
      duration: "",
      classes: [],
      description: ""
    };

    lines.forEach(line => {
      if (line.startsWith('School:')) {
        spell.school = line.replace('School:', '').trim();
      } else if (line.startsWith('Casting Time:')) {
        spell.castingTime = line.replace('Casting Time:', '').trim();
      } else if (line.startsWith('Range:')) {
        spell.range = line.replace('Range:', '').trim();
      } else if (line.startsWith('Components:')) {
        const components = line.replace('Components:', '').trim();
        spell.components = components.split(',').map(c => c.trim()).filter(c => ['V', 'S', 'M'].includes(c));
      } else if (line.startsWith('Duration:')) {
        spell.duration = line.replace('Duration:', '').trim();
      } else if (line.startsWith('Classes:')) {
        spell.classes = line.replace('Classes:', '').trim().split(',').map(c => c.trim());
      } else if (line.startsWith('Description:')) {
        spell.description = line.replace('Description:', '').trim();
      }
    });

    return spell;
  } catch (error) {
    console.error(`Error generating ${spellName}:`, error.message);
    return null;
  }
}

async function generateAllSpells() {
  console.log('Generating spell data using individual API calls...\n');
  
  const allSpells = [];
  let successCount = 0;
  let failureCount = 0;

  // Process each spell level
  for (const [levelKey, spellNames] of Object.entries(spellTemplate)) {
    const level = levelKey === 'cantrips' ? 0 : parseInt(levelKey.replace('level', ''));
    console.log(`Processing Level ${level} spells (${spellNames.length} spells)...`);
    
    for (let i = 0; i < spellNames.length; i++) {
      const spellName = spellNames[i];
      process.stdout.write(`  [${i + 1}/${spellNames.length}] ${spellName}... `);
      
      const spell = await generateSpellDetails(spellName, level);
      
      if (spell && spell.school && spell.description) {
        allSpells.push(spell);
        successCount++;
        console.log('✓');
      } else {
        failureCount++;
        console.log('✗');
      }
      
      // Rate limiting - adjust delay as needed
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`  Completed Level ${level}\n`);
  }

  // Sort spells by level and name
  allSpells.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  });

  // Save to file
  await fs.mkdir('data/dnd5e', { recursive: true });
  await fs.writeFile(
    path.join('data/dnd5e', 'spells-complete.json'),
    JSON.stringify(allSpells, null, 2),
    'utf8'
  );

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Total spells processed: ${spellNames.length}`);
  console.log(`Successfully generated: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log(`\nSpells saved to: data/dnd5e/spells-complete.json`);
  
  // Count by level
  const byLevel = {};
  allSpells.forEach(spell => {
    byLevel[spell.level] = (byLevel[spell.level] || 0) + 1;
  });
  
  console.log('\nSpells by level:');
  Object.entries(byLevel).forEach(([level, count]) => {
    console.log(`  Level ${level}: ${count} spells`);
  });
}

// Alternative: Generate a basic spell list without API calls
async function generateBasicSpellList() {
  console.log('\nGenerating basic spell list (no API calls)...');
  
  const basicSpells = [];
  
  // Add all spell names with minimal data
  Object.entries(spellTemplate).forEach(([levelKey, spellNames]) => {
    const level = levelKey === 'cantrips' ? 0 : parseInt(levelKey.replace('level', ''));
    
    spellNames.forEach(name => {
      basicSpells.push({
        name,
        level,
        school: "Unknown",
        castingTime: "1 action",
        range: "Varies",
        components: ["V", "S"],
        duration: "Varies",
        classes: ["Multiple"],
        description: `${name} is a level ${level} spell. Details to be added.`
      });
    });
  });

  await fs.mkdir('data/dnd5e', { recursive: true });
  await fs.writeFile(
    path.join('data/dnd5e', 'spells-basic.json'),
    JSON.stringify(basicSpells, null, 2),
    'utf8'
  );
  
  console.log(`✓ Created spells-basic.json with ${basicSpells.length} spell entries`);
}

// Main execution
async function main() {
  console.log('D&D 5e Spell Generator\n');
  console.log('This will make many API calls (one per spell).');
  console.log('Estimated time: ~10-15 minutes for all spells');
  console.log('Cost estimate: ~$0.10-0.20\n');
  
  // Check if we should proceed
  const args = process.argv.slice(2);
  
  if (args.includes('--basic')) {
    // Just generate the basic list without API calls
    await generateBasicSpellList();
  } else if (args.includes('--yes')) {
    // Skip confirmation
    await generateAllSpells();
  } else {
    console.log('To proceed with API calls, run with: node generate-spells-simple.mjs --yes');
    console.log('To generate basic list only, run with: node generate-spells-simple.mjs --basic');
  }
}

main().catch(console.error);