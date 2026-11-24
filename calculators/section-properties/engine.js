/**
 * C12 — Section Properties Calculator
 * Area, centroid, second moment of area (I), elastic section modulus (S), plastic section modulus (Z)
 * and radius of gyration (r) about both centroidal axes.
 *
 * Every shape except circles is built from axis-aligned rectangles, so one exact method
 * (parallel axis theorem, and an equal-area plastic neutral axis) serves all of them.
 * Pure functions: no DOM. Units are whatever length unit the inputs use (mm or in).
 */

export const SHAPES = ['rectangle', 'box', 'i-section', 't-section', 'channel', 'circle', 'pipe', 'built-up'];

/* ---------- rectangle sets ---------- */
// rect: { b, h, x, y } with (x, y) = bottom-left corner; x to the right, y up.
function rectsFor(shape, d) {
  switch (shape) {
    case 'rectangle':
      return [{ b: d.b, h: d.h, x: 0, y: 0 }];
    case 'box': // outer b x h, wall thicknesses t (sides) and tf (top/bottom)
      return [
        { b: d.b, h: d.tf, x: 0, y: 0 },
        { b: d.b, h: d.tf, x: 0, y: d.h - d.tf },
        { b: d.t, h: d.h - 2 * d.tf, x: 0, y: d.tf },
        { b: d.t, h: d.h - 2 * d.tf, x: d.b - d.t, y: d.tf }
      ];
    case 'i-section': // symmetric I: depth h, flange width bf, flange thickness tf, web thickness tw
      return [
        { b: d.bf, h: d.tf, x: 0, y: 0 },
        { b: d.bf, h: d.tf, x: 0, y: d.h - d.tf },
        { b: d.tw, h: d.h - 2 * d.tf, x: (d.bf - d.tw) / 2, y: d.tf }
      ];
    case 't-section': // flange on top: depth h, flange bf x tf, web tw
      return [
        { b: d.bf, h: d.tf, x: 0, y: d.h - d.tf },
        { b: d.tw, h: d.h - d.tf, x: (d.bf - d.tw) / 2, y: 0 }
      ];
    case 'channel': // web on the left: depth h, flange width bf, flange thickness tf, web thickness tw
      return [
        { b: d.bf, h: d.tf, x: 0, y: 0 },
        { b: d.bf, h: d.tf, x: 0, y: d.h - d.tf },
        { b: d.tw, h: d.h - 2 * d.tf, x: 0, y: d.tf }
      ];
    case 'built-up':
      return (d.rects || []).map(r => ({ b: Number(r.b), h: Number(r.h), x: Number(r.x) || 0, y: Number(r.y) || 0 }));
    default:
      return null;
  }
}

/* Area below a horizontal line y = c (or left of x = c for the other axis) */
function areaBelow(rects, c, axis) {
  let a = 0;
  for (const r of rects) {
    const lo = axis === 'x' ? r.y : r.x, len = axis === 'x' ? r.h : r.b, w = axis === 'x' ? r.b : r.h;
    const part = Math.min(Math.max(c - lo, 0), len);
    a += part * w;
  }
  return a;
}

/* Plastic modulus about the equal-area axis (axis 'x' = horizontal axis, bending about x) */
function plasticModulus(rects, A, axis) {
  let lo = Infinity, hi = -Infinity;
  for (const r of rects) {
    const s = axis === 'x' ? r.y : r.x, e = s + (axis === 'x' ? r.h : r.b);
    lo = Math.min(lo, s); hi = Math.max(hi, e);
  }
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (areaBelow(rects, mid, axis) < A / 2) lo = mid; else hi = mid;
  }
  const pna = (lo + hi) / 2;
  let Z = 0;
  for (const r of rects) {
    const s = axis === 'x' ? r.y : r.x, len = axis === 'x' ? r.h : r.b, w = axis === 'x' ? r.b : r.h;
    const below = Math.min(Math.max(pna - s, 0), len), above = len - below;
    if (below > 0) Z += below * w * (pna - (s + below / 2));
    if (above > 0) Z += above * w * ((s + below + above / 2) - pna); // part above spans s+below .. s+len
  }
  return { Z, pna };
}

