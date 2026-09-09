import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface SessionState {
  session: Session | null;
  status: AuthStatus;
  setSession: (session: Session | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  status: 'idle',
  setSession: (session) => set({ session, status: session ? 'authenticated' : 'unauthenticated' }),
}));
