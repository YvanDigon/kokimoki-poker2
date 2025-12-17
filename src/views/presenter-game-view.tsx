import { config } from '@/config';
import { PlayingCard } from '@/components/playing-card';
import { useServerTimer } from '@/hooks/useServerTime';
import { kmClient } from '@/services/km-client';
import { globalStore } from '@/state/stores/global-store';
import { getGoldEmoji } from '@/utils/gold-emoji';
import { KmTimeCountdown } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const PresenterGameView: React.FC = () => {
	const { phase, roundNumber, pot, players, winners, bettingPhaseStartTime, eliminatedPlayers, suspectedCheaters } = useSnapshot(globalStore.proxy);
	const serverTime = useServerTimer(250);

	const playerEntries = Object.entries(players);
	
	// Calculate remaining time in betting phase (same as host)
	const bettingTimeElapsed = serverTime - bettingPhaseStartTime;
	const bettingTimeRemaining = Math.max(0, config.bettingPhaseDuration * 1000 - bettingTimeElapsed);

	if (phase === 'betting') {
		return (
			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-center text-2xl font-bold">
					{config.bettingPhaseTitle} - {config.roundNumber} {roundNumber}
				</h2>

			<div className="mb-6 text-center space-y-2">
				<p className="text-xl">
					{config.pot}: <span className="font-bold text-green-600">{pot}</span>
				</p>
				<div>
					<p className="text-lg font-bold mb-2">{config.timeRemaining}:</p>
					<div className="text-4xl font-bold text-blue-600">
						<KmTimeCountdown ms={bettingTimeRemaining} />
					</div>
				</div>
			</div>				<div className="grid grid-cols-3 gap-3">
					{playerEntries.map(([playerId, player]) => {
						const isAllIn = player.bet > 0 && player.bet === player.gold + player.bet;
						
						return (
							<div
								key={playerId}
								className={`rounded-lg border-2 p-2 ${
									isAllIn
										? 'border-red-600 bg-red-50'
										: 'border-gray-300 bg-gray-50'
								}`}
							>
								{isAllIn && (
									<div className="mb-2 text-center">
										<span className="text-lg font-bold text-red-600">{config.allIn}</span>
									</div>
								)}
								
								<p className="mb-1 text-center text-sm font-bold truncate">
									{player.name}
								</p>
								<div className="text-center text-xs space-y-1">
									<div className="flex items-center justify-center gap-1">
										<span>{config.yourGold}: <span className="font-bold">{player.gold}</span></span>
										<span>{getGoldEmoji(player.gold)}</span>
									</div>
									<div className="flex items-center justify-center gap-1">
										<span>
											{config.currentBet}:{' '}
											<span className="font-bold">
												{player.folded ? config.youFolded : player.bet > 0 ? player.bet : '-'}
											</span>
										</span>
										{player.bet > 0 && !player.folded && (
											<span>{getGoldEmoji(player.bet)}</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	if (phase === 'results' || phase === 'ended') {
		// Sort players: winners first, then by hand rank, then by gold
		const sortedPlayers = [...playerEntries].sort(([aId, a], [bId, b]) => {
			const aIsWinner = winners.includes(aId);
			const bIsWinner = winners.includes(bId);
			if (aIsWinner && !bIsWinner) return -1;
			if (!aIsWinner && bIsWinner) return 1;
			if (a.handRank !== b.handRank) return b.handRank - a.handRank;
			return b.gold - a.gold;
		});

		// Find duplicate cards across all players who bet
		const cardCounts = new Map<string, number>();
		playerEntries.forEach(([_, player]) => {
			if (!player.folded && player.bet > 0) {
				player.cards.forEach(card => {
					const cardKey = `${card.suit}-${card.rank}`;
					cardCounts.set(cardKey, (cardCounts.get(cardKey) || 0) + 1);
				});
			}
		});

		// Function to check if a card is duplicated
		const isDuplicateCard = (card: { suit: string; rank: string }) => {
			const cardKey = `${card.suit}-${card.rank}`;
			return (cardCounts.get(cardKey) || 0) > 1;
		};

		return (
			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-center text-2xl font-bold">
					{phase === 'ended' ? config.finalRankingsTitle : config.resultsTitle}
				</h2>

				<div className="mb-4 text-center">
					<p className="text-xl flex items-center justify-center gap-2">
						<span>{config.pot}: <span className="font-bold text-green-600">{pot}</span></span>
						<span>{getGoldEmoji(pot)}</span>
					</p>
				</div>

				<div className="grid grid-cols-3 gap-3">
					{sortedPlayers.map(([playerId, player]) => {
						const isWinner = winners.includes(playerId);
						const wasAccused = player.accusedOfCheating;
						const borderColor = wasAccused
							? player.wronglyAccused
								? 'border-green-500 bg-green-50'
								: 'border-orange-500 bg-orange-50'
							: isWinner
								? 'border-yellow-400 bg-yellow-50'
								: 'border-gray-300 bg-gray-50';

						return (
					<div
						key={playerId}
						className={`rounded-lg border-2 p-2 ${borderColor}`}
					>
						<div className="mb-1">
							<div className="flex items-center justify-between">
								<p className="text-sm font-bold truncate">{player.name}</p>
								{wasAccused && (
									<div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
										player.wronglyAccused
											? 'bg-green-500 text-white'
										: 'bg-orange-500 text-white'
								}`}>
									{player.wronglyAccused ? '💢' : '⚠'}
								</div>
								)}
								{!wasAccused && isWinner && (
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white flex-shrink-0">
										👑
									</div>
								)}
								{!wasAccused && !isWinner && player.handRank > 0 && (
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-xs font-bold text-white flex-shrink-0">
										{player.handRank}
									</div>
								)}
							</div>
							
							{wasAccused && player.cheated && (
								<div className="mt-1 text-center">
									<span className="text-xs font-bold text-red-600">
										⚠️ CAUGHT CHEATING
									</span>
								</div>
							)}
							
						{wasAccused && player.wronglyAccused && (
							<div className="mt-1 text-center">
								<span className="text-xs font-bold text-green-600">
									💢 WRONGLY ACCUSED
								</span>
							</div>
						)}
						</div>
								
								<div className="mb-1 text-center text-xs flex items-center justify-center gap-1">
									<span>{config.yourGold}: <span className="font-bold">{player.gold}</span></span>
									<span>{getGoldEmoji(player.gold)}</span>
								</div>
								
								{!player.folded && player.bet > 0 && (
									<div className="mb-1 text-center text-xs flex items-center justify-center gap-1">
										<span>Bet: <span className="font-bold text-blue-600">{player.bet}</span></span>
										<span>{getGoldEmoji(player.bet)}</span>
									</div>
								)}

							{!player.folded && player.handName && (
								<>
									<p className="mb-1 text-center text-xs font-bold text-blue-600">
										{player.handName}
									</p>
									<div className="flex flex-wrap justify-center gap-0.5">
										{player.cards.map((card, idx) => (
											<PlayingCard 
												key={idx} 
												card={card} 
												className={`h-14 w-10 ${isDuplicateCard(card) ? 'bg-red-100' : ''}`}
												compact 
											/>
										))}
									</div>
									{/* Suspicion indicator */}
									{suspectedCheaters[playerId] && suspectedCheaters[playerId].length > 0 && (
										<div className="mt-1 text-center">
											{Array.from({ length: suspectedCheaters[playerId].length }).map((_, idx) => (
												<span key={idx} className="text-lg">
													👤
												</span>
											))}
										</div>
									)}
								</>
						)}								{player.folded && (
								<p className="text-center text-xs text-gray-500">{config.youFolded}</p>
							)}
						</div>
					);
				})}
				
				{/* Eliminated Players */}
				{eliminatedPlayers.map((playerName, idx) => (
					<div
						key={`eliminated-${idx}`}
						className="rounded-lg border-2 border-gray-400 bg-gray-200 p-2 opacity-60"
					>
						<p className="mb-1 text-center text-sm font-bold truncate text-gray-700">
							{playerName}
						</p>
						<p className="text-center text-xs font-bold text-red-600">
							GAME OVER
						</p>
					</div>
				))}
			</div>
		</div>
	);
}	return null;
};
