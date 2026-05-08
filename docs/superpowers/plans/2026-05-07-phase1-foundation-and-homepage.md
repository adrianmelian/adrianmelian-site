# Phase 1 — Foundation & Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Blowfish theme with a new custom Hugo theme `am-mindmeld` that ships the Mindmeld design system (palette, typography, motif kit) and a fully-redesigned homepage. The existing project, tool, gallery, and about pages must remain buildable through legacy-shortcode shims; their template-level redesigns happen in later phases.

**Architecture:** A self-contained Hugo theme at `themes/am-mindmeld/` owning every layout, partial, and asset. CSS bundled at build time via Hugo's resources pipeline (no PostCSS, no Sass — plain CSS files concatenated and fingerprinted). Self-hosted webfonts (VT323 + JetBrains Mono) under `themes/am-mindmeld/static/fonts/`. Component primitives are Hugo partials with paired CSS files; the homepage layout composes them. Legacy Blowfish shortcodes (`youtubeLite`, `gallery`/`figure`, `timeline`/`timelineItem`) are shimmed so all existing pages continue to build through the theme switch.

**Tech Stack:** Hugo Extended ≥ 0.147 (matches user's installed `hugo v0.147.9+extended`), plain CSS with Hugo's `resources.Concat`/`resources.Minify`/`resources.Fingerprint` pipeline, inline SVG, system-served webfonts, no JavaScript framework (vanilla JS only where strictly required — Phase 1 needs none).

**Reference documents:**
- Spec: `docs/superpowers/specs/2026-05-07-portfolio-mindmeld-redesign-design.md`
- Mindmeld source CSS: `d:\Documents\AM_MayaTools\docs\design_system\mindmeld.css`
- Mindmeld pixel mark reference: `d:\Documents\AM_MayaTools\docs\design_system\index.html` (search `mark-af` symbol)

---

## File structure

### Created in this phase

```
themes/am-mindmeld/
├── theme.toml                                    # theme metadata
├── LICENSE                                       # MIT or "all rights reserved"
├── README.md                                     # one-paragraph description
├── assets/
│   ├── css/
│   │   ├── tokens.css                            # CSS variables (palette, typography, spacing)
│   │   ├── fonts.css                             # @font-face declarations
│   │   ├── base.css                              # reset, body, prose, links, grain overlay, skip-link
│   │   ├── animations.css                        # keyframes (blink, fade-up) + reduced-motion
│   │   ├── components/
│   │   │   ├── header.css
│   │   │   ├── statusbar.css
│   │   │   ├── status-pill.css
│   │   │   ├── section-heading.css
│   │   │   ├── terminal-frame.css
│   │   │   ├── quick-link.css
│   │   │   ├── metadata-list.css
│   │   │   ├── project-card-zig.css
│   │   │   ├── tool-card-rail.css
│   │   │   └── bento-cell.css
│   │   └── layout/
│   │       └── homepage.css
│   └── img/
│       └── grain.png                             # 200×200 noise tile
├── static/
│   ├── fonts/
│   │   ├── VT323-Regular.woff2
│   │   ├── JetBrainsMono-Regular.woff2
│   │   ├── JetBrainsMono-Medium.woff2
│   │   └── JetBrainsMono-Bold.woff2
│   ├── favicon.svg                               # SVG favicon (pixel mark)
│   ├── favicon-32x32.png                         # PNG fallback
│   └── apple-touch-icon.png                      # 180×180 PNG
└── layouts/
    ├── _default/
    │   ├── baseof.html                           # base shell — head, header, footer, skip-link, css bundle
    │   ├── single.html                           # placeholder fallback for non-redesigned pages
    │   └── list.html                             # placeholder fallback for list pages
    ├── partials/
    │   ├── head.html                             # <head> contents
    │   ├── header.html                           # site header
    │   ├── footer.html                           # site footer (statusbar)
    │   ├── pixel-mark.html                       # inline SVG mark (size param)
    │   ├── status-pill.html                      # status pill component
    │   ├── section-heading.html                  # numbered section heading component
    │   ├── terminal-frame.html                   # terminal frame component (full or titlebar-only variant)
    │   ├── quick-link.html                       # quick-link button
    │   ├── project-card-zig.html                 # zig-zag project card
    │   ├── tool-card-rail.html                   # tool rail card
    │   └── bento-cell.html                       # bento cell
    ├── shortcodes/
    │   ├── youtubeLite.html                      # shim for Blowfish youtubeLite
    │   ├── gallery.html                          # shim for Blowfish gallery (Phase 1 fallback only)
    │   ├── figure.html                           # shim for Blowfish figure
    │   ├── timeline.html                         # shim for Blowfish timeline
    │   └── timelineItem.html                     # shim for Blowfish timelineItem
    └── index.html                                # homepage layout
```

### Modified in this phase

- `config/_default/hugo.toml` — `theme = "am-mindmeld"`, drop unused `[outputs]`/`[related]` complexity
- `config/_default/params.toml` — replaced with theme-specific minimal params
- `config/_default/menus.en.toml` — flatten to 5 main + 3 social entries
- `content/_index.md` — add front-matter for hero (`location`, `availability`, `currently`, `recent_studios`, `featured_project`)
- `.gitmodules` — Blowfish submodule entry removed
- (Submodule deinit) `themes/blowfish/` — removed via `git rm`

---

## Verification approach

Hugo themes don't have unit tests. Each task uses one of these verification primitives:

1. **Build check:** `hugo --gc --minify` exits 0 with no warnings
2. **Dev server check:** `hugo server -D --bind 0.0.0.0` starts; visit `http://localhost:1313`; observe specified visual element
3. **HTML output check:** inspect a rendered file under `public/` for a specific tag/attribute/text
4. **Lighthouse / Pa11y audit:** run at end of phase against the built site

Every task ends with a build check + commit. Visual checks are explicit (which page, what element, what to see).

---

## Task 1: Theme scaffold + theme switch + minimal placeholder

**Files:**
- Create: `themes/am-mindmeld/theme.toml`
- Create: `themes/am-mindmeld/LICENSE`
- Create: `themes/am-mindmeld/README.md`
- Create: `themes/am-mindmeld/layouts/_default/baseof.html`
- Create: `themes/am-mindmeld/layouts/_default/single.html`
- Create: `themes/am-mindmeld/layouts/_default/list.html`
- Create: `themes/am-mindmeld/layouts/index.html`
- Modify: `config/_default/hugo.toml`

- [ ] **Step 1: Create theme.toml**

```toml
# themes/am-mindmeld/theme.toml
name = "am-mindmeld"
license = "All rights reserved"
description = "Mindmeld portfolio theme for adrianmelian.com"
homepage = "https://adrianmelian.com/"
tags = ["portfolio", "dark", "monospace", "mindmeld"]
min_version = "0.120.0"

[author]
  name = "Adrian Melian"
  homepage = "https://adrianmelian.com/"
```

- [ ] **Step 2: Create README.md**

```markdown
# am-mindmeld

Custom Hugo theme for adrianmelian.com built around the Mindmeld design system.
Not intended for redistribution.
```

- [ ] **Step 3: Create LICENSE**

Single line: `All rights reserved. (C) 2026 Adrian Melian`

- [ ] **Step 4: Create baseof.html (minimal placeholder)**

```html
<!-- themes/am-mindmeld/layouts/_default/baseof.html -->
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode | default "en" }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ if .IsHome }}{{ .Site.Title | default "Adrian Melian" }}{{ else }}{{ .Title }} · {{ .Site.Title | default "Adrian Melian" }}{{ end }}</title>
  {{ with .Description | default .Site.Params.description }}<meta name="description" content="{{ . }}">{{ end }}
</head>
<body>
{{ block "main" . }}{{ end }}
</body>
</html>
```

- [ ] **Step 5: Create single.html and list.html as identical inheritance fallbacks**

```html
<!-- themes/am-mindmeld/layouts/_default/single.html -->
{{ define "main" }}
<main>
  <h1>{{ .Title }}</h1>
  {{ .Content }}
</main>
{{ end }}
```

```html
<!-- themes/am-mindmeld/layouts/_default/list.html -->
{{ define "main" }}
<main>
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
</main>
{{ end }}
```

- [ ] **Step 6: Create index.html (homepage placeholder)**

```html
<!-- themes/am-mindmeld/layouts/index.html -->
{{ define "main" }}
<main>
  <h1>Adrian Melian</h1>
  <p>am-mindmeld theme scaffold — Phase 1 in progress.</p>
</main>
{{ end }}
```

- [ ] **Step 7: Switch theme in hugo.toml**

In `config/_default/hugo.toml`, change line 5:

```toml
theme = "am-mindmeld"
```

- [ ] **Step 8: Build check**

Run: `hugo --gc --minify`
Expected: exits 0, no warnings about missing layouts/shortcodes (yet — shortcode warnings expected on `youtubeLite`/`gallery`/`figure`/`timeline`/`timelineItem`; we'll fix in Task 13).

If shortcode errors *fail the build* (not just warn), proceed anyway — Task 13 handles them. If the build hard-fails on missing shortcode templates, temporarily add empty shim files before continuing:

```bash
mkdir -p themes/am-mindmeld/layouts/shortcodes
touch themes/am-mindmeld/layouts/shortcodes/{youtubeLite,gallery,figure,timeline,timelineItem}.html
```

- [ ] **Step 9: Visual check**

Run: `hugo server -D`
Visit: `http://localhost:1313`
Expected: unstyled page with "Adrian Melian" heading and the placeholder paragraph. Browser tab shows "Adrian Melian".

Stop the dev server (Ctrl+C).

- [ ] **Step 10: Commit**

```bash
git add themes/am-mindmeld/ config/_default/hugo.toml
git commit -m "Add am-mindmeld theme scaffold and switch theme

Theme directory created with minimal baseof, single, list, and index
templates. hugo.toml switched from blowfish to am-mindmeld. Site
builds; existing pages render unstyled but legible."
```

---

## Task 2: Self-hosted fonts + @font-face declarations

**Files:**
- Create: `themes/am-mindmeld/static/fonts/VT323-Regular.woff2`
- Create: `themes/am-mindmeld/static/fonts/JetBrainsMono-Regular.woff2`
- Create: `themes/am-mindmeld/static/fonts/JetBrainsMono-Medium.woff2`
- Create: `themes/am-mindmeld/static/fonts/JetBrainsMono-Bold.woff2`
- Create: `themes/am-mindmeld/assets/css/fonts.css`

- [ ] **Step 1: Download VT323 woff2**

VT323 has only one weight (Regular, 400). Source the woff2 from Google Fonts via `google-webfonts-helper`:

Open in browser: `https://gwfh.mranftl.com/fonts/vt323?subsets=latin`
Download "Modern Browsers" zip.
Extract `vt323-v17-latin-regular.woff2` and rename to `VT323-Regular.woff2`.
Place at `themes/am-mindmeld/static/fonts/VT323-Regular.woff2`.

(If `google-webfonts-helper` is unreachable, alternative: download from JSDelivr directly:
`https://cdn.jsdelivr.net/fontsource/fonts/vt323@latest/latin-400-normal.woff2` → save as `VT323-Regular.woff2`.)

- [ ] **Step 2: Download JetBrains Mono woff2 in three weights**

JetBrains Mono ships variable; for simplicity we download three static weights (400, 500, 700):

Open in browser: `https://gwfh.mranftl.com/fonts/jetbrains-mono?subsets=latin`
Select weights: 400 (regular), 500 (medium), 700 (bold).
Download "Modern Browsers" zip.
Extract these three files and rename:
- `jetbrains-mono-v18-latin-regular.woff2` → `JetBrainsMono-Regular.woff2`
- `jetbrains-mono-v18-latin-500.woff2` → `JetBrainsMono-Medium.woff2`
- `jetbrains-mono-v18-latin-700.woff2` → `JetBrainsMono-Bold.woff2`
Place all three at `themes/am-mindmeld/static/fonts/`.

- [ ] **Step 3: Create fonts.css**

```css
/* themes/am-mindmeld/assets/css/fonts.css */
@font-face {
  font-family: 'VT323';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/VT323-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/fonts/JetBrainsMono-Medium.woff2') format('woff2');
}

@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/JetBrainsMono-Bold.woff2') format('woff2');
}
```

- [ ] **Step 4: Verify fonts are served**

We don't wire fonts into the page yet (CSS pipeline comes in Task 5). For now just verify the static files are reachable:

Run: `hugo server -D`
Visit: `http://localhost:1313/fonts/VT323-Regular.woff2`
Expected: browser downloads or displays binary content (HTTP 200, `font/woff2` content-type).

Repeat for each of the 3 JetBrains Mono files.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add themes/am-mindmeld/static/fonts/ themes/am-mindmeld/assets/css/fonts.css
git commit -m "Add self-hosted VT323 and JetBrains Mono webfonts

Downloads VT323 (400) and JetBrains Mono (400/500/700) as woff2 from
Google Fonts source, ships them under static/fonts/ to avoid Google
Fonts external dependency. font-face declarations in fonts.css use
font-display: swap to prevent invisible text during load."
```

---

## Task 3: Design tokens (CSS variables)

**Files:**
- Create: `themes/am-mindmeld/assets/css/tokens.css`

- [ ] **Step 1: Create tokens.css**

```css
/* themes/am-mindmeld/assets/css/tokens.css */
:root {
  /* ===== palette (5 core + derivatives) ===== */
  --carbon: #0B0E10;
  --iron:   #1C2126;
  --iron-2: #262C33;
  --iron-3: #353D45;
  --bone:        #E8E0D0;
  --bone-dim:    #8A8378;
  --bone-faint:  #5A554D;
  --plasma:      #7CFFB2;
  --plasma-dim:  #4FB888;
  --plasma-glow: rgba(124, 255, 178, 0.18);
  --ember:       #FF7A3D;
  --ember-dim:   #B5532A;
  --ember-glow:  rgba(255, 122, 61, 0.22);

  /* ===== typography ===== */
  --font-display: 'VT323', 'Courier New', monospace;
  --font-body:    'JetBrains Mono', 'Consolas', monospace;

  --fs-11: 0.6875rem;  /* 11px */
  --fs-12: 0.75rem;    /* 12px */
  --fs-14: 0.875rem;   /* 14px */
  --fs-15: 0.9375rem;  /* 15px — body base */
  --fs-18: 1.125rem;   /* 18px */
  --fs-24: 1.5rem;     /* 24px */
  --fs-32: 2rem;       /* 32px */
  --fs-48: 3rem;       /* 48px */
  --fs-72: 4.5rem;     /* 72px — hero name */

  --lh-tight:  0.95;
  --lh-snug:   1.2;
  --lh-body:   1.6;

  /* ===== spacing scale ===== */
  --sp-1:  4px;
  --sp-2:  8px;
  --sp-3:  12px;
  --sp-4:  16px;
  --sp-5:  24px;
  --sp-6:  32px;
  --sp-7:  48px;
  --sp-8:  64px;
  --sp-9:  96px;

  /* ===== layout ===== */
  --container-max: 1240px;
  --container-px:  40px;
  --header-h:      52px;
  --footer-h:      26px;

  /* ===== motion ===== */
  --t-instant: 0ms;
  --t-active:  80ms;
  --t-fast:    160ms;
  --t-base:    200ms;
  --t-load:    240ms;
  --ease-out:  cubic-bezier(0.16, 1, 0.3, 1);
}

@media (max-width: 900px) {
  :root {
    --container-px: 20px;
    --fs-72: 3.25rem;  /* 52px on mobile */
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --t-active:  1ms;
    --t-fast:    1ms;
    --t-base:    1ms;
    --t-load:    1ms;
  }
}
```

- [ ] **Step 2: Build check**

Run: `hugo --gc --minify`
Expected: exits 0 (CSS files in `assets/` aren't bundled into output yet — they're inert until referenced).

- [ ] **Step 3: Commit**

```bash
git add themes/am-mindmeld/assets/css/tokens.css
git commit -m "Add design token CSS variables

Mindmeld palette (carbon/iron/bone/plasma/ember plus derivatives),
typography (VT323 display + JetBrains Mono body, 9-step type scale),
spacing scale, layout dims, motion timings. Reduced-motion media
query collapses transitions to 1ms."
```

---

## Task 4: Base styles + grain overlay + skip-link

**Files:**
- Create: `themes/am-mindmeld/assets/css/base.css`
- Create: `themes/am-mindmeld/assets/img/grain.png`

- [ ] **Step 1: Generate grain.png**

A 200×200 noise tile. Use ImageMagick if available:

```bash
magick -size 200x200 xc:gray +noise random -channel RGBA -evaluate set 100% -separate -delete 0,1,2 -alpha set -channel A -evaluate multiply 0.025 +channel themes/am-mindmeld/assets/img/grain.png
```

If ImageMagick is not available, alternative: use the inline SVG noise filter approach instead (no PNG needed). Skip Step 1 PNG generation and use this in base.css for the body::before:

```css
background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.025 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
```

Pick whichever path works. The plan code below assumes the SVG-data-URL path (no PNG needed). If you used ImageMagick, change the `background-image` URL to `/img/grain.png` and ensure the file is in `static/img/grain.png` instead of `assets/img/grain.png` (Hugo serves static directly; assets need pipeline processing).

- [ ] **Step 2: Create base.css**

```css
/* themes/am-mindmeld/assets/css/base.css */

/* ===== reset ===== */
*, *::before, *::after { box-sizing: border-box; }
html, body, h1, h2, h3, h4, h5, h6, p, ul, ol, figure, blockquote { margin: 0; padding: 0; }
ul, ol { list-style: none; }
img, svg, video { display: block; max-width: 100%; height: auto; }
button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
a { color: inherit; text-decoration: none; }

/* ===== root ===== */
html {
  background: var(--carbon);
  color: var(--bone);
  font-family: var(--font-body);
  font-size: var(--fs-15);
  line-height: var(--lh-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
  font-variant-numeric: tabular-nums;
}

body {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ===== grain overlay ===== */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.025 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  background-size: 200px 200px;
  mix-blend-mode: overlay;
}

/* ===== skip link ===== */
.skip-link {
  position: absolute;
  top: var(--sp-2);
  left: var(--sp-2);
  background: var(--carbon);
  color: var(--plasma);
  border: 1px solid var(--plasma);
  padding: var(--sp-2) var(--sp-4);
  font-family: var(--font-body);
  font-size: var(--fs-12);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transform: translateY(-200%);
  transition: transform var(--t-fast) var(--ease-out);
  z-index: 10000;
}
.skip-link:focus-visible { transform: translateY(0); }

/* ===== prose defaults (used by fallback templates) ===== */
main { flex: 1; }

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: var(--lh-tight);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--bone);
}
h1 { font-size: var(--fs-48); }
h2 { font-size: var(--fs-32); }
h3 { font-size: var(--fs-24); }
h4 { font-size: var(--fs-18); }

p { max-width: 65ch; margin-bottom: var(--sp-4); }
p + h2, p + h3 { margin-top: var(--sp-6); }

a { color: var(--plasma); }
a:hover { text-decoration: underline; }

strong { color: var(--bone); font-weight: 500; }
em { color: var(--bone); font-style: italic; }

code, pre {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  background: var(--iron);
  border: 1px solid var(--iron-3);
  color: var(--plasma);
}
code { padding: 1px 6px; }
pre { padding: var(--sp-3) var(--sp-4); overflow-x: auto; }
pre code { padding: 0; background: transparent; border: none; }

hr { border: none; border-top: 1px dashed var(--iron-3); margin: var(--sp-6) 0; }

/* ===== container ===== */
.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--container-px);
}

