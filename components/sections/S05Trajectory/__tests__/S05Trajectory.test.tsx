import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { S05Trajectory } from '../index';
import { TRAJECTORY } from '@/content/trajectory';

beforeEach(() => {
  vi.unstubAllGlobals();
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
});
