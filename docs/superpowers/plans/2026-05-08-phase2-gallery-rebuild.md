# Phase 2 — Gallery Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the temporary auto-fill gallery grid (Phase 1 shim) with a proper bento-on-top + justified masonry archive + lightbox treatment, served through Hugo's image pipeline with responsive `srcset` and lazy loading.

**Architecture:** A new section-specific page template (`layouts/gallery/single.html`) renders the gallery from front-matter rather than from markdown shortcodes. A reusable `responsive-image` partial generates `<picture>` markup with multiple sizes (480/800/1200/1600w) plus a base64 LQIP for blur-up. A vanilla-JS lightbox modal lives once on the gallery page and intercepts clicks on bento and masonry cells. CSS multi-column drives the masonry layout (no JS dependency for that — simpler ships first; true brick-laying could upgrade later).

**Tech Stack:** Hugo Extended ≥ 0.147 (image pipeline via `resources.GetMatch` / `Resize`), plain CSS (`column-count` for masonry, CSS Grid for bento), vanilla JS for the lightbox (~80 lines, inline in the gallery template — no bundle).

**Reference documents:**
- Master spec: `docs/superpowers/specs/2026-05-07-portfolio-mindmeld-redesign-design.md` (Section 3 → Gallery)
- Phase 1 plan: `docs/superpowers/plans/2026-05-07-phase1-foundation-and-homepage.md` (for context on patterns established)

---

## Design choices locked in by this plan

The master spec leaves a few implementation details unspecified. Defaults selected:

- **Masonry implementation:** CSS multi-column (`column-count`), not JS-driven. Simpler, ships now, no JS dependency. Items flow top-to-bottom in each column. If true row-across brick-laying becomes important, swap in a small JS pass later.
- **Bento curation source:** front-matter (`params.bento` array) on `content/gallery/index.md`. Default population is the six images currently captioned at the top of the gallery (ufo, 01, 022, 032, 07, 039). Adrian can adjust by editing front-matter.
- **Image pipeline source:** `assets/gallery/` (the originals, untouched at full resolution). The Phase 1 `static/gallery/` resized copies are no longer needed by the new gallery template, but stay in place for now to keep any external deep-links working — Phase 5 cleanup removes them.
- **Lightbox library:** none. Vanilla JS, ~80 lines, inline in the gallery template (loaded only on `/gallery/`). Modal markup, prev/next, Esc to close, click-outside to close, keyboard arrow nav, focus trap.
- **Bento layout:** 6-column grid, varied spans for visual interest. Default: span-3 (large hero) / span-2 / span-1 / span-2 / span-2 / span-2. Total 12 columns = 2 rows. Hand-tunable via front-matter.
- **Gallery body content:** the intro paragraph stays in the markdown body (`.Content` rendered above the bento). The image lists move from markdown shortcodes into front-matter so the layout is template-driven and structured.

---

## File structure

### Created in this phase

```
themes/am-mindmeld/
├── assets/
│   └── css/
│       ├── components/
│       │   └── lightbox.css                       # modal, backdrop, controls, focus styles
│       └── layout/
│           └── gallery.css                        # bento grid + masonry columns + page hero
├── layouts/
│   ├── gallery/
│   │   └── single.html                            # gallery page template
│   └── partials/
│       └── responsive-image.html                  # <picture> srcset + LQIP helper
```

### Modified in this phase

- `themes/am-mindmeld/layouts/partials/bento-cell.html` — switch from raw `src` URL to asset path; use `responsive-image` partial
- `themes/am-mindmeld/layouts/index.html` — homepage bento callsites pass asset paths (e.g., `"gallery/ufo.jpg"`) instead of raw URLs (`"/gallery/ufo.jpg"`)
- `themes/am-mindmeld/layouts/shortcodes/figure.html` — accept asset paths; use `responsive-image` (legacy raw-URL behavior preserved as fallback)
- `themes/am-mindmeld/layouts/partials/head.html` — add `lightbox.css` and `gallery.css` to the CSS bundle
- `content/gallery/index.md` — replace markdown shortcode block with front-matter `params.bento` + `params.masonry` arrays
- `themes/am-mindmeld/README.md` — remove gallery from "Known gaps" once shipped

### Untouched (intentionally)

- `static/gallery/*.jpg` — Phase 5 cleanup will remove. The new gallery doesn't need them, but they stay until cleanup to avoid breaking any external links during the transition.
- `themes/am-mindmeld/layouts/shortcodes/gallery.html` — becomes a no-op pass-through if the markdown body still uses `{{< gallery >}}`. Phase 2 moves the image lists to front-matter, so the gallery shortcode in markdown is removed by content edits, but the shortcode file stays as a defensive shim in case any other content adds it.

---

## Verification approach

Same as Phase 1 — Hugo themes don't have unit tests. Each task uses:

1. **Build check:** `hugo --gc --minify` exits 0 with no warnings
2. **HTML output check:** inspect rendered files under `public/` for expected markup
3. **Resource pipeline check:** confirm `public/gallery/` (or wherever Hugo emits processed images) contains the resized variants
4. **Smoke + Lighthouse:** at end of phase

---

## Task 1: `responsive-image` partial — image pipeline helper

**Files:**
- Create: `themes/am-mindmeld/layouts/partials/responsive-image.html`

This partial accepts an asset path relative to `assets/` and emits a complete `<picture>` element with srcset for 480/800/1200/1600 widths, intrinsic dimensions to prevent layout shift, lazy loading, and a tiny base64 LQIP for blur-up.

- [ ] **Step 1: Create the partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/responsive-image.html */ -}}
{{- /* Renders a responsive <picture> with srcset for an asset-pipeline image.
       params (dict):
         path     — asset path relative to assets/ (e.g., "gallery/ufo.jpg") — required
         alt      — alt text — required (pass "" for decorative)
         class    — class attribute on <img> — optional
         sizes    — value for the sizes attribute — optional, defaults to "(min-width: 1200px) 33vw, (min-width: 720px) 50vw, 100vw"
         loading  — "lazy" or "eager" — optional, default "lazy"
         max      — max width for the largest variant in pixels — optional, default 1600

       Falls back to a plain <img> with the original path if the asset cannot be resolved. */ -}}
{{- $path := .path -}}
{{- $alt := .alt | default "" -}}
{{- $class := .class | default "" -}}
{{- $sizes := .sizes | default "(min-width: 1200px) 33vw, (min-width: 720px) 50vw, 100vw" -}}
{{- $loading := .loading | default "lazy" -}}
{{- $max := .max | default 1600 -}}

