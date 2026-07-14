/* rig-hero.js — the SOLVER ONLINE hero viewport.
 *
 * A real FABRIK/CCD IK chain rendered as Maya-faithful octahedral wireframe
 * bones, chasing a spring-damped target. HUD numbers come straight from the
 * solver. Degrades: no WebGL -> inline SVG fallback stays visible;
 * prefers-reduced-motion -> static posed rig, no loop.
 */
import {
  AdditiveBlending, BufferGeometry, CanvasTexture, Color, Float32BufferAttribute,
  Fog, Group, Line, LineBasicMaterial, LineDashedMaterial, LineSegments,
  PerspectiveCamera, Plane, Quaternion, Raycaster, Scene, Sprite, SpriteMaterial,
  Vector3, WebGLRenderer,
} from './vendor/three.module.js';
import { IKChain, SpringVec3, vAdd, vScale, vNorm, vLerp, vDist } from './solver.js';

const THREE = {
  AdditiveBlending, BufferGeometry, CanvasTexture, Color, Float32BufferAttribute,
  Fog, Group, Line, LineBasicMaterial, LineDashedMaterial, LineSegments,
  PerspectiveCamera, Plane, Quaternion, Raycaster, Scene, Sprite, SpriteMaterial,
  Vector3, WebGLRenderer,
};

