/* solver.js — real IK solvers for the hero rig. No dependencies.
 *
 * Positions are plain [x, y, z] arrays. The chain root is fixed; bone
 * lengths are preserved exactly by both solvers. Nothing here is faked:
 * the HUD reads iterations/residual straight from solve() return values.
 */

const EPS = 1e-6;

export function vSub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
export function vAdd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
export function vScale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
export function vLen(a) { return Math.hypot(a[0], a[1], a[2]); }
export function vDist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
export function vNorm(a) {
  const l = vLen(a);
  return l < EPS ? [0, 1, 0] : [a[0] / l, a[1] / l, a[2] / l];
}
export function vDot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
export function vCross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
export function vLerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Rodrigues rotation of point p around axis (unit) through origin by angle. */
function rotateAround(p, axis, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const cross = vCross(axis, p);
  const dot = vDot(axis, p) * (1 - c);
  return [
    p[0] * c + cross[0] * s + axis[0] * dot,
    p[1] * c + cross[1] * s + axis[1] * dot,
    p[2] * c + cross[2] * s + axis[2] * dot,
  ];
}

export class IKChain {
  /** @param {number[][]} bindPositions world-space joint positions, root first */
  constructor(bindPositions) {
    this.bind = bindPositions.map((p) => p.slice());
    this.positions = bindPositions.map((p) => p.slice());
    this.lengths = [];
    for (let i = 0; i < bindPositions.length - 1; i++) {
      this.lengths.push(vDist(bindPositions[i], bindPositions[i + 1]));
    }
    this.totalLength = this.lengths.reduce((a, b) => a + b, 0);
    this.root = this.bind[0].slice();
  }

  get effector() { return this.positions[this.positions.length - 1]; }

  /** Pull an out-of-range target inside reach with a soft tail, so the
   *  chain straightens with resistance instead of snapping taut. */
  softClampTarget(target) {
    const toTarget = vSub(target, this.root);
    const d = vLen(toTarget);
    const reach = this.totalLength * 0.995;
    if (d <= reach) return target;
    const over = d - reach;
    // eased asymptotes at reach + 0.2; cap at totalLength so FABRIK converges
    const eased = reach + over * 0.12 / (1 + over * 0.6);
    return vAdd(this.root, vScale(vNorm(toTarget), Math.min(eased, this.totalLength)));
  }

  resetToBind() {
    for (let i = 0; i < this.positions.length; i++) {
      this.positions[i] = this.bind[i].slice();
    }
  }

  /** FABRIK: forward-and-backward reaching. Returns real solve stats. */
  solveFABRIK(target, maxIterations = 8, tolerance = 0.002) {
    const p = this.positions;
    const n = p.length;
    const t = this.softClampTarget(target);
    let iter = 0;
    let err = vDist(p[n - 1], t);
    for (; iter < maxIterations && err > tolerance; iter++) {
      // Forward: drag tip to target, walk back preserving lengths.
      p[n - 1] = t.slice();
      for (let i = n - 2; i >= 0; i--) {
        const dir = vNorm(vSub(p[i], p[i + 1]));
        p[i] = vAdd(p[i + 1], vScale(dir, this.lengths[i]));
      }
      // Backward: re-pin root, walk forward preserving lengths.
      p[0] = this.root.slice();
      for (let i = 1; i < n; i++) {
        const dir = vNorm(vSub(p[i], p[i - 1]));
        p[i] = vAdd(p[i - 1], vScale(dir, this.lengths[i - 1]));
      }
      err = vDist(p[n - 1], t);
    }
    return { iterations: iter, error: err };
  }

  /** CCD: cyclic coordinate descent. Whippier, root-lagging character —
   *  visibly different personality from FABRIK. */
  solveCCD(target, maxIterations = 8, tolerance = 0.002) {
    const p = this.positions;
    const n = p.length;
    const t = this.softClampTarget(target);
    let iter = 0;
    let err = vDist(p[n - 1], t);
    for (; iter < maxIterations && err > tolerance; iter++) {
      for (let j = n - 2; j >= 0; j--) {
        const toEff = vSub(p[n - 1], p[j]);
        const toTgt = vSub(t, p[j]);
        const le = vLen(toEff), lt = vLen(toTgt);
        if (le < EPS || lt < EPS) continue;
        const cosA = Math.min(1, Math.max(-1, vDot(toEff, toTgt) / (le * lt)));
        let angle = Math.acos(cosA);
        if (angle < 1e-4) continue;
        // Damping per joint keeps CCD from snapping the tip around.
        angle = Math.min(angle, 0.35);
        const axis = vNorm(vCross(toEff, toTgt));
        for (let k = j + 1; k < n; k++) {
          p[k] = vAdd(p[j], rotateAround(vSub(p[k], p[j]), axis, angle));
        }
      }
      err = vDist(p[n - 1], t);
    }
    return { iterations: iter, error: err };
  }
}

/** Underdamped 3D spring — gives the chase target mass and life.
 *  zeta < 1 overshoots slightly; omega is responsiveness (rad/s). */
export class SpringVec3 {
  constructor(value, omega = 12, zeta = 0.82) {
    this.x = value.slice();
    this.v = [0, 0, 0];
    this.omega = omega;
    this.zeta = zeta;
  }
  set(value) {
    this.x = value.slice();
    this.v = [0, 0, 0];
  }
  update(target, dt) {
    dt = Math.min(dt, 1 / 30); // clamp spiral-of-death frames
    const k = this.omega * this.omega;
    const c = 2 * this.zeta * this.omega;
    for (let i = 0; i < 3; i++) {
      const a = k * (target[i] - this.x[i]) - c * this.v[i];
      this.v[i] += a * dt;
      this.x[i] += this.v[i] * dt;
    }
    return this.x;
  }
}
