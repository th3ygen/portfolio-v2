import type { ContactChannel } from '@/lib/types';

export const UPLINK = {
  label: 'ACCEPTING TRANSMISSIONS',
  lead: ['Got something', 'that has to', 'not break', '?'] as const,
  body: "Full-time roles, freelance builds, or work for Ascenity — all fine. If you're deciding whether to reach out, reach out.",
  formTitle: 'TRANSMIT.SH',
  fields: {
    name: { label: '> YOUR NAME', placeholder: 'jane doe' },
    email: { label: '> REPLY ADDRESS', placeholder: 'jane@company.com' },
    message: { label: '> PAYLOAD', placeholder: 'what are you building?' },
  },
  submit: 'TRANSMIT →',
  sending: 'TRANSMITTING…',
  success: 'TRANSMISSION RECEIVED — REPLY INBOUND',
  failure: 'TRANSMISSION FAILED — TRY EMAIL BELOW',
  invalid: 'CHECK THE HIGHLIGHTED FIELDS',
  responseWindow: 'RESPONSE WINDOW: ~24H · GMT+8',
} as const;

export const CHANNELS: readonly ContactChannel[] = [
  { label: 'EMAIL', value: 'aidil.syaz1.hamdan@gmail.com', href: 'mailto:aidil.syaz1.hamdan@gmail.com' },
  { label: 'PHONE', value: '+6011-3652-8296', href: 'tel:+601136528296' },
  { label: 'BASE', value: 'Kuala Lumpur, Malaysia', href: 'https://maps.app.goo.gl/ZbhD9hVvHUBW3d3E6' },
  { label: 'LINKEDIN', value: '/in/aidilsyaz', href: 'https://www.linkedin.com/in/aidilsyaz' },
] as const;

export const FOOTER = {
  sys: 'DIL.SYS',
  credit: 'DESIGNED & BUILT BY MUHD AIDIL SYAZWAN BIN HAMDAN',
  rights: 'ALL RIGHTS RESERVED © 2026',
} as const;
