import { config } from '@/config';
import { evaluateHand, type Card } from '@/utils/card-utils';
import { useKmModal } from '@kokimoki/shared';
import * as React from 'react';

const handRankings = [
	{ rank: 10, name: 'Royal Flush', example: 'A♠ K♠ Q♠ J♠ 10♠', description: 'A, K, Q, J, 10, all of the same suit' },
	{ rank: 9, name: 'Straight Flush', example: '9♥ 8♥ 7♥ 6♥ 5♥', description: 'Five cards in sequence, all of the same suit' },
	{ rank: 8, name: 'Four of a Kind', example: 'K♠ K♥ K♦ K♣ 3♠', description: 'Four cards with the same rank' },
	{ rank: 7, name: 'Full House', example: 'Q♠ Q♥ Q♦ 8♣ 8♠', description: 'Three cards of one rank and two cards of another rank' },
	{ rank: 6, name: 'Flush', example: 'J♦ 9♦ 7♦ 4♦ 2♦', description: 'Five cards of the same suit, not in sequence' },
	{ rank: 5, name: 'Straight', example: '10♠ 9♥ 8♦ 7♣ 6♠', description: 'Five cards in sequence, not all of the same suit' },
	{ rank: 4, name: 'Three of a Kind', example: '7♠ 7♥ 7♦ K♣ 3♠', description: 'Three cards with the same rank' },
	{ rank: 3, name: 'Two Pair', example: 'J♠ J♥ 5♦ 5♣ 2♠', description: 'Two cards of one rank and two cards of another rank' },
	{ rank: 2, name: 'One Pair', example: '10♠ 10♥ K♦ 8♣ 3♠', description: 'Two cards with the same rank' },
	{ rank: 1, name: 'High Card', example: 'A♠ J♥ 9♦ 6♣ 3♠', description: 'No matching cards, highest card wins' }
];

interface HandRankingsContentProps {
	currentCards?: Card[];
}

const HandRankingsContent: React.FC<HandRankingsContentProps> = ({ currentCards }) => {
	const currentHandRank = currentCards ? evaluateHand(currentCards).rank : null;

	return (
		<div className="max-h-[70vh] overflow-y-auto space-y-3 pr-2">
			{handRankings.map((hand) => {
				const isCurrentHand = currentHandRank === hand.rank;
				
				return (
					<div
						key={hand.rank}
						className={`rounded-lg p-3 border-2 ${
							isCurrentHand
								? 'bg-blue-100 border-blue-500'
								: 'bg-gray-50 border-gray-200'
						}`}
					>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-3">
								<div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
									isCurrentHand ? 'bg-blue-600' : 'bg-gray-600'
								}`}>
									{hand.rank}
								</div>
								<span className="font-bold">{hand.name}</span>
							</div>
							<span className="text-sm text-gray-600 font-mono">{hand.example}</span>
						</div>
						<p className="text-xs text-gray-600 ml-11">{hand.description}</p>
					</div>
				);
			})}
		</div>
	);
};

interface HandRankingsModalProps {
	currentCards?: Card[];
}

export const HandRankingsModal: React.FC<HandRankingsModalProps> = ({ currentCards }) => {
	const { openDialog } = useKmModal();

	const handleOpen = () => {
		openDialog({
			title: config.handRankingsTitle,
			content: <HandRankingsContent currentCards={currentCards} />
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
