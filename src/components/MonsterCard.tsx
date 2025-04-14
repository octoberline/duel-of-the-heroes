
import React from 'react';
import { MonsterCard as MonsterCardType } from '@/data/cards';
import Card from './Card';

interface MonsterCardProps {
  monster: MonsterCardType;
  onClick?: () => void;
  isTargetable?: boolean;
  index: number;
}

const MonsterCard: React.FC<MonsterCardProps> = ({ monster, onClick, isTargetable, index }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-bold mb-1">Monster {index + 1}</div>
      <Card
        card={monster}
        onClick={onClick}
        isTargetable={isTargetable}
        className="scale-110" // Enlarged as requested
      />
      <div className="mt-1 text-xs text-gray-300">
        From: {monster.location.charAt(0).toUpperCase() + monster.location.slice(1)}
      </div>
    </div>
  );
};

export default MonsterCard;
