import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { generateLink } from '@/kit/generate-link';
import { HostPresenterLayout } from '@/layouts/host-presenter';
import { kmClient } from '@/services/km-client';
import { ConnectionsView } from '@/views/connections-view';
import { PresenterGameView } from '@/views/presenter-game-view';
import { globalStore } from '@/state/stores/global-store';
import { KmQrCode } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

const App: React.FC = () => {
	const { title } = config;
	const { started } = useSnapshot(globalStore.proxy);

	useGlobalController();
	useDocumentTitle(title);

	if (kmClient.clientContext.mode !== 'presenter') {
		throw new Error('App presenter rendered in non-presenter mode');
	}

	const playerLink = generateLink(kmClient.clientContext.playerCode, {
		mode: 'player'
	});

	return (
		<HostPresenterLayout.Root>
			<HostPresenterLayout.Header>
				<div className="text-sm opacity-70">{config.presenterLabel}</div>
			</HostPresenterLayout.Header>

			<HostPresenterLayout.Main>
				<div className="rounded-lg border border-gray-200 bg-white shadow-md">
				<div className="flex items-center gap-6 p-6">
					<div className="flex-shrink-0">
						<KmQrCode data={playerLink} size={200} interactive={false} />
					</div>
					<div className="flex-1">
						<h1 className="text-6xl font-bold">{config.title}</h1>
						<p className="mt-2 text-xl font-semibold text-red-600">
							⚠️ Cheating is forbidden! Get caught and face the consequences! 🎭
						</p>
					</div>
				</div>
				</div>

				{started ? <PresenterGameView /> : <ConnectionsView />}
			</HostPresenterLayout.Main>
		</HostPresenterLayout.Root>
	);
};

export default App;
