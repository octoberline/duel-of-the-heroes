
import React from 'react';
import { UnitCard as UnitCardType } from '@/data/cards';
import Card from './Card';
import { Shield } from 'lucide-react';

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
      <div className="text-sm font-bold mb-1 flex items-center gap-1">
        {isEnemy ? 'Enemy Unit' : 'Your Unit'} {typeof index === 'number' ? index + 1 : ''}
        {unit.role === 'provocateur' && <Shield className="h-4 w-4 text-red-500" aria-label="Provocateur" />}
      </div>
      <Card
        card={unit}
        onClick={onClick}
        isSelected={isSelected}
        isTargetable={isTargetable}
        isEnemy={isEnemy}
      />
      {unit.role === 'provocateur' && (
        <div className="mt-1 px-2 py-0.5 bg-red-700 text-white text-xs rounded-full">
          Provocateur
        </div>
      )}
    </div>
  );
};

export default UnitCard;
