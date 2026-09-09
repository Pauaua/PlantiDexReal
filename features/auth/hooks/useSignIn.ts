import { useMutation } from '@tanstack/react-query';

import { authRepository, type SignInInput } from '../services/authRepository';
import { useSessionStore } from '../store/sessionStore';

export function useSignIn() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (input: SignInInput) => authRepository.signIn(input),
    onSuccess: (session) => setSession(session),
  });
}
