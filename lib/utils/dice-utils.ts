import type { DiceRoll } from '@/types/campaign'

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export interface RollOptions {
  count?: number
  modifier?: number
  advantage?: boolean
  disadvantage?: boolean
  purpose?: string
  skill?: string
}

export class DiceRoller {
  /**
   * Roll dice with specified parameters
   */
  static roll(diceType: DiceType, options: RollOptions = {}): DiceRoll {
    const {
      count = 1,
      modifier = 0,
      advantage = false,
      disadvantage = false,
      purpose = 'General roll',
      skill,
    } = options

    const sides = this.getDiceSides(diceType)
    let results: number[] = []

    // Handle advantage/disadvantage for d20 rolls
    if (diceType === 'd20' && (advantage || disadvantage)) {
      const roll1 = Math.floor(Math.random() * sides) + 1
      const roll2 = Math.floor(Math.random() * sides) + 1

      if (advantage) {
        results = [Math.max(roll1, roll2)]
      } else {
        results = [Math.min(roll1, roll2)]
      }
    } else {
      // Regular rolls
      for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * sides) + 1)
      }
    }

    const total = results.reduce((sum, roll) => sum + roll, 0) + modifier

    return {
      id: this.generateId(),
      type: diceType,
      count,
      modifier,
      result: results,
      total,
      purpose,
      skill,
      advantage,
      disadvantage,
    }
  }

  /**
   * Roll ability check (d20 + ability modifier + proficiency if applicable)
   */
  static rollAbilityCheck(
    abilityScore: number,
    proficiencyBonus: number = 0,
    options: RollOptions = {}
  ): DiceRoll {
    const abilityModifier = Math.floor((abilityScore - 10) / 2)
    const totalModifier = abilityModifier + proficiencyBonus

    return this.roll('d20', {
      ...options,
      modifier: totalModifier,
      purpose: options.purpose || `${options.skill || 'Ability'} check`,
    })
  }

  /**
   * Roll skill check (d20 + ability modifier + proficiency if proficient)
   */
  static rollSkillCheck(
    skillName: string,
    abilityScore: number,
    isProficient: boolean = false,
    proficiencyBonus: number = 2,
    options: RollOptions = {}
  ): DiceRoll {
    const abilityModifier = Math.floor((abilityScore - 10) / 2)
    const totalModifier =
      abilityModifier + (isProficient ? proficiencyBonus : 0)

    return this.roll('d20', {
      ...options,
      modifier: totalModifier,
      purpose: `${skillName} check`,
      skill: skillName,
    })
  }

  /**
   * Roll saving throw (d20 + ability modifier + proficiency if proficient)
   */
  static rollSavingThrow(
    abilityScore: number,
    isProficient: boolean = false,
    proficiencyBonus: number = 2,
    options: RollOptions = {}
  ): DiceRoll {
    const abilityModifier = Math.floor((abilityScore - 10) / 2)
    const totalModifier =
      abilityModifier + (isProficient ? proficiencyBonus : 0)

    return this.roll('d20', {
      ...options,
      modifier: totalModifier,
      purpose: options.purpose || 'Saving throw',
    })
  }

  /**
   * Roll attack (d20 + ability modifier + proficiency bonus)
   */
  static rollAttack(
    abilityScore: number,
    proficiencyBonus: number = 2,
    options: RollOptions = {}
  ): DiceRoll {
    const abilityModifier = Math.floor((abilityScore - 10) / 2)
    const totalModifier = abilityModifier + proficiencyBonus

    return this.roll('d20', {
      ...options,
      modifier: totalModifier,
      purpose: 'Attack roll',
    })
  }

  /**
   * Roll damage (various dice types + modifier)
   */
  static rollDamage(
    diceType: DiceType,
    count: number = 1,
    modifier: number = 0,
    damageType: string = 'damage'
  ): DiceRoll {
    return this.roll(diceType, {
      count,
      modifier,
      purpose: `${damageType} damage`,
    })
  }

  /**
   * Roll initiative (d20 + dexterity modifier)
   */
  static rollInitiative(
    dexterityScore: number,
    options: RollOptions = {}
  ): DiceRoll {
    const dexModifier = Math.floor((dexterityScore - 10) / 2)

    return this.roll('d20', {
      ...options,
      modifier: dexModifier,
      purpose: 'Initiative',
    })
  }

  /**
   * Roll hit dice for healing (class hit die + constitution modifier)
   */
  static rollHitDie(
    hitDie: DiceType,
    constitutionScore: number,
    options: RollOptions = {}
  ): DiceRoll {
    const conModifier = Math.floor((constitutionScore - 10) / 2)

    return this.roll(hitDie, {
      ...options,
      modifier: Math.max(1, conModifier), // Minimum 1 HP recovered
      purpose: 'Hit die recovery',
    })
  }

  /**
   * Check if a roll meets or exceeds a difficulty class
   */
  static checkSuccess(roll: DiceRoll, dc: number): boolean {
    return roll.total >= dc
  }

  /**
   * Get the number of sides for a dice type
   */
  private static getDiceSides(diceType: DiceType): number {
    const sideMap: Record<DiceType, number> = {
      d4: 4,
      d6: 6,
      d8: 8,
      d10: 10,
      d12: 12,
      d20: 20,
      d100: 100,
    }
    return sideMap[diceType]
  }

  /**
   * Generate unique ID for dice roll
   */
  private static generateId(): string {
    return `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Format dice roll for display
   */
  static formatRoll(roll: DiceRoll): string {
    const diceStr = `${roll.count > 1 ? roll.count : ''}${roll.type}`
    const modifierStr =
      roll.modifier !== 0
        ? roll.modifier > 0
          ? `+${roll.modifier}`
          : `${roll.modifier}`
        : ''

    const advantageStr = roll.advantage
      ? ' (Advantage)'
      : roll.disadvantage
        ? ' (Disadvantage)'
        : ''

    const resultStr =
      roll.result.length > 1
        ? `[${roll.result.join(', ')}]`
        : `${roll.result[0]}`

    return `${diceStr}${modifierStr}: ${resultStr}${modifierStr ? ` = ${roll.total}` : ''}${advantageStr}`
  }

  /**
   * Get difficulty class description
   */
  static getDCDescription(dc: number): string {
    if (dc <= 5) return 'Very Easy'
    if (dc <= 10) return 'Easy'
    if (dc <= 15) return 'Medium'
    if (dc <= 20) return 'Hard'
    if (dc <= 25) return 'Very Hard'
    return 'Nearly Impossible'
  }
}

export { DiceRoller as Dice }
