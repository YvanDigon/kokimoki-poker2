import { config } from '@/config';
import { DenounceCheaterModal } from '@/components/denounce-cheaters-modal';
import { HandRankingsModal } from '@/components/hand-rankings-modal';
import { PlayingCard } from '@/components/playing-card';
import { kmClient } from '@/services/km-client';
import { globalStore, type PlayerData } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import { getGoldEmoji } from '@/utils/gold-emoji';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const ResultsView: React.FC = () => {
	const { players, winners, pot, punishmentUsedThisRound } = useSnapshot(globalStore.proxy);
	const { muggingFailed } = useSnapshot(playerStore.proxy);
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const myPlayer = players[kmClient.id];

	if (!myPlayer) return null;

	const isWinner = winners.includes(kmClient.id);
	const myGold = myPlayer.gold;
	const wasAccused = myPlayer.accusedOfCheating;
	
	// Check if player just entered comeback mode
	const justEnteredComebackMode = myPlayer.inComebackMode && myGold <= 0;
	
	// Check if player had a comeback prediction and it was correct
	const hadSuccessfulComeback = myPlayer.justReturnedFromComeback;
	
	// Check if player had a comeback prediction but it was wrong
	const hadFailedComeback = myPlayer.comebackPrediction && 
		!winners.includes(myPlayer.comebackPrediction) && 
		myPlayer.inComebackMode;
	
	// Check if at least one cheater was actually caught (not wrongly accused)
	const anyCheaterCaught = Object.values(players).some(
		(p: PlayerData) => p.accusedOfCheating && p.cheated
	);

	// Calculate winnings/losses (including minimal bet deducted at round start)
	const myBet = myPlayer.bet;
	const totalLost = myBet + config.minimalBet; // Total amount lost (bet + minimal bet)
	const winnings = isWinner && !myPlayer.folded ? Math.floor(pot / winners.length) : 0;
	const netChange = winnings - totalLost;

	// Show comeback mode entry message
	if (justEnteredComebackMode) {
		return (
			<div className="flex w-full max-w-2xl flex-col gap-6">
				<div className="rounded-lg border-2 border-blue-600 bg-white p-6 shadow-lg">
					<h2 className="mb-4 text-center text-3xl font-bold text-blue-600">
						{config.comebackModeTitle}
					</h2>

					<div className="prose prose-sm mb-6 max-w-none text-center">
						<p className="text-gray-700">{config.comebackModeDescription}</p>
					</div>
				</div>
			</div>
		);
	}

	// Show simplified view for successful comeback (no round details, they didn't play)
	if (hadSuccessfulComeback) {
		return (
			<div className="flex w-full max-w-2xl flex-col gap-6">
				<div className="rounded-lg border-2 border-green-600 bg-green-50 p-6 shadow-lg">
					<h3 className="mb-4 text-center text-3xl font-bold text-green-600">
						{config.comebackSuccessTitle}
					</h3>
					<p className="mb-4 text-center text-lg text-green-700">
						{config.comebackSuccessMessage.replace('{amount}', myGold.toString())}
					</p>
					<div className="rounded-lg bg-white p-4 text-center">
						<p className="text-xl font-bold flex items-center justify-center gap-2">
							<span>{config.yourGold}: <span className="text-green-600">{myGold}</span></span>
							{myGold > 0 && <span>{getGoldEmoji(myGold)}</span>}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-6">
			{/* Failed Comeback Notification */}
			{hadFailedComeback && (
				<div className="rounded-lg border-2 border-red-600 bg-red-50 p-6 shadow-lg">
					<h3 className="mb-2 text-center text-xl font-bold text-red-600">
						{config.comebackFailedTitle}
					</h3>
					<p className="text-center text-red-700">
						{config.comebackFailedMessage}
					</p>
				</div>
			)}

			{/* Redistributed Gold Notification */}
			{myPlayer.receivedRedistributedGold && (
				<div className="rounded-lg border-2 border-green-600 bg-green-50 p-6 shadow-lg">
					<h3 className="mb-2 text-center text-xl font-bold text-green-600">
						{config.redistributedGoldTitle}
					</h3>
					<p className="text-center">
						{config.redistributedGoldMessage}
					</p>
				</div>
			)}

			{/* Folded/No Bet Notification - Show if punishment happened and at least one cheater was caught, but player didn't receive gold */}
			{!myPlayer.receivedRedistributedGold && punishmentUsedThisRound && anyCheaterCaught && (myPlayer.folded || myPlayer.bet === 0) && (
				<div className="rounded-lg border-2 border-gray-400 bg-gray-50 p-6 shadow-lg">
					<p className="text-center text-gray-700">
						{config.foldedNoGoldMessage}
					</p>
				</div>
			)}


			{/* Elimination Bonus Notification */}
			{myPlayer.receivedEliminationBonus && (
				<div className="rounded-lg border-2 border-green-600 bg-green-50 p-6 shadow-lg">
					<h3 className="mb-2 text-center text-xl font-bold text-green-600">
						{config.eliminationBonusTitle}
					</h3>
					<p className="text-center text-green-700">
						{config.eliminationBonusMessage.replace('{amount}', String(config.eliminationBonus))}
					</p>
				</div>
			)}

			{/* Folded and Missed Elimination Bonus */}
			{!myPlayer.receivedEliminationBonus && myPlayer.folded && Object.values(players).some(p => p.receivedEliminationBonus) && (
				<div className="rounded-lg border-2 border-gray-400 bg-gray-50 p-6 shadow-lg">
					<h3 className="mb-2 text-center text-xl font-bold text-gray-600">
						{config.eliminationMissedTitle}
					</h3>
					<p className="text-center text-gray-700">
						{config.eliminationMissedMessage.replace('{amount}', String(config.eliminationBonus))}
					</p>
				</div>
			)}

			{/* Mugged Notification */}
			{myPlayer.muggedAmount > 0 && (
				<div className="rounded-lg border-2 border-red-600 bg-red-50 p-6 shadow-lg">
					<h3 className="mb-2 text-center text-xl font-bold text-red-600">
						{config.muggedTitle}
					</h3>
					<p className="text-center text-red-700">
						{config.muggedMessage.replace('{amount}', String(myPlayer.muggedAmount))}
					</p>
				</div>
			)}

			{/* Mugging Failed Notification */}
			{muggingFailed && (
				<div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6 shadow-lg">
					<div className="flex items-start justify-between">
						<p className="text-sm font-bold text-blue-800">
							{config.muggingFailedMessage}
						</p>
						<button
							onClick={async () => {
								await kmClient.transact([playerStore], ([state]) => {
									state.muggingFailed = false;
								});
							}}
							type="button"
							className="text-blue-600 hover:text-blue-800 text-xl font-bold ml-2"
						>
							×
						</button>
					</div>
				</div>
			)}

			{/* Accusation Notification */}
			{wasAccused && (
				<div className={`rounded-lg border-2 p-6 shadow-lg ${
					myPlayer.wronglyAccused
						? 'border-green-600 bg-green-50'
						: 'border-red-600 bg-red-50'
				}`}>
					<h3 className={`mb-2 text-center text-xl font-bold ${
						myPlayer.wronglyAccused ? 'text-green-600' : 'text-red-600'
					}`}>
					{myPlayer.wronglyAccused ? config.wronglyAccusedTitle : config.caughtCheatingTitle}
				</h3>
				<p className="text-center">
					{myPlayer.wronglyAccused
						? config.wronglyAccusedMessage
						: config.caughtCheatingMessage}
					</p>
				</div>
			)}

			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<h2 className="mb-6 text-center text-2xl font-bold">{config.resultsTitle}</h2>

				{/* Result Status - Only show if player has cards (participated in round) */}
				{myPlayer.cards.length > 0 && (
					<div className="mb-6 rounded-lg bg-gray-50 p-4 text-center">
						{myPlayer.folded || myBet === 0 ? (
							<>
								<p className="text-xl font-bold text-gray-600">{config.youFolded}</p>
								<p className="mt-2 text-lg text-red-600 flex items-center justify-center gap-2">
									<span>{config.losses}: -{totalLost}</span>
									{totalLost > 0 && <span>{getGoldEmoji(totalLost)}</span>}
								</p>
							</>
						) : isWinner ? (
						<>
							<p className="mb-2 text-2xl font-bold text-green-600">{config.youWon}</p>
							<p className="text-lg flex items-center justify-center gap-2">
								<span>{config.winnings}: <span className="font-bold text-green-600">+{winnings}</span></span>
								{winnings > 0 && <span>{getGoldEmoji(winnings)}</span>}
							</p>
							<p className="text-lg flex items-center justify-center gap-2">
								<span>{config.losses}: <span className="text-red-600">-{totalLost}</span></span>
								{totalLost > 0 && <span>{getGoldEmoji(totalLost)}</span>}
							</p>
							<p className="text-xl font-bold flex items-center justify-center gap-2">
								<span>{config.netLabel}: <span className={netChange >= 0 ? 'text-green-600' : 'text-red-600'}>
									{netChange >= 0 ? '+' : ''}{netChange}
								</span></span>
								{netChange !== 0 && <span>{getGoldEmoji(Math.abs(netChange))}</span>}
							</p>
						</>
					) : (
						<>
							<p className="mb-2 text-2xl font-bold text-red-600">{config.youLost}</p>
							<p className="text-lg text-red-600 flex items-center justify-center gap-2">
								<span>{config.losses}: -{totalLost}</span>
								{totalLost > 0 && <span>{getGoldEmoji(totalLost)}</span>}
							</p>
						</>
					)}
				</div>
			)}

			{/* My Hand */}
			{!myPlayer.folded && myBet > 0 && (
					<div className="mb-6">
						<h3 className="mb-2 text-center font-bold">
							{config.yourCards}
							{myPlayer.handName && (
								<span className="ml-2 text-blue-600">({myPlayer.handName})</span>
							)}
						</h3>
						<div className="flex flex-wrap justify-center gap-2">
							{myPlayer.cards.map((card, index) => (
								<PlayingCard key={index} card={card} />
							))}
						</div>
					</div>
				)}

				{/* Gold Status */}
				<div className="rounded-lg bg-yellow-50 p-4 text-center">
					<p className="text-xl font-bold flex items-center justify-center gap-2">
						<span>{config.yourGold}: <span className="text-green-600">{myGold}</span></span>
						{myGold > 0 && <span>{getGoldEmoji(myGold)}</span>}
					</p>
				</div>
				
				{/* Rules Button */}
				<div className="pt-2 flex justify-center">
					<HandRankingsModal currentCards={myPlayer.cards} />
				</div>
			</div>

			{/* Denounce Cheaters Button */}
			<div className="rounded-lg border-2 border-gray-300 bg-white p-4 shadow-lg">
				<button
					onClick={() => setIsModalOpen(true)}
					type="button"
					className="w-full rounded-lg bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700"
				>
					{config.denounceCheaters}
				</button>
				<p className="mt-2 text-center text-sm text-gray-600">
					{config.denounceExplainer}
				</p>
			</div>

			{/* Denounce Modal */}
			<DenounceCheaterModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</div>
	);
};
