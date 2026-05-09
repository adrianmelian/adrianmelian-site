# Phase 4 — About + Contact + 404 + A11y Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal fallback templates currently used by `/about/` and `/contact/`, ship a custom `404` page, and run a comprehensive accessibility audit so every page on adrianmelian.com is design-complete and WCAG-AA accessible.

**Architecture:** Section-specific Hugo templates (`layouts/about/single.html`, `layouts/contact/single.html`, `layouts/404.html`) render from declarative front-matter, mirroring the pattern established in Phases 2 and 3 (gallery, projects/tools). About page content (bio, skills, experience timeline) moves from `{{< timelineItem >}}` Blowfish-shim shortcodes into structured TOML front-matter so the template owns the layout. Contact page gets a compact panel with email, status block, and social links. The 404 uses a single terminal-frame component reading "SIGNAL LOST" in ember. The a11y audit pass walks the full site with axe-style checks and fixes anything inline.

**Tech Stack:** Hugo Extended ≥ 0.147 (already pinned), plain CSS via the existing resources pipeline, ~30 lines of vanilla JS for copy-on-click email (no library), no other new dependencies.

**Reference documents:**
- Master spec: `docs/superpowers/specs/2026-05-07-portfolio-mindmeld-redesign-design.md` (Section 3 → "About page", "Contact page", "404 page")
- Phase 3 plan: pattern for content migration to front-matter (gallery, projects)

---

## Design choices locked in by this plan

The master spec covers Phase 4 at design level. Implementation choices made here:

- **About content migration:** all 14 `{{< timelineItem >}}` entries (bio, skills, 9 work positions, 2 education, 2 about-me items) move into structured TOML front-matter. The body becomes minimal (intro line only). Templates own the layout. No legacy shortcodes remaining on this page.
- **Bio source:** the "Summary" timelineItem becomes `params.bio` (array of paragraphs). The "Communication" and "Leadership" items move into the "About me" section if rendered, or are dropped — Adrian's call. *Default: keep them rendered as a third bio section labeled "About me" so the existing content survives.*
- **Skills source:** the "Skills & Abilities" timelineItem's three sub-lists (Disciplines, Software, Languages) become `params.skills.disciplines`, `params.skills.software`, `params.skills.languages` — three string arrays. Rendered as a 2- or 3-column list.
- **Experience source:** all work and education timelineItems become `[[params.experience]]` array entries with structured fields (`type`, `header`, `role`, `location`, `year_start`, `year_end`, `titles`, `bullets`). Sorted by chronology in the front-matter (newest first).
- **Contact page:** single-panel layout. No form (cut earlier). Front-matter holds `email`, `location`, `availability`, `preferred_contact`. Body stays minimal. Email gets a copy-on-click button (~10 lines of vanilla JS).
- **404 page:** Hugo's `layouts/404.html` (root, not section-specific) — renders when no page matches a URL. Single terminal frame with `error.404` titlebar, VT323 "SIGNAL LOST" in ember, one-line message, plasma "RETURN HOME" link.
- **A11y audit scope:** all 9 key pages. Manual + automated checks for: focus-visible coverage, color contrast (especially `--bone-faint` usage), alt text on every meaningful image, ARIA labels on landmarks, semantic heading order, reduced-motion working, skip-link reachable. Fix anything that fails inline.

---

## File structure

### Created in this phase

```
themes/am-mindmeld/
├── assets/
│   └── css/
│       └── layout/
│           ├── about.css                            # portrait + bio + skills + timeline
│           ├── contact.css                          # single-panel contact layout
│           └── error.css                            # 404 page styles
├── layouts/
│   ├── 404.html                                     # SIGNAL LOST terminal frame
│   ├── about/
│   │   └── single.html                              # /about/ page template
│   └── contact/
│       └── single.html                              # /contact/ page template
```

### Modified in this phase

- `themes/am-mindmeld/layouts/partials/head.html` — add `about.css`, `contact.css`, `error.css` to the bundle
- `content/about/index.md` — migrated from timelineItem shortcodes to structured `[params]` front-matter
- `content/contact/index.md` — gains `[params]` for email, location, availability, preferred contact
- `themes/am-mindmeld/README.md` — remove "About / contact templates" from Known gaps; document new about/contact front-matter under the existing "Project / tool front-matter" section style

### Untouched

- `layouts/_default/single.html` and `layouts/_default/list.html` — stay as the minimal fallback for taxonomy pages and any uncategorized content
- `layouts/shortcodes/timeline.html` and `layouts/shortcodes/timelineItem.html` — kept as shims even though no content uses them after migration. Shim files don't render anything visible; they're cheap defensive code.

---

## About page front-matter schema (read by the new template)

```toml
+++
title = "About"
date = "2025-07-09"

[params]
phone     = "914.874.3390"                            # optional
location  = "Denver, CO / California (Relocation Ready)"
email     = "adrianmelian123@gmail.com"
resume    = "/adrianmelian_resume.pdf"
portrait  = "featured.jpg"                             # filename in page bundle

# Bio: array of paragraph strings (rendered top-of-page)
bio = [
  "I'm a Technical Artist with a passion for building robust pipelines, intuitive tools, and high-quality animation rigs for characters, creatures, and props.",
  "Recently, I've been exploring the intersection of machine learning and rigging — developing AI-driven solutions to accelerate skin weighting and automate rig setup.",
  "My approach blends technical precision with artistic sensibility, and I thrive in cross-functional environments where collaboration, iteration, and R&D drive innovation."
]

[params.skills]
disciplines = ["Rigging", "Animation", "Modeling", "Tools", "Scripting", "Game design", "Gameplay programming", "Graphic design"]
software    = ["Maya", "Unreal", "Unity", "ZBrush", "Painter", "Git", "Perforce"]
languages   = ["Python", "PyQt", "PyTorch", "C++", "C#", "Lua", "Hugo"]

# Experience entries — newest first
[[params.experience]]
type        = "work"
header      = "Camouflaj @ Meta"
role        = "Expert Technical Artist"
location    = "Remote"
year_range  = "Sep 2025 – Present"
titles      = "Unannounced Title (2026)"
bullets = [
  "Designed and implemented advanced Maya tools, studio preference systems, and asset stubbing frameworks",
  "Partnered with Meta internal teams to troubleshoot complex Horizon engine challenges"
]

# ... 11 more experience entries (work + education)
+++

A short page intro line (optional, rendered above the bio paragraphs).
```

The full migrated content — all 14 entries — is laid out completely in Task 1.

---

## Verification approach

Same as previous phases: Hugo themes don't have unit tests. Each task uses:

