// scripts/check-brand-gates.mjs (adrianmelian.com)
// Mechanical subset of the FabricatorStudio brand DNA (Mindmeld 2.0),
// knowledge/brand/fabricatorstudio.md in the MrMiata depot. Visual gates run at the ART gate.
//
// MINDMELD 2.0 (2026-07-13). 1.0 (industrial-terminal / console) is DEPRECATED. What that
// inverts in here, versus the old 1.0 gate file:
//   - VT323 was ALLOWED (max 2 uses/page). It is now BANNED outright.       (principle 3)
//   - Geist was ALLOWED as the body face. Now one family only: JBM.          (principle 4)
//   - Hard 2px corners were REQUIRED. Forms are now rounded.                 (principle 5)
//   - Gradients were carbon-stops-only and shadows banned. Depth is now
//     sanctioned; the constraint is that no gradient carries a THIRD HUE.    (principle 6)
//   - `// LABELS` and `[ BRACKETED CAPS ]` were the house style. Now banned. (principle 8)
// Surviving unchanged: naming, em-dashes, hype words, the two-accent color law.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'public'; // Hugo output
const failures = [];

if (!existsSync(DIST)) {
  console.error('run a build first (dist/ missing)');
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => extname(f) === '.html');
const cssFiles = files.filter((f) => extname(f) === '.css');

// Every CSS surface Astro can emit: external sheets, inlined <style> blocks, style="" attrs.
function cssSurfaces(f) {
  const out = [];
  if (extname(f) === '.css') {
    out.push([readFileSync(f, 'utf8'), f]);
    return out;
  }
  const html = readFileSync(f, 'utf8');
  for (const b of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) out.push([b[1], `${f} (inline <style>)`]);
  for (const m of html.matchAll(/style="([^"]*)"/gi)) out.push([m[1], `${f} (style attr)`]);
  return out;
}
const allCss = [...cssFiles.flatMap(cssSurfaces), ...htmlFiles.flatMap(cssSurfaces)];

// Rendered human-visible text: drop script/style, then tags, then decode the few entities
// we actually emit. Used by the copy gates so markup and URLs can't cause false hits.
//
// <code>/<pre> are also dropped. The docs legitimately QUOTE what a Maya tool prints on
// screen (e.g. the Bridge status pill reading `[ STOPPED ]`). That is product truth being
// documented, not FabricatorStudio brand chrome, and principle 8 governs our chrome.
function visibleText(f) {
  return readFileSync(f, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    // Decode em-dash entities too, or G11 would only ever catch the literal glyph and an
    // &mdash; in prose would sail straight through the gate.
    .replace(/&mdash;|&#8212;|&#x2014;/gi, '—');
}

// ---- principle 11: zero em-dashes in outbound copy -------------------------
for (const f of htmlFiles) {
  if (visibleText(f).includes('—')) failures.push(`G11 em-dash in ${f}`);
}

// ---- principle 12: zero hype-list words ------------------------------------
const HYPE = /revolutionary|game-changing|supercharge|unleash|seamless/i;
for (const f of htmlFiles) {
  const m = visibleText(f).match(HYPE);
  if (m) failures.push(`G12 hype word "${m[0]}" in ${f}`);
}

// ---- principle 9: the company renders as FabricatorStudio ------------------
// Compound, capital F and capital S, no dot, NO SPACE (DNA section 7). The gate used to
// test only the mid-word dot, so "Fabricator Studio" (spaced) sailed through it; that is
// just as much a naming break, and it turned up in real copy.
//
// G9b: the compound is ONLY legible because the capital F and S separate the two words, so
// uppercasing it destroys the name and yields the unreadable run-on "FABRICATORSTUDIO".
// Headings on this site are uppercased (CSS text-transform, and Hugo `upper`), so the name
// must be wrapped in .brand-name to keep its native casing. Catch the run-on in the output.
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  if (html.includes('Fabricator.Studio')) failures.push(`G9 "Fabricator.Studio" rendering in ${f}`);
  const spaced = visibleText(f).match(/Fabricator\s+Studio/);
  if (spaced) failures.push(`G9 spaced "${spaced[0]}" in ${f} (the company name is the compound FabricatorStudio)`);
  // Hugo-side `upper` bakes the run-on straight into the markup, so a text scan sees it.
  if (/FABRICATORSTUDIO/.test(visibleText(f))) {
    failures.push(`G9b uppercased "FABRICATORSTUDIO" in ${f} (wrap the name in .brand-name so casing survives)`);
  }
  // CSS text-transform does NOT: the markup still reads "FabricatorStudio" and only the
  // rendered pixels are wrong, so no text scan can catch it. Headings are uppercased by
  // rule here, so require the wrapper on any heading carrying the name.
  for (const [, inner] of html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)) {
    if (inner.includes('FabricatorStudio') && !inner.includes('brand-name')) {
      failures.push(`G9b bare "FabricatorStudio" in a heading in ${f} (uppercased by CSS; wrap it in .brand-name)`);
    }
  }
}

