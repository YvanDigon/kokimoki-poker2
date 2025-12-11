import { config } from '@/config';
import { DenounceCheaterModal } from '@/components/denounce-cheaters-modal';
import { HandRankingsModal } from '@/components/hand-rankings-modal';
import { PlayingCard } from '@/components/playing-card';
import { kmClient } from '@/services/km-client';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { getGoldEmoji } from '@/utils/gold-emoji';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { useSnapshot } from 'valtio';

export const ResultsView: React.FC = () => {
	const { players, winners, pot, punishmentUsedThisRound } = useSnapshot(globalStore.proxy);
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const myPlayer = players[kmClient.id];

	if (!myPlayer) return null;

	const isWinner = winners.includes(kmClient.id);
	const myGold = myPlayer.gold;
	const isEliminated = myGold <= 0;
	const wasAccused = myPlayer.accusedOfCheating;
	
	// Check if at least one cheater was actually caught (not wrongly accused)
	const anyCheaterCaught = Object.values(players).some(
		p => p.accusedOfCheating && p.cheated
	);

	// Calculate winnings/losses
	const myBet = myPlayer.bet;
	const winnings = isWinner && !myPlayer.folded ? Math.floor(pot / winners.length) : 0;
	const netChange = winnings - myBet;

	const handleRejoin = async () => {
		await playerActions.rejoinGame();
	};

	if (isEliminated) {
		return (
			<div className="flex w-full max-w-2xl flex-col gap-6">
				<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
					<h2 className="mb-4 text-center text-3xl font-bold text-red-600">
						{config.gameOver}
					</h2>

					<div className="prose prose-sm mb-6 max-w-none text-center">
						<ReactMarkdown>{config.gameOverMd}</ReactMarkdown>
					</div>

					<button
						onClick={handleRejoin}
						type="button"
						className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
					>
						{config.rejoinButton}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-6">
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
		)}			{/* Accusation Notification */}
			{wasAccused && (
				<div className={`rounded-lg border-2 p-6 shadow-lg ${
					myPlayer.wronglyAccused
						? 'border-green-600 bg-green-50'
						: 'border-red-600 bg-red-50'
				}`}>
					<h3 className={`mb-2 text-center text-xl font-bold ${
						myPlayer.wronglyAccused ? 'text-green-600' : 'text-red-600'
					}`}>
						{myPlayer.wronglyAccused ? '💢 Wrongly Accused!' : '⚠️ Caught Cheating!'}
					</h3>
					<p className="text-center">
						{myPlayer.wronglyAccused
							? 'You were wrongly accused! Your gold has been doubled.'
							: 'You were caught cheating! Your gold has been halved.'}
					</p>
				</div>
			)}

			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<h2 className="mb-6 text-center text-2xl font-bold">{config.resultsTitle}</h2>

				{/* Result Status */}
				<div className="mb-6 rounded-lg bg-gray-50 p-4 text-center">
					{myPlayer.folded || myBet === 0 ? (
						<>
							<p className="text-xl font-bold text-gray-600">{config.youFolded}</p>
							{myBet > 0 && (
								<p className="mt-2 text-lg text-red-600 flex items-center justify-center gap-2">
									<span>{config.losses}: -{myBet}</span>
									{myBet > 0 && <span>{getGoldEmoji(myBet)}</span>}
								</p>
							)}
						</>
					) : isWinner ? (
						<>
							<p className="mb-2 text-2xl font-bold text-green-600">{config.youWon}</p>
							<p className="text-lg flex items-center justify-center gap-2">
								<span>{config.winnings}: <span className="font-bold text-green-600">+{winnings}</span></span>
								{winnings > 0 && <span>{getGoldEmoji(winnings)}</span>}
							</p>
							<p className="text-lg flex items-center justify-center gap-2">
								<span>{config.losses}: <span className="text-red-600">-{myBet}</span></span>
								{myBet > 0 && <span>{getGoldEmoji(myBet)}</span>}
							</p>
							<p className="text-xl font-bold flex items-center justify-center gap-2">
								<span>Net: <span className={netChange >= 0 ? 'text-green-600' : 'text-red-600'}>
									{netChange >= 0 ? '+' : ''}{netChange}
								</span></span>
								{netChange !== 0 && <span>{getGoldEmoji(Math.abs(netChange))}</span>}
							</p>
						</>
					) : (
						<>
							<p className="mb-2 text-2xl font-bold text-red-600">{config.youLost}</p>
							{myBet > 0 && (
								<p className="text-lg text-red-600 flex items-center justify-center gap-2">
									<span>{config.losses}: -{myBet}</span>
									{myBet > 0 && <span>{getGoldEmoji(myBet)}</span>}
								</p>
							)}
						</>
					)}
				</div>

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
