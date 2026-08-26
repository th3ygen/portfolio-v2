import { describe, it, expect } from 'vitest';
import { contactSchema } from '../schema';

const valid = {
  name: 'Ada',
  email: 'ada@example.com',
  message: 'Hello there, this is a real enquiry.',
};

describe('contactSchema', () => {
  it('accepts a well-formed message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a malformed email', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects an empty name', () => {
    expect(contactSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects a whitespace-only name', () => {
    expect(contactSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
  });

  it('rejects a message under 10 characters', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false);
  });

  it('rejects a message over 5000 characters', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'x'.repeat(5001) }).success).toBe(false);
  });

  it('rejects extra fields rather than passing them through', () => {
    const result = contactSchema.safeParse({ ...valid, isAdmin: true });
    if (result.success) {
      expect(result.data).not.toHaveProperty('isAdmin');
    }
  });

  it('trims what it accepts', () => {
    const result = contactSchema.safeParse({ ...valid, name: '  Ada  ' });
    expect(result.success && result.data.name).toBe('Ada');
  });

  it('rejects a missing field entirely', () => {
    expect(contactSchema.safeParse({ name: 'Ada', email: 'ada@example.com' }).success).toBe(false);
  });
});
