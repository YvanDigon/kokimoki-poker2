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
	
	botchedCheatingMessage: z.string().default('🚨 You\'ve been caught red-handed! Your greedy card-swapping has backfired - you now have duplicate cards. Your bet has been automatically placed. Good luck explaining this to the other players!'),
	
	cheatTipTitle: z.string().default('😈 You lost money on the previous round, ha ha ha!'),
	cheatTip1: z.string().default('Here\'s a friendly tip: There are 3 ways to cheat.\n\n**Method 1:** Tap 4 times on any card to change it to your desired rank or suit. Warning: This will automatically place a random bet for you!'),
	cheatTip2: z.string().default('Here\'s a friendly tip: There are 3 ways to cheat.\n\n**Method 2:** After placing your bet, tap 4 times on "Bet Placed!" to open a secret menu where you can mug another player and steal gold equal to your bet amount.'),
	cheatTip3: z.string().default('Here\'s a friendly tip: There are 3 ways to cheat.\n\n**Method 3:** After changing cards but before betting, refresh your browser to change cards again. Beware: Do this twice and you\'ll get duplicate cards - instant cheater hand!'),
	
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
	bettingPhaseDuration: z.number().default(120), // in seconds
	minimalBet: z.number().default(1),
	betIncrementSmall: z.number().default(5),
	betIncrementLarge: z.number().default(25),
	eliminationBonus: z.number().default(10)
});

export type Config = z.infer<typeof schema>;