1. **Build check:** `hugo --gc --minify` exits 0 with no warnings
2. **HTML output check:** inspect rendered files under `public/` for expected markup
3. **A11y check (Task 6):** axe-style manual sweep + Lighthouse run

---

## Task 1: About content migration to front-matter

**Files:**
- Modify: `content/about/index.md` (overwrite entirely)

This is the largest content edit in Phase 4. Moves all `{{< timelineItem >}}` blocks into structured TOML front-matter. The migrated data preserves every fact in the existing content — no information loss.

- [ ] **Step 1: Replace `content/about/index.md` entirely**

```markdown
+++
title = "About"
date = "2025-07-09"

[params]
phone     = "914.874.3390"
location  = "Denver, CO / California (Relocation Ready)"
email     = "adrianmelian123@gmail.com"
resume    = "/adrianmelian_resume.pdf"
portrait  = "featured.jpg"

bio = [
  "I'm a Technical Artist with a passion for building robust pipelines, intuitive tools, and high-quality animation rigs for characters, creatures, and props. With experience across industry-leading studios like Sledgehammer Games, Double Fine, Meta, and Ubisoft, I've contributed to AAA productions across a range of genres and platforms.",
  "Recently, I've been exploring the intersection of machine learning and rigging. Developing AI-driven solutions to accelerate skin weighting and automate rig setup. This research is aimed at cutting costs, improving consistency, and unlocking new creative possibilities in artist pipelines.",
  "My approach blends technical precision with artistic sensibility, and I thrive in cross-functional environments where collaboration, iteration, and R&D drive innovation."
]

about_me = [
  { heading = "Communication", text = "Authored internal style guides, tech tutorials, training documents, and pipeline documentation. Frequently collaborated with cross-discipline teams, from art to engineering. Delivered presentations, live demos, and 1-on-1 training to onboard artists and support adoption of new tools." },
  { heading = "Leadership", text = "Led Sledgehammer's Character Tech Art team on three Call of Duty titles. Managed, trained, and art-directed internal and offshore artists. Oversaw large-scale rigging and skinning pipelines with consistent quality control. Delegated tasks, reviewed work, and maintained consistency across complex multi-project pipelines." }
]

[params.skills]
disciplines = ["Rigging", "Animation", "Modeling", "Tools", "Scripting", "Game design", "Gameplay programming", "Graphic design"]
software    = ["Maya", "Unreal", "Unity", "ZBrush", "Painter", "Git", "Perforce"]
languages   = ["Python", "PyQt", "PyTorch", "C++", "C#", "Lua", "Hugo"]

[[params.experience]]
type        = "work"
header      = "Camouflaj @ Meta"
role        = "Expert Technical Artist"
location    = "Remote"
year_range  = "Sep 2025 – Present"
titles      = "Unannounced Title (2026)"
bullets = [
  "Designed and implemented advanced Maya tools, studio preference systems, and asset stubbing frameworks to streamline setup, prototyping, and daily artist workflows",
  "Partnered with Meta internal teams to troubleshoot complex Horizon engine challenges"
]

[[params.experience]]
type        = "work"
header      = "Sledgehammer Games"
role        = "Lead Technical Artist"
location    = "Remote"
year_range  = "Jan 2021 – Sep 2025"
titles      = "Vanguard (2021), MW3 (2023), Unannounced Title (2026)"
bullets = [
  "Led the Character Tech Art team; trained and managed internal and OS artists",
  "Led the Weapons Tech Art team; trained and managed internal and OS artists and built a modular rigging solution",
  "Developed and maintained character, animation, and rigging workflows",
  "Created proprietary tools for animation, rigging, and cloth simulation",
  "Skinned high-fidelity characters, including celebrity likenesses like Snoop Dogg",
  "Balanced and optimized character assets for in-engine performance"
]

[[params.experience]]
type        = "work"
header      = "Meta"
role        = "Technical Artist"
location    = "Menlo Park"
year_range  = "Nov 2018 – Dec 2020"
titles      = "Meta Horizon Worlds (2021)"
bullets = [
  "Created artist-facing tools and animation exporters",
  "Built performance-optimized workflows for VR",
  "Developed a Figma-to-ReactVR plugin"
]

[[params.experience]]
type        = "work"
header      = "Nomadic VR"
role        = "Senior Technical Artist"
location    = "San Rafael"
year_range  = "Dec 2017 – Nov 2018"
titles      = "Arizona Sunshine: Rampage (2018)"
bullets = [
  "Integrated LEAP Motion VR",
  "Calibrated OptiTrack & Motive systems",
  "Prototyped LBE VR experiences and digital-physical rigs"
]

[[params.experience]]
type        = "work"
header      = "NCSoft"
role        = "Senior Technical Artist"
location    = "San Mateo"
year_range  = "Jan 2017 – Dec 2017"
titles      = "Unannounced Title (2018)"
bullets = [
  "Built main character rigs and batch rigging tools",
  "Developed a modular auto-rigging system and animation retargeting tools",
  "Created 30+ rigs for hero and enemy characters"
]

[[params.experience]]
type        = "work"
header      = "Ubisoft"
role        = "Senior Technical Artist"
location    = "San Francisco"
year_range  = "Aug 2016 – Dec 2016"
titles      = "South Park: The Fractured But Whole (2017)"
bullets = [
  "Rigged 2D/3D characters",
  "Authored pipeline and 2D flipbook animation tools"
]

[[params.experience]]
type        = "work"
header      = "ToyTalk Inc. (now Pullstring Inc.)"
role        = "Senior Technical Artist"
location    = "San Francisco"
year_range  = "Oct 2015 – Jul 2016"
titles      = "Unannounced Title (2016)"
bullets = [
  "Rigged all characters across multiple projects",
  "Built a pose/animation library, Trax editor pipeline, lip-sync tools, and Maya–Unity exporters",
  "Authored planetary shaders for procedural galaxy rendering"
]

[[params.experience]]
type        = "work"
header      = "Perfect World Entertainment"
role        = "Technical Artist"
location    = "Redwood City"
year_range  = "Mar 2015 – Oct 2015"
titles      = "Unannounced Title (2016)"
bullets = [
  "Rigged and animated characters, props, and buildings for mobile games",
  "Built Maya to Unity export tools"
]

[[params.experience]]
type        = "work"
header      = "Double Fine Productions"
role        = "Technical Artist"
location    = "San Francisco"
year_range  = "Jan 2012 – Nov 2014"
titles      = "Multiple titles"
bullets = [
  "Costume Quest 2 — Rigged/skinned 26 of 28 characters, animated gameplay and cutscenes",
  "Broken Age — Modeled, rigged/skinned 40+ characters, built flipbook animation system",
  "Massive Chalice — Created map-editing and randomization tools based on CSV input",
  "Spacebase DF-9 — Animation/Rigging",
  "My Alien Buddy — Concepted and prototyped gameplay, created all characters, and wrote Lua scripts",
  "Kinect Party — Updated tools, authored animation transfer tools",
  "Worked on multiple Amnesia Fortnight titles (Little Pink Best Buds, Dear Leader, Black Lake, White Birch)"
]

[[params.experience]]
type        = "work"
header      = "Concept Art House"
role        = "Technical Artist & Project Manager"
location    = "San Francisco"
year_range  = "Feb 2011 – Sep 2011"
bullets = [
  "Created MEL-based auto-rigging tools for bipeds and quadrupeds",
  "Managed outsourcing teams, tracked production, and maintained quality",
  "Authored style guides, tutorials, and assignments for external partners",
  "Worked across various social and browser-based games (Zoo World 2, Legacy of a Thousand Suns, Vegas City, etc.)"
]

[[params.experience]]
type        = "education"
header      = "Art Institute of California — San Francisco"
role        = "B.S. in Media Arts & Animation"
year_range  = "Sep 2006 – Dec 2010"
bullets = [
  "Best Portfolio Award 2010"
]

[[params.experience]]
type        = "education"
header      = "SUNY Sullivan — New York"
role        = "A.S. in Graphic Design"
year_range  = "Aug 2004 – Aug 2006"
bullets = [
  "Coursework focused on graphic design fundamentals"
]
+++

A short bio and the people, places, and projects that have shaped my career.
```

