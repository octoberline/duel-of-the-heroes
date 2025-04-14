
import { useState, useCallback, useEffect } from 'react';
import { 
  HeroCard, 
  UnitCard, 
  MonsterCard, 
  EquipmentCard, 
  heroes, 
  getRandomEquipment,
  generateMonsters,
  generateUnits,
  Location
} from '../data/cards';
import { toast } from '@/components/ui/use-toast';

export type Player = {
  id: number;
  hero: HeroCard | null;
  units: UnitCard[];
  gold: number;
  equipment: {
    weapon: EquipmentCard | null;
    armor: EquipmentCard | null;
  };
};

export type GamePhase = 'setup' | 'chooseHero' | 'player1Turn' | 'player2Turn' | 'gameOver';
export type ActionPhase = 'buy' | 'heroAction' | 'unitAction' | 'end';
export type AttackType = 'physical' | 'magical' | null;

export type Target = {
  type: 'hero' | 'unit' | 'monster';
  playerId?: number;
  index?: number;
};

export type GameState = {
  players: [Player, Player];
  currentPlayer: number;
  monsters: MonsterCard[];
  shop: (UnitCard | EquipmentCard)[];
  gamePhase: GamePhase;
  actionPhase: ActionPhase;
  winner: number | null;
  selectedCardData: { card: any; type: 'hero' | 'unit'; index?: number } | null;
  targetingMode: boolean;
  actionsUsed: {
    buy: boolean;
    heroAction: boolean;
    unitAction: boolean;
  };
  gameDay: number;
  currentLocation: Location;
  locations: Location[];
  attackType: AttackType;
  remainingHeroActions: number;
};

const GAME_LOCATIONS: Location[] = ['forest', 'ruins', 'catacombs', 'necropolis', 'chthonian', 'crypt'];

const initialPlayer: Player = {
  id: 0,
  hero: null,
  units: [],
  gold: 0,
  equipment: {
    weapon: null,
    armor: null
  }
};

const initialGameState: GameState = {
  players: [
    { ...initialPlayer, id: 1 },
    { ...initialPlayer, id: 2 }
  ],
  currentPlayer: 1,
  monsters: [],
  shop: [],
  gamePhase: 'setup',
  actionPhase: 'buy',
  winner: null,
  selectedCardData: null,
  targetingMode: false,
  actionsUsed: {
    buy: false,
    heroAction: false,
    unitAction: false
  },
  gameDay: 1,
  currentLocation: 'forest',
  locations: GAME_LOCATIONS,
  attackType: null,
  remainingHeroActions: 0
};

// Helper function to reduce card costs for game balance
const reduceCost = (card: UnitCard | EquipmentCard): UnitCard | EquipmentCard => {
  if ('cost' in card) {
    // Reduce cost by approximately 20%, with a minimum of 1
    const newCost = Math.max(1, Math.floor(card.cost * 0.8));
    return { ...card, cost: newCost };
  }
  return card;
};

