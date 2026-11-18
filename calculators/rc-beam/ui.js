/**
 * RC Rectangular Beam UI Controller & SVG Drawing
 */

import { calculateRcBeam } from './engine.js';
import { Bars, STANDARD_BAR_DIAS } from '../../shared/js/core/bars.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'rc-beam';
const STORE_KEY = `ces_tool_${SLUG}`;

// Default test cases
const EXAMPLES = {
  EC2: {
    code: 'EC2',
    b: 300,
    h: 500,
    cover: 30,
    fck: 30,
    fyk: 500,
    fywk: 500,
    M: 189,
    V: 126,
    L: 6.0,
    support: 'simply_supported',
    agg: 20,
    bars_n: 4,
    bars_dia: 20,
    top_bars_n: 2,
    top_bars_dia: 12,
    link_dia: 8,
    link_legs: 2,
    link_spacing: 300
  },
  BS8110: {
    code: 'BS8110',
    b: 300,
    h: 500,
    cover: 30,
    fcu: 30,
    fy: 500,
    fyv: 500,
    M: 198,
    V: 132,
    L: 6.0,
    support: 'simply_supported',
    agg: 20,
    bars_n: 4,
    bars_dia: 20,
    top_bars_n: 2,
    top_bars_dia: 16,
    link_dia: 8,
    link_legs: 2,
    link_spacing: 300
  }
};

let currentInputs = { ...EXAMPLES.EC2 };
let debounceTimer = null;