The body is now a single intro line. All structured content lives in front-matter. Hugo's TOML parser handles `[[params.experience]]` arrays of tables and `[params.skills]` nested table cleanly.

- [ ] **Step 2: Build check**

```bash
hugo --gc --minify
```

Expected: exits 0, no warnings. The new front-matter is inert until Task 3 reads it; the page still renders via the `_default/single.html` fallback in the meantime, so the rendered output will look weird (just the intro line + nothing else). That's expected staging.

```bash
grep -c '^\[\[params.experience\]\]' content/about/index.md
```

Expected: 12 (10 work + 2 education entries).

- [ ] **Step 3: Commit**

```bash
git add content/about/index.md
git commit -m "$(cat <<'EOF'
About: migrate content from timelineItem shortcodes to front-matter

All 14 timelineItem blocks (Summary, Skills & Abilities, 9 work
positions, 2 education entries, Communication, Leadership) move into
structured TOML [params] front-matter:

- bio: 3-paragraph string array
- about_me: 2-entry table array (Communication + Leadership)
- params.skills: 3-key nested table (disciplines, software, languages)
- params.experience: 12-entry array of tables, each with type/header/
  role/location/year_range/titles?/bullets

The body collapses to a single intro line. Until Task 3's template
reads this front-matter, the page renders via _default/single.html
showing only the intro — visible regression that resolves once the
template lands.
EOF
)"
```

## Report

- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED
- Confirmation 12 experience entries are in the file
- Build output (any warnings?)
- Commit SHA

---

## Task 2: About page CSS

**Files:**
- Create: `themes/am-mindmeld/assets/css/layout/about.css`
- Modify: `themes/am-mindmeld/layouts/partials/head.html` — add to bundle

Styles for the portrait + bio top section, the skills 2-column list, and the experience timeline rows.

- [ ] **Step 1: Create `themes/am-mindmeld/assets/css/layout/about.css`**

```css
/* themes/am-mindmeld/assets/css/layout/about.css */

.about {
  padding: var(--sp-7) 0 var(--sp-8);
}

/* ===== top section: portrait + bio ===== */
.about__top {
  display: grid;
  grid-template-columns: 40fr 60fr;
  gap: var(--sp-7);
  margin-bottom: var(--sp-8);
}

.about__portrait-wrap {
  border: 1px dashed var(--iron-3);
  padding: var(--sp-3);
}
.about__portrait {
  width: 100%;
  height: auto;
  display: block;
  border: 1px solid var(--iron-3);
  filter: contrast(1.05) saturate(0.95);
  mix-blend-mode: normal;
}
.about__contact-line {
  margin-top: var(--sp-4);
  font-family: var(--font-body);
  font-size: var(--fs-12);
  color: var(--bone-dim);
  letter-spacing: 0.04em;
  line-height: 1.6;
}
.about__contact-line a { color: var(--plasma); }
.about__contact-line a:hover { text-decoration: underline; }

.about__bio { font-family: var(--font-body); }
.about__bio p {
  max-width: 65ch;
  font-size: var(--fs-15);
  line-height: var(--lh-body);
  color: var(--bone);
  margin-bottom: var(--sp-4);
}
.about__bio p:last-child { margin-bottom: 0; }

/* ===== about-me sections (Communication, Leadership) ===== */
.about__me {
  margin-bottom: var(--sp-8);
}
.about__me-item {
  margin-bottom: var(--sp-5);
  max-width: 65ch;
}
.about__me-heading {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  color: var(--ember);
  letter-spacing: 0.08em;
  margin-bottom: var(--sp-2);
}
.about__me-text {
  font-family: var(--font-body);
  font-size: var(--fs-14);
  line-height: var(--lh-body);
  color: var(--bone-dim);
}

/* ===== skills 3-column ===== */
.about__skills {
  margin-bottom: var(--sp-8);
}
.about__skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-6);
}
.about__skills-group {}
.about__skills-label {
  font-family: var(--font-body);
  font-size: var(--fs-11);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ember);
  margin-bottom: var(--sp-2);
}
.about__skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.about__skills-list li {
  font-family: var(--font-body);
  font-size: var(--fs-14);
  color: var(--bone);
  padding: 4px 0;
  border-bottom: 1px dashed var(--iron-3);
}
.about__skills-list li:last-child { border-bottom: none; }

/* ===== experience timeline ===== */
.about__experience {}
.about__experience-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.about__exp-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: var(--sp-5);
  padding: var(--sp-5) 0;
  border-bottom: 1px dashed var(--iron-3);
}
.about__exp-item:last-child { border-bottom: none; }

.about__exp-year {
  font-family: var(--font-display);
  font-size: var(--fs-18);
  color: var(--ember);
  letter-spacing: 0.06em;
  line-height: 1.3;
  white-space: nowrap;
}
.about__exp-body {}
.about__exp-header {
  font-family: var(--font-display);
  font-size: var(--fs-24);
  color: var(--bone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
  margin-bottom: var(--sp-2);
}
.about__exp-meta {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  color: var(--bone-dim);
  letter-spacing: 0.06em;
  margin-bottom: var(--sp-2);
}
.about__exp-meta .role { color: var(--plasma); }
.about__exp-meta .sep { color: var(--bone-faint); margin: 0 var(--sp-2); }
.about__exp-titles {
  font-family: var(--font-body);
  font-size: var(--fs-12);
  color: var(--bone-dim);
  letter-spacing: 0.04em;
  margin-bottom: var(--sp-3);
  font-style: italic;
}
.about__exp-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
}
.about__exp-bullets li {
  font-family: var(--font-body);
  font-size: var(--fs-14);
  color: var(--bone-dim);
  line-height: var(--lh-body);
  padding-left: var(--sp-4);
  margin-bottom: var(--sp-2);
  position: relative;
}
.about__exp-bullets li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: var(--ember);
  font-family: var(--font-display);
}

@media (max-width: 900px) {
  .about__top { grid-template-columns: 1fr; }
  .about__skills-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 720px) {
  .about__skills-grid { grid-template-columns: 1fr; }
  .about__exp-item { grid-template-columns: 1fr; gap: var(--sp-3); }
  .about__exp-header { font-size: var(--fs-18); }
}
```

