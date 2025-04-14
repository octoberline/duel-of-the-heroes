
import React from 'react';
import { EquipmentCard as EquipmentCardType } from '@/data/cards';
import Card from './Card';

interface EquipmentCardProps {
  equipment: EquipmentCardType;
  onClick?: () => void;
  equipped?: boolean;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onClick, equipped }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-bold mb-1">{equipped ? 'Equipped' : equipment.equipmentType === 'weapon' ? 'Weapon' : 'Armor'}</div>
      <Card
        card={equipment}
        onClick={onClick}
        className={equipped ? "opacity-90 ring-2 ring-yellow-400" : ""}
      />
    </div>
  );
};

export default EquipmentCard;
