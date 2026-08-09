# /public/videos

Drop an optional hero background video here, then point `hero.video` at it in
`src/content/content.ts`:

```ts
video: '/videos/hero.mp4',
```

Leave it as `''` to use `hero.image` on its own.

Recommendations:

- **Format** `.mp4` (H.264) for the widest support — add a `.webm` sibling if you want.
- **Length** 8–15 seconds, seamlessly looping.
- **Size** keep it under 5 MB; it competes with your LCP.
- **Audio** strip it. The player is muted, so audio is dead weight.
- **Poster** `hero.image` is used automatically as the poster frame — make sure the
  first video frame matches it, or the swap will flash.
