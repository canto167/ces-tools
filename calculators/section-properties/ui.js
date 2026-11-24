/**
 * C12 — Section Properties Calculator UI
 */
import { calculateSection } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'section-properties';
const STORE_KEY = `ces_tool_${SLUG}`;

const FIELDS = {
  rectangle: [['b', 'Width, b'], ['h', 'Depth, h']],
  'i-section': [['h', 'Depth, h'], ['bf', 'Flange width, bf'], ['tf', 'Flange thickness, tf'], ['tw', 'Web thickness, tw']],
  't-section': [['h', 'Depth, h'], ['bf', 'Flange width, bf'], ['tf', 'Flange thickness, tf'], ['tw', 'Web thickness, tw']],
  channel: [['h', 'Depth, h'], ['bf', 'Flange width, bf'], ['tf', 'Flange thickness, tf'], ['tw', 'Web thickness, tw']],
  box: [['b', 'Width, b'], ['h', 'Depth, h'], ['t', 'Side wall, t'], ['tf', 'Top/bottom wall, tf']],
  circle: [['D', 'Diameter, D']],
  pipe: [['D', 'Outside diameter, D'], ['t', 'Wall thickness, t']]
};

const DEFAULTS = {
  mm: {
    rectangle: { b: 300, h: 500 }, 'i-section': { h: 400, bf: 200, tf: 15, tw: 10 },
    't-section': { h: 300, bf: 200, tf: 20, tw: 12 }, channel: { h: 200, bf: 75, tf: 10, tw: 6 },
    box: { b: 200, h: 300, t: 10, tf: 10 }, circle: { D: 100 }, pipe: { D: 168.3, t: 7.1 },
    'built-up': { rects: [{ b: 200, h: 20, x: 0, y: 280 }, { b: 12, h: 280, x: 94, y: 0 }] }
  },
  in: {
    rectangle: { b: 12, h: 20 }, 'i-section': { h: 12, bf: 6, tf: 0.5, tw: 0.25 },
    't-section': { h: 12, bf: 8, tf: 0.75, tw: 0.5 }, channel: { h: 8, bf: 2.5, tf: 0.4, tw: 0.25 },
    box: { b: 6, h: 8, t: 0.375, tf: 0.375 }, circle: { D: 4 }, pipe: { D: 6.625, t: 0.28 },
    'built-up': { rects: [{ b: 8, h: 0.75, x: 0, y: 11.25 }, { b: 0.5, h: 11.25, x: 3.75, y: 0 }] }
  }
};

let state = { units: 'mm', shape: 'i-section', dims: { ...DEFAULTS.mm['i-section'] } };
let timer = null;

export function initSectionPropertiesUI() {
  Embed.init(SLUG);
  const p = Share.deserialize();
  const saved = Store.get(STORE_KEY);
  if (p && p.shape) {
    state.shape = String(p.shape);
    state.units = p.units === 'in' ? 'in' : 'mm';
    if (p.rects) { try { state.dims = { rects: JSON.parse(decodeURIComponent(p.rects)) }; } catch (e) { state.dims = { ...DEFAULTS[state.units][state.shape] }; } }
    else {
      state.dims = { ...(DEFAULTS[state.units][state.shape] || {}) };
      (FIELDS[state.shape] || []).forEach(([k]) => { if (p[k] !== undefined) state.dims[k] = Number(p[k]); });
    }
  } else if (saved && saved.shape) {
    state = saved;
  }
  if (!DEFAULTS.mm[state.shape]) state = { units: 'mm', shape: 'i-section', dims: { ...DEFAULTS.mm['i-section'] } };

  const ug = document.getElementById('unitsGroup');
  ug.appendChild(UIKit.createSegmentedGroup('units', [{ value: 'mm', label: 'Metric (mm)' }, { value: 'in', label: 'US (inches)' }], state.units, (u) => {
    state.units = u; state.dims = JSON.parse(JSON.stringify(DEFAULTS[u][state.shape])); renderDims(); recalc();
  }));
  const sel = document.getElementById('shape');
  sel.value = state.shape;
  sel.addEventListener('change', () => {
    state.shape = sel.value; state.dims = JSON.parse(JSON.stringify(DEFAULTS[state.units][state.shape])); renderDims(); recalc();
  });
  document.getElementById('btnLoadExample').addEventListener('click', () => {
    state = { units: 'mm', shape: 'i-section', dims: { ...DEFAULTS.mm['i-section'] } };
    sel.value = state.shape; ug.innerHTML = '';
    ug.appendChild(UIKit.createSegmentedGroup('units', [{ value: 'mm', label: 'Metric (mm)' }, { value: 'in', label: 'US (inches)' }], 'mm', (u) => {
      state.units = u; state.dims = JSON.parse(JSON.stringify(DEFAULTS[u][state.shape])); renderDims(); recalc();
    }));
    renderDims(); recalc();
  });
  document.getElementById('btnCopyLink').addEventListener('click', () => {
    const q = { shape: state.shape, units: state.units };
    if (state.shape === 'built-up') q.rects = encodeURIComponent(JSON.stringify(state.dims.rects));
    else Object.assign(q, state.dims);
    const link = window.location.origin + window.location.pathname + '?' + Share.serialize(q);
    const btn = document.getElementById('btnCopyLink');
    (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => {
      const o = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = o; }, 2000);
    }).catch(() => window.prompt('Copy this link:', link));
  });
  document.getElementById('btnPrintPDF').addEventListener('click', () => window.print());
  renderDims();
  recalc();
}

