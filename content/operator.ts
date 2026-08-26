import type { LoadoutItem, Stat } from '@/lib/types';

export const OPERATOR = {
  name: ['Muhd Aidil', 'Syazwan'] as const,
  title: 'FULL-STACK DEVELOPER',
  since: 'EST. 2020',
  location: 'KUALA LUMPUR, MY',
  prompt: '$ whoami',
  intro:
    'I build systems that run in the real world — vehicle telemetry, prison security, factory floors, fish ponds, elephant fences. Six years of shipping software that has to keep working when nobody is watching it.',
  lead: ['Most of my work has a', 'physical consequence', 'when it breaks.'] as const,
  body: [
    'I started in 2020 as a research assistant at Universiti Malaysia Pahang, building monitoring systems for people who needed them to work on Monday. That never really changed. Since then I have shipped for Cyber Security Malaysia, a national prison, a glove manufacturer, prawn farmers, and a Singapore fintech — and founded Ascenity Solutions along the way.',
    'The work is usually the same shape: sensors or cameras produce data faster than anyone can read it, and someone needs a screen that tells them what to do about it. I do the whole path — firmware handshake to dashboard, CAN bus to Chart.js, Raspberry Pi to Vercel.',
    'Currently building a cross-platform financial app in Flutter for Arki Finance in Singapore. Still fuelled by coffee. Still convinced the CPU is doing most of the work.',
  ] as const,
} as const;

/** Identity card facts shown beside the s01 portrait. */
export const OPERATOR_CARD: readonly Stat[] = [
  { label: 'CALL SIGN', value: 'DIL' },
  { label: 'BASE', value: 'KUALA LUMPUR' },
  { label: 'TIMEZONE', value: 'GMT+8' },
  { label: 'REMOTE', value: 'YES' },
] as const;

/**
 * The s00 SYS.READOUT panel. Rows are typed by shape because the panel mixes
 * three treatments: a large display numeral, plain text, and a chip list.
 */
export type ReadoutRow =
  | { readonly kind: 'numeral'; readonly label: string; readonly value: string }
  | { readonly kind: 'text'; readonly label: string; readonly value: string }
  | { readonly kind: 'chips'; readonly label: string; readonly items: readonly string[] }
  | { readonly kind: 'status'; readonly label: string; readonly value: string };

export const READOUT: readonly ReadoutRow[] = [
  { kind: 'numeral', label: 'YRS ACTIVE', value: '06' },
  { kind: 'numeral', label: 'SYSTEMS', value: '16' },
  { kind: 'text', label: 'FULL-TIME', value: 'ARKI FINANCE, SG' },
  { kind: 'text', label: 'OWN STUDIO', value: 'ASCENITY SOLUTIONS' },
  {
    kind: 'chips',
    label: 'DOMAINS',
    items: ['SECURITY', 'INDUSTRIAL', 'IOT', 'FINTECH', 'AGRI', 'GOV'],
  },
  { kind: 'status', label: 'AVAILABILITY', value: 'OPEN' },
] as const;

export const READOUT_HEAD = { title: 'SYS.READOUT', state: 'LIVE' } as const;

/** The three hero calls to action, in order. */
export const HERO_CTAS: readonly {
  readonly label: string;
  readonly href: string;
  readonly variant: 'solid' | 'outline' | 'ghost';
}[] = [
  { label: 'OPEN UPLINK →', href: '#s06', variant: 'solid' },
  { label: 'DOWNLOAD CV', href: '/docs/cv.pdf', variant: 'outline' },
  { label: '16 SYSTEMS', href: '#s03', variant: 'ghost' },
] as const;

/**
 * The 8-item core loadout. Rendered in s01, not s02 — s02 holds the full
 * manifest. The count is the point of the redesign: it replaced a flat dump
 * of 90 skills across 9 categories.
 */
export const CORE_LOADOUT: readonly LoadoutItem[] = [
  { name: 'Next.js', detail: 'APP ROUTER · SERVER ACTIONS' },
  { name: 'TypeScript', detail: 'ZOD · STRICT' },
  { name: 'Node.js', detail: 'EXPRESS · PM2' },
  { name: 'PostgreSQL', detail: 'PRISMA ORM' },
  { name: 'MQTT / Socket.io', detail: 'REAL-TIME TRANSPORT' },
  { name: 'WebRTC', detail: 'LIVE VIDEO · INTERCOM' },
  { name: 'Flutter', detail: 'CURRENT ROLE' },
  { name: 'Tensorflow.js', detail: 'ON-DEVICE INFERENCE' },
] as const;

/** Ticker content. Rendered twice back to back so om-tick loops seamlessly. */
export const TICKER: readonly string[] = [
  'NEXT.JS', 'REACT', 'TYPESCRIPT', 'NODE.JS', 'FLUTTER', 'POSTGRESQL', 'PRISMA',
  'MQTT', 'WEBSOCKET', 'WEBRTC', 'CAN BUS', 'TENSORFLOW.JS', 'DOCKER', 'AWS',
  'NGINX', 'MAPBOX', 'BLE', 'RASPBERRY PI',
] as const;

/**
 * Social and CV destinations. The prototype renders these as bare labels with
 * no hrefs; the real URLs come from the live site at aidilsyaz.vercel.app.
 */
export const SOCIALS: readonly { readonly label: string; readonly href: string }[] = [
  { label: 'GITHUB', href: 'https://github.com/th3ygen' },
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/aidilsyaz/' },
  { label: 'X', href: 'https://x.com/aideal_syaz' },
  { label: 'STACKOVERFLOW', href: 'https://stackoverflow.com/users/10222642/aidil' },
  { label: 'DEV.TO', href: 'https://dev.to/th3ygen' },
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/aidil.syaz_/' },
] as const;

export const CV_HREF = '/docs/cv.pdf';
