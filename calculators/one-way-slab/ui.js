/**
 * One-Way Slab UI Controller & Scaled SVG Elevation
 */

import { calculateOneWaySlab } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'one-way-slab';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLES = {
  BS8110: {
    code: 'BS8110',
    L: 4.0,
    h: 175,
    cover: 25,
    fcu: 30,
    fy: 500,
    finishes: 1.0,
    qk: 3.0,
    main_bar_dia: 10,
    main_bar_spacing: 150,
    dist_bar_dia: 10,
    support: 'simply_supported'
  },
  EC2: {
    code: 'EC2',
    L: 4.0,
    h: 175,
    cover: 25,
    fck: 30,
    fyk: 500,
    finishes: 1.0,
    qk: 3.0,
    main_bar_dia: 10,
    main_bar_spacing: 175,
    dist_bar_dia: 10,
    support: 'simply_supported'
  }
};

let currentInputs = { ...EXAMPLES.BS8110 };
let debounceTimer = null;

export function initOneWaySlabUI() {
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
  // Code selection
  document.querySelectorAll('input[name="design_code"]').forEach(r => {
    r.addEventListener('change', (e) => {
      currentInputs.code = e.target.value;
      updateCodeLabels();
      triggerRecalc();
    });
  });

  const inputIds = [
    'L', 'h', 'cover', 'finishes', 'qk', 'fck_fcu', 'fyk_fy', 'main_bar_spacing'
  ];

  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const val = Number(el.value);
      if (id === 'fck_fcu') {
        currentInputs.fck = val;
        currentInputs.fcu = val;
      } else if (id === 'fyk_fy') {
        currentInputs.fyk = val;
        currentInputs.fy = val;
      } else {
        currentInputs[id] = val;
      }
      triggerRecalc();
    });

    const step = el.getAttribute('step') ? Number(el.getAttribute('step')) : 10;
    const min = el.getAttribute('min') ? Number(el.getAttribute('min')) : 0;
    UIKit.bindStepper(el, step, min, Infinity, () => triggerRecalc());
  });

  const supportSelect = document.getElementById('support');
  if (supportSelect) {
    supportSelect.addEventListener('change', (e) => {
      currentInputs.support = e.target.value;
      const checklist = document.getElementById('table312Conditions');
      if (checklist) {
        checklist.style.display = e.target.value !== 'simply_supported' ? 'block' : 'none';
      }
      triggerRecalc();
    });
  }

  // Segmented Bar Pickers
  setupSegmentedPicker('main_bar_dia_group', [8, 10, 12, 16, 20], currentInputs.main_bar_dia || 10, (dia) => {
    currentInputs.main_bar_dia = dia;
    triggerRecalc();
  });

  setupSegmentedPicker('dist_bar_dia_group', [8, 10, 12], currentInputs.dist_bar_dia || 10, (dia) => {
    currentInputs.dist_bar_dia = dia;
    triggerRecalc();
  });

  // Buttons
  const btnExample = document.getElementById('btnLoadExample');
  if (btnExample) {
    btnExample.addEventListener('click', () => {
      const code = currentInputs.code || 'BS8110';
      currentInputs = { ...EXAMPLES[code] };
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

function updateCodeLabels() {
  const isEC2 = currentInputs.code === 'EC2';
  document.getElementById('lbl_conc_strength').textContent = isEC2 ? 'fck (Cylinder strength)' : 'fcu (Cube strength)';
  document.getElementById('lbl_steel_strength').textContent = isEC2 ? 'fyk (Yield strength)' : 'fy (Yield strength)';
  document.getElementById('lbl_code_tag').textContent = isEC2 ? 'Eurocode 2 (EN 1992-1-1)' : 'BS 8110-1:1997';
}

function populateUIFromState() {
  document.querySelectorAll('input[name="design_code"]').forEach(r => {
    r.checked = r.value === currentInputs.code;
  });

  const setValue = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setValue('L', currentInputs.L);
  setValue('h', currentInputs.h);
  setValue('cover', currentInputs.cover);
  setValue('finishes', currentInputs.finishes);
  setValue('qk', currentInputs.qk);
  setValue('fck_fcu', currentInputs.fck || currentInputs.fcu);
  setValue('fyk_fy', currentInputs.fyk || currentInputs.fy);
  setValue('main_bar_spacing', currentInputs.main_bar_spacing);

  const supportSelect = document.getElementById('support');
  if (supportSelect) supportSelect.value = currentInputs.support || 'simply_supported';

  updateCodeLabels();
}

function triggerRecalc() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    recalculate();
    Store.set(STORE_KEY, currentInputs);
  }, 120);
}

