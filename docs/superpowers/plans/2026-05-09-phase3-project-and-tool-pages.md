# Phase 3 — Project & Tool Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal fallback templates currently used by `/projects/`, `/tools/`, and every project/tool detail page with proper Mindmeld-aesthetic templates: year-grouped zig-zag list pages, and detail pages with a terminal-frame hero, metadata strip, body content, image grid, credits panel, and prev/next pager.

**Architecture:** Section-specific Hugo templates (`layouts/projects/list.html`, `layouts/projects/single.html`, plus mirrors under `layouts/tools/`) thin-wrap shared partials so projects and tools render identically while leaving room for future divergence. Templates read structured metadata from new optional `[params]` front-matter fields and degrade gracefully when fields are missing — Adrian backfills content over time. The image grid reuses the gallery's CSS multi-column masonry pattern, scoped to a new component class. Hugo's built-in `.NextInSection` / `.PrevInSection` drives the pager. No JavaScript.

**Tech Stack:** Hugo Extended ≥ 0.147 (already pinned in CI from the Phase 2 fix), plain CSS via the existing resources pipeline, no new dependencies.

**Reference documents:**
- Master spec: `docs/superpowers/specs/2026-05-07-portfolio-mindmeld-redesign-design.md` (Section 3 → "Project list page" and "Project detail page")
- Phase 1 plan: existing `project-card-zig.html` partial we'll reuse for list pages
- Phase 2 plan: image-pipeline patterns (`responsive-image.html`, `[data-lightbox-group]`, masonry CSS)

---

## Design choices locked in by this plan

The master spec covers Phase 3 at design level. Implementation choices made here:

- **Templates per section, partials shared:** `layouts/projects/list.html` and `layouts/tools/list.html` are thin (~3 lines each), both calling `partials/section-list-zigzag.html`. Same pattern for `single.html`. Keeps the per-section file existing as Hugo expects, but the actual rendering logic lives in one place.
- **Project list grouping:** by year, using Hugo's `.GroupByDate "2006"`. Year groups are ember `YYYY //` section headings.
- **Image grid source:** auto-discover from page bundle. Images matching `*.{jpg,png,webp}` minus `featured*` appear in the grid. No need for a `[[params.images]]` array unless an order is desired.
- **Image grid layout:** CSS multi-column masonry (same pattern as gallery), scoped to `.project-images` class. 2 cols on mobile, 3 cols on desktop. No lightbox in v1 — clicks open the raw image in a new tab. Lightbox is a Phase 5 enhancement.
- **Hero image source:** the bundle's `featured.{png,jpg,webp}` resource (Hugo's `.Resources.GetMatch "featured*"`). Aspect ratio preserved — no enforced 16:9 crop.
- **Credits panel:** rendered only if at least one of `role`, `studio`, `engine`, `platform`, `team_size` is set in front-matter. Otherwise hidden — no empty box.
- **Prev/next pager:** uses Hugo's `.NextInSection` and `.PrevInSection`. Wraps within the section, NOT chronological across all content. So on `/projects/mw3/`, "next" goes to the next project by date in `/projects/`.
- **Reference content migration:** Task 1 populates `content/projects/krazy_kaiju/index.md` with the full new front-matter as a worked example. The other 17 detail pages keep their current minimal front-matter — they render gracefully without metadata, and Adrian can backfill in Phase 5 (or any time) by following the Krazy Kaiju pattern.

---

## File structure

### Created in this phase

```
themes/am-mindmeld/
├── assets/
│   └── css/
│       └── layout/
│           ├── project-list.css                     # year-grouped list page styles
│           └── project-detail.css                   # hero, metadata strip, image grid, credits, pager
├── layouts/
│   ├── projects/
│   │   ├── list.html                                # /projects/ — calls section-list-zigzag partial
│   │   └── single.html                              # individual project page — calls project-detail partial
│   ├── tools/
│   │   ├── list.html                                # /tools/ — same pattern
│   │   └── single.html                              # individual tool page — same pattern
│   └── partials/
│       ├── section-list-zigzag.html                 # year-grouped zig-zag rendering
│       ├── project-detail.html                      # terminal-frame hero + metadata + body + grid + credits + pager
│       ├── credits-panel.html                       # bottom-of-page label/value list
│       └── prev-next-pager.html                     # ← prev / next → links
```

### Modified in this phase

- `themes/am-mindmeld/layouts/partials/head.html` — add `project-list.css` and `project-detail.css` to the bundle
- `content/projects/krazy_kaiju/index.md` — populated with new front-matter fields as the reference example
- `themes/am-mindmeld/README.md` — document the new optional `[params]` fields under a "Project / tool front-matter" section; remove "Project page templates" from Known gaps

### Untouched

- `layouts/_default/single.html` and `layouts/_default/list.html` — stay as the minimal fallback for `/about/`, `/contact/`, taxonomy pages, and anything else without a section template. Phase 4 redesigns about + contact specifically.
- 17 of 18 project/tool `index.md` files — keep current minimal front-matter. Templates render them with hero image + body content but no metadata strip / credits panel until Adrian backfills.

