
import React from 'react';
import { useGameState, GamePhase, ActionPhase } from '@/hooks/useGameState';
import { heroes } from '@/data/cards';
import HeroCard from './HeroCard';
import UnitCard from './UnitCard';
import MonsterCard from './MonsterCard';
import EquipmentCard from './EquipmentCard';
import Shop from './Shop';
import PlayerStats from './PlayerStats';
import { Button } from '@/components/ui/button';
import { Coins, Sword, Users, Flag, ArrowRightCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const GameBoard: React.FC = () => {
  const {
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
  } = useGameState();

  const {
    players,
    currentPlayer,
    monsters,
    shop,
    gamePhase,
    actionPhase,
    winner,
    selectedCard,
    targetingMode
  } = gameState;

  React.useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleHeroSelect = (heroIndex: number) => {
    if (gamePhase !== 'chooseHero') return;
    
    const hero = heroes[heroIndex];
    // Determine which player is choosing
    const playerId = players[0].hero ? 2 : 1;
    selectHero(hero, playerId);
    
    toast({
      title: `Player ${playerId} selected ${hero.name}!`,
      description: hero.description,
    });
  };

  const handleCardSelect = (cardType: 'hero' | 'unit', card: any, index?: number) => {
    if (!targetingMode && ((cardType === 'hero' && actionPhase === 'heroAction') || 
        (cardType === 'unit' && actionPhase === 'unitAction'))) {
      selectCard(card, cardType, index);
    }
  };

  const handleTargetSelect = (targetType: 'hero' | 'unit' | 'monster', targetPlayerId?: number, index?: number) => {
    if (targetingMode && selectedCard) {
      attack({ type: targetType, playerId: targetPlayerId, index });
    }
  };

  const renderGamePhase = () => {
    switch (gamePhase) {
      case 'chooseHero':
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6">
              {players[0].hero ? 'Player 2, choose your hero!' : 'Player 1, choose your hero!'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {heroes.map((hero, index) => (
                <div key={hero.id} className="flex flex-col items-center">
                  <HeroCard hero={hero} onClick={() => handleHeroSelect(index)} />
                  <Button 
                    className="mt-4 action-button"
                    onClick={() => handleHeroSelect(index)}
                  >
                    Select {hero.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'player1Turn':
      case 'player2Turn':
        return renderGameBoard();
      
      case 'gameOver':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-4xl font-bold mb-6 text-game-gold">Game Over!</h2>
            <p className="text-2xl mb-8">Player {winner} wins!</p>
            <Button 
              className="action-button text-xl px-8 py-6"
              onClick={() => resetGame()}
            >
              Play Again
            </Button>
          </div>
        );
      
      default:
        return <div>Loading game...</div>;
    }
  };

  const renderPhaseIndicator = () => {
    let phaseText = '';
    let phaseIcon = null;

    switch (actionPhase) {
      case 'buy':
        phaseText = 'Buy Phase';
        phaseIcon = <Coins className="h-5 w-5" />;
        break;
      case 'heroAction':
        phaseText = 'Hero Action Phase';
        phaseIcon = <Sword className="h-5 w-5" />;
        break;
      case 'unitAction':
        phaseText = 'Unit Action Phase';
        phaseIcon = <Users className="h-5 w-5" />;
        break;
      case 'end':
        phaseText = 'End Turn';
        phaseIcon = <Flag className="h-5 w-5" />;
        break;
    }

    return (
      <div className="flex items-center gap-2 bg-black bg-opacity-50 px-4 py-2 rounded-full">
        {phaseIcon}
        <span className="font-semibold">{phaseText}</span>
      </div>
    );
  };

  const renderGameBoard = () => {
    const currentPlayerObj = players[currentPlayer - 1];
    const otherPlayerObj = players[currentPlayer === 1 ? 1 : 0];
    
    // Determine if cards are targetable
    const isEnemyHeroTargetable = targetingMode && selectedCard;
    const areEnemyUnitsTargetable = targetingMode && selectedCard;
    const areMonstersTargetable = targetingMode && selectedCard;
    
    return (
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <PlayerStats player={players[0]} isCurrentPlayer={currentPlayer === 1} />
          <div className="flex-grow flex justify-center items-center">
            {renderPhaseIndicator()}
          </div>
          <PlayerStats player={players[1]} isCurrentPlayer={currentPlayer === 2} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Player Area */}
          <div className="lg:col-span-5 player-area">
            <h2 className="text-xl font-bold mb-4">Your Cards</h2>
            
            {/* Hero */}
            {currentPlayerObj.hero && (
              <div className="mb-6">
                <HeroCard 
                  hero={currentPlayerObj.hero} 
                  onClick={() => handleCardSelect('hero', currentPlayerObj.hero)}
                  isSelected={selectedCard?.card.id === currentPlayerObj.hero?.id}
                />
              </div>
            )}
            
            {/* Player Units */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {currentPlayerObj.units.map((unit, index) => (
                <UnitCard 
                  key={unit.id + index}
                  unit={unit}
                  index={index}
                  onClick={() => handleCardSelect('unit', unit, index)}
                  isSelected={selectedCard?.card.id === unit.id && selectedCard?.index === index}
                />
              ))}
              {currentPlayerObj.units.length === 0 && (
                <div className="col-span-3 text-center text-gray-400 p-4">
                  No units deployed
                </div>
              )}
            </div>
            
            {/* Equipment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlayerObj.equipment.weapon && (
                <EquipmentCard equipment={currentPlayerObj.equipment.weapon} equipped />
              )}
              {currentPlayerObj.equipment.armor && (
                <EquipmentCard equipment={currentPlayerObj.equipment.armor} equipped />
              )}
              {!currentPlayerObj.equipment.weapon && !currentPlayerObj.equipment.armor && (
                <div className="col-span-2 text-center text-gray-400 p-4">
                  No equipment equipped
                </div>
              )}
            </div>
          </div>
          
          {/* Middle Area - Monsters and Shop */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-black bg-opacity-50 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Monsters</h2>
              <div className="flex flex-col gap-4">
                {monsters.map((monster, index) => (
                  <MonsterCard 
                    key={monster.id + index}
                    monster={monster}
                    index={index}
                    isTargetable={areMonstersTargetable}
                    onClick={() => handleTargetSelect('monster', undefined, index)}
                  />
                ))}
                {monsters.length === 0 && (
                  <div className="text-center text-gray-400 p-4">
                    No monsters
                  </div>
                )}
              </div>
            </div>
            
            {actionPhase === 'buy' && (
              <Shop 
                shopCards={shop}
                playerGold={currentPlayerObj.gold}
                onBuyCard={buyCard}
              />
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-auto">
              {targetingMode ? (
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={cancelAction}
                >
                  Cancel Action
                </Button>
              ) : (
                <Button 
                  className="action-button flex items-center gap-2"
                  onClick={nextPhase}
                >
                  <span>Next Phase</span>
                  <ArrowRightCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Enemy Area */}
          <div className="lg:col-span-5 player-area">
            <h2 className="text-xl font-bold mb-4">Enemy Cards</h2>
            
            {/* Enemy Hero */}
            {otherPlayerObj.hero && (
              <div className="mb-6">
                <HeroCard 
                  hero={otherPlayerObj.hero} 
                  isEnemy
                  isTargetable={isEnemyHeroTargetable}
                  onClick={() => handleTargetSelect('hero', otherPlayerObj.id)}
                />
              </div>
            )}
            
            {/* Enemy Units */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherPlayerObj.units.map((unit, index) => (
                <UnitCard 
                  key={unit.id + index}
                  unit={unit}
                  index={index}
                  isEnemy
                  isTargetable={areEnemyUnitsTargetable}
                  onClick={() => handleTargetSelect('unit', otherPlayerObj.id, index)}
                />
              ))}
              {otherPlayerObj.units.length === 0 && (
                <div className="col-span-3 text-center text-gray-400 p-4">
                  No enemy units
                </div>
              )}
            </div>
          </div>
        </div>
        
        {targetingMode && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 p-4 rounded-lg shadow-lg">
            <p className="text-lg font-bold mb-2">Select a target</p>
            <p className="text-sm">Click on an enemy hero, unit, or monster to attack</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-game-gold">Duel of Heroes</h1>
        <div className="game-board p-8">
          {renderGamePhase()}
        </div>
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>Duel of Heroes - A turn-based card deck building game</p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
