import type { Metadata } from 'next';
import { archivoBlack, jetbrainsMono } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'M. Aidil Syazwan Hamdan — Full-Stack Developer',
  description:
    'Physical-systems and IoT engineering: vehicle and face recognition, piping calculators, safety telemetry. Kuala Lumpur.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
