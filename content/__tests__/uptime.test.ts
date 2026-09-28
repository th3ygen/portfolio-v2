import { describe, it, expect } from 'vitest';
import {
  CLIENT_COUNT,
  DEPLOYMENTS,
  DEPLOYMENTS_PRIVATE,
  DEPLOYMENTS_PUBLIC,
  DEPLOYMENT_SECTORS,
  POSTS_PER_YEAR,
  RUNNING,
  UPTIME_SINCE,
  UPTIME_YEARS,
} from '@/content/uptime';
import { TRAJECTORY } from '@/content/trajectory';
import { CURRENT_YEAR } from '@/content/sections';

describe('uptime summary', () => {
  it('runs from the first post to this year', () => {
    expect(UPTIME_SINCE).toBe(2020);
    expect(UPTIME_YEARS).toBe(CURRENT_YEAR - 2020);
  });

  it('has a bar for every year, empty years included, and every post counted once', () => {
    expect(POSTS_PER_YEAR.map((b) => b.year)).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    expect(POSTS_PER_YEAR.reduce((total, b) => total + b.count, 0)).toBe(TRAJECTORY.length);
    expect(POSTS_PER_YEAR.find((b) => b.year === 2021)?.count).toBe(0);
  });

  it('has a cell per project, split by access', () => {
    expect(DEPLOYMENTS).toHaveLength(16);
    expect(DEPLOYMENTS_PUBLIC + DEPLOYMENTS_PRIVATE).toBe(16);
    expect(DEPLOYMENTS_PUBLIC).toBe(1);
  });

  it('accounts for every project across the sectors it names', () => {
    expect(DEPLOYMENT_SECTORS[0]).toEqual({ sector: 'MANUFACTURING', count: 3 });
    expect(DEPLOYMENT_SECTORS.at(-1)?.sector).toBe('OTHER');
    expect(DEPLOYMENT_SECTORS.reduce((total, s) => total + s.count, 0)).toBe(16);
  });

  it('lists the posts still running by short name', () => {
    expect(RUNNING.map((r) => r.org)).toEqual(['ASCENITY SOLUTIONS', 'ARKI FINANCE']);
  });

  it('counts the client grid', () => {
    expect(CLIENT_COUNT).toBe(12);
  });
});
