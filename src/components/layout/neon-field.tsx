/**
 * Tło całej strony: neonowa poświata + siatka.
 *
 * Oryginał rysował to na canvasie w pętli rAF. Tutaj są to trzy rozmyte
 * gradienty i dwie linie siatki w CSS — wygląda tak samo, a nie kosztuje
 * ani jednej klatki JS-a. Animacje wygasza globalna reguła
 * `prefers-reduced-motion` z globals.css.
 *
 * Komponent serwerowy — nie ma tu żadnego stanu.
 */
export function NeonField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Baza */}
      <div className="absolute inset-0 bg-background" />

      {/* Poświaty */}
      <div
        className="absolute -left-[15%] top-[-10%] size-[70vmax] animate-aurora-drift rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(179,71,255,0.20) 0%, rgba(179,71,255,0.05) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute -right-[20%] top-[25%] size-[60vmax] animate-aurora-drift rounded-full blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255,45,247,0.16) 0%, rgba(255,45,247,0.04) 45%, transparent 70%)',
          animationDelay: '-8s',
        }}
      />
      <div
        className="absolute bottom-[-15%] left-[25%] size-[55vmax] animate-aurora-drift rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(45,159,255,0.15) 0%, rgba(45,159,255,0.04) 45%, transparent 70%)',
          animationDelay: '-15s',
        }}
      />

      {/* Siatka */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(179,71,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(179,71,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, #000 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 70% at 50% 40%, #000 30%, transparent 100%)',
        }}
      />

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
