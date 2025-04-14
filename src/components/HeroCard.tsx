
import React from 'react';
import { HeroCard as HeroCardType } from '@/data/cards';
import Card from './Card';

interface HeroCardProps {
  hero: HeroCardType;
  onClick?: () => void;
  isSelected?: boolean;
  isTargetable?: boolean;
  isEnemy?: boolean;
}

const HeroCard: React.FC<HeroCardProps> = ({ hero, onClick, isSelected, isTargetable, isEnemy }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-bold mb-1">{isEnemy ? 'Enemy Hero' : 'Your Hero'}</div>
      <Card
        card={hero}
        onClick={onClick}
        isSelected={isSelected}
        isTargetable={isTargetable}
        isEnemy={isEnemy}
        className="transform scale-110"
      />
    </div>
  );
};

export default HeroCard;