---

## Front-matter schema (read by the new templates)

These fields are all optional. Empty / missing fields cause the corresponding UI to hide.

```toml
[params]
role         = "Lead Technical Artist"   # appears in metadata strip + credits
studio       = "Sledgehammer Games"      # appears in metadata strip + credits
shipped_year = "2023"                    # appears in metadata strip; falls back to .Date year if unset
status       = "shipped"                 # "shipped" → plasma SHIPPED pill; "in_development" → ember IN_DEVELOPMENT pill; missing → no pill
engine       = "IW Engine"               # appears in credits only
platform     = "PC, PS5, Xbox Series"    # appears in credits only
team_size    = "AAA scale"               # appears in credits only
```

The existing fields (`title`, `description`, `date`) continue to be used by both the homepage zig-zag (Phase 1) and the new list/detail templates.

---

## Verification approach

Same as previous phases: Hugo themes don't have unit tests. Each task uses:

1. **Build check:** `hugo --gc --minify` exits 0 with no warnings
2. **HTML output check:** inspect rendered files under `public/` for expected markup
3. **Smoke check at end of phase:** Lighthouse on `/projects/`, `/projects/krazy_kaiju/`, `/tools/`, `/tools/rig_authoring_framework/`

---

## Task 1: Front-matter schema + Krazy Kaiju reference example

**Files:**
- Modify: `content/projects/krazy_kaiju/index.md`
- Modify: `themes/am-mindmeld/README.md`

This task documents the new optional fields and populates one project as a worked example so the templates have meaningful content to render against. The remaining 17 project/tool files keep their minimal front-matter and degrade gracefully through later tasks.

- [ ] **Step 1: Update `content/projects/krazy_kaiju/index.md` front-matter**

Read the current file first, preserve the body content. Replace ONLY the front-matter block (between the `+++` markers). The new front-matter:

```toml
+++
title = "Krazy Kaiju! (Unreal)"
description = "A VR game made in Unreal where a lonely farmer protects his farm from an alien invasion!"
date = "2020-12-01"

[params]
role = "Solo developer"
studio = "Personal Project"
shipped_year = "In progress"
status = "in_development"
engine = "Unreal Engine"
platform = "VR"
+++
```

Keep the body content (everything after the closing `+++`) unchanged.

- [ ] **Step 2: Add a "Project / tool front-matter" section to the theme README**

Append this section to `themes/am-mindmeld/README.md` immediately before the existing `## Known gaps` heading:

```markdown
## Project / tool front-matter

Each project (`content/projects/*/index.md`) or tool (`content/tools/*/index.md`)
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
```

- [ ] **Step 3: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. The new front-matter fields are inert until later tasks read them, so this build only confirms the TOML parses cleanly.

```bash
grep -c '^role = ' content/projects/krazy_kaiju/index.md
```

Expected: 1 (front-matter is valid TOML and includes `role`).

- [ ] **Step 4: Commit**

```bash
git add content/projects/krazy_kaiju/index.md themes/am-mindmeld/README.md
git commit -m "$(cat <<'EOF'
Project front-matter schema + Krazy Kaiju reference

Documents 7 new optional [params] fields (role, studio, shipped_year,
status, engine, platform, team_size) read by the Phase 3 list and
detail templates. All optional; missing fields cause the corresponding
UI to hide.

Krazy Kaiju populated as the worked example so the new templates
have at least one fully-populated reference content.
EOF
)"
```

## Report

- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED
- Confirmation Krazy Kaiju front-matter has all 7 new fields
- Confirmation README has the new section
- Build output (any warnings?)
- Commit SHA

---

## Task 2: `prev-next-pager` partial

**Files:**
- Create: `themes/am-mindmeld/layouts/partials/prev-next-pager.html`

Renders `← prev project` / `next project →` links at the bottom of detail pages. Uses Hugo's `.NextInSection` / `.PrevInSection` to navigate within the same section.

- [ ] **Step 1: Create the partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/prev-next-pager.html */ -}}
{{- /* Receives a Hugo Page (the current detail page) as the dot context. */ -}}
{{- $prev := .PrevInSection -}}
{{- $next := .NextInSection -}}
{{- if or $prev $next -}}
<nav class="prev-next-pager" aria-label="Within this section">
  <div class="prev-next-pager__inner container">
    {{- if $prev -}}
    <a class="prev-next-pager__link prev-next-pager__link--prev" href="{{ $prev.RelPermalink }}" rel="prev">
      <span class="prev-next-pager__arrow" aria-hidden="true">←</span>
      <span class="prev-next-pager__direction">Previous</span>
      <span class="prev-next-pager__title">{{ $prev.Title }}</span>
    </a>
    {{- else -}}
    <span class="prev-next-pager__placeholder" aria-hidden="true"></span>
    {{- end -}}

    {{- if $next -}}
    <a class="prev-next-pager__link prev-next-pager__link--next" href="{{ $next.RelPermalink }}" rel="next">
      <span class="prev-next-pager__direction">Next</span>
      <span class="prev-next-pager__title">{{ $next.Title }}</span>
      <span class="prev-next-pager__arrow" aria-hidden="true">→</span>
    </a>
    {{- else -}}
    <span class="prev-next-pager__placeholder" aria-hidden="true"></span>
    {{- end -}}
  </div>
