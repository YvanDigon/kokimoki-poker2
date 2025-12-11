import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { createDeck, shuffleDeck, evaluateHand, compareHands } from '@/utils/card-utils';
import type { Card } from '../stores/global-store';
import { globalStore } from '../stores/global-store';

export const globalActions = {
	async startGame() {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.started = true;
			globalState.startTimestamp = kmClient.serverTimestamp();
			globalState.phase = 'betting';
			globalState.roundNumber = 1;
			globalState.pot = 0;
			globalState.winners = [];
			globalState.bettingPhaseStartTime = kmClient.serverTimestamp();
			globalState.punishmentUsedThisRound = false;

		// Initialize player data with starting gold
		const playerIds = Object.keys(globalState.players);
		for (const playerId of playerIds) {
			globalState.players[playerId] = {
				...globalState.players[playerId],
				cards: [],
				gold: config.startingGold,
				bet: 0,
				folded: false,
				handRank: 0,
				handName: '',
				cheated: false,
				accusedOfCheating: false,
				wronglyAccused: false,
				receivedRedistributedGold: false
			};
		}			// Create and shuffle deck (1 deck per 10 players)
			const numDecks = Math.ceil(playerIds.length / 10);
			let fullDeck: Card[] = [];
			for (let i = 0; i < numDecks; i++) {
				fullDeck = fullDeck.concat(createDeck());
			}
			fullDeck = shuffleDeck(fullDeck);

			// Deal 5 cards to each player
			for (const playerId of playerIds) {
				globalState.players[playerId].cards = fullDeck.splice(0, 5);
			}

			globalState.remainingDeck = fullDeck;
			
			// Deduct minimal bet from all players and add to pot
			for (const playerId of playerIds) {
				const player = globalState.players[playerId];
				if (player.gold >= config.minimalBet) {
					player.gold -= config.minimalBet;
					globalState.pot += config.minimalBet;
				} else {
					// Player doesn't have enough gold for minimal bet, take what they have
					globalState.pot += player.gold;
					player.gold = 0;
				}
			}
		});
	},

	async startNewRound() {
		await kmClient.transact([globalStore], ([globalState]) => {
			// Find worst performer from previous round (only among players who placed bets)
			const playersWhoBet = Object.entries(globalState.players).filter(
				([_, p]) => !p.folded && p.bet > 0 && p.handRank > 0
			);
			
			console.log('[startNewRound] Players who bet:', playersWhoBet.map(([id, p]) => ({
				id,
				name: p.name,
				bet: p.bet,
				folded: p.folded,
				handRank: p.handRank,
				handName: p.handName
			})));
			
			if (playersWhoBet.length > 1) {
				const lowestRank = Math.min(...playersWhoBet.map(([_, p]) => p.handRank));
				const playersWithLowestRank = playersWhoBet.filter(
					([_, p]) => p.handRank === lowestRank
				);
				
				console.log('[startNewRound] Lowest rank:', lowestRank);
				console.log('[startNewRound] Players with lowest rank:', playersWithLowestRank.map(([id, p]) => ({
					id,
					name: p.name,
					handRank: p.handRank
				})));
				
				// If tied for worst, pick one randomly
				const randomIndex = Math.floor(Math.random() * playersWithLowestRank.length);
				globalState.worstPerformerLastRound = playersWithLowestRank[randomIndex][0];
				console.log('[startNewRound] Worst performer set to:', playersWithLowestRank[randomIndex][0], playersWithLowestRank[randomIndex][1].name, playersWithLowestRank.length > 1 ? '(randomly selected from tie)' : '');
			} else {
				globalState.worstPerformerLastRound = '';
				console.log('[startNewRound] Not enough players who bet:', playersWhoBet.length);
			}

		globalState.phase = 'betting';
		globalState.roundNumber += 1;
		globalState.pot = 0;
		globalState.winners = [];
		globalState.bettingPhaseStartTime = kmClient.serverTimestamp();
		globalState.punishmentUsedThisRound = false;
		globalState.suspectedCheaters = {};			// Remove eliminated players (0 gold)
			const playerIds = Object.keys(globalState.players);
			for (const playerId of playerIds) {
				if (globalState.players[playerId].gold <= 0) {
					delete globalState.players[playerId];
				}
			}

			// Reset player states and deal new cards
			const remainingPlayers = Object.keys(globalState.players);
			
			// Create and shuffle new deck
			const numDecks = Math.ceil(remainingPlayers.length / 10);
			let fullDeck: Card[] = [];
			for (let i = 0; i < numDecks; i++) {
				fullDeck = fullDeck.concat(createDeck());
			}
			fullDeck = shuffleDeck(fullDeck);

		// Deal cards and reset state
		for (const playerId of remainingPlayers) {
			globalState.players[playerId].cards = fullDeck.splice(0, 5);
			globalState.players[playerId].bet = 0;
			globalState.players[playerId].folded = false;
			globalState.players[playerId].handRank = 0;
			globalState.players[playerId].handName = '';
			globalState.players[playerId].cheated = false;
			globalState.players[playerId].accusedOfCheating = false;
			globalState.players[playerId].wronglyAccused = false;
			globalState.players[playerId].receivedRedistributedGold = false;
		}			globalState.remainingDeck = fullDeck;
			
			// Deduct minimal bet from all remaining players and add to pot
			for (const playerId of remainingPlayers) {
				const player = globalState.players[playerId];
				if (player.gold >= config.minimalBet) {
					player.gold -= config.minimalBet;
					globalState.pot += config.minimalBet;
				} else {
					// Player doesn't have enough gold for minimal bet, take what they have
					globalState.pot += player.gold;
					player.gold = 0;
				}
			}
		});
	},

	async changeCards(clientId: string, cardIndices: number[]) {
		await kmClient.transact([globalStore], ([globalState]) => {
			const player = globalState.players[clientId];
			if (!player || player.folded || player.bet > 0) return;

			// Validate indices
			if (cardIndices.length === 0 || cardIndices.length > 5) return;
			if (cardIndices.some(idx => idx < 0 || idx >= 5)) return;

			const numDecks = Math.ceil(Object.keys(globalState.players).length / 10);
			const maxDuplicates = numDecks;

			// Helper: Count how many times a card appears across all player hands
			const countCardInAllHands = (card: Card): number => {
				let count = 0;
				for (const playerId of Object.keys(globalState.players)) {
					const p = globalState.players[playerId];
					count += p.cards.filter(c => c.suit === card.suit && c.rank === card.rank).length;
				}
				return count;
			};

			// Helper: Check if card already exists in player's hand
			const cardExistsInHand = (card: Card, hand: Card[]): boolean => {
				return hand.some(c => c.suit === card.suit && c.rank === card.rank);
			};

			// Helper: Draw a valid card from deck or regenerate deck if needed
			const drawValidCard = (playerHand: Card[]): Card | null => {
				// Try from remaining deck first
				for (let i = 0; i < globalState.remainingDeck.length; i++) {
					const card = globalState.remainingDeck[i];
					
					// Check if card doesn't exist in this player's hand
					if (cardExistsInHand(card, playerHand)) continue;
					
					// Check if card hasn't reached max duplicates across all hands
					if (countCardInAllHands(card) >= maxDuplicates) continue;
					
					// Valid card found
					globalState.remainingDeck.splice(i, 1);
					return card;
				}

				// Deck exhausted or no valid cards, regenerate deck
				let newDeck: Card[] = [];
				for (let i = 0; i < numDecks; i++) {
					newDeck = newDeck.concat(createDeck());
				}
				newDeck = shuffleDeck(newDeck);

				// Try again with new deck
				for (let i = 0; i < newDeck.length; i++) {
					const card = newDeck[i];
					
					if (cardExistsInHand(card, playerHand)) continue;
					if (countCardInAllHands(card) >= maxDuplicates) continue;
					
					// Valid card found
					newDeck.splice(i, 1);
					globalState.remainingDeck = newDeck;
					return card;
				}

				return null; // Should never happen
			};

			// Create new hand by replacing selected cards
			const newHand = [...player.cards];
			
			for (const index of cardIndices) {
				const newCard = drawValidCard(newHand);
				if (newCard) {
					newHand[index] = newCard;
				}
			}

			player.cards = newHand;
		});
	},

	async placeBet(clientId: string, amount: number) {
		await kmClient.transact([globalStore], ([globalState]) => {
			const player = globalState.players[clientId];
			if (!player || player.folded) return;

			// Cap bet at available gold
			const actualBet = Math.min(amount, player.gold);
			player.bet = actualBet;
		});
	},

	async fold(clientId: string) {
		await kmClient.transact([globalStore], ([globalState]) => {
			const player = globalState.players[clientId];
			if (!player) return;

			player.folded = true;
			player.bet = 0;
		});
	},

	async endBettingPhase() {
		await kmClient.transact([globalStore], ([globalState]) => {
			// Calculate pot
			let totalPot = 0;
			for (const playerId of Object.keys(globalState.players)) {
				const player = globalState.players[playerId];
				totalPot += player.bet;
				player.gold -= player.bet;
			}
			globalState.pot = totalPot;

			// Evaluate hands for non-folded players
			const activePlayers: { id: string; eval: ReturnType<typeof evaluateHand> }[] = [];
			for (const playerId of Object.keys(globalState.players)) {
				const player = globalState.players[playerId];
				if (!player.folded && player.bet > 0) {
					const evaluation = evaluateHand(player.cards);
					player.handRank = evaluation.rank;
					player.handName = evaluation.name;
					activePlayers.push({ id: playerId, eval: evaluation });
				}
			}

			// Find winners
			if (activePlayers.length > 0) {
				activePlayers.sort((a, b) => compareHands(a.eval, b.eval));
				
				const winners = [activePlayers[0].id];
				for (let i = 1; i < activePlayers.length; i++) {
					if (compareHands(activePlayers[0].eval, activePlayers[i].eval) === 0) {
						winners.push(activePlayers[i].id);
					} else {
						break;
					}
				}

				// Distribute pot
				const winnings = Math.floor(totalPot / winners.length);
				for (const winnerId of winners) {
					globalState.players[winnerId].gold += winnings;
				}

				globalState.winners = winners;
			}

			globalState.phase = 'results';
		});
	},

	async endGame() {
		await kmClient.transact([globalStore], ([globalState]) => {
			globalState.phase = 'ended';
		});
	},

	async startNewGame() {
		await kmClient.transact([globalStore], ([globalState]) => {
			// Reset to lobby state while keeping player names
			globalState.started = false;
			globalState.startTimestamp = 0;
			globalState.phase = 'betting';
			globalState.roundNumber = 1;
			globalState.pot = 0;
			globalState.winners = [];
			globalState.bettingPhaseStartTime = 0;
			globalState.remainingDeck = [];
			globalState.suspectedCheaters = {};

			// Reset all players to starting gold, keep names
			const playerIds = Object.keys(globalState.players);
			for (const playerId of playerIds) {
				globalState.players[playerId] = {
					name: globalState.players[playerId].name,
					cards: [],
					gold: config.startingGold,
					bet: 0,
					folded: false,
					handRank: 0,
					handName: '',
					cheated: false,
					accusedOfCheating: false,
					wronglyAccused: false
				};
			}
		});
	},

	async resetPlayers() {
		await kmClient.transact([globalStore], ([globalState]) => {
			// Remove all players and clear eliminated players list
			globalState.players = {};
			globalState.eliminatedPlayers = [];
		});
	},

	async cheatCard(clientId: string, cardIndex: number, newRank?: Rank, newSuit?: Suit) {
		const result = await kmClient.transact([globalStore], ([globalState]) => {
			const player = globalState.players[clientId];
			if (!player || player.folded || player.bet > 0) return false;

			let finalRank: Rank;
			let finalSuit: Suit;
			let botched = false;

			if (newSuit) {
				// Suit was selected, generate random rank
				const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
				finalRank = ranks[Math.floor(Math.random() * ranks.length)];
				finalSuit = newSuit;
			} else if (newRank) {
				// Rank was selected, generate random suit
				const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
				finalRank = newRank;
				
				// Check if player has other cards with the same rank
				const cardsWithSameRank = player.cards
					.filter((card, idx) => idx !== cardIndex && card.rank === newRank);
				
				console.log('[cheatCard] Cards with same rank:', cardsWithSameRank.length, 'for rank:', newRank);
				
				// If there are cards with same rank, 1/24 chance to botch (get duplicate suit)
				if (cardsWithSameRank.length > 0) {
					const roll = Math.random();
					console.log('[cheatCard] Random roll:', roll, 'threshold:', 1/24);
					if (roll < 1/24) {
						// BOTCH: Pick a random card with same rank and copy its suit (creating duplicate)
						const randomMatchingCard = cardsWithSameRank[Math.floor(Math.random() * cardsWithSameRank.length)];
						finalSuit = randomMatchingCard.suit;
						botched = true;
						console.log('[cheatCard] BOTCHED! Using suit:', finalSuit);
					} else {
						// Normal: Select random suit that DOESN'T match existing cards with same rank
						const usedSuits = cardsWithSameRank.map(c => c.suit);
						const availableSuits = suits.filter(s => !usedSuits.includes(s));
						if (availableSuits.length > 0) {
							finalSuit = availableSuits[Math.floor(Math.random() * availableSuits.length)];
							console.log('[cheatCard] Normal cheat, avoiding duplicate. Available suits:', availableSuits, 'selected:', finalSuit);
						} else {
							// All suits are taken (player has 4 of the same rank), pick random
							finalSuit = suits[Math.floor(Math.random() * suits.length)];
							console.log('[cheatCard] All suits taken, random suit:', finalSuit);
						}
					}
				} else {
					// Normal random suit selection (no cards with same rank)
					finalSuit = suits[Math.floor(Math.random() * suits.length)];
					console.log('[cheatCard] No matching rank, random suit:', finalSuit);
				}
			} else {
				return false; // Invalid parameters
			}

			// Change the card
			player.cards[cardIndex] = { suit: finalSuit, rank: finalRank };
			player.cheated = true;

			console.log('[cheatCard] Final card:', finalRank, 'of', finalSuit, 'botched:', botched);

			// Place random bet between 1 and 50% of gold (rounded up, multiple of 5)
			const halfGold = Math.ceil(player.gold / 2);
			const maxBet = Math.floor(halfGold / 5) * 5;
			if (maxBet > 0) {
				const numOptions = Math.floor(maxBet / 5);
				const randomBet = (Math.floor(Math.random() * numOptions) + 1) * 5;
				player.bet = Math.min(randomBet, player.gold);
			} else if (player.gold > 0) {
				// If less than 5 gold, bet all
				player.bet = player.gold;
			}

			// Return botched status to trigger notification in player state
			console.log('[cheatCard] Returning botched status:', botched);
			return botched;
		});

		console.log('[cheatCard] Transaction result:', result);
		return result;
	},

	async punishCheaters(accusedPlayerIds: string[]) {
		await kmClient.transact([globalStore], ([globalState]) => {
			if (globalState.punishmentUsedThisRound) return;

			globalState.punishmentUsedThisRound = true;

			// Track confiscated gold and rightfully accused cheaters
			let totalConfiscatedGold = 0;
			const rightfullyAccusedIds = new Set<string>();

			// First pass: mark accused players and collect confiscated gold
			for (const playerId of accusedPlayerIds) {
				const player = globalState.players[playerId];
				if (!player) continue;

				player.accusedOfCheating = true;

				if (player.cheated) {
					// Rightfully accused - calculate gold lost
					const goldBefore = player.gold;
					player.gold = Math.ceil(player.gold / 2);
					const goldLost = goldBefore - player.gold;
					totalConfiscatedGold += goldLost;
					rightfullyAccusedIds.add(playerId);
					player.wronglyAccused = false;
				} else {
					// Wrongly accused - double gold
					player.gold = player.gold * 2;
					player.wronglyAccused = true;
				}
			}

			// Second pass: distribute confiscated gold among betting players
			if (totalConfiscatedGold > 0) {
				// Get all betting players who are not folded and not rightfully accused cheaters
				const eligiblePlayers = Object.keys(globalState.players).filter(
					(id) => {
						const p = globalState.players[id];
						return !p.folded && p.bet > 0 && !rightfullyAccusedIds.has(id);
					}
				);

			if (eligiblePlayers.length > 0) {
				const goldPerPlayer = Math.floor(totalConfiscatedGold / eligiblePlayers.length);
				
				for (const playerId of eligiblePlayers) {
					globalState.players[playerId].gold += goldPerPlayer;
					globalState.players[playerId].receivedRedistributedGold = true;
				}
			}
		}
	});
},

async denounceCheaters(accuserId: string, suspectedPlayerIds: string[]) {
	await kmClient.transact([globalStore], ([globalState]) => {
		// Add accusations for each suspected player
		for (const suspectedId of suspectedPlayerIds) {
			if (!globalState.suspectedCheaters[suspectedId]) {
				globalState.suspectedCheaters[suspectedId] = [];
			}
			
			// Add accuser if not already present
			if (!globalState.suspectedCheaters[suspectedId].includes(accuserId)) {
				globalState.suspectedCheaters[suspectedId].push(accuserId);
			}
		}
	});
},

async clearSuspicions() {
	await kmClient.transact([globalStore], ([globalState]) => {
		globalState.suspectedCheaters = {};
	});
}
};