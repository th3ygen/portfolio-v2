/** The seven page sections, in scroll order. Drives the rail nav and the page. */
export type SectionDef = {
  readonly id: string;
  readonly number: string;
  /** Vertical label in the rail. */
  readonly rail: string;
  /** Full heading shown in the section itself. */
  readonly title: string;
};

export const SECTIONS: readonly SectionDef[] = [
  { id: 's00', number: '00', rail: 'TOP', title: 'HERO' },
  { id: 's01', number: '01', rail: 'WHO', title: 'OPERATOR' },
  { id: 's02', number: '02', rail: 'TECH', title: 'FULL MANIFEST' },
  { id: 's03', number: '03', rail: 'WORK', title: 'SPOTLIGHT' },
  { id: 's04', number: '04', rail: 'ALL', title: 'FULL INDEX' },
  { id: 's05', number: '05', rail: 'UPTIME', title: 'TRAJECTORY' },
  { id: 's06', number: '06', rail: 'SEND', title: 'UPLINK' },
] as const;

/** Fixed masthead readouts. */
export const HEADER = {
  sys: 'DIL.SYS',
  operator: 'OPERATOR: M.AIDIL SYAZWAN HAMDAN',
  build: 'BUILD 2026.08',
  coordinates: 'KL 3.1390°N 101.6869°E',
  coffee: 'COFFEE: CRITICAL',
  /** Rendered on the server and until the client clock ticks. */
  clockPlaceholder: '--:--:-- MYT',
} as const;

/**
 * The year the zoom counter rewinds *from*.
 *
 * Deliberately a constant rather than `new Date().getFullYear()`. The page is
 * statically prerendered, so the server value is baked at build time while the
 * client computes at visit time — those genuinely differ across a New Year
 * boundary, which would be a hydration mismatch. The design already bakes 2026
 * in elsewhere (KRNL 2026.08, BUILD 2026.08, the footer copyright), so this
 * stays consistent with them and is updated in one place.
 */
export const CURRENT_YEAR = 2026;