</nav>
{{- end -}}
```

The `prev-next-pager__placeholder` keeps the prev and next links left- and right-aligned even when one side is missing — the grid layout in CSS uses `1fr 1fr`.

- [ ] **Step 2: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. The partial isn't called yet, so it's inert.

- [ ] **Step 3: Commit**

```bash
git add themes/am-mindmeld/layouts/partials/prev-next-pager.html
git commit -m "$(cat <<'EOF'
Add prev-next-pager partial

Bottom-of-detail-page navigation using Hugo's .NextInSection /
.PrevInSection. Renders only if either prev or next exists; uses a
placeholder span on the missing side so the remaining link stays
visually anchored to its grid edge.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- Commit SHA

---

## Task 3: `credits-panel` partial

**Files:**
- Create: `themes/am-mindmeld/layouts/partials/credits-panel.html`

Renders a label/value list at the bottom of detail pages, just above the prev/next pager. Hides entirely when no credit fields are set.

- [ ] **Step 1: Create the partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/credits-panel.html */ -}}
{{- /* Receives a Hugo Page (the current detail page) as the dot context.
       Reads .Params.role, .Params.studio, .Params.engine, .Params.platform,
       .Params.team_size. Hides the panel entirely if all are missing. */ -}}
{{- $p := .Params -}}
{{- $hasAny := or $p.role (or $p.studio (or $p.engine (or $p.platform $p.team_size))) -}}
{{- if $hasAny -}}
<aside class="credits-panel" aria-labelledby="credits-heading">
  {{ partial "section-heading.html" (dict "number" "" "title" "Credits" "id" "credits-heading") }}
  <dl class="metadata-list credits-panel__list">
    {{ with $p.role }}<dt>Role</dt><dd>{{ . }}</dd>{{ end }}
    {{ with $p.studio }}<dt>Studio</dt><dd>{{ . }}</dd>{{ end }}
    {{ with $p.engine }}<dt>Engine</dt><dd>{{ . }}</dd>{{ end }}
    {{ with $p.platform }}<dt>Platform</dt><dd>{{ . }}</dd>{{ end }}
    {{ with $p.team_size }}<dt>Team</dt><dd>{{ . }}</dd>{{ end }}
  </dl>
</aside>
{{- end -}}
```

The `metadata-list` CSS class already exists from Phase 1 (ember dt + bone dd). We're reusing it inside `credits-panel__list` for the actual rows.

- [ ] **Step 2: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. Partial isn't called yet.

- [ ] **Step 3: Commit**

```bash
git add themes/am-mindmeld/layouts/partials/credits-panel.html
git commit -m "$(cat <<'EOF'
Add credits-panel partial

Bottom-of-detail label/value list (role, studio, engine, platform,
team_size). Reuses the metadata-list class from Phase 1 for ember
labels + bone values. Hides the entire panel when none of the credit
fields are set in front-matter — no empty box.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- Commit SHA

---

## Task 4: `section-list-zigzag` partial

**Files:**
- Create: `themes/am-mindmeld/layouts/partials/section-list-zigzag.html`

Renders the body of a section list page: optional intro paragraph, then year-grouped zig-zag of pages within the section. Reuses `partials/project-card-zig.html` from Phase 1 for each card.

- [ ] **Step 1: Create the partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/section-list-zigzag.html */ -}}
{{- /* Receives the list page (.) as context. Renders:
       - terminal-frame titlebar hero ("section.list" title)
       - optional .Content intro
       - year groups: ember "YYYY //" heading, then zig-zag cards
*/ -}}
{{- $section := .Section -}}
{{- $titleBar := printf "%s.list" $section -}}

<div class="project-list container">

  {{- /* Page hero: titlebar-only terminal frame */ -}}
  {{ partial "terminal-frame.html" (dict "title" $titleBar "variant" "titlebar") }}

  {{- /* Optional intro from .Content */ -}}
  {{ with .Content }}
  <div class="project-list__intro">{{ . }}</div>
  {{ end }}

  {{- /* Year-grouped zig-zag */ -}}
  {{ $sectionPages := where .Site.RegularPages "Section" $section }}
  {{ range $sectionPages.GroupByDate "2006" }}
  <section class="project-list__year" aria-labelledby="year-{{ .Key }}">
    <header class="project-list__year-heading" id="year-{{ .Key }}">
      <span class="project-list__year-num">{{ .Key }} //</span>
      <span class="project-list__year-rule" aria-hidden="true"></span>
    </header>
    {{ range $i, $page := .Pages }}
      {{ partial "project-card-zig.html" (dict "page" $page "index" $i) }}
    {{ end }}
  </section>
  {{ end }}
