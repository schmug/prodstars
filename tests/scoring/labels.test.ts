import { describe, it, expect } from 'vitest';
import { getRatingLabel, ALL_RATING_LABELS } from '../../src/scoring/labels.js';

describe('getRatingLabel', () => {
  // --- Exact boundary tests per spec §4.4 ---

  it('returns "Exceptional" for 5.0', () => {
    expect(getRatingLabel(5.0)).toBe('Exceptional');
  });

  it('returns "Exceptional" for 4.5', () => {
    expect(getRatingLabel(4.5)).toBe('Exceptional');
  });

  it('returns "Strong" for 4.4', () => {
    expect(getRatingLabel(4.4)).toBe('Strong');
  });

  it('returns "Strong" for 4.0', () => {
    expect(getRatingLabel(4.0)).toBe('Strong');
  });

  it('returns "Solid" for 3.9', () => {
    expect(getRatingLabel(3.9)).toBe('Solid');
  });

  it('returns "Solid" for 3.5', () => {
    expect(getRatingLabel(3.5)).toBe('Solid');
  });

  it('returns "Acceptable" for 3.4', () => {
    expect(getRatingLabel(3.4)).toBe('Acceptable');
  });

  it('returns "Acceptable" for 3.0', () => {
    expect(getRatingLabel(3.0)).toBe('Acceptable');
  });

  it('returns "Needs Work" for 2.9', () => {
    expect(getRatingLabel(2.9)).toBe('Needs Work');
  });

  it('returns "Needs Work" for 2.5', () => {
    expect(getRatingLabel(2.5)).toBe('Needs Work');
  });

  it('returns "Poor" for 2.4', () => {
    expect(getRatingLabel(2.4)).toBe('Poor');
  });

  it('returns "Poor" for 2.0', () => {
    expect(getRatingLabel(2.0)).toBe('Poor');
  });

  it('returns "Critical Issues" for 1.9', () => {
    expect(getRatingLabel(1.9)).toBe('Critical Issues');
  });

  it('returns "Critical Issues" for 1.5', () => {
    expect(getRatingLabel(1.5)).toBe('Critical Issues');
  });

  it('returns "Failing" for 1.4', () => {
    expect(getRatingLabel(1.4)).toBe('Failing');
  });

  it('returns "Failing" for 1.0', () => {
    expect(getRatingLabel(1.0)).toBe('Failing');
  });

  it('returns "Not Ready" for 0.9', () => {
    expect(getRatingLabel(0.9)).toBe('Not Ready');
  });

  it('returns "Not Ready" for 0.0', () => {
    expect(getRatingLabel(0.0)).toBe('Not Ready');
  });

  // --- Mid-range values ---

  it('returns "Exceptional" for 4.7', () => {
    expect(getRatingLabel(4.7)).toBe('Exceptional');
  });

  it('returns "Strong" for 4.2', () => {
    expect(getRatingLabel(4.2)).toBe('Strong');
  });

  it('returns "Solid" for 3.7', () => {
    expect(getRatingLabel(3.7)).toBe('Solid');
  });

  it('returns "Acceptable" for 3.2', () => {
    expect(getRatingLabel(3.2)).toBe('Acceptable');
  });

  it('returns "Needs Work" for 2.7', () => {
    expect(getRatingLabel(2.7)).toBe('Needs Work');
  });

  it('returns "Poor" for 2.2', () => {
    expect(getRatingLabel(2.2)).toBe('Poor');
  });

  it('returns "Critical Issues" for 1.7', () => {
    expect(getRatingLabel(1.7)).toBe('Critical Issues');
  });

  it('returns "Failing" for 1.2', () => {
    expect(getRatingLabel(1.2)).toBe('Failing');
  });

  it('returns "Not Ready" for 0.5', () => {
    expect(getRatingLabel(0.5)).toBe('Not Ready');
  });

  // --- Out-of-range errors ---

  it('throws RangeError for negative values', () => {
    expect(() => getRatingLabel(-0.1)).toThrow(RangeError);
    expect(() => getRatingLabel(-1)).toThrow(RangeError);
  });

  it('throws RangeError for values above 5.0', () => {
    expect(() => getRatingLabel(5.1)).toThrow(RangeError);
    expect(() => getRatingLabel(10)).toThrow(RangeError);
  });
});

describe('ALL_RATING_LABELS', () => {
  it('contains 9 labels', () => {
    expect(ALL_RATING_LABELS).toHaveLength(9);
  });

  it('is ordered from best to worst', () => {
    expect(ALL_RATING_LABELS[0]).toBe('Exceptional');
    expect(ALL_RATING_LABELS[ALL_RATING_LABELS.length - 1]).toBe('Not Ready');
  });

  it('contains all expected labels', () => {
    const expected = [
      'Exceptional',
      'Strong',
      'Solid',
      'Acceptable',
      'Needs Work',
      'Poor',
      'Critical Issues',
      'Failing',
      'Not Ready',
    ];
    expect([...ALL_RATING_LABELS]).toEqual(expected);
  });
});
