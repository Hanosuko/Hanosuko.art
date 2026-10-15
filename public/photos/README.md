# Photos

Gallery and setup photos live in `src/assets/photos/` as WebP — see the «Photos» section of the main README.

A file put here also works (`photoUrl` in `src/config/profile.ts` falls back to `public/photos/`),
but without a hash in its name the browser caches it for a week under the same URL.