</div>
```

The card partial `project-card-zig.html` already exists from Phase 1 — same one used by the homepage. It alternates image-left / image-right based on `index`.

- [ ] **Step 2: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. Partial isn't called yet.

- [ ] **Step 3: Commit**

```bash
git add themes/am-mindmeld/layouts/partials/section-list-zigzag.html
git commit -m "$(cat <<'EOF'
Add section-list-zigzag partial

Renders a list page body: titlebar-only terminal frame at the top,
optional intro from .Content, then zig-zag project-card-zig items
grouped by year (ember YYYY //) with a fading rule.

Reuses project-card-zig.html from Phase 1 — same component as the
homepage recent-projects section. Index passed to the card determines
image-left vs image-right alternation.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- Commit SHA

---

## Task 5: `project-detail` partial

**Files:**
- Create: `themes/am-mindmeld/layouts/partials/project-detail.html`

The biggest partial in this phase — assembles the entire detail page body: terminal-frame hero with metadata strip, body content, image grid, credits panel, prev/next pager.

- [ ] **Step 1: Create the partial**

```html
{{- /* themes/am-mindmeld/layouts/partials/project-detail.html */ -}}
{{- /* Receives the current Page as context. */ -}}
{{- $p := .Params -}}

{{- /* Resolve fields with sensible fallbacks */ -}}
{{- $role := $p.role -}}
{{- $studio := $p.studio -}}
{{- $year := $p.shipped_year | default (.Date.Format "2006") -}}
{{- $status := $p.status -}}

{{- /* Terminal-frame title: "role · studio · year" with present-only fallbacks */ -}}
{{- $titleParts := slice -}}
{{- with $role -}}{{ $titleParts = $titleParts | append . }}{{- end -}}
{{- with $studio -}}{{ $titleParts = $titleParts | append . }}{{- end -}}
{{- with $year -}}{{ $titleParts = $titleParts | append . }}{{- end -}}
{{- $framTitle := delimit $titleParts " · " -}}
{{- if not $framTitle -}}{{- $framTitle = .Title -}}{{- end -}}

{{- /* Hero image — featured.{png,jpg,webp} from the page bundle */ -}}
{{- $hero := .Resources.GetMatch "featured*" -}}

<article class="project-detail">

  {{- /* Hero terminal frame */ -}}
  <header class="project-detail__hero">
    <div class="term-frame term-frame--full project-detail__frame">
      <div class="term-frame__bar">
        <div class="term-frame__lights" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <span class="term-frame__title">{{ $framTitle }}</span>
        {{ with $status }}
          {{ if eq . "shipped" }}
            {{ partial "status-pill.html" (dict "variant" "shipped" "label" "Shipped") }}
          {{ else if eq . "in_development" }}
            {{ partial "status-pill.html" (dict "variant" "warn" "label" "In development") }}
          {{ end }}
        {{ end }}
      </div>
      <div class="term-frame__body project-detail__hero-body">
        {{ if $hero }}
          {{- /* If the hero is in the page bundle, use the responsive-image partial.
                 The partial's path arg expects an asset-relative path; page resources
                 use a different code path via .RelPermalink directly. */ -}}
          <img
            src="{{ $hero.RelPermalink }}"
            alt="{{ .Title }} — featured image"
            class="project-detail__hero-img"
            loading="eager"
            decoding="async">
        {{ end }}

        {{- /* Inline metadata strip below the hero image */ -}}
        {{- $hasMeta := or $role (or $studio $year) -}}
        {{ if $hasMeta }}
        <dl class="metadata-list project-detail__meta">
          {{ with $role }}<dt>Role</dt><dd>{{ . }}</dd>{{ end }}
          {{ with $studio }}<dt>Studio</dt><dd>{{ . }}</dd>{{ end }}
          {{ with $year }}<dt>Shipped</dt><dd>{{ . }}</dd>{{ end }}
        </dl>
        {{ end }}
      </div>
    </div>
  </header>

  {{- /* Title (visually hidden — already shown in terminal title and metadata) */ -}}
  <h1 class="visually-hidden">{{ .Title }}</h1>

  {{- /* Body content — paragraph(s), shortcodes (youtubeLite, vimeo, lead), etc. */ -}}
  <div class="project-detail__body">
    {{ .Content }}
  </div>

  {{- /* Image grid — auto-discover from bundle, exclude featured */ -}}
  {{ $images := slice }}
  {{ range .Resources.Match "*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}" }}
    {{ if not (hasPrefix .Name "featured") }}
      {{ $images = $images | append . }}
    {{ end }}
  {{ end }}
  {{ if $images }}
  <section class="project-detail__images" aria-label="Additional images">
    <div class="project-images">
      {{ range $images }}
      <a class="project-images__item" href="{{ .RelPermalink }}" target="_blank" rel="noopener">
        <img
          src="{{ .RelPermalink }}"
          alt=""
          loading="lazy"
          decoding="async"
          class="project-images__img">
      </a>
      {{ end }}
    </div>
  </section>
  {{ end }}

  {{- /* Credits panel */ -}}
  {{ partial "credits-panel.html" . }}

  {{- /* Prev/next pager */ -}}
  {{ partial "prev-next-pager.html" . }}

</article>
```

Notes:
- The hero image uses a plain `<img>` with `loading="eager"` because it's above the fold. We don't route through `responsive-image.html` because that partial expects an asset-relative path; page-bundle resources go through a different API.
- The image grid uses `<a>` wrappers that `target="_blank"` to open the raw image in a new tab. No lightbox in v1.
- The visually-hidden `<h1>` keeps semantic page structure intact for screen readers; the visible title is the terminal frame title.

- [ ] **Step 2: Build check**

Run: `hugo --gc --minify`
Expected: exits 0. Partial isn't called yet (Task 6 wires it in).

- [ ] **Step 3: Commit**

```bash
git add themes/am-mindmeld/layouts/partials/project-detail.html
git commit -m "$(cat <<'EOF'
Add project-detail partial

Assembles the entire detail-page body:
- Terminal-frame hero with role · studio · year title, status pill,
  hero image, and metadata strip below the image
- Page body via .Content (renders existing markdown shortcodes —
  youtubeLite, vimeo, lead, etc.)
- Optional image grid auto-discovered from page bundle (excluding
  featured*); each image links to itself in a new tab
- Credits panel (role, studio, engine, platform, team)
- Prev/next pager

Hero image uses plain <img loading="eager"> because it's above the
fold. Image grid uses lazy loading. Hides any section whose data
isn't present (no metadata strip if no role/studio/year, no image
grid if bundle has nothing besides featured, no credits panel if no
credit fields, no pager if neither prev nor next exists).
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- Commit SHA

---

## Task 6: List page templates (`projects/list.html`, `tools/list.html`)

**Files:**
- Create: `themes/am-mindmeld/layouts/projects/list.html`
- Create: `themes/am-mindmeld/layouts/tools/list.html`

Section-specific Hugo templates that wire the `section-list-zigzag` partial into the page lookup.

- [ ] **Step 1: Create `themes/am-mindmeld/layouts/projects/list.html`**

```html
{{- /* themes/am-mindmeld/layouts/projects/list.html */ -}}
{{ define "main" }}
{{ partial "section-list-zigzag.html" . }}
{{ end }}
```

- [ ] **Step 2: Create `themes/am-mindmeld/layouts/tools/list.html`**

```html
{{- /* themes/am-mindmeld/layouts/tools/list.html */ -}}
{{ define "main" }}
{{ partial "section-list-zigzag.html" . }}
{{ end }}
```

- [ ] **Step 3: Build and verify**

```bash
hugo --gc --minify
```

Expected: exits 0.

```bash
echo '=== Projects list now uses zig-zag ==='
grep -c 'project-list container' public/projects/index.html
# Expect: 1

echo '=== Tools list now uses zig-zag ==='
grep -c 'project-list container' public/tools/index.html
# Expect: 1

echo '=== Year groups appear ==='
grep -oE 'project-list__year-num">[^<]+' public/projects/index.html | head -3
# Expect: matches like "2025 //" "2023 //" etc.

echo '=== Year-grouped cards exist ==='
grep -c 'card-zig' public/projects/index.html
# Expect: ≥ number of projects (12 currently)

echo '=== Old fallback markup is gone ==='
grep -c 'fallback-page' public/projects/index.html
# Expect: 0
```

The CSS for these year-group classes doesn't exist yet (Task 7 adds it), so the rendered page will look unstyled but the structure should be correct.

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/layouts/
git commit -m "$(cat <<'EOF'
Add list page templates for projects and tools

Section-specific Hugo templates that thin-wrap section-list-zigzag.
/projects/ and /tools/ now use the year-grouped zig-zag treatment
instead of falling through to _default/list.html.

CSS for the year-group ember number + fading rule lands in Task 7.
The structure is correct as of this commit; visual styling follows.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- Verification grep results
- Commit SHA

---

## Task 7: Project list CSS

**Files:**
- Create: `themes/am-mindmeld/assets/css/layout/project-list.css`
- Modify: `themes/am-mindmeld/layouts/partials/head.html` — add to bundle

Styles for the list page hero, intro, year-group heading, and the spacing around year sections.

- [ ] **Step 1: Create `themes/am-mindmeld/assets/css/layout/project-list.css`**

```css
/* themes/am-mindmeld/assets/css/layout/project-list.css */

.project-list {
  padding: var(--sp-7) 0 var(--sp-8);
}

.project-list .term-frame {
  margin-bottom: var(--sp-6);
}

.project-list__intro {
  max-width: 65ch;
  margin-bottom: var(--sp-7);
  font-family: var(--font-body);
  font-size: var(--fs-15);
  color: var(--bone-dim);
  line-height: var(--lh-body);
}

.project-list__year {
  margin-bottom: var(--sp-8);
}

.project-list__year-heading {
  display: flex;
  align-items: baseline;
  gap: var(--sp-4);
  margin-bottom: var(--sp-6);
}
.project-list__year-num {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  color: var(--ember);
  line-height: 1;
  flex-shrink: 0;
  letter-spacing: 0.04em;
}
.project-list__year-rule {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--iron-3), transparent);
  margin-bottom: 6px;
}

