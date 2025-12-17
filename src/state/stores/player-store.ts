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
	mugTapCount: number;
	showMugSelector: boolean;
}

const initialState: PlayerState = {
	name: '',
	currentView: 'lobby',
	selectedCardIndices: [],
	cardTaps: {},
	cheatMode: false,
	cheatCardIndex: -1,
	showCheatTip: false,
	botchedCheating: false,
	mugTapCount: 0,
	showMugSelector: false
};

export const playerStore = kmClient.localStore<PlayerState>(
	'player',
	initialState
);
