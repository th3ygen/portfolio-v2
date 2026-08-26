import type { TrajectoryPost } from '@/lib/types';

export const TRAJECTORY_LABEL = '05 · SIX YEARS · FIVE POSTS';

/**
 * Reverse chronological — POST.01 is the oldest. The section reads downward
 * through time, which is why the zoom transition into it rewinds the year.
 */
export const TRAJECTORY: readonly TrajectoryPost[] = [
  {
    post: 'POST.01',
    year: '2020',
    tag: 'INTERNSHIP',
    status: 'ARCHIVED',
    role: 'Full-stack Developer',
    org: 'DITEC',
    body: 'First professional development role.',
  },
  {
    post: 'POST.02',
    year: '2020',
    tag: 'RESEARCH',
    status: 'ARCHIVED',
    role: 'Full-stack Developer / Research Assistant',
    org: 'UNIVERSITI MALAYSIA PAHANG AL-SULTAN ABDULLAH',
    body: 'Where the IoT and real-time work started — pond monitoring, building management, AI-assisted inspection. Research-funded systems that still had to survive contact with real users.',
  },
  {
    post: 'POST.03',
    year: '2022',
    tag: '→ PRESENT',
    status: 'ACTIVE',
    role: 'Founder / Full-stack Developer',
    org: 'ASCENITY SOLUTIONS · MY OWN COMPANY',
    body: 'Founded and still running it alongside my full-time work. Client projects across industrial compliance, IoT monitoring and web platforms — including the ISO 24817 calculation engine. Scoping, building, deploying and maintaining, usually as the only engineer in the room.',
  },
  {
    post: 'POST.04',
    year: '2023',
    tag: 'INTERNSHIP',
    status: 'ARCHIVED',
    role: 'Full-stack Developer',
    org: 'SATOK BRIDGE DIGITAL',
    body: 'Security and surveillance systems for government clients — the CAM Kenderaan telemetry blackbox and CAM Muka facial recognition deployment.',
  },
  {
    post: 'POST.05',
    year: '2025',
    tag: '→ PRESENT',
    status: 'ACTIVE',
    role: 'Mobile App Developer',
    org: 'ARKI FINANCE · SINGAPORE · FULL-TIME',
    body: 'My full-time role, separate from Ascenity. Leading development of a digital financial services app in Flutter — native performance, one codebase, both platforms. Working directly with product designers to get their vision into a shipped build.',
  },
] as const;