// ---- principles 3 + 4: ONE family, JetBrains Mono. VT323 and Geist retired --
const ALLOWED_FAMILY = /^(jetbrains mono|consolas|courier new|monospace|ui-monospace)$/i;
for (const [css, where] of allCss) {
  if (/vt323/i.test(css)) failures.push(`G3 VT323 referenced in ${where} (retired in 2.0)`);
  for (const decl of css.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    const bad = decl[1].split(',')
      .map((s) => s.replace(/['"]/g, '').trim())
      .filter((fam) => fam && !fam.startsWith('var(') && !ALLOWED_FAMILY.test(fam));
    if (bad.length) failures.push(`G4 non-JetBrains-Mono family [${bad.join(', ')}] in ${where}`);
  }
}
// The `vt` class was the 1.0 route to the pixel face; it must not survive the migration.
for (const f of htmlFiles) {
  const n = (readFileSync(f, 'utf8').match(/class="[^"]*\bvt\b[^"]*"/g) ?? []).length;
  if (n) failures.push(`G3 ${n} legacy .vt class use(s) in ${f} (rename to .display)`);
}

// ---- principle 5: forms are rounded ----------------------------------------
// The 1.0 hard-2px corner is the specific thing that fails; larger radii are the point.
for (const [css, where] of allCss) {
  for (const m of css.matchAll(/border-radius\s*:\s*([^;}]+)/gi)) {
    if (/(^|\s)2px(\s|$)/.test(m[1]) && !/var\(/.test(m[1])) {
      failures.push(`G5 hard 2px corner "border-radius: ${m[1].trim()}" in ${where} (2.0 forms are rounded)`);
    }
  }
}

// ---- principle 8: no console-era motifs in rendered copy --------------------
// `// LABEL` (slash-slash-space-CAPS; `https://` has no space so it cannot trip this),
// `[ BRACKETED CAPS ]`, the retired `\\ TAGLINE \\` wrap, and ASCII rules.
const MOTIFS = [
  [/\/\/\s+[A-Z]{2,}/, '// UPPERCASE label'],
  [/\[\s+[A-Z][A-Z0-9 .→>-]*\s+\]/, '[ BRACKETED CAPS ] pill'],
  [/\\\\\s+\S/, '\\\\ backslash-wrap tagline'],
  [/[═─]{3,}/, 'ASCII rule'],
];
for (const f of htmlFiles) {
  const text = visibleText(f);
  for (const [re, label] of MOTIFS) {
    const m = text.match(re);
    if (m) failures.push(`G8 console-era motif (${label}): "${m[0].trim()}" in ${f}`);
  }
}

// ---- principles 1 + 6: the palette, and depth without a third hue ----------
// Every hex in shipped CSS must be a DNA palette color (or a pure neutral used for shadow
// ink). A stray hex is how a third accent sneaks in.
const PALETTE = new Set([
  '0b0e10', '1c2126', '262c33', '353d45',           // carbon + iron tints
  'e8e0d0', '8a8378', '5a554d',                     // bone + dims
  '7cffb2', '4fb888',                               // plasma
  'ff7a3d', 'b5532a',                               // ember
  '000', '000000', 'fff', 'ffffff',                 // neutrals (shadow / scrim ink)
]);
// Principle 1 bans a third functional ACCENT, not a neutral tint. The animated tool-window
// heroes legitimately depict Maya chrome in blue-greys, and iron itself sits at ~0.26
// saturation, so a flat hex allowlist produces noise. Gate on SATURATION instead: a
// desaturated tint is fine; a saturated hue that isn't plasma or ember is a third accent.
function rgbOf(hex) {
  const h = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex.slice(0, 6);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const SAT_LIMIT = 0.35;  // above iron's own ~0.26; plasma ~0.51 and ember ~0.76 are palette
const DARK_FLOOR = 48;   // below this, tiny channel deltas inflate saturation; these are
                         // carbon-family darks (#0e1216 etc), never an accent.
for (const [css, where] of allCss) {
  for (const m of css.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
    const hex = m[1].toLowerCase().replace(/^(.{6})([0-9a-f]{2})$/, '$1'); // drop 8-digit alpha
    if (PALETTE.has(hex)) continue;
    const [r, g, b] = rgbOf(hex);
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max < DARK_FLOOR) continue;
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat > SAT_LIMIT) {
      failures.push(`G1 off-palette ACCENT #${m[1]} in ${where} (plasma + ember only, never a third)`);
    }
  }
}

// Gradients are now ALLOWED (2.0 sanctions gentle gradients). The rule is that every stop
// stays inside the palette: a gradient carrying a third hue fails.
const PALETTE_RGB = [
  [11, 14, 16], [28, 33, 38], [38, 44, 51], [53, 61, 69],
  [232, 224, 208], [138, 131, 120], [90, 85, 77],
  [124, 255, 178], [79, 184, 136],
  [255, 122, 61], [181, 83, 42],
  [0, 0, 0], [255, 255, 255],
];
// A gradient's FIRST argument is a direction/shape, not a color stop. Linear takes an angle
// or `to <side>`. Radial takes an optional shape + size + position, e.g.
// `ellipse 760px 560px at 22% 46%`, which must be matched as ONE token or it gets mistaken
// for a color and false-fails the palette check.
const DIRECTION = new RegExp(
  '^(' +
    'to\\s+(top|bottom|left|right)(\\s+(left|right|top|bottom))?' +      // linear: to bottom right
    '|-?[\\d.]+(deg|grad|rad|turn)' +                                     // linear: 45deg
    '|(circle|ellipse)?\\s*' +                                            // radial: shape
      '((closest|farthest)-(side|corner)|[\\d.]+(px|%|r?em|vw|vh)(\\s+[\\d.]+(px|%|r?em|vw|vh))?)?' + // size
      '\\s*(at\\s+[^,]+)?' +                                             // position
    '|from\\s+[^,]+|at\\s+[^,]+' +                                       // conic
  ')$',
  'i',
);

function extractBalanced(text, openParenIdx) {
  let depth = 0;
  for (let i = openParenIdx; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') {
      depth--;
      if (depth === 0) return text.slice(openParenIdx + 1, i);
    }
  }
  return null;
}
function findGradientBodies(css, fnName) {
  const bodies = [];
  const re = new RegExp(`${fnName}\\s*\\(`, 'gi');
  let m;
  while ((m = re.exec(css))) {
    const body = extractBalanced(css, m.index + m[0].length - 1);
    if (body != null) bodies.push(body);
  }
  return bodies;
}
function splitTopLevel(str) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of str) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; } else { cur += ch; }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}
function isPaletteStop(color) {
  const c = color.trim().toLowerCase();
  if (c === 'transparent' || c === 'currentcolor' || c.startsWith('var(')) return true;
  const hex = c.match(/^#([0-9a-f]{3,8})$/);
  if (hex) return PALETTE.has(hex[1].replace(/^(.{6})([0-9a-f]{2})$/, '$1'));
  const rgb = c.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (rgb) {
    const [r, g, b] = [+rgb[1], +rgb[2], +rgb[3]];
    return PALETTE_RGB.some(([pr, pg, pb]) => pr === r && pg === g && pb === b);
  }
  return false; // a named CSS color (red, gold, ...) is exactly the third hue we're banning
}
for (const [css, where] of allCss) {
  for (const fn of ['linear-gradient', 'radial-gradient', 'conic-gradient']) {
    for (const body of findGradientBodies(css, fn)) {
      for (const part of splitTopLevel(body)) {
        if (!part || DIRECTION.test(part)) continue;
        const cm = part.match(/^(rgba?\([^)]*\)|var\([^)]*\)|#[0-9a-fA-F]{3,8}|[a-zA-Z-]+)/);
        const color = cm ? cm[1] : part;
        if (!isPaletteStop(color)) {
          failures.push(`G6 off-palette gradient stop "${color}" in ${fn}(${body.slice(0, 60)}...) in ${where}`);
        }
      }
    }
  }
}

if (failures.length) {
  // Group by gate so the output reads as a punch-list, not a wall.
  const byGate = new Map();
  for (const x of failures) {
    const g = x.slice(0, x.indexOf(' '));
    if (!byGate.has(g)) byGate.set(g, []);
    byGate.get(g).push(x);
  }
  console.error(`BRAND GATES FAILED (Mindmeld 2.0) — ${failures.length} violation(s):\n`);
  for (const [g, list] of [...byGate].sort()) {
    console.error(`  ${g} — ${list.length}`);
    for (const x of list.slice(0, 6)) console.error(`    - ${x.slice(g.length + 1)}`);
    if (list.length > 6) console.error(`    ... and ${list.length - 6} more`);
    console.error('');
  }
  process.exit(1);
}
console.log(`brand gates: clean, Mindmeld 2.0 (${htmlFiles.length} pages, ${cssFiles.length} stylesheets)`);