{{- $img := resources.Get $path -}}
{{- if $img -}}
  {{- /* Build srcset entries — only generate widths smaller than the original */ -}}
  {{- $widths := slice 480 800 1200 1600 -}}
  {{- $variants := slice -}}
  {{- range $w := $widths -}}
    {{- if and (le $w $max) (lt $w $img.Width) -}}
      {{- $variant := $img.Resize (printf "%dx q82" $w) -}}
      {{- $variants = $variants | append (dict "w" $w "url" $variant.RelPermalink) -}}
    {{- end -}}
  {{- end -}}
  {{- /* Always include the original (clamped to max) as the largest source */ -}}
  {{- $largestW := math.Min $img.Width $max | int -}}
  {{- $largest := $img.Resize (printf "%dx q82" $largestW) -}}
  {{- $variants = $variants | append (dict "w" $largestW "url" $largest.RelPermalink) -}}

  {{- /* Build srcset string */ -}}
  {{- $srcset := slice -}}
  {{- range $variants -}}
    {{- $srcset = $srcset | append (printf "%s %dw" .url .w) -}}
  {{- end -}}

  {{- /* LQIP: 24-pixel-wide blur thumbnail as base64 */ -}}
  {{- $lqip := $img.Resize "24x q40 webp" -}}
  {{- $lqipData := printf "data:image/webp;base64,%s" ($lqip.Content | base64Encode) -}}

  <img
    src="{{ $largest.RelPermalink }}"
    srcset="{{ delimit $srcset ", " }}"
    sizes="{{ $sizes }}"
    width="{{ $largest.Width }}"
    height="{{ $largest.Height }}"
    alt="{{ $alt }}"
    loading="{{ $loading }}"
    decoding="async"
    {{ with $class }}class="{{ . }}"{{ end }}
    style="background-image: url({{ $lqipData }}); background-size: cover; background-position: center;"
  >
{{- else -}}
  {{- /* Fallback: asset not found, render plain <img> with the path as-is */ -}}
  <img src="{{ $path }}" alt="{{ $alt }}" loading="{{ $loading }}"{{ with $class }} class="{{ . }}"{{ end }}>
{{- end -}}
```

Notes on this partial:
- `resources.Get` returns nil if the asset doesn't exist; falls back to a plain `<img>` so callers don't break.
- `Resize "480x q82"` keeps the aspect ratio (only the width is constrained). `q82` sets JPEG quality.
- The LQIP uses `webp q40` for tiny size; modern browsers render it on the `<img>` as `background-image` until the real image paints over it.
- `decoding="async"` lets the browser decode off the main thread.

- [ ] **Step 2: Create a smoke-test caller**

We don't yet have any consumer. To verify the partial works in isolation, create a temporary debug page:

```bash
mkdir -p content/_debug
cat > content/_debug/responsive-image.md <<'EOF'
+++
title = "Responsive Image Smoke Test"
draft = true
+++
Test page — should not appear in production builds (drafts disabled in production).
EOF
```

Then create `themes/am-mindmeld/layouts/_debug/single.html`:

```html
{{ define "main" }}
<article class="container fallback-page">
  <h1>responsive-image smoke test</h1>
  <p>Smallest existing asset → ufo.jpg</p>
  {{ partial "responsive-image.html" (dict "path" "gallery/ufo.jpg" "alt" "Krazy Kaiju") }}
  <hr>
  <p>Nonexistent asset → fallback path</p>
  {{ partial "responsive-image.html" (dict "path" "gallery/does-not-exist.jpg" "alt" "Should fall back") }}
</article>
{{ end }}
```

- [ ] **Step 3: Build and inspect**

```bash
hugo --gc --minify -D
```

Expected: exits 0, no warnings.

```bash
ls public/_debug/responsive-image/index.html && grep -c 'srcset' public/_debug/responsive-image/index.html
```

Expected: file exists, srcset count ≥ 1.

```bash
grep -oE '<img [^>]+>' public/_debug/responsive-image/index.html | head -2
```

Expected: first match has `srcset=...` with multiple widths and `style="background-image: url(data:image/webp;base64,...)"`. Second match is the fallback `<img>` for the nonexistent asset (no srcset, no LQIP).

```bash
ls public/gallery/ | grep -E 'ufo.*\.jpg' | head -5
```

Expected: multiple resized variants of ufo (e.g., `ufo_hu_<hash>.jpg` at 480w, 800w, 1200w, 1600w).

- [ ] **Step 4: Remove the debug page**

```bash
rm -rf content/_debug themes/am-mindmeld/layouts/_debug
```

- [ ] **Step 5: Commit**

```bash
git add themes/am-mindmeld/layouts/partials/responsive-image.html
git commit -m "$(cat <<'EOF'
Add responsive-image partial (Hugo image pipeline helper)

Generates a <picture>-equivalent <img> with srcset across 480/800/
1200/1600 widths, intrinsic dimensions to prevent layout shift,
lazy loading by default, async decoding, and a tiny base64 webp
LQIP rendered as background-image for blur-up while the source
loads. Falls back to a plain <img> with the raw path if the asset
can't be resolved.

Used by figure shortcode, bento-cell partial, and the gallery
masonry items in subsequent tasks.
EOF
)"
```

---

## Task 2: Update `figure` shortcode and `bento-cell` partial to use the pipeline

**Files:**
- Modify: `themes/am-mindmeld/layouts/shortcodes/figure.html`
- Modify: `themes/am-mindmeld/layouts/partials/bento-cell.html`

The current `figure` shortcode hardcodes a raw `<img>` with whatever `src` is passed. After this task, both `figure` and `bento-cell` accept an asset path (relative to `assets/`) and route through `responsive-image`. The legacy raw-URL behavior is preserved for backward compatibility.

- [ ] **Step 1: Replace `figure.html`**

```html
{{- /* themes/am-mindmeld/layouts/shortcodes/figure.html */ -}}
{{- /* args:
         src     — asset path ("gallery/01.jpg") OR raw URL ("/gallery/01.jpg") — required
         caption — optional
         alt     — optional, defaults to caption
         class   — optional class on the wrapping figure (Phase 5 may use)
*/ -}}
{{- $src := .Get "src" -}}
{{- $caption := .Get "caption" -}}
{{- $alt := (.Get "alt") | default $caption | default "" -}}