// Helper function to determine the current location based on the game day
const getLocationForDay = (day: number): Location => {
  // Each location lasts for 3 days
  // 0-based index to access the locations array
  const locationIndex = Math.min(Math.floor((day - 1) / 3), GAME_LOCATIONS.length - 1);
  return GAME_LOCATIONS[locationIndex];
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  // Initialize the game
  const initializeGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      gamePhase: 'chooseHero'
    });
  }, []);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  // Select a hero for a player
  const selectHero = useCallback((hero: HeroCard, playerId: number) => {
    setGameState(prevState => {
      const newPlayers = [...prevState.players] as [Player, Player];
      const playerIndex = playerId - 1;
      
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        hero: { ...hero }
      };
      
      // If both players have selected heroes, start the game
      const bothPlayersSelectedHeroes = newPlayers[0].hero && newPlayers[1].hero;
      const newGamePhase = bothPlayersSelectedHeroes ? 'player1Turn' : 'chooseHero';
      
      // Refresh shop and monsters when game starts
      let newMonsters = prevState.monsters;
      let newShop = prevState.shop;
      
      if (bothPlayersSelectedHeroes) {
        // Get monsters based on the starting location (forest)
        newMonsters = generateMonsters('forest', 2);
        
        // Get shop cards with reduced costs
        const baseShopCards = [...generateUnits('forest', 1), ...getRandomEquipment(1)];
        newShop = baseShopCards.map(reduceCost);
      }
      
      return {
        ...prevState,
        players: newPlayers,
        gamePhase: newGamePhase,
        actionPhase: newGamePhase === 'player1Turn' ? 'buy' : prevState.actionPhase,
        monsters: newMonsters,
        shop: newShop,
        actionsUsed: {
          buy: false,
          heroAction: false,
          unitAction: false
        },
        remainingHeroActions: newPlayers[0].hero?.sp || 0
      };
    });
  }, []);

  // Start a player's turn
  const startTurn = useCallback((playerId: number) => {
    setGameState(prevState => {
      const playerIndex = playerId - 1;
      const player = prevState.players[playerIndex];
      
      // Calculate which location we should be in based on the game day
      let newDay = prevState.gameDay;
      if (playerId === 1) {
        // Increment the day when player 1's turn starts (except for the first turn)
        newDay = prevState.gameDay === 1 && prevState.currentPlayer === 1 ? 1 : prevState.gameDay + 1;
      }
      
      // Check if we've reached the game end (day 19)
      if (newDay > 18) {
        return {
          ...prevState,
          gamePhase: 'gameOver',
          winner: null, // No winner, both players lose
          gameDay: newDay
        };
      }
      
      // Determine the current location based on the day
      const currentLocation = getLocationForDay(newDay);
      
      // Give 5 gold at the start of turn
      const newGold = 5;
      
      // Reset the hero's actions based on their speed
      const heroSpeed = player.hero?.sp || 0;
      
      return {
        ...prevState,
        currentPlayer: playerId,
        gamePhase: playerId === 1 ? 'player1Turn' : 'player2Turn',
        actionPhase: 'buy',
        gameDay: newDay,
        currentLocation,
        players: [
          ...prevState.players.slice(0, playerIndex),
          { ...player, gold: newGold },
          ...prevState.players.slice(playerIndex + 1)
        ] as [Player, Player],
        actionsUsed: {
          buy: false,
          heroAction: false,
          unitAction: false
        },
        attackType: null,
        remainingHeroActions: heroSpeed
      };
    });
  }, []);

  // Buy a card from the shop
  const buyCard = useCallback((cardIndex: number) => {
    setGameState(prevState => {
      // Check if the player has already used their buy action
      if (prevState.actionsUsed.buy) {
        toast({
          title: "Action already used!",
          description: "You can only buy one item per turn.",
          variant: "destructive"
        });
        return prevState;
      }

      const playerIndex = prevState.currentPlayer - 1;
      const player = prevState.players[playerIndex];
      const card = prevState.shop[cardIndex];
      
      if (!card) return prevState;
      
      const cost = 'cost' in card ? card.cost : 0;
      
      // Check if player has enough gold
      if (player.gold < cost) {
        toast({
          title: "Not enough gold!",
          description: `You need ${cost} gold to buy this card.`,
          variant: "destructive"
        });
        return prevState;
      }
      
      // Handle different card types
      let newPlayer = { ...player };
      
      if (card.type === 'unit') {
        // Check if player already has 3 units
        if (player.units.length >= 3) {
          toast({
            title: "Unit limit reached!",
            description: "You can only have 3 units at a time. Replace an existing unit.",
            variant: "destructive"
          });
          return prevState;
        }
        
        // Add unit to player
        newPlayer = {
          ...player,
          units: [...player.units, card as UnitCard],
          gold: player.gold - cost
        };
      } else if (card.type === 'equipment') {
        const equipment = card as EquipmentCard;
        
        // Add equipment to player
        if (equipment.equipmentType === 'weapon') {
          newPlayer = {
            ...player,
            equipment: {
              ...player.equipment,
              weapon: equipment
            },
            gold: player.gold - cost
          };
        } else {
          newPlayer = {
            ...player,
            equipment: {
              ...player.equipment,
              armor: equipment
            },
            gold: player.gold - cost
          };
        }
        
        // Apply stat bonuses to hero
        if (newPlayer.hero) {
          const bonusStat = equipment.bonusStat;
          const bonusAmount = equipment.bonusAmount;
          
          if (bonusStat === 'ap') {
            newPlayer.hero = {
              ...newPlayer.hero,
              ap: newPlayer.hero.ap + bonusAmount
            };
          } else if (bonusStat === 'mp') {
            newPlayer.hero = {
              ...newPlayer.hero,
              mp: newPlayer.hero.mp + bonusAmount
            };
          } else if (bonusStat === 'dp') {
            newPlayer.hero = {
              ...newPlayer.hero,
              dp: newPlayer.hero.dp + bonusAmount
            };
          } else if (bonusStat === 'rp') {
            newPlayer.hero = {
              ...newPlayer.hero,
              rp: newPlayer.hero.rp + bonusAmount
            };
          } else if (bonusStat === 'sp') {
            newPlayer.hero = {
              ...newPlayer.hero,
              sp: newPlayer.hero.sp + bonusAmount
            };
          } else if (bonusStat === 'hp') {
            newPlayer.hero = {
              ...newPlayer.hero,
              maxHp: newPlayer.hero.maxHp + bonusAmount,
              hp: newPlayer.hero.hp + bonusAmount
            };
          }
        }
      }
      
      // Remove card from shop and add a new one
      const newShop = [...prevState.shop];
      let newCard;
      
      if (card.type === 'unit') {
        newCard = reduceCost(generateUnits(prevState.currentLocation, 1)[0]);
      } else {
        newCard = reduceCost(getRandomEquipment(1)[0]);
      }
      
      newShop[cardIndex] = newCard;
      
      return {
        ...prevState,
        players: [
          ...prevState.players.slice(0, playerIndex),
          newPlayer,
          ...prevState.players.slice(playerIndex + 1)
        ] as [Player, Player],
        shop: newShop,
        actionsUsed: {
          ...prevState.actionsUsed,
          buy: true
        }
      };
    });
  }, []);

  // Check if the player can skip the current phase
  const shouldSkipPhase = useCallback((currentState: GameState, phase: ActionPhase): boolean => {
    const playerIndex = currentState.currentPlayer - 1;
    const player = currentState.players[playerIndex];

    switch(phase) {
      case 'buy':
        // Skip buy phase if player doesn't have enough gold for any shop card
        return currentState.shop.every(card => 
          'cost' in card && player.gold < card.cost
        );
      
      case 'heroAction':
        // Skip hero action if hero has no actions left or no attack
        return currentState.remainingHeroActions <= 0 || 
               (player.hero && player.hero.ap === 0 && player.hero.mp === 0);
      
      case 'unitAction':
        // Skip unit action if player has no units or already used the action
        return player.units.length === 0 || currentState.actionsUsed.unitAction;
      
      default:
        return false;
    }
  }, []);

  // Move to the next action phase
  const nextPhase = useCallback(() => {
    setGameState(prevState => {
      const currentPhase = prevState.actionPhase;
      let newPhase: ActionPhase;
      
      switch (currentPhase) {
        case 'buy':
          newPhase = 'heroAction';
          break;
        case 'heroAction':
          newPhase = 'unitAction';
          break;
        case 'unitAction':
          newPhase = 'end';
          break;
        case 'end':
          // End turn, switch to other player
          const newCurrentPlayer = prevState.currentPlayer === 1 ? 2 : 1;
          
          // Refresh monsters if needed
          let newMonsters = [...prevState.monsters];
          if (newMonsters.length < 2) {
            const monstersToAdd = 2 - newMonsters.length;
            // Generate new monsters based on current location
            const newLocationMonsters = generateMonsters(prevState.currentLocation, monstersToAdd);
            newMonsters = [...newMonsters, ...newLocationMonsters];
          }
          
          // Refresh shop with reduced costs
          // Use current location when generating units
          const baseShopCards = [
            ...generateUnits(prevState.currentLocation, 1), 
            ...getRandomEquipment(1)
          ];
          const newShop = baseShopCards.map(reduceCost);
          
          // Start the next player's turn
          return startTurn(newCurrentPlayer);
      }

      // Check if we should skip the next phase
      if (shouldSkipPhase(prevState, newPhase)) {
        // If we need to skip the next phase, recursively call nextPhase
        // We'll do this by returning the current state but with the updated phase
        // Then in the next render, we'll check again if we need to skip
        const updatedState = {
          ...prevState,
          actionPhase: newPhase,
          selectedCardData: null,
          targetingMode: false,
          attackType: null
        };

        // Skip heroAction phase
        if (newPhase === 'heroAction' && shouldSkipPhase(updatedState, 'heroAction')) {
          return {
            ...updatedState,
            actionPhase: 'unitAction'
          };
        }
        
        // Skip unitAction phase
        if (newPhase === 'unitAction' && shouldSkipPhase(updatedState, 'unitAction')) {
          return {
            ...updatedState,
            actionPhase: 'end'
          };
        }

        return updatedState;
      }
      
      return {
        ...prevState,
        actionPhase: newPhase,
        selectedCardData: null,
        targetingMode: false,
        attackType: null
      };
    });
  }, [shouldSkipPhase, startTurn]);

  // Check if a player has a provocateur unit
  const hasProvocateurUnit = useCallback((playerIndex: number, gameState: GameState) => {
    return gameState.players[playerIndex].units.some(unit => unit.role === 'provocateur');
  }, []);

  // Get the first provocateur unit index for a player
  const getProvocateurUnitIndex = useCallback((playerIndex: number, gameState: GameState) => {
    return gameState.players[playerIndex].units.findIndex(unit => unit.role === 'provocateur');
  }, []);

  // Select attack type (physical or magical)
  const selectAttackType = useCallback((type: 'physical' | 'magical') => {
    setGameState(prevState => {
      return {
        ...prevState,
        attackType: type
      };
    });
  }, []);

  // Select a card for an action
  const selectCard = useCallback((card: any, type: 'hero' | 'unit', index?: number) => {
    setGameState(prevState => {
      // Check if the player has already used the corresponding action
      if (type === 'unit' && prevState.actionsUsed.unitAction) {
        toast({
          title: "Action already used!",
          description: `You can only use one unit action per turn.`,
          variant: "destructive"
        });
        return prevState;
      }

      // For hero actions, check remaining actions instead
      if (type === 'hero' && prevState.remainingHeroActions <= 0) {
        toast({
          title: "No actions remaining!",
          description: `Your hero has used all available actions this turn.`,
          variant: "destructive"
        });
        return prevState;
      }

      // If selecting a hero, determine attack type automatically if needed
      let attackType = prevState.attackType;
      
      if (type === 'hero') {
        const hero = card as HeroCard;
        
        // Auto-select attack type if hero only has one type of attack
        if (hero.ap > 0 && hero.mp === 0) {
          attackType = 'physical';
        } else if (hero.ap === 0 && hero.mp > 0) {
          attackType = 'magical';
        }
        
        // If hero can use both, and no attack type is selected, show a message
        if (hero.ap > 0 && hero.mp > 0 && !attackType) {
          toast({
            title: "Select attack type",
            description: `Choose between Physical or Magical attack.`,
            variant: "default"
          });
          return prevState;
        }
      }

      return {
        ...prevState,
        selectedCardData: { card, type, index },
        targetingMode: true,
        attackType
      };
    });
  }, []);

  // Calculate total unit stats
  const calculateUnitStats = useCallback((units: UnitCard[], statType: 'hp' | 'ap' | 'mp') => {
    return units.reduce((total, unit) => total + unit[statType], 0);
  }, []);

  // Attack a target
  const attack = useCallback((target: Target) => {
    setGameState(prevState => {
      if (!prevState.selectedCardData || !prevState.attackType) return prevState;
      
      const { card, type } = prevState.selectedCardData;
      const attackingPlayer = prevState.players[prevState.currentPlayer - 1];
      let attackValue = 0;
      
      // Determine attack value based on attack type
      if (type === 'hero') {
        if (prevState.attackType === 'physical') {
          attackValue = card.ap;
        } else {
          attackValue = card.mp;
        }
      } else if (type === 'unit') {
        // For units, use the total attack value of all units
        if (prevState.attackType === 'physical') {
          attackValue = calculateUnitStats(attackingPlayer.units, 'ap');
        } else {
          attackValue = calculateUnitStats(attackingPlayer.units, 'mp');
        }
      }
      
      // Check for provocateurs before allowing attack
      if (target.type === 'hero' || target.type === 'unit') {
        const defendingPlayerIndex = (target.playerId || 1) - 1;
        
        // Check if the defending player has a provocateur
        if (hasProvocateurUnit(defendingPlayerIndex, prevState)) {
          const provocateurIndex = getProvocateurUnitIndex(defendingPlayerIndex, prevState);
          
          // If targeting a unit that isn't the provocateur, or targeting the hero
          if ((target.type === 'unit' && target.index !== provocateurIndex) || 
              target.type === 'hero') {
            toast({
              title: "Cannot attack!",
              description: "You must attack the provocateur unit first!",
              variant: "destructive"
            });
            return {
              ...prevState,
              selectedCardData: null,
              targetingMode: false
            };
          }
        }
      }
      
      if (target.type === 'hero' && target.playerId) {
        // Attack enemy hero
        const defendingPlayerIndex = target.playerId - 1;
        const defendingPlayer = prevState.players[defendingPlayerIndex];
        
        if (!defendingPlayer.hero) return prevState;
        
        // Calculate damage based on attack type
        let damage = attackValue;
        
        // Physical attacks are reduced by Magic Resistance (RP)
        // Magical attacks are reduced by Physical Defense (DP)
        if (prevState.attackType === 'physical') {
          damage = Math.max(1, attackValue - defendingPlayer.hero.rp);
        } else { // magical
          damage = Math.max(1, attackValue - defendingPlayer.hero.dp);
        }
        
        const newHealth = Math.max(0, defendingPlayer.hero.hp - damage);
        
        // Update hero health
        const updatedHero = {
          ...defendingPlayer.hero,
          hp: newHealth
        };
        
        // Check for game over
        const gameOver = newHealth <= 0;
        const winner = gameOver ? prevState.currentPlayer : null;
        
        if (gameOver) {
          toast({
            title: `Player ${prevState.currentPlayer} wins!`,
            description: `${attackingPlayer.hero?.name} defeated ${defendingPlayer.hero.name}!`,
            variant: "default"
          });
        } else {
          toast({
            title: `Attack successful!`,
            description: `Dealt ${damage} damage to ${defendingPlayer.hero.name}!`,
            variant: "default"
          });
        }
        
        const newPlayers = [...prevState.players] as [Player, Player];
        newPlayers[defendingPlayerIndex] = {
          ...defendingPlayer,
          hero: updatedHero
        };
        
        // Mark the action as used
        const newActionsUsed = { ...prevState.actionsUsed };
        const newRemainingHeroActions = type === 'hero' ? 
          prevState.remainingHeroActions - 1 : 
          prevState.remainingHeroActions;
        
        if (type === 'unit') {
          newActionsUsed.unitAction = true;
        }
        
        return {
          ...prevState,
          players: newPlayers,
          gamePhase: gameOver ? 'gameOver' : prevState.gamePhase,
          winner,
          selectedCardData: null,
          targetingMode: false,
          actionsUsed: newActionsUsed,
          remainingHeroActions: newRemainingHeroActions,
          attackType: null
        };
      } else if (target.type === 'unit' && target.playerId && typeof target.index === 'number') {
        // Attack enemy units
        const defendingPlayerIndex = target.playerId - 1;
        const defendingPlayer = prevState.players[defendingPlayerIndex];
        
        // Apply the new combat system - calculate total enemy unit health
        const totalEnemyUnitHealth = calculateUnitStats(defendingPlayer.units, 'hp');
        
        // If attack is less than total health, no damage occurs
        if (attackValue < totalEnemyUnitHealth) {
          toast({
            title: `Attack unsuccessful!`,
            description: `Your attack (${attackValue}) was less than the enemy units' total health (${totalEnemyUnitHealth})! No damage dealt.`,
            variant: "default"
          });
          
          // Mark the action as used
          const newActionsUsed = { ...prevState.actionsUsed };
          const newRemainingHeroActions = type === 'hero' ? 
            prevState.remainingHeroActions - 1 : 
            prevState.remainingHeroActions;
            
          if (type === 'unit') {
            newActionsUsed.unitAction = true;
          }
          
          return {
            ...prevState,
            selectedCardData: null,
            targetingMode: false,
            actionsUsed: newActionsUsed,
            remainingHeroActions: newRemainingHeroActions,
            attackType: null
          };
        }
        
        // If attack is greater than or equal to total health, all units are destroyed
        toast({
          title: `Units destroyed!`,
          description: `Your ${prevState.attackType} attack (${attackValue}) destroyed all enemy units (${totalEnemyUnitHealth} total health)!`,
          variant: "default"
        });
        
        const newPlayers = [...prevState.players] as [Player, Player];
        newPlayers[defendingPlayerIndex] = {
          ...defendingPlayer,
          units: [] // Remove all units
        };
        
        // Mark the action as used
        const newActionsUsed = { ...prevState.actionsUsed };
        const newRemainingHeroActions = type === 'hero' ? 
          prevState.remainingHeroActions - 1 : 
          prevState.remainingHeroActions;
          
        if (type === 'unit') {
          newActionsUsed.unitAction = true;
        }
        
        return {
          ...prevState,
          players: newPlayers,
          selectedCardData: null,
          targetingMode: false,
          actionsUsed: newActionsUsed,
          remainingHeroActions: newRemainingHeroActions,
          attackType: null
        };
      } else if (target.type === 'monster' && typeof target.index === 'number') {
        // Attack monster
        const targetMonster = prevState.monsters[target.index];
        
        if (!targetMonster) return prevState;
        
        // Apply the new combat system - if damage is less than monster health, no damage occurs
        if (attackValue < targetMonster.hp) {
          toast({
            title: `Attack unsuccessful!`,
            description: `Your ${prevState.attackType} attack (${attackValue}) was less than the monster's health (${targetMonster.hp})! No damage dealt.`,
            variant: "default"
          });
          
          // Mark the action as used
          const newActionsUsed = { ...prevState.actionsUsed };
          const newRemainingHeroActions = type === 'hero' ? 
            prevState.remainingHeroActions - 1 : 
            prevState.remainingHeroActions;
            
          if (type === 'unit') {
            newActionsUsed.unitAction = true;
          }
          
          return {
            ...prevState,
            selectedCardData: null,
            targetingMode: false,
            actionsUsed: newActionsUsed,
            remainingHeroActions: newRemainingHeroActions,
            attackType: null
          };
        }
        
        // If damage is greater than or equal to monster health, monster is defeated
        const goldReward = targetMonster.goldReward;
        
        // Remove monster
        const newMonsters = [
          ...prevState.monsters.slice(0, target.index),
          ...prevState.monsters.slice(target.index + 1)
        ];
        
        // NEW: Monster deals damage back to hero
        const attackingPlayerIndex = prevState.currentPlayer - 1;
        const attackingHero = attackingPlayer.hero;
        let updatedHero = attackingHero;
        
        if (attackingHero) {
          // Monster deals damage based on its attack stats 
          // Physical attack reduced by hero's DP
          // Magical attack reduced by hero's RP
          const monsterPhysicalDamage = Math.max(0, targetMonster.ap - attackingHero.dp);
          const monsterMagicalDamage = Math.max(0, targetMonster.mp - attackingHero.rp);
          const totalMonsterDamage = monsterPhysicalDamage + monsterMagicalDamage;
          
          if (totalMonsterDamage > 0) {
            const newHeroHealth = Math.max(0, attackingHero.hp - totalMonsterDamage);
            updatedHero = {
              ...attackingHero,
              hp: newHeroHealth
            };
            
            toast({
              title: `${targetMonster.name} counterattacked!`,
              description: `Your hero took ${totalMonsterDamage} damage.`,
              variant: "default"
            });
          }
        }
        
        toast({
          title: `Monster defeated!`,
          description: `${targetMonster.name} was defeated! Gained ${goldReward} gold!`,
          variant: "default"
        });
        
        // Update player gold and hero
        const playerIndex = prevState.currentPlayer - 1;
        const player = prevState.players[playerIndex];
        
        const newPlayers = [...prevState.players] as [Player, Player];
        newPlayers[playerIndex] = {
          ...player,
          gold: player.gold + goldReward,
          hero: updatedHero
        };
        
        // Check if hero died
        const heroKilled = updatedHero?.hp === 0;
        const newWinner = heroKilled ? (prevState.currentPlayer === 1 ? 2 : 1) : null;
        const newGamePhase = heroKilled ? 'gameOver' : prevState.gamePhase;
        
        if (heroKilled) {
          toast({
            title: `Player ${prevState.currentPlayer} defeated!`,
            description: `${updatedHero?.name} was killed by monster counterattack!`,
            variant: "destructive"
          });
        }
        
        // Mark the action as used
        const newActionsUsed = { ...prevState.actionsUsed };
        const newRemainingHeroActions = type === 'hero' ? 
          prevState.remainingHeroActions - 1 : 
          prevState.remainingHeroActions;
          
        if (type === 'unit') {
          newActionsUsed.unitAction = true;
        }
        
        return {
          ...prevState,
          players: newPlayers,
          monsters: newMonsters,
          selectedCardData: null,
          targetingMode: false,
          actionsUsed: newActionsUsed,
          remainingHeroActions: newRemainingHeroActions,
          gamePhase: newGamePhase,
          winner: newWinner,
          attackType: null
        };
      }
      
      return {
        ...prevState,
        selectedCardData: null,
        targetingMode: false,
        attackType: null
      };
    });
  }, [calculateUnitStats, hasProvocateurUnit, getProvocateurUnitIndex]);

  // Cancel an action
  const cancelAction = useCallback(() => {
    setGameState(prevState => {
      return {
        ...prevState,
        selectedCardData: null,
        targetingMode: false,
        attackType: null
      };
    });
  }, []);

  // Check if game is over
  useEffect(() => {
    if (gameState.gamePhase !== 'gameOver' && (gameState.players[0].hero?.hp <= 0 || gameState.players[1].hero?.hp <= 0)) {
      const winner = gameState.players[0].hero?.hp <= 0 ? 2 : 1;
      setGameState(prevState => ({
        ...prevState,
        gamePhase: 'gameOver',
        winner
      }));
    }
  }, [gameState.players, gameState.gamePhase]);

  // Automatically advance phase if needed (for example, when player has no gold to buy anything)
  useEffect(() => {
    // Only run this effect during player turns and when we're not in the end phase
    if ((gameState.gamePhase === 'player1Turn' || gameState.gamePhase === 'player2Turn') && 
        gameState.actionPhase !== 'end' && 
        !gameState.targetingMode) {
      
      // Check if the current phase should be skipped
      if (shouldSkipPhase(gameState, gameState.actionPhase)) {
        // Use setTimeout to avoid state updates during rendering
        const timer = setTimeout(() => {
          nextPhase();
        }, 500); // Short delay to make the transition visible
        
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, shouldSkipPhase, nextPhase]);

  return {
    gameState,
    initializeGame,
    resetGame,
    selectHero,
    startTurn,
    buyCard,
    nextPhase,
    selectCard,
    attack,
    cancelAction,
    selectAttackType
  };
};
