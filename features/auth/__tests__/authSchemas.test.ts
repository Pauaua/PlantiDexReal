import { loginSchema, registerSchema } from '../schemas/authSchemas';

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'a@a.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects a short password', () => {
    const result = loginSchema.safeParse({ email: 'a@a.com', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const base = {
    displayName: 'Ana',
    email: 'a@a.com',
    password: '123456',
    confirmPassword: '123456',
  };

  it('accepts matching passwords', () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...base, confirmPassword: '654321' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });

  it('rejects a missing display name', () => {
    const result = registerSchema.safeParse({ ...base, displayName: '' });
    expect(result.success).toBe(false);
  });
});
