import { globalActions } from '@/state/actions/global-actions';
import { playerActions } from '@/state/actions/player-actions';
import { kmClient } from '@/services/km-client';
import { playerStore } from '@/state/stores/player-store';
import type { Rank, Suit } from '@/utils/card-utils';
import * as React from 'react';

interface CheatRankSelectorProps {
	cardIndex: number;
	onCancel: () => void;
}

export const CheatRankSelector: React.FC<CheatRankSelectorProps> = ({
	cardIndex,
	onCancel
}) => {
	const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	const suits: { value: Suit; symbol: string; color: string }[] = [
		{ value: 'hearts', symbol: '♥', color: 'text-red-600' },
		{ value: 'diamonds', symbol: '♦', color: 'text-red-600' },
		{ value: 'clubs', symbol: '♣', color: 'text-black' },
		{ value: 'spades', symbol: '♠', color: 'text-black' }
	];

	const handleSelectRank = async (rank: Rank) => {
		const botched = await globalActions.cheatCard(kmClient.id, cardIndex, rank, undefined);
		console.log('[CheatRankSelector] Botched result:', botched);
		if (botched) {
			console.log('[CheatRankSelector] Setting botchedCheating to true');
			await kmClient.transact([playerStore], ([state]) => {
				state.botchedCheating = true;
			});
		}
		await playerActions.resetTaps();
	};

	const handleSelectSuit = async (suit: Suit) => {
		await globalActions.cheatCard(kmClient.id, cardIndex, undefined, suit);
		await playerActions.resetTaps();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
				<h3 className="mb-4 text-center text-xl font-bold">Select Card</h3>

				<div className="mb-6">
					<p className="mb-2 text-center text-sm font-semibold text-gray-700">
						Choose Rank (random suit):
					</p>
					<div className="grid grid-cols-5 gap-2">
						{ranks.map((rank) => (
							<button
								key={rank}
								onClick={() => handleSelectRank(rank)}
								type="button"
								className="rounded-lg border-2 border-gray-300 bg-white p-3 text-lg font-bold hover:border-blue-500 hover:bg-blue-50"
							>
								{rank}
							</button>
						))}
					</div>
				</div>

				<div className="mb-6">
					<p className="mb-2 text-center text-sm font-semibold text-gray-700">
						Or choose Suit (random rank):
					</p>
					<div className="grid grid-cols-4 gap-2">
						{suits.map((suit) => (
							<button
								key={suit.value}
								onClick={() => handleSelectSuit(suit.value)}
								type="button"
								className={`rounded-lg border-2 border-gray-300 bg-white p-3 text-3xl font-bold hover:border-blue-500 hover:bg-blue-50 ${suit.color}`}
							>
								{suit.symbol}
							</button>
						))}
					</div>
				</div>

				<button
					onClick={onCancel}
					type="button"
					className="w-full rounded-lg bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-700"
				>
					Cancel
				</button>
			</div>
		</div>
	);
};
