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

/**
 * Work photographs drifting down either side of the s01 title sequence.
 *
 * They are scenery, not content: heavily desaturated, held at low opacity and
 * never labelled, because anything legible beside the lockup competes with it.
 * Their job is to give the pinned title something to be still against.
 *
 * `py` is the scroll-parallax distance and is what carries the depth — a plate
 * that travels further reads as nearer, so `py` and `width` move together. Get
 * them out of step and the illusion inverts: a large plate creeping past a
 * small fast one looks like a mistake rather than a background.
 */
export type StagePlate = {
  readonly src: string;
  readonly side: 'left' | 'right';
  /** Down the section, as a percentage. */
  readonly top: number;
  readonly width: number;
  /** Scroll parallax distance; larger = nearer. */
  readonly py: number;
  /** Pointer parallax depth. */
  readonly px: number;
  readonly alpha: number;
};

export const STAGE_PLATES: readonly StagePlate[] = [
  // Ordered near to far. width, py, px and alpha move together on purpose: a
  // plate that is larger, travels further and sits brighter reads as closer.
  // Break that ordering and the depth inverts. There is a test on it.
  { src: '/img/projects/camkender/2-0.jpg', side: 'left', top: 6, width: 560, py: 84, px: 14, alpha: 0.3 },
  { src: '/img/projects/gajahsafe/1-0.jpg', side: 'right', top: 14, width: 520, py: 76, px: 13, alpha: 0.28 },
  { src: '/img/projects/csova/2-1.jpg', side: 'left', top: 24, width: 480, py: 68, px: 12, alpha: 0.26 },
  { src: '/img/projects/pcasso/0-0.jpg', side: 'right', top: 33, width: 450, py: 62, px: 11, alpha: 0.24 },
  { src: '/img/projects/camkender/2-1.jpg', side: 'left', top: 41, width: 420, py: 56, px: 10, alpha: 0.23 },
  { src: '/img/projects/gajahsafe/1-4.jpg', side: 'right', top: 49, width: 400, py: 50, px: 9, alpha: 0.22 },
  { src: '/img/projects/justgood/1-2.jpg', side: 'left', top: 57, width: 380, py: 45, px: 8, alpha: 0.21 },
  { src: '/img/projects/gapura/0-0.jpg', side: 'right', top: 64, width: 365, py: 41, px: 7, alpha: 0.2 },
  { src: '/img/projects/sipfos/1-0.jpg', side: 'left', top: 72, width: 350, py: 37, px: 6, alpha: 0.19 },
  { src: '/img/projects/camkender/3-1.jpg', side: 'right', top: 79, width: 340, py: 33, px: 5, alpha: 0.18 },
  { src: '/img/projects/gajahsafe/0-2.jpg', side: 'left', top: 86, width: 330, py: 29, px: 4, alpha: 0.17 },
  { src: '/img/projects/gajahsafe/4-1.jpg', side: 'right', top: 92, width: 320, py: 25, px: 3, alpha: 0.16 },
] as const;

/**
 * The two lines the s01 lockup opens on, before the roles.
 *
 * They are not roles and do not obey the same rule: `hello world!` stands on
 * its own with no `dev` after it, which is why the suffix does not appear until
 * the column reaches `im a`. From there the lockup reads as one sentence —
 * "im a dev", then "frontend dev", and so on.
 */
export const OPERATOR_OPENERS: readonly string[] = ['hello world!', 'im a'] as const;

/**
 * The index from which the `dev` suffix is part of the reading. Everything
 * before it stands alone.
 */
export const SUFFIX_FROM = 1;

/**
 * The roles the s01 title lockup cycles through, in order.
 *
 * Each is a PREFIX: the lockup renders them against a fixed `dev` suffix, so
 * these read as "FRONTEND dev", "INFRA dev", and so on. That is why DevOps
 * appears as INFRA — "DEVOPS dev" is not a phrase, and infrastructure is the
 * accurate word for the Docker/Nginx/PM2/AWS end of the work.
 *
 * Order is deliberate: it walks outward from the surface a visitor sees first
 * to the breadth underneath, and lands on the title actually being claimed.
 */
export const OPERATOR_ROLES: readonly string[] = [
  'FRONTEND',
  'BACKEND',
  'INFRA',
  'AIoT',
  'FULL-STACK',
] as const;

/** Identity card facts shown beside the s01 portrait. */
export const OPERATOR_CARD: readonly Stat[] = [
  { label: 'CALL SIGN', value: 'DIL' },
  { label: 'BASE', value: 'KUALA LUMPUR' },
  { label: 'TIMEZONE', value: 'GMT+8' },
  // One row rather than separate REMOTE / WFH / WIO lines: those say the same
  // thing three times, and WIO is not an abbreviation a reader can be expected
  // to decode. FIELD WORK stays its own row because it is not a work-mode
  // preference — it is going out to the installation.
  { label: 'WORK MODE', value: 'REMOTE · HYBRID · ON-SITE' },
  { label: 'FIELD WORK', value: 'YES' },
  { label: 'NOTICE', value: '30 DAYS' },
  { label: 'LANGUAGES', value: 'MALAY · ENGLISH' },
  { label: 'DEGREE', value: 'BSc (HONS) CS · SOFTWARE ENG' },
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
  { name: 'MQTT / Socket.io', detail: 'REAL-TIME TRANSPORT', accent: true },
  { name: 'WebRTC', detail: 'LIVE VIDEO · INTERCOM', accent: true },
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

export const LOADOUT_HEAD = {
  title: 'CORE LOADOUT',
  note: 'DAILY DRIVERS — FULL MANIFEST IN 02',
} as const;

/**
 * The s01 portrait.
 *
 * A real photograph, which is what the prototype asked for ("real photo beats
 * the cartoon"). `src` stays nullable: the component still renders an explicit
 * pending frame when it is null, so the gap would be stated rather than
 * disguised if the file were ever pulled.
 *
 * Intrinsic size is 971x1413. The frame is 4/5 and the image is `object-fit:
 * cover`, so it crops top and bottom rather than distorting.
 *
 * `alphaSrc` is the same frame with the background cut away. It is layered over
 * `src` and parallaxed independently to give the flat photograph depth, so the
 * two files must stay pixel-aligned: same crop, same intrinsic size. Re-export
 * both together or the cutout will drift off its own subject.
 */
export const PORTRAIT: {
  readonly src: string | null;
  readonly alphaSrc: string;
  readonly alt: string;
  readonly filename: string;
} = {
  src: '/img/operator.jpg',
  alphaSrc: '/img/operator-alpha.png',
  alt: 'Muhd Aidil Syazwan Hamdan',
  filename: 'OPERATOR.JPG',
};
