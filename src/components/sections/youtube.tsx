import { SectionHeading } from '@/components/shared/section-heading';
import { YoutubeCard } from '@/components/sections/youtube-card';
import { youtube } from '@/content/content';
import { getLatestVideo } from '@/lib/youtube';

/**
 * Sekcja kanału YouTube.
 *
 * Komponent serwerowy: najnowszy film pobieramy po stronie serwera, więc
 * przeglądarka nie wykonuje żadnego zapytania do YouTube, a miniatura
 * jest w HTML-u od razu. Dane odświeżają się same co 30 minut (ISR) —
 * po wrzuceniu filmu na kanał pojawi się tu bez wdrażania czegokolwiek.
 */
export async function Youtube() {
  const latest = await getLatestVideo();

  // Data formatowana na serwerze — `toLocaleDateString` w komponencie
  // klienckim potrafi dać inny wynik niż na serwerze i zepsuć hydratację.
  const publishedLabel =
    latest?.publishedAt
      ? new Intl.DateTimeFormat('pl-PL', { dateStyle: 'long' }).format(
          new Date(latest.publishedAt)
        )
      : '';

  return (
    <section
      id="youtube"
      className="relative scroll-mt-28 py-section"
      aria-labelledby="youtube-title"
    >
      <div className="shell flex flex-col gap-16">
        <SectionHeading
          index="05"
          titleId="youtube-title"
          eyebrow={youtube.eyebrow}
          title={youtube.title}
        />

        <YoutubeCard latest={latest} publishedLabel={publishedLabel} />
      </div>
    </section>
  );
}