{{- /* Detect raw URL (starts with "/" or "http") vs. asset path */ -}}
{{- $isRawURL := or (hasPrefix $src "/") (hasPrefix $src "http") -}}
{{- $assetPath := $src -}}
{{- if $isRawURL -}}
  {{- /* If it's a raw URL like "/gallery/01.jpg", strip the leading slash so resources.Get can find it under assets/ */ -}}
  {{- $stripped := strings.TrimPrefix "/" $src -}}
  {{- $maybeAsset := resources.Get $stripped -}}
  {{- if $maybeAsset -}}
    {{- $assetPath = $stripped -}}
    {{- $isRawURL = false -}}
  {{- end -}}
{{- end -}}

<figure class="figure-shim">
  {{- if $isRawURL -}}
    <img src="{{ $src }}" alt="{{ $alt }}" loading="lazy">
  {{- else -}}
    {{ partial "responsive-image.html" (dict "path" $assetPath "alt" $alt) }}
  {{- end -}}
  {{ with $caption }}<figcaption>{{ . }}</figcaption>{{ end }}
</figure>
```

- [ ] **Step 2: Replace `bento-cell.html`**

```html
{{- /* themes/am-mindmeld/layouts/partials/bento-cell.html */ -}}
{{- /* params:
         path    — asset path ("gallery/ufo.jpg") — preferred
         src     — legacy raw URL ("/gallery/ufo.jpg") — supported for backward compat
         caption — visible on hover (string)
         span    — grid column span: 1, 2, or 3
         aspect  — CSS aspect-ratio value (default 1)
         href    — link target (default: gallery list page)
*/ -}}
{{- $path := .path -}}
{{- $src := .src -}}
{{- $caption := .caption | default "" -}}
{{- $span := .span | default 1 -}}
{{- $aspect := .aspect | default 1 -}}
{{- $href := .href | default ("/gallery/" | relURL) -}}

{{- /* Resolve which mode to use: asset path (preferred) or raw URL (legacy) */ -}}
{{- $useAssetPath := false -}}
{{- if $path -}}
  {{- $useAssetPath = true -}}
{{- else if $src -}}
  {{- $stripped := strings.TrimPrefix "/" $src -}}
  {{- $maybeAsset := resources.Get $stripped -}}
  {{- if $maybeAsset -}}
    {{- $path = $stripped -}}
    {{- $useAssetPath = true -}}
  {{- end -}}
{{- end -}}

<a class="bento-cell bento-cell--span-{{ $span }}" href="{{ $href }}" style="aspect-ratio: {{ printf "%v" $aspect | safeCSS }};">
  {{- if $useAssetPath -}}
    {{ partial "responsive-image.html" (dict "path" $path "alt" $caption "class" "bento-cell__img") }}
  {{- else -}}
    <img src="{{ $src }}" alt="{{ $caption }}" loading="lazy" class="bento-cell__img">
  {{- end -}}
  {{ with $caption }}<span class="bento-cell__caption">{{ . }}</span>{{ end }}
</a>
```

- [ ] **Step 3: Build and verify nothing regressed**

```bash
hugo --gc --minify
```

Expected: exits 0.

The current homepage bento still passes raw URLs (`"/gallery/ufo.jpg"`). With the new bento-cell, those raw URLs get auto-routed through the pipeline because `resources.Get` finds matching assets. Verify this:

```bash
grep -oE 'srcset="[^"]+"' public/index.html | head -3
```

Expected: 3 matches (the three homepage bento images now have srcsets).

Verify the existing gallery (still using markdown figure shortcodes) also picks up srcsets:

```bash
grep -c 'srcset' public/gallery/index.html
```

Expected: matches the number of figures that have a corresponding asset (most/all of the 35).

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Route figure shortcode and bento-cell through responsive-image

Both helpers now prefer Hugo asset paths (e.g., "gallery/ufo.jpg")
and emit a srcset-equipped <img> via the responsive-image partial.
Backward compat preserved: a raw URL passed to either is still
accepted, and if the URL maps to an existing asset, it gets routed
through the pipeline transparently.

The homepage bento and the existing gallery markdown immediately
benefit — no callsite changes required for this commit. Subsequent
tasks update homepage callsites to use asset paths explicitly and
rebuild the gallery template from front-matter.
EOF
)"
```

---

## Task 3: Migrate homepage bento callsites to explicit asset paths

**Files:**
- Modify: `themes/am-mindmeld/layouts/index.html`

Switch the three homepage bento partial calls from `src "/gallery/ufo.jpg"` (raw URL, auto-detected) to `path "gallery/ufo.jpg"` (explicit asset path). Cleaner, no detection magic, faster (no extra `resources.Get` lookup per cell).

- [ ] **Step 1: Update the three bento calls**

In `themes/am-mindmeld/layouts/index.html`, find the `<section class="container hp-selected">` block. The three bento-cell calls look like:

```html
{{ partial "bento-cell.html" (dict "src" ("/gallery/ufo.jpg" | relURL) "caption" "Krazy Kaiju! · acrylic on canvas" "span" 3 "aspect" "16/10") }}
{{ partial "bento-cell.html" (dict "src" ("/gallery/07.jpg" | relURL) "caption" "Chicken Run & Coop · 3D to real world" "span" 2 "aspect" "1") }}
{{ partial "bento-cell.html" (dict "src" ("/gallery/039.jpg" | relURL) "caption" "Space Arcade · 3D to real world" "span" 1 "aspect" "1") }}
```

Replace with:

```html
{{ partial "bento-cell.html" (dict "path" "gallery/ufo.jpg" "caption" "Krazy Kaiju! · acrylic on canvas" "span" 3 "aspect" "16/10") }}
{{ partial "bento-cell.html" (dict "path" "gallery/07.jpg" "caption" "Chicken Run & Coop · 3D to real world" "span" 2 "aspect" "1") }}
{{ partial "bento-cell.html" (dict "path" "gallery/039.jpg" "caption" "Space Arcade · 3D to real world" "span" 1 "aspect" "1") }}
```

