import { config } from '@/config';
import { PlayerLayout } from '@/layouts/player';
import * as React from 'react';

export const GameEndedView: React.FC = () => {
	return (
		<PlayerLayout.Root>
			<PlayerLayout.Main>
				<div className="flex w-full max-w-2xl flex-col gap-6">
					<div className="rounded-lg border-2 border-gray-400 bg-gray-50 p-8 shadow-lg text-center">
						<h2 className="mb-6 text-4xl font-bold text-gray-700">
							{config.gameEndedMessage}
						</h2>
						<p className="text-lg text-gray-600">
							{config.gameEndedDescriptionMd}
						</p>
					</div>
				</div>
			</PlayerLayout.Main>
		</PlayerLayout.Root>
	);
};
