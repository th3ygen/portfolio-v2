'use client';

import { useRef, useState } from 'react';
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
import { S06Uplink } from '@/components/sections/S06Uplink';
import { useParallax } from '@/components/motion/useParallax';
import { CURRENT_YEAR } from '@/content/sections';

/**
 * Client component because it owns `bootDone`, which gates the hero intro —
 * that timeline must not play until the boot overlay has handed off. The page
 * is animated end to end and gains nothing from staying a server component.
 */
export default function Page() {
  const [bootDone, setBootDone] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  useParallax(mainRef);

  return (
    <>
      <BootOverlay onComplete={() => setBootDone(true)} />
      <Ambient />
      <Reticle />
      <Masthead />
      <RailNav />
      <main ref={mainRef} data-boot-done={bootDone ? 'true' : 'false'}>
        <S00Hero bootDone={bootDone} />
        <S01Operator />
        <S02Manifest />
        <S03Spotlight />
        <S04Index />
        <S04ToS05Zoom startYear={CURRENT_YEAR} />
        <S05Trajectory />
        <S06Uplink />
      </main>
    </>
  );
}
