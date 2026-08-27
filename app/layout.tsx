import type { Metadata } from 'next';
import { archivoBlack, jetbrainsMono } from './fonts';
import { Analytics } from '@vercel/analytics/next';
import { SmoothScrollProvider } from '@/components/motion/SmoothScrollProvider';
import { SESSION_KEY, bootDebugReplay } from '@/components/boot/bootProgress';
import './globals.css';

export const metadata: Metadata = {
  title: 'M. Aidil Syazwan Hamdan — Full-Stack Developer',
  description:
    'Physical-systems and IoT engineering: vehicle and face recognition, piping calculators, safety telemetry. Kuala Lumpur.',
};

/**
 * Decides whether the boot overlay should be skipped, before the first paint.
 *
 * The overlay ships in the server HTML so it covers the page from the very
 * first frame — deciding in an effect meant the page painted first and the
 * overlay dropped in a moment later. But a returning visitor must not see it
 * flash either, and sessionStorage and matchMedia do not exist on the server.
 * This runs synchronously ahead of the overlay markup and marks the document,
 * so CSS hides it before anything is drawn. The component reaches the same
 * conclusion after hydration and unmounts it for good.
 */
const SKIP_BOOT_SCRIPT = `try{if(${
  bootDebugReplay() ? '' : `sessionStorage.getItem('${SESSION_KEY}')==='1'||`
}matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-boot-skip','1')}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${jetbrainsMono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: SKIP_BOOT_SCRIPT }} />
        {/* First focusable thing on the page. Seven full-height sections with
            a pinned zoom between them is a long way to tab through. */}
        <a href="#main" className="skipLink">
          SKIP TO CONTENT
        </a>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
        <Analytics />
      </body>
    </html>
  );
}
