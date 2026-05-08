---
title: adrianmelian.com — Mindmeld redesign
date: 2026-05-07
status: design (approved by user, pending spec review)
---

# adrianmelian.com — Mindmeld redesign

## Goal

Replace the current Blowfish-themed Hugo site with a custom Hugo theme built around the Mindmeld design system from `AM_MayaTools`. The redesigned site needs to communicate Adrian's identity as a senior technical artist — distinctive enough that peers in the discipline recognize the aesthetic, restrained enough that a non-technical studio recruiter still parses it as a serious portfolio.

The four pain points being addressed:
1. Visual identity reads as a generic Hugo theme rather than a personal portfolio
2. Project pages are thin (image + title only)
3. Information architecture is awkward (nested submenus, unclear flows)
4. Polish and craft details are inconsistent

## Audience

- **Primary:** studio hiring managers and recruiters (mixed-technical). The site must pass the "serious professional" bar and communicate value fast.
- **Secondary:** peer technical artists and pipeline TDs. The Mindmeld signature gives this group recognition signals without alienating the primary audience.

## Decisions summary

| Decision | Choice |
|---|---|
| Implementation scope | Custom Hugo theme replacing Blowfish |
| Aesthetic dial | Signature palette + typography + restrained motifs (no sitewide scanlines, no `[BRACKET]` buttons) |
| Project page depth | Polished cards with one-paragraph summaries (no full case studies) |
| Homepage hero | Asymmetric 40/60 split — signature panel + featured project terminal frame |
| Motion | Restrained — hover/active states + soft load fade-up only |
| Gallery treatment | Bento highlights + justified masonry archive + lightbox |
| Contact page | Single panel with email + socials, no contact form |
| Form backend | None (form was cut as overscoping) |

## Architecture

A new theme `am-mindmeld` lives at `themes/am-mindmeld/`. The existing Blowfish submodule is deinitialized and removed. Hugo, the markdown content, the domain, and the deployment pipeline are unchanged.

**File-level changes:**
- `.gitmodules` — Blowfish entry removed
- `themes/blowfish/` — submodule deinit and `git rm`
- `themes/am-mindmeld/` — new theme directory, all templates and styles owned in-repo
- `config/_default/hugo.toml` — `theme = "am-mindmeld"`
- `config/_default/params.toml` — replaced with a smaller params file matching the new templates
- `config/_default/menus.en.toml` — flat 5-item nav + 3 socials, ~140 lines down to ~20
- `static/adrianmelian_resume.pdf` — already in place, becomes the canonical resume URL

**Self-hosted webfonts:** `VT323` and `JetBrains Mono` ship in `themes/am-mindmeld/static/fonts/` (~250KB total) to avoid Google Fonts external dependency and the layout-shift it causes. User accepted the size cost; will offset with image trimming if needed.

## Visual system

### Palette

| Token | Hex | Role |
|---|---|---|
| `--carbon` | `#0B0E10` | Page background (off-black, never `#000`) |
| `--iron` | `#1C2126` | Panel surface |
| `--iron-2` | `#262C33` | Raised panel / hover background |
| `--iron-3` | `#353D45` | Border, dashed dividers |
| `--bone` | `#E8E0D0` | Primary text (warm phosphor afterglow) |
| `--bone-dim` | `#8A8378` | Secondary text |
| `--bone-faint` | `#5A554D` | Placeholder / disabled text |
| `--plasma` | `#7CFFB2` | Primary action, success, "live" status |
| `--ember` | `#FF7A3D` | Section numbers, labels, "available" status |

Two functional accents (plasma + ember) intentionally violate the redesign-skill's one-accent rule. They hold distinct semantic roles — plasma is action/state, ember is label/heading-accent — and that split is documented and enforced. No third accent ever.

### Typography

