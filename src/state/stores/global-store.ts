import { kmClient } from '@/services/km-client';
import type { Rank, Suit } from '@/utils/card-utils';

export interface Card {
	suit: Suit;
	rank: Rank;
}

export interface PlayerData {
	name: string;
	cards: Card[];
	gold: number;
	bet: number;
	folded: boolean;
	handRank: number;
	handName: string;
	cheated: boolean;
	accusedOfCheating: boolean;
	wronglyAccused: boolean;
	receivedRedistributedGold: boolean;
}

export type GamePhase = 'betting' | 'results' | 'ended';

export interface GlobalState {
	controllerConnectionId: string;
	started: boolean;
	startTimestamp: number;
	players: Record<string, PlayerData>;
	phase: GamePhase;
	roundNumber: number;
	pot: number;
	remainingDeck: Card[];
	bettingPhaseStartTime: number;
	punishmentUsedThisRound: boolean;
	winners: string[];
	worstPerformerLastRound: string;
	eliminatedPlayers: string[]; // Names of eliminated players for presenter display
	suspectedCheaters: Record<string, string[]>; // playerId -> array of accuserIds
}

const initialState: GlobalState = {
	controllerConnectionId: '',
	started: false,
	startTimestamp: 0,
	players: {},
	phase: 'betting',
	roundNumber: 1,
	pot: 0,
	remainingDeck: [],
	bettingPhaseStartTime: 0,
	winners: [],
	punishmentUsedThisRound: false,
	worstPerformerLastRound: '',
	eliminatedPlayers: [],
	suspectedCheaters: {}
};

export const globalStore = kmClient.store<GlobalState>('global', initialState);