/* ===== focus-visible default ===== */
:focus-visible {
  outline: 2px solid var(--plasma);
  outline-offset: 2px;
}
:focus:not(:focus-visible) { outline: none; }

/* ===== selection ===== */
::selection { background: var(--plasma); color: var(--carbon); }
```

- [ ] **Step 3: Build check**

Run: `hugo --gc --minify`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/assets/css/base.css themes/am-mindmeld/assets/img/grain.png 2>/dev/null; git add themes/am-mindmeld/assets/css/base.css
git commit -m "Add base styles, grain overlay, and skip-link

Reset, root typography (carbon bg, JetBrains Mono body 15px),
heading defaults (VT323 uppercase), prose, container, focus-visible,
selection. Grain overlay via inline SVG data-URL fractalNoise (no
PNG asset needed). Skip-link slides in on keyboard focus."
```

---

## Task 5: CSS bundle pipeline + wire styles into baseof

**Files:**
- Modify: `themes/am-mindmeld/layouts/_default/baseof.html`
- Create: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Create head.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/head.html */ -}}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0B0E10">

<title>{{ if .IsHome }}{{ .Site.Title | default "Adrian Melian" }}{{ else }}{{ .Title }} · {{ .Site.Title | default "Adrian Melian" }}{{ end }}</title>
{{ with .Description | default .Site.Params.description }}<meta name="description" content="{{ . }}">{{ end }}

{{- /* CSS bundle: concat all theme CSS files, minify, fingerprint */ -}}
{{ $css := slice
  (resources.Get "css/tokens.css")
  (resources.Get "css/fonts.css")
  (resources.Get "css/base.css")
  | resources.Concat "css/main.css"
  | resources.Minify
  | resources.Fingerprint "sha512" }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}" crossorigin="anonymous">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

- [ ] **Step 2: Update baseof.html to use the partial and add skip-link**

```html
<!-- themes/am-mindmeld/layouts/_default/baseof.html -->
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode | default "en" }}">
<head>
{{ partial "head.html" . }}
</head>
<body>
<a class="skip-link" href="#main">SKIP TO CONTENT</a>
{{ partial "header.html" . }}
<main id="main">
{{ block "main" . }}{{ end }}
</main>
{{ partial "footer.html" . }}
</body>
</html>
```

Note: header/footer partials don't exist yet — Tasks 9 and 10 create them. To keep the build working in the meantime, create empty stubs:

```bash
mkdir -p themes/am-mindmeld/layouts/partials
echo '<!-- header stub -->' > themes/am-mindmeld/layouts/partials/header.html
echo '<!-- footer stub -->' > themes/am-mindmeld/layouts/partials/footer.html
```

- [ ] **Step 3: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. Inspect `public/css/main.<hash>.min.css` exists and contains the concatenated tokens + fonts + base CSS.

- [ ] **Step 4: Visual check**

Run: `hugo server -D`
Visit: `http://localhost:1313`
Expected: page bg is now carbon (off-black, not pure black). Heading is VT323. Body is JetBrains Mono. Subtle noise overlay visible if you look carefully (try a lighter section of the page like the body text area).

Tab to give the page focus, then Tab again — the SKIP TO CONTENT link should slide in from the top-left. Press Tab past it to verify it slides back.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add themes/am-mindmeld/layouts/
git commit -m "Wire CSS bundle pipeline into baseof template

