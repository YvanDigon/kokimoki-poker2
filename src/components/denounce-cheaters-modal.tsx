import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore, type PlayerData } from '@/state/stores/global-store';
import * as React from 'react';
import { useSnapshot } from 'valtio';

interface DenounceCheaterModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const DenounceCheaterModal: React.FC<DenounceCheaterModalProps> = ({
	isOpen,
	onClose
}) => {
	const { players, winners } = useSnapshot(globalStore.proxy);
	const [selectedPlayerIds, setSelectedPlayerIds] = React.useState<string[]>([]);

	// Get list of players who bet and didn't fold (excluding current player and eliminated players)
	const eligiblePlayers = React.useMemo(() => {
		return Object.entries(players).filter(
			([playerId, player]: [string, PlayerData]) =>
				playerId !== kmClient.id && // Exclude self
				!player.folded && // Exclude folded players
				player.bet > 0 && // Only players who bet
				player.gold > 0 // Exclude eliminated players
		);
	}, [players]);

	const handleTogglePlayer = (playerId: string) => {
		setSelectedPlayerIds((prev) =>
			prev.includes(playerId)
				? prev.filter((id) => id !== playerId)
				: [...prev, playerId]
		);
	};

	const handleConfirm = async () => {
		if (selectedPlayerIds.length > 0) {
			await globalActions.denounceCheaters(kmClient.id, selectedPlayerIds);
		}
		setSelectedPlayerIds([]);
		onClose();
	};

	const handleCancel = () => {
		setSelectedPlayerIds([]);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
				<h2 className="mb-2 text-center text-xl font-bold">
					{config.denounceTitle}
				</h2>
				
				<p className="mb-4 text-center text-sm text-gray-600">
					The host will manually punish suspected players.
				</p>

				{eligiblePlayers.length === 0 ? (
					<p className="mb-4 text-center text-gray-600">
						No other players to denounce.
					</p>
				) : (
					<div className="mb-6 space-y-2">
						{eligiblePlayers.map(([playerId, player]) => {
							const isSelected = selectedPlayerIds.includes(playerId);
							const isWinner = winners.includes(playerId);

							return (
								<button
									key={playerId}
									type="button"
									onClick={() => handleTogglePlayer(playerId)}
									className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
										isSelected
											? 'border-red-600 bg-red-50'
											: isWinner
												? 'border-green-600 bg-green-50 hover:bg-green-100'
												: 'border-gray-300 bg-gray-50 hover:bg-gray-100'
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="font-bold">{player.name}</span>
										<div className="flex items-center gap-2">
											{isWinner && <span className="text-green-600">👑</span>}
											{isSelected && (
												<span className="text-red-600 text-xl">✓</span>
											)}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				)}

				<div className="flex gap-3">
					<button
						type="button"
						onClick={handleCancel}
						className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-bold text-gray-700 hover:bg-gray-50"
					>
						{config.denounceCancel}
					</button>
					<button
						type="button"
						onClick={handleConfirm}
						disabled={selectedPlayerIds.length === 0}
						className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{config.denounceConfirm}
					</button>
				</div>
			</div>
		</div>
	);
};
