// ProdStars v1.0 — Numeric Comparison Operators (P2-T02)
// Spec reference: PRODSTARS-SPEC.md §3.5

/**
 * Parse a value as a finite number.
 * Returns NaN for undefined, null, empty strings, or non-numeric strings.
 */
function toNumber(value: string | undefined | null): number {
  if (value === undefined || value === null || value === '') {
    return NaN;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Evaluate the `gt` operator — checks if actual is greater than expected.
 *
 * Both values are parsed as numbers. Returns false if either value
 * is not a valid finite number.
 */
export function gt(actual: string | undefined | null, expected: string): boolean {
  const a = toNumber(actual);
  const b = toNumber(expected);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return false;
  }
  return a > b;
}

/**
 * Evaluate the `gte` operator — checks if actual is greater than or equal to expected.
 *
 * Both values are parsed as numbers. Returns false if either value
 * is not a valid finite number.
 */
export function gte(actual: string | undefined | null, expected: string): boolean {
  const a = toNumber(actual);
  const b = toNumber(expected);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return false;
  }
  return a >= b;
}

/**
 * Evaluate the `lt` operator — checks if actual is less than expected.
 *
 * Both values are parsed as numbers. Returns false if either value
 * is not a valid finite number.
 */
export function lt(actual: string | undefined | null, expected: string): boolean {
  const a = toNumber(actual);
  const b = toNumber(expected);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return false;
  }
  return a < b;
}

/**
 * Evaluate the `lte` operator — checks if actual is less than or equal to expected.
 *
 * Both values are parsed as numbers. Returns false if either value
 * is not a valid finite number.
 */
export function lte(actual: string | undefined | null, expected: string): boolean {
  const a = toNumber(actual);
  const b = toNumber(expected);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return false;
  }
  return a <= b;
}