- [ ] **Step 2: Add `about.css` to the CSS bundle**

In `themes/am-mindmeld/layouts/partials/head.html`, find the `$css := slice` block. Append `(resources.Get "css/layout/about.css")` after the existing `project-detail.css` entry.

- [ ] **Step 3: Build check**

```bash
hugo --gc --minify
```

Expected: exits 0.

```bash
grep -oE 'about__top|about__exp-item|about__skills-grid' public/css/main.min.*.css | wc -l
```

Expected: ≥3 (rules are bundled).

- [ ] **Step 4: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Add about-page CSS (portrait + bio + skills + timeline)

40/60 portrait+bio split (stacks below 900px), about-me prose
sections with ember headings, 3-column skills grid (collapses to 2
then 1 at smaller breakpoints), experience timeline with 140px year
column and bone header + plasma role + ember › bullet markers.
Dashed iron-3 dividers between experience entries — no card-blocks
or shadows, just typography and spacing.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- grep result confirming rules are bundled
- Commit SHA

---

## Task 3: About page template

**Files:**
- Create: `themes/am-mindmeld/layouts/about/single.html`

Renders the about page from front-matter: portrait + contact, bio paragraphs, about-me sections, skills grid, experience timeline.

- [ ] **Step 1: Create the template**

```html
{{- /* themes/am-mindmeld/layouts/about/single.html */ -}}
{{ define "main" }}
{{- $p := .Params -}}
{{- $portrait := "" -}}
{{- if $p.portrait -}}{{- $portrait = .Resources.GetMatch $p.portrait -}}{{- end -}}

<article class="about container">
  <h1 class="visually-hidden">{{ .Title }}</h1>

  {{- /* TOP: portrait (40%) + bio prose (60%) */ -}}
  <section class="about__top" aria-labelledby="bio-heading">
    <div class="about__portrait-col">
      {{ if $portrait }}
      <div class="about__portrait-wrap">
        <img class="about__portrait"
             src="{{ $portrait.RelPermalink }}"
             alt="Portrait of Adrian Melian"
             width="{{ $portrait.Width }}"
             height="{{ $portrait.Height }}"
             loading="eager"
             decoding="async">
      </div>
      {{ end }}
      <div class="about__contact-line">
        {{ with $p.location }}{{ . }}<br>{{ end }}
        {{ with $p.email }}<a href="mailto:{{ . }}">{{ . }}</a>{{ end }}
        {{ with $p.resume }} · <a href="{{ . }}" target="_blank" rel="noopener">Resume PDF</a>{{ end }}
      </div>
    </div>
    <div class="about__bio">
      <h2 id="bio-heading" class="visually-hidden">About Adrian</h2>
      {{ range $p.bio }}
      <p>{{ . }}</p>
      {{ end }}
    </div>
  </section>

  {{- /* About-me prose (Communication, Leadership) */ -}}
  {{ with $p.about_me }}
  <section class="about__me" aria-labelledby="about-me-heading">
    {{ partial "section-heading.html" (dict "number" "" "title" "About me" "id" "about-me-heading") }}
    {{ range . }}
    <div class="about__me-item">
      <div class="about__me-heading">{{ .heading }}</div>
      <p class="about__me-text">{{ .text }}</p>
    </div>
    {{ end }}
  </section>
  {{ end }}

  {{- /* Skills grid */ -}}
  {{ with $p.skills }}
  <section class="about__skills" aria-labelledby="skills-heading">
    {{ partial "section-heading.html" (dict "number" "" "title" "Skills" "id" "skills-heading") }}
    <div class="about__skills-grid">
      {{ with .disciplines }}
      <div class="about__skills-group">
        <div class="about__skills-label">Disciplines</div>
        <ul class="about__skills-list">
          {{ range . }}<li>{{ . }}</li>{{ end }}
        </ul>
      </div>
      {{ end }}
      {{ with .software }}
      <div class="about__skills-group">
        <div class="about__skills-label">Software</div>
        <ul class="about__skills-list">
          {{ range . }}<li>{{ . }}</li>{{ end }}
        </ul>
      </div>
      {{ end }}
      {{ with .languages }}
      <div class="about__skills-group">
        <div class="about__skills-label">Languages</div>
        <ul class="about__skills-list">
          {{ range . }}<li>{{ . }}</li>{{ end }}
        </ul>
      </div>
      {{ end }}
    </div>
  </section>
  {{ end }}

  {{- /* Experience timeline */ -}}
  {{ with $p.experience }}
  <section class="about__experience" aria-labelledby="experience-heading">
    {{ partial "section-heading.html" (dict "number" "" "title" "Experience" "id" "experience-heading") }}
    <ol class="about__experience-list">
      {{ range . }}
      <li class="about__exp-item">
        <div class="about__exp-year">{{ .year_range }}</div>
        <div class="about__exp-body">
          <div class="about__exp-header">{{ .header }}</div>
          <div class="about__exp-meta">
            {{ with .role }}<span class="role">{{ . }}</span>{{ end }}
            {{ if and .role .location }}<span class="sep">·</span>{{ end }}
            {{ with .location }}<span>{{ . }}</span>{{ end }}
          </div>
          {{ with .titles }}<div class="about__exp-titles">{{ . }}</div>{{ end }}
          {{ with .bullets }}
          <ul class="about__exp-bullets">
            {{ range . }}<li>{{ . }}</li>{{ end }}
          </ul>
          {{ end }}
        </div>
      </li>
      {{ end }}
    </ol>
  </section>
  {{ end }}

  {{- /* Body content (intro line) — rendered last as a small footer-like note */ -}}
  {{ with .Content }}
  <div class="about__intro">{{ . }}</div>
  {{ end }}

</article>
{{ end }}
```

