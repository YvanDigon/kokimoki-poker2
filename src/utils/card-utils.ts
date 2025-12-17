import type { Card as GlobalCard } from '@/state/stores/global-store';

export type Card = GlobalCard;
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface HandEvaluation {
	rank: number; // 1-10 (10 = Royal Flush, 1 = High Card)
	name: string;
	tiebreakers: number[]; // For breaking ties
}

/**
 * Create a standard 52-card deck
 */
export function createDeck(): Card[] {
	const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
	const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	const deck: Card[] = [];

	for (const suit of suits) {
		for (const rank of ranks) {
			deck.push({ suit, rank });
		}
	}

	return deck;
}

/**
 * Shuffle a deck using Fisher-Yates algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
	const shuffled = [...deck];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Get numeric value for a rank
 */
function getRankValue(rank: Rank): number {
	const values: Record<Rank, number> = {
		'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10,
		'9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
	};
	return values[rank];
}

/**
 * Evaluate a poker hand and return its rank
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
	if (cards.length !== 5) {
		return { rank: 0, name: 'Invalid Hand', tiebreakers: [] };
	}

	const ranks = cards.map(c => c.rank);
	const suits = cards.map(c => c.suit);
	const rankValues = ranks.map(getRankValue).sort((a, b) => b - a);
	
	// Count occurrences of each rank
	const rankCounts = new Map<number, number>();
	for (const val of rankValues) {
		rankCounts.set(val, (rankCounts.get(val) || 0) + 1);
	}

	const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
	const uniqueRanks = Array.from(rankCounts.keys()).sort((a, b) => {
		const countA = rankCounts.get(a) || 0;
		const countB = rankCounts.get(b) || 0;
		if (countA !== countB) return countB - countA;
		return b - a;
	});

	const isFlush = suits.every(s => s === suits[0]);
	const isStraight = rankValues[0] - rankValues[4] === 4 && new Set(rankValues).size === 5;
	const isLowStraight = rankValues.includes(14) && rankValues.includes(5) && 
		rankValues.includes(4) && rankValues.includes(3) && rankValues.includes(2);

	// Royal Flush
	if (isFlush && isStraight && rankValues[0] === 14 && rankValues[4] === 10) {
		return { rank: 10, name: 'Royal Flush', tiebreakers: [] };
	}

	// Straight Flush
	if (isFlush && (isStraight || isLowStraight)) {
		const high = isLowStraight ? 5 : rankValues[0];
		return { rank: 9, name: 'Straight Flush', tiebreakers: [high] };
	}

	// Four of a Kind
	if (counts[0] === 4) {
		return { rank: 8, name: 'Four of a Kind', tiebreakers: uniqueRanks };
	}

	// Full House
	if (counts[0] === 3 && counts[1] === 2) {
		return { rank: 7, name: 'Full House', tiebreakers: uniqueRanks };
	}

	// Flush
	if (isFlush) {
		return { rank: 6, name: 'Flush', tiebreakers: rankValues };
	}

	// Straight
	if (isStraight || isLowStraight) {
		const high = isLowStraight ? 5 : rankValues[0];
		return { rank: 5, name: 'Straight', tiebreakers: [high] };
	}

	// Three of a Kind
	if (counts[0] === 3) {
		return { rank: 4, name: 'Three of a Kind', tiebreakers: uniqueRanks };
	}

	// Two Pair
	if (counts[0] === 2 && counts[1] === 2) {
		return { rank: 3, name: 'Two Pair', tiebreakers: uniqueRanks };
	}

	// One Pair
	if (counts[0] === 2) {
		return { rank: 2, name: 'One Pair', tiebreakers: uniqueRanks };
	}

	// High Card
	return { rank: 1, name: 'High Card', tiebreakers: rankValues };
}

/**
 * Compare two hands (-1 if hand1 wins, 1 if hand2 wins, 0 if tie)
 */
export function compareHands(eval1: HandEvaluation, eval2: HandEvaluation): number {
	if (eval1.rank !== eval2.rank) {
		return eval2.rank - eval1.rank;
	}

	// Same rank, compare tiebreakers
	for (let i = 0; i < Math.max(eval1.tiebreakers.length, eval2.tiebreakers.length); i++) {
		const t1 = eval1.tiebreakers[i] || 0;
		const t2 = eval2.tiebreakers[i] || 0;
		if (t1 !== t2) {
			return t2 - t1;
		}
	}

	return 0; // Exact tie
}

/**
 * Get display symbol for suit
 */
export function getSuitSymbol(suit: Suit): string {
	const symbols: Record<Suit, string> = {
		hearts: '♥',
		diamonds: '♦',
		clubs: '♣',
		spades: '♠'
	};
	return symbols[suit];
}

/**
 * Get display text for rank
 */
export function getRankDisplay(rank: Rank): string {
	return rank;
}

/**
 * Generate a random card-themed name
 */
export function generateRandomCardName(): string {
	const adjectives = [
		'Lucky', 'Royal', 'Wild', 'Ace', 'Diamond', 'Golden', 'Sharp',
		'Swift', 'Clever', 'Bold', 'Brave', 'Mighty', 'Sneaky', 'Quick'
	];
	const nouns = [
		'King', 'Queen', 'Jack', 'Joker', 'Dealer', 'Player', 'Gambler',
		'Shark', 'Fox', 'Wolf', 'Tiger', 'Eagle', 'Dragon', 'Falcon'
	];
	
	const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	const num = Math.floor(Math.random() * 99) + 1;
	
	return `${adj}${noun}${num}`;
}

/**
 * Get hand quality description based on evaluation
 */
export function getHandQuality(evaluation: HandEvaluation): { text: string; emoji: string } {
	// Rank 1 = High Card, Rank 10 = Royal Flush
	switch (evaluation.rank) {
		case 1: // High Card
			return { text: 'Bad hand', emoji: '😞' };
		case 2: // One Pair
			return { text: 'Meh hand', emoji: '😐' };
		case 3: // Two Pair
			return { text: 'Good hand', emoji: '😊' };
		case 4: // Three of a Kind
			return { text: 'Nice hand', emoji: '😄' };
		case 5: // Straight
			return { text: 'Great hand', emoji: '🙂' };
		case 6: // Flush
			return { text: 'Strong hand', emoji: '💪' };
		case 7: // Full House
			return { text: 'Excellent hand', emoji: '😃' };
		case 8: // Four of a Kind
			return { text: 'Incredible hand', emoji: '🤩' };
		case 9: // Straight Flush
			return { text: 'Amazing hand', emoji: '🔥' };
		case 10: // Royal Flush
			return { text: 'Legendary hand', emoji: '👑' };
		default:
			return { text: 'Unknown hand', emoji: '❓' };
	}
}

/**
 * Check if cards contain duplicates (same rank AND suit)
 */
export function hasDuplicateCards(cards: Card[]): boolean {
	const seen = new Set<string>();
	for (const card of cards) {
		const key = `${card.suit}-${card.rank}`;
		if (seen.has(key)) {
			return true;
		}
		seen.add(key);
	}
	return false;
}
