import localFont from 'next/font/local';

/**
 * display: 'block' rather than 'swap'. The boot overlay paints a counter at
 * clamp(72px, 15vw, 200px) in Archivo Black within the first frames — a
 * fallback face reflowing at that size is far more visible than a brief
 * invisible period.
 */
export const archivoBlack = localFont({
  src: [{ path: '../public/fonts/ArchivoBlack-Regular.woff2', weight: '400', style: 'normal' }],
  variable: '--font-display',
  display: 'block',
  fallback: ['Impact', 'Haettenschweiler', 'sans-serif'],
});

/**
 * JetBrains Mono ships from Google as a single variable file covering the
 * whole 300–800 range the design uses, so one face declaration covers every
 * weight rather than five near-identical static files.
 */
export const jetbrainsMono = localFont({
  src: [{ path: '../public/fonts/JetBrainsMono-Variable.woff2', weight: '300 800', style: 'normal' }],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
});
