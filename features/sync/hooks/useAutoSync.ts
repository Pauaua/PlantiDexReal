import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useSession } from '@features/auth/hooks/useSession';
import * as Network from 'expo-network';

import { syncEngine } from '../syncEngineInstance';

/**
 * Drains the pending sync queue whenever there's a plausible reason new
 * connectivity is available: on mount, when the app returns to foreground,
 * and when the device regains network. Requires a session, since every
 * write is scoped to the current author via Supabase RLS.
 */
export function useAutoSync(): void {
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;

    const run = () => {
      syncEngine.processPending().catch(() => {
        // Failures are already recorded per-item in the queue; nothing else to do here.
      });
    };

    run();

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });

    const networkSubscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected) run();
    });

    return () => {
      appStateSubscription.remove();
      networkSubscription.remove();
    };
  }, [session]);
}
