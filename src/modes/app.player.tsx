import { PlayerMenu } from '@/components/player/menu';
import { NameLabel } from '@/components/player/name-label';
import { config } from '@/config';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useGlobalController } from '@/hooks/useGlobalController';
import { PlayerLayout } from '@/layouts/player';
import { kmClient } from '@/services/km-client';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import { BettingPhaseView } from '@/views/betting-phase-view';
import { ConnectionsView } from '@/views/connections-view';
import { CreateProfileView } from '@/views/create-profile-view';
import { GameLobbyView } from '@/views/game-lobby-view';
import { ResultsView } from '@/views/results-view';
import { KmModalProvider } from '@kokimoki/shared';
import * as React from 'react';
import { useSnapshot } from 'valtio';

const App: React.FC = () => {
	const { title } = config;
	const { name, currentView } = useSnapshot(playerStore.proxy);
	const { started, phase, players } = useSnapshot(globalStore.proxy);

	useGlobalController();
	useDocumentTitle(title);

	React.useEffect(() => {
		// Update view based on game phase
		if (started) {
			if (phase === 'betting') {
				playerActions.setCurrentView('betting');
			} else if (phase === 'results' || phase === 'ended') {
				playerActions.setCurrentView('results');
			}
		} else {
			playerActions.setCurrentView('lobby');
		}
	}, [started, phase]);

	React.useEffect(() => {
		// If player has been removed from global players list, clear local name
		if (name && !players[kmClient.id]) {
			playerActions.clearPlayerName();
		}
	}, [players, name]);

	if (!name) {
		return (
			<PlayerLayout.Root>
				<PlayerLayout.Header />
				<PlayerLayout.Main>
					<CreateProfileView />
				</PlayerLayout.Main>
			</PlayerLayout.Root>
		);
	}

	if (!started) {
		return (
			<KmModalProvider>
				<PlayerLayout.Root>
					<PlayerLayout.Header>
						<PlayerMenu />
					</PlayerLayout.Header>

					<PlayerLayout.Main>
						{currentView === 'lobby' && <GameLobbyView />}
						{currentView === 'connections' && <ConnectionsView />}
					</PlayerLayout.Main>

					<PlayerLayout.Footer>
						<NameLabel name={name} />
					</PlayerLayout.Footer>
				</PlayerLayout.Root>
			</KmModalProvider>
		);
	}

	return (
		<KmModalProvider>
			<PlayerLayout.Root>
				<PlayerLayout.Header />

				<PlayerLayout.Main>
					{currentView === 'betting' && <BettingPhaseView />}
					{currentView === 'results' && <ResultsView />}
				</PlayerLayout.Main>

				<PlayerLayout.Footer>
					<NameLabel name={name} />
				</PlayerLayout.Footer>
			</PlayerLayout.Root>
		</KmModalProvider>
	);
};

export default App;
