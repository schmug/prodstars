// ProdStars v1.0 — Star Label Mapping (§4.4)
// Maps star rating ranges to human-readable labels.

import type { RatingLabel } from '../types.js';

/**
 * Rating thresholds ordered from highest to lowest.
 * Each entry defines the minimum star rating (inclusive) for the label.
 */
const RATING_THRESHOLDS: ReadonlyArray<{ min: number; label: RatingLabel }> = [
  { min: 4.5, label: 'Exceptional' },
  { min: 4.0, label: 'Strong' },
  { min: 3.5, label: 'Solid' },
  { min: 3.0, label: 'Acceptable' },
  { min: 2.5, label: 'Needs Work' },
  { min: 2.0, label: 'Poor' },
  { min: 1.5, label: 'Critical Issues' },
  { min: 1.0, label: 'Failing' },
  { min: 0.0, label: 'Not Ready' },
];

/**
 * Returns the human-readable label for a given star rating.
 *
 * Rating ranges per spec §4.4:
 *   4.5–5.0  Exceptional
 *   4.0–4.4  Strong
 *   3.5–3.9  Solid
 *   3.0–3.4  Acceptable
 *   2.5–2.9  Needs Work
 *   2.0–2.4  Poor
 *   1.5–1.9  Critical Issues
 *   1.0–1.4  Failing
 *   0.0–0.9  Not Ready
 *
 * @param stars - Star rating from 0.0 to 5.0
 * @returns The corresponding RatingLabel
 * @throws {RangeError} If stars is outside 0.0–5.0
 */
export function getRatingLabel(stars: number): RatingLabel {
  if (stars < 0 || stars > 5.0) {
    throw new RangeError(
      `Star rating must be between 0.0 and 5.0, got ${stars}`,
    );
  }

  for (const threshold of RATING_THRESHOLDS) {
    if (stars >= threshold.min) {
      return threshold.label;
    }
  }

  // Unreachable given the thresholds start at 0.0, but satisfies the compiler.
  return 'Not Ready';
}

/**
 * All valid rating labels in descending order (best to worst).
 */
export const ALL_RATING_LABELS: readonly RatingLabel[] = RATING_THRESHOLDS.map(
  (t) => t.label,
);