(`src` → `path`, drop `relURL`, drop the leading slash.)

- [ ] **Step 2: Build and verify the homepage bento still works**

```bash
hugo --gc --minify
```

```bash
grep -oE '<img[^>]+srcset[^>]+>' public/index.html | head -3
```

Expected: 3 matches showing the bento images with srcsets pointing at processed assets (e.g., `/gallery/ufo_hu_<hash>_480x0_resize_q82.jpg`).

- [ ] **Step 3: Commit**

```bash
git add themes/am-mindmeld/layouts/index.html
git commit -m "$(cat <<'EOF'
Homepage bento: use explicit asset paths

Switch the three hp-selected bento-cell calls from src "/gallery/X"
to path "gallery/X". Drops the auto-detection codepath in favor of
the explicit happy path. No visual change.
EOF
)"
```

---

## Task 4: Gallery layout CSS (bento + masonry + page hero)

**Files:**
- Create: `themes/am-mindmeld/assets/css/layout/gallery.css`
- Modify: `themes/am-mindmeld/layouts/partials/head.html` — add gallery.css to the bundle

- [ ] **Step 1: Create gallery.css**

```css
/* themes/am-mindmeld/assets/css/layout/gallery.css */

/* ===== page wrapper ===== */
.gallery {
  padding: var(--sp-7) 0 var(--sp-8);
}
.gallery__intro {
  max-width: 65ch;
  margin-bottom: var(--sp-7);
  font-family: var(--font-body);
  font-size: var(--fs-15);
  color: var(--bone-dim);
  line-height: var(--lh-body);
}

/* ===== bento section ===== */
.gallery__bento-section { margin-bottom: var(--sp-7); }

.gallery__bento {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--sp-3);
}

/* ===== divider ===== */
.gallery__divider {
  border: none;
  border-top: 1px dashed var(--iron-3);
  margin: var(--sp-7) 0;
}

/* ===== masonry section ===== */
.gallery__masonry-section {}

.gallery__masonry-heading {
  margin-bottom: var(--sp-5);
}

.gallery__masonry {
  column-count: 2;
  column-gap: var(--sp-3);
}
@media (min-width: 720px)  { .gallery__masonry { column-count: 3; } }
@media (min-width: 1100px) { .gallery__masonry { column-count: 4; } }
@media (min-width: 1400px) { .gallery__masonry { column-count: 5; } }

.gallery__masonry-item {
  break-inside: avoid;
  margin-bottom: var(--sp-3);
  border: 1px solid var(--iron-3);
  background: var(--iron);
  cursor: zoom-in;
  display: block;
  transition: border-color var(--t-base) var(--ease-out), transform var(--t-base) var(--ease-out);
}
.gallery__masonry-item:hover {
  border-color: var(--plasma);
}
.gallery__masonry-item:active {
  transform: scale(0.99);
  transition-duration: var(--t-active);
}
.gallery__masonry-item img {
  display: block;
  width: 100%;
  height: auto;
  background-color: var(--iron);
}
.gallery__masonry-caption {
  padding: 6px var(--sp-3) var(--sp-3);
  font-family: var(--font-body);
  font-size: var(--fs-11);
  color: var(--bone-dim);
  letter-spacing: 0.04em;
  line-height: 1.4;
}
```

- [ ] **Step 2: Add gallery.css to the CSS bundle**

In `themes/am-mindmeld/layouts/partials/head.html`, find the `$css := slice` block. Append `(resources.Get "css/layout/gallery.css")` after the existing `(resources.Get "css/layout/homepage.css")` line.

- [ ] **Step 3: Build check**

```bash
hugo --gc --minify
```

Expected: exits 0. Inspect the bundled CSS:

```bash
grep -c 'gallery__bento\|gallery__masonry' public/css/main.*.min.css
```

Expected: matches > 0 (the new rules are bundled).

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Add gallery layout CSS (bento grid + masonry columns)

6-column bento at the top, dashed iron-3 divider, then a CSS
multi-column masonry below (2 cols on phones → 3/4/5 at progressively
wider breakpoints). Masonry items have iron-3 borders that lift to
plasma on hover; cursor-zoom-in signals click-to-lightbox.
EOF
)"
```

---

## Task 5: Gallery template — `layouts/gallery/single.html`

**Files:**
- Create: `themes/am-mindmeld/layouts/gallery/single.html`

This template renders the gallery page from front-matter. Reads `params.bento` for the curated top section and `params.masonry` for the archive. The intro paragraph in the markdown body still renders.

- [ ] **Step 1: Create the template**

```html
{{- /* themes/am-mindmeld/layouts/gallery/single.html */ -}}
{{ define "main" }}
<article class="gallery container">
  <h1 class="visually-hidden">{{ .Title }}</h1>

  {{ with .Content }}
  <div class="gallery__intro">{{ . }}</div>
  {{ end }}

  {{ with .Params.bento }}
  <section class="gallery__bento-section" aria-labelledby="bento-heading">
    {{ partial "section-heading.html" (dict "number" "01" "title" "Selected" "id" "bento-heading") }}
    <div class="gallery__bento" data-lightbox-group="bento">
      {{ range . }}
      {{ partial "bento-cell.html" (dict
          "path" .src
          "caption" (.caption | default "")
          "span" (.span | default 1)
          "aspect" (.aspect | default 1)
          "href" "#")
      }}
      {{ end }}
    </div>
  </section>

  <hr class="gallery__divider">
  {{ end }}

  {{ with .Params.masonry }}
  <section class="gallery__masonry-section" aria-labelledby="masonry-heading">
    {{ partial "section-heading.html" (dict "number" "02" "title" "Archive" "id" "masonry-heading") }}
    <div class="gallery__masonry" data-lightbox-group="masonry">
      {{ range . }}
      <a href="#" class="gallery__masonry-item" data-src="{{ (resources.Get .src).RelPermalink | default .src }}" data-caption="{{ .caption | default "" }}">
        {{ partial "responsive-image.html" (dict "path" .src "alt" (.caption | default "")) }}
        {{ with .caption }}<div class="gallery__masonry-caption">{{ . }}</div>{{ end }}
      </a>
      {{ end }}
    </div>
  </section>
  {{ end }}
