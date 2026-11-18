/**
 * Square Pad Footing UI Controller & Scaled SVG Elevation
 */

import { calculatePadFooting } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'pad-footing';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLE = {
  Gk: 800,
  Qk: 400,
  q_all: 200,
  col_c: 400,
  B: 2.7,
  h: 600,
  cover: 50,
  bar_dia: 16,
  bar_spacing: 150,
  fcu: 30,
  fy: 500
};

let currentInputs = { ...EXAMPLE };
let debounceTimer = null;

export function initPadFootingUI() {
  Embed.init(SLUG);

  const urlParams = Share.deserialize();
  const savedState = Store.get(STORE_KEY);

  if (Object.keys(urlParams).length > 0) {
    currentInputs = { ...currentInputs, ...urlParams };
  } else if (savedState) {
    currentInputs = { ...currentInputs, ...savedState };
  }

  setupEventListeners();
  populateUIFromState();
  recalculate();
}

function setupEventListeners() {
  const inputIds = [
    'Gk', 'Qk', 'q_all', 'col_c', 'B', 'h', 'cover', 'bar_spacing', 'fcu', 'fy'
  ];

  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      currentInputs[id] = Number(el.value);
      triggerRecalc();
    });

    const step = el.getAttribute('step') ? Number(el.getAttribute('step')) : 10;
    const min = el.getAttribute('min') ? Number(el.getAttribute('min')) : 0;
    UIKit.bindStepper(el, step, min, Infinity, () => triggerRecalc());
  });

  // Segmented Bar Picker
  setupSegmentedPicker('bar_dia_group', [12, 16, 20, 25], currentInputs.bar_dia || 16, (dia) => {
    currentInputs.bar_dia = dia;
    triggerRecalc();
  });

  // Buttons
  const btnExample = document.getElementById('btnLoadExample');
  if (btnExample) {
    btnExample.addEventListener('click', () => {
      currentInputs = { ...EXAMPLE };
      populateUIFromState();
      triggerRecalc();
    });
  }

  const btnShare = document.getElementById('btnCopyLink');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const link = Share.getShareableLink(currentInputs);
      navigator.clipboard.writeText(link).then(() => {
        const orig = btnShare.textContent;
        btnShare.textContent = '✓ Copied!';
        setTimeout(() => { btnShare.textContent = orig; }, 2000);
      });
    });
  }

  const btnPrint = document.getElementById('btnPrintPDF');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.target);
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

function setupSegmentedPicker(containerId, options, selectedVal, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const group = UIKit.createSegmentedGroup(containerId, options, selectedVal, onSelect);
  container.appendChild(group);
}

function populateUIFromState() {
  const setValue = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setValue('Gk', currentInputs.Gk);
  setValue('Qk', currentInputs.Qk);
  setValue('q_all', currentInputs.q_all);
  setValue('col_c', currentInputs.col_c);
  setValue('B', currentInputs.B);
  setValue('h', currentInputs.h);
  setValue('cover', currentInputs.cover);
  setValue('bar_spacing', currentInputs.bar_spacing);
  setValue('fcu', currentInputs.fcu);
  setValue('fy', currentInputs.fy);
}

function triggerRecalc() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    recalculate();
    Store.set(STORE_KEY, currentInputs);
  }, 120);
}

function recalculate() {
  const out = calculatePadFooting(currentInputs);
  renderResults(out);
  renderSVGFooting(currentInputs, out);
}