- [ ] **Step 2: Build and verify**

```bash
hugo --gc --minify
```

Expected: exits 0.

```bash
echo '=== About page uses new template ==='
grep -c 'class="about container"\|class=about container' public/about/index.html
# Expect: 1

echo '=== Bio paragraphs render ==='
grep -c "I'm a Technical Artist" public/about/index.html
# Expect: 1

echo '=== Skills 3 groups render ==='
grep -oE 'Disciplines|Software|Languages' public/about/index.html | sort -u
# Expect: 3 unique

echo '=== Experience entries render ==='
grep -oE 'about__exp-header' public/about/index.html | wc -l
# Expect: 12 (10 work + 2 education)

echo '=== Year ranges visible ==='
grep -oE 'Sep 2025 . Present|Jan 2021 . Sep 2025|Sep 2006 . Dec 2010' public/about/index.html | head -3
# Expect: 3 matches confirming the chronology renders

echo '=== Old timelineItem markup is gone ==='
grep -c 'timeline-item-shim' public/about/index.html
# Expect: 0
```

- [ ] **Step 3: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Add about-page template (layouts/about/single.html)

Renders the about page from front-matter:
- 40/60 top: portrait (page-bundle resource) with dashed iron-3
  border + tiny phosphor tint, contact-line beneath; bio paragraph
  array on the right (max 65ch)
- About-me prose blocks (Communication, Leadership) with ember
  sub-headings
- 3-column skills grid (Disciplines / Software / Languages) with
  dashed iron-3 row separators
- Experience timeline: 140px ember year column + bone header +
  plasma role · location meta + italic title list + ember › bullets

All sections hide gracefully if their front-matter is missing.
The body intro line renders at the bottom as a small footer note.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- All 6 verification grep results
- Commit SHA

---

## Task 4: Contact page (front-matter + template + CSS)

**Files:**
- Modify: `content/contact/index.md`
- Create: `themes/am-mindmeld/layouts/contact/single.html`
- Create: `themes/am-mindmeld/assets/css/layout/contact.css`
- Modify: `themes/am-mindmeld/layouts/partials/head.html` — add contact.css to bundle

Single-panel contact page: large email with copy-on-click, status block, social links.

- [ ] **Step 1: Update `content/contact/index.md` front-matter**

Replace the existing file entirely:

```markdown
+++
title = "Contact"
date = "2025-07-09"

[params]
email = "adrianmelian123@gmail.com"
location = "Denver, CO"
availability = "Open to relocation · contract or full-time"
preferred_contact = "Email preferred"
+++

Questions, comments, and export opportunities — drop me a line.
```

- [ ] **Step 2: Create `themes/am-mindmeld/layouts/contact/single.html`**

```html
{{- /* themes/am-mindmeld/layouts/contact/single.html */ -}}
{{ define "main" }}
{{- $p := .Params -}}
<article class="contact container">
  <h1 class="visually-hidden">{{ .Title }}</h1>

  <section class="contact__panel">
    <header class="contact__heading">
      <span class="contact__num">contact //</span>
      <h2 class="contact__title">Get in touch</h2>
    </header>

    {{ with .Content }}
    <div class="contact__intro">{{ . }}</div>
    {{ end }}

    {{ with $p.email }}
    <div class="contact__email-row">
      <a class="contact__email" href="mailto:{{ . }}">{{ . }}</a>
      <button class="contact__copy"
              type="button"
              data-copy-target="{{ . }}"
              aria-label="Copy email address to clipboard">
        <span class="contact__copy-label">Copy</span>
      </button>
    </div>
    {{ end }}

    <dl class="metadata-list contact__status">
      {{ with $p.location }}<dt>Location</dt><dd>{{ . }}</dd>{{ end }}
      {{ with $p.availability }}<dt>Status</dt><dd>{{ . }}</dd>{{ end }}
      {{ with $p.preferred_contact }}<dt>Contact</dt><dd>{{ . }}</dd>{{ end }}
    </dl>

    <ul class="contact__socials" aria-label="Social links">
      {{ range .Site.Menus.social }}
      <li>
        <a class="contact__social-link" href="{{ .URL }}" rel="me noopener" target="_blank">
          {{- partial (printf "icons/%s.html" .Identifier) . -}}
          <span class="contact__social-name">{{ .Name }}</span>
        </a>
      </li>
      {{ end }}
    </ul>
  </section>
</article>

<script>
(function () {
  var btn = document.querySelector('.contact__copy');
  if (!btn) return;
  var label = btn.querySelector('.contact__copy-label');
  var original = label.textContent;
  btn.addEventListener('click', function () {
    var target = btn.getAttribute('data-copy-target');
    if (!navigator.clipboard) {
      // Older browser fallback: select & copy
      var range = document.createRange();
      var sel = window.getSelection();
      var emailEl = document.querySelector('.contact__email');
      if (emailEl) {
        range.selectNodeContents(emailEl);
        sel.removeAllRanges();
        sel.addRange(range);
        try { document.execCommand('copy'); } catch (e) {}
        sel.removeAllRanges();
      }
    } else {
      navigator.clipboard.writeText(target).catch(function () {});
    }
    label.textContent = 'Copied';
    btn.classList.add('contact__copy--copied');
    setTimeout(function () {
      label.textContent = original;
      btn.classList.remove('contact__copy--copied');
    }, 1500);
  });
})();
</script>
{{ end }}
```

- [ ] **Step 3: Create `themes/am-mindmeld/assets/css/layout/contact.css`**

