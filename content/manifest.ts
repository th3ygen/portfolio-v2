import type { ManifestCategory } from '@/lib/types';

/**
 * The s02 full manifest — everything, including the unglamorous parts.
 * Nine lettered categories. The whole grid sits behind a toggle that defaults
 * to open; the 8-item core loadout in s01 is what carries the count discipline.
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

export const MANIFEST_LABEL = {
  open: '[ − ] COLLAPSE MANIFEST',
  closed: '[ + ] EXPAND FULL MANIFEST',
} as const;
