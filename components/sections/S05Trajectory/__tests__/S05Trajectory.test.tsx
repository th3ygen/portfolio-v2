import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S05Trajectory } from '../index';
import { TRAJECTORY } from '@/content/trajectory';
import { ScrollTrigger } from '@/components/motion/gsap';

/**
 * jsdom lays nothing out, so every post is 0px tall and scroll position 0 is
 * already past the end of the list — the edge trigger then correctly puts the
 * year on the last post. The initial-state tests are about what the section
 * shows before any scroll has been read, so they keep ScrollTrigger out of it.
 */
function withoutScroll() {
  vi.spyOn(ScrollTrigger, 'create').mockReturnValue({} as ScrollTrigger);
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('S05Trajectory', () => {
  it('renders all five posts', () => {
    const { container } = render(<S05Trajectory />);
    expect(container.querySelectorAll('[data-post]')).toHaveLength(5);
  });

  it('renders posts in the order the content defines', () => {
    const { container } = render(<S05Trajectory />);
    const posts = Array.from(container.querySelectorAll('[data-post]')).map((el) =>
      el.getAttribute('data-post'),
    );
    expect(posts).toEqual(TRAJECTORY.map((p) => p.post));
  });

  it('renders the posts as an ordered list — the sequence is the meaning', () => {
    render(<S05Trajectory />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(TRAJECTORY.length);
  });

  it('names every organisation, role, and body', () => {
    render(<S05Trajectory />);
    for (const post of TRAJECTORY) {
      expect(screen.getByText(post.org)).toBeInTheDocument();
      expect(screen.getByText(post.body)).toBeInTheDocument();
    }
  });

  it('hides the ghost year numerals, which repeat the year already stated', () => {
    const { container } = render(<S05Trajectory />);
    const ghosts = container.querySelectorAll('[data-traj-ghost]');
    expect(ghosts).toHaveLength(5);
    for (const ghost of ghosts) {
      expect(ghost).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('states each year once per post to a screen reader, not twice', () => {
    // getAllByText matches aria-hidden nodes, so it counts the ghosts too.
    // Filter them out to model what a reader actually reaches: 2020 appears in
    // two posts, and each post states its year exactly once.
    const { container } = render(<S05Trajectory />);
    const exposed = Array.from(container.querySelectorAll('*')).filter(
      (el) =>
        el.textContent?.trim() === '2020' &&
        el.children.length === 0 &&
        !el.closest('[aria-hidden="true"]'),
    );
    expect(exposed).toHaveLength(2);
  });

  it('renders each role as a subheading', () => {
    render(<S05Trajectory />);
    const roles = screen.getAllByRole('heading', { level: 3 });
    expect(roles.map((h) => h.textContent)).toEqual(TRAJECTORY.map((p) => p.role));
  });

  it('gives the section an accessible heading even though the design shows none', () => {
    render(<S05Trajectory />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('shows one sticky year, starting on the first post', () => {
    withoutScroll();
    const { container } = render(<S05Trajectory />);
    const sticky = container.querySelectorAll('[data-traj-year]');
    expect(sticky).toHaveLength(1);
    expect(sticky[0]!.querySelector('[data-odometer]')).toHaveAttribute(
      'aria-label',
      TRAJECTORY[0]!.year,
    );
  });

  it('hides the sticky year from assistive tech — each post states its own', () => {
    const { container } = render(<S05Trajectory />);
    expect(container.querySelector('[data-traj-year]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('marks the first post as the one being read until the scroll says otherwise', () => {
    withoutScroll();
    const { container } = render(<S05Trajectory />);
    const active = container.querySelectorAll('[data-post][data-active="true"]');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveAttribute('data-post', TRAJECTORY[0]!.post);
  });

  it('flags the posts that are still running', () => {
    const { container } = render(<S05Trajectory />);
    const live = [...container.querySelectorAll('[data-post][data-status="ACTIVE"]')].map((el) =>
      el.getAttribute('data-post'),
    );
    expect(live).toEqual(TRAJECTORY.filter((p) => p.status === 'ACTIVE').map((p) => p.post));
  });

  it("keeps each post's tag in the post itself, not only in the sticky column", () => {
    const { container } = render(<S05Trajectory />);
    for (const post of TRAJECTORY) {
      const li = container.querySelector(`[data-post="${post.post}"]`)!;
      expect(li).toHaveTextContent(post.tag);
    }
  });
});
