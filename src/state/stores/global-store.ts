import { kmClient } from '@/services/km-client';
import type { Rank, Suit } from '@/utils/card-utils';

export interface Card {
	suit: Suit;
	rank: Rank;
}

export interface GlobalState {
	controllerConnectionId: string;
	started: boolean;
	startTimestamp: number;
	players: Record<string, PlayerData>;
	phase: 'betting' | 'results' | 'ended';
	roundNumber: number;
	pot: number;
	remainingDeck: Card[];
	bettingPhaseStartTime: number;
	winners: string[];
	punishmentUsedThisRound: boolean;
	losingPlayersLastRound: string[];
	suspectedCheaters: Record<string, string[]>;
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
	changedCards: boolean;
	receivedEliminationBonus: boolean;
	refreshCount: number;
	botchedCheating: boolean;
	muggedVictimId: string;
	muggedAmount: number;
	hasMugged: boolean;
	inComebackMode: boolean;
	comebackPrediction: string;
	justReturnedFromComeback: boolean;
	failedComebackPrediction: boolean;
	allPlayersFolded: boolean;
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
	losingPlayersLastRound: [],
	suspectedCheaters: {}
};

export const globalStore = kmClient.store<GlobalState>('global', initialState);