const hero = document.getElementById('rig-hero');
const canvas = document.getElementById('rig-canvas');
if (hero && canvas) init();

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function init() {
  const COL = {
    carbon: cssVar('--carbon', '#0B0E10'),
    iron2: cssVar('--iron-2', '#262C33'),
    iron3: cssVar('--iron-3', '#353D45'),
    bone: cssVar('--bone', '#E8E0D0'),
    boneDim: cssVar('--bone-dim', '#8A8378'),
    plasma: cssVar('--plasma', '#7CFFB2'),
    plasmaDim: cssVar('--plasma-dim', '#4FB888'),
    ember: cssVar('--ember', '#FF7A3D'),
    emberDim: cssVar('--ember-dim', '#B5532A'),
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const gsap = window.gsap || null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    hero.classList.add('rig-hero--fallback');
    return;
  }
  hero.classList.add('rig-hero--webgl');
  renderer.setClearColor(new THREE.Color(COL.carbon), 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(COL.carbon), 9, 17);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  const CAM_BASE = new THREE.Vector3(0, 2.1, 8.6);
  const CAM_LOOK = new THREE.Vector3(0.5, 1.8, 0);
  camera.position.copy(CAM_BASE);
  camera.lookAt(CAM_LOOK);

  // ---------------------------------------------------------------- ground
  function buildGrid() {
    const minor = [];
    const major = [];
    for (let x = -14; x <= 14; x++) {
      (x === 0 ? major : minor).push(x, 0, -6, x, 0, 9);
    }
    for (let z = -6; z <= 9; z++) {
      (z === 0 ? major : minor).push(-14, 0, z, 14, 0, z);
    }
    const make = (arr, color, opacity) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    };
    const grid = new THREE.Group();
    grid.add(make(minor, new THREE.Color(COL.iron2), 0.55));
    grid.add(make(major, new THREE.Color(COL.iron3), 0.8));
    return grid;
  }
  scene.add(buildGrid());

  // ------------------------------------------------------- shared geometry
  // Maya-style octahedral bone: unit length along +Y, ring at 15%.
  function boneGeometry() {
    const w = 0.14, ry = 0.15;
    const tip = [0, 1, 0], root = [0, 0, 0];
    const ring = [[w, ry, 0], [0, ry, w], [-w, ry, 0], [0, ry, -w]];
    const segs = [];
    for (let i = 0; i < 4; i++) {
      const a = ring[i], b = ring[(i + 1) % 4];
      segs.push(...root, ...a, ...a, ...tip, ...a, ...b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    return g;
  }

  // Maya-style joint: three orthogonal circles.
  function jointGeometry() {
    const segs = [];
    const N = 20;
    for (let axis = 0; axis < 3; axis++) {
      for (let i = 0; i < N; i++) {
        const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
        const p0 = [Math.cos(a0), Math.sin(a0)], p1 = [Math.cos(a1), Math.sin(a1)];
        if (axis === 0) segs.push(0, p0[0], p0[1], 0, p1[0], p1[1]);
        else if (axis === 1) segs.push(p0[0], 0, p0[1], p1[0], 0, p1[1]);
        else segs.push(p0[0], p0[1], 0, p1[0], p1[1], 0);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    return g;
  }

  function circleGeometry(radius, n = 40) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }

  function glowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.25)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  function letterSprite(letter, color) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    ctx.font = '44px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(letter, 32, 34);
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9, depthTest: false }));
    sprite.scale.setScalar(0.16);
    return sprite;
  }

  // ----------------------------------------------------------------- chain
  const N_JOINTS = 7;
  let boneLen = 0.74;
  let rootPos = [1.7, 0, 0];

  function bindPose(root, len) {
    // Gentle forward S-curve so solvers have a bend hint.
    const pts = [root.slice()];
    let dir = [0.06, 1, 0.05];
    for (let i = 1; i < N_JOINTS; i++) {
      const sway = Math.sin(i * 0.9) * 0.22;
      dir = vNorm([dir[0] + sway * 0.18, 1, dir[2] + Math.cos(i) * 0.05]);
      pts.push(vAdd(pts[i - 1], vScale(dir, len)));
    }
    return pts;
  }

  let chain = new IKChain(bindPose(rootPos, boneLen));

  const plasmaC = new THREE.Color(COL.plasma);
  const boneMat = new THREE.LineBasicMaterial({ color: plasmaC, transparent: true, opacity: 0.85 });
  const jointMat = new THREE.LineBasicMaterial({ color: plasmaC, transparent: true, opacity: 0.95 });

  const boneGeo = boneGeometry();
  const jointGeo = jointGeometry();
  const glowTex = glowTexture();

  const rigGroup = new THREE.Group();
  scene.add(rigGroup);

  const bones = [], joints = [], glows = [];
  const buildScale = [];
  for (let i = 0; i < N_JOINTS; i++) {
    const joint = new THREE.LineSegments(jointGeo, jointMat);
    joint.scale.setScalar(0.09);
    rigGroup.add(joint);
    joints.push(joint);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: plasmaC, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(0.55);
    rigGroup.add(glow);
    glows.push(glow);

    buildScale.push(reducedMotion || !gsap ? 1 : 0);
    if (i < N_JOINTS - 1) {
      const bone = new THREE.LineSegments(boneGeo, boneMat);
      rigGroup.add(bone);
      bones.push(bone);
    }
  }

  // IK handle: double ember circle + ticks at the effector.
  const handleGroup = new THREE.Group();
  const handleMat = new THREE.LineBasicMaterial({ color: new THREE.Color(COL.ember), transparent: true, opacity: 0.9 });
  handleGroup.add(new THREE.Line(circleGeometry(0.26), handleMat));
  handleGroup.add(new THREE.Line(circleGeometry(0.34), handleMat));
  {
    const ticks = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      ticks.push(Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0, Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(ticks, 3));
    handleGroup.add(new THREE.LineSegments(g, handleMat));
  }
  rigGroup.add(handleGroup);

  // Pole vector locator + dashed line to mid joint.
  const pvMat = new THREE.LineBasicMaterial({ color: new THREE.Color(COL.emberDim), transparent: true, opacity: 0.75 });
  const pvPos = new THREE.Vector3(rootPos[0] - 0.4, 1.5, 2.3);
  const pvGroup = new THREE.Group();
  {
    const s = 0.14;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      -s, 0, 0, s, 0, 0, 0, -s, 0, 0, s, 0, 0, 0, -s, 0, 0, s,
    ], 3));
    pvGroup.add(new THREE.LineSegments(g, pvMat));
  }
  pvGroup.position.copy(pvPos);
  rigGroup.add(pvGroup);

  const pvLineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const pvLine = new THREE.Line(pvLineGeo, new THREE.LineDashedMaterial({
    color: new THREE.Color(COL.emberDim), dashSize: 0.12, gapSize: 0.09, transparent: true, opacity: 0.55,
  }));
  rigGroup.add(pvLine);

  // Axis tripod, world-aligned, pinned near the bottom-right of the view —
  // parallax makes it visibly rotate, like a viewport gizmo.
  const tripod = new THREE.Group();
  {
    const axes = [
      { dir: new THREE.Vector3(1, 0, 0), color: COL.ember, letter: 'X' },
      { dir: new THREE.Vector3(0, 1, 0), color: COL.plasma, letter: 'Y' },
      { dir: new THREE.Vector3(0, 0, 1), color: COL.boneDim, letter: 'Z' },
    ];
    for (const a of axes) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), a.dir.clone().multiplyScalar(0.34)]);
      tripod.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: new THREE.Color(a.color), transparent: true, opacity: 0.9, depthTest: false })));
      const s = letterSprite(a.letter, a.color);
      s.position.copy(a.dir.clone().multiplyScalar(0.46));
      tripod.add(s);
    }
    tripod.renderOrder = 10;
    scene.add(tripod);
  }

  // ------------------------------------------------------------------ HUD
  const $ = (id) => document.getElementById(id);
  const hud = {
    solverBtn: $('hud-solver'),
    mirrorBtn: $('hud-mirror'),
    resetBtn: $('hud-reset'),
    freezeBtn: $('hud-freeze'),
    tx: $('ch-tx'), ty: $('ch-ty'), tz: $('ch-tz'),
    iter: $('ch-iter'), err: $('ch-err'), ms: $('ch-ms'), frame: $('ch-frame'),
    grab: $('rig-grab'),
  };

  // ------------------------------------------------------------ state
  let solverName = 'FABRIK';
  let pointerTarget = null;          // last pointer-derived target (world)
  let lastInputTime = -1e9;
  let grabbed = false;
  let idleBlend = reducedMotion ? 1 : 0;
  let idleClock = Math.PI * 0.5;     // start at a pleasant pose
  let mirrorSign = 1;
  let calisthenics = null;           // {pos:[x,y,z]} proxy while routine runs
  let lastCalisthenics = 0;
  let frameCount = 0;
  let msEMA = 16.6;
  let stats = { iterations: 0, error: 0 };
  let running = false;
  let rafId = 0;
  let heroVisible = false;
  let frozen = false;
  let lastDPR = window.devicePixelRatio || 1;
  let renderedOnce = false;
  const spring = new SpringVec3(chain.effector.slice(), 12, 0.82);
  const camParallax = { x: 0, y: 0 };

  const clamp = { minX: -3, maxX: 5, minY: 0.18, maxY: 4.6, minZ: -1.2, maxZ: 1.6 };

  const raycaster = new THREE.Raycaster();
  const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const tmpV3 = new THREE.Vector3();

  function ndcToPlane(nx, ny, out) {
    raycaster.setFromCamera({ x: nx, y: ny }, camera);
    return raycaster.ray.intersectPlane(planeZ, out);
  }

  function clampTarget(t) {
    return [
      Math.min(clamp.maxX, Math.max(clamp.minX, t[0])),
      Math.min(clamp.maxY, Math.max(clamp.minY, t[1])),
      Math.min(clamp.maxZ, Math.max(clamp.minZ, t[2])),
    ];
  }

  // ------------------------------------------------------------ layout
  let isNarrow = false;

  function relayout() {
    const w = hero.clientWidth, h = hero.clientHeight;
    lastDPR = window.devicePixelRatio || 1;
    renderer.setPixelRatio(Math.min(lastDPR, w < 760 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    isNarrow = w < 760;
    const newRoot = isNarrow ? [0.35, 0, 0] : [1.7, 0, 0];
    const newLen = isNarrow ? 0.5 : 0.74;
    if (vDist(newRoot, rootPos) > 1e-3 || Math.abs(newLen - boneLen) > 1e-3) {
      rootPos = newRoot;
      boneLen = newLen;
      chain = new IKChain(bindPose(rootPos, boneLen));
      spring.set(chain.effector.slice());
      pvGroup.position.set(rootPos[0] - 0.4, isNarrow ? 1.1 : 1.5, isNarrow ? 1.7 : 2.3);
      pvPos.copy(pvGroup.position);
    }

    // World-space bounds from the canvas edges...
    const corner = new THREE.Vector3();
    if (ndcToPlane(0.97, 0.92, corner)) { clamp.maxX = corner.x - 0.95; clamp.maxY = Math.min(corner.y - 0.35, 4.6); }
    if (ndcToPlane(-0.97, -0.9, corner)) { clamp.minX = corner.x + 0.2; clamp.minY = Math.max(0.18, corner.y); }
    clamp.minY = Math.max(clamp.minY, 0.18);

    // ...minus the headline text block, so the chain never crosses the type.
    const text = hero.querySelector('.rig-hero__content');
    if (text) {
      const tr = text.getBoundingClientRect();
      const hr = hero.getBoundingClientRect();
      if (!isNarrow) {
        const nx = ((tr.right - hr.left) / hr.width) * 2 - 1;
        if (ndcToPlane(nx, 0, corner)) clamp.minX = Math.max(clamp.minX, corner.x + 0.35);
      } else {
        // Bound below the text block, minus headroom for the chain's curl
        // (slack folds ~1.1 units above a low effector).
        const ny = -(((tr.bottom - hr.top) / hr.height) * 2 - 1);
        if (ndcToPlane(0, ny, corner)) clamp.maxY = Math.min(clamp.maxY, Math.max(corner.y - 1.1, 0.8));
      }
    }
    tripodAnchor();
  }

  function tripodAnchor() {
    // Pin tripod near bottom-left of the viewport at a fixed depth.
    const v = new THREE.Vector3();
    if (ndcToPlane(isNarrow ? -0.78 : -0.88, -0.78, v)) {
      tripod.position.set(v.x, Math.max(v.y, 0.12), v.z);
    }
  }

  new ResizeObserver(relayout).observe(hero);
  relayout();

  // ------------------------------------------------------------ input
  function heroNDC(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * 2 - 1,
      y: -(((clientY - r.top) / r.height) * 2 - 1),
    };
  }

  function killCalisthenics() {
    if (calisthenics) {
      if (calisthenics.tl) calisthenics.tl.kill();
      calisthenics = null;
      lastCalisthenics = performance.now() / 1000;
    }
  }

  function pointTarget(clientX, clientY) {
    const ndc = heroNDC(clientX, clientY);
    if (ndcToPlane(ndc.x, ndc.y, tmpV3)) {
      killCalisthenics(); // live input always beats the idle routine
      pointerTarget = clampTarget([tmpV3.x, tmpV3.y, tmpV3.z]);
      lastInputTime = performance.now() / 1000;
    }
  }

  if (finePointer && !reducedMotion) {
    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        pointTarget(e.clientX, e.clientY);
        const ndc = heroNDC(e.clientX, e.clientY);
        camParallax.x = ndc.x;
        camParallax.y = ndc.y;
      }
    }, { passive: true });
  }

  // Grab puck: a 44px hit-area div pinned to the effector's screen position.
  if (hud.grab && !reducedMotion) {
    hud.grab.addEventListener('pointerdown', (e) => {
      grabbed = true;
      spring.omega = 25;
      hud.grab.classList.add('is-grabbing');
      hud.grab.setPointerCapture(e.pointerId);
      pointTarget(e.clientX, e.clientY);
      e.preventDefault();
    });
    hud.grab.addEventListener('pointermove', (e) => {
      if (grabbed) pointTarget(e.clientX, e.clientY);
    });
    const release = () => {
      grabbed = false;
      spring.omega = 12;
      hud.grab.classList.remove('is-grabbing');
    };
    hud.grab.addEventListener('pointerup', release);
    hud.grab.addEventListener('pointercancel', release);

    // Keyboard path for the signature interaction: arrows nudge the target.
    hud.grab.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 0.6 : 0.25;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = step;
      else if (e.key === 'ArrowDown') dy = -step;
      else return;
      killCalisthenics();
      const base = pointerTarget || chain.effector.slice();
      pointerTarget = clampTarget([base[0] + dx, base[1] + dy, base[2]]);
      lastInputTime = performance.now() / 1000;
      e.preventDefault();
    });
  }

  // ------------------------------------------------------------ HUD wiring
  // Mindmeld 2.0: scramble-text is a RETIRED console motif (brand DNA principle 8), so the
  // label just sets cleanly now. Name kept so the call sites below are untouched.
  function scrambleLabel(el, text) {
    el.textContent = text;
  }

  if (hud.solverBtn) {
    hud.solverBtn.addEventListener('click', () => {
      solverName = solverName === 'FABRIK' ? 'CCD' : 'FABRIK';
      scrambleLabel(hud.solverBtn.querySelector('span'), `SOLVER: ${solverName}`);
      hud.solverBtn.classList.toggle('is-ccd', solverName === 'CCD');
      lastInputTime = performance.now() / 1000;
    });
  }
  if (hud.freezeBtn) {
    hud.freezeBtn.addEventListener('click', () => {
      frozen = !frozen;
      hud.freezeBtn.textContent = frozen ? 'PLAY' : 'FREEZE';
      hud.freezeBtn.setAttribute('aria-pressed', String(frozen));
      if (frozen) {
        killCalisthenics();
        setRunning(false);
        requestRender();
      } else {
        setRunning(heroVisible && !document.hidden);
      }
    });
  }
  if (hud.mirrorBtn) {
    hud.mirrorBtn.addEventListener('click', () => {
      killCalisthenics();
      mirrorSign *= -1;
      const rx = rootPos[0];
      const flip = (p) => { p[0] = 2 * rx - p[0]; };
      chain.positions.forEach(flip);
      flip(spring.x); spring.v[0] *= -1;
      if (pointerTarget) flip(pointerTarget);
      lastInputTime = performance.now() / 1000;
      requestRender();
    });
  }
  if (hud.resetBtn) {
    hud.resetBtn.addEventListener('click', () => {
      killCalisthenics();
      pointerTarget = null;
      mirrorSign = 1;
      const bindEff = chain.bind[chain.bind.length - 1].slice();
      if (gsap && !reducedMotion) {
        const proxy = { t: 0 };
        const startPositions = chain.positions.map((p) => p.slice());
        gsap.to(proxy, {
          t: 1, duration: 0.55, ease: 'power3.inOut',
          onUpdate() {
            for (let i = 0; i < chain.positions.length; i++) {
              chain.positions[i] = vLerp(startPositions[i], chain.bind[i], proxy.t);
            }
            spring.set(chain.effector.slice());
          },
        });
      } else {
        chain.resetToBind();
        spring.set(bindEff);
        requestRender();
      }
      lastInputTime = performance.now() / 1000 - 10; // hand straight to idle
    });
  }

  // ------------------------------------------------------------ idle paths
  function idleTarget(t) {
    const cx = rootPos[0] + (isNarrow ? 0 : -0.2);
    const cy = isNarrow ? Math.min(0.95, clamp.maxY - 0.2) : 2.4;
    const ax = isNarrow ? 1.0 : 1.45;
    const ay = isNarrow ? 0.35 : 0.9;
    return clampTarget([
      cx + Math.sin(t * 0.45) * ax * mirrorSign,
      cy + Math.sin(t * 0.9) * ay,
      Math.sin(t * 0.31) * 0.35,
    ]);
  }

  function maybeCalisthenics(now) {
    if (!gsap || reducedMotion || calisthenics) return;
    if (now - lastInputTime < 25 || now - lastCalisthenics < 25) return;
    lastCalisthenics = now;
    const L = chain.totalLength;
    const rx = rootPos[0];
    const poses = [
      [rx, L * 0.97, 0],                       // full stretch
      [rx + 0.5 * mirrorSign, 0.7, 0.4],       // tight curl
      [rx + (isNarrow ? 0.9 : 1.9) * mirrorSign, 1.3, -0.5], // lateral reach
    ];
    const proxy = { pos: spring.x.slice() };
    const tl = gsap.timeline({
      onComplete() { calisthenics = null; lastCalisthenics = performance.now() / 1000; },
    });
    calisthenics = { pos: proxy.pos, tl };
    for (const p of poses) {
      const c = clampTarget(p);
      tl.to(proxy.pos, { 0: c[0], 1: c[1], 2: c[2], duration: 1.05, ease: 'elastic.out(1, 0.55)' }, '+=0.18');
    }
  }

  // ------------------------------------------------------------ visuals
  const UP = new THREE.Vector3(0, 1, 0);
  const tmpDir = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();

  function syncVisuals(t) {
    const p = chain.positions;
    for (let i = 0; i < N_JOINTS; i++) {
      joints[i].position.set(p[i][0], p[i][1], p[i][2]);
      joints[i].scale.setScalar(0.09 * Math.max(buildScale[i], 0.0001));
      glows[i].position.copy(joints[i].position);
      glows[i].scale.setScalar(0.55 * Math.max(buildScale[i], 0.0001));
    }
    for (let i = 0; i < N_JOINTS - 1; i++) {
      const a = p[i], b = p[i + 1];
      bones[i].position.set(a[0], a[1], a[2]);
      tmpDir.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const len = tmpDir.length();
      tmpQuat.setFromUnitVectors(UP, tmpDir.normalize());
      bones[i].quaternion.copy(tmpQuat);
      bones[i].scale.setScalar(len * Math.max(buildScale[i + 1], 0.0001));
    }
    const eff = chain.effector;
    handleGroup.position.set(eff[0], eff[1], eff[2]);
    handleGroup.quaternion.copy(camera.quaternion);
    handleGroup.rotation.z = t * 0.4;
    handleGroup.scale.setScalar(Math.max(buildScale[N_JOINTS - 1], 0.0001));

    const mid = p[Math.floor(N_JOINTS / 2)];
    const pos = pvLineGeo.attributes.position;
    pos.setXYZ(0, mid[0], mid[1], mid[2]);
    pos.setXYZ(1, pvPos.x, pvPos.y, pvPos.z);
    pos.needsUpdate = true;
    pvLine.computeLineDistances();

    // camera parallax
    if (finePointer && !reducedMotion) {
      camera.position.x += (CAM_BASE.x + camParallax.x * 0.35 - camera.position.x) * 0.05;
      camera.position.y += (CAM_BASE.y + camParallax.y * 0.22 - camera.position.y) * 0.05;
      camera.lookAt(CAM_LOOK);
      tripodAnchor();
    }

    // grab puck follows the effector on screen
    if (hud.grab) {
      tmpV3.set(eff[0], eff[1], eff[2]).project(camera);
      const r = canvas.getBoundingClientRect();
      const sx = (tmpV3.x * 0.5 + 0.5) * r.width;
      const sy = (-tmpV3.y * 0.5 + 0.5) * r.height;
      hud.grab.style.transform = `translate(${sx - 22}px, ${sy - 22}px)`;
    }
  }

  function updateHUD() {
    if (!hud.tx) return;
    const eff = chain.effector;
    hud.tx.textContent = eff[0].toFixed(3);
    hud.ty.textContent = eff[1].toFixed(3);
    hud.tz.textContent = eff[2].toFixed(3);
    hud.iter.textContent = String(stats.iterations);
    hud.err.textContent = stats.error < 0.0001 ? '<1e-4' : stats.error.toFixed(4);
    hud.ms.textContent = msEMA.toFixed(1);
  }

  // ------------------------------------------------------------ main loop
  let lastT = performance.now();

  function frame(nowMs) {
    if (!running) { rafId = 0; return; }
    const now = nowMs / 1000;
    const dt = Math.min(0.05, (nowMs - lastT) / 1000);
    lastT = nowMs;
    msEMA = msEMA * 0.92 + dt * 1000 * 0.08;
    frameCount++;

    // dragging the window to a different-DPI monitor never fires resize
    if (frameCount % 60 === 0 && (window.devicePixelRatio || 1) !== lastDPR) relayout();

    // pick the desired target — a live grab always wins
    const sinceInput = now - lastInputTime;
    let desired;
    if (grabbed && pointerTarget) {
      desired = pointerTarget;
      idleBlend = 0;
    } else if (calisthenics) {
      desired = clampTarget([calisthenics.pos[0], calisthenics.pos[1], calisthenics.pos[2]]);
      idleBlend = 0;
    } else {
      const wantIdle = sinceInput > 4 || !pointerTarget;
      idleBlend += ((wantIdle ? 1 : 0) - idleBlend) * Math.min(1, dt / 0.4);
      if (wantIdle) idleClock += dt;
      const idle = idleTarget(idleClock);
      desired = pointerTarget ? vLerp(pointerTarget, idle, idleBlend) : idle;
      maybeCalisthenics(now);
    }

    const sprung = spring.update(desired, dt);
    stats = solverName === 'CCD'
      ? chain.solveCCD(sprung, grabbed ? 16 : 8)
      : chain.solveFABRIK(sprung, grabbed ? 16 : 8);

    syncVisuals(now);
    if (frameCount % 5 === 0) updateHUD();
    if (hud.frame) hud.frame.textContent = String(frameCount).padStart(5, '0');

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }

  function requestRender() {
    if (!renderedOnce || !running) {
      syncVisuals(0);
      updateHUD();
      renderer.render(scene, camera);
      renderedOnce = true;
    }
  }

  function setRunning(on) {
    if (reducedMotion) { requestRender(); return; }
    if (frozen) on = false;
    if (on && !running) {
      running = true;
      lastT = performance.now();
      // cancel-then-schedule keeps start/stop idempotent even when a
      // pending callback was frozen by a hidden tab (rAF pauses, not drops)
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);
    } else if (!on && running) {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }
  }

  const io = new IntersectionObserver((entries) => {
    heroVisible = entries[entries.length - 1].isIntersecting;
    setRunning(heroVisible && !document.hidden);
  }, { threshold: 0.02 });
  io.observe(hero);
  document.addEventListener('visibilitychange', () => {
    setRunning(heroVisible && !document.hidden);
  });

  canvas.addEventListener('webglcontextlost', () => {
    setRunning(false);
    frozen = true;
    io.disconnect();
    hero.classList.remove('rig-hero--webgl');
    hero.classList.add('rig-hero--fallback'); // CSS hides canvas, grab, HUD
  });

  // ------------------------------------------------------------ build-in
  if (reducedMotion) {
    // Pose statically toward a pleasant point; render once.
    chain.solveFABRIK(idleTarget(Math.PI * 0.8), 12);
    if (hud.grab) hud.grab.style.display = 'none';
    requestRender();
  } else if (gsap) {
    const buildState = { i: 0 };
    const tl = gsap.timeline({ delay: 0.15 });
    for (let i = 0; i < N_JOINTS; i++) {
      tl.to(buildState, {
        i: i + 1, duration: 0.001,
        onComplete() {
          gsap.to(buildScale, { [i]: 1, duration: 0.5, ease: 'back.out(1.9)' });
        },
      }, i * 0.08);
    }
    tl.add(() => {
      const label = hud.solverBtn && hud.solverBtn.querySelector('span');
      if (label) scrambleLabel(label, `SOLVER: ${solverName}`);
      const status = document.getElementById('hud-status');
      if (status) scrambleLabel(status, 'ONLINE');
      if (status) status.classList.add('is-online');
    }, 0.9);
    setRunning(true);
  } else {
    buildScale.fill(1);
    setRunning(true);
  }
}
