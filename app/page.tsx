'use client';

import { useState } from 'react';
import { Masthead } from '@/components/chrome/Masthead';
import { RailNav } from '@/components/chrome/RailNav';
import { Ambient } from '@/components/chrome/Ambient';
import { Reticle } from '@/components/chrome/Reticle';
import { BootOverlay } from '@/components/boot/BootOverlay';
import { S00Hero } from '@/components/sections/S00Hero';
import { SectionShell } from '@/components/sections/SectionShell';
import { SECTIONS } from '@/content/sections';

/**
 * Client component because it owns `bootDone`, which gates the hero intro —
 * that timeline must not play until the boot overlay has handed off. The page
 * is animated end to end and gains nothing from staying a server component.
 */
export default function Page() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <>
      <BootOverlay onComplete={() => setBootDone(true)} />
      <Ambient />
      <Reticle />
      <Masthead />
      <RailNav />
      <main data-boot-done={bootDone ? 'true' : 'false'}>
        <S00Hero bootDone={bootDone} />
        {SECTIONS.filter((section) => section.id !== 's00').map((section) => (
          <SectionShell
            key={section.id}
            id={section.id}
            number={section.number}
            title={section.title}
          >
            <div style={{ minHeight: '60vh' }} />
          </SectionShell>
        ))}
      </main>
    </>
  );
}
