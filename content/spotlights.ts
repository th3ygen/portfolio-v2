import type { Spotlight } from '@/lib/types';

export const SPOTLIGHT_INTRO =
  'The four I would want to talk about in an interview. High level only — most of these ran on private or government networks, so screens are partial and details stay outside.';

export const SPOTLIGHTS: readonly Spotlight[] = [
  {
    id: 'cam-kenderaan',
    code: 'S/01',
    name: 'CAM Kenderaan',
    tagline: 'SECURE VEHICLE TELEMETRY BLACKBOX',
    years: '2022–2023',
    tags: ['GOVERNMENT', 'AUTOMOTIVE', 'GEOSPATIAL'],
    blurb:
      'A tamper-resistant blackbox for Cyber Security Malaysia. It reads live vehicle telemetry off the CAN bus, fuses it with GPS and IMU sensor data, and streams a signed, geospatially-tagged record to an operator map. The hard part was not the dashboard — it was trusting the data between the vehicle and the server.',
    meta: [
      { label: 'CLIENT', value: 'Cyber Security Malaysia' },
      { label: 'MY ROLE', value: 'Full-stack + device integration' },
    ],
    stack: 'CAN Bus · GPS/IMU · Raspberry Pi · MQTT · Node.js · Next.js · PostgreSQL · Mapbox GL',
    image: '/img/cam-kenderaan.jpg',
  },
  {
    id: 'cam-muka',
    code: 'S/02',
    name: 'CAM Muka',
    tagline: 'FACIAL RECOGNITION & PEOPLE COUNTING',
    years: '2022–2023',
    tags: ['GOVERNMENT', 'COMPUTER VISION', 'REAL-TIME'],
    blurb:
      "Live facial recognition and headcount for Penjara Kajang, a Malaysian prison. Camera feeds are processed continuously and reconciled against the facility's existing bridging network, so officers get alerts and counts instead of raw video. Deployed inside a closed network with no room for downtime.",
    meta: [
      { label: 'SITE', value: 'Penjara Kajang' },
      { label: 'MY ROLE', value: 'Full-stack developer' },
    ],
    stack: 'Tensorflow.js · RTSP · Socket.io · Node.js · Next.js · PostgreSQL',
    image: '/img/cam-muka.jpg',
  },
  {
    id: 'piping-calc-tools',
    code: 'S/03',
    name: 'Piping Calc. Tools',
    tagline: 'ISO 24817-COMPLIANT CALCULATION ENGINE',
    years: '2022–2023',
    tags: ['ASCENITY', 'INDUSTRIAL', 'COMPLIANCE'],
    blurb:
      'Engineers repairing pressurised pipework have to prove their composite repair meets ISO 24817. This encodes the standard as a live calculation engine with a reviewable workflow, so the numbers and the audit trail come out together. Spreadsheet logic, without the spreadsheet.',
    meta: [
      { label: 'CONTEXT', value: 'Gapura · via Ascenity' },
      { label: 'MY ROLE', value: 'Founder / lead developer' },
    ],
    stack: 'HyperFormula · FormulaJS · TypeScript · Next.js · Prisma · Dynamic PDF generation',
    image: '/img/piping-calc-tools.jpg',
  },
  {
    id: 'gajahsafe',
    code: 'S/04',
    name: 'GajahSafe',
    tagline: 'ELEPHANT INTRUSION DETECTION & DETERRENCE',
    years: '2022–2023',
    tags: ['CONSERVATION', 'IOT', 'GEOSPATIAL'],
    blurb:
      'Wild elephants entering plantations is a genuine safety and livelihood problem in Malaysia. Field sensors detect an approach, map the position, trigger a deterrent, and push a notification to whoever is on duty — all over patchy rural connectivity, which shaped every technical decision in the system.',
    meta: [
      { label: 'CONTEXT', value: 'Field-deployed IoT' },
      { label: 'MY ROLE', value: 'Full-stack developer' },
    ],
    stack: 'MQTT · Arduino (C++) · Leaflet · Telegram Bot API · Node.js · MongoDB',
    image: '/img/gajahsafe.jpg',
  },
] as const;
