import { config } from '@/config';
import { evaluateHand, type Card } from '@/utils/card-utils';
import { useKmModal } from '@kokimoki/shared';
import * as React from 'react';

const handRankings = [
	{ rank: 10, name: config.handNameRoyalFlush, example: config.handExampleRoyalFlush, description: config.handDescRoyalFlush },
	{ rank: 9, name: config.handNameStraightFlush, example: config.handExampleStraightFlush, description: config.handDescStraightFlush },
	{ rank: 8, name: config.handNameFourOfAKind, example: config.handExampleFourOfAKind, description: config.handDescFourOfAKind },
	{ rank: 7, name: config.handNameFullHouse, example: config.handExampleFullHouse, description: config.handDescFullHouse },
	{ rank: 6, name: config.handNameFlush, example: config.handExampleFlush, description: config.handDescFlush },
	{ rank: 5, name: config.handNameStraight, example: config.handExampleStraight, description: config.handDescStraight },
	{ rank: 4, name: config.handNameThreeOfAKind, example: config.handExampleThreeOfAKind, description: config.handDescThreeOfAKind },
	{ rank: 3, name: config.handNameTwoPair, example: config.handExampleTwoPair, description: config.handDescTwoPair },
	{ rank: 2, name: config.handNameOnePair, example: config.handExampleOnePair, description: config.handDescOnePair },
	{ rank: 1, name: config.handNameHighCard, example: config.handExampleHighCard, description: config.handDescHighCard }
];

interface HandRankingsContentProps {
	currentCards?: Card[];
}

const HandRankingsContent: React.FC<HandRankingsContentProps> = ({ currentCards }) => {
	const currentHandRank = currentCards ? evaluateHand(currentCards).rank : null;

	return (
		<div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
			{/* Game Rules Description */}
			<div className="rounded-lg bg-blue-50 border-2 border-blue-300 p-4">
				<p className="text-sm text-gray-800">{config.gameRulesDescription}</p>
			</div>
			
			{/* Poker Hand Rankings Title */}
			<h3 className="text-lg font-bold text-center pt-2">{config.handRankingsTitle}</h3>
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
			
			{/* Important Note */}
			<div className="rounded-lg bg-red-50 border-2 border-red-300 p-4 mt-4">
				<h3 className="text-sm font-bold text-red-800 mb-2">{config.importantNoteTitle}</h3>
				<p className="text-sm text-red-700">{config.importantNoteText}</p>
			</div>
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
			title: config.rulesTitle,
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
