import type { ManifestCategory } from '@/lib/types';
import { CORE_LOADOUT } from '@/content/operator';

/**
 * The s02 full manifest — everything, including the unglamorous parts.
 * Nine lettered categories, always open; the 8-item core loadout in s01 is what
 * carries the count discipline.
 */
export const MANIFEST: readonly ManifestCategory[] = [
  {
    letter: 'A',
    category: 'FRONTEND & MOBILE',
    items: [
      'Next.js', 'React', 'React Native', 'Flutter', 'TypeScript',
      'JavaScript (ES6+)', 'Tailwind CSS', 'shadcn', 'Chakra UI',
      'Framer Motion', 'Zustand', 'Redux', 'SWR', 'Zod', 'HTML5', 'CSS3 / SCSS',
    ],
  },
  {
    letter: 'B',
    category: 'BACKEND & DATA',
    items: [
      'Node.js', 'Express', 'Next.js API routes', 'Server Actions', 'GraphQL',
      'Prisma (ORM)', 'PostgreSQL', 'MongoDB', 'Zod',
    ],
  },
  {
    letter: 'C',
    category: 'REAL-TIME & IOT',
    items: [
      'MQTT', 'WebSocket', 'Socket.io', 'WebRTC', 'RTMP / RTSP', 'CAN Bus',
      'Bluetooth Low Energy', 'ThingsBoard', 'Arduino (C++)', 'Raspberry Pi',
      'IoT data logging',
    ],
  },
  {
    letter: 'D',
    category: 'AI & ANALYTICS',
    items: [
      'Tensorflow.js', 'Predictive analysis', 'Real-time monitoring',
      'Data visualisation', 'Recharts', 'Chart.js',
    ],
  },
  {
    letter: 'E',
    category: 'AUTH & SECURITY',
    items: ['NextAuth', 'OAuth', 'JWT', 'RBAC', 'Cryptography', 'SSL', 'CORS', 'CSRF', 'XSS'],
  },
  {
    letter: 'F',
    category: 'PAYMENTS & INTEGRATIONS',
    items: ['Stripe', 'Nodemailer', 'Telegram Bot API', 'Mapbox GL API', 'Leaflet'],
  },
  {
    letter: 'G',
    category: 'DOCUMENTS & CALCULATION',
    items: [
      'HyperFormula', 'FormulaJS', 'Dynamic PDF generation',
      'Dynamic CSV generation', 'Static content management',
    ],
  },
  {
    letter: 'H',
    category: 'INFRASTRUCTURE',
    items: ['Docker', 'Nginx', 'PM2', 'AWS (EC2, S3, RDS)', 'Vercel', 'GitHub Actions'],
  },
  {
    letter: 'I',
    category: 'WORKFLOW',
    items: ['Git', 'GitHub', 'GitLab', 'Postman', 'Insomnia', 'Trello'],
  },
] as const;

/**
 * How many distinct things the manifest lists — the number the s02 head
 * counts up to.
 *
 * Distinct, not rows: Zod sits under both FRONTEND and BACKEND because it does
 * both jobs, and counting it twice would inflate the one figure the section
 * exists to state honestly.
 */
export const MANIFEST_COUNT = new Set(MANIFEST.flatMap((c) => c.items)).size;

export const MANIFEST_UNIT = 'ITEMS';

/**
 * The manifest rows that are also in the s01 core loadout. s02 tags them
 * [EQ], which is what makes the gap between the eight and the rest visible
 * rather than something the copy has to assert.
 *
 * Derived from the loadout rather than listed again, so swapping a slot in s01
 * moves the tag here.
 */
export const MANIFEST_EQUIPPED: ReadonlySet<string> = new Set(
  CORE_LOADOUT.flatMap((item) => item.manifest ?? [item.name]),
);

export const MANIFEST_EQUIPPED_TAG = '[EQ]';
