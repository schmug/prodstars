import { describe, it, expect } from 'vitest';
import { gt, gte, lt, lte } from '../../src/operators/numeric.js';

// ---------------------------------------------------------------------------
// gt operator
// ---------------------------------------------------------------------------

describe('gt operator', () => {
  it('returns true when actual is greater than expected', () => {
    expect(gt('10', '5')).toBe(true);
    expect(gt('100', '99')).toBe(true);
  });

  it('returns false when actual equals expected', () => {
    expect(gt('10', '10')).toBe(false);
    expect(gt('0', '0')).toBe(false);
  });

  it('returns false when actual is less than expected', () => {
    expect(gt('5', '10')).toBe(false);
    expect(gt('0', '1')).toBe(false);
  });

  it('handles negative numbers', () => {
    expect(gt('-1', '-5')).toBe(true);
    expect(gt('-5', '-1')).toBe(false);
    expect(gt('0', '-1')).toBe(true);
    expect(gt('-1', '0')).toBe(false);
  });

  it('handles decimal numbers', () => {
    expect(gt('3.14', '3.13')).toBe(true);
    expect(gt('3.14', '3.14')).toBe(false);
    expect(gt('3.13', '3.14')).toBe(false);
    expect(gt('0.1', '0.01')).toBe(true);
  });

  it('returns false for non-numeric actual', () => {
    expect(gt('abc', '10')).toBe(false);
    expect(gt('ten', '5')).toBe(false);
  });

  it('returns false for non-numeric expected', () => {
    expect(gt('10', 'abc')).toBe(false);
    expect(gt('10', 'five')).toBe(false);
  });

  it('returns false for undefined actual', () => {
    expect(gt(undefined, '10')).toBe(false);
  });

  it('returns false for null actual', () => {
    expect(gt(null, '10')).toBe(false);
  });

  it('returns false for empty string actual', () => {
    expect(gt('', '10')).toBe(false);
  });

  it('handles very large numbers', () => {
    expect(gt('1000000', '999999')).toBe(true);
    expect(gt('999999', '1000000')).toBe(false);
  });

  it('handles zero correctly', () => {
    expect(gt('1', '0')).toBe(true);
    expect(gt('0', '1')).toBe(false);
    expect(gt('0', '0')).toBe(false);
  });

  it('handles Infinity as non-finite (returns false)', () => {
    expect(gt('Infinity', '10')).toBe(false);
    expect(gt('10', 'Infinity')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// gte operator
// ---------------------------------------------------------------------------

describe('gte operator', () => {
  it('returns true when actual is greater than expected', () => {
    expect(gte('10', '5')).toBe(true);
    expect(gte('100', '99')).toBe(true);
  });

  it('returns true when actual equals expected', () => {
    expect(gte('10', '10')).toBe(true);
    expect(gte('0', '0')).toBe(true);
  });

  it('returns false when actual is less than expected', () => {
    expect(gte('5', '10')).toBe(false);
    expect(gte('0', '1')).toBe(false);
  });

  it('handles negative numbers', () => {
    expect(gte('-1', '-5')).toBe(true);
    expect(gte('-5', '-5')).toBe(true);
    expect(gte('-5', '-1')).toBe(false);
    expect(gte('0', '-1')).toBe(true);
  });

  it('handles decimal numbers', () => {
    expect(gte('3.14', '3.13')).toBe(true);
    expect(gte('3.14', '3.14')).toBe(true);
    expect(gte('3.13', '3.14')).toBe(false);
  });

  it('returns false for non-numeric actual', () => {
    expect(gte('abc', '10')).toBe(false);
  });

  it('returns false for non-numeric expected', () => {
    expect(gte('10', 'abc')).toBe(false);
  });

  it('returns false for undefined actual', () => {
    expect(gte(undefined, '10')).toBe(false);
  });

  it('returns false for null actual', () => {
    expect(gte(null, '10')).toBe(false);
  });

  it('returns false for empty string actual', () => {
    expect(gte('', '10')).toBe(false);
  });

  it('handles Infinity as non-finite (returns false)', () => {
    expect(gte('Infinity', '10')).toBe(false);
    expect(gte('10', 'Infinity')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// lt operator
// ---------------------------------------------------------------------------

describe('lt operator', () => {
  it('returns true when actual is less than expected', () => {
    expect(lt('5', '10')).toBe(true);
    expect(lt('99', '100')).toBe(true);
  });

  it('returns false when actual equals expected', () => {
    expect(lt('10', '10')).toBe(false);
    expect(lt('0', '0')).toBe(false);
  });

  it('returns false when actual is greater than expected', () => {
    expect(lt('10', '5')).toBe(false);
    expect(lt('1', '0')).toBe(false);
  });

  it('handles negative numbers', () => {
    expect(lt('-5', '-1')).toBe(true);
    expect(lt('-1', '-5')).toBe(false);
    expect(lt('-1', '0')).toBe(true);
    expect(lt('0', '-1')).toBe(false);
  });

  it('handles decimal numbers', () => {
    expect(lt('3.13', '3.14')).toBe(true);
    expect(lt('3.14', '3.14')).toBe(false);
    expect(lt('3.14', '3.13')).toBe(false);
    expect(lt('0.01', '0.1')).toBe(true);
  });

  it('returns false for non-numeric actual', () => {
    expect(lt('abc', '10')).toBe(false);
  });

  it('returns false for non-numeric expected', () => {
    expect(lt('10', 'abc')).toBe(false);
  });

  it('returns false for undefined actual', () => {
    expect(lt(undefined, '10')).toBe(false);
  });

  it('returns false for null actual', () => {
    expect(lt(null, '10')).toBe(false);
  });

  it('returns false for empty string actual', () => {
    expect(lt('', '10')).toBe(false);
  });

  it('handles Infinity as non-finite (returns false)', () => {
    expect(lt('Infinity', '10')).toBe(false);
    expect(lt('10', 'Infinity')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// lte operator
// ---------------------------------------------------------------------------

describe('lte operator', () => {
  it('returns true when actual is less than expected', () => {
    expect(lte('5', '10')).toBe(true);
    expect(lte('99', '100')).toBe(true);
  });

  it('returns true when actual equals expected', () => {
    expect(lte('10', '10')).toBe(true);
    expect(lte('0', '0')).toBe(true);
  });

  it('returns false when actual is greater than expected', () => {
    expect(lte('10', '5')).toBe(false);
    expect(lte('1', '0')).toBe(false);
  });

  it('handles negative numbers', () => {
    expect(lte('-5', '-1')).toBe(true);
    expect(lte('-5', '-5')).toBe(true);
    expect(lte('-1', '-5')).toBe(false);
    expect(lte('-1', '0')).toBe(true);
  });

  it('handles decimal numbers', () => {
    expect(lte('3.13', '3.14')).toBe(true);
    expect(lte('3.14', '3.14')).toBe(true);
    expect(lte('3.14', '3.13')).toBe(false);
  });

  it('returns false for non-numeric actual', () => {
    expect(lte('abc', '10')).toBe(false);
  });

  it('returns false for non-numeric expected', () => {
    expect(lte('10', 'abc')).toBe(false);
  });

  it('returns false for undefined actual', () => {
    expect(lte(undefined, '10')).toBe(false);
  });

  it('returns false for null actual', () => {
    expect(lte(null, '10')).toBe(false);
  });

  it('returns false for empty string actual', () => {
    expect(lte('', '10')).toBe(false);
  });

  it('handles Infinity as non-finite (returns false)', () => {
    expect(lte('Infinity', '10')).toBe(false);
    expect(lte('10', 'Infinity')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Operator relationship invariants
// ---------------------------------------------------------------------------

describe('numeric operator invariants', () => {
  const testPairs: [string, string][] = [
    ['1', '2'],
    ['2', '1'],
    ['5', '5'],
    ['0', '0'],
    ['-3', '3'],
    ['3', '-3'],
    ['10.5', '10.4'],
    ['10.4', '10.5'],
    ['100', '100'],
  ];

  for (const [a, b] of testPairs) {
    it(`gt("${a}", "${b}") is the inverse of lte("${a}", "${b}")`, () => {
      expect(gt(a, b)).toBe(!lte(a, b));
    });

    it(`lt("${a}", "${b}") is the inverse of gte("${a}", "${b}")`, () => {
      expect(lt(a, b)).toBe(!gte(a, b));
    });

    it(`exactly one of gt/eq/lt holds for ("${a}", "${b}")`, () => {
      const isGt = gt(a, b);
      const isLt = lt(a, b);
      const isEq = !isGt && !isLt; // a equals b
      // Exactly one must be true
      const trueCount = [isGt, isLt, isEq].filter(Boolean).length;
      expect(trueCount).toBe(1);
    });
  }

  it('all operators return false for non-numeric inputs', () => {
    expect(gt('abc', '10')).toBe(false);
    expect(gte('abc', '10')).toBe(false);
    expect(lt('abc', '10')).toBe(false);
    expect(lte('abc', '10')).toBe(false);

    expect(gt(undefined, '10')).toBe(false);
    expect(gte(undefined, '10')).toBe(false);
    expect(lt(undefined, '10')).toBe(false);
    expect(lte(undefined, '10')).toBe(false);

    expect(gt(null, '10')).toBe(false);
    expect(gte(null, '10')).toBe(false);
    expect(lt(null, '10')).toBe(false);
    expect(lte(null, '10')).toBe(false);
  });
});
