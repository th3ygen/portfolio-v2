import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Contrast is a property of the token file, so it is asserted against the
 * token file. Reading the CSS rather than a duplicated table means a token
 * edit cannot pass by forgetting to update the test.
 */
const CSS = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

function token(name: string): string {
  const match = CSS.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match?.[1]) throw new Error(`--color-${name} not found in globals.css`);
  return match[1];
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('colour tokens', () => {
  const bg = token('bg');

  // Tones that carry real text. textFaint and textGhost are deliberately
  // absent: they are hairline rules and the oversized ghost numerals, all
  // aria-hidden, and holding them to a text threshold would be meaningless.
  it.each(['textPrimary', 'textSecondary', 'textMuted', 'textDim', 'accent'])(
    '%s meets WCAG AA against the page background',
    (name) => {
      expect(ratio(token(name), bg)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('keeps the dim tone visibly below the muted tone', () => {
    // AA on this background lands just under textMuted, so the two tiers sit
    // close together by necessity. This guards against them collapsing into
    // the same value and flattening the ramp entirely.
    expect(luminance(token('textDim'))).toBeLessThan(luminance(token('textMuted')));
  });
});