@media (max-width: 720px) {
  .project-list__year-num { font-size: var(--fs-24); }
}
```

- [ ] **Step 2: Add `project-list.css` to the CSS bundle**

In `themes/am-mindmeld/layouts/partials/head.html`, find the `$css := slice` block and append `(resources.Get "css/layout/project-list.css")` after the existing `gallery.css` entry (or at the end of the layout-section entries).

- [ ] **Step 3: Build check**

```bash
hugo --gc --minify
```

Expected: exits 0.

```bash
grep -c 'project-list__year-num' public/css/main.*.min.css
# Expect: ≥ 1 (rule is bundled)
```

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Add project-list CSS (year heading + spacing)

Page wrapper, intro, and year-group heading styles. Year num is
ember VT323 at 32px (24 on mobile) with a fading iron-3 rule.
Mirrors the section-heading partial's visual language but scoped
to the list-page year groups.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- grep result confirming rule is in the bundle
- Commit SHA

---

## Task 8: Detail page templates (`projects/single.html`, `tools/single.html`)

**Files:**
- Create: `themes/am-mindmeld/layouts/projects/single.html`
- Create: `themes/am-mindmeld/layouts/tools/single.html`

Section-specific single-page templates that wire `project-detail` into Hugo's lookup.

- [ ] **Step 1: Create `themes/am-mindmeld/layouts/projects/single.html`**

```html
{{- /* themes/am-mindmeld/layouts/projects/single.html */ -}}
{{ define "main" }}
<div class="container">
  {{ partial "project-detail.html" . }}
