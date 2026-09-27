import type { IndexRow } from '@/lib/types';

export const INDEX_INTRO = 'Everything shipped, including the four above. Ask me about any of them.';

export const INDEX_NOTE =
  "NOTE — Most of these were built for private networks or proprietary use, so public links aren't available. I'm happy to walk through the architecture and the parts that broke.";

export const INDEX_ROWS: readonly IndexRow[] = [
  { n: '01', name: 'CAM Kenderaan', sector: 'Government', keyTech: 'CAN Bus · GPS/IMU · Mapbox', access: 'PRIVATE', image: '/img/projects/camkender/0-1.jpg' },
  { n: '02', name: 'CAM Muka', sector: 'Government', keyTech: 'Tensorflow.js · RTSP · Socket.io', access: 'PRIVATE', image: '/img/projects/cammuka/0-0.jpg' },
  { n: '03', name: 'UMPSA IBMS Hub', sector: 'Infrastructure', keyTech: 'Next.js · OAuth · Notifications', access: 'PRIVATE', image: '/img/projects/umpsahub/0-0.jpg' },
  { n: '04', name: 'CERDAS', sector: 'Emergency', keyTech: 'WebRTC · MQTT', access: 'PRIVATE', image: '/img/projects/cerdas/0-0.jpg' },
  { n: '05', name: 'CEISys', sector: 'Emergency', keyTech: 'WebRTC · Geospatial events', access: 'PRIVATE', image: '/img/projects/ceisys/0-0.jpg' },
  { n: '06', name: 'Piping Calc. Tools', sector: 'Industrial', keyTech: 'HyperFormula · PDF gen', access: 'PRIVATE', image: '/img/piping-calc-tools.jpg' },
  { n: '07', name: 'Poly-Dash', sector: 'Manufacturing', keyTech: 'Tensorflow.js · Recharts', access: 'PRIVATE', image: '/img/projects/polydash/0-0.jpg' },
  { n: '08', name: 'PCASSO', sector: 'Manufacturing', keyTech: 'Image streaming · Analytics', access: 'PRIVATE', image: '/img/projects/pcasso/0-0.jpg' },
  { n: '09', name: 'TopGlove GFIs', sector: 'Manufacturing', keyTech: 'Real-time monitoring · Indexing', access: 'PRIVATE', image: '/img/projects/topglove/0-0.jpg' },
  { n: '10', name: 'C/D-SOVA', sector: 'Safety / AI', keyTech: 'CCTV · Drone · PPE detection', access: 'PRIVATE', image: '/img/projects/csova/0-1.jpg' },
  { n: '11', name: 'GajahSafe', sector: 'Conservation', keyTech: 'MQTT · Leaflet · Telegram Bot', access: 'PRIVATE', image: '/img/projects/gajahsafe/0-0.jpg' },
  { n: '12', name: 'SIPFOS', sector: 'Aquaculture', keyTech: 'IoT sensors · Notifications', access: 'PRIVATE', image: '/img/projects/sipfos/0-0.jpg' },
  { n: '13', name: 'IoT Pond Monitor', sector: 'Aquaculture', keyTech: 'IoT logging · Reporting', access: 'PRIVATE', image: '/img/projects/iotpondmonitor/0-0.jpg' },
  { n: '14', name: 'Ai-VIGS', sector: 'Agritech / AI', keyTech: 'Growth-stage inference', access: 'PRIVATE' },
  { n: '15', name: 'Fugentutor', sector: 'Marketplace', keyTech: 'Stripe · NextAuth · Nodemailer', access: 'PRIVATE', image: '/img/projects/fugentutor/0-0.jpg' },
  { n: '16', name: 'Fugen Legacy', sector: 'Web', keyTech: 'Next.js · SEO · CMS', access: 'PUBLIC', image: '/img/projects/fugenlegacy/0-0.jpg' },
] as const;
