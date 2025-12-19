import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { globalActions } from '@/state/actions/global-actions';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore, type PlayerData } from '@/state/stores/global-store';
import * as React from 'react';
import { useSnapshot } from 'valtio';

interface MugSelectorProps {
	isOpen: boolean;
	onClose: () => void;
}

export const MugSelector: React.FC<MugSelectorProps> = ({ isOpen, onClose }) => {
	const { players } = useSnapshot(globalStore.proxy);
	const myPlayer = players[kmClient.id];

	if (!isOpen || !myPlayer) return null;

	// Get list of players who can be mugged (have enough gold, not self, haven't mugged yet)
	const eligibleVictims = Object.entries(players).filter(([id, player]: [string, PlayerData]) => {
		return (
			id !== kmClient.id &&
			player.gold >= myPlayer.bet &&
			!myPlayer.hasMugged
		);
	});

	const handleMug = async (victimId: string) => {
		console.log('[MugSelector] Executing mug on victim:', victimId);
		await globalActions.executeMug(kmClient.id, victimId);
		await playerActions.resetMugTaps(); // Reset tap count after mugging
		onClose();
	};

	const handleCancel = async () => {
		console.log('[MugSelector] Cancelled');
		await playerActions.resetMugTaps();
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-lg border-2 border-red-600 bg-white p-6 shadow-xl">
				<h2 className="mb-4 text-center text-2xl font-bold text-red-600">
					{config.mugSelectorTitle}
				</h2>
				
				<p className="mb-4 text-center text-sm text-gray-600">
					{config.mugSelectorDescription.replace('{amount}', myPlayer.bet.toString())}
				</p>

				{eligibleVictims.length === 0 ? (
					<p className="mb-4 text-center text-gray-500">
						{config.mugNoEligiblePlayers.replace('{amount}', myPlayer.bet.toString())}
					</p>
				) : (
					<div className="mb-4 space-y-2">
						{eligibleVictims.map(([id, player]) => (
							<button
								key={id}
								onClick={() => handleMug(id)}
								type="button"
								className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 p-3 font-semibold text-gray-800 hover:border-red-600 hover:bg-red-50"
							>
								{player.name} ({player.gold} gold)
							</button>
						))}
					</div>
				)}

				<button
					onClick={handleCancel}
					type="button"
					className="w-full rounded-lg bg-gray-400 px-4 py-2 font-semibold text-white hover:bg-gray-500"
				>
					{config.mugCancelButton}
				</button>
			</div>
		</div>
	);
};