</div>
{{ end }}
```

- [ ] **Step 2: Create `themes/am-mindmeld/layouts/tools/single.html`**

```html
{{- /* themes/am-mindmeld/layouts/tools/single.html */ -}}
{{ define "main" }}
<div class="container">
  {{ partial "project-detail.html" . }}
</div>
{{ end }}
```

- [ ] **Step 3: Build and verify**

```bash
hugo --gc --minify
```

Expected: exits 0, no warnings.

```bash
echo '=== Krazy Kaiju (fully-populated reference) ==='
grep -oE '<span class=term-frame__title>[^<]+' public/projects/krazy_kaiju/index.html | head -1
# Expect: "Solo developer · Personal Project · In progress"

grep -oE 'In development|Shipped' public/projects/krazy_kaiju/index.html | head -1
# Expect: "In development"

echo '=== MW3 (minimal front-matter — just title/description/date) ==='
grep -oE '<span class=term-frame__title>[^<]+' public/projects/mw3/index.html | head -1
# Expect: "2023" (just the year, since role/studio aren't set yet) or the page title

echo '=== Body content still renders ==='
grep -c 'project-detail__body' public/projects/mw3/index.html
# Expect: 1

echo '=== Prev/next pager renders when applicable ==='
grep -c 'prev-next-pager' public/projects/mw3/index.html
# Expect: 1

echo '=== A tool detail page also renders ==='
grep -c 'project-detail' public/tools/rig_authoring_framework/index.html
# Expect: 1
```

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/layouts/
git commit -m "$(cat <<'EOF'
Add detail page templates for projects and tools

Section-specific Hugo single.html templates that thin-wrap
project-detail. Every project page (12) and tool page (6) now
renders through the new layout: terminal-frame hero, metadata
strip, body, image grid, credits panel, prev/next pager.

Pages without populated [params] degrade gracefully — the metadata
strip and credits panel hide; the body content still renders. Adrian
backfills front-matter for the other pages over time using the
Krazy Kaiju reference.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- Verification grep results (focus on Krazy Kaiju vs MW3 metadata difference)
- Commit SHA

---

## Task 9: Project detail CSS

**Files:**
- Create: `themes/am-mindmeld/assets/css/layout/project-detail.css`
- Modify: `themes/am-mindmeld/layouts/partials/head.html` — add to bundle

Styles for the detail page hero, metadata strip, body, image grid (CSS multi-column masonry), credits panel, prev/next pager.

- [ ] **Step 1: Create `themes/am-mindmeld/assets/css/layout/project-detail.css`**

```css
/* themes/am-mindmeld/assets/css/layout/project-detail.css */

.project-detail {
  padding: var(--sp-7) 0 var(--sp-8);
}

/* ===== hero terminal frame ===== */
.project-detail__hero {
  margin-bottom: var(--sp-7);
}
.project-detail__frame {
  /* base term-frame styles inherited from terminal-frame.css */
}
.project-detail__frame .term-frame__bar {
  flex-wrap: wrap;
  gap: var(--sp-3);
}
.project-detail__hero-body {
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}
.project-detail__hero-img {
  width: 100%;
  height: auto;
  display: block;
  border: 1px solid var(--iron-3);
  background: var(--iron);
}
.project-detail__meta {
  /* uses .metadata-list from Phase 1 — ember dt + bone dd */
  margin: 0;
}

/* ===== body ===== */
.project-detail__body {
  margin-bottom: var(--sp-8);
  max-width: 70ch;
}
.project-detail__body p,
.project-detail__body ul,
.project-detail__body ol {
  margin-bottom: var(--sp-4);
}
.project-detail__body strong {
  color: var(--bone);
  font-weight: 500;
}
.project-detail__body em {
  color: var(--bone);
  font-style: italic;
}

