
import React from 'react';
import { Player } from '@/hooks/useGameState';
import { Coins, Swords, Shield, Heart } from 'lucide-react';

interface PlayerStatsProps {
  player: Player;
  isCurrentPlayer: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, isCurrentPlayer }) => {
  const heroStats = player.hero ? (
    <div className="flex gap-4">
      <div className="flex items-center gap-1">
        <Heart className="h-5 w-5 text-red-500" />
        <span>{player.hero.health}/{player.hero.maxHealth}</span>
      </div>
      <div className="flex items-center gap-1">
        <Swords className="h-5 w-5 text-yellow-500" />
        <span>{player.hero.attack}</span>
      </div>
      <div className="flex items-center gap-1">
        <Shield className="h-5 w-5 text-blue-500" />
        <span>{player.hero.defense}</span>
      </div>
    </div>
  ) : null;

  return (
    <div className={`rounded-lg p-3 ${isCurrentPlayer ? 'bg-game-purple bg-opacity-30 border-2 border-game-purple' : 'bg-black bg-opacity-30'}`}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-bold">Player {player.id}</h2>
        <div className="game-gold">
          <Coins className="h-5 w-5 text-game-gold" />
          <span>{player.gold}</span>
        </div>
      </div>
      
      {heroStats}
      
      {isCurrentPlayer && (
        <div className="mt-2 text-sm text-green-400 animate-pulse">
          Your Turn
        </div>
      )}
    </div>
  );
};

export default PlayerStats;