</article>

{{ partial "lightbox.html" . }}
{{ end }}
```

(Note: `.visually-hidden` class on the page title — it's already present in semantics via `<title>`. Add it to base.css if not already there. Check `base.css`; if missing, add the rule below.)

- [ ] **Step 2: Verify `.visually-hidden` rule exists in `base.css`**

```bash
grep -c 'visually-hidden' themes/am-mindmeld/assets/css/base.css
```

If 0, append this to `themes/am-mindmeld/assets/css/base.css`:

```css
/* a11y: visually hide while staying available to screen readers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 3: Create a stub `lightbox.html` partial so the template doesn't error**

```bash
mkdir -p themes/am-mindmeld/layouts/partials
cat > themes/am-mindmeld/layouts/partials/lightbox.html <<'EOF'
{{- /* lightbox stub — full implementation lands in Task 7 */ -}}
EOF
```

- [ ] **Step 4: Build to verify the template compiles**

The gallery front-matter doesn't yet have `params.bento` or `params.masonry` (Task 6 adds them), so the template will render only the intro paragraph (`.Content`) and skip both sections. That's expected.

```bash
hugo --gc --minify
```

Expected: exits 0, no warnings.

```bash
ls public/gallery/index.html
```

Expected: file exists.

```bash
grep -E 'class="gallery container"' public/gallery/index.html
```

Expected: 1 match (template did render).

- [ ] **Step 5: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Add gallery template (gallery/single.html) + lightbox stub

Section-specific page template renders the gallery from front-matter:
.Params.bento drives the top curated grid (each entry: src, caption,
span, aspect), .Params.masonry drives the archive (each entry: src,
caption). The markdown body intro paragraph still renders above.
Both sections are wrapped in <section> elements with section-heading
partials and ARIA labelling.

Lightbox partial stub is in place; full lightbox lands in Task 7.
.visually-hidden a11y utility added to base.css if not already present.
EOF
)"
```

---

## Task 6: Convert gallery content to front-matter

**Files:**
- Modify: `content/gallery/index.md`

Replace the markdown body's `{{< gallery >}}` shortcode block with front-matter `params.bento` and `params.masonry` arrays. Keep the intro paragraph in the body.

The bento curation comes from the user's existing top-6 captioned items. Default aspect ratios chosen to balance the 6-column grid (12 columns total = 2 rows). User can adjust later.

- [ ] **Step 1: Replace `content/gallery/index.md` entirely**

```markdown
+++
title = "Art Gallery"
date = "2025-07-09"

# Bento — top curated section
[[params.bento]]
src = "gallery/ufo.jpg"
caption = "Krazy Kaiju! Acrylic on canvas."
span = 3
aspect = "16/10"

[[params.bento]]
src = "gallery/01.jpg"
caption = "Doodles on a Wacom in Photoshop."
span = 1
aspect = "1"

[[params.bento]]
src = "gallery/022.jpg"
caption = "Doodles with charcoal & pencil on paper."
span = 2
aspect = "1"

[[params.bento]]
src = "gallery/032.jpg"
caption = "Life Drawing with charcoal & pencil on paper."
span = 2
aspect = "1"

[[params.bento]]
src = "gallery/07.jpg"
caption = "Chicken Run & Coop. From 3D to Real World."
span = 2
aspect = "16/10"

[[params.bento]]
src = "gallery/039.jpg"
caption = "Space Arcade! From 3D to Real World."
span = 2
aspect = "16/10"

# Masonry — full archive
[[params.masonry]]
src = "gallery/012.jpg"

[[params.masonry]]
src = "gallery/010.jpg"

[[params.masonry]]
src = "gallery/023.jpg"

[[params.masonry]]
src = "gallery/020.jpg"

[[params.masonry]]
src = "gallery/021.jpg"

[[params.masonry]]
src = "gallery/024.jpg"

[[params.masonry]]
src = "gallery/016.jpg"

[[params.masonry]]
src = "gallery/014.jpg"

[[params.masonry]]
src = "gallery/015.jpg"

[[params.masonry]]
src = "gallery/034.jpg"

[[params.masonry]]
src = "gallery/013.jpg"

[[params.masonry]]
src = "gallery/041.jpg"

[[params.masonry]]
src = "gallery/033.jpg"

[[params.masonry]]
src = "gallery/031.jpg"

[[params.masonry]]
src = "gallery/030.jpg"

[[params.masonry]]
src = "gallery/029.jpg"

[[params.masonry]]
src = "gallery/028.jpg"

[[params.masonry]]
src = "gallery/027.jpg"

[[params.masonry]]
src = "gallery/026.jpg"

[[params.masonry]]
src = "gallery/025.jpg"

[[params.masonry]]
src = "gallery/037.jpg"

[[params.masonry]]
src = "gallery/035.jpg"

[[params.masonry]]
src = "gallery/011.jpg"

[[params.masonry]]
src = "gallery/036.jpg"

[[params.masonry]]
src = "gallery/038.jpg"

[[params.masonry]]
src = "gallery/05.jpg"

[[params.masonry]]
src = "gallery/06.jpg"

[[params.masonry]]
src = "gallery/04.jpg"

[[params.masonry]]
src = "gallery/018.jpg"
+++

A collection of my creations. I love exploring ideas across mediums. From sketchbook to canvas, digital to hands-on builds.
```

(Bento totals 12 column-spans across 6 columns = 2 rows. Masonry has 29 items in the order Adrian last approved — paintings/drawings/feature pieces are in the bento; the rest is in masonry.)

- [ ] **Step 2: Build and verify**

```bash
hugo --gc --minify
```

Expected: exits 0.

```bash
grep -c 'gallery__bento' public/gallery/index.html
echo '---'
grep -c 'gallery__masonry-item' public/gallery/index.html
```

Expected: 2 matches for bento (one for the wrapper class, one for div), 29 matches for masonry items.

```bash
grep -oE 'srcset="[^"]+"' public/gallery/index.html | wc -l
```

Expected: ~35 srcsets (6 bento + 29 masonry).

- [ ] **Step 3: Commit**

