
export type CardType = 'hero' | 'unit' | 'monster' | 'equipment';
export type EquipmentType = 'weapon' | 'armor';
export type DamageType = 'physical' | 'magical' | 'elemental';

export interface BaseCard {
  id: string;
  name: string;
  type: CardType;
  image: string;
  description: string;
}

export interface HeroCard extends BaseCard {
  type: 'hero';
  health: number;
  maxHealth: number;
  defense: number;
  attack: number;
  damageType: DamageType;
}

export interface UnitCard extends BaseCard {
  type: 'unit';
  health: number;
  maxHealth: number;
  attack: number;
  cost: number;
}

export interface MonsterCard extends BaseCard {
  type: 'monster';
  health: number;
  maxHealth: number;
  attack: number;
  goldReward: number;
}

export interface EquipmentCard extends BaseCard {
  type: 'equipment';
  equipmentType: EquipmentType;
  bonusStat: 'attack' | 'defense' | 'health';
  bonusAmount: number;
  cost: number;
}

export type Card = HeroCard | UnitCard | MonsterCard | EquipmentCard;

// Hero Cards
export const heroes: HeroCard[] = [
  {
    id: 'hero-warrior',
    name: 'Warrior',
    type: 'hero',
    image: 'warrior',
    description: 'A mighty warrior with strong physical attacks',
    health: 30,
    maxHealth: 30,
    defense: 3,
    attack: 5,
    damageType: 'physical'
  },
  {
    id: 'hero-mage',
    name: 'Mage',
    type: 'hero',
    image: 'mage',
    description: 'A powerful spellcaster with magical abilities',
    health: 25,
    maxHealth: 25,
    defense: 1,
    attack: 7,
    damageType: 'magical'
  },
  {
    id: 'hero-ranger',
    name: 'Ranger',
    type: 'hero',
    image: 'ranger',
    description: 'A skilled archer with elemental arrows',
    health: 28,
    maxHealth: 28,
    defense: 2,
    attack: 6,
    damageType: 'elemental'
  }
];

// Unit Cards
export const units: UnitCard[] = [
  {
    id: 'unit-knight',
    name: 'Knight',
    type: 'unit',
    image: 'knight',
    description: 'A loyal knight with strong defense',
    health: 10,
    maxHealth: 10,
    attack: 3,
    cost: 5
  },
  {
    id: 'unit-archer',
    name: 'Archer',
    type: 'unit',
    image: 'archer',
    description: 'A skilled archer with ranged attacks',
    health: 6,
    maxHealth: 6,
    attack: 4,
    cost: 4
  },
  {
    id: 'unit-cleric',
    name: 'Cleric',
    type: 'unit',
    image: 'cleric',
    description: 'A holy cleric with healing abilities',
    health: 8,
    maxHealth: 8,
    attack: 2,
    cost: 3
  },
  {
    id: 'unit-assassin',
    name: 'Assassin',
    type: 'unit',
    image: 'assassin',
    description: 'A stealthy assassin with deadly strikes',
    health: 5,
    maxHealth: 5,
    attack: 6,
    cost: 6
  },
  {
    id: 'unit-wizard',
    name: 'Wizard',
    type: 'unit',
    image: 'wizard',
    description: 'A wise wizard with powerful spells',
    health: 4,
    maxHealth: 4,
    attack: 7,
    cost: 7
  }
];

// Monster Cards
export const monsters: MonsterCard[] = [
  {
    id: 'monster-goblin',
    name: 'Goblin',
    type: 'monster',
    image: 'goblin',
    description: 'A sneaky goblin that likes shiny things',
    health: 5,
    maxHealth: 5,
    attack: 2,
    goldReward: 2
  },
  {
    id: 'monster-troll',
    name: 'Troll',
    type: 'monster',
    image: 'troll',
    description: 'A strong troll with regenerative abilities',
    health: 12,
    maxHealth: 12,
    attack: 4,
    goldReward: 5
  },
  {
    id: 'monster-dragon',
    name: 'Dragon',
    type: 'monster',
    image: 'dragon',
    description: 'A fearsome dragon with fiery breath',
    health: 20,
    maxHealth: 20,
    attack: 8,
    goldReward: 10
  },
  {
    id: 'monster-spider',
    name: 'Giant Spider',
    type: 'monster',
    image: 'spider',
    description: 'A venomous spider with sticky webs',
    health: 8,
    maxHealth: 8,
    attack: 3,
    goldReward: 3
  }
];

// Equipment Cards
export const equipments: EquipmentCard[] = [
  {
    id: 'equipment-sword',
    name: 'Sword',
    type: 'equipment',
    equipmentType: 'weapon',
    image: 'sword',
    description: 'A sharp sword that increases attack',
    bonusStat: 'attack',
    bonusAmount: 2,
    cost: 3
  },
  {
    id: 'equipment-axe',
    name: 'Battle Axe',
    type: 'equipment',
    equipmentType: 'weapon',
    image: 'axe',
    description: 'A heavy axe that greatly increases attack',
    bonusStat: 'attack',
    bonusAmount: 4,
    cost: 6
  },
  {
    id: 'equipment-shield',
    name: 'Shield',
    type: 'equipment',
    equipmentType: 'armor',
    image: 'shield',
    description: 'A sturdy shield that increases defense',
    bonusStat: 'defense',
    bonusAmount: 2,
    cost: 3
  },
  {
    id: 'equipment-helmet',
    name: 'Helmet',
    type: 'equipment',
    equipmentType: 'armor',
    image: 'helmet',
    description: 'A reinforced helmet that increases defense',
    bonusStat: 'defense',
    bonusAmount: 1,
    cost: 2
  },
  {
    id: 'equipment-amulet',
    name: 'Amulet',
    type: 'equipment',
    equipmentType: 'armor',
    image: 'amulet',
    description: 'A magical amulet that increases health',
    bonusStat: 'health',
    bonusAmount: 5,
    cost: 4
  }
];

// Helper functions
export const getRandomUnits = (count: number): UnitCard[] => {
  const shuffled = [...units].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomMonsters = (count: number): MonsterCard[] => {
  const shuffled = [...monsters].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomEquipment = (count: number): EquipmentCard[] => {
  const shuffled = [...equipments].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