function renderResults(out) {
  const container = document.getElementById('checksContainer');
  const summaryBox = document.getElementById('summaryGrid');
  const stepsContainer = document.getElementById('stepsTableBody');
  const alertBox = document.getElementById('errorAlert');

  if (!out.ok) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerHTML = `<strong>Errors:</strong><br>${out.errors.join('<br>')}`;
    }
    return;
  }
  if (alertBox) alertBox.style.display = 'none';

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-item">
        <div class="label">Service Bearing q</div>
        <div class="value">${out.results.service_pressure.toFixed(1)} <span style="font-size: 13px;">kN/m²</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Design Moment M</div>
        <div class="value">${out.results.M.toFixed(1)} <span style="font-size: 13px;">kNm</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Provided Steel As</div>
        <div class="value">${out.results.As_prov.toFixed(0)} <span style="font-size: 13px;">mm²</span></div>
      </div>
      <div class="summary-item">
        <div class="label">1.5d Punching Shear</div>
        <div class="value">${out.results.v_punch.toFixed(3)} <span style="font-size: 13px;">N/mm²</span></div>
      </div>
    `;
  }

  if (container) {
    container.innerHTML = out.checks.map(c => UIKit.renderStatusCard(c)).join('');
  }

  if (stepsContainer) {
    stepsContainer.innerHTML = out.steps.map((st, i) => `
      <tr>
        <td style="font-weight: 600;">${i + 1}. ${st.label}</td>
        <td class="code-cell">${st.equation}</td>
        <td class="code-cell">${st.substituted}</td>
        <td style="font-weight: 700;">${typeof st.value === 'number' ? st.value.toFixed(2) : st.value} ${st.unit || ''}</td>
        <td class="code-cell" style="color: var(--text-muted);">${st.clause || '—'}</td>
      </tr>
    `).join('');
  }
}

/**
 * Scaled SVG Elevation of Pad Footing & Column
 */
function renderSVGFooting(input, out) {
  const svg = document.getElementById('footingSVG');
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 380;
  const viewH = 320;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const B = Number(input.B) || 2.7; // m
  const h = Number(input.h) || 600; // mm
  const col_c = (Number(input.col_c) || 400) / 1000.0; // m
  const d_mm = (out.results && out.results.d) ? out.results.d : 534;

  const pad = 40;
  const maxW = viewW - 2 * pad;
  const scale = maxW / B; // px per metre

  const drawB = B * scale;
  const drawH = (h / 1000.0) * scale * 1.4; // scale vertical comfortably
  const drawColW = col_c * scale;
  const drawColH = 70; // column stub

  const ox = (viewW - drawB) / 2;
  const oy = 150; // top of footing block

  const NS = 'http://www.w3.org/2000/svg';
  const createEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  };

  // Footing Block
  svg.appendChild(createEl('rect', {
    x: ox, y: oy, width: drawB, height: drawH,
    fill: '#e2e8f0', stroke: '#0f172a', 'stroke-width': '2', rx: '2'
  }));

  // Column Stub (top center)
  const colX = ox + (drawB - drawColW) / 2;
  const colY = oy - drawColH;
  svg.appendChild(createEl('rect', {
    x: colX, y: colY, width: drawColW, height: drawColH,
    fill: '#64748b', stroke: '#0f172a', 'stroke-width': '2'
  }));

  // Column Axial Force Arrow (N)
  const ax = colX + drawColW / 2;
  svg.appendChild(createEl('line', {
    x1: ax, y1: colY - 35, x2: ax, y2: colY - 4,
    stroke: '#dc2626', 'stroke-width': '3'
  }));
  svg.appendChild(createEl('polygon', {
    points: `${ax-5},${colY-12} ${ax+5},${colY-12} ${ax},${colY-2}`,
    fill: '#dc2626'
  }));
  const labelN = createEl('text', {
    x: ax, y: colY - 42,
    'text-anchor': 'middle', 'font-size': '12', 'font-weight': '800', fill: '#dc2626'
  });
  labelN.textContent = `N = ${(out.results.N || 0).toFixed(0)} kN`;
  svg.appendChild(labelN);

  // 1.5d Punching Shear failure angle lines (dashed red)
  const perimSide_m = (out.results && out.results.perim_side) ? (out.results.perim_side / 1000.0) : (col_c + 3 * d_mm / 1000.0);
  const drawPerimW = perimSide_m * scale;
  const punchLeftX = Math.max(ox, ax - drawPerimW / 2);
  const punchRightX = Math.min(ox + drawB, ax + drawPerimW / 2);

  svg.appendChild(createEl('line', {
    x1: colX, y1: oy, x2: punchLeftX, y2: oy + drawH,
    stroke: '#dc2626', 'stroke-width': '1.5', 'stroke-dasharray': '5,3'
  }));
  svg.appendChild(createEl('line', {
    x1: colX + drawColW, y1: oy, x2: punchRightX, y2: oy + drawH,
    stroke: '#dc2626', 'stroke-width': '1.5', 'stroke-dasharray': '5,3'
  }));

  // Bottom Rebar Mat
  const rebarY = oy + drawH - 12;
  svg.appendChild(createEl('line', {
    x1: ox + 15, y1: rebarY, x2: ox + drawB - 15, y2: rebarY,
    stroke: '#16a34a', 'stroke-width': '3'
  }));

  // Ground Reaction Arrows (Upward)
  const numArrows = 6;
  for (let i = 0; i <= numArrows; i++) {
    const rx = ox + (i * drawB) / numArrows;
    const ry = oy + drawH + 25;
    svg.appendChild(createEl('line', {
      x1: rx, y1: ry, x2: rx, y2: oy + drawH + 3,
      stroke: '#2563eb', 'stroke-width': '1.5'
    }));
    svg.appendChild(createEl('polygon', {
      points: `${rx-3},${oy+drawH+8} ${rx+3},${oy+drawH+8} ${rx},${oy+drawH+2}`,
      fill: '#2563eb'
    }));
  }

  // Dimension B
  const dimB = createEl('g', { class: 'svg-dim' });
  dimB.appendChild(createEl('line', {
    x1: ox, y1: oy + drawH + 35, x2: ox + drawB, y2: oy + drawH + 35,
    stroke: '#475569', 'stroke-width': '1.2'
  }));
  const textB = createEl('text', {
    x: ox + drawB / 2, y: oy + drawH + 50,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#0f172a'
  });
  textB.textContent = `B = ${B} m (Square Footing)`;
  dimB.appendChild(textB);
  svg.appendChild(dimB);

  // Dimension h
  const dimH = createEl('g', { class: 'svg-dim' });
  dimH.appendChild(createEl('line', {
    x1: ox + drawB + 15, y1: oy, x2: ox + drawB + 15, y2: oy + drawH,
    stroke: '#475569', 'stroke-width': '1.2'
  }));
  const textH = createEl('text', {
    x: ox + drawB + 28, y: oy + drawH / 2,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#0f172a',
    transform: `rotate(90, ${ox + drawB + 28}, ${oy + drawH / 2})`
  });
  textH.textContent = `h = ${h} mm`;
  dimH.appendChild(textH);
  svg.appendChild(dimH);
}