/* ===== image grid (column masonry) ===== */
.project-detail__images {
  margin-bottom: var(--sp-8);
}
.project-images {
  column-count: 2;
  column-gap: var(--sp-3);
}
@media (min-width: 1100px) { .project-images { column-count: 3; } }

.project-images__item {
  break-inside: avoid;
  margin-bottom: var(--sp-3);
  display: block;
  border: 1px solid var(--iron-3);
  background: var(--iron);
  cursor: zoom-in;
  transition: border-color var(--t-base) var(--ease-out), transform var(--t-base) var(--ease-out);
}
.project-images__item:hover {
  border-color: var(--plasma);
}
.project-images__item:active {
  transform: scale(0.99);
  transition-duration: var(--t-active);
}
.project-images__img {
  display: block;
  width: 100%;
  height: auto;
}

/* ===== credits panel ===== */
.credits-panel {
  margin-bottom: var(--sp-7);
  padding: var(--sp-5);
  border: 1px solid var(--iron-3);
  background: var(--iron);
  max-width: 540px;
}
.credits-panel__list {
  margin: 0;
}

/* ===== prev/next pager ===== */
.prev-next-pager {
  border-top: 1px dashed var(--iron-3);
  padding-top: var(--sp-5);
  margin-top: var(--sp-7);
}
.prev-next-pager__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-5);
  padding: 0;
}
.prev-next-pager__link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: inherit;
  border: 1px solid transparent;
  padding: var(--sp-3) var(--sp-4);
  transition: border-color var(--t-base) var(--ease-out), background var(--t-base) var(--ease-out);
}
.prev-next-pager__link:hover {
  border-color: var(--iron-3);
  background: var(--iron);
  text-decoration: none;
}
.prev-next-pager__link--prev { text-align: left; }
.prev-next-pager__link--next { text-align: right; }

