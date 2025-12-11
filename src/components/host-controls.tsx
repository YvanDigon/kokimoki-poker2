import { config } from '@/config';
import { PunishCheaters } from '@/components/punish-cheaters';
import { useServerTimer } from '@/hooks/useServerTime';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore } from '@/state/stores/global-store';
import { KmTimeCountdown } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const HostControls: React.FC = () => {
	const { started, phase, roundNumber, bettingPhaseStartTime, players } =
		useSnapshot(globalStore.proxy);
	const serverTime = useServerTimer(250);

	const playerCount = Object.keys(players).length;
	const canStartGame = !started && playerCount >= 2;

	// Calculate remaining time in betting phase
	const bettingTimeElapsed = serverTime - bettingPhaseStartTime;
	const bettingTimeRemaining = Math.max(0, config.bettingPhaseDuration - bettingTimeElapsed);

	const handleStartGame = async () => {
		await globalActions.startGame();
	};

	const handleEndBetting = async () => {
		await globalActions.endBettingPhase();
	};

	const handleNewRound = async () => {
		await globalActions.startNewRound();
	};

	const handleEndGame = async () => {
		await globalActions.endGame();
	};

	const handleStartNewGame = async () => {
		await globalActions.startNewGame();
	};

	const handleResetPlayers = async () => {
		await globalActions.resetPlayers();
	};

	if (!started) {
		return (
			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-xl font-bold">{config.hostLabel}</h2>

				<div className="mb-4">
					<p className="text-lg">
						{config.players}: <span className="font-bold">{playerCount}</span>
					</p>
				</div>

				<button
					onClick={handleStartGame}
					disabled={!canStartGame}
					type="button"
					className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{config.startGameButton}
				</button>

				{!canStartGame && playerCount < 2 && (
					<p className="mt-2 text-sm text-red-600">Need at least 2 players to start</p>
				)}
			</div>
		);
	}

	if (phase === 'betting') {
		return (
			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-xl font-bold">
					{config.bettingPhaseTitle} - {config.roundNumber} {roundNumber}
				</h2>

				<div className="mb-4 space-y-2">
					<p className="text-lg">
						{config.players}: <span className="font-bold">{playerCount}</span>
					</p>
					<div>
						<p className="text-lg font-bold">{config.timeRemaining}:</p>
						<div className="text-2xl font-bold text-blue-600">
							<KmTimeCountdown ms={bettingTimeRemaining} />
						</div>
					</div>
					<p className="text-sm">
						Ready:{' '}
						<span className="font-bold">
							{Object.values(players).filter((p) => p.bet > 0 || p.folded).length} /{' '}
							{playerCount}
						</span>
					</p>
				</div>

				<button
					onClick={handleEndBetting}
					type="button"
					className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
				>
					{config.endBettingButton}
				</button>
			</div>
		);
	}

	if (phase === 'results') {
		return (
			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-xl font-bold">{config.resultsTitle}</h2>

			<div className="mb-4 space-y-2">
				<p className="text-lg">
					{config.roundNumber}: <span className="font-bold">{roundNumber}</span>
				</p>
				<p className="text-lg">
					{config.players}: <span className="font-bold">{playerCount}</span>
				</p>
			</div>

			<div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
				<p className="text-sm text-blue-800">
					💡 {config.cheatDiscussionHint}
				</p>
			</div>

			<div className="space-y-2">
				<PunishCheaters />
					<button
						onClick={handleNewRound}
						type="button"
						className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
					>
						{config.newRoundButton}
					</button>
					<button
						onClick={handleEndGame}
						type="button"
						className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700"
					>
						{config.endGameButton}
					</button>
				</div>
			</div>
		);
	}

	if (phase === 'ended') {
		return (
			<div className="rounded-lg border-2 border-red-600 bg-white p-6 shadow-lg">
				<h2 className="mb-4 text-xl font-bold">{config.gameOver}</h2>
				<p className="mb-4 text-center text-gray-600">{config.finalRankingsTitle}</p>
				<div className="space-y-2">
					<button
						onClick={handleResetPlayers}
						type="button"
						className="w-full rounded-lg bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700"
					>
						{config.resetPlayersButton}
					</button>
					<button
						onClick={handleStartNewGame}
						type="button"
						className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700"
					>
						{config.startNewGameButton}
					</button>
				</div>
			</div>
		);
	}

	return null;
};