export function initRcBeamUI() {
  // Embed height ping
  Embed.init(SLUG);

  // Restore from URL query params or localStorage
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
  // Code selector
  const codeRadios = document.querySelectorAll('input[name="design_code"]');
  codeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentInputs.code = e.target.value;
      updateCodeLabels();
      triggerRecalc();
    });
  });

  // Inputs
  const inputIds = [
    'b', 'h', 'cover', 'fck_fcu', 'fyk_fy', 'fywk_fyv',
    'M', 'V', 'L', 'agg', 'bars_n', 'top_bars_n',
    'link_legs', 'link_spacing'
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
      } else if (id === 'fywk_fyv') {
        currentInputs.fywk = val;
        currentInputs.fyv = val;
      } else {
        currentInputs[id] = val;
      }
      triggerRecalc();
    });

    // Attach stepper
    const step = el.getAttribute('step') ? Number(el.getAttribute('step')) : (id.includes('bars_n') || id.includes('legs') ? 1 : (id === 'L' ? 0.5 : 10));
    const min = el.getAttribute('min') ? Number(el.getAttribute('min')) : 0;
    UIKit.bindStepper(el, step, min, Infinity, () => triggerRecalc());
  });

  // Support condition
  const supportSelect = document.getElementById('support');
  if (supportSelect) {
    supportSelect.addEventListener('change', (e) => {
      currentInputs.support = e.target.value;
      triggerRecalc();
    });
  }

  // Segmented Bar Pickers
  setupSegmentedPicker('tension_bar_dia_group', STANDARD_BAR_DIAS.slice(2), currentInputs.bars_dia || 20, (dia) => {
    currentInputs.bars_dia = dia;
    triggerRecalc();
  });

  setupSegmentedPicker('top_bar_dia_group', [10, 12, 16, 20, 25], currentInputs.top_bars_dia || 16, (dia) => {
    currentInputs.top_bars_dia = dia;
    triggerRecalc();
  });

  setupSegmentedPicker('link_dia_group', [8, 10, 12, 16], currentInputs.link_dia || 10, (dia) => {
    currentInputs.link_dia = dia;
    triggerRecalc();
  });

  // Action Buttons
  const btnExample = document.getElementById('btnLoadExample');
  if (btnExample) {
    btnExample.addEventListener('click', () => {
      const code = currentInputs.code || 'EC2';
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
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
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
  document.getElementById('lbl_link_strength').textContent = isEC2 ? 'fywk (Link strength)' : 'fyv (Link strength)';
  document.getElementById('lbl_code_tag').textContent = isEC2 ? 'Eurocode 2 (EN 1992-1-1)' : 'BS 8110-1:1997';
}

function populateUIFromState() {
  const codeRadios = document.querySelectorAll('input[name="design_code"]');
  codeRadios.forEach(r => {
    r.checked = r.value === currentInputs.code;
  });

  const setValue = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setValue('b', currentInputs.b);
  setValue('h', currentInputs.h);
  setValue('cover', currentInputs.cover);
  setValue('fck_fcu', currentInputs.fck || currentInputs.fcu);
  setValue('fyk_fy', currentInputs.fyk || currentInputs.fy);
  setValue('fywk_fyv', currentInputs.fywk || currentInputs.fyv);
  setValue('M', currentInputs.M);
  setValue('V', currentInputs.V);
  setValue('L', currentInputs.L);
  setValue('agg', currentInputs.agg);
  setValue('bars_n', currentInputs.bars_n);
  setValue('top_bars_n', currentInputs.top_bars_n);
  setValue('link_legs', currentInputs.link_legs);
  setValue('link_spacing', currentInputs.link_spacing);

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
  const res = calculateRcBeam(currentInputs);
  renderResults(res);
  renderSVGSection(currentInputs, res);
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

  // Summary Grid
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-item">
        <div class="label">Effective Depth d</div>
        <div class="value">${out.results.d.toFixed(1)} <span style="font-size: 13px;">mm</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Req. Steel As</div>
        <div class="value">${out.results.As.toFixed(1)} <span style="font-size: 13px;">mm²</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Provided Steel</div>
        <div class="value">${out.results.As_prov.toFixed(1)} <span style="font-size: 13px;">mm²</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Shear Links Req.</div>
        <div class="value">${(out.results.Asw_s || out.results.Asv_sv).toFixed(3)} <span style="font-size: 13px;">mm²/mm</span></div>
      </div>
    `;
  }

  // Checks Cards
  if (container) {
    container.innerHTML = out.checks.map(c => UIKit.renderStatusCard(c)).join('');
  }

  // Step-by-Step Report Table
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
 * Draw Scaled SVG Beam Cross-Section
 */
function renderSVGSection(input, out) {
  const svg = document.getElementById('beamSectionSVG');
  if (!svg) return;

  svg.innerHTML = '';

  const b = Number(input.b) || 300;
  const h = Number(input.h) || 500;
  const cover = Number(input.cover) || 30;
  const link_dia = Number(input.link_dia) || 10;
  const bars_n = Number(input.bars_n) || 4;
  const bars_dia = Number(input.bars_dia) || 20;
  const top_n = Number(input.top_bars_n) || 2;
  const top_dia = Number(input.top_bars_dia) || 16;

  // ViewBox bounds
  const viewW = 340;
  const viewH = 340;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  // Scale beam to fit with 50px padding
  const pad = 55;
  const maxDrawW = viewW - 2 * pad;
  const maxDrawH = viewH - 2 * pad;
  const scale = Math.min(maxDrawW / b, maxDrawH / h);

  const drawW = b * scale;
  const drawH = h * scale;
  const ox = (viewW - drawW) / 2;
  const oy = (viewH - drawH) / 2;

  const NS = 'http://www.w3.org/2000/svg';
  const createEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  };

  // Concrete Section (gray fill, border)
  svg.appendChild(createEl('rect', {
    x: ox, y: oy, width: drawW, height: drawH,
    fill: '#e2e8f0', stroke: '#334155', 'stroke-width': '2', rx: '2'
  }));

  // Stirrup / Link (dashed or rounded rect)
  const linkPad = cover * scale;
  const linkW = drawW - 2 * linkPad;
  const linkH = drawH - 2 * linkPad;
  const linkR = Math.max(3, (link_dia * 1.5) * scale);

  svg.appendChild(createEl('rect', {
    x: ox + linkPad, y: oy + linkPad,
    width: Math.max(0, linkW), height: Math.max(0, linkH),
    fill: 'none', stroke: '#2563eb', 'stroke-width': Math.max(1.5, link_dia * scale),
    rx: linkR
  }));

  // Tension Bars (bottom)
  const botY = oy + drawH - linkPad - (link_dia * scale) - (bars_dia * scale) / 2;
  const availW = linkW - 2 * (link_dia * scale) - (bars_dia * scale);
  const barSpacing = bars_n > 1 ? availW / (bars_n - 1) : 0;
  const startX = ox + linkPad + (link_dia * scale) + (bars_dia * scale) / 2;

  for (let i = 0; i < bars_n; i++) {
    const bx = bars_n === 1 ? ox + drawW / 2 : startX + i * barSpacing;
    svg.appendChild(createEl('circle', {
      cx: bx, cy: botY, r: (bars_dia * scale) / 2,
      fill: '#dc2626', stroke: '#991b1b', 'stroke-width': '1'
    }));
  }

  // Top / Compression Bars
  const topY = oy + linkPad + (link_dia * scale) + (top_dia * scale) / 2;
  const topAvailW = linkW - 2 * (link_dia * scale) - (top_dia * scale);
  const topSpacing = top_n > 1 ? topAvailW / (top_n - 1) : 0;
  const topStartX = ox + linkPad + (link_dia * scale) + (top_dia * scale) / 2;

  for (let i = 0; i < top_n; i++) {
    const tx = top_n === 1 ? ox + drawW / 2 : topStartX + i * topSpacing;
    svg.appendChild(createEl('circle', {
      cx: tx, cy: topY, r: (top_dia * scale) / 2,
      fill: '#16a34a', stroke: '#14532d', 'stroke-width': '1'
    }));
  }

  // Dimension lines: b at bottom, h at right
  // b dimension
  const dimB = createEl('g', { class: 'svg-dim' });
  dimB.appendChild(createEl('line', {
    x1: ox, y1: oy + drawH + 18, x2: ox + drawW, y2: oy + drawH + 18,
    stroke: '#475569', 'stroke-width': '1.2'
  }));
  const textB = createEl('text', {
    x: ox + drawW / 2, y: oy + drawH + 32,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#0f172a'
  });
  textB.textContent = `b = ${b} mm`;
  dimB.appendChild(textB);
  svg.appendChild(dimB);

  // h dimension
  const dimH = createEl('g', { class: 'svg-dim' });
  dimH.appendChild(createEl('line', {
    x1: ox + drawW + 18, y1: oy, x2: ox + drawW + 18, y2: oy + drawH,
    stroke: '#475569', 'stroke-width': '1.2'
  }));
  const textH = createEl('text', {
    x: ox + drawW + 30, y: oy + drawH / 2,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#0f172a',
    transform: `rotate(90, ${ox + drawW + 30}, ${oy + drawH / 2})`
  });
  textH.textContent = `h = ${h} mm`;
  dimH.appendChild(textH);
  svg.appendChild(dimH);

  // d dimension marker
  if (out && out.results && out.results.d) {
    const dVal = out.results.d;
    const dy = oy + (h - dVal) * scale;
    const dimD = createEl('line', {
      x1: ox - 10, y1: dy, x2: ox + drawW, y2: dy,
      stroke: '#dc2626', 'stroke-width': '1', 'stroke-dasharray': '3,3'
    });
    svg.appendChild(dimD);
  }
}