.prev-next-pager__direction {
  font-family: var(--font-body);
  font-size: var(--fs-11);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ember);
}
.prev-next-pager__title {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  color: var(--bone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.prev-next-pager__link:hover .prev-next-pager__title {
  color: var(--plasma);
}
.prev-next-pager__arrow {
  font-family: var(--font-body);
  font-size: var(--fs-18);
  color: var(--bone-dim);
}
.prev-next-pager__placeholder {
  /* keeps the surviving link aligned to its grid edge when one side is missing */
}

@media (max-width: 720px) {
  .prev-next-pager__inner {
    grid-template-columns: 1fr;
  }
  .prev-next-pager__link--next { text-align: left; }
}
```

- [ ] **Step 2: Add `project-detail.css` to the CSS bundle**

In `themes/am-mindmeld/layouts/partials/head.html`, append `(resources.Get "css/layout/project-detail.css")` after the existing `project-list.css` entry.

- [ ] **Step 3: Build check**

```bash
hugo --gc --minify
```

Expected: exits 0.

```bash
echo '=== Detail CSS in bundle ==='
grep -c 'project-detail__hero\|project-images__item\|prev-next-pager__link' public/css/main.*.min.css
# Expect: ≥ 1 (rules are bundled)

echo '=== Krazy Kaiju image count (should have hero only — no other images in bundle) ==='
ls content/projects/krazy_kaiju/ | grep -E '\.(jpg|png|webp)$' | wc -l
# Just informational — to know if the grid will render anything for KK.
```

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Add project-detail CSS

Hero terminal frame body, metadata strip, body prose, image grid
(2-col mobile / 3-col desktop CSS multi-column masonry), credits
panel (iron-3 bordered, max 540px), prev/next pager (1fr 1fr grid
with hover lift to plasma). Mobile pager collapses to a single
column.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- grep result confirming detail CSS bundled
- Commit SHA

---

## Task 10: Smoke check + a11y + README

**Files:**
- Modify: `themes/am-mindmeld/README.md` — remove "Project page templates" from Known gaps

Verification pass + closing the README gap.

- [ ] **Step 1: Production build**

```bash
hugo --gc --minify --logLevel info
```

Expected:
- Exit 0
- No warnings

**Step 2: Per-page render checks**

```bash
echo '=== List pages use new template ==='
grep -c 'project-list container' public/projects/index.html
grep -c 'project-list container' public/tools/index.html
# Expect: 1 each

echo '=== Year groups visible on lists ==='
grep -oE 'project-list__year-num">[^<]+' public/projects/index.html | sort -u | head -5
# Expect: matches like "2025 //" "2023 //" etc.

echo '=== Detail pages use new template ==='
grep -c 'class=project-detail' public/projects/krazy_kaiju/index.html
grep -c 'class=project-detail' public/projects/mw3/index.html
grep -c 'class=project-detail' public/tools/rig_authoring_framework/index.html
# Expect: 1 each

echo '=== Krazy Kaiju shows all metadata ==='
grep -oE 'Solo developer|Personal Project|In progress|In development' public/projects/krazy_kaiju/index.html | sort -u
# Expect: at least 3 of the 4 strings (the metadata strip + status pill)

echo '=== MW3 has fallback metadata (just year from .Date) ==='
grep -oE '<span class=term-frame__title>[^<]+' public/projects/mw3/index.html
# Expect: "2023" (or page title fallback if year not picked up)

echo '=== Pager renders ==='
grep -c 'prev-next-pager' public/projects/mw3/index.html
grep -c 'prev-next-pager__link' public/projects/krazy_kaiju/index.html
# Expect: 1 wrapper minimum on each; krazy_kaiju has 1+ link

echo '=== Other pages still build (regressions check) ==='
ls public/index.html public/gallery/index.html public/about/index.html public/contact/index.html
# Expect: all 4 present

echo '=== Mobile hamburger still works ==='
grep -c 'site-header__menu-toggle' public/index.html
# Expect: 2 (button + JS reference)
```

**Step 3: A11y spot-checks**

```bash
echo '=== Skip-link on detail pages ==='
grep -c 'class=skip-link' public/projects/krazy_kaiju/index.html
# Expect: 1

echo '=== Visually-hidden h1 on detail pages ==='
grep -c 'class=visually-hidden' public/projects/krazy_kaiju/index.html
# Expect: ≥ 1

echo '=== Pager aria-label ==='
grep -oE 'aria-label="Within this section"' public/projects/krazy_kaiju/index.html | head -1
# Expect: 1 match

echo '=== Year groups have aria-labelledby ==='
grep -oE 'aria-labelledby="year-[0-9]+"' public/projects/index.html | head -3
# Expect: matches per year
```

**Step 4: Update README known gaps**

Edit `themes/am-mindmeld/README.md`. Find the "Known gaps" section. Currently it lists:
- Project page templates (Phase 3)
- About / contact templates (Phase 4)

Remove the project-page bullet:

Change:
```
- **Project page templates** — non-homepage pages render via the minimal `single.html` / `list.html` fallback templates. Final detail-page treatment (terminal frame hero, metadata strip, image grid, credits panel) lands in Phase 3.
- **About / contact templates** — same situation; Phase 4 owns them.
```

To:
```
- **About / contact templates** — render via the minimal `single.html` fallback. Phase 4 builds the proper templates + an a11y audit.
```

**Step 5: Commit + tag**

```bash
git add themes/am-mindmeld/README.md
git commit -m "$(cat <<'EOF'
Phase 3 wrap-up: project & tool list/detail templates shipped

Section-specific templates for /projects/, /tools/, and every
project/tool detail page. Templates degrade gracefully when
front-matter fields are missing — the Krazy Kaiju reference shows
what fully-populated metadata looks like; other pages keep their
minimal front-matter and Adrian backfills over time.

Removed "Project page templates" from Known gaps. About + contact
remain as the only known gap, owned by Phase 4.
EOF
)"

git tag phase-3-project-and-tool-pages
```

## Report

- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED
- Per-page render check results (table form is fine)
- A11y check results
- Any regressions found and what you did about them
- Commit SHA + tag confirmation

---

## Self-review

**Spec coverage:**
- Master spec → "Project list page" with year-grouped zig-zag → Tasks 4, 6, 7 ✓
- Master spec → "Project detail page" with terminal-frame hero, metadata strip, paragraph, image grid, credits panel, prev/next pager → Tasks 2, 3, 5, 8, 9 ✓
- Master spec → status pill (`SHIPPED` plasma, `IN_DEVELOPMENT` ember) → Task 5 ✓
- Master spec → optional inline video embed (YouTube/Vimeo) → handled by `.Content` rendering existing shortcodes ✓
- Master spec → reuse `metadata-list` styling for credits → Tasks 3, 5 ✓

**Placeholder scan:** No "TBD", "TODO", or vague-instruction patterns. Each step has complete code or exact commands. The Krazy Kaiju reference example (Task 1) is concrete. Detail templates explicitly handle each missing-field case with `with` guards.

**Type / signature consistency:**
- `partial "section-list-zigzag.html" .` — receives the page (.) as context, reads `.Section` and `.Site.RegularPages`. Used identically by both list templates.
- `partial "project-detail.html" .` — receives the page (.) as context. Used identically by both single templates.
- `partial "credits-panel.html" .` — receives page; reads `.Params.role/studio/engine/platform/team_size`. Hide-when-empty consistent with project-detail's separate metadata strip handling.
- `partial "prev-next-pager.html" .` — receives page; reads `.PrevInSection` and `.NextInSection`.
- Front-matter param names (`role`, `studio`, `shipped_year`, `status`, `engine`, `platform`, `team_size`) — consistent across the README schema doc, Krazy Kaiju reference, project-detail partial, and credits-panel partial.

**Ambiguity check:** None — every task has explicit verification steps tying behavior to a visible result.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-09-phase3-project-and-tool-pages.md`. Two execution options:

**1. Subagent-Driven (recommended)** — same flow as Phases 1 and 2. Fresh subagent per task with review checkpoints. 10 tasks total.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
