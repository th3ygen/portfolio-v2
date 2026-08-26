import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Design reference bundle. `support.js` and `image-slot.js` are prototype
    // tooling shipped with the handoff — they are explicitly not ported and
    // are not part of the build, so their lint output is noise.
    "support.js",
    "image-slot.js",
    "*.dc.html",
  ]),
]);

export default eslintConfig;
