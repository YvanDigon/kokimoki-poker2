import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { globalStore } from '../stores/global-store';
import { playerStore, type PlayerState } from '../stores/player-store';

// Ensure unique player name
function ensureUniqueName(name: string, existingPlayers: Record<string, any>): string {
	const existingNames = Object.values(existingPlayers).map(p => p.name);
	let uniqueName = name;
	let counter = 1;
	
	while (existingNames.includes(uniqueName)) {
		uniqueName = `${name}${counter}`;
		counter++;
	}
	
	return uniqueName;
}

export const playerActions = {
	async setCurrentView(view: PlayerState['currentView']) {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.currentView = view;
		});
	},

	async setPlayerName(name: string) {
		await kmClient.transact(
			[playerStore, globalStore],
			([playerState, globalState]) => {
				const uniqueName = ensureUniqueName(name, globalState.players);
				playerState.name = uniqueName;
				globalState.players[kmClient.id] = {
					name: uniqueName,
					cards: [],
					gold: config.startingGold,
					bet: 0,
					folded: false,
					handRank: 0,
					handName: '',
					cheated: false,
					accusedOfCheating: false,
					wronglyAccused: false,				receivedRedistributedGold: false,					changedCards: false,
					receivedEliminationBonus: false,
					refreshCount: 0,
					botchedCheating: false,
					muggedVictimId: '',
					muggedAmount: 0,
					hasMugged: false
				};
			}
		);
	},

	async clearPlayerName() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.name = '';
		});
	},

	async toggleCardSelection(index: number) {
		await kmClient.transact([playerStore], ([playerState]) => {
			const currentIndices = playerState.selectedCardIndices;
			const indexPos = currentIndices.indexOf(index);
			
			if (indexPos >= 0) {
				// Remove from selection
				currentIndices.splice(indexPos, 1);
			} else {
				// Add to selection
				currentIndices.push(index);
			}
		});
	},

	async clearCardSelection() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.selectedCardIndices = [];
		});
	},

	async rejoinGame() {
		await kmClient.transact(
			[playerStore, globalStore],
			([playerState, globalState]) => {
				// Store the eliminated player's name for presenter display
				if (playerState.name && !globalState.eliminatedPlayers.includes(playerState.name)) {
					globalState.eliminatedPlayers.push(playerState.name);
				}
				
				// Clear local name so player goes through name entry again
				playerState.name = '';
				
				// Note: The old player entry in globalState.players will be removed when they
				// create a new player with a new name. The eliminated name is preserved in
				// eliminatedPlayers array for presenter display until host resets.
			}
		);
	},

	async tapCard(index: number) {
		await kmClient.transact([playerStore], ([playerState]) => {
			// Reset all other cards' tap counts (only consecutive taps on same card count)
			const currentTaps = playerState.cardTaps[index] || 0;
			playerState.cardTaps = { [index]: currentTaps + 1 };

			// If tapped 4 times consecutively, enter cheat mode
			if (playerState.cardTaps[index] === 4) {
				playerState.cheatMode = true;
				playerState.cheatCardIndex = index;
			}
		});
	},

	async cancelCheat() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.cheatMode = false;
			playerState.cheatCardIndex = -1;
		});
	},

	async resetTaps() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.cardTaps = {};
			playerState.cheatMode = false;
			playerState.cheatCardIndex = -1;
		});
	},

	async showCheatTip() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.showCheatTip = true;
		});
	},

	async dismissCheatTip() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.showCheatTip = false;
		});
	},

	async tapMugArea() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.mugTapCount += 1;
			
			console.log('[tapMugArea] Tap count:', playerState.mugTapCount);
			
			// If tapped 4 times, show mug selector and reset count
			if (playerState.mugTapCount >= 4) {
				playerState.showMugSelector = true;
				playerState.mugTapCount = 0;
				console.log('[tapMugArea] Showing mug selector');
			}
		});
	},

	async resetMugTaps() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.mugTapCount = 0;
			playerState.showMugSelector = false;
		});
	},

	async closeMugSelector() {
		await kmClient.transact([playerStore], ([playerState]) => {
			playerState.showMugSelector = false;
		});
	}
};
