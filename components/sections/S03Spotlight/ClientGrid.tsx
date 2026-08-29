import Image from 'next/image';
import { CLIENTS, CLIENTS_HEAD } from '@/content/clients';
import styles from './ClientGrid.module.css';

/**
 * The client grid that closes s03.
 *
 * Placed after the four spotlights on purpose: the deep projects make the
 * argument, and the roster is the evidence behind it.
 *
 * The logos carry no CSS filter. Normalisation is baked into the assets by
 * scripts/normalise-client-logos.py, because each logo needs its own contrast
 * curve — see the note in content/clients.ts.
 */
export function ClientGrid() {
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.title}>{CLIENTS_HEAD.title}</span>
        <span className={styles.note}>{CLIENTS_HEAD.note}</span>
      </div>

      <ul className={styles.grid}>
        {CLIENTS.map((client) => (
          <li key={client.slug} className={styles.cell} data-lock={client.short}>
            <Image
              className={styles.logo}
              src={`/img/clients-mono/${client.slug}.png`}
              alt={client.name}
              width={460}
              height={208}
            />
            <span className={styles.caption} aria-hidden="true">
              {client.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
