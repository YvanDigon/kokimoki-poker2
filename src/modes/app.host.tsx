import { HostControls } from '@/components/host-controls';
import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { generateLink } from '@/kit/generate-link';
import { HostPresenterLayout } from '@/layouts/host-presenter';
import { kmClient } from '@/services/km-client';
import { globalStore } from '@/state/stores/global-store';
import { ConnectionsView } from '@/views/connections-view';
import { KmQrCode } from '@kokimoki/shared';
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { useSnapshot } from 'valtio';

const App: React.FC = () => {
	useGlobalController();
	const { title } = config;
	const { started } = useSnapshot(globalStore.proxy);
	const [showInstructions, setShowInstructions] = React.useState(false);
	useDocumentTitle(title);

	if (kmClient.clientContext.mode !== 'host') {
		throw new Error('App host rendered in non-host mode');
	}

	const playerLink = generateLink(kmClient.clientContext.playerCode, {
		mode: 'player'
	});

	const presenterLink = generateLink(kmClient.clientContext.presenterCode, {
		mode: 'presenter',
		playerCode: kmClient.clientContext.playerCode
	});

	return (
		<HostPresenterLayout.Root>
			<HostPresenterLayout.Header>
				<div className="text-sm opacity-70">{config.hostLabel}</div>
			</HostPresenterLayout.Header>

			<HostPresenterLayout.Main>
				{!started ? (
					<div className="rounded-lg border border-gray-200 bg-white shadow-md">
						<div className="flex gap-8 p-6">
							<div className="flex-shrink-0">
								<h2 className="mb-4 text-xl font-bold">{config.gameLinksTitle}</h2>
								<KmQrCode data={playerLink} size={200} interactive={false} />
								<div className="mt-4 flex gap-2 text-sm">
									<a
										href={playerLink}
										target="_blank"
										rel="noreferrer"
										className="break-all text-blue-600 underline hover:text-blue-700"
									>
										{config.playerLinkLabel}
									</a>
									|
									<a
										href={presenterLink}
										target="_blank"
										rel="noreferrer"
										className="break-all text-blue-600 underline hover:text-blue-700"
									>
										{config.presenterLinkLabel}
									</a>
								</div>
							</div>

							<div className="flex-1 prose max-w-none">
								<ReactMarkdown>{config.hostInstructionsMd}</ReactMarkdown>
							</div>
						</div>
					</div>
				) : (
					<button
						onClick={() => setShowInstructions(!showInstructions)}
						className="mb-6 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						{config.hostInstructionsButton}
					</button>
				)}

				{showInstructions && started && (
					<div className="rounded-lg border border-gray-200 bg-white shadow-md p-6 mb-6">
						<button
							onClick={() => setShowInstructions(false)}
							className="mb-4 text-gray-500 hover:text-gray-700"
						>
							✕
						</button>
						<div className="prose max-w-none">
							<ReactMarkdown>{config.hostInstructionsMd}</ReactMarkdown>
						</div>
					</div>
				)}

				<HostControls />

				<ConnectionsView />
			</HostPresenterLayout.Main>
		</HostPresenterLayout.Root>
	);
};

export default App;