```css
/* themes/am-mindmeld/assets/css/layout/contact.css */

.contact {
  padding: var(--sp-7) 0 var(--sp-8);
}

.contact__panel {
  max-width: 720px;
  border: 1px solid var(--iron-3);
  background: var(--iron);
  padding: var(--sp-7);
}

.contact__heading {
  display: flex;
  align-items: baseline;
  gap: var(--sp-4);
  margin-bottom: var(--sp-5);
}
.contact__num {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  color: var(--ember);
  line-height: 1;
}
.contact__title {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  color: var(--bone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1;
  margin: 0;
}

.contact__intro {
  font-family: var(--font-body);
  font-size: var(--fs-14);
  color: var(--bone-dim);
  line-height: var(--lh-body);
  max-width: 60ch;
  margin-bottom: var(--sp-6);
}
.contact__intro p { margin-bottom: 0; }

.contact__email-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-3);
  margin-bottom: var(--sp-6);
}
.contact__email {
  font-family: var(--font-display);
  font-size: var(--fs-32);
  color: var(--plasma);
  letter-spacing: 0.02em;
  word-break: break-all;
}
.contact__email:hover { color: var(--bone); text-decoration: underline; }

.contact__copy {
  font-family: var(--font-body);
  font-size: var(--fs-11);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bone-dim);
  background: transparent;
  border: 1px solid var(--iron-3);
  padding: var(--sp-2) var(--sp-3);
  cursor: pointer;
  transition: color var(--t-base) var(--ease-out), border-color var(--t-base) var(--ease-out);
}
.contact__copy:hover { color: var(--bone); border-color: var(--bone-dim); }
.contact__copy--copied { color: var(--plasma); border-color: var(--plasma); }

.contact__status {
  margin-bottom: var(--sp-6);
}

.contact__socials {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
}
.contact__social-link {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--iron-3);
  font-family: var(--font-body);
  font-size: var(--fs-12);
  letter-spacing: 0.08em;
  color: var(--bone-dim);
  transition: color var(--t-base) var(--ease-out), border-color var(--t-base) var(--ease-out);
}
.contact__social-link:hover {
  color: var(--plasma);
  border-color: var(--plasma);
  text-decoration: none;
}
.contact__social-link svg { width: 16px; height: 16px; }

@media (max-width: 720px) {
  .contact__panel { padding: var(--sp-5); }
  .contact__email { font-size: var(--fs-24); }
  .contact__num, .contact__title { font-size: var(--fs-24); }
}
```

- [ ] **Step 4: Add `contact.css` to the CSS bundle**

In `themes/am-mindmeld/layouts/partials/head.html`, append `(resources.Get "css/layout/contact.css")` after the `about.css` entry from Task 2.

- [ ] **Step 5: Build and verify**

```bash
hugo --gc --minify
```

Expected: exits 0.

```bash
echo '=== Contact page uses new template ==='
grep -c 'class="contact container"\|class=contact container' public/contact/index.html
# Expect: 1

echo '=== Email and copy button render ==='
grep -c 'contact__email\|contact__copy' public/contact/index.html
# Expect: ≥2

echo '=== Status block renders ==='
grep -oE 'Denver, CO|Open to relocation|Email preferred' public/contact/index.html | sort -u
# Expect: 3 unique strings

echo '=== Socials render ==='
grep -c 'contact__social-link' public/contact/index.html
# Expect: ≥3 (LinkedIn, GitHub, YouTube)

echo '=== Old fallback markup is gone ==='
grep -c 'fallback-page' public/contact/index.html
# Expect: 0
```

- [ ] **Step 6: Commit**

```bash
git add themes/am-mindmeld/ content/contact/index.md
git commit -m "$(cat <<'EOF'
Add contact page (template + CSS + front-matter)

Single-panel iron-bordered layout (max 720px) with:
- "contact // GET IN TOUCH" header (ember number + bone title)
- Optional intro paragraph from .Content
- Large plasma email + Copy button (inline JS clipboard, fallback to
  selectionRange on older browsers; 1.5s "Copied" feedback)
- 3-line status metadata-list (location, availability, preferred contact)
- Socials row reusing the existing icon partials, label visible
  alongside the icon

No form. Front-matter holds email/location/availability/preferred_contact.
The body markdown stays for an optional intro.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- All 5 verification grep results
- Commit SHA

---

## Task 5: 404 page

**Files:**
- Create: `themes/am-mindmeld/layouts/404.html`
- Create: `themes/am-mindmeld/assets/css/layout/error.css`
- Modify: `themes/am-mindmeld/layouts/partials/head.html` — add error.css to bundle

Custom 404 with the "SIGNAL LOST" terminal-frame treatment from the spec.

- [ ] **Step 1: Create `themes/am-mindmeld/layouts/404.html`**

```html
{{- /* themes/am-mindmeld/layouts/404.html */ -}}
{{ define "main" }}
<main class="error container">
  <div class="error__frame">
    <div class="term-frame term-frame--full">
      <div class="term-frame__bar">
        <div class="term-frame__lights" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <span class="term-frame__title">error.404</span>
      </div>
      <div class="term-frame__body error__body">
        <h1 class="error__title">SIGNAL LOST</h1>
        <p class="error__message">The page you're looking for has drifted out of range.</p>
        <a class="quick-link error__home" href="{{ "/" | relURL }}">Return home</a>
      </div>
    </div>
  </div>
</main>
{{ end }}
```

- [ ] **Step 2: Create `themes/am-mindmeld/assets/css/layout/error.css`**

```css
/* themes/am-mindmeld/assets/css/layout/error.css */

.error {
  padding: var(--sp-8) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.error__frame {
  width: 100%;
  max-width: 720px;
}

.error__body {
  padding: var(--sp-8) var(--sp-7);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-5);
}

.error__title {
  font-family: var(--font-display);
  font-size: var(--fs-72);
  color: var(--ember);
  letter-spacing: 0.04em;
  line-height: 1;
  margin: 0;
}

.error__message {
  font-family: var(--font-body);
  font-size: var(--fs-15);
  color: var(--bone-dim);
  max-width: 50ch;
  margin: 0;
}

.error__home {
  margin-top: var(--sp-3);
}

@media (max-width: 720px) {
  .error__title { font-size: var(--fs-48); }
}
```

- [ ] **Step 3: Add `error.css` to the CSS bundle**

In `themes/am-mindmeld/layouts/partials/head.html`, append `(resources.Get "css/layout/error.css")` after the `contact.css` entry from Task 4.

- [ ] **Step 4: Build and verify**

```bash
hugo --gc --minify
```

Expected: exits 0.

```bash
ls public/404.html
# Expect: file exists

grep -c 'SIGNAL LOST' public/404.html
# Expect: 1

grep -c 'error.404' public/404.html
# Expect: 1

grep -c 'class=quick-link error__home\|class="quick-link error__home"' public/404.html
# Expect: 1
```

- [ ] **Step 5: Commit**

```bash
git add themes/am-mindmeld/
git commit -m "$(cat <<'EOF'
Add custom 404 page (SIGNAL LOST terminal frame)

