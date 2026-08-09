/**
 * Renders a Schema.org payload as JSON-LD.
 *
 * `dangerouslySetInnerHTML` is the documented way to emit a script body in
 * React; the payload is our own typed object, never user input.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
