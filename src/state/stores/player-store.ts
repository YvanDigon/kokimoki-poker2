import { kmClient } from '@/services/km-client';

export interface PlayerState {
	name: string;
	currentView: 'lobby' | 'betting' | 'results' | 'connections';
	selectedCardIndices: number[];
	cardTaps: Record<number, number>;
	cheatMode: boolean;
	cheatCardIndex: number;
	showCheatTip: boolean;
	botchedCheating: boolean;
}

const initialState: PlayerState = {
	name: '',
	currentView: 'lobby',
	selectedCardIndices: [],
	cardTaps: {},
	cheatMode: false,
	cheatCardIndex: -1,
	showCheatTip: false,
	botchedCheating: false
};

export const playerStore = kmClient.localStore<PlayerState>(
	'player',
	initialState
);