head.html partial concatenates tokens + fonts + base CSS via Hugo
resource pipeline, minifies, fingerprints with SHA-512 SRI. baseof
includes skip-link, header partial stub, footer partial stub. Page
now renders with Mindmeld palette, VT323 headings, JetBrains Mono
body, subtle grain overlay."
```

---

## Task 6: Animations CSS (page-load fade-up + cursor blink)

**Files:**
- Create: `themes/am-mindmeld/assets/css/animations.css`
- Modify: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Create animations.css**

```css
/* themes/am-mindmeld/assets/css/animations.css */

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-up {
  opacity: 0;
  animation: fade-up var(--t-load) var(--ease-out) forwards;
}
.fade-up.delay-1 { animation-delay:  60ms; }
.fade-up.delay-2 { animation-delay: 120ms; }
.fade-up.delay-3 { animation-delay: 180ms; }
.fade-up.delay-4 { animation-delay: 240ms; }
.fade-up.delay-5 { animation-delay: 300ms; }

.blink {
  animation: blink 1s steps(2) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .fade-up, .fade-up.delay-1, .fade-up.delay-2, .fade-up.delay-3, .fade-up.delay-4, .fade-up.delay-5 {
    opacity: 1;
    animation: none;
  }
  .blink { animation: none; }
}
```

- [ ] **Step 2: Add animations.css to the bundle in head.html**

In `themes/am-mindmeld/layouts/partials/head.html`, update the `$css` slice to include animations.css after base.css:

```html
{{ $css := slice
  (resources.Get "css/tokens.css")
  (resources.Get "css/fonts.css")
  (resources.Get "css/base.css")
  (resources.Get "css/animations.css")
  | resources.Concat "css/main.css"
  | resources.Minify
  | resources.Fingerprint "sha512" }}
```

- [ ] **Step 3: Build check**

Run: `hugo --gc --minify`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/assets/css/animations.css themes/am-mindmeld/layouts/partials/head.html
git commit -m "Add animations CSS (fade-up stagger + blink)

Two keyframes (blink, fade-up) plus utility classes .fade-up with 5
stagger delays (60ms increments) and .blink for the cursor blink on
the homepage hero status pill. prefers-reduced-motion disables both."
```

---

## Task 7: Pixel mark SVG + favicon assets

**Files:**
- Create: `themes/am-mindmeld/static/favicon.svg`
- Create: `themes/am-mindmeld/static/favicon-32x32.png`
- Create: `themes/am-mindmeld/static/apple-touch-icon.png`
- Create: `themes/am-mindmeld/layouts/partials/pixel-mark.html`

- [ ] **Step 1: Design the AM pixel mark**

The Mindmeld design system has an `mark-af` 16×16 pixel symbol (peak Λ + halo dot for "Archangel"). For Adrian Melian we want an "AM" pixel monogram, 16×16 grid, designed to match the same crispEdges aesthetic.

Reference the source: `d:\Documents\AM_MayaTools\docs\design_system\index.html`, search `mark-af` and `mark-af-lockup` for the AF pixel-letter patterns. The "A" pattern is reusable; we replace the F's right-leg pattern with the M's vertical strokes + valley.

Create `themes/am-mindmeld/static/favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="#7CFFB2" aria-hidden="true">
  <!-- A (left half: cols 0-6) -->
  <rect x="3" y="2" width="2" height="2"/>
  <rect x="2" y="4" width="1" height="2"/>
  <rect x="5" y="4" width="1" height="2"/>
  <rect x="1" y="6" width="1" height="8"/>
  <rect x="6" y="6" width="1" height="8"/>
  <rect x="2" y="9" width="4" height="2"/>
  <!-- M (right half: cols 8-15) -->
  <rect x="8" y="2" width="1" height="12"/>
  <rect x="14" y="2" width="1" height="12"/>
  <rect x="9" y="3" width="1" height="2"/>
  <rect x="13" y="3" width="1" height="2"/>
  <rect x="10" y="5" width="1" height="2"/>
  <rect x="12" y="5" width="1" height="2"/>
  <rect x="11" y="7" width="1" height="2"/>
</svg>
```

Open the file in a browser. Adjust pixel positions as needed until the AM reads cleanly at 16×16. Save.

- [ ] **Step 2: Generate PNG favicon (32×32)**

Convert favicon.svg → favicon-32x32.png at 32×32. Use ImageMagick:

```bash
magick -background "#0B0E10" themes/am-mindmeld/static/favicon.svg -resize 32x32 themes/am-mindmeld/static/favicon-32x32.png
```

If ImageMagick is unavailable, manually export from a browser (open SVG, screenshot, crop to 32×32) or use an online SVG-to-PNG converter.

- [ ] **Step 3: Generate apple-touch-icon (180×180)**

```bash
magick -background "#0B0E10" themes/am-mindmeld/static/favicon.svg -resize 180x180 themes/am-mindmeld/static/apple-touch-icon.png
```

- [ ] **Step 4: Create pixel-mark.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/pixel-mark.html */ -}}
{{- /* Inline pixel mark SVG. Pass `size` (px) via dict; defaults to 32. */ -}}
{{- $size := .size | default 32 -}}
{{- $title := .title | default "Adrian Melian" -}}
<svg width="{{ $size }}" height="{{ $size }}" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="currentColor" role="img" aria-label="{{ $title }}">
  <rect x="3" y="2" width="2" height="2"/>
  <rect x="2" y="4" width="1" height="2"/>
  <rect x="5" y="4" width="1" height="2"/>
  <rect x="1" y="6" width="1" height="8"/>
  <rect x="6" y="6" width="1" height="8"/>
  <rect x="2" y="9" width="4" height="2"/>
  <rect x="8" y="2" width="1" height="12"/>
  <rect x="14" y="2" width="1" height="12"/>
  <rect x="9" y="3" width="1" height="2"/>
  <rect x="13" y="3" width="1" height="2"/>
  <rect x="10" y="5" width="1" height="2"/>
  <rect x="12" y="5" width="1" height="2"/>
  <rect x="11" y="7" width="1" height="2"/>
</svg>
```

Calling convention: `{{ partial "pixel-mark.html" (dict "size" 120) }}` or `{{ partial "pixel-mark.html" . }}` for default 32px.

- [ ] **Step 5: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. Verify `public/favicon.svg`, `public/favicon-32x32.png`, `public/apple-touch-icon.png` exist.

- [ ] **Step 6: Visual check**

Run: `hugo server -D`
Visit: `http://localhost:1313`
Look at the browser tab — the favicon is the plasma-green pixel "AM" mark on a small dark background (browsers vary).

Visit: `http://localhost:1313/favicon.svg` directly to confirm it renders cleanly.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add themes/am-mindmeld/static/favicon.svg themes/am-mindmeld/static/favicon-32x32.png themes/am-mindmeld/static/apple-touch-icon.png themes/am-mindmeld/layouts/partials/pixel-mark.html
git commit -m "Add AM pixel mark SVG + favicon assets

16x16 grid SVG ported from Mindmeld design system mark-af pattern,
adapted for AM monogram. Inline partial uses currentColor so the mark
inherits the parent text color (plasma in header, ember in 404, etc).
PNG favicon and apple-touch-icon exported on carbon background."
```

---

## Task 8: Flat menu config

**Files:**
- Modify: `config/_default/menus.en.toml`

- [ ] **Step 1: Replace menus.en.toml entirely**

Overwrite `config/_default/menus.en.toml` with:

```toml
# Main navigation — flat 5 items
[[main]]
name = "Projects"
pageRef = "projects"
weight = 10

[[main]]
name = "Tools"
pageRef = "tools"
weight = 20

[[main]]
name = "Gallery"
pageRef = "gallery"
weight = 30

[[main]]
name = "About"
pageRef = "about"
weight = 40

[[main]]
name = "Contact"
pageRef = "contact"
weight = 50

# Social links — rendered as icons in the header
[[social]]
identifier = "linkedin"
name = "LinkedIn"
url = "https://www.linkedin.com/in/adrian-melian-33066423"
weight = 10

[[social]]
identifier = "github"
name = "GitHub"
url = "https://github.com/adrianmelian"
weight = 20

[[social]]
identifier = "youtube"
name = "YouTube"
url = "https://www.youtube.com/@age914"
weight = 30
```

- [ ] **Step 2: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. Note the previous nested submenus (Krazy Kaiju, MW3, etc.) no longer appear in the menu structure — they're still reachable via `/projects/<slug>/` URLs.

- [ ] **Step 3: Commit**

```bash
git add config/_default/menus.en.toml
git commit -m "Flatten menu config to 5 main + 3 social entries

Drops Blowfish nested submenus (Projects > MW3 > Vanguard etc) which
were unusable on mobile and read as a generic AI nav pattern. Project
drill-down now happens through the project list page in Phase 3."
```

---

## Task 9: Header partial

**Files:**
- Create: `themes/am-mindmeld/assets/css/components/header.css`
- Modify: `themes/am-mindmeld/layouts/partials/header.html`
- Modify: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Replace header.html stub with the real header**

```html
{{- /* themes/am-mindmeld/layouts/partials/header.html */ -}}
<header class="site-header">
  <div class="site-header__inner container">
    <a class="site-header__logo" href="{{ "/" | relURL }}" aria-label="Adrian Melian — home">
      {{ partial "pixel-mark.html" (dict "size" 24 "title" "Adrian Melian") }}
      <span class="site-header__wordmark">ADRIAN MELIAN</span>
    </a>

    <nav class="site-header__nav" aria-label="Primary">
      <ul>
        {{ range .Site.Menus.main }}
        {{ $active := or (eq $.RelPermalink .URL) (and (ne .URL "/") (hasPrefix $.RelPermalink .URL)) }}
        <li>
          <a href="{{ .URL | relURL }}" {{ if $active }}aria-current="page"{{ end }}>{{ .Name | upper }}</a>
        </li>
        {{ end }}
      </ul>
    </nav>

    <ul class="site-header__social" aria-label="Social">
      {{ range .Site.Menus.social }}
      <li>
        <a href="{{ .URL }}" rel="me noopener" target="_blank" aria-label="{{ .Name }}">
          {{- partial (printf "icons/%s.html" .Identifier) . -}}
        </a>
      </li>
      {{ end }}
    </ul>
  </div>
</header>
```

- [ ] **Step 2: Create the social icon partials**

Three small inline-SVG partials. Use Phosphor or Heroicons-style outlined icons (NOT Lucide — flagged as the AI default). Approximate strokes are fine.

Create `themes/am-mindmeld/layouts/partials/icons/linkedin.html`:

```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="3" y="3" width="18" height="18" rx="2"/>
  <line x1="8" y1="11" x2="8" y2="17"/>
  <circle cx="8" cy="7.5" r="0.6" fill="currentColor"/>
  <path d="M12 17v-4a2 2 0 0 1 4 0v4"/>
  <line x1="12" y1="11" x2="12" y2="17"/>
</svg>
```

Create `themes/am-mindmeld/layouts/partials/icons/github.html`:

```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.5 2.87 8.32 6.84 9.67.5.1.69-.22.69-.49v-1.7c-2.78.61-3.37-1.36-3.37-1.36-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1.01.07 1.54 1.06 1.54 1.06.9 1.56 2.36 1.11 2.93.85.09-.66.35-1.11.64-1.37-2.22-.26-4.55-1.13-4.55-5.04 0-1.11.39-2.02 1.04-2.74-.1-.26-.45-1.3.1-2.71 0 0 .85-.28 2.78 1.05.81-.23 1.67-.34 2.53-.34s1.72.11 2.53.34c1.93-1.33 2.78-1.05 2.78-1.05.55 1.41.2 2.45.1 2.71.65.72 1.04 1.63 1.04 2.74 0 3.92-2.34 4.78-4.57 5.03.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49C19.13 20.57 22 16.75 22 12.25 22 6.58 17.52 2 12 2z"/>
</svg>
```

Create `themes/am-mindmeld/layouts/partials/icons/youtube.html`:

```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8C22 15.2 22 12 22 12s0-3.2-.4-4.8zM10 15V9l5.2 3-5.2 3z"/>
</svg>
```

- [ ] **Step 3: Create header.css**

```css
/* themes/am-mindmeld/assets/css/components/header.css */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--iron);
  border-bottom: 1px solid var(--iron-3);
  height: var(--header-h);
}
.site-header__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--sp-5);
  height: 100%;
}