```bash
git add content/gallery/index.md
git commit -m "$(cat <<'EOF'
Gallery: move image lists from markdown to front-matter

The gallery now renders from declarative TOML front-matter
(params.bento + params.masonry) rather than from {{< gallery >}}
shortcodes in the body. Keeps the intro paragraph in the body so
the .Content render pulls only the prose.

Bento: ufo, 01, 022, 032, 07, 039 with varying spans (3+1+2+2+2+2 =
12 cols across 2 rows on a 6-col grid).

Masonry: 29 items in the order previously approved. Phase 5 may
revisit captions on the uncaptioned items.
EOF
)"
```

---

## Task 7: Lightbox — markup, CSS, and vanilla JS

**Files:**
- Create: `themes/am-mindmeld/assets/css/components/lightbox.css`
- Modify: `themes/am-mindmeld/layouts/partials/head.html` — add lightbox.css to the bundle
- Replace: `themes/am-mindmeld/layouts/partials/lightbox.html` — full lightbox markup + inline JS

The lightbox is a `<dialog>`-style modal with a backdrop, a centered `<img>`, prev/next buttons, a close button, and a caption. Vanilla JS intercepts clicks on `[data-lightbox-group]` containers and their child `<a>` links.

- [ ] **Step 1: Create lightbox.css**

```css
/* themes/am-mindmeld/assets/css/components/lightbox.css */

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: none;
  background: rgba(11, 14, 16, 0.94);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  align-items: center;
  justify-content: center;
  padding: var(--sp-5);
  opacity: 0;
  transition: opacity var(--t-load) var(--ease-out);
}
.lightbox--open {
  display: flex;
  opacity: 1;
}

.lightbox__stage {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-3);
}

.lightbox__img {
  max-width: 100%;
  max-height: calc(100vh - 120px);
  object-fit: contain;
  display: block;
  border: 1px solid var(--iron-3);
  background: var(--iron);
}

.lightbox__caption {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  color: var(--plasma);
  letter-spacing: 0.06em;
  text-align: center;
  max-width: 80ch;
}

.lightbox__btn {
  position: absolute;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--carbon);
  color: var(--bone);
  border: 1px solid var(--iron-3);
  font-family: var(--font-body);
  font-size: var(--fs-18);
  cursor: pointer;
  transition: color var(--t-base) var(--ease-out), border-color var(--t-base) var(--ease-out);
}
.lightbox__btn:hover { color: var(--plasma); border-color: var(--plasma); }
.lightbox__btn:active { transform: scale(0.94); transition-duration: var(--t-active); }

.lightbox__btn--close { top: var(--sp-3); right: var(--sp-3); }
.lightbox__btn--prev  { left: var(--sp-3);  top: 50%; transform: translateY(-50%); }
.lightbox__btn--next  { right: var(--sp-3); top: 50%; transform: translateY(-50%); }
.lightbox__btn--prev:active { transform: translateY(-50%) scale(0.94); }
.lightbox__btn--next:active { transform: translateY(-50%) scale(0.94); }

.lightbox__counter {
  position: absolute;
  bottom: var(--sp-3);
  right: var(--sp-3);
  font-family: var(--font-body);
  font-size: var(--fs-11);
  color: var(--bone-dim);
  letter-spacing: 0.1em;
}

@media (max-width: 720px) {
  .lightbox__btn--prev { left: var(--sp-2); }
  .lightbox__btn--next { right: var(--sp-2); }
}
```

- [ ] **Step 2: Add lightbox.css to the CSS bundle**

In `themes/am-mindmeld/layouts/partials/head.html`, append `(resources.Get "css/components/lightbox.css")` to the `$css := slice` block, after the gallery layout entry.

- [ ] **Step 3: Replace `lightbox.html` partial with the real implementation**

```html
{{- /* themes/am-mindmeld/layouts/partials/lightbox.html */ -}}
<div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-caption" hidden>
  <button class="lightbox__btn lightbox__btn--close" type="button" aria-label="Close" data-lightbox-action="close">×</button>
  <button class="lightbox__btn lightbox__btn--prev"  type="button" aria-label="Previous image" data-lightbox-action="prev">‹</button>
  <button class="lightbox__btn lightbox__btn--next"  type="button" aria-label="Next image" data-lightbox-action="next">›</button>
  <div class="lightbox__stage">
    <img class="lightbox__img" src="" alt="">
    <div id="lightbox-caption" class="lightbox__caption"></div>
  </div>
  <div class="lightbox__counter" aria-live="polite"></div>
</div>
<script>
(function () {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var img = lb.querySelector('.lightbox__img');
  var caption = lb.querySelector('.lightbox__caption');
  var counter = lb.querySelector('.lightbox__counter');
  var btnClose = lb.querySelector('[data-lightbox-action="close"]');
  var btnPrev  = lb.querySelector('[data-lightbox-action="prev"]');
  var btnNext  = lb.querySelector('[data-lightbox-action="next"]');

  var items = [];
  var current = 0;
  var lastFocus = null;

  function collect(group) {
    var container = document.querySelector('[data-lightbox-group="' + group + '"]');
    if (!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll('a')).map(function (a) {
      var srcEl = a.querySelector('img');
      var fullSrc = a.getAttribute('data-src') || (srcEl && srcEl.currentSrc) || (srcEl && srcEl.src) || a.getAttribute('href');
      return {
        src: fullSrc,
        alt: (srcEl && srcEl.alt) || '',
        caption: a.getAttribute('data-caption') || (srcEl && srcEl.alt) || ''
      };
    });
  }

  function show(idx) {
    if (!items.length) return;
    current = (idx + items.length) % items.length;
    var it = items[current];
    img.src = it.src;
    img.alt = it.alt;
    caption.textContent = it.caption;
    counter.textContent = (current + 1) + ' / ' + items.length;
  }

  function open(group, startIdx) {
    items = collect(group);
    if (!items.length) return;
    lastFocus = document.activeElement;
    show(startIdx);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('lightbox--open'); });
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lb.classList.remove('lightbox--open');
    setTimeout(function () {
      lb.hidden = true;
      img.src = '';
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, 240);
  }

  function prev() { show(current - 1); }
  function next() { show(current + 1); }

  // Click handlers on lightbox-group containers (event delegation)
  document.querySelectorAll('[data-lightbox-group]').forEach(function (container) {
    container.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || !container.contains(a)) return;
      e.preventDefault();
      var group = container.getAttribute('data-lightbox-group');
      var anchors = Array.prototype.slice.call(container.querySelectorAll('a'));
      open(group, anchors.indexOf(a));
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  lb.addEventListener('click', function (e) {
    // Close on backdrop click (target is lightbox itself, not a child)
    if (e.target === lb) close();
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'Tab') {
      // Trap focus inside the lightbox
      var focusables = lb.querySelectorAll('button');
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });
})();
</script>
```

