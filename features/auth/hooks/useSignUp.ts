import { useMutation } from '@tanstack/react-query';

import { authRepository, type SignUpInput } from '../services/authRepository';
import { useSessionStore } from '../store/sessionStore';

export function useSignUp() {
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (input: SignUpInput) => authRepository.signUp(input),
    onSuccess: (session) => setSession(session),
  });
}