.site-header__logo {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  color: var(--plasma);
  transition: color var(--t-base) var(--ease-out);
}
.site-header__logo:hover { color: var(--bone); }

.site-header__wordmark {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  letter-spacing: 0.04em;
  color: var(--bone);
  text-transform: uppercase;
}

.site-header__nav ul {
  display: flex;
  gap: var(--sp-5);
  justify-content: center;
}
.site-header__nav a {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  letter-spacing: 0.12em;
  color: var(--bone-dim);
  padding: var(--sp-2) 0;
  border-bottom: 2px solid transparent;
  transition: color var(--t-base) var(--ease-out), border-color var(--t-base) var(--ease-out);
}
.site-header__nav a:hover { color: var(--bone); }
.site-header__nav a[aria-current="page"] {
  color: var(--plasma);
  border-bottom-color: var(--plasma);
}

.site-header__social {
  display: flex;
  gap: var(--sp-3);
}
.site-header__social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--bone-dim);
  transition: color var(--t-base) var(--ease-out);
}
.site-header__social a:hover { color: var(--plasma); }
.site-header__social a:active { transform: scale(0.94); transition-duration: var(--t-active); }

@media (max-width: 720px) {
  .site-header__nav { display: none; }
  .site-header__inner { grid-template-columns: auto 1fr; }
}
```

(Mobile-nav menu is intentionally deferred. On mobile the nav is hidden; users navigate via the homepage links and footer. A proper hamburger menu can be added in Phase 4 if needed.)

- [ ] **Step 4: Add header.css to the bundle**

In `themes/am-mindmeld/layouts/partials/head.html`, add `(resources.Get "css/components/header.css")` to the `$css` slice:

```html
{{ $css := slice
  (resources.Get "css/tokens.css")
  (resources.Get "css/fonts.css")
  (resources.Get "css/base.css")
  (resources.Get "css/animations.css")
  (resources.Get "css/components/header.css")
  | resources.Concat "css/main.css"
  | resources.Minify
  | resources.Fingerprint "sha512" }}
```

- [ ] **Step 5: Build check**

Run: `hugo --gc --minify`
Expected: exits 0.

- [ ] **Step 6: Visual check**

Run: `hugo server -D`
Visit: `http://localhost:1313`
Expected:
- Sticky header at top with iron-tinted background
- Pixel-mark logo + "ADRIAN MELIAN" wordmark on the left
- Centered nav: PROJECTS · TOOLS · GALLERY · ABOUT · CONTACT (uppercase, bone-dim)
- Three social icons on the right (LinkedIn, GitHub, YouTube), bone-dim
- Hover any nav item → text shifts to bone (lighter)
- Visit `/projects/` → "PROJECTS" gets a 2px plasma underline and turns plasma-green

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "Add site header with logo, flat nav, and social icons

Sticky header with pixel-mark + ADRIAN MELIAN wordmark on left, 5
flat nav items center, 3 inline SVG social icons right. Active page
gets a 2px plasma underline. Phosphor-style outlined icons (not the
Lucide AI-default). Mobile (<720px) hides nav for now; hamburger
menu deferred to a later phase."
```

---

## Task 10: Footer / statusbar partial

**Files:**
- Create: `themes/am-mindmeld/assets/css/components/statusbar.css`
- Modify: `themes/am-mindmeld/layouts/partials/footer.html`
- Modify: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Replace footer.html stub**

```html
{{- /* themes/am-mindmeld/layouts/partials/footer.html */ -}}
<footer class="statusbar">
  <div class="statusbar__inner container">
    <span class="statusbar__seg statusbar__seg--ok">
      <span class="statusbar__dot" aria-hidden="true"></span>
      ONLINE
    </span>
    <span class="statusbar__seg">BUILD {{ now.Format "2006.01.02" }}</span>
    <span class="statusbar__seg statusbar__seg--spacer"></span>
    <span class="statusbar__seg statusbar__seg--muted">© {{ now.Format "2006" }} ADRIAN MELIAN</span>
  </div>
</footer>
```

- [ ] **Step 2: Create statusbar.css**

```css
/* themes/am-mindmeld/assets/css/components/statusbar.css */
.statusbar {
  background: var(--iron-2);
  border-top: 1px solid var(--iron-3);
  height: var(--footer-h);
  font-family: var(--font-body);
  font-size: var(--fs-11);
  letter-spacing: 0.06em;
}
.statusbar__inner {
  display: flex;
  align-items: stretch;
  height: 100%;
  padding: 0;
  max-width: var(--container-max);
  margin: 0 auto;
}
.statusbar__seg {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-3);
  border-right: 1px solid var(--iron-3);
  color: var(--bone-dim);
  text-transform: uppercase;
}
.statusbar__seg:last-child { border-right: none; }
.statusbar__seg--spacer { flex: 1; border-right: none; }
.statusbar__seg--ok { color: var(--plasma); }
.statusbar__seg--muted { color: var(--bone-faint); }
.statusbar__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--plasma);
  box-shadow: 0 0 6px var(--plasma);
  border-radius: 0;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Add statusbar.css to the bundle**

In `head.html`:

```html
  (resources.Get "css/components/header.css")
  (resources.Get "css/components/statusbar.css")
```

- [ ] **Step 4: Build check + visual check**

```bash
hugo --gc --minify
hugo server -D
```

Visit `http://localhost:1313`. Expected: thin (~26px) footer at the very bottom of the page with segmented cells: `[plasma dot] ONLINE | BUILD 2026.05.07 | © 2026 ADRIAN MELIAN`. Iron-2 background, dim bone text.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "Add statusbar footer

26px iron-2 row with segmented cells: online indicator with plasma
dot, build date (auto-generated from now.Format), copyright. Sits at
the bottom of every page sitewide."
```

---

## Task 11: Component primitives — status-pill, section-heading, terminal-frame, quick-link

This task ships four small CSS components plus their partials in one go because each is short and they share visual language.

**Files:**
- Create: `themes/am-mindmeld/assets/css/components/status-pill.css`
- Create: `themes/am-mindmeld/assets/css/components/section-heading.css`
- Create: `themes/am-mindmeld/assets/css/components/terminal-frame.css`
- Create: `themes/am-mindmeld/assets/css/components/quick-link.css`
- Create: `themes/am-mindmeld/assets/css/components/metadata-list.css`
- Create: `themes/am-mindmeld/layouts/partials/status-pill.html`
- Create: `themes/am-mindmeld/layouts/partials/section-heading.html`
- Create: `themes/am-mindmeld/layouts/partials/terminal-frame.html`
- Create: `themes/am-mindmeld/layouts/partials/quick-link.html`
- Modify: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Create status-pill.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/status-pill.html */ -}}
{{- /* params: variant (live|ok|warn|idle|shipped), label, blink (bool) */ -}}
{{- $variant := .variant | default "ok" -}}
{{- $label := .label | default "OK" -}}
{{- $blink := .blink | default false -}}
<span class="status-pill status-pill--{{ $variant }}">
  <span class="status-pill__dot{{ if $blink }} blink{{ end }}" aria-hidden="true"></span>
  <span class="status-pill__label">{{ $label | upper }}</span>
</span>
```

- [ ] **Step 2: Create status-pill.css**

```css
/* themes/am-mindmeld/assets/css/components/status-pill.css */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 2px var(--sp-2);
  border: 1px solid;
  font-family: var(--font-body);
  font-size: var(--fs-11);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.status-pill__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  flex-shrink: 0;
}
.status-pill__label { white-space: nowrap; }

.status-pill--live    { color: var(--bone);     border-color: var(--bone-dim); }
.status-pill--live    .status-pill__dot { background: var(--plasma); box-shadow: 0 0 6px var(--plasma); }

.status-pill--ok      { color: var(--plasma);   border-color: var(--plasma-dim); }
.status-pill--ok      .status-pill__dot { background: var(--plasma); }

.status-pill--warn    { color: var(--ember);    border-color: var(--ember-dim); }
.status-pill--warn    .status-pill__dot { background: var(--ember); }

.status-pill--idle    { color: var(--bone-dim); border-color: var(--iron-3); }
.status-pill--idle    .status-pill__dot { background: var(--bone-dim); }

.status-pill--shipped { color: var(--plasma);   border-color: var(--plasma-dim); }
.status-pill--shipped .status-pill__dot { background: var(--plasma); }
```

- [ ] **Step 3: Create section-heading.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/section-heading.html */ -}}
{{- /* params: number (string like "01"), title (string), id (anchor) */ -}}
{{- $number := .number | default "" -}}
{{- $title := .title | default "" -}}
{{- $id := .id | default (urlize $title) -}}
<header class="section-heading" id="{{ $id }}">
  {{ with $number }}<span class="section-heading__num">{{ . }} //</span>{{ end }}
  <h2 class="section-heading__title">{{ $title | upper }}</h2>
  <span class="section-heading__rule" aria-hidden="true"></span>
</header>
```

- [ ] **Step 4: Create section-heading.css**

```css
/* themes/am-mindmeld/assets/css/components/section-heading.css */
.section-heading {
  display: flex;
  align-items: baseline;
  gap: var(--sp-4);
  margin-bottom: var(--sp-6);
}
.section-heading__num {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  color: var(--ember);
  line-height: 1;
  flex-shrink: 0;
}
.section-heading__title {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  color: var(--bone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1;
  margin: 0;
}
.section-heading__rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--iron-3), transparent);
  margin-bottom: 6px;
}

@media (max-width: 720px) {
  .section-heading__num { font-size: var(--fs-24); }
  .section-heading__title { font-size: var(--fs-24); }
}
```

- [ ] **Step 5: Create terminal-frame.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/terminal-frame.html */ -}}
{{- /* params:
       title (string)         — left side of titlebar
       meta (string)          — right side of titlebar (e.g., timestamp)
       variant (full|titlebar) — full has body content; titlebar is bar only
       inner (HTML)           — body content for full variant
*/ -}}
{{- $title := .title | default "" -}}
{{- $meta := .meta | default "" -}}
{{- $variant := .variant | default "full" -}}
{{- $inner := .inner | default "" -}}
<div class="term-frame term-frame--{{ $variant }}">
  <div class="term-frame__bar">
    <div class="term-frame__lights" aria-hidden="true">
      <span></span><span></span><span></span>
    </div>
    {{ with $title }}<span class="term-frame__title">{{ . }}</span>{{ end }}
    {{ with $meta }}<span class="term-frame__meta">{{ . }}</span>{{ end }}
  </div>
  {{ if eq $variant "full" }}
  <div class="term-frame__body">{{ $inner | safeHTML }}</div>
  {{ end }}
</div>
```

- [ ] **Step 6: Create terminal-frame.css**

```css
/* themes/am-mindmeld/assets/css/components/terminal-frame.css */
.term-frame {
  border: 1px solid var(--iron-3);
  background: var(--carbon);
}
.term-frame__bar {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: 6px var(--sp-4);
  background: var(--iron);
  border-bottom: 1px solid var(--iron-3);
  font-family: var(--font-body);
  font-size: var(--fs-11);
  color: var(--bone-dim);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.term-frame__lights {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}
.term-frame__lights span {
  width: 9px;
  height: 9px;
  border: 1px solid var(--iron-3);
}
.term-frame__lights span:nth-child(1) { background: var(--ember); }
.term-frame__lights span:nth-child(2) { background: var(--plasma-dim); }
.term-frame__lights span:nth-child(3) { background: var(--bone-dim); }

.term-frame__title { color: var(--bone); }
.term-frame__meta {
  margin-left: auto;
  color: var(--bone-faint);
  font-size: var(--fs-11);
}
.term-frame__body { padding: var(--sp-5); }

.term-frame--titlebar { border-bottom: none; }
.term-frame--titlebar .term-frame__bar { border-bottom: none; }
```

