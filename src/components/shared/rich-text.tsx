import { Fragment } from 'react';

/**
 * Renderuje `**pogrubienie**` z pliku treści jako podświetlony tekst.
 *
 * Świadomie obsługuje tylko ten jeden znacznik — dzięki temu `content.ts`
 * zostaje czystym tekstem, bez HTML-a i bez `dangerouslySetInnerHTML`.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}
