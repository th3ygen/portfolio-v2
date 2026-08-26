import { Masthead } from '@/components/chrome/Masthead';
import { RailNav } from '@/components/chrome/RailNav';
import { Ambient } from '@/components/chrome/Ambient';
import { Reticle } from '@/components/chrome/Reticle';
import { SectionShell } from '@/components/sections/SectionShell';
import { SECTIONS } from '@/content/sections';

export default function Page() {
  return (
    <>
      <Ambient />
      <Reticle />
      <Masthead />
      <RailNav />
      <main>
        {SECTIONS.map((section) => (
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