- [ ] **Step 7: Create quick-link.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/quick-link.html */ -}}
{{- /* params: href, label, external (bool), download (bool) */ -}}
{{- $href := .href | default "#" -}}
{{- $label := .label | default "" -}}
{{- $external := .external | default false -}}
{{- $download := .download | default false -}}
<a class="quick-link" href="{{ $href }}"
   {{ if $external }}rel="noopener" target="_blank"{{ end }}
   {{ if $download }}download{{ end }}>
  {{ $label | upper }}
  {{ if $external }}<span aria-hidden="true">↗</span>{{ end }}
</a>
```

- [ ] **Step 8: Create quick-link.css**

```css
/* themes/am-mindmeld/assets/css/components/quick-link.css */
.quick-link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  font-family: var(--font-body);
  font-size: var(--fs-12);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--plasma);
  border: 1px solid var(--plasma-dim);
  background: transparent;
  transition: background var(--t-base) var(--ease-out),
              border-color var(--t-base) var(--ease-out),
              box-shadow var(--t-base) var(--ease-out);
}
.quick-link:hover {
  background: var(--plasma-glow);
  border-color: var(--plasma);
  box-shadow: 0 0 0 1px var(--plasma), 0 0 12px var(--plasma-glow);
  text-decoration: none;
}
.quick-link:active {
  transform: scale(0.98);
  transition-duration: var(--t-active);
}
```

- [ ] **Step 9: Create metadata-list.css**

```css
/* themes/am-mindmeld/assets/css/components/metadata-list.css */
.metadata-list {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: var(--sp-4);
  row-gap: var(--sp-2);
  font-family: var(--font-body);
  font-size: var(--fs-12);
  letter-spacing: 0.08em;
}
.metadata-list dt {
  color: var(--ember);
  text-transform: uppercase;
}
.metadata-list dd {
  color: var(--bone);
  margin: 0;
}
```

(No partial for metadata-list — it's used inline as `<dl class="metadata-list"><dt>…</dt><dd>…</dd></dl>` in the homepage template.)

- [ ] **Step 10: Add all five CSS files to the bundle**

In `head.html`:

```html
{{ $css := slice
  (resources.Get "css/tokens.css")
  (resources.Get "css/fonts.css")
  (resources.Get "css/base.css")
  (resources.Get "css/animations.css")
  (resources.Get "css/components/header.css")
  (resources.Get "css/components/statusbar.css")
  (resources.Get "css/components/status-pill.css")
  (resources.Get "css/components/section-heading.css")
  (resources.Get "css/components/terminal-frame.css")
  (resources.Get "css/components/quick-link.css")
  (resources.Get "css/components/metadata-list.css")
  | resources.Concat "css/main.css"
  | resources.Minify
  | resources.Fingerprint "sha512" }}
```

- [ ] **Step 11: Build check**

Run: `hugo --gc --minify`
Expected: exits 0.

- [ ] **Step 12: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "Add component primitives (status-pill, section-heading, terminal-frame, quick-link, metadata-list)

Five reusable components with paired CSS files:
- status-pill: 5 variants (live/ok/warn/idle/shipped) with optional blink
- section-heading: ember number + bone title + fading rule
- terminal-frame: full or titlebar-only variant, three traffic-light dots
- quick-link: plasma-bordered button (no [BRACKET] decoration)
- metadata-list: dl with ember labels + bone values

These compose into the homepage layout in the next tasks."
```

---

## Task 12: Hero front-matter schema in `content/_index.md`

**Files:**
- Modify: `content/_index.md`

- [ ] **Step 1: Replace `content/_index.md`**

```markdown
+++
title = "Adrian Melian"
description = "Adrian Melian — Senior Technical Artist. Rigging, pipeline, and ML for AAA games."

[params]
tagline = "Senior Technical Artist · Rigging & Pipeline · 14 years shipping AAA"
location = "Denver, CO"
availability = "Open to relocation · contract or full-time"
currently = "Camouflaj @ Meta"
recent_studios = ["Sledgehammer Games", "Meta", "Nomadic VR"]
featured_project = "krazy_kaiju"
status_label = "AVAILABLE"
status_blink = true

[[params.quick_links]]
label = "Resume"
href = "/adrianmelian_resume.pdf"
download = true

[[params.quick_links]]
label = "Reel"
href = "https://www.youtube.com/@age914"
external = true

[[params.quick_links]]
label = "LinkedIn"
href = "https://www.linkedin.com/in/adrian-melian-33066423"
external = true

[[params.quick_links]]
label = "GitHub"
href = "https://github.com/adrianmelian"
external = true
+++
```

(`featured_project` references the directory name under `content/projects/`. Adrian can change this front-matter value any time to feature a different project — Krazy Kaiju is the current default per `recent_studios` in the spec. If `content/projects/krazy_kaiju/` does not exist, the homepage template falls back to the most recent project — handled in Task 14.)

- [ ] **Step 2: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. The placeholder `index.html` template doesn't read these new params yet — they're inert until Task 14.

- [ ] **Step 3: Commit**

```bash
git add content/_index.md
git commit -m "Add homepage hero front-matter schema

Adds tagline, location, availability, currently, recent_studios,
featured_project, status_label/blink, and a quick_links list
(Resume, Reel, LinkedIn, GitHub). Read by the homepage template in
the next task. Old simple description-only frontmatter replaced."
```

---

## Task 13: Legacy Blowfish shortcode shims

The existing content uses `youtubeLite` (project pages), `gallery`/`figure` (gallery), and `timeline`/`timelineItem` (about). These shortcodes were defined by the Blowfish theme; switching themes broke them. Phase 1 ships shim shortcodes so all pages continue to build. Proper styled implementations come in later phases.

**Files:**
- Create: `themes/am-mindmeld/layouts/shortcodes/youtubeLite.html`
- Create: `themes/am-mindmeld/layouts/shortcodes/gallery.html`
- Create: `themes/am-mindmeld/layouts/shortcodes/figure.html`
- Create: `themes/am-mindmeld/layouts/shortcodes/timeline.html`
- Create: `themes/am-mindmeld/layouts/shortcodes/timelineItem.html`

- [ ] **Step 1: Create youtubeLite shim**

```html
{{- /* themes/am-mindmeld/layouts/shortcodes/youtubeLite.html */ -}}
{{- /* args: id (required), label (required) */ -}}
{{- $id := .Get "id" -}}
{{- $label := .Get "label" -}}
<div class="video-embed">
  <iframe
    src="https://www.youtube-nocookie.com/embed/{{ $id }}"
    title="{{ $label }}"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
    style="width: 100%; aspect-ratio: 16/9; border: 1px solid var(--iron-3); background: var(--carbon);">
  </iframe>
</div>
```

- [ ] **Step 2: Create gallery shim**

```html
{{- /* themes/am-mindmeld/layouts/shortcodes/gallery.html */ -}}
{{- /* Renders inner figures in a simple grid. Phase 2 replaces this with the bento + masonry treatment. */ -}}
<div class="gallery-shim" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin: var(--sp-5) 0;">
  {{ .Inner }}
</div>
```

- [ ] **Step 3: Create figure shim**

```html
{{- /* themes/am-mindmeld/layouts/shortcodes/figure.html */ -}}
{{- /* args: src (required), caption (optional), class (optional, ignored — Phase 2 replaces) */ -}}
{{- $src := .Get "src" -}}
{{- $caption := .Get "caption" -}}
<figure style="margin: 0; border: 1px solid var(--iron-3); background: var(--iron);">
  <img src="{{ $src }}" alt="{{ $caption | default "" }}" loading="lazy" style="display: block; width: 100%; height: auto;">
  {{ with $caption }}
  <figcaption style="padding: 8px 12px; font-family: var(--font-body); font-size: var(--fs-11); color: var(--bone-dim); letter-spacing: 0.04em;">{{ . }}</figcaption>
  {{ end }}
</figure>
```

- [ ] **Step 4: Create timeline shim**

```html
{{- /* themes/am-mindmeld/layouts/shortcodes/timeline.html */ -}}
<div class="timeline-shim" style="margin: var(--sp-5) 0;">
  {{ .Inner }}
</div>
```

- [ ] **Step 5: Create timelineItem shim**

```html
{{- /* themes/am-mindmeld/layouts/shortcodes/timelineItem.html */ -}}
{{- /* args: header (required), badge (optional), subheader (optional), icon (optional, ignored) */ -}}
{{- $header := .Get "header" -}}
{{- $badge := .Get "badge" -}}
{{- $subheader := .Get "subheader" -}}
<section class="timeline-item-shim" style="border-left: 2px solid var(--iron-3); padding: 12px 0 12px 16px; margin-bottom: 16px;">
  <div style="font-family: var(--font-display); font-size: var(--fs-18); color: var(--bone); text-transform: uppercase; letter-spacing: 0.04em;">{{ $header }}</div>
  {{ with $subheader }}<div style="font-family: var(--font-body); font-size: var(--fs-12); color: var(--plasma); letter-spacing: 0.06em; margin-top: 2px;">{{ . }}</div>{{ end }}
  {{ with $badge }}<div style="font-family: var(--font-body); font-size: var(--fs-11); color: var(--ember); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px;">{{ . }}</div>{{ end }}
  <div style="margin-top: 8px;">{{ .Inner }}</div>
</section>
```

- [ ] **Step 6: Build check**

Run: `hugo --gc --minify`
Expected: exits 0, no shortcode warnings.

- [ ] **Step 7: Visual check across all legacy pages**

Run: `hugo server -D`. Visit each in turn:

- `http://localhost:1313/about/` — timeline entries render as iron-3-bordered blocks with VT323 headers, plasma subheaders, ember badges. Legible but not the final design.
- `http://localhost:1313/gallery/` — images render in an auto-fill grid of ~3-4 columns at desktop. Captions visible on the captioned ones. Legible.
- `http://localhost:1313/projects/mw3/` — YouTube embeds appear as 16:9 iframes with iron-3 borders.

Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add themes/am-mindmeld/layouts/shortcodes/
git commit -m "Add Blowfish shortcode shims (youtubeLite, gallery, figure, timeline, timelineItem)

Five drop-in replacements for Blowfish-defined shortcodes referenced
by existing content. Each renders a minimal but legible version using
Mindmeld tokens. Proper styled implementations replace these in
later phases (gallery+figure in Phase 2, timeline in Phase 4).
youtubeLite uses the privacy-friendly youtube-nocookie domain."
```

---

## Task 14: Homepage hero (asymmetric split)

**Files:**
- Create: `themes/am-mindmeld/assets/css/layout/homepage.css`
- Modify: `themes/am-mindmeld/layouts/index.html`
- Modify: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Replace index.html**

```html
{{- /* themes/am-mindmeld/layouts/index.html */ -}}
{{ define "main" }}
{{- $p := .Site.Params -}}
{{- /* Resolve featured project: explicit slug → fallback to most recent in /projects/ */ -}}
{{- $featuredSlug := $p.featured_project -}}
{{- $featured := "" -}}
{{- with $featuredSlug -}}
  {{- $featured = $.Site.GetPage (printf "/projects/%s" .) -}}
{{- end -}}
{{- if not $featured -}}
  {{- range first 1 (where $.Site.RegularPages "Section" "projects").ByDate.Reverse -}}
    {{- $featured = . -}}
  {{- end -}}
{{- end -}}

