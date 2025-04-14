
export type CardType = 'hero' | 'unit' | 'monster' | 'equipment';
export type EquipmentType = 'weapon' | 'armor';
export type DamageType = 'physical' | 'magical' | 'elemental';
export type UnitRole = 'standard' | 'provocateur';
export type HeroClass = 'warrior' | 'mage';
export type Location = 'forest' | 'ruins' | 'catacombs' | 'necropolis' | 'chthonian' | 'crypt';

export interface BaseCard {
  id: string;
  name: string;
  type: CardType;
  image: string;
  description: string;
}

export interface HeroCard extends BaseCard {
  type: 'hero';
  hp: number;
  maxHp: number;
  ap: number;
  mp: number;
  dp: number;
  rp: number;
  sp: number;
  heroClass: HeroClass;
}

export interface UnitCard extends BaseCard {
  type: 'unit';
  hp: number;
  maxHp: number;
  ap: number;
  mp: number;
  cost: number;
  role?: UnitRole;
}

export interface MonsterCard extends BaseCard {
  type: 'monster';
  hp: number;
  maxHp: number;
  ap: number;
  mp: number;
  goldReward: number;
  location: Location;
}

export interface EquipmentCard extends BaseCard {
  type: 'equipment';
  equipmentType: EquipmentType;
  bonusStat: 'ap' | 'mp' | 'dp' | 'rp' | 'sp' | 'hp';
  bonusAmount: number;
  cost: number;
}

export type Card = HeroCard | UnitCard | MonsterCard | EquipmentCard;

export const locationDescriptions: Record<Location, string> = {
  forest: "The forest is inhabited by forest animals that pose little danger, as well as looters and robbers.",
  ruins: "Among the ruins of the old castle, there are sometimes sectarians and creepy but weak monsters.",
  catacombs: "The catacombs are home to dangerous spirits and creepy mutants.",
  necropolis: "The necropolis is guarded by mobs of the living dead and skeletons.",
  chthonian: "In the Chthonian Temple the heroes are met by horrible ogre demons, devils and golems.",
  crypt: "The place where both heroes' journey ends, here live the great and terrible demon lords."
};

export const heroes: HeroCard[] = [
  // Mage Class Heroes
  {
    id: 'hero-necromancer',
    name: 'Necromancer',
    type: 'hero',
    image: 'necromancer',
    description: 'A dark mage who manipulates death and reanimates corpses',
    hp: 16,
    maxHp: 16,
    dp: 2,
    rp: 2,
    ap: 0,
    mp: 5,
    sp: 2,
    heroClass: 'mage'
  },
  {
    id: 'hero-witch',
    name: 'Witch',
    type: 'hero',
    image: 'witch',
    description: 'A mysterious spell caster who harnesses ancient magic',
    hp: 24,
    maxHp: 24,
    dp: 1,
    rp: 4,
    ap: 0,
    mp: 3,
    sp: 2,
    heroClass: 'mage'
  },
  {
    id: 'hero-pyromancer',
    name: 'Pyromancer',
    type: 'hero',
    image: 'pyromancer',
    description: 'A fire mage who controls destructive flames',
    hp: 40,
    maxHp: 40,
    dp: 3,
    rp: 4,
    ap: 0,
    mp: 4,
    sp: 1,
    heroClass: 'mage'
  },
  {
    id: 'hero-adept',
    name: 'Adept',
    type: 'hero',
    image: 'adept',
    description: 'A versatile magician balancing physical and magical attacks',
    hp: 24,
    maxHp: 24,
    dp: 2,
    rp: 2,
    ap: 2,
    mp: 2,
    sp: 2,
    heroClass: 'mage'
  },
  // Warrior Class Heroes
  {
    id: 'hero-rogue',
    name: 'Rogue',
    type: 'hero',
    image: 'rogue',
    description: 'A swift assassin striking from the shadows',
    hp: 16,
    maxHp: 16,
    dp: 1,
    rp: 1,
    ap: 2,
    mp: 0,
    sp: 3,
    heroClass: 'warrior'
  },
  {
    id: 'hero-fugitive',
    name: 'Fugitive',
    type: 'hero',
    image: 'fugitive',
    description: 'A cunning outlaw with surprising combat skills',
    hp: 24,
    maxHp: 24,
    dp: 2,
    rp: 2,
    ap: 4,
    mp: 0,
    sp: 2,
    heroClass: 'warrior'
  },
  {
    id: 'hero-ranger',
    name: 'Ranger',
    type: 'hero',
    image: 'ranger',
    description: 'A skilled wilderness expert with deadly accuracy',
    hp: 24,
    maxHp: 24,
    dp: 1,
    rp: 1,
    ap: 6,
    mp: 0,
    sp: 2,
    heroClass: 'warrior'
  },
  {
    id: 'hero-acolyte',
    name: 'Acolyte',
    type: 'hero',
    image: 'acolyte',
    description: 'A devoted fighter with mystical abilities',
    hp: 32,
    maxHp: 32,
    dp: 1,
    rp: 5,
    ap: 4,
    mp: 2,
    sp: 1,
    heroClass: 'warrior'
  }
];

