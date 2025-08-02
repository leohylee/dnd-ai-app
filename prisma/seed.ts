import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

interface SeedProgress {
  total: number
  processed: number
  errors: number
}

// Utility function to safely read and parse JSON files
function readJsonFile<T>(filePath: string): T {
  try {
    const data = readFileSync(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch (error) {
    throw new Error(`Failed to read or parse ${filePath}: ${error}`)
  }
}

// Log progress with formatting
function logProgress(category: string, progress: SeedProgress) {
  const percentage = Math.round((progress.processed / progress.total) * 100)
  console.log(
    `📊 ${category}: ${progress.processed}/${progress.total} (${percentage}%) - Errors: ${progress.errors}`
  )
}

// Seed races data
async function seedRaces() {
  console.log('🏃 Seeding races...')
  const racesPath = join(process.cwd(), 'data', 'dnd5e', 'races.json')
  const racesData = readJsonFile<Record<string, any>>(racesPath)

  const raceEntries = Object.entries(racesData)
  const progress: SeedProgress = {
    total: raceEntries.length,
    processed: 0,
    errors: 0,
  }

  for (const [raceId, raceData] of raceEntries) {
    try {
      await prisma.referenceData.upsert({
        where: {
          type_name: {
            type: 'race',
            name: raceData.name || raceId,
          },
        },
        create: {
          type: 'race',
          name: raceData.name || raceId,
          data: raceData,
        },
        update: {
          data: raceData,
        },
      })
      progress.processed++
    } catch (error) {
      console.error(`❌ Error seeding race ${raceId}:`, error)
      progress.errors++
    }
  }

  logProgress('Races', progress)
  return progress
}

// Seed classes data
async function seedClasses() {
  console.log('⚔️ Seeding classes...')
  const classesPath = join(process.cwd(), 'data', 'dnd5e', 'classes.json')
  const classesData = readJsonFile<Record<string, any>>(classesPath)

  const classEntries = Object.entries(classesData)
  const progress: SeedProgress = {
    total: classEntries.length,
    processed: 0,
    errors: 0,
  }

  for (const [classId, classData] of classEntries) {
    try {
      await prisma.referenceData.upsert({
        where: {
          type_name: {
            type: 'class',
            name: classData.name || classId,
          },
        },
        create: {
          type: 'class',
          name: classData.name || classId,
          data: classData,
        },
        update: {
          data: classData,
        },
      })
      progress.processed++
    } catch (error) {
      console.error(`❌ Error seeding class ${classId}:`, error)
      progress.errors++
    }
  }

  logProgress('Classes', progress)
  return progress
}

// Seed spells data
async function seedSpells() {
  console.log('✨ Seeding spells...')
  const spellsPath = join(
    process.cwd(),
    'data',
    'dnd5e',
    'spells-complete.json'
  )
  const spellsData = readJsonFile<any[]>(spellsPath)

  const progress: SeedProgress = {
    total: spellsData.length,
    processed: 0,
    errors: 0,
  }

  for (const spell of spellsData) {
    try {
      if (!spell.name) {
        console.warn(`⚠️ Skipping spell without name:`, spell)
        progress.errors++
        continue
      }

      await prisma.referenceData.upsert({
        where: {
          type_name: {
            type: 'spell',
            name: spell.name,
          },
        },
        create: {
          type: 'spell',
          name: spell.name,
          data: spell,
        },
        update: {
          data: spell,
        },
      })
      progress.processed++
    } catch (error) {
      console.error(`❌ Error seeding spell ${spell.name || 'unknown'}:`, error)
      progress.errors++
    }
  }

  logProgress('Spells', progress)
  return progress
}

// Seed backgrounds data
async function seedBackgrounds() {
  console.log('📚 Seeding backgrounds...')
  const backgroundsPath = join(
    process.cwd(),
    'data',
    'dnd5e',
    'backgrounds.json'
  )
  const backgroundsData = readJsonFile<any[]>(backgroundsPath)

  const progress: SeedProgress = {
    total: backgroundsData.length,
    processed: 0,
    errors: 0,
  }

  for (const background of backgroundsData) {
    try {
      if (!background.name) {
        console.warn(`⚠️ Skipping background without name:`, background)
        progress.errors++
        continue
      }

      await prisma.referenceData.upsert({
        where: {
          type_name: {
            type: 'background',
            name: background.name,
          },
        },
        create: {
          type: 'background',
          name: background.name,
          data: background,
        },
        update: {
          data: background,
        },
      })
      progress.processed++
    } catch (error) {
      console.error(
        `❌ Error seeding background ${background.name || 'unknown'}:`,
        error
      )
      progress.errors++
    }
  }

  logProgress('Backgrounds', progress)
  return progress
}

// Seed equipment data
async function seedEquipment() {
  console.log('🛡️ Seeding equipment...')
  const equipmentPath = join(process.cwd(), 'data', 'dnd5e', 'equipment.json')

  try {
    const equipmentData = readJsonFile<any>(equipmentPath)

    // Handle both object and array formats
    let equipmentEntries: [string, any][] = []

    if (Array.isArray(equipmentData)) {
      equipmentEntries = equipmentData.map((item, index) => [
        item.name || `item_${index}`,
        item,
      ])
    } else if (typeof equipmentData === 'object') {
      equipmentEntries = Object.entries(equipmentData)
    } else {
      throw new Error('Equipment data is neither an array nor an object')
    }

    const progress: SeedProgress = {
      total: equipmentEntries.length,
      processed: 0,
      errors: 0,
    }

    for (const [equipmentId, equipmentItem] of equipmentEntries) {
      try {
        const itemName = equipmentItem.name || equipmentId

        if (!itemName) {
          console.warn(`⚠️ Skipping equipment without name:`, equipmentItem)
          progress.errors++
          continue
        }

        await prisma.referenceData.upsert({
          where: {
            type_name: {
              type: 'equipment',
              name: itemName,
            },
          },
          create: {
            type: 'equipment',
            name: itemName,
            data: equipmentItem,
          },
          update: {
            data: equipmentItem,
          },
        })
        progress.processed++
      } catch (error) {
        console.error(`❌ Error seeding equipment ${equipmentId}:`, error)
        progress.errors++
      }
    }

    logProgress('Equipment', progress)
    return progress
  } catch (error) {
    console.error('❌ Failed to seed equipment:', error)
    return { total: 0, processed: 0, errors: 1 }
  }
}

// Seed skills data (if available)
async function seedSkills() {
  console.log('🎯 Seeding skills...')
  const skillsPath = join(process.cwd(), 'data', 'dnd5e', 'skills.json')

  try {
    const skillsData = readJsonFile<any>(skillsPath)

    // Handle both object and array formats
    let skillEntries: [string, any][] = []

    if (Array.isArray(skillsData)) {
      skillEntries = skillsData.map((skill, index) => [
        skill.name || `skill_${index}`,
        skill,
      ])
    } else if (typeof skillsData === 'object') {
      skillEntries = Object.entries(skillsData)
    } else {
      throw new Error('Skills data is neither an array nor an object')
    }

    const progress: SeedProgress = {
      total: skillEntries.length,
      processed: 0,
      errors: 0,
    }

    for (const [skillId, skillData] of skillEntries) {
      try {
        const skillName = skillData.name || skillId

        if (!skillName) {
          console.warn(`⚠️ Skipping skill without name:`, skillData)
          progress.errors++
          continue
        }

        await prisma.referenceData.upsert({
          where: {
            type_name: {
              type: 'skill',
              name: skillName,
            },
          },
          create: {
            type: 'skill',
            name: skillName,
            data: skillData,
          },
          update: {
            data: skillData,
          },
        })
        progress.processed++
      } catch (error) {
        console.error(`❌ Error seeding skill ${skillId}:`, error)
        progress.errors++
      }
    }

    logProgress('Skills', progress)
    return progress
  } catch (error) {
    console.error('❌ Failed to seed skills:', error)
    return { total: 0, processed: 0, errors: 1 }
  }
}

// Main seed function
async function main() {
  console.log('🌱 Starting D&D 5e database seeding...')
  console.log('==================================================')

  const startTime = Date.now()
  const results: Record<string, SeedProgress> = {}

  try {
    // Run all seeding operations
    results.races = await seedRaces()
    results.classes = await seedClasses()
    results.spells = await seedSpells()
    results.backgrounds = await seedBackgrounds()
    results.equipment = await seedEquipment()
    results.skills = await seedSkills()

    // Calculate totals
    const totalItems = Object.values(results).reduce(
      (sum, result) => sum + result.total,
      0
    )
    const totalProcessed = Object.values(results).reduce(
      (sum, result) => sum + result.processed,
      0
    )
    const totalErrors = Object.values(results).reduce(
      (sum, result) => sum + result.errors,
      0
    )

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log('==================================================')
    console.log('✅ Seeding completed!')
    console.log(`📊 Total items: ${totalItems}`)
    console.log(`✅ Successfully processed: ${totalProcessed}`)
    console.log(`❌ Errors: ${totalErrors}`)
    console.log(`⏱️ Duration: ${duration}s`)

    if (totalErrors > 0) {
      console.log(
        '⚠️ Some items failed to seed. Check the logs above for details.'
      )
      process.exit(1)
    } else {
      console.log('🎉 All D&D 5e reference data has been successfully seeded!')
    }
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error)
    process.exit(1)
  }
}

// Run the seed script
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error('💥 Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
