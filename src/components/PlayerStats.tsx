
import React from 'react';
import { Player } from '@/hooks/useGameState';
import { Coins, Swords, Shield, Heart, Zap, ArrowRightLeft, Clock } from 'lucide-react';

interface PlayerStatsProps {
  player: Player;
  isCurrentPlayer: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, isCurrentPlayer }) => {
  const heroStats = player.hero ? (
    <div className="grid grid-cols-3 gap-x-4 gap-y-1">
      <div className="flex items-center gap-1">
        <Heart className="h-5 w-5 text-red-500" />
        <span className="font-semibold">{player.hero.hp}/{player.hero.maxHp} HP</span>
      </div>
      <div className="flex items-center gap-1">
        <Swords className="h-5 w-5 text-yellow-500" />
        <span className="font-semibold">{player.hero.ap} AP</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap className="h-5 w-5 text-blue-500" />
        <span className="font-semibold">{player.hero.mp} MP</span>
      </div>
      <div className="flex items-center gap-1">
        <Shield className="h-5 w-5 text-green-500" />
        <span className="font-semibold">{player.hero.dp} DP</span>
      </div>
      <div className="flex items-center gap-1">
        <ArrowRightLeft className="h-5 w-5 text-purple-500" />
        <span className="font-semibold">{player.hero.rp} RP</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-5 w-5 text-cyan-500" />
        <span className="font-semibold">{player.hero.sp} SP</span>
      </div>
    </div>
  ) : null;

  return (
    <div className={`rounded-lg p-3 ${isCurrentPlayer ? 'bg-game-purple bg-opacity-30 border-2 border-game-purple' : 'bg-black bg-opacity-30'}`}>
      <div className="flex items-center justify-between mb-2">
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
