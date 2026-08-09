/**
 * Tło całej strony: neonowa poświata + siatka.
 *
 * Historia tego pliku to historia zdejmowania kosztów:
 *
 * 1. Oryginał rysował to na canvasie w pętli rAF.
 * 2. Potem były trzy gradienty z `filter: blur(120px)`.
 * 3. Teraz są to **czyste gradienty promieniste, bez ani jednego filtra**.
 *
 * Krok trzeci jest tym, który uratował telefony. `blur(120px)` na
 * warstwie wielkości `70vmax` (na telefonie ~650 px) to sploty na
 * kilkuset tysiącach pikseli — a ponieważ warstwa była jeszcze
 * animowana w nieskończonej pętli (`aurora-drift` zmienia `scale`),
 * przeglądarka musiała rastrować ją i rozmywać OD NOWA w każdej klatce.
 * Trzy takie warstwy naraz, non stop, niezależnie od tego, czy ktoś
 * przewija — stąd telefon, który „umiera do zamknięcia karty".
 *
 * Gradient promienisty jest gładki z definicji: dokładając stopnie
 * pośrednie dostajemy tę samą miękką poświatę, ale rysuje ją zwykłe
 * wypełnienie, raz, i dalej idzie już tylko kompozycja warstwy.
 *
 * Animację poświat włącza wyłącznie profil `full` (patrz globals.css) —
 * na telefonie i słabym sprzęcie tło stoi, a nieużywany kompozytor może
 * zasnąć zamiast grzać baterię.
 *
 * Komponent serwerowy — nie ma tu żadnego stanu.
 */
export function NeonField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Baza */}
      <div className="absolute inset-0 bg-background" />

      {/* Poświaty — miękkość niesie sam rozkład stopni, nie `blur()`. */}
      <div
        className="aurora absolute -left-[15%] top-[-10%] size-[70vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle closest-side, rgba(179,71,255,0.22) 0%, rgba(179,71,255,0.14) 28%, rgba(179,71,255,0.06) 52%, rgba(179,71,255,0.02) 74%, transparent 100%)',
        }}
      />
      <div
        className="aurora absolute -right-[20%] top-[25%] size-[60vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle closest-side, rgba(255,45,247,0.17) 0%, rgba(255,45,247,0.10) 28%, rgba(255,45,247,0.045) 52%, rgba(255,45,247,0.015) 74%, transparent 100%)',
          animationDelay: '-8s',
        }}
      />
      <div
        className="aurora absolute bottom-[-15%] left-[25%] size-[55vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle closest-side, rgba(45,159,255,0.16) 0%, rgba(45,159,255,0.10) 28%, rgba(45,159,255,0.04) 52%, rgba(45,159,255,0.015) 74%, transparent 100%)',
          animationDelay: '-15s',
        }}
      />

      {/*
        Siatka. Maska wycinająca krawędzie jest osobną warstwą
        kompozycyjną, więc w trybie `lite` CSS podmienia ją na zwykłe
        przygaszenie — różnicy prawie nie widać, a odpada jeden przebieg
        maskowania przy każdym przemalowaniu.
      */}
      <div className="neon-grid absolute inset-0 opacity-[0.55]" />

      {/* Winieta — dociska krawędzie, żeby treść wychodziła na pierwszy plan */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 30%, rgba(5,0,13,0.85) 100%)',
        }}
      />
    </div>
  );
}
