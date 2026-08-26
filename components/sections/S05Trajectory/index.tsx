'use client';

import { useRef } from 'react';
import { TRAJECTORY } from '@/content/trajectory';
import { SECTIONS } from '@/content/sections';
import { useSectionReveal } from '@/components/motion/useSectionReveal';
import styles from './S05Trajectory.module.css';

/**
 * The trajectory: five career posts, oldest first, on an inverted ground.
 *
 * Each post's giant ghost numeral repeats the year already stated in the post,
 * so it is hidden from assistive tech — otherwise a screen reader announces
 * every year twice.
 */
const SECTION_TITLE = SECTIONS.find((s) => s.id === 's05')?.title ?? 'TRAJECTORY';

export function S05Trajectory() {
  const rootRef = useRef<HTMLElement>(null);
  useSectionReveal(rootRef, '[data-traj-el]');

  return (
    <section id="s05" ref={rootRef} className={styles.section}>
      <div className={styles.inner}>
        <h2 className="sr-only">{SECTION_TITLE}</h2>
        <ol>
          {TRAJECTORY.map((post) => (
            <li key={post.post} className={styles.post} data-post={post.post}>
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

              <div className={styles.yearCol}>
                <div className={styles.year} data-traj-el>{post.year}</div>
                <div className={styles.tag} data-traj-el>{post.tag}</div>
              </div>

              <div className={styles.rail} aria-hidden="true">
                <div className={styles.railLine} />
                <div className={styles.railProgress} data-traj-line />
                <div className={styles.railDot} data-traj-dot />
              </div>

              <div className={styles.body}>
                <div className={styles.postHead} data-traj-el>
                  <span className={styles.postNumber}>{post.post}</span>
                  <span className={styles.postRule} aria-hidden="true" />
                  <span>{post.status}</span>
                </div>
                <h3 className={styles.role} data-traj-el>{post.role}</h3>
                <div className={styles.org} data-traj-el>{post.org}</div>
                <p className={styles.copy} data-traj-el>{post.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
