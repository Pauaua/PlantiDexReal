import { useEffect } from 'react';

import { authRepository } from '../services/authRepository';
import { useSessionStore } from '../store/sessionStore';

/**
 * Bootstraps the auth session once and keeps it in sync with Supabase Auth
 * state changes (sign in, sign out, token refresh). Call once, near the app root.
 */
export function useAuthSessionListener(): void {
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    let isMounted = true;

    authRepository
      .getSession()
      .then((session) => {
        if (isMounted) setSession(session);
      })
      .catch(() => {
        if (isMounted) setSession(null);
      });

    const unsubscribe = authRepository.onAuthStateChange((session) => {
      if (isMounted) setSession(session);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setSession]);
}