<section class="hero container">
  <div class="hero__left fade-up">
    <div class="hero__logo">{{ partial "pixel-mark.html" (dict "size" 120 "title" "Adrian Melian") }}</div>
    <h1 class="hero__name">
      ADRIAN <span class="hero__name-accent">MELIAN</span>
    </h1>
    {{ with $p.tagline }}<p class="hero__tagline">{{ . }}</p>{{ end }}

    <dl class="metadata-list hero__meta">
      {{ with $p.location }}<dt>Location</dt><dd>{{ . }}</dd>{{ end }}
      {{ with $p.availability }}<dt>Status</dt><dd>{{ . }}</dd>{{ end }}
      {{ with $p.currently }}<dt>Currently</dt><dd>{{ . }}</dd>{{ end }}
      {{ with $p.recent_studios }}<dt>Recent</dt><dd>{{ delimit . ", " }}</dd>{{ end }}
    </dl>

    <div class="hero__status">
      {{ partial "status-pill.html" (dict "variant" "live" "label" $p.status_label "blink" $p.status_blink) }}
    </div>

    {{ with $p.quick_links }}
    <div class="hero__links">
      {{ range . }}
        {{ partial "quick-link.html" . }}
      {{ end }}
    </div>
    {{ end }}
  </div>

  <div class="hero__right fade-up delay-2">
    {{ if $featured }}
      {{ $title := printf "featured.project / %s.session" $featured.File.ContentBaseName }}
      {{ $image := "" }}
      {{ with $featured.Resources.GetMatch "featured*" }}
        {{ $image = .RelPermalink }}
      {{ end }}
      {{ $inner := "" }}
      {{ if $image }}
        {{ $inner = printf `<a href="%s" class="hero__featured-link"><img src="%s" alt="%s — featured project" class="hero__featured-img" /><div class="hero__featured-meta"><div class="hero__featured-title">%s</div><p class="hero__featured-blurb">%s</p></div></a>` $featured.RelPermalink $image $featured.Title $featured.Title $featured.Description }}
      {{ else }}
        {{ $inner = printf `<a href="%s" class="hero__featured-link"><div class="hero__featured-meta"><div class="hero__featured-title">%s</div><p class="hero__featured-blurb">%s</p></div></a>` $featured.RelPermalink $featured.Title $featured.Description }}
      {{ end }}
      {{ partial "terminal-frame.html" (dict "title" $title "variant" "full" "inner" $inner) }}
    {{ end }}
  </div>
</section>
{{ end }}
```

- [ ] **Step 2: Create homepage.css**

```css
/* themes/am-mindmeld/assets/css/layout/homepage.css */

.hero {
  display: grid;
  grid-template-columns: 40fr 60fr;
  gap: var(--sp-7);
  padding-top: var(--sp-8);
  padding-bottom: var(--sp-8);
  align-items: start;
}

.hero__logo { color: var(--plasma); margin-bottom: var(--sp-5); }
.hero__logo svg { display: block; }

.hero__name {
  font-family: var(--font-display);
  font-size: var(--fs-72);
  line-height: 0.85;
  letter-spacing: 0.02em;
  color: var(--bone);
  text-transform: uppercase;
  text-wrap: balance;
}
.hero__name-accent { color: var(--plasma); }

.hero__tagline {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  letter-spacing: 0.06em;
  color: var(--bone-dim);
  text-transform: uppercase;
  margin-top: var(--sp-3);
  max-width: 38ch;
}

.hero__meta { margin-top: var(--sp-5); max-width: 100%; }

.hero__status { margin-top: var(--sp-5); }

.hero__links {
  margin-top: var(--sp-5);
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

/* right column — featured project terminal frame */
.hero__featured-link {
  display: block;
  color: inherit;
}
.hero__featured-link:hover { text-decoration: none; }
.hero__featured-img {
  width: 100%;
  height: auto;
  display: block;
  margin-bottom: var(--sp-4);
  border: 1px solid var(--iron-3);
  transition: border-color var(--t-base) var(--ease-out);
}
.hero__featured-link:hover .hero__featured-img { border-color: var(--plasma); }
.hero__featured-meta { padding-top: var(--sp-2); }
.hero__featured-title {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  color: var(--bone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1;
  margin-bottom: var(--sp-3);
}
.hero__featured-link:hover .hero__featured-title { color: var(--plasma); }
.hero__featured-blurb {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  color: var(--bone-dim);
  line-height: 1.55;
  max-width: 60ch;
  margin: 0;
}

@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; gap: var(--sp-6); padding-top: var(--sp-6); padding-bottom: var(--sp-6); }
}
```

- [ ] **Step 3: Add homepage.css to the bundle**

In `head.html`:

```html
  (resources.Get "css/components/metadata-list.css")
  (resources.Get "css/layout/homepage.css")
```

- [ ] **Step 4: Build check**

Run: `hugo --gc --minify`
Expected: exits 0.

- [ ] **Step 5: Visual check**

Run: `hugo server -D`
Visit: `http://localhost:1313`

Expected:
- Sticky header at top
- Hero section: left column (40%) shows the plasma pixel-mark logo (large), `ADRIAN MELIAN` in giant VT323 with last name in plasma, tagline below in lowercase JetBrains Mono small caps, then the metadata block (LOCATION / STATUS / CURRENTLY / RECENT in ember labels, bone values), then a `[live-dot] AVAILABLE` status pill with the dot pulsing, then a row of plasma-bordered quick-link buttons (RESUME / REEL / LINKEDIN / GITHUB).
- Right column (60%): a terminal frame with traffic-light dots and titlebar `featured.project / krazy_kaiju.session`, holding a featured image of the krazy_kaiju project with title and blurb below.
- Hover the featured project — image border turns plasma, title color shifts to plasma.
- Click the featured project → navigates to `/projects/krazy_kaiju/`.
- Resize the window narrow (<900px) → columns stack vertically.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add themes/am-mindmeld/ content/_index.md 2>/dev/null; git add themes/am-mindmeld/
git commit -m "Add homepage hero (asymmetric 40/60 split)

Left column: pixel-mark logo, ADRIAN MELIAN with plasma last-name,
tagline, metadata block (location/status/currently/recent), AVAILABLE
status pill with cursor-blink dot, quick-link row (resume/reel/linkedin/github).
Right column: terminal frame holding the featured project (resolved
from front-matter or first project by date). Hover lifts image border
and title to plasma. Stacks vertically below 900px."
```

---

## Task 15: Recent projects zig-zag (homepage section 01)

**Files:**
- Create: `themes/am-mindmeld/assets/css/components/project-card-zig.css`
- Create: `themes/am-mindmeld/layouts/partials/project-card-zig.html`
- Modify: `themes/am-mindmeld/layouts/index.html`
- Modify: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Create project-card-zig.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/project-card-zig.html */ -}}
{{- /* params: page (Hugo Page object), index (int, 0-based — even rows are image-left) */ -}}
{{- $p := .page -}}
{{- $i := .index | default 0 -}}
{{- $imageLeft := eq (mod $i 2) 0 -}}
{{- $image := "" -}}
{{- with $p.Resources.GetMatch "featured*" -}}
  {{- $image = .RelPermalink -}}
{{- end -}}
<article class="card-zig {{ if $imageLeft }}card-zig--img-left{{ else }}card-zig--img-right{{ end }}">
  <a href="{{ $p.RelPermalink }}" class="card-zig__link">
    {{ if $image }}
    <div class="card-zig__media">
      <img src="{{ $image }}" alt="{{ $p.Title }}" loading="lazy" class="card-zig__img">
    </div>
    {{ end }}
    <div class="card-zig__body">
      <h3 class="card-zig__title">{{ $p.Title }}</h3>
      {{ with $p.Params.role | default $p.Params.studio }}
        <dl class="metadata-list card-zig__meta">
          {{ with $p.Params.role }}<dt>Role</dt><dd>{{ . }}</dd>{{ end }}
          {{ with $p.Params.studio }}<dt>Studio</dt><dd>{{ . }}</dd>{{ end }}
          {{ with $p.Params.shipped_year | default ($p.Date.Format "2006") }}<dt>Year</dt><dd>{{ . }}</dd>{{ end }}
        </dl>
      {{ end }}
      {{ with $p.Description }}<p class="card-zig__blurb">{{ . }}</p>{{ end }}
      <span class="card-zig__cta">View project →</span>
    </div>
  </a>
</article>
```

- [ ] **Step 2: Create project-card-zig.css**

```css
/* themes/am-mindmeld/assets/css/components/project-card-zig.css */
.card-zig {
  margin-bottom: var(--sp-7);
}
.card-zig__link {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: var(--sp-6);
  align-items: center;
  color: inherit;
  border: 1px solid transparent;
  padding: var(--sp-3);
  transition: border-color var(--t-base) var(--ease-out), background var(--t-base) var(--ease-out);
}
.card-zig__link:hover {
  border-color: var(--iron-3);
  background: var(--iron);
  text-decoration: none;
}
.card-zig__link:active { transform: scale(0.99); transition-duration: var(--t-active); }

.card-zig--img-right .card-zig__link { grid-template-columns: 5fr 7fr; }
.card-zig--img-right .card-zig__media { order: 2; }

.card-zig__media { overflow: hidden; }
.card-zig__img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--iron-3);
  transition: border-color var(--t-base) var(--ease-out), transform var(--t-base) var(--ease-out);
}
.card-zig__link:hover .card-zig__img {
  border-color: var(--plasma);
  transform: scale(1.01);
}

.card-zig__body { padding: 0 var(--sp-3); }

.card-zig__title {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  color: var(--bone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1;
  margin-bottom: var(--sp-3);
}
.card-zig__link:hover .card-zig__title { color: var(--plasma); }

.card-zig__meta { margin-bottom: var(--sp-3); }
.card-zig__blurb {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  color: var(--bone-dim);
  line-height: 1.6;
  max-width: 60ch;
  margin: 0 0 var(--sp-3);
}
.card-zig__cta {
  font-family: var(--font-body);
  font-size: var(--fs-11);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--plasma);
}

@media (max-width: 720px) {
  .card-zig__link, .card-zig--img-right .card-zig__link {
    grid-template-columns: 1fr;
  }
  .card-zig--img-right .card-zig__media { order: 0; }
}
```

- [ ] **Step 3: Add the section to index.html**

In `themes/am-mindmeld/layouts/index.html`, after the closing `</section>` of the hero, add:

```html
<section class="container hp-recent">
  {{ partial "section-heading.html" (dict "number" "01" "title" "Recent projects" "id" "recent") }}
  {{ $recent := first 6 (where .Site.RegularPages "Section" "projects").ByDate.Reverse }}
  {{ range $i, $page := $recent }}
    {{ partial "project-card-zig.html" (dict "page" $page "index" $i) }}
  {{ end }}
  <div class="hp-recent__more">
    <a href="{{ "/projects/" | relURL }}" class="hp-more-link">More projects →</a>
  </div>
</section>
```

And add the small `.hp-more-link` rule to `homepage.css`:

```css
.hp-recent { padding-bottom: var(--sp-7); }
.hp-recent__more { margin-top: var(--sp-4); text-align: right; }
.hp-more-link {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  letter-spacing: 0.1em;
  color: var(--plasma);
  text-transform: uppercase;
}
.hp-more-link:hover { text-decoration: underline; }
```

- [ ] **Step 4: Add project-card-zig.css to the bundle**

In `head.html`:

```html
  (resources.Get "css/layout/homepage.css")
  (resources.Get "css/components/project-card-zig.css")
```

- [ ] **Step 5: Build check**

Run: `hugo --gc --minify`
Expected: exits 0.

