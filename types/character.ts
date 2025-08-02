export interface Character {
  id: string;
  name: string;
  race: Race;
  class: Class;
  level: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hp: { current: number; max: number };
  ac: number;
  proficiencyBonus: number;
  skills: Skill[];
  inventory: Item[];
  spells?: Spell[];
  background: string;
  alignment: string;
}

export interface Race {
  id: string;
  name: string;
  traits: string[];
  abilityScoreIncrease: Record<string, number>;
  size: string;
  speed: number;
}

export interface Class {
  id: string;
  name: string;
  hitDie: number;
  primaryAbility: string[];
  savingThrows: string[];
  classFeatures: ClassFeature[];
}

export interface ClassFeature {
  name: string;
  level: number;
  description: string;
}

export interface Skill {
  name: string;
  ability: string;
  proficient: boolean;
  expertise: boolean;
}

export interface Item {
  id: string;
  name: string;
  type: string;
  description: string;
  weight: number;
  value: number;
  quantity: number;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
}