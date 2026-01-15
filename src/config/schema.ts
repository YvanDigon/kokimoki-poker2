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

	hostInstructionsTitle: z.string().default('How to Host'),
	hostInstructionsMd: z
		.string()
		.default(
			`# Welcome to Red Handed Poker!\n\nAs the host, you lead the game. Here's what to do:\n\n` +
			`1. **Wait for players to join.** Share the player link with them.\n\n` +
			`2. **Start the game** when everyone is ready.\n\n` +
			`3. **Each round has two phases:**\n` +
			`   - **Betting Phase:** Players place bets based on their hand strength.\n` +
			`   - **Results Phase:** The best hand wins the pot.\n\n` +
			`4. **Watch for cheaters!** Players can secretly cheat and accuse others. Discuss with them to determine who's guilty, then punish the cheaters.\n\n` +
			`5. **End the game anytime.** Final rankings are determined by each player's gold balance.`
		),
	hostInstructionsButton: z.string().default('Info'),

	menuAriaLabel: z.string().default('Open menu drawer'),

	// Poker-specific
	bettingPhaseTitle: z.string().default('Betting Phase'),
	resultsTitle: z.string().default('Round Results'),
	roundNumber: z.string().default('Round'),
	yourCards: z.string().default('Your Cards'),
	yourGold: z.string().default('Your Gold'),
	currentBet: z.string().default('Current Bet'),
	betLabel: z.string().default('Bet:'),
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

	// Poker hand names
	handNameHighCard: z.string().default('High Card'),
	handNameOnePair: z.string().default('One Pair'),
	handNameTwoPair: z.string().default('Two Pair'),
	handNameThreeOfAKind: z.string().default('Three of a Kind'),
	handNameStraight: z.string().default('Straight'),
	handNameFlush: z.string().default('Flush'),
	handNameFullHouse: z.string().default('Full House'),
	handNameFourOfAKind: z.string().default('Four of a Kind'),
	handNameStraightFlush: z.string().default('Straight Flush'),
	handNameRoyalFlush: z.string().default('Royal Flush'),

	// Hand ranking modal content
	handExampleHighCard: z.string().default('A♠ J♥ 9♦ 6♣ 3♠'),
	handExampleOnePair: z.string().default('10♠ 10♥ K♦ 8♣ 3♠'),
	handExampleTwoPair: z.string().default('J♠ J♥ 5♦ 5♣ 2♠'),
	handExampleThreeOfAKind: z.string().default('7♠ 7♥ 7♦ K♣ 3♠'),
	handExampleStraight: z.string().default('10♠ 9♥ 8♦ 7♣ 6♠'),
	handExampleFlush: z.string().default('J♦ 9♦ 7♦ 4♦ 2♦'),
	handExampleFullHouse: z.string().default('Q♠ Q♥ Q♦ 8♣ 8♠'),
	handExampleFourOfAKind: z.string().default('K♠ K♥ K♦ K♣ 3♠'),
	handExampleStraightFlush: z.string().default('9♥ 8♥ 7♥ 6♥ 5♥'),
	handExampleRoyalFlush: z.string().default('A♠ K♠ Q♠ J♠ 10♠'),

	handDescHighCard: z.string().default('No matching cards, highest card wins'),
	handDescOnePair: z.string().default('Two cards with the same rank'),
	handDescTwoPair: z.string().default('Two cards of one rank and two cards of another rank'),
	handDescThreeOfAKind: z.string().default('Three cards with the same rank'),
	handDescStraight: z.string().default('Five cards in sequence, not all of the same suit'),
	handDescFlush: z.string().default('Five cards of the same suit, not in sequence'),
	handDescFullHouse: z.string().default('Three cards of one rank and two cards of another rank'),
	handDescFourOfAKind: z.string().default('Four cards with the same rank'),
	handDescStraightFlush: z.string().default('Five cards in sequence, all of the same suit'),
	handDescRoyalFlush: z.string().default('A, K, Q, J, 10, all of the same suit'),
	
	startGameButton: z.string().default('Start Game'),
	endBettingButton: z.string().default('End Betting Phase'),
	newRoundButton: z.string().default('Start New Round'),
	endGameButton: z.string().default('End Game'),
	startNewGameButton: z.string().default('Start New Game'),

	// Hand quality labels
	handQualityHighCard: z.string().default('Bad hand'),
	handQualityOnePair: z.string().default('Meh hand'),
	handQualityTwoPair: z.string().default('Good hand'),
	handQualityThreeOfAKind: z.string().default('Nice hand'),
	handQualityStraight: z.string().default('Great hand'),
	handQualityFlush: z.string().default('Strong hand'),
	handQualityFullHouse: z.string().default('Excellent hand'),
	handQualityFourOfAKind: z.string().default('Incredible hand'),
	handQualityStraightFlush: z.string().default('Amazing hand'),
	handQualityRoyalFlush: z.string().default('Legendary hand'),
	handQualityUnknown: z.string().default('Unknown hand'),
	
	redistributedGoldTitle: z.string().default('💰 Bonus Gold'),
	redistributedGoldMessage: z.string().default('You received part of the gold redistributed from caught cheaters!'),
	foldedNoGoldMessage: z.string().default('Cheater(s) were caught and punished. You received nothing because you folded or did not bet.'),
	
	denounceCheaters: z.string().default('Denounce Cheaters'),
	denounceExplainer: z.string().default('If you suspect one or more players of cheating, use this'),
	denounceTitle: z.string().default('Select Suspected Cheaters'),
	denounceConfirm: z.string().default('Confirm'),
	denounceCancel: z.string().default('Cancel'),
	denounceHostPunishMessage: z.string().default('The host will manually punish suspected players.'),
	denounceNoPlayersMessage: z.string().default('No other players to denounce.'),
	
	botchedCheatingMessage: z.string().default('🚨 You\'ve been caught red-handed! Your greedy card-swapping has backfired - you now have duplicate cards. Your bet has been automatically placed. Good luck explaining this to the other players!'),
	refreshCheatingDetectedMessage: z.string().default('⚠️ System Alert: Multiple page refreshes detected! You\'ve tried to cheat the system by refreshing twice to change cards again. As punishment, you got duplicate cards forced into your hand and your bet was automatically placed. Nice try!'),
	
	cheatTipTitle: z.string().default('😈 You lost money on the previous round, ha ha ha!'),
	cheatTip1: z.string().default('Here\'s a friendly tip: There are 3 ways to cheat.\n\n**Method 1:** Tap 4 times on any card to change it to your desired rank or suit. Warning: This will automatically place a random bet for you!'),
	cheatTip2: z.string().default('Here\'s a friendly tip: There are 3 ways to cheat.\n\n**Method 2:** After placing your bet, tap 4 times on "Bet Placed!" to open a secret menu where you can mug another player and steal gold equal to your bet amount.'),
	cheatTip3: z.string().default('Here\'s a friendly tip: There are 3 ways to cheat.\n\n**Method 3:** After changing cards but before betting, refresh your browser to change cards again. Beware: Do this twice and you\'ll get duplicate cards - instant cheater hand!'),
	
	comebackModeTitle: z.string().default('🎯 Comeback Mode'),
	comebackModeDescription: z.string().default('You ran out of gold! Predict correctly to come back into play!'),
	comebackModePresenterDescription: z.string().default('🎯 Busted - Predict the winner to get back in the game!'),
	comebackBankruptTitle: z.string().default('💸 Busted!'),
	comebackBankruptMessage: z
		.string()
		.default(
			"You're out of gold and entered Comeback Mode. Predict this round's winner to get back in the game!"
		),
	comebackWaitingMessage: z.string().default('Waiting for next round to start...'),
	comebackPredictWinner: z.string().default('Predict the Winner'),
	comebackYourPrediction: z.string().default('Your Prediction:'),
	comebackNoPrediction: z.string().default('No prediction yet'),
	comebackChangePrediction: z.string().default('Change Prediction'),
	comebackSuccessTitle: z.string().default('🎉 Correct Prediction!'),
	comebackSuccessMessage: z.string().default('You predicted correctly! You\'re back in the game with {amount} gold.'),
	comebackFailedTitle: z.string().default('❌ Wrong Prediction'),
	comebackFailedMessage: z.string().default('You incorrectly predicted the winner. Better luck next round!'),
	comebackAllPlayersFoldedTitle: z.string().default('⚪ No Winner'),
	comebackAllPlayersFoldedMessage: z.string().default('No players placed bets this round. You don\'t come back into play.'),
	comebackPredictingLabel: z.string().default('Predicting:'),
	
	finalRankingsTitle: z.string().default('Final Rankings'),
	winner: z.string().default('Winner'),
	resetPlayersButton: z.string().default('Reset Players'),
	netLabel: z.string().default('Net'),
	foldedLabel: z.string().default('Folded'),
	
	cheatDiscussionHint: z
		.string()
		.default(
			'Before starting a new round, feel free to discuss with players to determine who might be cheating.'
		),
	
	minimalBetLabel: z.string().default('Minimal bet'),
	
	playerListTitle: z.string().default('Player List'),
	onlineStatus: z.string().default('Online'),
	offlineStatus: z.string().default('Offline'),
	
	roundInProgressTitle: z.string().default('Round in Progress'),
	roundInProgressMessage: z.string().default('Please wait for the current round to end before joining the game.'),
	waitingForRoundEnd: z.string().default('Waiting for round to end...'),
	cheaterHand: z.string().default('🚨 Cheater hand'),
	betPlacedTitle: z.string().default('Bet Placed!'),
	muggingInProgress: z.string().default('🎭 Mugging in progress...'),
	muggingFailedMessage: z.string().default('🎭 The player you tried to mug has almost nothing left. You felt some pity and decided not to proceed with the theft. Your conscience is clear!'),
	muggedTitle: z.string().default("🎭 You've Been Mugged!"),
	muggedMessage: z
		.string()
		.default('A mysterious player stole {amount} gold from you during the betting phase!'),

	punishCheaters: z.string().default('Punish Cheaters'),
	punishmentUsedMessage: z.string().default('Punishment already used this round'),
	selectPlayersToAccuse: z.string().default('Select Players to Accuse'),
	cancelButton: z.string().default('Cancel'),
	confirmButton: z.string().default('Confirm'),
	
	needMinPlayersMessage: z.string().default('Need at least 2 players to start'),
	readyLabel: z.string().default('Ready'),
	newPlayerLabel: z.string().default('New player'),
	
	selectCardTitle: z.string().default('Select Card'),
	chooseRankLabel: z.string().default('Choose Rank (random suit):'),
	chooseSuitLabel: z.string().default('Or choose Suit (random rank):'),
	
	mugSelectorTitle: z.string().default('🎭 Choose Your Target'),
	mugSelectorDescription: z.string().default('Steal {amount} gold from another player. They won\'t know it was you!'),
	mugNoEligiblePlayers: z.string().default('No eligible players to mug (they need at least {amount} gold)'),
	mugCancelButton: z.string().default('Cancel'),
	
	wronglyAccusedTitle: z.string().default('💢 Wrongly Accused!'),
	caughtCheatingTitle: z.string().default('⚠️ Caught Cheating!'),
	wronglyAccusedMessage: z.string().default('You were wrongly accused! Your gold has been doubled.'),
	caughtCheatingMessage: z.string().default('You were caught red-handed! Half your gold has been confiscated and redistributed to the honest players who stayed in the game.'),

	// Elimination bonus strings
	eliminationBonusTitle: z.string().default('💰 Elimination Bonus!'),
	eliminationBonusMessage: z
		.string()
		.default("A rival went broke! You earned {amount} coins as a survivor's reward for staying in the game!"),
	eliminationMissedTitle: z.string().default('😔 Missed Opportunity'),
	eliminationMissedMessage: z
		.string()
		.default("A player went broke, but you folded early and missed out on the {amount} coin survivor's bonus. Stay in the game to reap the rewards!"),
	
	gameEndedMessage: z.string().default('The game has ended!'),
	gameEndedDescriptionMd: z.string().default('Thanks for playing! The host has ended the game.'),
	
	// Game settings
	startingGold: z.number().default(100),
	bettingPhaseDuration: z.number().default(120), // in seconds
	minimalBet: z.number().default(1),
	betIncrementSmall: z.number().default(5),
	betIncrementLarge: z.number().default(25),
	eliminationBonus: z.number().default(10)
});

export type Config = z.infer<typeof schema>;