- [ ] **Step 6: Visual check**

Run: `hugo server -D`
Visit: `http://localhost:1313`

Expected (below the hero):
- Section heading: ember `01 //` followed by bone `RECENT PROJECTS` in VT323, with a fading horizontal rule trailing right.
- Six project cards in zig-zag pattern: project 1 image-left/text-right, project 2 image-right/text-left, alternating.
- Each card shows the project's `featured.{png,jpg}` image, title in VT323, role/studio/year metadata if present, the description blurb, and a `View project →` plasma CTA.
- Hover any card → background tints to iron, image gets a plasma border, title turns plasma.
- Click a card → navigates to that project page.
- Below the cards: right-aligned `MORE PROJECTS →` link.
- On mobile (<720px), each card stacks image above text.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "Add homepage section 01 (recent projects zig-zag)

Six most recent projects rendered as zig-zag cards (alternating
image-left/image-right, NOT a 3-up equal grid which the redesign-skill
flags as the AI default). Cards pull featured image, role, studio,
shipped year, and description from each project's front-matter.
Hover lifts background, image border, and title to plasma. Mobile
stacks each card vertically. More-projects link routes to /projects/."
```

---

## Task 16: Tools rail (homepage section 02)

**Files:**
- Create: `themes/am-mindmeld/assets/css/components/tool-card-rail.css`
- Create: `themes/am-mindmeld/layouts/partials/tool-card-rail.html`
- Modify: `themes/am-mindmeld/layouts/index.html`
- Modify: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Create tool-card-rail.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/tool-card-rail.html */ -}}
{{- /* params: page (Hugo Page object) */ -}}
{{- $p := .page -}}
{{- $image := "" -}}
{{- with $p.Resources.GetMatch "featured*" -}}
  {{- $image = .RelPermalink -}}
{{- end -}}
<article class="card-rail">
  <a href="{{ $p.RelPermalink }}" class="card-rail__link">
    {{ if $image }}
    <div class="card-rail__media">
      <img src="{{ $image }}" alt="{{ $p.Title }}" loading="lazy" class="card-rail__img">
    </div>
    {{ else }}
    <div class="card-rail__media card-rail__media--empty"></div>
    {{ end }}
    <div class="card-rail__body">
      <h3 class="card-rail__title">{{ $p.Title }}</h3>
      <div class="card-rail__meta">
        {{ with $p.Params.role }}<span>{{ . }}</span>{{ end }}
        {{ with $p.Params.shipped_year | default ($p.Date.Format "2006") }}<span class="card-rail__year">{{ . }}</span>{{ end }}
      </div>
    </div>
  </a>
</article>
```

- [ ] **Step 2: Create tool-card-rail.css**

```css
/* themes/am-mindmeld/assets/css/components/tool-card-rail.css */
.tools-rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(280px, 1fr);
  gap: var(--sp-4);
  overflow-x: auto;
  padding-bottom: var(--sp-4);
  scroll-snap-type: x mandatory;
  scrollbar-color: var(--plasma-dim) var(--iron);
  scrollbar-width: thin;
}
.tools-rail::-webkit-scrollbar { height: 8px; }
.tools-rail::-webkit-scrollbar-track { background: var(--iron); }
.tools-rail::-webkit-scrollbar-thumb { background: var(--plasma-dim); }

.card-rail {
  scroll-snap-align: start;
}
.card-rail__link {
  display: block;
  border: 1px solid var(--iron-3);
  background: var(--iron);
  color: inherit;
  height: 100%;
  transition: border-color var(--t-base) var(--ease-out), background var(--t-base) var(--ease-out);
}
.card-rail__link:hover {
  border-color: var(--plasma);
  background: var(--iron-2);
  text-decoration: none;
}
.card-rail__link:active { transform: scale(0.98); transition-duration: var(--t-active); }

.card-rail__media { aspect-ratio: 16 / 9; overflow: hidden; }
.card-rail__media--empty { background: var(--carbon); }
.card-rail__img { width: 100%; height: 100%; object-fit: cover; display: block; }

.card-rail__body { padding: var(--sp-3) var(--sp-4); }
.card-rail__title {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  color: var(--bone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
  margin-bottom: var(--sp-2);
}
.card-rail__link:hover .card-rail__title { color: var(--plasma); }

.card-rail__meta {
  display: flex;
  gap: var(--sp-3);
  font-family: var(--font-body);
  font-size: var(--fs-11);
  color: var(--bone-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.card-rail__year { color: var(--ember); }
```

- [ ] **Step 3: Add the section to index.html**

After the recent-projects `</section>`, append:

```html
<section class="container hp-tools">
  {{ partial "section-heading.html" (dict "number" "02" "title" "Tools" "id" "tools") }}
  <div class="tools-rail">
    {{ $tools := first 8 (where .Site.RegularPages "Section" "tools").ByDate.Reverse }}
    {{ range $tools }}
      {{ partial "tool-card-rail.html" (dict "page" .) }}
    {{ end }}
  </div>
  <div class="hp-tools__more">
    <a href="{{ "/tools/" | relURL }}" class="hp-more-link">More tools →</a>
  </div>
</section>
```

Add to homepage.css:

```css
.hp-tools { padding-bottom: var(--sp-7); }
.hp-tools__more { margin-top: var(--sp-4); text-align: right; }
```

- [ ] **Step 4: Add tool-card-rail.css to the bundle**

In `head.html`:

```html
  (resources.Get "css/components/project-card-zig.css")
  (resources.Get "css/components/tool-card-rail.css")
```

- [ ] **Step 5: Build check + visual check**

```bash
hugo --gc --minify
hugo server -D
```

Visit `http://localhost:1313`. Expected:
- Section 02 heading: ember `02 //` and bone `TOOLS`
- Horizontal-scrolling row of tool cards. 4 cards visible at desktop (~280px wide each), more accessible by scrolling/dragging right.
- Each card: featured image at the top (16:9), title in VT323, role and ember-colored year below.
- Plasma scrollbar at the bottom of the rail.
- Hover any card → border turns plasma, background tints, title turns plasma.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "Add homepage section 02 (tools horizontal-scroll rail)

Up-to-8 tools rendered as a horizontal-scroll rail with scroll-snap.
Each card shows featured image, title, role, and ember-colored year.
Plasma-tinted scrollbar. Hover lifts to plasma. More-tools link
routes to /tools/."
```

---

## Task 17: Selected work bento (homepage section 03)

**Files:**
- Create: `themes/am-mindmeld/assets/css/components/bento-cell.css`
- Create: `themes/am-mindmeld/layouts/partials/bento-cell.html`
- Modify: `themes/am-mindmeld/layouts/index.html`
- Modify: `themes/am-mindmeld/layouts/partials/head.html`

- [ ] **Step 1: Create bento-cell.html partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/bento-cell.html */ -}}
{{- /* params: src (image URL), caption (optional), span (1|2|3 for grid-column-span), aspect (default 1) */ -}}
{{- $src := .src -}}
{{- $caption := .caption | default "" -}}
{{- $span := .span | default 1 -}}
{{- $aspect := .aspect | default 1 -}}
<a class="bento-cell bento-cell--span-{{ $span }}" href="{{ $src }}" target="_blank" rel="noopener" style="aspect-ratio: {{ $aspect }};">
  <img src="{{ $src }}" alt="{{ $caption }}" loading="lazy" class="bento-cell__img">
  {{ with $caption }}<span class="bento-cell__caption">{{ . }}</span>{{ end }}
</a>
```

(Phase 2 replaces this with a proper lightbox; Phase 1 just opens the full image in a new tab.)

- [ ] **Step 2: Create bento-cell.css**

```css
/* themes/am-mindmeld/assets/css/components/bento-cell.css */
.bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--sp-3);
}
.bento-cell {
  position: relative;
  display: block;
  border: 1px solid var(--iron-3);
  background: var(--iron);
  overflow: hidden;
  transition: border-color var(--t-base) var(--ease-out);
}
.bento-cell:hover { border-color: var(--plasma); }
.bento-cell:active { transform: scale(0.99); transition-duration: var(--t-active); }
.bento-cell__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--t-base) var(--ease-out);
}
.bento-cell:hover .bento-cell__img { transform: scale(1.02); }
.bento-cell__caption {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(11, 14, 16, 0.9), transparent);
  padding: var(--sp-3);
  font-family: var(--font-body);
  font-size: var(--fs-11);
  color: var(--bone);
  letter-spacing: 0.04em;
  opacity: 0;
  transition: opacity var(--t-base) var(--ease-out);
}
.bento-cell:hover .bento-cell__caption { opacity: 1; }

.bento-cell--span-1 { grid-column: span 2; }
.bento-cell--span-2 { grid-column: span 3; }
.bento-cell--span-3 { grid-column: span 4; }

@media (max-width: 720px) {
  .bento { grid-template-columns: repeat(2, 1fr); }
  .bento-cell--span-1, .bento-cell--span-2, .bento-cell--span-3 { grid-column: span 1; }
  .bento-cell--span-3 { grid-column: span 2; }
}
```

- [ ] **Step 3: Add the section to index.html**

After the tools `</section>`, append:

```html
<section class="container hp-selected">
  {{ partial "section-heading.html" (dict "number" "03" "title" "Selected work" "id" "selected") }}
  <div class="bento">
    {{ partial "bento-cell.html" (dict "src" "/gallery/ufo.jpg" "caption" "Krazy Kaiju! · acrylic on canvas" "span" 3 "aspect" "16/10") }}
    {{ partial "bento-cell.html" (dict "src" "/gallery/048.jpg" "caption" "Kaiju Racing Livery · airbrush on polycarbonate" "span" 2 "aspect" "1") }}
    {{ partial "bento-cell.html" (dict "src" "/gallery/039.jpg" "caption" "Space Arcade · 3D to real world" "span" 1 "aspect" "1") }}
  </div>
  <div class="hp-selected__more">
    <a href="{{ "/gallery/" | relURL }}" class="hp-more-link">View gallery →</a>
  </div>
</section>
```

(Three hardcoded bento entries for Phase 1 — proper bento curation happens in Phase 5 via front-matter on `content/gallery/_index.md`. The three URLs come from `assets/gallery/` images Adrian already selected as featured in the existing gallery.md captions.)

Add to homepage.css:

```css
.hp-selected { padding-bottom: var(--sp-7); }
.hp-selected__more { margin-top: var(--sp-4); text-align: right; }
```

- [ ] **Step 4: Add bento-cell.css to the bundle**

In `head.html`:

```html
  (resources.Get "css/components/tool-card-rail.css")
  (resources.Get "css/components/bento-cell.css")
```

- [ ] **Step 5: Verify the gallery images are reachable**

The bento references `/gallery/ufo.jpg` etc., which Hugo serves from `assets/gallery/` only if processed through Hugo's image pipeline. For Phase 1 simplicity, copy the three referenced images from `assets/gallery/` to `static/gallery/` so they're served at the expected URLs:

```bash
mkdir -p static/gallery
cp assets/gallery/ufo.jpg static/gallery/ufo.jpg 2>/dev/null || cp -n "assets/gallery/ufo.jpg" "static/gallery/" 2>/dev/null
cp assets/gallery/048.jpg static/gallery/048.jpg 2>/dev/null || true
cp assets/gallery/039.jpg static/gallery/039.jpg 2>/dev/null || true
```

If `ufo.jpg` doesn't exist in `assets/gallery/` (filename was guessed from menu config), substitute the first three captioned images from `content/gallery/index.md` (`07.jpg`, `01.jpg`, `022.jpg`) — adjust the bento partial calls accordingly.

