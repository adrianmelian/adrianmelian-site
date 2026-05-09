# am-mindmeld

Custom Hugo theme for adrianmelian.com built around the Mindmeld
design system from AM_MayaTools. Not intended for redistribution.

## Tech

- Hugo Extended ≥ 0.120
- Plain CSS via Hugo's resources pipeline (Concat + Minify + Fingerprint)
- Self-hosted webfonts: VT323 (display), JetBrains Mono (body)
- Vanilla JS (only the small inline mobile-nav toggle in the header partial)

## Structure

- `assets/css/` — bundled at build time into a single fingerprinted file
- `assets/img/` — pipeline-processed images (currently empty)
- `static/` — passthrough (fonts, favicons)
- `layouts/_default/` — baseof + single + list fallbacks
- `layouts/partials/` — header, footer, components (status-pill, terminal-frame, etc.)
- `layouts/shortcodes/` — Blowfish-shortcode shims pending later-phase replacement

## Phases

- **Phase 1 (this branch):** foundation + homepage
- **Phase 2:** gallery (bento + masonry + lightbox)
- **Phase 3:** project / tool list + detail templates
- **Phase 4:** about + contact + 404 + accessibility polish
- **Phase 5:** cleanup, Blowfish removal, content backfill

## Known gaps (to be addressed in later phases)

- **Project page templates** — non-homepage pages render via the minimal `single.html` / `list.html` fallback templates. Final detail-page treatment (terminal frame hero, metadata strip, image grid, credits panel) lands in Phase 3.
- **Gallery / about / contact templates** — same situation; Phases 2 and 4 own them.
