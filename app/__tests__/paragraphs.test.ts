import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Every paragraph on the site gets the box reveal, and gets it from exactly
 * one owner.
 *
 * Six of them previously carried `data-reveal`, `data-traj-el` or
 * `data-op-line` as well, each of which animates opacity — two animations
 * fighting over the same property on the same element. Scanning the source
 * rather than rendering catches a new paragraph that simply forgot to opt in,
 * which no render-based test would ever see.
 */
const COMPETING = ['data-reveal', 'data-traj-el', 'data-op-line', 'data-intro'];

/** The hero intro is revealed by the boot handoff stagger, not by scroll. */
const EXEMPT = 'components/sections/S00Hero/index.tsx';

function sources(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.tsx') && !entry.includes('__tests__'))
    .map((entry) => `${dir}/${entry}`);
}

/** Opening `<p ...>` tags, attributes included. */
function paragraphTags(source: string): string[] {
  return [...source.matchAll(/<p\s[^>]*>/g)].map((match) => match[0]);
}

const FILES = sources('components').filter((file) => paragraphTags(readFileSync(file, 'utf8')).length > 0);

describe('paragraph reveals', () => {
  it('finds the paragraphs it means to check', () => {
    const total = FILES.reduce(
      (count, file) => count + paragraphTags(readFileSync(file, 'utf8')).length,
      0,
    );
    expect(total).toBeGreaterThanOrEqual(10);
  });

  for (const file of FILES) {
    it(`${file} reveals every paragraph exactly once`, () => {
      for (const tag of paragraphTags(readFileSync(file, 'utf8'))) {
        if (file === EXEMPT) {
          expect(tag, 'hero intro belongs to the boot handoff').not.toContain('data-box-reveal');
          continue;
        }
        expect(tag).toContain('data-box-reveal');
        for (const attribute of COMPETING) {
          expect(tag, `${attribute} would animate opacity too`).not.toContain(attribute);
        }
      }
    });
  }
});