function recalculate() {
  const out = calculateOneWaySlab(currentInputs);
  renderResults(out);
  renderSVGSlab(currentInputs, out);
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
        <div class="label">Design Moment M</div>
        <div class="value">${out.results.M.toFixed(2)} <span style="font-size: 13px;">kNm/m</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Req. Steel As</div>
        <div class="value">${out.results.As.toFixed(1)} <span style="font-size: 13px;">mm²/m</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Provided Steel</div>
        <div class="value">${out.results.As_prov.toFixed(1)} <span style="font-size: 13px;">mm²/m</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Distribution Steel</div>
        <div class="value">H${currentInputs.dist_bar_dia || 10}@${out.results.dist_spacing_recommended} <span style="font-size: 13px;">mm</span></div>
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
 * Draw Scaled SVG Elevation of 1-metre Slab Strip
 */
function renderSVGSlab(input, out) {
  const svg = document.getElementById('slabSectionSVG');
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 380;
  const viewH = 260;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const h = Number(input.h) || 175;
  const cover = Number(input.cover) || 25;
  const dia = Number(input.main_bar_dia) || 10;
  const spacing = Number(input.main_bar_spacing) || 150;
  const dist_dia = Number(input.dist_bar_dia) || 10;

  const NS = 'http://www.w3.org/2000/svg';
  const createEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  };

  // Slab width representation (1000mm strip)
  const drawW = 300;
  const scale = drawW / 1000.0;
  const drawH = Math.max(30, h * scale * 2.5); // scale height comfortably

  const ox = 40;
  const oy = 90;

  // Concrete Strip Outline
  svg.appendChild(createEl('rect', {
    x: ox, y: oy, width: drawW, height: drawH,
    fill: '#e2e8f0', stroke: '#334155', 'stroke-width': '2', rx: '2'
  }));

  // Uniform Load Arrows on top of slab
  const numArrows = 7;
  for (let i = 0; i <= numArrows; i++) {
    const ax = ox + (i * drawW) / numArrows;
    svg.appendChild(createEl('line', {
      x1: ax, y1: oy - 30, x2: ax, y2: oy - 2,
      stroke: '#ea580c', 'stroke-width': '1.5'
    }));
    // Arrow head
    svg.appendChild(createEl('polygon', {
      points: `${ax-3},${oy-8} ${ax+3},${oy-8} ${ax},${oy-1}`,
      fill: '#ea580c'
    }));
  }
  const loadText = createEl('text', {
    x: ox + drawW / 2, y: oy - 36,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#ea580c'
  });
  loadText.textContent = `n = ${(out.results.n || 0).toFixed(2)} kN/m²`;
  svg.appendChild(loadText);

  // Main Bars (bottom layer circles across 1000mm width)
  const coverDraw = (cover / h) * drawH;
  const botY = oy + drawH - coverDraw - (dia / 2);
  const numBars = Math.floor(1000.0 / spacing);
  const startX = ox + ((1000 - (numBars - 1) * spacing) / 2) * scale;

  for (let i = 0; i < numBars; i++) {
    const bx = startX + i * (spacing * scale);
    svg.appendChild(createEl('circle', {
      cx: bx, cy: botY, r: Math.max(3, (dia * scale) * 2),
      fill: '#dc2626', stroke: '#991b1b', 'stroke-width': '1'
    }));
  }

  // Distribution bar (shown as longitudinal bar resting above main bars)
  const distY = botY - dia - 2;
  svg.appendChild(createEl('line', {
    x1: ox + 10, y1: distY, x2: ox + drawW - 10, y2: distY,
    stroke: '#16a34a', 'stroke-width': '3', 'stroke-dasharray': '8,3'
  }));

  // Dimension h
  const dimH = createEl('g', { class: 'svg-dim' });
  dimH.appendChild(createEl('line', {
    x1: ox + drawW + 15, y1: oy, x2: ox + drawW + 15, y2: oy + drawH,
    stroke: '#475569', 'stroke-width': '1.2'
  }));
  const textH = createEl('text', {
    x: ox + drawW + 28, y: oy + drawH / 2,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#0f172a',
    transform: `rotate(90, ${ox + drawW + 28}, ${oy + drawH / 2})`
  });
  textH.textContent = `h = ${h} mm`;
  dimH.appendChild(textH);
  svg.appendChild(dimH);

  // Dimension 1000mm strip
  const dimW = createEl('g', { class: 'svg-dim' });
  dimW.appendChild(createEl('line', {
    x1: ox, y1: oy + drawH + 18, x2: ox + drawW, y2: oy + drawH + 18,
    stroke: '#475569', 'stroke-width': '1.2'
  }));
  const textW = createEl('text', {
    x: ox + drawW / 2, y: oy + drawH + 32,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#0f172a'
  });
  textW.textContent = `1000 mm Design Strip (Span L = ${input.L} m)`;
  dimW.appendChild(textW);
  svg.appendChild(dimW);
}