// Generate monsters based on location
export const generateMonsters = (location: Location, count: number): MonsterCard[] => {
  const monsterTypes: Record<Location, {names: string[], images: string[], minStats: number, maxStats: number}> = {
    forest: {
      names: ['Wolf', 'Bandit', 'Wild Boar', 'Bear'],
      images: ['wolf', 'bandit', 'boar', 'bear'],
      minStats: 1,
      maxStats: 3
    },
    ruins: {
      names: ['Cultist', 'Ghoul', 'Possessed Statue', 'Dark Acolyte'],
      images: ['cultist', 'ghoul', 'statue', 'darkacolyte'],
      minStats: 2,
      maxStats: 4
    },
    catacombs: {
      names: ['Wraith', 'Mutant Rat', 'Corrupted Spirit', 'Cave Troll'],
      images: ['wraith', 'rat', 'spirit', 'troll'],
      minStats: 3,
      maxStats: 5
    },
    necropolis: {
      names: ['Skeleton Warrior', 'Zombie', 'Bone Golem', 'Death Knight'],
      images: ['skeleton', 'zombie', 'golem', 'deathknight'],
      minStats: 4,
      maxStats: 6
    },
    chthonian: {
      names: ['Demon', 'Horned Devil', 'Fire Elemental', 'Stone Golem'],
      images: ['demon', 'devil', 'elemental', 'golem'],
      minStats: 5,
      maxStats: 8
    },
    crypt: {
      names: ['Demon Lord', 'Soul Eater', 'Ancient Lich', 'Abomination'],
      images: ['demonlord', 'souleater', 'lich', 'abomination'],
      minStats: 7,
      maxStats: 10
    }
  };

  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const result: MonsterCard[] = [];
  const locationData = monsterTypes[location];

  for (let i = 0; i < count; i++) {
    const nameIndex = Math.floor(Math.random() * locationData.names.length);
    const name = locationData.names[nameIndex];
    const image = locationData.images[nameIndex] || 'monster';
    
    const hp = getRandomInt(locationData.minStats, locationData.maxStats);
    const ap = getRandomInt(0, locationData.maxStats);
    const mp = getRandomInt(0, locationData.maxStats);
    const goldReward = getRandomInt(locationData.minStats, locationData.maxStats);

    result.push({
      id: `monster-${location}-${i}`,
      name,
      type: 'monster',
      image,
      description: `A ${name.toLowerCase()} found in the ${location}`,
      hp,
      maxHp: hp,
      ap,
      mp,
      goldReward,
      location
    });
  }

  return result;
};

// Updated units - now just like monsters but available for recruitment
export const generateUnits = (location: Location, count: number): UnitCard[] => {
  const monsterCards = generateMonsters(location, count * 2);
  
  return monsterCards.slice(0, count).map((monster, index) => {
    const cost = monster.goldReward + Math.floor(monster.hp / 2);
    
    // 1 in 5 chance of being a provocateur
    const isProvocateur = Math.random() < 0.2;
    
    return {
      id: `unit-${location}-${index}`,
      name: monster.name,
      type: 'unit',
      image: monster.image,
      description: `A ${monster.name.toLowerCase()} that fights for you`,
      hp: monster.hp,
      maxHp: monster.hp,
      ap: monster.ap,
      mp: monster.mp,
      cost,
      ...(isProvocateur && { role: 'provocateur' as UnitRole })
    };
  });
};

export const equipments: EquipmentCard[] = [
  {
    id: 'equipment-sword',
    name: 'Sword',
    type: 'equipment',
    equipmentType: 'weapon',
    image: 'sword',
    description: 'A sharp sword that increases physical attack',
    bonusStat: 'ap',
    bonusAmount: 2,
    cost: 3
  },
  {
    id: 'equipment-staff',
    name: 'Magic Staff',
    type: 'equipment',
    equipmentType: 'weapon',
    image: 'staff',
    description: 'A magical staff that increases magical attack',
    bonusStat: 'mp',
    bonusAmount: 2,
    cost: 3
  },
  {
    id: 'equipment-axe',
    name: 'Battle Axe',
    type: 'equipment',
    equipmentType: 'weapon',
    image: 'axe',
    description: 'A heavy axe that greatly increases physical attack',
    bonusStat: 'ap',
    bonusAmount: 4,
    cost: 6
  },
  {
    id: 'equipment-wand',
    name: 'Wand of Power',
    type: 'equipment',
    equipmentType: 'weapon',
    image: 'wand',
    description: 'A powerful wand that greatly increases magical attack',
    bonusStat: 'mp',
    bonusAmount: 4,
    cost: 6
  },
  {
    id: 'equipment-shield',
    name: 'Shield',
    type: 'equipment',
    equipmentType: 'armor',
    image: 'shield',
    description: 'A sturdy shield that increases physical defense',
    bonusStat: 'dp',
    bonusAmount: 2,
    cost: 3
  },
  {
    id: 'equipment-helmet',
    name: 'Helmet',
    type: 'equipment',
    equipmentType: 'armor',
    image: 'helmet',
    description: 'A reinforced helmet that increases physical defense',
    bonusStat: 'dp',
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
    bonusStat: 'hp',
    bonusAmount: 5,
    cost: 4
  },
  {
    id: 'equipment-robe',
    name: 'Enchanted Robe',
    type: 'equipment',
    equipmentType: 'armor',
    image: 'robe',
    description: 'A magically infused robe that increases magic resistance',
    bonusStat: 'rp',
    bonusAmount: 2,
    cost: 3
  },
  {
    id: 'equipment-boots',
    name: 'Swift Boots',
    type: 'equipment',
    equipmentType: 'armor',
    image: 'boots',
    description: 'Enchanted boots that increase speed',
    bonusStat: 'sp',
    bonusAmount: 1,
    cost: 5
  }
];

// Helper function to get random equipment
export const getRandomEquipment = (count: number): EquipmentCard[] => {
  const shuffled = [...equipments].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to reduce card costs for game balance
export const reduceCost = (card: UnitCard | EquipmentCard): UnitCard | EquipmentCard => {
  if ('cost' in card) {
    // Reduce cost by approximately 20%, with a minimum of 1
    const newCost = Math.max(1, Math.floor(card.cost * 0.8));
    return { ...card, cost: newCost };
  }
  return card;
};
