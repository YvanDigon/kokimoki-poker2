import { config } from '@/config';
import { useKmModal } from '@kokimoki/shared';
import * as React from 'react';

const handRankings = [
	{ rank: 10, name: 'Royal Flush', example: 'A♠ K♠ Q♠ J♠ 10♠' },
	{ rank: 9, name: 'Straight Flush', example: '9♥ 8♥ 7♥ 6♥ 5♥' },
	{ rank: 8, name: 'Four of a Kind', example: 'K♠ K♥ K♦ K♣ 3♠' },
	{ rank: 7, name: 'Full House', example: 'Q♠ Q♥ Q♦ 8♣ 8♠' },
	{ rank: 6, name: 'Flush', example: 'J♦ 9♦ 7♦ 4♦ 2♦' },
	{ rank: 5, name: 'Straight', example: '10♠ 9♥ 8♦ 7♣ 6♠' },
	{ rank: 4, name: 'Three of a Kind', example: '7♠ 7♥ 7♦ K♣ 3♠' },
	{ rank: 3, name: 'Two Pair', example: 'J♠ J♥ 5♦ 5♣ 2♠' },
	{ rank: 2, name: 'One Pair', example: '10♠ 10♥ K♦ 8♣ 3♠' },
	{ rank: 1, name: 'High Card', example: 'A♠ J♥ 9♦ 6♣ 3♠' }
];

const HandRankingsContent: React.FC = () => {
	return (
		<div className="space-y-3">
			<h2 className="text-2xl font-bold text-center mb-4">
				{config.handRankingsTitle}
			</h2>
			{handRankings.map((hand) => (
				<div
					key={hand.rank}
					className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-200"
				>
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
							{hand.rank}
						</div>
						<span className="font-bold">{hand.name}</span>
					</div>
					<span className="text-sm text-gray-600 font-mono">{hand.example}</span>
				</div>
			))}
		</div>
	);
};

export const HandRankingsModal: React.FC = () => {
	const { openDialog } = useKmModal();

	const handleOpen = () => {
		openDialog({
			title: config.handRankingsTitle,
			content: <HandRankingsContent />
		});
	};

	return (
		<button
			onClick={handleOpen}
			type="button"
			className="text-sm text-blue-600 underline hover:text-blue-700"
		>
			{config.viewHandRankings}
		</button>
	);
};
