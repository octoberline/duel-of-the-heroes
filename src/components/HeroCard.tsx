
import React from 'react';
import { HeroCard as HeroCardType } from '@/data/cards';
import Card from './Card';

interface HeroCardProps {
  hero: HeroCardType;
  onClick?: () => void;
  isSelected?: boolean;
  isTargetable?: boolean;
  isEnemy?: boolean;
  onAttackTypeSelect?: (type: 'physical' | 'magical') => void;
}

const HeroCard: React.FC<HeroCardProps> = ({ 
  hero, 
  onClick, 
  isSelected, 
  isTargetable, 
  isEnemy,
  onAttackTypeSelect 
}) => {
  // Determine if hero can use both attack types
  const canChooseAttackType = hero.ap > 0 && hero.mp > 0;
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-bold mb-1 flex items-center gap-2">
        {isEnemy ? 'Enemy Hero' : 'Your Hero'}
        <span className={`px-2 py-0.5 rounded-full text-xs ${hero.heroClass === 'warrior' ? 'bg-red-700' : 'bg-blue-700'}`}>
          {hero.heroClass === 'warrior' ? 'Warrior' : 'Mage'}
        </span>
      </div>
      <Card
        card={hero}
        onClick={onClick}
        isSelected={isSelected}
        isTargetable={isTargetable}
        isEnemy={isEnemy}
        className="transform scale-125" // Even larger scale for heroes
      />
      
      {!isEnemy && canChooseAttackType && onAttackTypeSelect && (
        <div className="mt-2 flex gap-2">
          <button 
            className="px-3 py-1 bg-red-700 text-white text-xs rounded-full hover:bg-red-800"
            onClick={() => onAttackTypeSelect('physical')}
          >
            Physical Attack
          </button>
          <button 
            className="px-3 py-1 bg-blue-700 text-white text-xs rounded-full hover:bg-blue-800"
            onClick={() => onAttackTypeSelect('magical')}
          >
            Magical Attack
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroCard;
