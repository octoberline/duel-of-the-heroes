import { useState, useCallback, useEffect } from 'react';
import { HeroCard, UnitCard, MonsterCard, EquipmentCard, heroes, getRandomMonsters, getRandomUnits, getRandomEquipment } from '../data/cards';
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
  selectedCard: { card: any; type: 'hero' | 'unit'; index?: number } | null;
  targetingMode: boolean;
  actionsUsed: {
    buy: boolean;
    heroAction: boolean;
    unitAction: boolean;
  };
};

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
  selectedCard: null,
  targetingMode: false,
  actionsUsed: {
    buy: false,
    heroAction: false,
    unitAction: false
  }
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

// Helper function to reduce monster health for game balance
const reduceMonsterHealth = (monster: MonsterCard): MonsterCard => {
  // Reduce health by approximately 25%, with a minimum of 2
  const newHealth = Math.max(2, Math.floor(monster.health * 0.75));
  return { ...monster, health: newHealth };
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
        // Get monsters with reduced health
        const baseMonsters = getRandomMonsters(2);
        newMonsters = baseMonsters.map(reduceMonsterHealth);
        
        // Get shop cards with reduced costs
        const baseShopCards = [...getRandomUnits(1), ...getRandomEquipment(1)];
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
        }
      };
    });
  }, []);

  // Start a player's turn
  const startTurn = useCallback((playerId: number) => {
    setGameState(prevState => {
      const playerIndex = playerId - 1;
      const player = prevState.players[playerIndex];
      
      // Give 5 gold at the start of turn
      const newGold = 5;
      
      return {
        ...prevState,
        currentPlayer: playerId,
        gamePhase: playerId === 1 ? 'player1Turn' : 'player2Turn',
        actionPhase: 'buy',
        players: [
          ...prevState.players.slice(0, playerIndex),
          { ...player, gold: newGold },
          ...prevState.players.slice(playerIndex + 1)
        ] as [Player, Player],
        actionsUsed: {
          buy: false,
          heroAction: false,
          unitAction: false
        }
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
          
          if (bonusStat === 'attack') {
            newPlayer.hero = {
              ...newPlayer.hero,
              attack: newPlayer.hero.attack + bonusAmount
            };
          } else if (bonusStat === 'defense') {
            newPlayer.hero = {
              ...newPlayer.hero,
              defense: newPlayer.hero.defense + bonusAmount
            };
          } else if (bonusStat === 'health') {
            newPlayer.hero = {
              ...newPlayer.hero,
              maxHealth: newPlayer.hero.maxHealth + bonusAmount,
              health: newPlayer.hero.health + bonusAmount
            };
          }
        }
      }
      
      // Remove card from shop and add a new one
      const newShop = [...prevState.shop];
      let newCard;
      
      if (card.type === 'unit') {
        newCard = getRandomUnits(1)[0];
      } else {
        newCard = getRandomEquipment(1)[0];
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
        // Skip hero action if it's already used
        return currentState.actionsUsed.heroAction;
      
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
            const baseNewMonsters = getRandomMonsters(monstersToAdd);
            const balancedNewMonsters = baseNewMonsters.map(reduceMonsterHealth);
            newMonsters = [...newMonsters, ...balancedNewMonsters];
          }
          
          // Refresh shop with reduced costs
          const baseShopCards = [...getRandomUnits(1), ...getRandomEquipment(1)];
          const newShop = baseShopCards.map(reduceCost);
          
          return {
            ...prevState,
            currentPlayer: newCurrentPlayer,
            gamePhase: newCurrentPlayer === 1 ? 'player1Turn' : 'player2Turn',
            actionPhase: 'buy',
            monsters: newMonsters,
            shop: newShop,
            selectedCard: null,
            targetingMode: false,
            actionsUsed: {
              buy: false,
              heroAction: false,
              unitAction: false
            }
          };
        default:
          newPhase = 'buy';
      }

      // Check if we should skip the next phase
      if (shouldSkipPhase(prevState, newPhase)) {
        // If we need to skip the next phase, recursively call nextPhase
        // We'll do this by returning the current state but with the updated phase
        // Then in the next render, we'll check again if we need to skip
        const updatedState = {
          ...prevState,
          actionPhase: newPhase,
          selectedCard: null,
          targetingMode: false
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
        selectedCard: null,
        targetingMode: false
      };
    });
  }, [shouldSkipPhase]);

  // Check if a player has a provocateur unit
  const hasProvocateurUnit = useCallback((playerIndex: number, gameState: GameState) => {
    return gameState.players[playerIndex].units.some(unit => unit.role === 'provocateur');
  }, []);

  // Get the first provocateur unit index for a player
  const getProvocateurUnitIndex = useCallback((playerIndex: number, gameState: GameState) => {
    return gameState.players[playerIndex].units.findIndex(unit => unit.role === 'provocateur');
  }, []);

  // Select a card for an action
  const selectCard = useCallback((card: any, type: 'hero' | 'unit', index?: number) => {
    setGameState(prevState => {
      // Check if the player has already used the corresponding action
      if ((type === 'hero' && prevState.actionsUsed.heroAction) || 
          (type === 'unit' && prevState.actionsUsed.unitAction)) {
        toast({
          title: "Action already used!",
          description: `You can only use one ${type === 'hero' ? 'hero' : 'unit'} action per turn.`,
          variant: "destructive"
        });
        return prevState;
      }

      return {
        ...prevState,
        selectedCard: { card, type, index },
        targetingMode: true
      };
    });
  }, []);

  // Calculate total unit attack power for a player
  const calculateUnitsTotalAttack = useCallback((units: UnitCard[]) => {
    return units.reduce((total, unit) => total + unit.attack, 0);
  }, []);

  // Calculate total unit health for a player
  const calculateUnitsTotalHealth = useCallback((units: UnitCard[]) => {
    return units.reduce((total, unit) => total + unit.health, 0);
  }, []);

  // Attack a target
  const attack = useCallback((target: Target) => {
    setGameState(prevState => {
      if (!prevState.selectedCard) return prevState;
      
      const { card, type } = prevState.selectedCard;
      const attackingPlayer = prevState.players[prevState.currentPlayer - 1];
      let attackValue = card.attack;
      
      // If unit attack, use combined attack of all units
      if (type === 'unit') {
        attackValue = calculateUnitsTotalAttack(attackingPlayer.units);
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
              selectedCard: null,
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
        
        // Calculate damage (reduced by defense)
        const damage = Math.max(1, attackValue - defendingPlayer.hero.defense);
        const newHealth = Math.max(0, defendingPlayer.hero.health - damage);
        
        // Update hero health
        const updatedHero = {
          ...defendingPlayer.hero,
          health: newHealth
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
        if (type === 'hero') {
          newActionsUsed.heroAction = true;
        } else if (type === 'unit') {
          newActionsUsed.unitAction = true;
        }
        
        return {
          ...prevState,
          players: newPlayers,
          gamePhase: gameOver ? 'gameOver' : prevState.gamePhase,
          winner,
          selectedCard: null,
          targetingMode: false,
          actionsUsed: newActionsUsed
        };
      } else if (target.type === 'unit' && target.playerId && typeof target.index === 'number') {
        // Attack enemy units
        const defendingPlayerIndex = target.playerId - 1;
        const defendingPlayer = prevState.players[defendingPlayerIndex];
        
        // Apply the new combat system - calculate total enemy unit health
        const totalEnemyUnitHealth = calculateUnitsTotalHealth(defendingPlayer.units);
        
        // If attack is less than total health, no damage occurs
        if (attackValue < totalEnemyUnitHealth) {
          toast({
            title: `Attack unsuccessful!`,
            description: `Your attack (${attackValue}) was less than the enemy units' total health (${totalEnemyUnitHealth})! No damage dealt.`,
            variant: "default"
          });
          
          // Mark the action as used
          const newActionsUsed = { ...prevState.actionsUsed };
          if (type === 'hero') {
            newActionsUsed.heroAction = true;
          } else if (type === 'unit') {
            newActionsUsed.unitAction = true;
          }
          
          return {
            ...prevState,
            selectedCard: null,
            targetingMode: false,
            actionsUsed: newActionsUsed
          };
        }
        
        // If attack is greater than or equal to total health, all units are destroyed
        toast({
          title: `Units destroyed!`,
          description: `Your attack (${attackValue}) destroyed all enemy units (${totalEnemyUnitHealth} total health)!`,
          variant: "default"
        });
        
        const newPlayers = [...prevState.players] as [Player, Player];
        newPlayers[defendingPlayerIndex] = {
          ...defendingPlayer,
          units: [] // Remove all units
        };
        
        // Mark the action as used
        const newActionsUsed = { ...prevState.actionsUsed };
        if (type === 'hero') {
          newActionsUsed.heroAction = true;
        } else if (type === 'unit') {
          newActionsUsed.unitAction = true;
        }
        
        return {
          ...prevState,
          players: newPlayers,
          selectedCard: null,
          targetingMode: false,
          actionsUsed: newActionsUsed
        };
      } else if (target.type === 'monster' && typeof target.index === 'number') {
        // Attack monster
        const targetMonster = prevState.monsters[target.index];
        
        if (!targetMonster) return prevState;
        
        // Apply the new combat system - if damage is less than monster health, no damage occurs
        if (attackValue < targetMonster.health) {
          toast({
            title: `Attack unsuccessful!`,
            description: `Your attack (${attackValue}) was less than the monster's health (${targetMonster.health})! No damage dealt.`,
            variant: "default"
          });
          
          // Mark the action as used
          const newActionsUsed = { ...prevState.actionsUsed };
          if (type === 'hero') {
            newActionsUsed.heroAction = true;
          } else if (type === 'unit') {
            newActionsUsed.unitAction = true;
          }
          
          return {
            ...prevState,
            selectedCard: null,
            targetingMode: false,
            actionsUsed: newActionsUsed
          };
        }
        
        // If damage is greater than or equal to monster health, monster is defeated
        const goldReward = targetMonster.goldReward;
        
        // Remove monster
        const newMonsters = [
          ...prevState.monsters.slice(0, target.index),
          ...prevState.monsters.slice(target.index + 1)
        ];
        
        toast({
          title: `Monster defeated!`,
          description: `${targetMonster.name} was defeated! Gained ${goldReward} gold!`,
          variant: "default"
        });
        
        // Update player gold
        const playerIndex = prevState.currentPlayer - 1;
        const player = prevState.players[playerIndex];
        
        const newPlayers = [...prevState.players] as [Player, Player];
        newPlayers[playerIndex] = {
          ...player,
          gold: player.gold + goldReward
        };
        
        // Mark the action as used
        const newActionsUsed = { ...prevState.actionsUsed };
        if (type === 'hero') {
          newActionsUsed.heroAction = true;
        } else if (type === 'unit') {
          newActionsUsed.unitAction = true;
        }
        
        return {
          ...prevState,
          players: newPlayers,
          monsters: newMonsters,
          selectedCard: null,
          targetingMode: false,
          actionsUsed: newActionsUsed
        };
      }
      
      return {
        ...prevState,
        selectedCard: null,
        targetingMode: false
      };
    });
  }, [calculateUnitsTotalAttack, calculateUnitsTotalHealth, hasProvocateurUnit, getProvocateurUnitIndex]);

  // Cancel an action
  const cancelAction = useCallback(() => {
    setGameState(prevState => {
      return {
        ...prevState,
        selectedCard: null,
        targetingMode: false
      };
    });
  }, []);

  // Check if game is over
  useEffect(() => {
    if (gameState.gamePhase !== 'gameOver' && (gameState.players[0].hero?.health <= 0 || gameState.players[1].hero?.health <= 0)) {
      const winner = gameState.players[0].hero?.health <= 0 ? 2 : 1;
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
    cancelAction
  };
};
