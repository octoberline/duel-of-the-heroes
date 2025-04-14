
import React from 'react';
import { UnitCard as UnitCardType, EquipmentCard as EquipmentCardType } from '@/data/cards';
import Card from './Card';
import { Coins } from 'lucide-react';

interface ShopProps {
  shopCards: (UnitCardType | EquipmentCardType)[];
  playerGold: number;
  onBuyCard: (index: number) => void;
  disabled?: boolean;
}

const Shop: React.FC<ShopProps> = ({ shopCards, playerGold, onBuyCard, disabled }) => {
  return (
    <div className="bg-black bg-opacity-50 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Shop</h2>
        <div className="game-gold">
          <Coins className="h-5 w-5 text-game-gold" />
          <span>{playerGold}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {shopCards.map((card, index) => (
          <div key={card.id + index} className="flex flex-col items-center">
            <Card 
              card={card} 
              onClick={() => !disabled && onBuyCard(index)}
              className={disabled ? "opacity-50 cursor-not-allowed" : ""}
            />
            <button 
              className="mt-2 px-3 py-1 bg-game-gold hover:bg-yellow-600 text-black rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => !disabled && onBuyCard(index)}
              disabled={disabled || playerGold < ('cost' in card ? card.cost : 0)}
            >
              Buy ({('cost' in card ? card.cost : 0)}G)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
