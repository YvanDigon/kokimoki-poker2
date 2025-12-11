import type { Card } from '@/state/stores/global-store';
import { getRankDisplay, getSuitSymbol } from '@/utils/card-utils';
import { cn } from '@/utils/cn';
import * as React from 'react';

interface PlayingCardProps {
	card: Card;
	selected?: boolean;
	onClick?: () => void;
	className?: string;
	faceDown?: boolean;
	compact?: boolean;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
	card,
	selected = false,
	onClick,
	className,
	faceDown = false,
	compact = false
}) => {
	const suitColor = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-black';

	if (faceDown) {
		return (
			<div
				className={cn(
					'relative flex h-28 w-20 items-center justify-center rounded-lg border-2 border-gray-400 bg-blue-900 shadow-md',
					'bg-[repeating-linear-gradient(45deg,#1e3a8a,#1e3a8a_10px,#1e40af_10px,#1e40af_20px)]',
					className
				)}
			>
				<div className={cn('font-bold text-blue-800 opacity-30', compact ? 'text-xl' : 'text-4xl')}>?</div>
			</div>
		);
	}

	return (
		<button
			onClick={onClick}
			disabled={!onClick}
			type="button"
			className={cn(
				'relative flex h-28 w-20 flex-col items-center justify-center rounded-lg border-2 bg-white p-2 shadow-md transition-all',
				selected ? 'border-yellow-400 -translate-y-2 shadow-lg' : 'border-gray-300',
				onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-1',
				!onClick && 'cursor-default',
				className
			)}
		>
			<div className={cn('text-center', suitColor)}>
				<div className={cn('font-bold', compact ? 'text-sm' : 'text-2xl')}>{getRankDisplay(card.rank)}</div>
				<div className={cn(compact ? 'text-xl' : 'text-4xl')}>{getSuitSymbol(card.suit)}</div>
			</div>
		</button>
	);
};
