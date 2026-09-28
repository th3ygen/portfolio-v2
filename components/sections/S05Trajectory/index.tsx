'use client';

import { useRef, useState } from 'react';
import { TRAJECTORY } from '@/content/trajectory';
import { SECTIONS } from '@/content/sections';
import { gsap, ScrollTrigger, useGSAP } from '@/components/motion/gsap';
import { useSectionReveal } from '@/components/motion/useSectionReveal';
import { YearOdometer } from '@/components/odometer/YearOdometer';
import styles from './S05Trajectory.module.css';

const SECTION_TITLE = SECTIONS.find((s) => s.id === 's05')?.title ?? 'TRAJECTORY';

/** Where a post counts as the one being read: its box crossing mid-screen. */
const READ_LINE = 'center';

/**
 * The trajectory: five career posts, oldest first, on the dark ground.
 *
 * One year, not five. The s04 → s05 zoom ends by rolling the year back to
 * 2020 and flying through the dot in it; this section picks that same
 * odometer up in a sticky column and rolls it forward as each post crosses
 * the middle of the screen. The number that brought the reader in becomes the
 * index of the section, rather than a transition that ends and a timeline that
 * starts over with its own years.
 *
 * The section used to sit on a full accent ground, inherited from the flood
 * that ended the zoom. A whole screen of #c6f21a was too much against the rest
 * of the page, and every dark value in it had to be re-mixed as alpha over
 * green. The accent is now kept for what it means here: the year, the post
 * being read, and the two posts that are still running.
 *
 * The sticky year is decorative — each post states its own year and tag in
 * its head, where a screen reader meets them in order. So are the ghost
 * numerals, which repeat the same year a third time.
 */
export function S05Trajectory() {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useSectionReveal(rootRef, '[data-traj-el]');

  useGSAP(
    () => {
      const posts = gsap.utils.toArray<HTMLElement>('[data-post]', rootRef.current);
      const list = posts[0]?.parentElement;
      if (!list) return;

      // The ends. The per-post triggers only say which post was entered, so
      // scrolling back out above the list would leave the year on whichever
      // post was read last — 2025 over the top of POST.01 as the section comes
      // back into view. Leaving the list either way pins it to that edge.
      ScrollTrigger.create({
        trigger: list,
        start: `top ${READ_LINE}`,
        end: `bottom ${READ_LINE}`,
        onLeaveBack: () => setActive(0),
        onLeave: () => setActive(posts.length - 1),
      });

      posts.forEach((post, index) => {
        ScrollTrigger.create({
          trigger: post,
          start: `top ${READ_LINE}`,
          end: `bottom ${READ_LINE}`,
          onToggle: (self) => {
            if (self.isActive) setActive(index);
          },
        });
      });
    },
    { scope: rootRef },
  );

  // The content test pins TRAJECTORY at five posts, so [0] always exists.
  const current = TRAJECTORY[active] ?? TRAJECTORY[0]!;

  return (
    <section id="s05" ref={rootRef} className={styles.section}>
      <div className={styles.inner}>
        <h2 className="sr-only">{SECTION_TITLE}</h2>

        <div className={styles.track}>
          <div className={styles.yearCol}>
            <div className={styles.sticky} data-traj-year aria-hidden="true">
              <svg className={styles.year} viewBox="-94 -46 188 92">
                <YearOdometer year={Number(current.year)} mode="discrete" />
              </svg>
              {/*
                Keyed on the post, so the line remounts and its stepped
                entrance plays each time the post changes — including 2020 to
                2020, where the odometer has nothing to roll and this is the
                only thing that says the post moved on.
              */}
              <div key={current.post} className={styles.stickyMeta}>
                <span className={styles.stickyPost}>{current.post}</span>
                <span>{current.tag}</span>
              </div>
            </div>
          </div>

          <ol className={styles.posts}>
            {TRAJECTORY.map((post, index) => (
              <li
                key={post.post}
                className={styles.post}
                data-post={post.post}
                data-active={index === active}
                data-status={post.status}
              >
                <div className={styles.ghost} data-traj-ghost data-ghost-numeral aria-hidden="true">
                  {post.year}
                </div>
                <div className={styles.hatch} data-py="18" aria-hidden="true" />
                <div className={styles.dots} data-py="-14" aria-hidden="true" />
                <div className={styles.bars} data-py="10" aria-hidden="true">
                  <div className={styles.bar} style={{ width: '100%' }} />
                  <div className={styles.bar} style={{ width: '58%' }} />
                  <div className={styles.barStrong} style={{ width: '32%' }} />
                  <div className={styles.bar} style={{ width: '76%' }} />
                </div>

                <div className={styles.rail} aria-hidden="true">
                  <div className={styles.railLine} />
                  <div className={styles.railDot} />
                </div>

                <div className={styles.body}>
                  <div className={styles.postHead} data-traj-el>
                    <span className={styles.postNumber}>{post.post}</span>
                    <span className={styles.postRule} aria-hidden="true" />
                    <span className={styles.postYear}>{post.year}</span>
                    <span>{post.tag}</span>
                    <span className={styles.postRule} aria-hidden="true" />
                    <span className={styles.status}>{post.status}</span>
                  </div>
                  <h3 className={styles.role} data-traj-el>{post.role}</h3>
                  <div className={styles.org} data-traj-el>{post.org}</div>
                  <p className={styles.copy} data-box-reveal>{post.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