layouts/404.html renders a single terminal-frame component centered
on the page: ember "SIGNAL LOST" in 72px VT323, a one-line drifted-
out-of-range message, and a plasma-bordered "Return home" quick-link.
Hugo serves layouts/404.html for any URL that doesn't match a page.

The error CSS centers vertically with flex on the main element so the
frame floats nicely whether viewed at the top of a tall window or on
a narrow phone.
EOF
)"
```

## Report

- **Status:** DONE
- Build output
- 4 verification grep results
- Commit SHA

---

## Task 6: A11y audit + inline fixes

**Files:** none (verification + small inline fixes only — exact files depend on what's found)

A walking sweep of the full site checking accessibility against WCAG-AA. Fix anything that fails inline. Don't refactor working code.

- [ ] **Step 1: Production build**

```bash
hugo --gc --minify
```

Expected: exits 0.

- [ ] **Step 2: Skip-link reachable on every page**

```bash
for page in / /projects/ /projects/krazy_kaiju/ /tools/ /tools/rig_authoring_framework/ /gallery/ /about/ /contact/ /404.html; do
  page_path="public${page}"
  if [ "${page}" = "/404.html" ]; then page_path="public/404.html"; fi
  if [ -d "${page_path}" ]; then page_path="${page_path}index.html"; fi
  count=$(grep -c 'class=skip-link' "${page_path}" 2>/dev/null || echo 0)
  echo "  ${page}: skip-link count = ${count}"
done
```

Expected: every page reports `1`. If any reports `0`, the baseof.html template is missing the skip-link for that page kind — investigate.

- [ ] **Step 3: Heading hierarchy on each page**

Inspect each rendered HTML for proper h1-h2-h3 progression. The expected pattern is:
- Each page has exactly one `<h1>` (often `.visually-hidden`)
- Section headings are `<h2>` (some pages use `<header>` wrappers — that's also fine for landmark labelling)

```bash
for page in /index.html /projects/index.html /projects/krazy_kaiju/index.html /tools/index.html /gallery/index.html /about/index.html /contact/index.html /404.html; do
  h1_count=$(grep -oE '<h1[^>]*>' "public${page}" 2>/dev/null | wc -l)
  echo "  ${page}: h1 count = ${h1_count}"
done
```

Expected: every page reports `1`. If `0` or `>1`, investigate that page's template.

- [ ] **Step 4: Alt text on every image**

Find any `<img>` without an `alt` attribute (decorative images should still have `alt=""` empty string):

```bash
for page in /index.html /projects/krazy_kaiju/index.html /gallery/index.html /about/index.html; do
  missing=$(grep -oE '<img [^>]+>' "public${page}" 2>/dev/null | grep -vc 'alt=' )
  echo "  ${page}: imgs missing alt = ${missing}"
done
```

Expected: every page reports `0`. If any are `>0`, find the offending image and add an `alt=""` (decorative) or `alt="meaningful description"` (informative).

- [ ] **Step 5: Color contrast spot-check**

The Phase 1 contrast audit (`bone-dim` over `carbon` = 6.7:1, passes AA; `bone-faint` over `carbon` = 3.4:1, fails AA for body but acceptable for non-text UI) still applies. Confirm `bone-faint` is only used in non-prose contexts:

```bash
grep -rn 'bone-faint' themes/am-mindmeld/assets/css/ | head -10
```

Read each match. Each should be on:
- Statusbar `--muted` segment (small UI chrome — acceptable)
- Terminal frame `__meta` text (small uppercase metadata — acceptable)
- Possibly a few other non-prose UI bits

If `bone-faint` is used on body prose anywhere, lift to `bone-dim`.

- [ ] **Step 6: Reduced-motion still works**

Manual check: rebuild with `prefers-reduced-motion: reduce` simulated in DevTools (Rendering panel), confirm:
- Hero columns appear instantly (no fade-up)
- AVAILABLE pill blink is gone (status pill removed in earlier feedback, but test anyway)
- Lightbox open/close transition is effectively instant

Code-level check that the CSS rules exist:

```bash
grep -c 'prefers-reduced-motion' themes/am-mindmeld/assets/css/animations.css themes/am-mindmeld/assets/css/tokens.css
```

Expected: ≥2 matches (one in each file from Phases 1 and 6).

- [ ] **Step 7: Focus-visible coverage**

Tab-key navigation through each page should highlight every interactive element with the plasma 2px outline. The global rule in `base.css` covers all `:focus-visible` states, so this should pass everywhere unless a component overrides `outline: none`.

```bash
grep -rn 'outline: *none\|outline:none' themes/am-mindmeld/assets/css/ | grep -v ':focus:not(:focus-visible)'
```

Expected: no output. If anything matches, that's a manual `outline: none` override that suppresses focus styles — fix by removing it (the global focus-visible rule will take over).

- [ ] **Step 8: Aria landmarks**

Every page should have exactly one of each landmark:
- `<header>` (site header) — already in baseof.html
- `<main>` (main content area) — already in baseof.html
- `<footer>` (site footer / statusbar) — already in baseof.html

```bash
for page in /index.html /projects/index.html /about/index.html /contact/index.html /gallery/index.html; do
  header=$(grep -oE '<header[^>]*>' "public${page}" 2>/dev/null | wc -l)
  main=$(grep -oE '<main[^>]*>' "public${page}" 2>/dev/null | wc -l)
  footer=$(grep -oE '<footer[^>]*>' "public${page}" 2>/dev/null | wc -l)
  echo "  ${page}: header=${header}, main=${main}, footer=${footer}"
done
```

Expected: each page reports `header=1, main=1, footer=1`. The site-wide statusbar uses `<footer>` so that's the site footer. Sub-headers inside `<article>` (like `.about__top` `<header>`) are scoped element headers, not landmarks — they don't conflict.

- [ ] **Step 9: Document findings + commit (allow-empty if no fixes were needed)**

If everything passes:

```bash
git commit --allow-empty -m "$(cat <<'EOF'
A11y audit pass for Phase 4

Sweep of all 8 key pages. All checks pass:
- Skip-link present on every page
- Exactly one h1 per page (often visually-hidden in favor of the
  in-context terminal-frame title)
- Every <img> has an alt attribute (decorative ones use alt="")
- bone-faint usage confined to non-prose UI contexts (statusbar
  copyright, terminal-frame meta)
- prefers-reduced-motion rules in animations.css and tokens.css
  unchanged from Phase 1
- No outline: none overrides — global focus-visible rule applies
  everywhere
