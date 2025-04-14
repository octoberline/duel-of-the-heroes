
import React from 'react';
import { UnitCard as UnitCardType } from '@/data/cards';
import Card from './Card';

interface UnitCardProps {
  unit: UnitCardType;
  onClick?: () => void;
  isSelected?: boolean;
  isTargetable?: boolean;
  isEnemy?: boolean;
  index?: number;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, onClick, isSelected, isTargetable, isEnemy, index }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-bold mb-1">{isEnemy ? 'Enemy Unit' : 'Your Unit'} {typeof index === 'number' ? index + 1 : ''}</div>
      <Card
        card={unit}
        onClick={onClick}
        isSelected={isSelected}
        isTargetable={isTargetable}
        isEnemy={isEnemy}
      />
    </div>
  );
};

export default UnitCard;
