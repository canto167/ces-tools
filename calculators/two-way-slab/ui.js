/**
 * Two-Way Slab UI Controller & Scaled SVG Plan View
 */

import { calculateTwoWaySlab } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'two-way-slab';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLE = {
  lx: 4.0,
  ly: 5.0,
  h: 175,
  cover: 25,
  bar_dia: 10,
  sx: 200,
  sy: 300,
  fcu: 30,
  fy: 500,
  finishes: 1.0,
  qk: 3.0
};

let currentInputs = { ...EXAMPLE };
let debounceTimer = null;

export function initTwoWaySlabUI() {
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
  const inputIds = ['lx', 'ly', 'h', 'cover', 'finishes', 'qk', 'fcu', 'fy', 'sx', 'sy'];

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

  // Segmented Bar Pickers
  setupSegmentedPicker('bar_dia_group', [8, 10, 12, 16, 20], currentInputs.bar_dia || 10, (dia) => {
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

  setValue('lx', currentInputs.lx);
  setValue('ly', currentInputs.ly);
  setValue('h', currentInputs.h);
  setValue('cover', currentInputs.cover);
  setValue('finishes', currentInputs.finishes);
  setValue('qk', currentInputs.qk);
  setValue('fcu', currentInputs.fcu);
  setValue('fy', currentInputs.fy);
  setValue('sx', currentInputs.sx);
  setValue('sy', currentInputs.sy);
}

function triggerRecalc() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    recalculate();
    Store.set(STORE_KEY, currentInputs);
  }, 120);
}

function recalculate() {
  const out = calculateTwoWaySlab(currentInputs);
  renderResults(out);
  renderSVGTwoWay(currentInputs, out);
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
  if (alertBox) {
    if (out.warnings.length > 0) {
      alertBox.style.display = 'block';
      alertBox.style.background = 'var(--color-amber-light)';
      alertBox.style.borderColor = 'var(--color-amber)';
      alertBox.style.color = 'var(--color-amber)';
      alertBox.innerHTML = `<strong>Notice:</strong><br>${out.warnings.join('<br>')}`;
    } else {
      alertBox.style.display = 'none';
    }
  }

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-item">
        <div class="label">Short Span Moment msx</div>
        <div class="value">${out.results.msx.toFixed(2)} <span style="font-size: 13px;">kNm/m</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Long Span Moment msy</div>
        <div class="value">${out.results.msy.toFixed(2)} <span style="font-size: 13px;">kNm/m</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Short Steel Asx (Prov)</div>
        <div class="value">${out.results.Apx.toFixed(1)} <span style="font-size: 13px;">mm²/m</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Long Steel Asy (Prov)</div>
        <div class="value">${out.results.Apy.toFixed(1)} <span style="font-size: 13px;">mm²/m</span></div>
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
 * Draw Scaled SVG Plan View of Two-Way Slab Panel
 */
function renderSVGTwoWay(input, out) {
  const svg = document.getElementById('twoWaySlabSVG');
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 380;
  const viewH = 300;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const lx = Number(input.lx) || 4.0;
  const ly = Number(input.ly) || 5.0;

  const pad = 50;
  const maxW = viewW - 2 * pad;
  const maxH = viewH - 2 * pad;
  const scale = Math.min(maxW / lx, maxH / ly);

  const drawW = lx * scale;
  const drawH = ly * scale;
  const ox = (viewW - drawW) / 2;
  const oy = (viewH - drawH) / 2;

  const NS = 'http://www.w3.org/2000/svg';
  const createEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  };

  // Slab Panel Fill & Border
  svg.appendChild(createEl('rect', {
    x: ox, y: oy, width: drawW, height: drawH,
    fill: '#f1f5f9', stroke: '#0f172a', 'stroke-width': '2', rx: '2'
  }));

  // Simple Support Symbols (Hatched or dashed edges)
  svg.appendChild(createEl('rect', {
    x: ox - 4, y: oy - 4, width: drawW + 8, height: drawH + 8,
    fill: 'none', stroke: '#94a3b8', 'stroke-width': '1', 'stroke-dasharray': '4,3'
  }));

  // Short Span Direction Arrows & Rebar Indicators
  const numGridLines = 4;
  for (let i = 1; i <= numGridLines; i++) {
    const gy = oy + (i * drawH) / (numGridLines + 1);
    svg.appendChild(createEl('line', {
      x1: ox + 15, y1: gy, x2: ox + drawW - 15, y2: gy,
      stroke: '#dc2626', 'stroke-width': '1.5', 'stroke-dasharray': '5,3'
    }));
  }

  // Long Span Direction Arrows & Rebar Indicators
  for (let i = 1; i <= numGridLines; i++) {
    const gx = ox + (i * drawW) / (numGridLines + 1);
    svg.appendChild(createEl('line', {
      x1: gx, y1: oy + 15, x2: gx, y2: oy + drawH - 15,
      stroke: '#16a34a', 'stroke-width': '1.5', 'stroke-dasharray': '5,3'
    }));
  }

  // Central Label: Panel Dimensions & Ratio
  const labelRatio = createEl('text', {
    x: ox + drawW / 2, y: oy + drawH / 2 - 8,
    'text-anchor': 'middle', 'font-size': '12', 'font-weight': '800', fill: '#0f172a'
  });
  labelRatio.textContent = `lx = ${lx}m × ly = ${ly}m`;
  svg.appendChild(labelRatio);

  const subRatio = createEl('text', {
    x: ox + drawW / 2, y: oy + drawH / 2 + 10,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '600', fill: '#64748b'
  });
  subRatio.textContent = `ly / lx = ${(ly / lx).toFixed(2)} (Table 3.13)`;
  svg.appendChild(subRatio);

  // Dimension lx (Bottom)
  const dimX = createEl('g', { class: 'svg-dim' });
  dimX.appendChild(createEl('line', {
    x1: ox, y1: oy + drawH + 15, x2: ox + drawW, y2: oy + drawH + 15,
    stroke: '#475569', 'stroke-width': '1.2'
  }));
  const textX = createEl('text', {
    x: ox + drawW / 2, y: oy + drawH + 28,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#0f172a'
  });
  textX.textContent = `lx = ${lx} m (Short Span)`;
  dimX.appendChild(textX);
  svg.appendChild(dimX);

  // Dimension ly (Right)
  const dimY = createEl('g', { class: 'svg-dim' });
  dimY.appendChild(createEl('line', {
    x1: ox + drawW + 15, y1: oy, x2: ox + drawW + 15, y2: oy + drawH,
    stroke: '#475569', 'stroke-width': '1.2'
  }));
  const textY = createEl('text', {
    x: ox + drawW + 28, y: oy + drawH / 2,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#0f172a',
    transform: `rotate(90, ${ox + drawW + 28}, ${oy + drawH / 2})`
  });
  textY.textContent = `ly = ${ly} m (Long Span)`;
  dimY.appendChild(textY);
  svg.appendChild(dimY);
}