- Every page has exactly one <header>, one <main>, one <footer>
EOF
)"
```

If any check failed and you fixed it inline, commit those fixes with a more descriptive message.

## Report

- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED
- Skip-link check: which pages had it
- H1 count per page
- Alt text findings
- bone-faint findings (locations + appropriateness)
- Reduced-motion rule count
- outline:none override count
- Landmark counts
- Any inline fixes applied
- Commit SHA

---

## Task 7: Smoke check + Lighthouse

**Files:** none (verification only)

End-of-phase smoke pass.

- [ ] **Step 1: Production build**

```bash
hugo --gc --minify --logLevel info
```

Expected: exits 0, no warnings.

- [ ] **Step 2: Per-page render check (final)**

```bash
echo '=== About page renders new template ==='
grep -c 'class="about container"\|class=about container' public/about/index.html

echo '=== About has 12 experience entries ==='
grep -oE 'about__exp-header' public/about/index.html | wc -l

echo '=== Contact page renders new template ==='
grep -c 'class="contact container"\|class=contact container' public/contact/index.html

echo '=== Contact has copy button ==='
grep -c 'contact__copy' public/contact/index.html

echo '=== 404 page exists and shows SIGNAL LOST ==='
grep -c 'SIGNAL LOST' public/404.html

echo '=== All other pages still render ==='
for f in public/index.html public/projects/index.html public/projects/krazy_kaiju/index.html public/tools/index.html public/tools/rig_authoring_framework/index.html public/gallery/index.html; do
  echo "  $f $(test -f $f && echo present || echo MISSING)"
done

echo '=== Mobile hamburger still works on every page ==='
grep -c 'site-header__menu-toggle' public/about/index.html public/contact/index.html public/404.html
```

Expected: every check passes (≥1 match where applicable).

- [ ] **Step 3: Bundle size sanity**

```bash
ls -la public/css/main.min.*.css | head -1
ls -la public/index.html public/about/index.html public/contact/index.html
```

Expected:
- CSS bundle under 60 KB minified (was ~35 KB after Phase 3; we added ~3 KB across Phase 4 CSS)
- About page HTML under 30 KB minified (the experience timeline adds bulk but it's still text)

- [ ] **Step 4: Manual Lighthouse pass**

Run `hugo server -D` and Lighthouse in Chrome DevTools against each of these URLs:
- `http://localhost:1313/`
- `http://localhost:1313/about/`
- `http://localhost:1313/contact/`
- `http://localhost:1313/gallery/`
- `http://localhost:1313/projects/krazy_kaiju/`

Expected scores per page:
- Performance: ≥85
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥90

Document any scores below target. Fix what's straightforward inline; flag the rest in the commit message as known-deferred.

Stop the dev server when done.

- [ ] **Step 5: Commit (empty if no fixes)**

```bash
git commit --allow-empty -m "$(cat <<'EOF'
Smoke-check + Lighthouse pass for Phase 4

All 8 key pages render their dedicated templates. About page renders
12 experience entries via front-matter. Contact has working copy-on-
click. 404 page shows SIGNAL LOST terminal frame. Mobile hamburger
works everywhere. Bundle sizes within target.

Lighthouse scores meet or exceed targets across all pages tested.
EOF
)"
```

## Report

- **Status:** DONE
- Per-page render results
- Bundle sizes
- Lighthouse scores per page
- Any fixes applied
- Commit SHA

---

## Task 8: Phase 4 wrap-up — README + tag

**Files:**
- Modify: `themes/am-mindmeld/README.md`

- [ ] **Step 1: Update README known gaps**

Open `themes/am-mindmeld/README.md`. Find the "Known gaps" section (currently has one bullet about About / contact). Replace the entire Known gaps section content with:

```
- *(none — all primary templates are in place. Phase 5 handles cleanup: Blowfish submodule removal, redundant `static/gallery/` files now that the image pipeline serves the gallery, optional content backfill on remaining project/tool pages, and a final Lighthouse pass.)*
```

So the section now has just that single italicized "none" line.

- [ ] **Step 2: Build to confirm clean**

```bash
hugo --gc --minify
```

Expected: exits 0.

- [ ] **Step 3: Commit + tag**

```bash
git add themes/am-mindmeld/README.md
git commit -m "$(cat <<'EOF'
Phase 4 wrap-up: about + contact + 404 + a11y polish shipped

About page renders rich content (bio, skills, 12-entry experience
timeline) from front-matter. Contact is a clean single-panel with
copy-on-click email + status block + socials. Custom 404 with
SIGNAL LOST terminal frame. A11y audit complete — every page passes
WCAG-AA contrast, has a skip-link, semantic landmarks, focus-visible
coverage, and prefers-reduced-motion support.

Known gaps section now reads "none" — every primary template is in
place. Phase 5 handles cleanup only (Blowfish removal, image dir
dedup, optional content backfill, final Lighthouse).
EOF
)"

git tag phase-4-about-contact-404
```

## Report

- **Status:** DONE
- Build output
- Commit SHA + tag confirmation

---

## Self-review

**Spec coverage:**
- Master spec → "About page" — portrait + bio + skills + experience timeline → Tasks 1, 2, 3 ✓
- Master spec → "Contact page" — single panel, no form, email + status + socials → Task 4 ✓
- Master spec → "404 page" — SIGNAL LOST terminal frame → Task 5 ✓
- Master spec → Phase 4 outcome: "every page redesigned, accessibility-clean" → Tasks 1–5 + 6 (a11y audit) ✓
- Master spec → "Skip-to-content link" reachable everywhere → Task 6 Step 2 ✓

**Placeholder scan:** No "TBD", "TODO", or vague-instruction patterns. Each step has complete code or exact commands. Task 1 has the full migrated content for all 12 experience entries inline (not "and so on for the other 11"). Task 6's a11y audit has explicit grep/check commands for every category.

**Type / signature consistency:**
- Front-matter shape: `[params.bio]` array, `[params.about_me]` array of inline tables, `[params.skills]` nested table, `[[params.experience]]` array of tables — consistent across content/about/index.md and the about template
- About-template field names (`year_range`, `header`, `role`, `location`, `titles`, `bullets`) used identically in front-matter and template iteration
- Contact-template field names (`email`, `location`, `availability`, `preferred_contact`) used identically in front-matter and template
- CSS class naming follows BEM consistently (`about__exp-item`, `contact__email-row`, `error__title`)

**Ambiguity check:** None — every task has explicit verification steps.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-09-phase4-about-contact-404.md`. Two execution options:

**1. Subagent-Driven (recommended)** — same flow as Phases 1, 2, and 3. 8 tasks with focused review checkpoints.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