- **Display:** `VT323`, used for h1/h2, section numbers, status pills, metadata values. Uppercase, `letter-spacing: 0.02–0.04em`.
- **Body:** `JetBrains Mono`, used for body prose, navigation, UI, captions. 15px base (bumped from Mindmeld's 14px for prose readability), line-height 1.6.
- **Type scale (rem-based):** 11 / 12 / 14 / 15 / 18 / 24 / 32 / 48 / 72 px equivalents.
- **Tabular numerals** sitewide via `font-variant-numeric: tabular-nums` (insurance — JetBrains Mono is already monospace).
- **Body width** capped at 65ch on prose pages (per redesign-skill body-width rule).

### Motif kit

Survives at "restrained":

| Element | Status |
|---|---|
| Carbon background, iron panels, bone text | ✅ Sitewide |
| Plasma + ember as functional accents | ✅ Sitewide |
| VT323 display + JetBrains Mono body | ✅ Sitewide |
| Status pills (LIVE / OK / IDLE / WARN / SHIPPED) | ✅ Project meta, "available" indicator |
| Ember section numbers (`01 //`, `02 //`) | ✅ Section headings, project list year groups |
| Dashed `--iron-3` dividers | ✅ Between sections |
| Pixel logo (16×16 SVG) | ✅ Header + favicon |
| Subtle grain overlay (1.5–2% noise PNG, fixed, pointer-events-none) | ✅ Sitewide — survives because invisible until you go looking |
| Terminal frame with traffic-light dots | ⚠️ One per page max (homepage hero featured, project hero, 404) |
| Statusbar | ⚠️ Used as the site footer |
| Cursor blink (`_`) | ⚠️ Only on the homepage hero status pill |
| Sitewide CRT scanlines | ❌ Dropped |
| Sitewide vignette | ❌ Dropped |
| `[BRACKET]` buttons | ❌ Dropped |
| Log-panel style | ❌ Dropped from public site |

## Page templates

### Global header (sitewide)

Fixed, ~52px tall, `--iron` background with 1px `--iron-3` bottom border. Pixel logo + `ADRIAN MELIAN` wordmark in VT323 on the left. Nav center-right: `Projects · Tools · Gallery · About · Contact`. Social icons (LinkedIn, GitHub, YouTube) far right. Active page has a 2px plasma underline. The Blowfish nested submenus are dropped — project drill-down happens through the project list page.

### Homepage

Three stacked sections plus footer.

**Hero (~80vh)** — asymmetric 40/60 grid.
- *Left column (40%):* pixel logo (~120px), `ADRIAN MELIAN` in VT323 at 72px (last name in `--plasma`), JetBrains Mono tagline, a 4-row metadata block in ember-label/bone-value style:
  - `LOCATION · DENVER, CO`
  - `STATUS · OPEN TO RELOCATION`
  - `SHIPPING · KRAZY KAIJU`
  - `RECENT · MW3, VANGUARD`
  
  Then a single status pill (`[live-dot] AVAILABLE_` with the cursor blink — the only place it survives sitewide). Then a row of plasma-bordered quick-links: `RESUME · REEL · LINKEDIN · GITHUB`.
- *Right column (60%):* one terminal frame with titlebar `featured.project / krazy_kaiju.session`, holding the project hero image at large size with a 2-line description below. Click opens the project detail. This is the only terminal frame on the homepage.

**Section 01 — Recent projects** — `01 // RECENT PROJECTS` heading, then a 2-column zig-zag of 6 most recent projects (alternating image-left / image-right). Variable card heights, no AI-default 3-up grid. `MORE →` plasma link to `/projects/`.

**Section 02 — Tools** — `02 // TOOLS` heading, then a horizontal-scroll rail of tool cards (thumb, VT323 name, role/year). Drag + scroll-snap. 4 visible on desktop.

**Section 03 — Selected work** — `03 // SELECTED WORK` heading, a 3-image bento at varying sizes drawn from gallery favorites, plus `VIEW GALLERY →` link.

### Project list page (`/projects/`, `/tools/`)

Small `projects.list` titlebar-only terminal hero (no frame body), then the full archive grouped by year (`2023 //` ember section heads), with the same 2-col zig-zag inside each year group.

### Project detail page

The page that fixes "thin project pages":
- Top: a terminal frame whose titlebar reads `[role] · [studio] · [year]` and whose body is the project hero image at 16:9 or 21:9. Below the titlebar inside the frame: a metadata strip — `ROLE · …` / `STUDIO · …` / `SHIPPED · …` / status pill (`SHIPPED` in plasma or `IN_DEVELOPMENT` in ember).
- Below the frame: 1-paragraph summary in JetBrains Mono, max 65ch wide.
- Below the paragraph: an image grid with variable heights (not equal-height cards), 2-col on mobile, 3-col on desktop, masonry-justified. 3–6 images per project.
- Optional inline video embed (YouTube/Vimeo) if present.
- Bottom: a `CREDITS` panel — label-value list of role / team / engine / platform.
- Very bottom: `← prev project` / `next project →` paginators.

Tool detail uses the same template.

### About page

- Left column (~40%): portrait in a thin iron-3 dashed border with a slight phosphor-tint blend overlay.
- Right column (~60%): bio prose limited to 65ch, broken into 2–3 short sections.
- Below: a clean two-column "tools / skills" list (left = software, right = languages/specialties).
- Below: experience timeline — year in ember VT323 on left, role + studio in JetBrains Mono on right, dashed divider between rows. No card-blocks, no shadows.

### Contact page

Single panel. VT323 title. Email shown prominently, copy-on-click. Beneath: a 3-line status block (`LOCATION · DENVER, CO`, `STATUS · OPEN TO RELOCATION`, `CONTACT · EMAIL PREFERRED`). Below: linked icons for LinkedIn, GitHub, YouTube. No form. No backend.

### Gallery page

- 4–6 image bento at top (varying sizes, hand-curated highlights — Adrian provides filenames).
- Dashed divider.
- Justified masonry of the full archive below (variable heights, preserved aspect ratios).
- Click any image opens a lightbox — carbon backdrop, prev/next via arrow keys, ESC closes, plasma filename caption at the corner.
- No category filters in v1; revisit if archive grows past ~80 images.

### 404 page

Terminal frame, titlebar `error.404`, large VT323 `SIGNAL LOST` in ember inside the frame, one-line message, plasma `RETURN HOME` link.

### Footer (sitewide)

Used as the statusbar: ~26px row in `--iron-2` with segmented cells:
`[plasma-dot] ONLINE · BUILD 2026.05.07 · (spacer) · © 2026 ADRIAN MELIAN`

## Components

| Component | Used in | Key spec |
|---|---|---|
| `header` | Sitewide | Fixed 52px, iron bg, pixel logo + wordmark + nav + socials, plasma underline on active |
| `status-pill` | Hero, project meta, footer | Variants: `live`, `ok`, `warn`, `idle`, `shipped` |
| `section-heading` | List/index sections | Ember `NN //` number + bone title in VT323 + fading iron-3 rule |
| `terminal-frame` | Hero featured project, project hero, 404 | Variants: full (titlebar + body) or titlebar-only. Three traffic-light dots: ember / plasma-dim / bone-dim |
| `statusbar` | Footer | 26px iron-2 row, segmented cells, online dot |
| `project-card-zig` | Recent projects, list pages | 12-col grid: image 7 cols / text 5 cols, alternating sides, variable image aspect |
| `tool-card-rail` | Homepage rail | Thumb, VT323 name, role/year, scroll-snap |
| `bento-cell` | Gallery hero, homepage selected | Variable size, dashed iron-3 border, click-to-lightbox |
| `masonry-cell` | Gallery archive | Justified masonry, click-to-lightbox |
| `lightbox` | Gallery, project images | Carbon backdrop, prev/next arrows, ESC closes, plasma filename caption |
| `quick-link` | Hero, contact | Plasma-border button, no brackets, icon + label |
| `metadata-list` | Hero, project, about | Ember labels + bone values, monospace alignment |
| `image-grid-var` | Project pages | Variable-height items, gap 12px, NOT equal cards |
| `divider-dash` | Between sections | 1px iron-3 dashed |
| `prev-next-pager` | Project/tool detail bottom | Two arrows, JetBrains Mono labels |

### Required interaction states (every interactive element)

- `:hover` — subtle background shift, 200ms ease-out
- `:focus-visible` — plasma 2px outline with 2px offset, instant (no transition)
- `:active` — `transform: scale(0.98)`, 80ms transition
- `:disabled` — bone-faint text, iron-2 border, `cursor: not-allowed`, no hover effect

A skip-to-content link sits above the header (hidden by default, plasma when keyboard-focused) per the redesign-skill's strategic-omissions checklist.

## Motion & interaction

- **Page-load entrance:** hero elements fade-up 8px with 240ms ease-out, staggered 60ms apart. Below-the-fold content renders normally — no scroll-triggered reveals. Fires once per route.
- **Hover transitions:** 200ms ease-out for color/background, 160ms for transform-only.
- **Focus:** plasma 2px outline appears instantly.
- **Active:** `transform: scale(0.98)` with 80ms transition (Mindmeld's interaction speed).
- **Cursor blink:** only on the homepage hero `AVAILABLE_` status pill. 1s `steps(2)` infinite. Nowhere else sitewide.
- **Lightbox:** backdrop fades 240ms; image fades + scales 0.98 → 1.
- **Page-to-page:** standard browser navigation. No View Transitions API, no SPA shim.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables cursor blink and load fade-up, shortens transitions to 1ms.

## Content adaptation

**Carries over unchanged:**
- All `content/**/*.md` files. Existing front-matter is read by the new theme; new optional fields (`role`, `studio`, `shipped_year`, `status`) are additive.
- `assets/gallery/*` — 44 images stay where they are.
- `static/adrianmelian_resume.pdf` — becomes the canonical resume URL.

**Edited:**
- `config/_default/hugo.toml` — `theme = "am-mindmeld"`
- `config/_default/params.toml` — replaced with a smaller, theme-specific params file
- `config/_default/menus.en.toml` — flat 5-item nav + 3 socials
- `.gitmodules` — Blowfish removed
- `content/_index.md` — gains homepage hero front-matter (location, availability, currently-shipping, recent-studios)

**User-provided (Adrian) — can be backfilled in Phase 5:**
- One paragraph (~60–100 words) per project — role, what was specifically built, what shipped
- 4–6 hand-picked gallery image filenames for the bento highlights

**Generated (Claude):**
- An "AM" pixel mark SVG, ported from the Mindmeld design system's `mark-af` 16×16 pattern. Inline SVG in the header, plus a 32×32 favicon export.

## Phasing

Each phase ships a working improved site — nothing breaks at any phase boundary.

### Phase 1 — Foundation + homepage (biggest first impression)
- Theme scaffold (`themes/am-mindmeld/`)
- CSS bundle, self-hosted fonts, palette, base prose styles, grain overlay
- Header + statusbar footer
- Homepage (asymmetric split hero, recent projects zig-zag, tools rail, selected work bento)
- Pixel mark SVG, favicon
- Existing project/tool/gallery pages render with basic body styles inherited from the new theme — legible but not yet redesigned
- **Outcome:** homepage fully redesigned, rest of site looks consistent but minimal

### Phase 2 — Gallery (Adrian's stated pain point — fixed second)
- Gallery template: bento + justified masonry + lightbox
- Image preprocessing: read intrinsic dimensions for masonry, generate placeholder blur
- Lightbox with keyboard navigation
- **Outcome:** the gallery he specifically flagged is the second thing fixed

### Phase 3 — Project / tool list + detail
- List pages (`/projects/`, `/tools/`) with year-grouped zig-zag
- Detail template: terminal-frame hero, metadata strip, paragraph, variable image grid, credits panel, prev/next pager
- **Outcome:** every project page goes from "thin card" to "polished case-card"

### Phase 4 — About + contact + 404 + accessibility polish
- About page (portrait, bio, skills/tools list, experience timeline)
- Contact page (email + status block + socials)
- 404 page (`SIGNAL LOST` terminal)
- Accessibility audit: skip-link, focus-visible outlines, reduced-motion, alt text pass, color-contrast verification
- **Outcome:** every page redesigned, accessibility-clean

### Phase 5 — Cleanup
- Remove Blowfish submodule and Blowfish-specific files
- Delete old `AM_Resume_2025.pdf` once the new resume is verified live
- Per-project paragraph backfill (Adrian provides, Claude commits)
- Bento curation (Adrian flags favorites, Claude wires them up)
- Final pass: Lighthouse run, image weight audit, broken-link sweep
- **Outcome:** clean repo, no Blowfish residue, all content current

Phases 1+2 are the "stop early and the site is already much better" cutoff. Phases 3–5 raise the floor across the rest of the site.

## Non-goals

- No CMS, no admin UI, no draft workflow beyond Hugo's built-in `draft = true` front-matter
- No analytics integration in this rebuild (current Blowfish config has placeholders for Google/Fathom/Umami; we drop them — Adrian can revisit later)
- No multi-language support (Blowfish ships with i18n; we don't need it)
- No comment system, no reactions, no like buttons
- No contact form, no Formspree, no form backend
- No View Transitions API or SPA-style page transitions
- No category filters on the gallery in v1 (revisit if archive grows past ~80 images)
- No full case studies on project pages (one-paragraph summaries only)
- No dark/light theme toggle (the theme is dark by design — light mode would require a parallel palette and isn't justified for the audience)

## Open items

- Adrian's homepage front-matter values (`SHIPPING`, `RECENT`, etc.) — placeholders used in the design; final values written during Phase 1 implementation.
- The 4–6 gallery bento filenames — collected before Phase 2 starts.
- Per-project paragraph copy — written during Phase 5; templates render fine without them in earlier phases.
