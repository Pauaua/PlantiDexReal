import { useMutation } from '@tanstack/react-query';

import { authRepository } from '../services/authRepository';
import { useSessionStore } from '../store/sessionStore';

export function useSignOut() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: () => authRepository.signOut(),
    onSuccess: () => setSession(null),
  });
}
