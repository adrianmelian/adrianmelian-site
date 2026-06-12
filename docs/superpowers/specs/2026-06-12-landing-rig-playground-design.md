# Landing Page Redesign: SOLVER ONLINE (Rig Playground)

**Date:** 2026-06-12
**Scope:** Homepage only. Inner pages, header, statusbar footer stay as they are.
**Stack:** Hugo + vendored GSAP 3.13 (ScrollTrigger, SplitText, ScrambleText) + vendored Three.js 0.182. No CDN at runtime.

## Why

The current homepage is competent but conventional: static hero, zigzag cards, CSS fade-ups. The goal is an awwwards-caliber landing page that proves the craft instead of describing it. Three concepts were generated and judged (rig playground, scroll cinema, terminal OS). Both judges picked the rig playground: the hero is a live inverse-kinematics solver, and the brand is literally Kinematic Solutions. The page demonstrates the product category of its owner in the first second.

## Governing rules

1. **Native scroll. No pinning, no scroll-jacking, no blocking loader.** Hero text is interactive at first paint; WebGL is garnish, never on the critical path.
2. **Type prints, it never fades.** Text reveals use stepped/instant character reveals (SplitText stagger, ScrambleText on labels), not soft cross-fades. Positional motion may use smooth eases; opacity on text may not tween slowly.
3. **Nothing faked.** The solver is a real FABRIK/CCD implementation, HUD numbers are real (iterations, residual, ms, frame counter). A provenance caption says so.
4. **Mindmeld palette only.** carbon/iron/bone/plasma/ember + derivatives, VT323 + JetBrains Mono. All colors come from tokens.css.
5. **Production vocabulary test:** every element must read as rigging/DCC vocabulary to a AAA rigging lead in under a second (persp viewport, octahedral bones, IK handle, pole vector, channel box, time slider, plugin manager).
6. **One video decoding at a time.** CLS ~0 (fixed-height hero, reserved media boxes). prefers-reduced-motion gets a static posed rig and instant reveals. No WebGL gets an inline SVG skeleton fallback.

## Page structure

### 00 / HERO: rig playground (100svh, full-bleed canvas)

- Three.js scene behind a left-anchored text column. Radial carbon scrim behind the text so wireframes never hurt legibility.
- Scene: perspective ground grid (iron tones, fog to carbon), a 7-joint IK chain with Maya-faithful octahedral wireframe bones (plasma), wireframe joint spheres, ember double-circle IK handle on the effector, pole-vector locator with dashed line, corner axis tripod (X ember, Y plasma, Z bone-dim), slight camera parallax on mouse (desktop only).
- Solver: FABRIK by default, CCD via toggle. Critically damped spring target (~90ms half-life; 40ms while grabbed). Soft reach when target exceeds chain length. Target region is clamped so the chain never enters the headline bounding box.
- Build-in (non-blocking, runs while text prints): joints pop root-to-tip 80ms apart (back.out), bones draw in, HUD scrambles from [ BUILDING RIG... ] to [ SOLVER: FABRIK / ONLINE ] at ~1.1s, then the chain tracks the cursor.
- Idle: after 4s without input, target blends onto a slow figure-eight path. Every ~25s a "calisthenics" timeline runs (stretch, curl, lateral wave, return).
- HUD: top-left `persp / ks_rig_playground.ma`; top-right toolbar pills [ SOLVER: FABRIK ] (real toggle), [ MIRROR ], [ RESET ]; bottom-right channel box with live effector tx/ty/tz, iterations, residual, frame ms, frame counter; bottom-left provenance line `// REAL-TIME IK. NOTHING FAKED.`
- Text column: Iwahashi crest (small, pixelated), ADRIAN MELIAN in VT323 (MELIAN plasma), tagline, quick links (Resume PDF, Reel, LinkedIn, GitHub), scroll cue.
- Touch: a touch starting within 44px of the effector grabs it (preventDefault); everywhere else the page scrolls normally (touch-action: pan-y). Idle path keeps the hero alive for non-grabbing visitors.
- Fallbacks: no WebGL = inline SVG posed skeleton, static HUD. Reduced motion = static posed rig, no idle animation, instant text.

### 01 / FEATURED: Kinematic Solutions pipeline switcher

Full-width terminal frame titled `featured.project / kinematic_solutions.session`.

