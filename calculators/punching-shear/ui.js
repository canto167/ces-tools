/**
 * Punching Shear UI Controller & Scaled SVG Plan Drawing
 */

import { calculatePunchingShear } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'punching-shear';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLE = {
  col_shape: 'rectangular',
  col_type: 'internal',
  c1: 400,
  c2: 400,
  d: 210,
  VEd: 750,
  beta: 1.15,
  fck: 30,
  rho_l: 0.0075,
  fywk: 500,
  link_dia: 10,
  sr: 150,
  vrdmax_factor: 0.4
};

let currentInputs = { ...EXAMPLE };
let debounceTimer = null;

export function initPunchingShearUI() {
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
  const inputIds = ['c1', 'c2', 'd', 'VEd', 'fck', 'rho_l', 'fywk', 'sr', 'beta'];

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

  // Column position
  const colTypeSelect = document.getElementById('col_type');
  if (colTypeSelect) {
    colTypeSelect.addEventListener('change', (e) => {
      currentInputs.col_type = e.target.value;
      if (e.target.value === 'internal') currentInputs.beta = 1.15;
      else if (e.target.value === 'edge') currentInputs.beta = 1.40;
      else if (e.target.value === 'corner') currentInputs.beta = 1.50;
      const betaInput = document.getElementById('beta');
      if (betaInput) betaInput.value = currentInputs.beta;
      triggerRecalc();
    });
  }

  // NA Factor
  document.querySelectorAll('input[name="na_factor"]').forEach(r => {
    r.addEventListener('change', (e) => {
      currentInputs.vrdmax_factor = Number(e.target.value);
      triggerRecalc();
    });
  });

  // Segmented Bar Picker
  setupSegmentedPicker('link_dia_group', [8, 10, 12, 16], currentInputs.link_dia || 10, (dia) => {
    currentInputs.link_dia = dia;
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

  setValue('c1', currentInputs.c1);
  setValue('c2', currentInputs.c2);
  setValue('d', currentInputs.d);
  setValue('VEd', currentInputs.VEd);
  setValue('fck', currentInputs.fck);
  setValue('rho_l', currentInputs.rho_l);
  setValue('fywk', currentInputs.fywk);
  setValue('sr', currentInputs.sr);
  setValue('beta', currentInputs.beta);

  const colTypeSelect = document.getElementById('col_type');
  if (colTypeSelect) colTypeSelect.value = currentInputs.col_type || 'internal';

  document.querySelectorAll('input[name="na_factor"]').forEach(r => {
    r.checked = Number(r.value) === Number(currentInputs.vrdmax_factor);
  });
}

function triggerRecalc() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    recalculate();
    Store.set(STORE_KEY, currentInputs);
  }, 120);
}