function fromRects(rects) {
  let A = 0, Qx = 0, Qy = 0;
  for (const r of rects) { const a = r.b * r.h; A += a; Qx += a * (r.y + r.h / 2); Qy += a * (r.x + r.b / 2); }
  const yb = Qx / A, xb = Qy / A;
  let Ix = 0, Iy = 0, minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
  for (const r of rects) {
    const a = r.b * r.h, cy = r.y + r.h / 2, cx = r.x + r.b / 2;
    Ix += r.b * r.h ** 3 / 12 + a * (cy - yb) ** 2;
    Iy += r.h * r.b ** 3 / 12 + a * (cx - xb) ** 2;
    minY = Math.min(minY, r.y); maxY = Math.max(maxY, r.y + r.h);
    minX = Math.min(minX, r.x); maxX = Math.max(maxX, r.x + r.b);
  }
  const zx = plasticModulus(rects, A, 'x'), zy = plasticModulus(rects, A, 'y');
  return {
    A, xbar: xb - minX, ybar: yb - minY, depth: maxY - minY, width: maxX - minX,
    Ix, Iy, Zx: zx.Z, Zy: zy.Z, pnaX: zx.pna - minY, pnaY: zy.pna - minX,
    yTop: maxY - yb, yBot: yb - minY, xRight: maxX - xb, xLeft: xb - minX
  };
}

function fromCircle(D, d) {
  const A = Math.PI * (D * D - d * d) / 4;
  const I = Math.PI * (D ** 4 - d ** 4) / 64;
  const Z = (D ** 3 - d ** 3) / 6;
  return { A, xbar: D / 2, ybar: D / 2, depth: D, width: D, Ix: I, Iy: I, Zx: Z, Zy: Z, pnaX: D / 2, pnaY: D / 2,
    yTop: D / 2, yBot: D / 2, xRight: D / 2, xLeft: D / 2 };
}

/* ---------- validation ---------- */
const POS = v => typeof v === 'number' && Number.isFinite(v) && v > 0;

function validate(shape, d) {
  const e = [];
  const need = {
    rectangle: ['b', 'h'], box: ['b', 'h', 't', 'tf'], 'i-section': ['h', 'bf', 'tf', 'tw'],
    't-section': ['h', 'bf', 'tf', 'tw'], channel: ['h', 'bf', 'tf', 'tw'], circle: ['D'], pipe: ['D', 't']
  }[shape] || [];
  for (const k of need) if (!POS(d[k])) e.push(`${k} must be a positive number (got ${d[k]}).`);
  if (e.length) return e;
  if (shape === 'box' && (2 * d.t >= d.b || 2 * d.tf >= d.h)) e.push('Wall thicknesses must be less than half the width and depth.');
  if (['i-section', 'channel'].includes(shape) && 2 * d.tf >= d.h) e.push('2 x flange thickness must be less than the depth.');
  if (shape === 't-section' && d.tf >= d.h) e.push('Flange thickness must be less than the depth.');
  if (['i-section', 't-section', 'channel'].includes(shape) && d.tw > d.bf) e.push('Web thickness cannot exceed the flange width.');
  if (shape === 'pipe' && 2 * d.t >= d.D) e.push('Wall thickness must be less than half the diameter.');
  if (shape === 'built-up') {
    const rs = d.rects || [];
    if (!rs.length) e.push('Add at least one rectangle.');
    if (rs.length > 12) e.push('Use at most 12 rectangles.');
    rs.forEach((r, i) => {
      if (!POS(Number(r.b)) || !POS(Number(r.h))) e.push(`Rectangle ${i + 1}: width and height must be positive.`);
      if (!Number.isFinite(Number(r.x) || 0) || !Number.isFinite(Number(r.y) || 0)) e.push(`Rectangle ${i + 1}: x and y must be numbers.`);
    });
  }
  return e;
}