- Stage chips in a pipeline row: [ BUILD RIG ] -> [ SKIN ] -> [ ORIENT ] -> [ ANIMATE ], plasma pulse traveling the connector.
- Clicking a chip swaps the active demo video (180ms crossfade, ember underline on active chip). Stage-to-media map:
  - BUILD RIG: `/tools/kinematic_solutions/fab_animation.mp4` (poster fabricator.png)
  - SKIN: `/tools/kinematic_solutions/autoskin.mp4` (poster autoskin.png)
  - ORIENT: `/tools/kinematic_solutions/aimers.mp4` (poster aimer.png)
  - ANIMATE: `/MichaelRig.mp4` (poster MichaelPainter.png)
- Only the active video has a src attached (muted, loop, playsinline). Inactive stages release their src.
- Maya-style time slider under the video: live playhead, draggable to scrub (pauses while scrubbing, resumes on release). Same element for all stages.
- Right rail: KS title, description, three capability bullets, `OPEN PROJECT ->` CTA to /tools/kinematic_solutions/, plus `[ > ] FULL PIPELINE VIDEO` link to the same page (the YouTube embed Yh07bdO4FeY lives there).

### 02 / SHIPPED: the build log

Career ledger replacing zigzag cards. One monospace row per project (all 13, newest first, driven by front matter: shipped_year, title, studio, role). Desktop hover floats the project's featured image beside the cursor (clip-path reveal, lerp follow); row index turns ember. Mobile shows a small inline thumbnail. Every row links to its project page. `ALL PROJECTS ->` link preserved.

### 03 / TOOLBOX: plugin manager

Tools as a plugin-manager list: name, one-line description, status pill ([ LOADED ] for shipped, [ BETA ] for in_development), arrow link. All tools pages listed. `ALL TOOLS ->` link preserved.

### 04 / RENDER TARGETS: gallery teaser

Keep the existing 3-cell bento (ufo.jpg, 07.jpg, 039.jpg) with scroll reveal. `VIEW GALLERY ->` preserved.

### 05 / TRANSMISSION: close

Big VT323 close: `OPEN FOR TRANSMISSION`, short line, CTA row (CONTACT -> /contact/, plus Resume/Reel/LinkedIn/GitHub repeats). Statusbar footer unchanged below.

## Motion system (GSAP)

- Load: headline chars print (stagger 0.014, no opacity tween), labels scramble in (custom char set `█▓▒░<>/[]_`), quick links rise 12px expo.out. Rig build-in runs in parallel.
- Scroll: ScrollTrigger batch reveals per section; section headings scramble once on first enter; ledger rows stagger 0.04s; bento cells rise. All reveals run once, no scrub, no pin.
- Micro: chip underline scaleX 160ms; CTA magnetic pull (desktop, ±8px); statusbar untouched.
- `prefers-reduced-motion`: gsap.matchMedia routes every tween to instant set().

## Implementation

```
themes/am-mindmeld/
├── layouts/index.html                 rewritten
├── layouts/_default/baseof.html       + {{ block "scripts" . }} before </body>
├── layouts/partials/head.html         unchanged bundle (homepage.css rewritten in place)
├── assets/css/layout/homepage.css     rewritten (hero/HUD/pipeline/ledger/plugin/close)
└── assets/js/
    ├── vendor/{gsap,ScrollTrigger,SplitText,ScrambleTextPlugin}.min.js + three.module.min.js
    ├── solver.js        FABRIK + CCD, damped spring, plain JS, no deps
    ├── rig-hero.js      Three.js scene, HUD bindings, input, idle, fallback (ES module, js.Build)
    └── home-motion.js   GSAP choreography + pipeline switcher + time slider + ledger hover
```

- GSAP files load as deferred classic scripts (fingerprinted Hugo resources). rig-hero.js bundles three via js.Build, loaded as deferred module. Homepage only.
- Renderer caps: DPR clamp 2 desktop / 1.5 mobile, ~20 draw calls, pause on document.hidden and when hero leaves viewport (IntersectionObserver).

## Ship gates

- Zero console errors. Zero horizontal overflow at 390px.
- Hero text visible at first paint; rig interactive < 2s on dev server.
- All preserved links present: nav 5, social 3, quick links 4, 13 project rows, all tool rows, gallery/projects/tools more-links, contact CTA.
- Reduced-motion and no-WebGL paths render complete content.
- Verified in Chrome (DevTools/Playwright): desktop 1440, iPhone 14 Pro emulation, full-page screenshots, console + overflow checks.
