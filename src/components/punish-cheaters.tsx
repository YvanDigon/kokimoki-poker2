import { config } from '@/config';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore } from '@/state/stores/global-store';
import * as React from 'react';
import { useSnapshot } from 'valtio';

export const PunishCheaters: React.FC = () => {
	const { players, punishmentUsedThisRound } = useSnapshot(globalStore.proxy);
	const [selectedPlayers, setSelectedPlayers] = React.useState<Set<string>>(new Set());
	const [showModal, setShowModal] = React.useState(false);

	// Only show players who bet and didn't fold
	const playerEntries = Object.entries(players).filter(
		([, player]) => !player.folded && player.bet > 0
	);

	const togglePlayer = (playerId: string) => {
		const newSet = new Set(selectedPlayers);
		if (newSet.has(playerId)) {
			newSet.delete(playerId);
		} else {
			newSet.add(playerId);
		}
		setSelectedPlayers(newSet);
	};

	const handleConfirm = async () => {
		await globalActions.punishCheaters(Array.from(selectedPlayers));
		setShowModal(false);
		setSelectedPlayers(new Set());
	};

	if (punishmentUsedThisRound) {
		return (
			<div className="rounded-lg border-2 border-gray-400 bg-gray-100 p-4 text-center">
				<p className="text-sm text-gray-600">Punishment already used this round</p>
			</div>
		);
	}

	return (
		<>
			<button
				onClick={() => setShowModal(true)}
				type="button"
				className="w-full rounded-lg bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700"
			>
				Punish Cheaters
			</button>

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
						<h3 className="mb-4 text-center text-xl font-bold">
							Select Players to Accuse
						</h3>

						<div className="mb-4 max-h-96 space-y-2 overflow-y-auto">
							{playerEntries.map(([playerId, player]) => (
								<button
									key={playerId}
									onClick={() => togglePlayer(playerId)}
									type="button"
									className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
										selectedPlayers.has(playerId)
											? 'border-red-600 bg-red-50'
											: 'border-gray-300 bg-white hover:bg-gray-50'
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="font-bold">{player.name}</span>
										{selectedPlayers.has(playerId) && (
											<span className="text-red-600">✓</span>
										)}
									</div>
								</button>
							))}
						</div>

						<div className="flex gap-2">
							<button
								onClick={() => {
									setShowModal(false);
									setSelectedPlayers(new Set());
								}}
								type="button"
								className="flex-1 rounded-lg bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-700"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirm}
								disabled={selectedPlayers.size === 0}
								type="button"
								className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Confirm ({selectedPlayers.size})
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
