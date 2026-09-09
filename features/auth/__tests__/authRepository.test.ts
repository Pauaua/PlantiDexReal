import { supabase } from '@lib/supabase';

import { authRepository } from '../services/authRepository';

jest.mock('@lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const mockedAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;

describe('authRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('signs in and returns the session', async () => {
    const session = { access_token: 'abc' };
    mockedAuth.signInWithPassword.mockResolvedValue({
      data: { session, user: null },
      error: null,
    } as never);

    const result = await authRepository.signIn({ email: 'a@a.com', password: '123456' });

    expect(result).toBe(session);
    expect(mockedAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@a.com',
      password: '123456',
    });
  });

  it('throws when sign in fails', async () => {
    mockedAuth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: new Error('bad credentials'),
    } as never);

    await expect(authRepository.signIn({ email: 'a@a.com', password: 'wrong' })).rejects.toThrow(
      'bad credentials',
    );
  });

  it('signs up with the display name in user metadata', async () => {
    const session = { access_token: 'xyz' };
    mockedAuth.signUp.mockResolvedValue({
      data: { session, user: null },
      error: null,
    } as never);

    await authRepository.signUp({
      email: 'new@a.com',
      password: '123456',
      displayName: 'Ana',
    });

    expect(mockedAuth.signUp).toHaveBeenCalledWith({
      email: 'new@a.com',
      password: '123456',
      options: { data: { display_name: 'Ana' } },
    });
  });

  it('signs out and propagates errors', async () => {
    mockedAuth.signOut.mockResolvedValue({ error: new Error('network down') } as never);

    await expect(authRepository.signOut()).rejects.toThrow('network down');
  });

  it('unsubscribes from auth state changes', () => {
    const unsubscribe = jest.fn();
    mockedAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    } as never);

    const dispose = authRepository.onAuthStateChange(() => {});
    dispose();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