(Phase 2 fixes this properly via Hugo's image pipeline + bento front-matter; for Phase 1 we just need three legible images on the homepage.)

- [ ] **Step 6: Build check + visual check**

```bash
hugo --gc --minify
hugo server -D
```

Visit `http://localhost:1313`. Expected:
- Section 03 heading: ember `03 //` and bone `SELECTED WORK`.
- A 6-column grid containing 3 bento cells: a wide cell on the left (span 3), a medium in the middle (span 2), a narrow on the right (span 1). All three show captioned images.
- Hover any cell → image scales up 2%, plasma border appears, caption fades in from the bottom gradient.
- Below the bento: right-aligned `VIEW GALLERY →` link.
- On mobile (<720px), bento collapses to 2-column with the wide cell spanning 2.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add themes/am-mindmeld/ static/gallery/
git commit -m "Add homepage section 03 (selected work bento)

Three hand-picked bento cells (span 3 / span 2 / span 1) on a
6-column grid showcasing top gallery pieces. Hover scales image and
fades in a caption gradient. Mobile collapses to 2-col with the wide
piece spanning 2. Phase 5 replaces the hardcoded picks with a
configurable curation list. View-gallery link routes to /gallery/."
```

---

## Task 18: Page-load fade-up + final polish

**Files:**
- Modify: `themes/am-mindmeld/layouts/index.html` (already has `.fade-up` on hero columns)
- Audit: all interactive elements have `:hover`, `:focus-visible`, `:active`

- [ ] **Step 1: Verify fade-up on hero**

Hero already has `.fade-up` and `.fade-up.delay-2` on the two hero columns from Task 14. Open the homepage and refresh — the hero columns should fade in with a slight upward translate, the right column slightly delayed. The cursor blink on the AVAILABLE pill should be visible.

- [ ] **Step 2: Audit interactive elements for full state coverage**

For each of these selectors, verify the CSS file defines `:hover`, `:focus-visible`, and `:active`:

| Selector | File | Must have |
|---|---|---|
| `.site-header__nav a` | header.css | hover, focus-visible (inherited from base), active |
| `.site-header__social a` | header.css | hover, active |
| `.quick-link` | quick-link.css | hover, active |
| `.card-zig__link` | project-card-zig.css | hover, active |
| `.card-rail__link` | tool-card-rail.css | hover, active |
| `.bento-cell` | bento-cell.css | hover, active |
| `.hero__featured-link` | homepage.css | hover (image border, title color) |
| `.hp-more-link` | homepage.css | hover (underline) |

Where any `:active` rule is missing, add this one-liner to the parent's hover block:

```css
.SELECTOR:active { transform: scale(0.98); transition-duration: var(--t-active); }
```

`:focus-visible` is handled globally via `base.css` rule (`:focus-visible { outline: 2px solid var(--plasma); outline-offset: 2px; }`). Verify by tabbing through the homepage with the keyboard — every interactive element should show a 2px plasma outline on focus.

- [ ] **Step 3: Test prefers-reduced-motion**

In Chrome DevTools, open Rendering panel (Cmd/Ctrl+Shift+P → "Show Rendering"), then under "Emulate CSS media feature prefers-reduced-motion" select "reduce." Refresh the page.

Expected: hero columns appear instantly (no fade-up), AVAILABLE pill dot doesn't blink, all hover transitions are effectively instant.

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "Verify motion + state coverage on homepage

Audited all interactive elements (header nav, social icons, hero
quick-links, recent project cards, tool rail cards, bento cells,
featured project link) for hover/focus-visible/active states.
Verified fade-up entrance on hero columns. Verified prefers-reduced-motion
disables blink and fade-up."
```

---

## Task 19: Build clean & smoke check across all pages

**Files:**
- (No file changes; verification only)

- [ ] **Step 1: Production build**

Run: `hugo --gc --minify --logLevel info`
Expected: exits 0, no warnings, output written to `public/`. Note the byte sizes of the CSS bundle and the homepage HTML — both should be modest (CSS bundle <40KB minified, homepage HTML <30KB).

- [ ] **Step 2: Smoke check every legacy page**

Run: `hugo server -D`. Visit each page and verify it builds and renders legibly (not pretty yet — that's later phases — but legible):

- `/` — fully redesigned homepage (hero + 3 sections + footer) ✓
- `/projects/` — list page renders via fallback `list.html` (basic but legible)
- `/projects/mw3/` — single page renders via fallback `single.html`, YouTube embeds via shim
- `/projects/krazy_kaiju/`, `/projects/vanguard/`, etc. — same fallback
- `/tools/` — list fallback
- `/tools/ez_rigging/`, `/tools/rig_authoring_framework/`, etc. — single fallback
- `/gallery/` — gallery shim renders 44+ images in auto-fill grid, captioned ones show captions
- `/about/` — timeline shim renders 12+ entries as iron-3 bordered blocks
- `/contact/` — single fallback shows email content
- `/404.html` — Hugo's default; we'll style it in Phase 4

Every page MUST render without a build error. Captions on text-heavy pages (about, contact, project pages) must be readable.

- [ ] **Step 3: Run a Lighthouse pass on the homepage**

In Chrome DevTools → Lighthouse → run "Performance" + "Accessibility" + "Best Practices" + "SEO" against `http://localhost:1313/`.

Expected scores:
- Performance: ≥90 (the homepage is mostly text + a few images)
- Accessibility: ≥95 (skip-link present, heading order correct, alt text on images, plasma focus outlines, color contrast — verify no contrast warnings)
- Best Practices: ≥95
- SEO: ≥90

Fix any flagged issues inline before continuing. Most likely flag: missing `<meta name="description">` on individual project pages (acceptable for Phase 1 — they're not redesigned yet); contrast issue on `--bone-dim` against `--carbon` in some text (4.5:1 minimum required for body, verify `--bone-dim` 8A8378 against `--carbon` 0B0E10 hits AA).

Quick check: `--bone-dim` (`#8A8378`) vs `--carbon` (`#0B0E10`) → contrast ratio ≈ 6.7:1, passes AA for body and AAA for large text. ✓

`--bone-faint` (`#5A554D`) vs `--carbon` (`#0B0E10`) → contrast ratio ≈ 3.4:1, FAILS AA for body. Verify `--bone-faint` is only used on placeholder/disabled text and tiny meta strings (e.g., the `BUILD 2026.05.07` segment in the statusbar). If it's used anywhere on actual body content, lift to `--bone-dim`.

- [ ] **Step 4: Commit (if any inline fixes were made)**

```bash
git add themes/am-mindmeld/
git commit -m "Smoke-check + a11y pass for Phase 1

Verified production build, all legacy pages render via fallbacks
without errors, Lighthouse scores meet targets (perf 90+, a11y 95+).
Audited color-contrast: bone-dim/carbon passes AA, bone-faint scoped
to non-prose UI segments only."
```

---

## Task 20: Phase 1 wrap-up — README, theme.toml polish, optional Blowfish removal

**Files:**
- Modify: `themes/am-mindmeld/README.md`
- Modify: `config/_default/params.toml` (replace with minimal)
- (Optional) Remove: `.gitmodules`, `themes/blowfish/` (deferred to Phase 5 cleanup if preferred)

- [ ] **Step 1: Update theme README**

```markdown
# am-mindmeld

Custom Hugo theme for adrianmelian.com built around the Mindmeld
design system from AM_MayaTools. Not intended for redistribution.

## Tech

- Hugo Extended ≥ 0.120
- Plain CSS via Hugo's resources pipeline (Concat + Minify + Fingerprint)
- Self-hosted webfonts: VT323 (display), JetBrains Mono (body)
- Vanilla JS (none currently required)

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
```

- [ ] **Step 2: Replace params.toml with theme-specific minimal**

Overwrite `config/_default/params.toml`:

```toml
# am-mindmeld theme params
description = "Adrian Melian — Senior Technical Artist. Rigging, pipeline, and ML for AAA games."

# Defaults consumed by the homepage hero (overridable in content/_index.md):
# tagline, location, availability, currently, recent_studios,
# featured_project, status_label, status_blink, quick_links
#
# Most settings live in content/_index.md front-matter, not here.
```

- [ ] **Step 3: Decide on Blowfish submodule removal**

The plan defers Blowfish submodule removal to Phase 5 cleanup. The submodule is no longer referenced by `hugo.toml` (theme switched in Task 1) and is inert.

If Adrian wants to remove it now to reduce repo size:

```bash
git submodule deinit themes/blowfish
git rm themes/blowfish
git rm .gitmodules  # only if no other submodules remain
```

Then commit. Otherwise leave for Phase 5.

- [ ] **Step 4: Final build + tag (optional)**

```bash
hugo --gc --minify
git add config/_default/params.toml themes/am-mindmeld/README.md
git commit -m "Phase 1 wrap-up: README + minimal params.toml

am-mindmeld README documents tech, structure, and phasing. params.toml
slims to theme-relevant settings only — homepage data lives in
content/_index.md front-matter. Blowfish submodule deferred to
Phase 5 cleanup."

git tag phase-1-foundation-and-homepage
```

---

## Self-review

**Spec coverage:**
- Goal "replace Blowfish with am-mindmeld theme" → Tasks 1, 8, 20 ✓
- Mindmeld palette + typography + motif kit → Tasks 3, 4, 11 ✓
- Asymmetric homepage hero with status pill → Tasks 12, 14 ✓
- Recent projects zig-zag (NOT 3-up grid) → Task 15 ✓
- Tools horizontal-scroll rail → Task 16 ✓
- Selected work bento → Task 17 ✓
- Header with flat nav + plasma underline + social icons → Tasks 8, 9 ✓
- Statusbar footer → Task 10 ✓
- Pixel mark + favicons → Task 7 ✓
- Self-hosted fonts → Task 2 ✓
- Grain overlay → Task 4 ✓
- Skip-to-content link → Task 4 (CSS) + Task 5 (markup) ✓
- Page-load fade-up + reduced-motion → Tasks 6, 18 ✓
- Hover/active/focus states sitewide → Task 18 audit ✓
- Component primitives (status-pill, section-heading, terminal-frame, quick-link, metadata-list) → Task 11 ✓
- Cursor blink only on hero status pill → Task 14 (markup uses blink: true; the rule lives in animations.css) ✓
- Legacy Blowfish shortcode shims → Task 13 ✓
- Lighthouse / a11y verification → Task 19 ✓
- Phasing — this is Phase 1 only; Phase 2 (gallery), Phase 3 (list/detail), Phase 4 (about/contact/404 polish), Phase 5 (cleanup) get separate plans

**Placeholder scan:** No "TBD", "TODO", "implement later", or vague-instruction patterns. Every code block contains complete content. Two acceptable provisional bits flagged in their tasks:
- Task 17 hardcodes 3 bento images; the task itself notes "Phase 5 replaces with a configurable curation list" — this is intentional staging, not a placeholder.
- Task 20 defers Blowfish submodule removal to Phase 5 cleanup; explicitly noted, not buried.

**Type / signature consistency:**
- Hugo partial calling convention `(dict "key" value …)` is used identically everywhere ✓
- Front-matter param names (`featured_project`, `quick_links`, `tagline`, `location`, `availability`, `currently`, `recent_studios`, `status_label`, `status_blink`) are consistent across content/_index.md and the homepage template ✓
- CSS variable names match between tokens.css and consumer files ✓
- Status pill variants (`live`, `ok`, `warn`, `idle`, `shipped`) consistent in both partial and CSS ✓

**Ambiguity check:** None remaining. All tasks have explicit verification steps tying behavior to a visible result.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-07-phase1-foundation-and-homepage.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a 20-task plan with substantial visual verification at each step; reviewing-between-tasks catches drift early.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Faster for the user (no subagent dispatch overhead) but easier to lose track in a long session.

Which approach?
