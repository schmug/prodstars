import { describe, it, expect } from 'vitest';
import { eq, neq } from '../../src/operators/equality.js';

// ---------------------------------------------------------------------------
// eq operator
// ---------------------------------------------------------------------------

describe('eq operator', () => {
  it('returns true when strings are equal', () => {
    expect(eq('admin', 'admin')).toBe(true);
  });

  it('returns false when strings differ', () => {
    expect(eq('admin', 'root')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(eq('Admin', 'admin')).toBe(false);
    expect(eq('TRUE', 'true')).toBe(false);
  });

  it('compares empty strings correctly', () => {
    expect(eq('', '')).toBe(true);
    expect(eq('', 'something')).toBe(false);
  });

  it('handles numeric strings', () => {
    expect(eq('200', '200')).toBe(true);
    expect(eq('200', '201')).toBe(false);
    expect(eq('0', '0')).toBe(true);
  });

  it('returns false for undefined actual', () => {
    expect(eq(undefined, 'admin')).toBe(false);
  });

  it('returns false for null actual', () => {
    expect(eq(null, 'admin')).toBe(false);
  });

  it('handles whitespace differences', () => {
    expect(eq(' admin', 'admin')).toBe(false);
    expect(eq('admin ', 'admin')).toBe(false);
    expect(eq(' admin ', ' admin ')).toBe(true);
  });

  it('handles special characters', () => {
    expect(eq('p@$$w0rd!', 'p@$$w0rd!')).toBe(true);
    expect(eq('hello\nworld', 'hello\nworld')).toBe(true);
    expect(eq('hello\nworld', 'helloworld')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// neq operator
// ---------------------------------------------------------------------------

describe('neq operator', () => {
  it('returns true when strings differ', () => {
    expect(neq('admin', 'root')).toBe(true);
  });

  it('returns false when strings are equal', () => {
    expect(neq('admin', 'admin')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(neq('Admin', 'admin')).toBe(true);
    expect(neq('TRUE', 'true')).toBe(true);
  });

  it('handles empty strings', () => {
    expect(neq('', '')).toBe(false);
    expect(neq('', 'something')).toBe(true);
  });

  it('handles numeric strings', () => {
    expect(neq('200', '200')).toBe(false);
    expect(neq('200', '404')).toBe(true);
  });

  it('returns true for undefined actual (missing value is not equal)', () => {
    expect(neq(undefined, 'admin')).toBe(true);
  });

  it('returns true for null actual (missing value is not equal)', () => {
    expect(neq(null, 'admin')).toBe(true);
  });

  it('handles whitespace differences', () => {
    expect(neq(' admin', 'admin')).toBe(true);
    expect(neq('admin ', 'admin')).toBe(true);
  });

  it('handles special characters', () => {
    expect(neq('p@$$w0rd!', 'p@$$w0rd!')).toBe(false);
    expect(neq('p@$$w0rd!', 'password')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// eq and neq are logical inverses (when actual is defined)
// ---------------------------------------------------------------------------

describe('eq and neq are logical inverses', () => {
  const testPairs = [
    ['admin', 'admin'],
    ['admin', 'root'],
    ['', ''],
    ['', 'notempty'],
    ['200', '200'],
    ['200', '404'],
    ['true', 'false'],
    ['Hello World', 'Hello World'],
    ['Hello World', 'hello world'],
  ] as const;

  for (const [actual, expected] of testPairs) {
    it(`eq("${actual}", "${expected}") !== neq("${actual}", "${expected}")`, () => {
      expect(eq(actual, expected)).toBe(!neq(actual, expected));
    });
  }
});
