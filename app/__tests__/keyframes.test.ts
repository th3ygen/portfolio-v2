import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * A CSS Module hashes animation names exactly as it hashes class names, so
 * `animation: om-tick ...` inside a module compiles to a reference to
 * `Module__hash__om-tick`. If the @keyframes lives in globals.css it keeps its
 * bare name, the reference resolves to nothing, and the animation never runs —
 * silently, with no warning at build time or in the console.
 *
 * Seven animations shipped dead this way. This asserts the rule that fixed it:
 * every animation a module references is declared in that same module.
 */
const MODULES = readdirSync('components', { recursive: true, encoding: 'utf8' })
  .filter((entry) => entry.endsWith('.module.css'))
  .map((entry) => `components/${entry}`);

describe('module keyframes', () => {
  it('finds the stylesheets it means to check', () => {
    expect(MODULES.length).toBeGreaterThan(5);
  });

  for (const file of MODULES) {
    it(`${file} declares every animation it references`, () => {
      const css = readFileSync(file, 'utf8');
      const declared = new Set(
        [...css.matchAll(/@keyframes\s+([A-Za-z0-9_-]+)/g)].map((match) => match[1]),
      );
      const referenced = [...css.matchAll(/animation(?:-name)?:\s*([^;}]+)/g)]
        .flatMap((match) => (match[1] ?? '').split(/\s+/))
        .filter((token) => /^om-[a-z-]+$/.test(token));

      for (const name of referenced) {
        expect(declared, `${file} references ${name}`).toContain(name);
      }
    });
  }
});
