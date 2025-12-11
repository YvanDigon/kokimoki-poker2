import { z } from 'zod/v4';

export const schema = z.object({
	// translations
	title: z.string().default('Red Handed Poker'),

	gameLobbyMd: z
		.string()
		.default(
			'# Waiting for game to start...\nThe game will start once the host presses the start button.'
		),
	connectionsMd: z.string().default('# Connections example'),
	sharedStateMd: z.string().default('# Shared State example'),

	players: z.string().default('Players'),
	timeElapsed: z.string().default('Time elapsed'),
	startButton: z.string().default('Start Game'),
	stopButton: z.string().default('Stop Game'),
	loading: z.string().default('Loading...'),

	menuTitle: z.string().default('Menu'),
	menuConnections: z.string().default('Connections'),
	menuGameLobby: z.string().default('Lobby'),

	playerNameTitle: z.string().default('Enter Your Name'),
	playerNamePlaceholder: z.string().default('Your name...'),
	playerNameLabel: z.string().default('Name:'),
	playerNameButton: z.string().default('Continue'),
	randomNameButton: z.string().default('Random Name'),
	dontCheatHelpText: z.string().default('Be a good boy, don\'t cheat. Don\'t try to figure out how to cheat.'),

	hostLabel: z.string().default('Host'),
	presenterLabel: z.string().default('Presenter'),

	gameLinksTitle: z.string().default('Game Links'),
	playerLinkLabel: z.string().default('Player Link'),
	presenterLinkLabel: z.string().default('Presenter Link'),

	menuAriaLabel: z.string().default('Open menu drawer'),

	// Poker-specific
	bettingPhaseTitle: z.string().default('Betting Phase'),
	resultsTitle: z.string().default('Round Results'),
	roundNumber: z.string().default('Round'),
	yourCards: z.string().default('Your Cards'),
	yourGold: z.string().default('Your Gold'),
	currentBet: z.string().default('Current Bet'),
	pot: z.string().default('Pot'),
	timeRemaining: z.string().default('Time Remaining'),
	
	selectCardsToChange: z.string().default('Select cards to change (tap to select)'),
	cardsSelected: z.string().default('cards selected'),
	changeCardsButton: z.string().default('Change Cards'),
	cardsChanged: z.string().default('Cards changed! You can now place your bet.'),
	placeBetButton: z.string().default('Place Bet'),
	foldButton: z.string().default('Fold'),
	allIn: z.string().default('ALL IN'),
	
	youWon: z.string().default('You Won!'),
	youLost: z.string().default('You Lost'),
	youFolded: z.string().default('You Folded'),
	winnings: z.string().default('Winnings'),
	losses: z.string().default('Losses'),
	
	rulesTitle: z.string().default('RULES'),
	gameRulesDescription: z.string().default('Each round, players receive 5 cards and place bets. At the end of the betting phase, the player with the best hand wins the pot (the sum of all bets).'),
	handRankingsTitle: z.string().default('Poker Hand Rankings'),
	viewHandRankings: z.string().default('Rules'),
	importantNoteTitle: z.string().default('Important Note'),
	importantNoteText: z.string().default('It\'s forbidden to cheat. Don\'t try to figure out how to cheat. Be a good boy!'),
	
	startGameButton: z.string().default('Start Game'),
	endBettingButton: z.string().default('End Betting Phase'),
	newRoundButton: z.string().default('Start New Round'),
	endGameButton: z.string().default('End Game'),
	startNewGameButton: z.string().default('Start New Game'),
	
	gameOver: z.string().default('Game Over'),
	gameOverMd: z.string().default('You ran out of gold! Better luck next time.'),
	rejoinButton: z.string().default('Rejoin Game'),
	
	redistributedGoldTitle: z.string().default('💰 Bonus Gold'),
	redistributedGoldMessage: z.string().default('You received part of the gold redistributed from caught cheaters!'),
	foldedNoGoldMessage: z.string().default('Cheater(s) were caught and punished. You received nothing because you folded or did not bet.'),
	
	denounceCheaters: z.string().default('Denounce Cheaters'),
	denounceExplainer: z.string().default('If you suspect one or more players of cheating, use this'),
	denounceTitle: z.string().default('Select Suspected Cheaters'),
	denounceConfirm: z.string().default('Confirm'),
	denounceCancel: z.string().default('Cancel'),
	
	botchedCheatingMessage: z.string().default('You botched your cheating attempt! You got a duplicate card.'),
	
	finalRankingsTitle: z.string().default('Final Rankings'),
	winner: z.string().default('Winner'),
	resetPlayersButton: z.string().default('Reset Players'),
	
	cheatDiscussionHint: z
		.string()
		.default(
			'Before starting a new round, feel free to discuss with players to determine who might be cheating.'
		),
	
	minimalBetLabel: z.string().default('Minimal bet'),
	
	// Game settings
	startingGold: z.number().default(100),
	bettingPhaseDuration: z.number().default(120000),
	minimalBet: z.number().default(1)
});

export type Config = z.infer<typeof schema>;
