import { config } from '@/config';
import { CheatRankSelector } from '@/components/cheat-rank-selector';
import { HandRankingsModal } from '@/components/hand-rankings-modal';
import { PlayingCard } from '@/components/playing-card';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { globalActions } from '@/state/actions/global-actions';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import { evaluateHand, getHandQuality, hasDuplicateCards } from '@/utils/card-utils';
import { KmTimeProgress } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const BettingPhaseView: React.FC = () => {
	const { players, pot, bettingPhaseStartTime, roundNumber, worstPerformerLastRound } = useSnapshot(globalStore.proxy);
	const { selectedCardIndices, cheatMode, cheatCardIndex, showCheatTip, botchedCheating } = useSnapshot(playerStore.proxy);
	const serverTime = useServerTimer(250);
	
	const myPlayer = players[kmClient.id];
	const [localBet, setLocalBet] = React.useState(0);
	const [hasChangedCards, setHasChangedCards] = React.useState(false);

	// Calculate elapsed time
	const timeElapsed = serverTime - bettingPhaseStartTime;

	// Show tip if this player was the worst performer in previous round
	React.useEffect(() => {
		// Reset tip at the start of each new round
		playerActions.dismissCheatTip();
		
		// Reset botched cheating notification
		kmClient.transact([playerStore], ([state]) => {
			state.botchedCheating = false;
		});
		
		// Then check if this player should see the tip
		if (roundNumber > 1 && worstPerformerLastRound === kmClient.id) {
			console.log('[BettingPhaseView] Player had worst hand, showing tip:', {
				roundNumber,
				worstPerformerLastRound,
				myId: kmClient.id
			});
			playerActions.showCheatTip();
		} else {
			console.log('[BettingPhaseView] Tip check:', {
				roundNumber,
				worstPerformerLastRound,
				myId: kmClient.id,
				shouldShow: roundNumber > 1 && worstPerformerLastRound === kmClient.id
			});
		}
	}, [roundNumber, worstPerformerLastRound]);

	if (!myPlayer) return null;

	// Check if player joined mid-round (no cards dealt)
	if (myPlayer.cards.length === 0) {
		return (
			<div className="flex w-full max-w-2xl flex-col gap-4">
				<div className="rounded-lg border-2 border-gray-400 bg-gray-50 p-6 shadow-lg text-center">
					<h2 className="mb-4 text-2xl font-bold text-gray-600">Round in Progress</h2>
					<p className="text-gray-600">Please wait for the current round to end before joining the game.</p>
				</div>
			</div>
		);
	}

	const hasBet = myPlayer.bet > 0;
	const canChangeCards = !hasChangedCards && !hasBet;
	const canCheat = !hasBet; // Can cheat as long as no bet placed

	const handleCardClick = (index: number) => {
		if (!canChangeCards) return;
		playerActions.toggleCardSelection(index);
	};

	const handleCardTap = async (index: number) => {
		if (!canCheat) return;
		await playerActions.tapCard(index);
	};

	const handleCancelCheat = async () => {
		await playerActions.cancelCheat();
	};

	const handleDismissTip = async () => {
		await playerActions.dismissCheatTip();
	};

	const handleChangeCards = async () => {
		if (selectedCardIndices.length === 0) return;
		await globalActions.changeCards(kmClient.id, selectedCardIndices);
		await playerActions.clearCardSelection();
		await playerActions.resetTaps(); // Reset tap counter after changing cards
		setHasChangedCards(true);
	};

	const adjustBet = (delta: number) => {
		const newBet = Math.max(0, Math.min(myPlayer.gold, localBet + delta));
		setLocalBet(newBet);
	};

	const handlePlaceBet = async () => {
		if (localBet === 0) return;
		await globalActions.placeBet(kmClient.id, localBet);
	};

	const handleFold = async () => {
		await globalActions.fold(kmClient.id);
	};

	const isAllIn = localBet === myPlayer.gold && localBet > 0;

	if (myPlayer.folded) {
		return (
			<div className="flex w-full max-w-2xl flex-col gap-4">
				<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg text-center">
					<h2 className="mb-4 text-2xl font-bold text-gray-600">{config.youFolded}</h2>
					<p className="text-gray-500">Waiting for round to end...</p>
				</div>
			</div>
		);
	}

	if (myPlayer.bet > 0) {
		return (
			<div className="flex w-full max-w-2xl flex-col gap-4">
				{/* Timer Progress */}
				<div className="rounded-lg border-2 border-red-600 bg-white p-4 shadow-md">
					<p className="mb-2 text-center text-sm font-semibold">{config.timeRemaining}</p>
					<KmTimeProgress
						value={timeElapsed}
						limit={config.bettingPhaseDuration}
						className="w-full"
					/>
				</div>

				{/* Botched Cheating Notification */}
				{botchedCheating && (
					<div className="rounded-lg border-2 border-red-600 bg-red-100 p-4 shadow-md">
						<div className="flex items-start justify-between">
							<p className="text-sm font-bold text-red-800">
								{config.botchedCheatingMessage}
							</p>
							<button
								onClick={async () => {
									await kmClient.transact([playerStore], ([state]) => {
										state.botchedCheating = false;
									});
								}}
								type="button"
								className="text-red-600 hover:text-red-800 text-xl font-bold ml-2"
							>
								×
							</button>
						</div>
					</div>
				)}

			{/* Cards */}
			<div className="rounded-lg border-2 border-green-600 bg-white p-6 shadow-lg">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-bold">{config.yourCards}</h3>
					<HandRankingsModal currentCards={myPlayer.cards} />
				</div>					{/* Hand Quality */}
					{(() => {
						const isDuplicate = hasDuplicateCards(myPlayer.cards);
						if (isDuplicate) {
							return (
								<div className="mb-3 text-center">
									<span className="text-lg font-bold text-red-600">
										🚨 Cheater hand
									</span>
								</div>
							);
						}
						
						const evaluation = evaluateHand(myPlayer.cards);
						const quality = getHandQuality(evaluation);
						return (
							<div className="mb-3 text-center">
								<span className="text-lg font-bold text-blue-600">
									{quality.emoji} {quality.text}
								</span>
							</div>
						);
					})()}

					<div className="mb-4 flex flex-wrap justify-center gap-2">
						{myPlayer.cards.map((card, index) => (
							<PlayingCard
								key={`${card.suit}-${card.rank}-${index}`}
								card={card}
							/>
						))}
					</div>
				</div>

				{/* Bet Status */}
				<div className="rounded-lg border-2 border-green-600 bg-white p-6 shadow-lg text-center">
					<h2 className="mb-4 text-2xl font-bold text-green-600">Bet Placed!</h2>
					<p className="text-lg">
						{config.currentBet}: <span className="font-bold">{myPlayer.bet}</span>
					</p>
					<p className="mt-2 text-gray-500">Waiting for round to end...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-4">
			{cheatMode && (
				<CheatRankSelector
					cardIndex={cheatCardIndex}
					onCancel={handleCancelCheat}
				/>
			)}

		{/* Timer Progress */}
		<div className="rounded-lg border-2 border-red-600 bg-white p-4 shadow-md">
			<p className="mb-2 text-center text-sm font-semibold">{config.timeRemaining}</p>
			<KmTimeProgress
				value={timeElapsed}
				limit={config.bettingPhaseDuration}
				className="w-full"
			/>
		</div>

		{/* Botched Cheating Notification */}
		{botchedCheating && (
			<div className="rounded-lg border-2 border-red-600 bg-red-100 p-4 shadow-md">
				<div className="flex items-start justify-between">
					<p className="text-sm font-bold text-red-800">
						{config.botchedCheatingMessage}
					</p>
					<button
						onClick={async () => {
							await kmClient.transact([playerStore], ([state]) => {
								state.botchedCheating = false;
							});
						}}
						type="button"
						className="text-red-600 hover:text-red-800 text-xl font-bold ml-2"
					>
						×
					</button>
				</div>
			</div>
		)}

		{/* Worst hand tip message */}
		{showCheatTip && (
			<div className="rounded-lg border-2 border-orange-500 bg-orange-50 p-4 shadow-md">
				<div className="mb-2 flex items-start justify-between">
					<div className="text-sm font-semibold text-orange-800">
						😈 Your hand was the worst ha, ha, ha
					</div>
					<button
						onClick={handleDismissTip}
						className="ml-2 text-orange-600 hover:text-orange-800"
						aria-label="Dismiss tip"
					>
						✕
					</button>
				</div>
				<div className="text-xs text-orange-700">
					Here's a friendly tip: Tap 4 times on one card, and you can change it
					to the desired one. Beware, if you do this, it will automatically bet
					a random amount.
				</div>
			</div>
		)}

	{/* Cards */}
	<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-bold">{config.yourCards}</h3>
				<HandRankingsModal currentCards={myPlayer.cards} />
			</div>				{/* Hand Quality */}
				{(() => {
					const isDuplicate = hasDuplicateCards(myPlayer.cards);
					if (isDuplicate) {
						return (
							<div className="mb-3 text-center">
								<span className="text-lg font-bold text-red-600">
									🚨 Cheater hand
								</span>
							</div>
						);
					}
					
					const evaluation = evaluateHand(myPlayer.cards);
					const quality = getHandQuality(evaluation);
					return (
						<div className="mb-3 text-center">
							<span className="text-lg font-bold text-blue-600">
								{quality.emoji} {quality.text}
							</span>
						</div>
					);
				})()}

			<div className="mb-4 flex flex-wrap justify-center gap-2">
				{myPlayer.cards.map((card, index) => (
					<PlayingCard
						key={`${card.suit}-${card.rank}-${index}`}
						card={card}
						selected={selectedCardIndices.includes(index)}
						onClick={() => {
							// Prioritize card selection when it's available
							if (canChangeCards) {
								handleCardClick(index);
							}
							// Always allow tapping for cheat detection
							handleCardTap(index);
						}}
					/>
				))}
			</div>				{canChangeCards && (
					<>
						<p className="mb-2 text-center text-sm text-gray-600">
							{config.selectCardsToChange}
							{selectedCardIndices.length > 0 && (
								<span className="ml-2 font-bold">
									({selectedCardIndices.length} {config.cardsSelected})
								</span>
							)}
						</p>

						<button
							onClick={handleChangeCards}
							disabled={selectedCardIndices.length === 0}
							type="button"
							className="w-full rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{config.changeCardsButton}
						</button>
					</>
				)}

				{hasChangedCards && !hasBet && (
					<p className="text-center text-sm font-bold text-green-600">
						{config.cardsChanged}
					</p>
				)}
			</div>

			{/* Betting */}
			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<div className="mb-4 space-y-2">
					<div className="flex justify-between text-lg">
						<span>{config.yourGold}:</span>
						<span className="font-bold text-green-600">{myPlayer.gold}</span>
					</div>
					<div className="flex justify-between text-lg">
						<span>{config.minimalBetLabel}:</span>
						<span className="font-bold">{config.minimalBet}</span>
					</div>
					<div className="flex justify-between text-lg">
						<span>{config.pot}:</span>
						<span className="font-bold">{pot}</span>
					</div>
				</div>

			<div className="mb-4">
				<div className="flex items-center justify-center gap-2 mb-2">
					<button
						onClick={() => adjustBet(-25)}
						type="button"
						className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
					>
						-25
					</button>
					<button
						onClick={() => adjustBet(-5)}
						type="button"
						className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
					>
						-5
					</button>
					<div className="min-w-[100px] text-center">
						<span className="text-2xl font-bold">{localBet}</span>
						{isAllIn && (
							<div className="text-xs font-bold text-red-600">{config.allIn}</div>
						)}
					</div>
					<button
						onClick={() => adjustBet(5)}
						type="button"
						className="rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
					>
						+5
					</button>
					<button
						onClick={() => adjustBet(25)}
						type="button"
						className="rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
					>
						+25
					</button>
				</div>
			</div>				<div className="flex gap-2">
					<button
						onClick={handlePlaceBet}
						disabled={localBet === 0}
						type="button"
						className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{config.placeBetButton}
					</button>
					<button
						onClick={handleFold}
						type="button"
						className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
					>
						{config.foldButton}
					</button>
				</div>
			</div>
		</div>
	);
};
