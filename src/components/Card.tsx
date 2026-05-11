/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CardData, CARD_WIDTH, CARD_HEIGHT, CARD_BORDER_RADIUS } from '../constants';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  data: CardData;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

export const Card: React.FC<CardProps> = ({ data, style, onMouseDown, isDragging }) => {
  const Icon = {
    hearts: Heart,
    diamonds: Diamond,
    clubs: Club,
    spades: Spade,
  }[data.suit];

  const colorClass = data.color === 'red' ? 'text-red-600' : 'text-slate-900';

  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute select-none overflow-hidden bg-white shadow-xl transition-shadow ${
        isDragging ? 'shadow-2xl ring-2 ring-blue-400 z-50' : 'z-10'
      } flex flex-col justify-between p-3 flex-shrink-0`}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: CARD_BORDER_RADIUS,
        cursor: isDragging ? 'grabbing' : 'grab',
        ...style,
      }}
    >
      {/* Top Left */}
      <div className={`flex flex-col items-center leading-none ${colorClass}`}>
        <span className="text-xl font-bold font-serif">{data.value}</span>
        <Icon size={16} fill="currentColor" />
      </div>

      {/* Center symbol */}
      <div className={`flex justify-center items-center ${colorClass}`}>
        <Icon size={48} fill="currentColor" strokeWidth={1} />
      </div>

      {/* Bottom Right (Upside down) */}
      <div className={`flex flex-col items-center leading-none self-end rotate-180 ${colorClass}`}>
        <span className="text-xl font-bold font-serif">{data.value}</span>
        <Icon size={16} fill="currentColor" />
      </div>
      
      {/* Subtle card texture/shine */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 to-black/5" />
    </div>
  );
};
