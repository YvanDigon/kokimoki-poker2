import { kmClient } from '@/services/km-client';
import { globalStore } from '@/state/stores/global-store';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { useServerTimer } from './useServerTime';

export function useGlobalController() {
	const { controllerConnectionId } = useSnapshot(globalStore.proxy);
	const connections = useSnapshot(globalStore.connections);
	const connectionIds = connections.connectionIds;
	const isGlobalController = controllerConnectionId === kmClient.connectionId;
	const serverTime = useServerTimer(1000); // tick every second

	// Maintain connection that is assigned to be the global controller
	useEffect(() => {
		// Check if global controller is online
		if (connectionIds.has(controllerConnectionId)) {
			return;
		}

		// Select new host, sorting by connection id
		kmClient
			.transact([globalStore], ([globalState]) => {
				const connectionIdsArray = Array.from(connectionIds);
				connectionIdsArray.sort();
				globalState.controllerConnectionId = connectionIdsArray[0] || '';
			})
			.then(() => {})
			.catch(() => {});
	}, [connectionIds, controllerConnectionId]);

	// Run global controller-specific logic
	useEffect(() => {
		if (!isGlobalController) {
			return;
		}

		// Auto-end betting phase when time runs out
		const checkBettingPhase = async () => {
			const state = globalStore.proxy;
			if (state.started && state.phase === 'betting') {
				const bettingTimeElapsed = serverTime - state.bettingPhaseStartTime;
				if (bettingTimeElapsed >= 60000) { // 60 seconds
					const { globalActions } = await import('@/state/actions/global-actions');
					await globalActions.endBettingPhase();
				}
			}
		};

		checkBettingPhase();
	}, [isGlobalController, serverTime]);

	return isGlobalController;
}
