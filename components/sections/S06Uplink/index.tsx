'use client';

import { useRef, useState } from 'react';
import { CHANNELS, FOOTER, UPLINK } from '@/content/uplink';
import { contactSchema } from '@/lib/contact/schema';
import { useSectionReveal } from '@/components/motion/useSectionReveal';
import styles from './S06Uplink.module.css';

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'invalid';
type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

/**
 * The uplink. Returns to the dark ground after s05's green.
 *
 * Validated client-side with the same schema the route handler uses, so the
 * form never posts something the server would reject for a different reason.
 */
export function S06Uplink() {
  const rootRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  useSectionReveal(rootRef, '[data-reveal]');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const candidate = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      message: String(form.get('message') ?? ''),
    };

    const parsed = contactSchema.safeParse(candidate);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'name' || field === 'email' || field === 'message') {
          next[field] ??= issue.message;
        }
      }
      setErrors(next);
      setStatus('invalid');
      return;
    }

    setErrors({});
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      setStatus(response.ok ? 'sent' : 'failed');
    } catch {
      setStatus('failed');
    }
  }

  const failed = status === 'failed' || status === 'invalid';

  return (
    <section id="s06" ref={rootRef} className={styles.section}>
      <div className={styles.ghost} data-py="-46" data-ghost-numeral aria-hidden="true">06</div>
      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.headNumber} aria-hidden="true">06</span>
          <h2 className={styles.headTitle}>UPLINK</h2>
          <span className={styles.headNote}>{UPLINK.label}</span>
        </header>

        <div className={styles.grid}>
          <div>
            <p className={styles.lead} data-reveal>
              {UPLINK.lead[0]} {UPLINK.lead[1]}{' '}
              <span className={styles.leadAccent}>
                {UPLINK.lead[2]}
                {UPLINK.lead[3]}
              </span>
            </p>
            <p className={styles.body} data-reveal>{UPLINK.body}</p>

            <dl className={styles.channels} data-reveal>
              {CHANNELS.map((channel) => (
                <div key={channel.label} className={styles.channel}>
                  <dt className={styles.channelLabel}>{channel.label}</dt>
                  <dd className={styles.channelValue}>
                    {channel.href ? (
                      <a href={channel.href}>{channel.value}</a>
                    ) : (
                      channel.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.panel} data-reveal>
            <div className={styles.panelHead}>
              <span>{UPLINK.formTitle}</span>
            </div>

            <form className={styles.form} onSubmit={onSubmit} noValidate>
              {(['name', 'email', 'message'] as const).map((field) => {
                const config = UPLINK.fields[field];
                const invalid = Boolean(errors[field]);
                const errorId = `uplink-${field}-error`;
                return (
                  <div key={field} className={styles.field}>
                    <label className={styles.fieldLabel} htmlFor={`uplink-${field}`}>
                      {config.label}
                    </label>
                    {field === 'message' ? (
                      <textarea
                        id={`uplink-${field}`}
                        name={field}
                        rows={5}
                        placeholder={config.placeholder}
                        className={styles.textarea}
                        aria-invalid={invalid}
                        aria-describedby={invalid ? errorId : undefined}
                      />
                    ) : (
                      <input
                        id={`uplink-${field}`}
                        name={field}
                        type={field === 'email' ? 'email' : 'text'}
                        placeholder={config.placeholder}
                        className={styles.input}
                        aria-invalid={invalid}
                        aria-describedby={invalid ? errorId : undefined}
                      />
                    )}
                    {/* Outside the label: an error describes the field, it does
                        not name it. Nested here it would be appended to the
                        accessible name and break every by-label query. */}
                    {invalid ? (
                      <span id={errorId} className={styles.fieldError}>
                        {errors[field]}
                      </span>
                    ) : null}
                  </div>
                );
              })}

              <button type="submit" className={styles.submit} disabled={status === 'sending'}>
                {status === 'sending' ? UPLINK.sending : UPLINK.submit}
              </button>

              {status === 'sent' ? (
                <div role="status" className={`${styles.status} ${styles.statusOk}`}>
                  {UPLINK.success}
                </div>
              ) : null}
              {failed ? (
                <div role="alert" className={`${styles.status} ${styles.statusBad}`}>
                  {status === 'invalid' ? UPLINK.invalid : UPLINK.failure}
                </div>
              ) : null}

              <div className={styles.window}>{UPLINK.responseWindow}</div>
            </form>
          </div>
        </div>

        <footer className={styles.footer}>
          <span className={styles.footerSys}>
            <span className={styles.footerDot} aria-hidden="true" />
            {FOOTER.sys}
          </span>
          <span>{FOOTER.credit}</span>
          <span className={styles.footerSpacer} />
          <span>{FOOTER.rights}</span>
        </footer>
      </div>
    </section>
  );
}
