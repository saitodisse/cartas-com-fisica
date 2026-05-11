/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export type Suit = typeof SUITS[number];
export type Value = typeof VALUES[number];

export interface CardData {
  id: string;
  suit: Suit;
  value: Value;
  color: 'red' | 'black';
}

export const CARD_WIDTH = 120;
export const CARD_HEIGHT = 168;
export const CARD_BORDER_RADIUS = 8;

export function createDeck(): CardData[] {
  const deck: CardData[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({
        id: `${value}-${suit}`,
        suit,
        value,
        color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
      });
    }
  }
  return deck;
}