/* ---------- main ---------- */
export function calculateSection(input) {
  const shape = input && input.shape;
  const units = (input && input.units) === 'in' ? 'in' : 'mm';
  const d = (input && input.dims) || {};
  if (!SHAPES.includes(shape)) return { ok: false, errors: [`Unknown shape "${shape}".`], warnings: [], results: {}, steps: [], rects: [] };
  const errors = validate(shape, d);
  if (errors.length) return { ok: false, errors, warnings: [], results: {}, steps: [], rects: [] };

  const warnings = [];
  let p, rects = [];
  if (shape === 'circle') p = fromCircle(d.D, 0);
  else if (shape === 'pipe') p = fromCircle(d.D, d.D - 2 * d.t);
  else { rects = rectsFor(shape, d); p = fromRects(rects); }

  if (shape === 'built-up') warnings.push('Built-up sections assume the rectangles do not overlap and act together (fully connected). Overlapping areas are counted twice.');
  if (shape === 'channel') warnings.push('Channel: properties are about the centroidal axes. The shear centre lies outside the web, so check torsion where loads do not pass through it.');

  const r = {
    A: p.A, xbar: p.xbar, ybar: p.ybar, depth: p.depth, width: p.width,
    Ix: p.Ix, Iy: p.Iy,
    Sx_top: p.Ix / p.yTop, Sx_bot: p.Ix / p.yBot, Sx: p.Ix / Math.max(p.yTop, p.yBot),
    Sy: p.Iy / Math.max(p.xRight, p.xLeft),
    Zx: p.Zx, Zy: p.Zy, pnaX: p.pnaX, pnaY: p.pnaY,
    rx: Math.sqrt(p.Ix / p.A), ry: Math.sqrt(p.Iy / p.A)
  };
  r.shapeFactorX = r.Zx / r.Sx;

  const L = units, L2 = units + '²', L3 = units + '³', L4 = units + '⁴';
  const steps = [
    { label: 'Area', equation: shape === 'circle' || shape === 'pipe' ? 'A = π(D² − d²)/4' : 'A = Σ bᵢhᵢ', value: r.A, unit: L2 },
    { label: 'Centroid from bottom', equation: 'ȳ = Σ Aᵢyᵢ / A', value: r.ybar, unit: L },
    { label: 'Centroid from left', equation: 'x̄ = Σ Aᵢxᵢ / A', value: r.xbar, unit: L },
    { label: 'Second moment of area, x-x', equation: shape === 'circle' || shape === 'pipe' ? 'I = π(D⁴ − d⁴)/64' : 'Iₓ = Σ (bᵢhᵢ³/12 + Aᵢ(yᵢ − ȳ)²)', value: r.Ix, unit: L4 },
    { label: 'Second moment of area, y-y', equation: shape === 'circle' || shape === 'pipe' ? 'I = π(D⁴ − d⁴)/64' : 'I_y = Σ (hᵢbᵢ³/12 + Aᵢ(xᵢ − x̄)²)', value: r.Iy, unit: L4 },
    { label: 'Elastic modulus, x-x (minimum)', equation: 'Sₓ = Iₓ / y_max', value: r.Sx, unit: L3 },
    { label: 'Plastic modulus, x-x', equation: shape === 'circle' || shape === 'pipe' ? 'Z = (D³ − d³)/6' : 'Zₓ = Σ Aᵢ |yᵢ − y_pna| (equal-area axis)', value: r.Zx, unit: L3 },
    { label: 'Radius of gyration, x-x', equation: 'rₓ = √(Iₓ / A)', value: r.rx, unit: L },
    { label: 'Radius of gyration, y-y', equation: 'r_y = √(I_y / A)', value: r.ry, unit: L }
  ];
  return { ok: true, errors: [], warnings, units, shape, results: r, steps, rects };
}
