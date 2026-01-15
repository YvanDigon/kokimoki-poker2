import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore } from '@/state/stores/global-store';
import { getGoldEmoji } from '@/utils/gold-emoji';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const ComebackModeView: React.FC = () => {
	const { players, phase, pot, started } = useSnapshot(globalStore.proxy);
	const myPlayer = players[kmClient.id];

	// Get active players (not in comeback mode) for prediction
	const activePlayers = Object.entries(players).filter(
		([_, player]) => !player.inComebackMode
	);

	// Calculate current pot including bets from active players only (exclude comeback mode players)
	const currentPot = phase === 'betting' 
		? pot + Object.entries(players)
			.filter(([_, player]) => !player.inComebackMode)
			.reduce((sum, [_, p]) => sum + p.bet, 0)
		: pot;

	const handleSelectWinner = async (winnerId: string) => {
		await globalActions.setComebackPrediction(kmClient.id, winnerId);
	};

	// Show waiting message if game hasn't started or during results phase
	if (!started || phase === 'results' || phase === 'ended') {
		// Show all players folded notification (no winner this round)
		if (myPlayer?.allPlayersFolded) {
			return (
				<div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<div className="text-center">
						<div className="mb-4 rounded-lg border-2 border-gray-400 bg-gray-100 p-4">
							<h3 className="mb-2 text-xl font-bold text-gray-700">
								{config.comebackAllPlayersFoldedTitle}
							</h3>
							<p className="text-gray-600">{config.comebackAllPlayersFoldedMessage}</p>
						</div>
						<h2 className="mb-2 text-2xl font-bold">{config.comebackModeTitle}</h2>
						<p className="text-gray-600">{config.comebackWaitingMessage}</p>
					</div>
				</div>
			);
		}

		// Show failed prediction message if applicable
		if (myPlayer?.failedComebackPrediction) {
			return (
				<div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<div className="text-center">
						<div className="mb-4 rounded-lg border-2 border-red-500 bg-red-50 p-4">
							<h3 className="mb-2 text-xl font-bold text-red-700">
								{config.comebackFailedTitle}
							</h3>
							<p className="text-red-600">{config.comebackFailedMessage}</p>
						</div>
						<h2 className="mb-2 text-2xl font-bold">{config.comebackModeTitle}</h2>
						<p className="text-gray-600">{config.comebackWaitingMessage}</p>
					</div>
				</div>
			);
		}

		// If just entered comeback mode and hasn't made a prediction yet, show a helpful notice
		if (myPlayer && !myPlayer.comebackPrediction && !myPlayer.failedComebackPrediction) {
			return (
				<div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
					<div className="text-center">
						<div className="mb-4 rounded-lg border-2 border-orange-500 bg-orange-50 p-4">
							<h3 className="mb-2 text-xl font-bold text-orange-700">
								{config.comebackBankruptTitle}
							</h3>
							<p className="text-orange-600">{config.comebackBankruptMessage}</p>
						</div>
						<h2 className="mb-2 text-2xl font-bold">{config.comebackModeTitle}</h2>
						<p className="text-gray-600">{config.comebackWaitingMessage}</p>
					</div>
				</div>
			);
		}
		
		return (
			<div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
				<div className="text-center">
					<h2 className="mb-2 text-2xl font-bold">{config.comebackModeTitle}</h2>
					<p className="text-gray-600">{config.comebackWaitingMessage}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
			<div className="text-center">
				<h2 className="mb-2 text-2xl font-bold">{config.comebackModeTitle}</h2>
				<p className="text-sm text-gray-600">{config.comebackModeDescription}</p>

				<h3 className="mb-3 text-lg font-bold">{config.comebackPredictWinner}</h3>
				
				{myPlayer?.comebackPrediction && (
					<div className="mb-3 rounded-lg bg-blue-100 p-3">
						<div className="text-sm font-semibold text-blue-800">
							{config.comebackYourPrediction}
						</div>
						<div className="text-lg font-bold text-blue-900">
							{players[myPlayer.comebackPrediction]?.name || config.comebackNoPrediction}
						</div>
					</div>
				)}

				<div className="grid gap-2">
					{activePlayers.map(([playerId, player]) => {
						const isSelected = myPlayer?.comebackPrediction === playerId;
						const isFolded = player.folded;
						
						return (
							<button
								key={playerId}
								onClick={() => handleSelectWinner(playerId)}
								className={`rounded-lg border-2 p-3 text-left transition-all ${
									isSelected
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-200 bg-white hover:border-blue-300'
								} ${isFolded ? 'opacity-50' : ''}`}
							>
								<div className="flex items-center justify-between">
									<div>
										<div className="font-bold">{player.name}</div>
										<div className="text-sm text-gray-600">
											{isFolded ? (
										<span className="text-red-600">{config.foldedLabel}</span>
											) : (
												<span>
													{config.betLabel} {player.bet} {getGoldEmoji(player.bet)}
												</span>
											)}
										</div>
									</div>
									{isSelected && (
										<div className="text-2xl">✓</div>
									)}
								</div>
							</button>
						);
					})}
				</div>

				{activePlayers.length === 0 && (
					<div className="text-center text-gray-500">
						{config.comebackWaitingMessage}
					</div>
				)}
			</div>

			<div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-center">
				<div className="text-sm font-semibold text-gray-700">{config.pot}</div>
				<div className="text-2xl font-bold">
					{currentPot} {getGoldEmoji(currentPot)}
				</div>
			</div>
		</div>
	);
};