function recalculate() {
  const out = calculatePunchingShear(currentInputs);
  renderResults(out);
  renderSVGPunching(currentInputs, out);
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
        <div class="label">Column Face vEd,0</div>
        <div class="value">${out.results.vEd_0.toFixed(3)} <span style="font-size: 13px;">MPa</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Crushing Limit vRd,max</div>
        <div class="value">${out.results.vRd_max.toFixed(3)} <span style="font-size: 13px;">MPa</span></div>
      </div>
      <div class="summary-item">
        <div class="label">2d Perimeter vEd,1</div>
        <div class="value">${out.results.vEd_1.toFixed(3)} <span style="font-size: 13px;">MPa</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Concrete Res. vRd,c</div>
        <div class="value">${out.results.vRd_c.toFixed(3)} <span style="font-size: 13px;">MPa</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Shear Links Req.</div>
        <div class="value">${out.results.needsLinks ? `${out.results.legs_per_perimeter} legs H${currentInputs.link_dia || 10}` : 'None (OK)'}</div>
      </div>
      <div class="summary-item">
        <div class="label">Outer Perimeter u_out</div>
        <div class="value">${out.results.uout.toFixed(0)} <span style="font-size: 13px;">mm</span></div>
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
        <td style="font-weight: 700;">${typeof st.value === 'number' ? st.value.toFixed(3) : st.value} ${st.unit || ''}</td>
        <td class="code-cell" style="color: var(--text-muted);">${st.clause || '—'}</td>
      </tr>
    `).join('');
  }
}

/**
 * Scaled SVG Plan of Control Perimeters u0, u1, and u_out
 */
function renderSVGPunching(input, out) {
  const svg = document.getElementById('punchingSVG');
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 380;
  const viewH = 340;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const c1 = Number(input.c1) || 400;
  const c2 = Number(input.c2) || 400;
  const d = Number(input.d) || 210;
  const r_out = (out.results && out.results.r_out) ? out.results.r_out : (2 * d + 300);

  // Calculate extent to fit u_out comfortably
  const maxSpan = Math.max(c1 + 2 * r_out, c2 + 2 * r_out, c1 + 4 * d);
  const pad = 40;
  const scale = (Math.min(viewW, viewH) - 2 * pad) / maxSpan;

  const cx = viewW / 2;
  const cy = viewH / 2;

  const NS = 'http://www.w3.org/2000/svg';
  const createEl = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  };

  // Outer Perimeter u_out (dashed blue line)
  const drawRout = r_out * scale;
  const uoutW = (c1 * scale) + 2 * drawRout;
  const uoutH = (c2 * scale) + 2 * drawRout;
  svg.appendChild(createEl('rect', {
    x: cx - uoutW / 2, y: cy - uoutH / 2, width: uoutW, height: uoutH,
    fill: '#f0fdf4', stroke: '#16a34a', 'stroke-width': '1.5', 'stroke-dasharray': '5,4',
    rx: drawRout
  }));

  // Basic Control Perimeter u1 at 2d (blue solid line with rounded corners)
  const r2d = (2 * d) * scale;
  const u1W = (c1 * scale) + 2 * r2d;
  const u1H = (c2 * scale) + 2 * r2d;
  svg.appendChild(createEl('rect', {
    x: cx - u1W / 2, y: cy - u1H / 2, width: u1W, height: u1H,
    fill: '#eff6ff', stroke: '#2563eb', 'stroke-width': '2',
    rx: r2d
  }));

  // Column u0 (solid dark center)
  const colW = c1 * scale;
  const colH = c2 * scale;
  svg.appendChild(createEl('rect', {
    x: cx - colW / 2, y: cy - colH / 2, width: colW, height: colH,
    fill: '#334155', stroke: '#0f172a', 'stroke-width': '2', rx: '2'
  }));

  // Column Center cross-hairs
  svg.appendChild(createEl('line', {
    x1: cx - colW / 2 - 8, y1: cy, x2: cx + colW / 2 + 8, y2: cy,
    stroke: '#ffffff', 'stroke-width': '1', 'stroke-dasharray': '3,3'
  }));
  svg.appendChild(createEl('line', {
    x1: cx, y1: cy - colH / 2 - 8, x2: cx, y2: cy + colH / 2 + 8,
    stroke: '#ffffff', 'stroke-width': '1', 'stroke-dasharray': '3,3'
  }));

  // Labels
  const labelCol = createEl('text', {
    x: cx, y: cy + 4,
    'text-anchor': 'middle', 'font-size': '10', 'font-weight': '700', fill: '#ffffff'
  });
  labelCol.textContent = `${c1}×${c2}`;
  svg.appendChild(labelCol);

  // Label u1
  const labelU1 = createEl('text', {
    x: cx, y: cy - u1H / 2 - 6,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#2563eb'
  });
  labelU1.textContent = `u1 at 2d (vEd,1 = ${(out.results.vEd_1 || 0).toFixed(3)} MPa)`;
  svg.appendChild(labelU1);

  // Label u_out
  const labelUout = createEl('text', {
    x: cx, y: cy + uoutH / 2 + 16,
    'text-anchor': 'middle', 'font-size': '11', 'font-weight': '700', fill: '#16a34a'
  });
  labelUout.textContent = `u_out perimeter (r = ${r_out.toFixed(0)} mm)`;
  svg.appendChild(labelUout);
}
