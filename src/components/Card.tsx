
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Swords, Heart, Zap, ArrowRightLeft, Clock } from 'lucide-react';
import { Card as CardType } from '@/data/cards';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  isTargetable?: boolean;
  isEnemy?: boolean;
  className?: string;
}

const Card = ({ card, onClick, isSelected, isTargetable, isEnemy, className }: CardProps) => {
  const cardTypeClasses = {
    hero: 'hero-card',
    unit: 'unit-card',
    monster: 'monster-card',
    equipment: 'equipment-card'
  };

  const getCardImage = (image: string) => {
    // In a real app, use actual images
    // For this demo, we'll use background colors as placeholders
    const images: Record<string, string> = {
      // Heroes
      warrior: 'bg-red-700',
      mage: 'bg-blue-700',
      ranger: 'bg-green-700',
      necromancer: 'bg-purple-900',
      witch: 'bg-purple-700',
      pyromancer: 'bg-orange-700',
      adept: 'bg-indigo-700',
      rogue: 'bg-slate-700',
      fugitive: 'bg-amber-800',
      acolyte: 'bg-cyan-900',
      
      // Units/Monsters
      knight: 'bg-amber-700',
      archer: 'bg-teal-700',
      cleric: 'bg-indigo-700',
      assassin: 'bg-purple-700',
      wizard: 'bg-sky-700',
      goblin: 'bg-green-800',
      troll: 'bg-gray-700',
      dragon: 'bg-red-900',
      spider: 'bg-purple-900',
      wolf: 'bg-gray-600',
      bandit: 'bg-amber-800',
      boar: 'bg-amber-600',
      bear: 'bg-amber-900',
      cultist: 'bg-indigo-900',
      ghoul: 'bg-green-900',
      statue: 'bg-slate-800',
      darkacolyte: 'bg-blue-900',
      wraith: 'bg-purple-800',
      rat: 'bg-brown-700',
      spirit: 'bg-cyan-800',
      skeleton: 'bg-gray-300',
      zombie: 'bg-green-800',
      golem: 'bg-stone-700',
      deathknight: 'bg-black',
      demon: 'bg-red-800',
      devil: 'bg-red-900',
      elemental: 'bg-orange-600',
      demonlord: 'bg-red-950',
      souleater: 'bg-purple-950',
      lich: 'bg-cyan-950',
      abomination: 'bg-green-950',
      
      // Equipment
      sword: 'bg-gray-400',
      axe: 'bg-amber-700',
      shield: 'bg-blue-400',
      helmet: 'bg-slate-400',
      amulet: 'bg-purple-400',
      staff: 'bg-indigo-400',
      wand: 'bg-cyan-400',
      robe: 'bg-violet-400',
      boots: 'bg-emerald-400'
    };

    return images[image] || 'bg-gray-500';
  };

  return (
    <div 
      className={cn(
        cardTypeClasses[card.type] || 'game-card',
        {
          'ring-4 ring-yellow-400 ring-opacity-60': isSelected,
          'card-target': isTargetable,
          'opacity-70': isEnemy && !isTargetable
        },
        className
      )}
      onClick={onClick}
    >
      <div className="game-card-title bg-black bg-opacity-70">
        {card.name}
      </div>
      
      <div className={cn('game-card-image', getCardImage(card.image))}></div>
      
      <div className="p-1 text-xs h-12 overflow-y-auto bg-black bg-opacity-50">
        {card.description}
      </div>
      
      <div className="game-card-stats bg-black bg-opacity-70">
        {/* Show different stats based on card type */}
        {(card.type === 'hero') && (
          <div className="grid grid-cols-3 gap-1">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              <span>{card.hp}/{card.maxHp}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Swords className="h-3 w-3 text-yellow-500" />
              <span>{card.ap}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              <span>{card.mp}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span>{card.dp}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <ArrowRightLeft className="h-3 w-3 text-purple-500" />
              <span>{card.rp}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-cyan-500" />
              <span>{card.sp}</span>
            </div>
          </div>
        )}
        
        {(card.type === 'unit' || card.type === 'monster') && (
          <div className="grid grid-cols-3 gap-1">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              <span>{card.hp}/{card.maxHp}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Swords className="h-3 w-3 text-yellow-500" />
              <span>{card.ap}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              <span>{card.mp}</span>
            </div>
          </div>
        )}
        
        {card.type === 'equipment' && (
          <div className="w-full text-center">
            {card.bonusStat === 'ap' && (
              <div className="flex items-center justify-center gap-1">
                <Swords className="h-3 w-3 text-yellow-500" />
                <span>+{card.bonusAmount}</span>
              </div>
            )}
            {card.bonusStat === 'mp' && (
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-3 w-3 text-blue-500" />
                <span>+{card.bonusAmount}</span>
              </div>
            )}
            {card.bonusStat === 'dp' && (
              <div className="flex items-center justify-center gap-1">
                <Shield className="h-3 w-3 text-green-500" />
                <span>+{card.bonusAmount}</span>
              </div>
            )}
            {card.bonusStat === 'rp' && (
              <div className="flex items-center justify-center gap-1">
                <ArrowRightLeft className="h-3 w-3 text-purple-500" />
                <span>+{card.bonusAmount}</span>
              </div>
            )}
            {card.bonusStat === 'sp' && (
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-cyan-500" />
                <span>+{card.bonusAmount}</span>
              </div>
            )}
            {card.bonusStat === 'hp' && (
              <div className="flex items-center justify-center gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                <span>+{card.bonusAmount}</span>
              </div>
            )}
          </div>
        )}
        
        {card.type === 'monster' && (
          <div className="flex items-center gap-1 text-game-gold">
            <span>+{card.goldReward}G</span>
          </div>
        )}
        
        {(card.type === 'unit' || card.type === 'equipment') && 'cost' in card && (
          <div className="flex items-center gap-1 text-game-gold">
            <span>{card.cost}G</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
