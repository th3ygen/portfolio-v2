'use client';

import { useState } from 'react';
import { Masthead } from '@/components/chrome/Masthead';
import { RailNav } from '@/components/chrome/RailNav';
import { Ambient } from '@/components/chrome/Ambient';
import { Reticle } from '@/components/chrome/Reticle';
import { BootOverlay } from '@/components/boot/BootOverlay';
import { S00Hero } from '@/components/sections/S00Hero';
import { S01Operator } from '@/components/sections/S01Operator';
import { S02Manifest } from '@/components/sections/S02Manifest';
import { S03Spotlight } from '@/components/sections/S03Spotlight';
import { S04Index } from '@/components/sections/S04Index';
import { S04ToS05Zoom } from '@/components/sections/S04ToS05Zoom';
import { S05Trajectory } from '@/components/sections/S05Trajectory';
import { SectionShell } from '@/components/sections/SectionShell';
import { CURRENT_YEAR, SECTIONS } from '@/content/sections';

/**
 * Client component because it owns `bootDone`, which gates the hero intro —
 * that timeline must not play until the boot overlay has handed off. The page
 * is animated end to end and gains nothing from staying a server component.
 */
/** Sections with bespoke components; the rest still render placeholder shells. */
const BUILT = new Set(['s00', 's01', 's02', 's03', 's04', 's05']);

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
        <S01Operator />
        <S02Manifest />
        <S03Spotlight />
        <S04Index />
        <S04ToS05Zoom startYear={CURRENT_YEAR} />
        <S05Trajectory />
        {SECTIONS.filter((section) => !BUILT.has(section.id)).map((section) => (
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
