
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
        newMonsters = getRandomMonsters(2);
        newShop = [...getRandomUnits(1), ...getRandomEquipment(1)];
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
            newMonsters = [...newMonsters, ...getRandomMonsters(monstersToAdd)];
          }
          
          // Refresh shop
          const newShop = [...getRandomUnits(1), ...getRandomEquipment(1)];
          
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
      
      return {
        ...prevState,
        actionPhase: newPhase,
        selectedCard: null,
        targetingMode: false
      };
    });
  }, []);

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

  // Attack a target
  const attack = useCallback((target: Target) => {
    setGameState(prevState => {
      if (!prevState.selectedCard) return prevState;
      
      const { card, type, index } = prevState.selectedCard;
      const attackingPlayer = prevState.players[prevState.currentPlayer - 1];
      const attackValue = card.attack;
      
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
        // Attack enemy unit
        const defendingPlayerIndex = target.playerId - 1;
        const defendingPlayer = prevState.players[defendingPlayerIndex];
        const targetUnit = defendingPlayer.units[target.index];
        
        if (!targetUnit) return prevState;
        
        // Calculate damage
        const damage = attackValue;
        const newHealth = Math.max(0, targetUnit.health - damage);
        
        // Update unit health or remove if destroyed
        let newUnits;
        if (newHealth <= 0) {
          // Remove unit
          newUnits = [
            ...defendingPlayer.units.slice(0, target.index),
            ...defendingPlayer.units.slice(target.index + 1)
          ];
          
          toast({
            title: `Unit destroyed!`,
            description: `${targetUnit.name} was destroyed!`,
            variant: "default"
          });
        } else {
          // Update unit health
          const updatedUnit = {
            ...targetUnit,
            health: newHealth
          };
          
          newUnits = [
            ...defendingPlayer.units.slice(0, target.index),
            updatedUnit,
            ...defendingPlayer.units.slice(target.index + 1)
          ];
          
          toast({
            title: `Attack successful!`,
            description: `Dealt ${damage} damage to ${targetUnit.name}!`,
            variant: "default"
          });
        }
        
        const newPlayers = [...prevState.players] as [Player, Player];
        newPlayers[defendingPlayerIndex] = {
          ...defendingPlayer,
          units: newUnits
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
        
        // Calculate damage
        const damage = attackValue;
        const newHealth = Math.max(0, targetMonster.health - damage);
        
        let newMonsters;
        let goldReward = 0;
        
        if (newHealth <= 0) {
          // Monster defeated, gain gold
          goldReward = targetMonster.goldReward;
          
          // Remove monster
          newMonsters = [
            ...prevState.monsters.slice(0, target.index),
            ...prevState.monsters.slice(target.index + 1)
          ];
          
          toast({
            title: `Monster defeated!`,
            description: `${targetMonster.name} was defeated! Gained ${goldReward} gold!`,
            variant: "default"
          });
        } else {
          // Update monster health
          const updatedMonster = {
            ...targetMonster,
            health: newHealth
          };
          
          newMonsters = [
            ...prevState.monsters.slice(0, target.index),
            updatedMonster,
            ...prevState.monsters.slice(target.index + 1)
          ];
          
          toast({
            title: `Attack successful!`,
            description: `Dealt ${damage} damage to ${targetMonster.name}!`,
            variant: "default"
          });
        }
        
        // Update player gold if monster defeated
        const playerIndex = prevState.currentPlayer - 1;
        const player = prevState.players[playerIndex];
        
        const newPlayers = [...prevState.players] as [Player, Player];
        if (goldReward > 0) {
          newPlayers[playerIndex] = {
            ...player,
            gold: player.gold + goldReward
          };
        }
        
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
  }, [hasProvocateurUnit, getProvocateurUnitIndex]);

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
