// ProdStars v1.0 — Equality Operators (P2-T01)
// Spec reference: PRODSTARS-SPEC.md §3.5

/**
 * Evaluate the `eq` operator — checks if actual equals expected.
 *
 * Both values are compared as strings. Comparison is case-sensitive
 * and uses strict string equality.
 */
export function eq(actual: string | undefined | null, expected: string): boolean {
  if (actual === undefined || actual === null) {
    return false;
  }
  return String(actual) === String(expected);
}

/**
 * Evaluate the `neq` operator — checks if actual does NOT equal expected.
 *
 * Both values are compared as strings. Comparison is case-sensitive
 * and uses strict string inequality.
 */
export function neq(actual: string | undefined | null, expected: string): boolean {
  if (actual === undefined || actual === null) {
    // A missing value is not equal to any expected value, so neq returns true.
    return true;
  }
  return String(actual) !== String(expected);
}