function renderDims() {
  const box = document.getElementById('dimsBox');
  document.getElementById('dimUnit').textContent = `(${state.units})`;
  const step = state.units === 'in' ? 0.125 : 5;
  if (state.shape === 'built-up') {
    const rows = state.dims.rects.map((r, i) => `
      <div class="sp-rect-row" data-i="${i}">
        ${['b', 'h', 'x', 'y'].map(k => `<div><label>${k === 'b' ? 'width b' : k === 'h' ? 'height h' : k + ' (bottom-left)'}</label>
          <input type="number" class="form-input sp-r" data-k="${k}" value="${r[k]}" step="${step}"></div>`).join('')}
        <button type="button" class="sp-del" data-del="${i}" aria-label="Remove rectangle ${i + 1}">×</button>
      </div>`).join('');
    box.innerHTML = rows + `<button type="button" id="spAdd" class="btn" style="margin-top:6px;">+ Add rectangle</button>`;
    box.querySelectorAll('.sp-r').forEach(inp => inp.addEventListener('input', () => {
      const i = Number(inp.closest('.sp-rect-row').dataset.i); state.dims.rects[i][inp.dataset.k] = Number(inp.value); schedule();
    }));
    box.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      state.dims.rects.splice(Number(b.dataset.del), 1); renderDims(); recalc();
    }));
    document.getElementById('spAdd').addEventListener('click', () => {
      if (state.dims.rects.length >= 12) return;
      const last = state.dims.rects[state.dims.rects.length - 1] || { b: 100, h: 10, x: 0, y: 0 };
      state.dims.rects.push({ b: last.b, h: last.h, x: last.x, y: Number(last.y) + Number(last.h) }); renderDims(); recalc();
    });
    return;
  }
  box.innerHTML = `<div class="sp-dims">${FIELDS[state.shape].map(([k, label]) => `
    <div class="form-group"><label class="form-label" for="d_${k}">${label}</label>
      <div class="input-with-stepper"><input type="number" id="d_${k}" class="form-input" value="${state.dims[k]}" min="0" step="${step}"></div></div>`).join('')}</div>`;
  FIELDS[state.shape].forEach(([k]) => {
    const el = document.getElementById(`d_${k}`);
    UIKit.bindStepper(el, step, 0, Infinity, () => { state.dims[k] = Number(el.value); schedule(); });
    el.addEventListener('input', () => { state.dims[k] = Number(el.value); schedule(); });
  });
}

function schedule() { clearTimeout(timer); timer = setTimeout(recalc, 150); }

function fmt(v, unit) {
  if (!Number.isFinite(v)) return '—';
  if (state.units === 'mm') {
    if (unit === 4) return `${(v / 1e6).toLocaleString('en-GB', { maximumFractionDigits: 3 })} ×10⁶ mm⁴ <span style="color:var(--text-muted)">(${(v / 1e4).toLocaleString('en-GB', { maximumFractionDigits: 1 })} cm⁴)</span>`;
    if (unit === 3) return `${(v / 1e3).toLocaleString('en-GB', { maximumFractionDigits: 2 })} ×10³ mm³ <span style="color:var(--text-muted)">(${(v / 1e3).toLocaleString('en-GB', { maximumFractionDigits: 1 })} cm³)</span>`;
    if (unit === 2) return `${v.toLocaleString('en-GB', { maximumFractionDigits: 1 })} mm² <span style="color:var(--text-muted)">(${(v / 100).toLocaleString('en-GB', { maximumFractionDigits: 2 })} cm²)</span>`;
    return `${v.toLocaleString('en-GB', { maximumFractionDigits: 1 })} mm`;
  }
  const s = { 4: ' in⁴', 3: ' in³', 2: ' in²', 1: ' in' }[unit];
  return `${v.toLocaleString('en-US', { maximumFractionDigits: unit >= 3 ? 2 : 3 })}${s}`;
}