Notes:
- The lightbox builds its image list lazily on open (calls `collect()` against the `[data-lightbox-group]` container at click time). This means image lists update if the DOM changes (rare, but defensive).
- It reads `data-src` from each `<a>` first, then falls back to the inner image's `currentSrc` / `src`. The masonry items pass `data-src` explicitly (the original full-resolution image URL); the bento items use `data-src` too once we wire them up. (Bento cells currently have a "/gallery/" href — that's a problem because clicking them would navigate to /gallery/ not open a lightbox. Patch: bento markup needs `data-src` and an `href="#"`.)

- [ ] **Step 4: Update bento-cell to set data-src for lightbox compatibility**

The bento partial generates an `<a>` with `href="..."` (default `/gallery/`). For the lightbox to open from bento clicks, the `<a>` needs:
- `data-src` pointing at the full-resolution image
- `href="#"` (so the anchor still acts like a link for non-JS users, but the JS prevents default)

Or alternatively, bento clicks should still navigate to `/gallery/` (consistent with Phase 1 behavior) and only masonry clicks open the lightbox.

Decision: **bento clicks open the lightbox** when on the gallery page (via the `data-lightbox-group="bento"` parent), and link to `/gallery/` when on the homepage (no `data-lightbox-group` parent, so JS won't intercept). To enable this, the bento partial needs to expose `data-src` and the original-resolution URL.

Update `themes/am-mindmeld/layouts/partials/bento-cell.html` to add `data-src` and `data-caption` attributes to the `<a>`:

```html
{{- /* themes/am-mindmeld/layouts/partials/bento-cell.html */ -}}
{{- /* params: path, src, caption, span, aspect, href */ -}}
{{- $path := .path -}}
{{- $src := .src -}}
{{- $caption := .caption | default "" -}}
{{- $span := .span | default 1 -}}
{{- $aspect := .aspect | default 1 -}}
{{- $href := .href | default ("/gallery/" | relURL) -}}

{{- $useAssetPath := false -}}
{{- $resolvedFullSrc := "" -}}
{{- if $path -}}
  {{- $useAssetPath = true -}}
  {{- $img := resources.Get $path -}}
  {{- if $img -}}{{- $resolvedFullSrc = $img.RelPermalink -}}{{- end -}}
{{- else if $src -}}
  {{- $stripped := strings.TrimPrefix "/" $src -}}
  {{- $maybeAsset := resources.Get $stripped -}}
  {{- if $maybeAsset -}}
    {{- $path = $stripped -}}
    {{- $useAssetPath = true -}}
    {{- $resolvedFullSrc = $maybeAsset.RelPermalink -}}
  {{- else -}}
    {{- $resolvedFullSrc = $src -}}
  {{- end -}}
{{- end -}}

<a class="bento-cell bento-cell--span-{{ $span }}"
   href="{{ $href }}"
   data-src="{{ $resolvedFullSrc }}"
   data-caption="{{ $caption }}"
   style="aspect-ratio: {{ printf "%v" $aspect | safeCSS }};">
  {{- if $useAssetPath -}}
    {{ partial "responsive-image.html" (dict "path" $path "alt" $caption "class" "bento-cell__img") }}
  {{- else -}}
    <img src="{{ $src }}" alt="{{ $caption }}" loading="lazy" class="bento-cell__img">
  {{- end -}}
  {{ with $caption }}<span class="bento-cell__caption">{{ . }}</span>{{ end }}
</a>
```

(Adds `data-src` and `data-caption` attributes. Behavior unchanged for callers that don't wrap the bento in `[data-lightbox-group]`.)

- [ ] **Step 5: Build and test**

```bash
hugo --gc --minify
```

Expected: exits 0.

Verify the lightbox markup renders on the gallery page and not on the homepage:

```bash
grep -c 'class="lightbox"' public/gallery/index.html
echo '---'
grep -c 'class="lightbox"' public/index.html
```

Expected: 1 for gallery (via the partial called from `gallery/single.html`), 0 for homepage (the homepage template doesn't call the lightbox partial).

Verify the bento and masonry items have `data-src` set:

```bash
grep -oE 'data-src="[^"]+"' public/gallery/index.html | head -3
```

Expected: matches showing the resized full-resolution paths.

Manual check with `hugo server -D` is recommended:
- Open `http://localhost:1313/gallery/`
- Click a bento image → lightbox opens
- Press → / ← → moves through items
- Esc → closes
- Click backdrop → closes
- Click a masonry image → lightbox opens (separate group from bento)

- [ ] **Step 6: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Add lightbox (modal markup + CSS + vanilla JS)

A vanilla-JS lightbox loads only on pages that include the partial.
Click a bento or masonry item → modal opens with the original
full-resolution image, plasma caption, item counter. Prev/next
buttons + arrow keys navigate. Backdrop click, close button, or
Escape closes. Focus trapped inside the modal while open;
restored to the trigger element on close. Body scroll locked
while open.

Bento and masonry are independent groups (data-lightbox-group),
so the prev/next from a bento item stays within the bento set.
EOF
)"
```

---

## Task 8: Smoke check + Lighthouse + a11y

**Files:** none (verification only)

- [ ] **Step 1: Production build**

```bash
hugo --gc --minify --logLevel info
```

Expected:
- Exit 0
- No warnings (especially watch for image pipeline errors like "Resize: …")
- CSS bundle size: `ls -la public/css/main.*.min.css` — should be under 30 KB
- Image variants count: `ls public/gallery/ | wc -l` — should be many (each source produces 4 variants × 35 sources = ~140 files)

- [ ] **Step 2: Per-page checks**

```bash
echo '=== Homepage bento using new pipeline ==='
grep -oE 'srcset="[^"]+"' public/index.html | wc -l
# Expect: 3 (one per bento cell)

echo '=== Gallery bento renders ==='
grep -c 'class="bento-cell' public/gallery/index.html
# Expect: 6

echo '=== Gallery masonry renders ==='
grep -c 'gallery__masonry-item' public/gallery/index.html
# Expect: 29

echo '=== Lightbox markup present on gallery only ==='
grep -c 'class="lightbox"' public/gallery/index.html
grep -c 'class="lightbox"' public/index.html
# Expect: 1, 0

echo '=== Other pages still build ==='
ls public/projects/mw3/index.html public/about/index.html public/tools/ez_rigging/index.html public/contact/index.html public/index.html
# Expect: all present

echo '=== Mobile hamburger still works ==='
grep -c 'site-header__menu-toggle' public/index.html
# Expect: 2 (button + JS reference)
```

- [ ] **Step 3: A11y spot-checks**

```bash
echo '=== Lightbox a11y attributes ==='
grep -oE '<div id="lightbox"[^>]+>' public/gallery/index.html | head -1
# Expect: role="dialog" aria-modal="true" aria-labelledby="lightbox-caption" hidden

echo '=== Section headings inside gallery ==='
grep -oE '<h2[^>]+section-heading__title[^>]*>[^<]+' public/gallery/index.html
# Expect: matches for "SELECTED" and "ARCHIVE"

echo '=== ARIA labels on sections ==='
grep -oE 'aria-labelledby="[^"]+"' public/gallery/index.html
# Expect: bento-heading and masonry-heading

echo '=== Lazy loading on masonry images ==='
grep -oE 'loading="lazy"' public/gallery/index.html | wc -l
# Expect: ≥35 (most/all images)
```

- [ ] **Step 4: Browser-tab manual checks**

Run `hugo server -D`, visit `http://localhost:1313/gallery/`, and verify:

1. **Visual:** bento renders at top with varied sizes (large kaiju + smaller cells), divider, masonry below in 3-5 columns depending on viewport
2. **Performance:** images load lazily as you scroll (open Network tab, scroll, observe new image loads)
3. **Lightbox:** click any image, navigate with arrows, close with Esc
4. **Mobile:** resize to <720px or use Chrome DevTools mobile emulation. Bento and masonry should reflow. Lightbox should still work.
5. **Reduced motion:** in DevTools Rendering panel, set `prefers-reduced-motion: reduce`. Lightbox open animation should be effectively instant.
6. **Lighthouse on /gallery/:** run Lighthouse Performance + Accessibility + Best Practices. Target:
   - Performance: ≥85 (large image gallery; LQIP + lazy loading help, srcset helps)
   - Accessibility: ≥95 (we covered all the basics)
   - Best Practices: ≥95

Stop the dev server.

- [ ] **Step 5: Commit (empty if no fixes needed)**

```bash
git commit --allow-empty -m "$(cat <<'EOF'
Smoke-check + a11y pass for Phase 2 gallery

Verified production build, image pipeline produces srcset variants
for all gallery images (~140 generated files), lightbox a11y attrs
present, lazy loading on all masonry images, all pages still build.
Manual Lighthouse run on /gallery/ confirms targets met.
EOF
)"
```

---

## Task 9: Phase 2 wrap-up — README update + tag

**Files:**
- Modify: `themes/am-mindmeld/README.md`

- [ ] **Step 1: Update README known gaps**

Edit `themes/am-mindmeld/README.md`. The "Known gaps" section currently lists:
- Project page templates (Phase 3)
- Gallery / about / contact templates (Phases 2 and 4)

Update the second bullet to remove "gallery" since it's now done:

Change:
```
- **Gallery / about / contact templates** — same situation; Phases 2 and 4 own them.
```

To:
```
- **About / contact templates** — same situation; Phase 4 owns them.
```

- [ ] **Step 2: Build to confirm clean**

```bash
hugo --gc --minify
```

Expected: exits 0.

- [ ] **Step 3: Commit + tag**

```bash
git add themes/am-mindmeld/README.md
git commit -m "$(cat <<'EOF'
Phase 2 wrap-up: gallery removed from Known gaps

The new gallery template (bento + masonry + lightbox) ships in this
phase. README updated to reflect that Phase 4 only owns about and
contact templates now.
EOF
)"

git tag phase-2-gallery-rebuild
```

---

## Self-review

**Spec coverage:**
- Master spec → Gallery: bento highlights → Task 5, Task 6 ✓
- Master spec → Gallery: justified masonry → Task 4 (CSS), Task 5 (template), Task 6 (content) ✓
- Master spec → Gallery: lightbox with prev/next/Esc/click-outside → Task 7 ✓
- Master spec → Gallery: image preprocessing (srcset, intrinsic dims, LQIP) → Task 1 ✓
- Master spec → Gallery: ≤80 images so no category filters yet → no task; deferred per spec ✓
- Phase 1 plan called out moving from `static/gallery/` to Hugo pipeline → Tasks 1+2+3+5+6 ✓ (static/gallery/ now redundant; Phase 5 cleanup removes it)

**Placeholder scan:** No "TBD", "TODO", "fill in later." Each step has complete code or exact commands.

**Type / signature consistency:**
- `responsive-image.html` params: `path`, `alt`, `class`, `sizes`, `loading`, `max` — used identically in figure, bento-cell, gallery template, masonry items
- `bento-cell.html` params: `path` (preferred), `src` (legacy), `caption`, `span`, `aspect`, `href` — consistent across homepage and gallery callers
- Front-matter shape: `[[params.bento]]` and `[[params.masonry]]` arrays with `src`, `caption`, `span`, `aspect` keys — matches what the gallery template reads
- `data-lightbox-group` attribute and `data-src` / `data-caption` data attributes — set in bento-cell partial and gallery template, read in lightbox.html JS

**Ambiguity check:** None — every task has explicit verification steps.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-08-phase2-gallery-rebuild.md`. Two execution options:

**1. Subagent-Driven (recommended)** — same flow as Phase 1. I dispatch a fresh subagent per task, review between tasks. 9 tasks total, smaller than Phase 1's 20.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
