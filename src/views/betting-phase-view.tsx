import { config } from '@/config';
import { CheatRankSelector } from '@/components/cheat-rank-selector';
import { HandRankingsModal } from '@/components/hand-rankings-modal';
import { MugSelector } from '@/components/mug-selector';
import { PlayingCard } from '@/components/playing-card';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { globalActions } from '@/state/actions/global-actions';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import { evaluateHand, getHandQuality, hasDuplicateCards } from '@/utils/card-utils';
import { KmTimeCountdown } from '@kokimoki/shared';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { useSnapshot } from 'valtio';

export const BettingPhaseView: React.FC = () => {
	const { players, pot, bettingPhaseStartTime, roundNumber, losingPlayersLastRound } = useSnapshot(globalStore.proxy);
	const { selectedCardIndices, cheatMode, cheatCardIndex, showCheatTip, botchedCheating, showMugSelector, mugTapCount } = useSnapshot(playerStore.proxy);
	useServerTimer(250); // Force re-render every 250ms
	
	// Store selected cheat tip to prevent flickering
	const [selectedCheatTip, setSelectedCheatTip] = React.useState<string>('');
	
	const myPlayer = players[kmClient.id];
	const [localBet, setLocalBet] = React.useState(0);
	const [hasChangedCards, setHasChangedCards] = React.useState(false);
	
	// Select random tip when showCheatTip becomes true
	React.useEffect(() => {
		if (showCheatTip && !selectedCheatTip) {
			const cheatTips = [config.cheatTip1, config.cheatTip2, config.cheatTip3];
			const randomTip = cheatTips[Math.floor(Math.random() * cheatTips.length)];
			setSelectedCheatTip(randomTip);
		} else if (!showCheatTip && selectedCheatTip) {
			// Clear tip when dismissed
			setSelectedCheatTip('');
		}
	}, [showCheatTip, selectedCheatTip]);
	
	// Debug log for mug selector state
	React.useEffect(() => {
		console.log('[BettingPhaseView] showMugSelector:', showMugSelector, 'mugTapCount:', mugTapCount);
	}, [showMugSelector, mugTapCount]);
	
	// Capture the initial offset when this round first renders
	const initialOffsetRef = React.useRef<{round: number, offset: number}>({round: 0, offset: 0});
	const currentServerTime = kmClient.serverTimestamp();
	
	if (initialOffsetRef.current.round !== roundNumber && bettingPhaseStartTime > 0) {
		// New round detected - capture how far ahead we already are
		initialOffsetRef.current = {
			round: roundNumber,
			offset: currentServerTime - bettingPhaseStartTime
		};
	}
	
	// Calculate elapsed time and subtract the initial offset
	const actualElapsed = bettingPhaseStartTime > 0 ? currentServerTime - bettingPhaseStartTime : 0;
	const adjustedElapsed = Math.max(0, actualElapsed - initialOffsetRef.current.offset);
	const timeElapsed = Math.min(adjustedElapsed, config.bettingPhaseDuration * 1000);

	// Show tip if this player lost money in previous round and reset mug taps
	React.useEffect(() => {
		const isLosingPlayer = losingPlayersLastRound.includes(kmClient.id);
		const justCameBack = myPlayer?.justReturnedFromComeback || false;
		const shouldShowTip = roundNumber > 1 && isLosingPlayer && !justCameBack;
		
		console.log('[BettingPhaseView] Effect triggered:', {
			roundNumber,
			losingPlayersLastRound: [...losingPlayersLastRound],
			myId: kmClient.id,
			isLosingPlayer,
			justCameBack,
			shouldShowTip
		});
		
		// Update tip visibility, reset botched cheating, and reset mug taps
		kmClient.transact([playerStore], ([state]) => {
			state.showCheatTip = shouldShowTip;
			state.botchedCheating = false;
			state.mugTapCount = 0;
			state.showMugSelector = false;
		});
	}, [roundNumber, JSON.stringify(losingPlayersLastRound)]);

	if (!myPlayer) return null;

	// Check if player is eliminated (no gold left)
	if (myPlayer.gold <= 0) {
		return null; // Don't show anything, wait for transition to results view
	}

	// Check if player joined mid-round (no cards dealt)
	if (myPlayer.cards.length === 0) {
		return (
			<div className="flex w-full max-w-2xl flex-col gap-4">
				<div className="rounded-lg border-2 border-gray-400 bg-gray-50 p-6 shadow-lg text-center">
					<h2 className="mb-4 text-2xl font-bold text-gray-600">{config.roundInProgressTitle}</h2>
					<p className="text-gray-600">{config.roundInProgressMessage}</p>
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
					<p className="text-gray-500">{config.waitingForRoundEnd}</p>
				</div>
			</div>
		);
	}

	if (myPlayer.bet > 0) {
		return (
			<div className="flex w-full max-w-2xl flex-col gap-4">
				{/* Timer */}
				<div className="rounded-lg border-2 border-red-600 bg-white p-4 shadow-md">
					<p className="mb-2 text-center text-lg font-bold">{config.timeRemaining}:</p>
					<div className="text-4xl font-bold text-blue-600 text-center">
						<KmTimeCountdown ms={Math.max(0, config.bettingPhaseDuration * 1000 - timeElapsed)} />
					</div>
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
										{config.cheaterHand}
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

				{/* Bet Status - Tappable for mugging */}
				<div
					onClick={async (e) => {
						e.stopPropagation();
						console.log('[BettingPhaseView] Bet area clicked, hasMugged:', myPlayer.hasMugged, 'mugTapCount:', mugTapCount);
						if (!myPlayer.hasMugged) {
							await playerActions.tapMugArea();
						}
					}}
					className="rounded-lg border-2 border-green-600 bg-white p-6 shadow-lg text-center cursor-pointer active:bg-green-50 select-none"
					style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
				>
					<h2 className="mb-4 text-2xl font-bold text-green-600">
						{config.betPlacedTitle}
					</h2>
					<p className="text-lg">
						{config.currentBet}: <span className="font-bold">{myPlayer.bet}</span>
					</p>
					<p className="mt-2 text-gray-500">{config.waitingForRoundEnd}</p>
					{myPlayer.hasMugged && (
						<p className="mt-2 text-sm text-red-600 font-semibold">
							{config.muggingInProgress}
						</p>
					)}
				</div>
				
				{/* Mug Selector Modal */}
				{showMugSelector && (
					<MugSelector
						isOpen={showMugSelector}
						onClose={() => playerActions.closeMugSelector()}
					/>
				)}
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
		
		{showMugSelector && (
			<MugSelector
				isOpen={showMugSelector}
				onClose={() => playerActions.closeMugSelector()}
			/>
		)}

		{/* Timer */}
		<div className="rounded-lg border-2 border-red-600 bg-white p-4 shadow-md">
			<p className="mb-2 text-center text-lg font-bold">{config.timeRemaining}:</p>
			<div className="text-4xl font-bold text-blue-600 text-center">
				<KmTimeCountdown ms={Math.max(0, config.bettingPhaseDuration * 1000 - timeElapsed)} />
			</div>
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

		{/* Cheat tip message */}
		{showCheatTip && selectedCheatTip && (
			<div className="rounded-lg border-2 border-orange-500 bg-orange-50 p-4 shadow-md">
				<div className="mb-2 flex items-start justify-between">
					<div className="text-sm font-semibold text-orange-800">
						{config.cheatTipTitle}
					</div>
					<button
						onClick={handleDismissTip}
						className="ml-2 text-orange-600 hover:text-orange-800"
						aria-label="Dismiss tip"
					>
						✕
					</button>
				</div>
				<div className="prose prose-sm max-w-none text-xs text-orange-700">
					<ReactMarkdown>{selectedCheatTip}</ReactMarkdown>
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
									{config.cheaterHand}
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
						onClick={() => adjustBet(-config.betIncrementLarge)}
						type="button"
						className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
					>
						-{config.betIncrementLarge}
					</button>
					<button
						onClick={() => adjustBet(-config.betIncrementSmall)}
						type="button"
						className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
					>
						-{config.betIncrementSmall}
					</button>
					<div className="min-w-[100px] text-center">
						<span className="text-2xl font-bold">{localBet}</span>
						{isAllIn && (
							<div className="text-xs font-bold text-red-600">{config.allIn}</div>
						)}
					</div>
					<button
						onClick={() => adjustBet(config.betIncrementSmall)}
						type="button"
						className="rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
					>
						+{config.betIncrementSmall}
					</button>
					<button
						onClick={() => adjustBet(config.betIncrementLarge)}
						type="button"
						className="rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
					>
						+{config.betIncrementLarge}
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
