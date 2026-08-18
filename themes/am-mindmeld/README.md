# am-mindmeld

Custom Hugo theme for adrianmelian.com built around the Mindmeld
design system from AM_MayaTools. Not intended for redistribution.

## Tech

- Hugo Extended ≥ 0.120
- Plain CSS via Hugo's resources pipeline (Concat + Minify + Fingerprint)
- Self-hosted webfonts: JetBrains Mono only, display and body. VT323 retired with Mindmeld 1.0 and no longer ships (no font file, no @font-face).
- Vanilla JS (small inline mobile-nav toggle in the header partial)
- Homepage only: vendored GSAP 3.13 (ScrollTrigger, SplitText), bundled via
  js.Build. Choreography lives in `assets/js/home-motion.js`.
  ScrambleText was removed 2026-07-22 with the KS launch-console page, the
  only thing still loading it; scramble-text itself retired with Mindmeld 1.0.
  The interactive WebGL IK hero was retired 2026-07-14, so `solver.js`,
  `rig-hero.js`, and Three.js are vendored but no longer on any page.

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

## Project / tool front-matter

Each project (`content/projects/*/index.md`) or work (`content/works/*/index.md`)
supports these optional `[params]` fields. Templates degrade gracefully when
any field is missing.

| Field          | Used in                              | Example                       |
|----------------|--------------------------------------|-------------------------------|
| `role`         | Detail metadata strip + credits       | `"Lead Technical Artist"`     |
| `studio`       | Detail metadata strip + credits       | `"Sledgehammer Games"`        |
| `shipped_year` | Detail metadata strip (falls back to `.Date` year) | `"2023"`         |
| `status`       | Detail metadata strip status pill     | `"shipped"` or `"in_development"` |
| `engine`       | Credits panel                        | `"IW Engine"`                 |
| `platform`     | Credits panel                        | `"PC, PS5, Xbox Series"`      |
| `team_size`    | Credits panel                        | `"AAA scale"`                 |

See `content/projects/krazy_kaiju/index.md` for a populated reference example.

## Known gaps (to be addressed in later phases)

- *(none — all primary templates are in place. Phase 5 handles cleanup: Blowfish submodule removal, redundant `static/gallery/` files now that the image pipeline serves the gallery, optional content backfill on remaining project/tool pages, and a final Lighthouse pass.)*
