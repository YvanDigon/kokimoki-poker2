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
import { ComebackModeView } from '@/views/comeback-mode-view';
import { ConnectionsView } from '@/views/connections-view';
import { CreateProfileView } from '@/views/create-profile-view';
import { GameEndedView } from '@/views/game-ended-view';
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
		// Update view based on game phase and player state
		if (started) {
			const myPlayer = players[kmClient.id];
			
			// If player is in comeback mode, always show comeback view
			if (myPlayer?.inComebackMode) {
				playerActions.setCurrentView('comeback');
				return;
			}
			
			// Otherwise route based on phase
			if (phase === 'betting') {
				playerActions.setCurrentView('betting');
			} else if (phase === 'results') {
				playerActions.setCurrentView('results');
			} else if (phase === 'ended') {
				playerActions.setCurrentView('ended');
			}
		} else {
			playerActions.setCurrentView('lobby');
		}
	}, [started, phase, players]);

	React.useEffect(() => {
		// If player has been removed from global players list, clear local name
		if (name && !players[kmClient.id]) {
			playerActions.clearPlayerName();
		}
	}, [players, name]);

	if (!name) {
		return (
			<PlayerLayout.Root>
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
				<PlayerLayout.Main>
					{currentView === 'betting' && <BettingPhaseView />}
					{currentView === 'results' && <ResultsView />}
					{currentView === 'comeback' && <ComebackModeView />}
					{currentView === 'ended' && <GameEndedView />}
				</PlayerLayout.Main>

				<PlayerLayout.Footer>
					<NameLabel name={name} />
				</PlayerLayout.Footer>
			</PlayerLayout.Root>
		</KmModalProvider>
	);
};

export default App;