function recalc() {
  const out = calculateSection({ shape: state.shape, units: state.units, dims: state.dims });
  const msg = document.getElementById('msgBox');
  msg.innerHTML = (out.errors || []).map(e => `<div class="sp-err">${e}</div>`).join('') + (out.warnings || []).map(w => `<div class="sp-warn">${w}</div>`).join('');
  const shapeName = document.getElementById('shape').selectedOptions[0].textContent;
  document.getElementById('printShape').textContent = shapeName;
  Store.set(STORE_KEY, state);
  const body = document.getElementById('resultsBody');
  const steps = document.getElementById('stepsTableBody');
  if (!out.ok) { body.innerHTML = ''; steps.innerHTML = ''; document.getElementById('svgBox').innerHTML = ''; return; }
  const r = out.results;
  const rows = [
    ['Area, A', fmt(r.A, 2), ''],
    ['Centroid', `ȳ = ${fmt(r.ybar, 1)} from bottom`, `x̄ = ${fmt(r.xbar, 1)} from left`],
    ['Moment of inertia, I', fmt(r.Ix, 4), fmt(r.Iy, 4)],
    ['Elastic modulus, S (minimum)', fmt(r.Sx, 3), fmt(r.Sy, 3)],
    ['S top / S bottom', `${fmt(r.Sx_top, 3)} / ${fmt(r.Sx_bot, 3)}`, ''],
    ['Plastic modulus, Z', fmt(r.Zx, 3), fmt(r.Zy, 3)],
    ['Radius of gyration, r', fmt(r.rx, 1), fmt(r.ry, 1)],
    ['Shape factor Z/S', r.shapeFactorX.toFixed(3), (r.Zy / r.Sy).toFixed(3)]
  ];
  body.innerHTML = rows.map(([a, b, c]) => `<tr><td>${a}</td><td class="num">${b}</td><td class="num">${c}</td></tr>`).join('');
  const unitPow = { '²': 2, '³': 3, '⁴': 4 };
  steps.innerHTML = out.steps.map((st, i) => {
    const p = unitPow[st.unit.slice(-1)] || 1;
    return `<tr><td style="font-weight:600;">${i + 1}. ${st.label}</td><td class="code-cell">${st.equation}</td><td class="code-cell">${fmt(st.value, p)}</td></tr>`;
  }).join('');
  drawSVG(out);
}

function drawSVG(out) {
  const r = out.results, W = 320, H = 260, pad = 24;
  const sc = Math.min((W - 2 * pad) / r.width, (H - 2 * pad) / r.depth);
  const ox = (W - r.width * sc) / 2, oy = H - (H - r.depth * sc) / 2;
  const X = x => ox + x * sc, Y = y => oy - y * sc;
  let shapes = '';
  if (out.shape === 'circle' || out.shape === 'pipe') {
    const R = r.depth / 2, cx = X(R), cy = Y(R);
    shapes = `<circle cx="${cx}" cy="${cy}" r="${R * sc}" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="1.5"/>`;
    if (out.shape === 'pipe') shapes += `<circle cx="${cx}" cy="${cy}" r="${(R - state.dims.t) * sc}" fill="var(--bg-card, #fff)" stroke="#1e3a8a" stroke-width="1.5"/>`;
  } else {
    const minX = Math.min(...out.rects.map(q => q.x)), minY = Math.min(...out.rects.map(q => q.y));
    shapes = out.rects.map(q => `<rect x="${X(q.x - minX)}" y="${Y(q.y - minY + q.h)}" width="${q.b * sc}" height="${q.h * sc}" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="1.2"/>`).join('');
  }
  const axes = `<line x1="${pad / 2}" y1="${Y(r.ybar)}" x2="${W - pad / 2}" y2="${Y(r.ybar)}" stroke="#2563eb" stroke-dasharray="6 4" stroke-width="1.4"/>
    <line x1="${X(r.xbar)}" y1="${pad / 2}" x2="${X(r.xbar)}" y2="${H - pad / 2}" stroke="#2563eb" stroke-dasharray="6 4" stroke-width="1.4"/>
    <line x1="${pad / 2}" y1="${Y(r.pnaX)}" x2="${W - pad / 2}" y2="${Y(r.pnaX)}" stroke="#ea580c" stroke-dasharray="2 3" stroke-width="1.6"/>
    <circle cx="${X(r.xbar)}" cy="${Y(r.ybar)}" r="3.5" fill="#2563eb"/>
    <text x="${W - pad / 2}" y="${Y(r.ybar) - 4}" font-size="11" text-anchor="end" fill="#2563eb">x</text>
    <text x="${X(r.xbar) + 4}" y="${pad / 2 + 10}" font-size="11" fill="#2563eb">y</text>`;
  document.getElementById('svgBox').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cross-section drawn to scale with centroidal axes">${shapes}${axes}</svg>`;
}
