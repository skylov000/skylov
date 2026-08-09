import { youtube } from '@/content/content';

/**
 * Pobieranie najnowszego filmu z kanału.
 *
 * Świadomie **bez YouTube Data API**: kanał publikuje otwarty feed Atom
 * pod `/feeds/videos.xml`, więc nie trzeba klucza, nie ma limitów zapytań
 * i nie ma czego rotować przy wdrożeniu.
 *
 * Feed wymaga identyfikatora kanału (`UC…`), a w treści mamy tylko
 * uchwyt (`@SKYLOV_MUSIC`) — dlatego przy braku `channelId` w pliku
 * treści wyciągamy go raz ze strony kanału.
 */

export interface LatestVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
}

/** Jak często odświeżać dane. 30 minut to kompromis świeżość/obciążenie. */
const REVALIDATE_SECONDS = 1800;

/** Feed zwraca encje XML — w tytułach najczęściej `&amp;` i `&quot;`. */
function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

async function resolveChannelId(handleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(handleUrl, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; SkylovSite/1.0)' },
      next: { revalidate: 86_400 }, // uchwyt → id zmienia się w praktyce nigdy
    });
    if (!response.ok) return null;

    const html = await response.text();
    const match =
      html.match(/"channelId":"(UC[\w-]{20,})"/) ??
      html.match(/channel_id=(UC[\w-]{20,})/);

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Zwraca najnowszy film albo `null`, gdy cokolwiek zawiedzie.
 *
 * Świadomie nie rzuca wyjątkiem: brak internetu przy budowaniu ani
 * usunięty kanał nie mogą wywalić całej strony — sekcja po prostu
 * pokazuje wtedy wariant bez filmu.
 */
export async function getLatestVideo(): Promise<LatestVideo | null> {
  try {
    const channelId = youtube.channelId || (await resolveChannelId(youtube.cta.href));
    if (!channelId) return null;

    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!response.ok) return null;

    const xml = await response.text();
    // Pierwszy <entry> to najnowszy film; feed jest posortowany malejąco.
    const entry = xml.split('<entry>')[1];
    if (!entry) return null;

    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([^<]*)<\/title>/)?.[1];
    const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    if (!id || !title) return null;

    return {
      id,
      title: decodeEntities(title),
      url: `https://www.youtube.com/watch?v=${id}`,
      // `hqdefault` istnieje dla każdego filmu; `maxresdefault` bywa pusty.
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      publishedAt: publishedAt ?? '',
    };
  } catch {
    return null;
  }
}
