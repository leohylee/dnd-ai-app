import { NextRequest, NextResponse } from 'next/server'
import { Dice, DiceType } from '@/lib/utils/dice-utils'
import { z } from 'zod'

const diceRollSchema = z.object({
  diceType: z.enum(['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']),
  count: z.number().min(1).max(20).optional(),
  modifier: z.number().min(-50).max(50).optional(),
  advantage: z.boolean().optional(),
  disadvantage: z.boolean().optional(),
  purpose: z.string().max(100).optional(),
  skill: z.string().max(50).optional(),
})

const abilityCheckSchema = z.object({
  type: z.literal('ability_check'),
  abilityScore: z.number().min(1).max(30),
  proficiencyBonus: z.number().min(0).max(10).optional(),
  advantage: z.boolean().optional(),
  disadvantage: z.boolean().optional(),
  purpose: z.string().max(100).optional(),
})

const skillCheckSchema = z.object({
  type: z.literal('skill_check'),
  skillName: z.string().min(1).max(50),
  abilityScore: z.number().min(1).max(30),
  isProficient: z.boolean().optional(),
  proficiencyBonus: z.number().min(0).max(10).optional(),
  advantage: z.boolean().optional(),
  disadvantage: z.boolean().optional(),
})

const savingThrowSchema = z.object({
  type: z.literal('saving_throw'),
  abilityScore: z.number().min(1).max(30),
  isProficient: z.boolean().optional(),
  proficiencyBonus: z.number().min(0).max(10).optional(),
  advantage: z.boolean().optional(),
  disadvantage: z.boolean().optional(),
  purpose: z.string().max(100).optional(),
})

const attackRollSchema = z.object({
  type: z.literal('attack'),
  abilityScore: z.number().min(1).max(30),
  proficiencyBonus: z.number().min(0).max(10).optional(),
  advantage: z.boolean().optional(),
  disadvantage: z.boolean().optional(),
})

const damageRollSchema = z.object({
  type: z.literal('damage'),
  diceType: z.enum(['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']),
  count: z.number().min(1).max(20).optional(),
  modifier: z.number().min(-50).max(50).optional(),
  damageType: z.string().max(50).optional(),
})

const initiativeRollSchema = z.object({
  type: z.literal('initiative'),
  dexterityScore: z.number().min(1).max(30),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Determine roll type and validate accordingly
    if (body.type) {
      let result

      switch (body.type) {
        case 'ability_check':
          const abilityValidation = abilityCheckSchema.safeParse(body)
          if (!abilityValidation.success) {
            return NextResponse.json(
              {
                error: `Validation error: ${abilityValidation.error.issues.map(i => i.message).join(', ')}`,
              },
              { status: 400 }
            )
          }
          result = Dice.rollAbilityCheck(
            abilityValidation.data.abilityScore,
            abilityValidation.data.proficiencyBonus,
            {
              advantage: abilityValidation.data.advantage,
              disadvantage: abilityValidation.data.disadvantage,
              purpose: abilityValidation.data.purpose,
            }
          )
          break

        case 'skill_check':
          const skillValidation = skillCheckSchema.safeParse(body)
          if (!skillValidation.success) {
            return NextResponse.json(
              {
                error: `Validation error: ${skillValidation.error.issues.map(i => i.message).join(', ')}`,
              },
              { status: 400 }
            )
          }
          result = Dice.rollSkillCheck(
            skillValidation.data.skillName,
            skillValidation.data.abilityScore,
            skillValidation.data.isProficient,
            skillValidation.data.proficiencyBonus,
            {
              advantage: skillValidation.data.advantage,
              disadvantage: skillValidation.data.disadvantage,
            }
          )
          break

        case 'saving_throw':
          const saveValidation = savingThrowSchema.safeParse(body)
          if (!saveValidation.success) {
            return NextResponse.json(
              {
                error: `Validation error: ${saveValidation.error.issues.map(i => i.message).join(', ')}`,
              },
              { status: 400 }
            )
          }
          result = Dice.rollSavingThrow(
            saveValidation.data.abilityScore,
            saveValidation.data.isProficient,
            saveValidation.data.proficiencyBonus,
            {
              advantage: saveValidation.data.advantage,
              disadvantage: saveValidation.data.disadvantage,
              purpose: saveValidation.data.purpose,
            }
          )
          break

        case 'attack':
          const attackValidation = attackRollSchema.safeParse(body)
          if (!attackValidation.success) {
            return NextResponse.json(
              {
                error: `Validation error: ${attackValidation.error.issues.map(i => i.message).join(', ')}`,
              },
              { status: 400 }
            )
          }
          result = Dice.rollAttack(
            attackValidation.data.abilityScore,
            attackValidation.data.proficiencyBonus,
            {
              advantage: attackValidation.data.advantage,
              disadvantage: attackValidation.data.disadvantage,
            }
          )
          break

        case 'damage':
          const damageValidation = damageRollSchema.safeParse(body)
          if (!damageValidation.success) {
            return NextResponse.json(
              {
                error: `Validation error: ${damageValidation.error.issues.map(i => i.message).join(', ')}`,
              },
              { status: 400 }
            )
          }
          result = Dice.rollDamage(
            damageValidation.data.diceType,
            damageValidation.data.count,
            damageValidation.data.modifier,
            damageValidation.data.damageType
          )
          break

        case 'initiative':
          const initiativeValidation = initiativeRollSchema.safeParse(body)
          if (!initiativeValidation.success) {
            return NextResponse.json(
              {
                error: `Validation error: ${initiativeValidation.error.issues.map(i => i.message).join(', ')}`,
              },
              { status: 400 }
            )
          }
          result = Dice.rollInitiative(initiativeValidation.data.dexterityScore)
          break

        default:
          return NextResponse.json(
            { error: 'Invalid roll type' },
            { status: 400 }
          )
      }

      return NextResponse.json({
        success: true,
        roll: result,
        formatted: Dice.formatRoll(result),
      })
    } else {
      // Simple dice roll
      const validation = diceRollSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            error: `Validation error: ${validation.error.issues.map(i => i.message).join(', ')}`,
          },
          { status: 400 }
        )
      }

      const result = Dice.roll(validation.data.diceType, {
        count: validation.data.count,
        modifier: validation.data.modifier,
        advantage: validation.data.advantage,
        disadvantage: validation.data.disadvantage,
        purpose: validation.data.purpose,
        skill: validation.data.skill,
      })

      return NextResponse.json({
        success: true,
        roll: result,
        formatted: Dice.formatRoll(result),
      })
    }
  } catch (error) {
    console.error('Error in dice roll endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
