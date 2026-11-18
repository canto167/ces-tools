/**
 * C10 — Cantilever Retaining Wall UI Controller & Scaled SVG Section
 */

import { calculateRetainingWall } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'retaining-wall';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLE = {
  h_stem: 4.0,
  t_stem: 0.3,
  t_base: 0.4,
  b_toe: 0.8,
  b_heel: 2.4,
  gamma_soil: 18.0,
  phi: 30.0,
  q_surcharge: 10.0,
  mu: 0.5,
  gamma_conc: 24.0,
  q_all: 150.0,
  cover: 40,
  barDia: 16,
  barSpacing: 150,
  fcu: 30,
  fy: 500
};

let currentInputs = { ...EXAMPLE };
let debounceTimer = null;

export function initRetainingWallUI() {
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
  const numericIds = [
    'h_stem', 't_stem', 't_base', 'b_toe', 'b_heel',
    'gamma_soil', 'phi', 'q_surcharge', 'mu', 'gamma_conc', 'q_all',
    'cover', 'barSpacing', 'fcu', 'fy'
  ];

  numericIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      currentInputs[id] = Number(el.value);
      triggerRecalc();
    });

    const step = el.getAttribute('step') ? Number(el.getAttribute('step')) : 1;
    const min = el.getAttribute('min') ? Number(el.getAttribute('min')) : 0;
    UIKit.bindStepper(el, step, min, Infinity, () => triggerRecalc());
  });

  setupSegmentedPicker('barDia_group', [12, 16, 20, 25], currentInputs.barDia || 16, (dia) => {
    currentInputs.barDia = dia;
    triggerRecalc();
  });

  // Buttons
  const btnExample = document.getElementById('btnLoadExample');
  if (btnExample) {
    btnExample.addEventListener('click', () => {
      currentInputs = { ...EXAMPLE };
      populateUIFromState();
      triggerRecalc();
      UIKit.showToast('Reset to Test A worked example');
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

  setValue('h_stem', currentInputs.h_stem);
  setValue('t_stem', currentInputs.t_stem);
  setValue('t_base', currentInputs.t_base);
  setValue('b_toe', currentInputs.b_toe);
  setValue('b_heel', currentInputs.b_heel);
  setValue('gamma_soil', currentInputs.gamma_soil);
  setValue('phi', currentInputs.phi);
  setValue('q_surcharge', currentInputs.q_surcharge);
  setValue('mu', currentInputs.mu);
  setValue('gamma_conc', currentInputs.gamma_conc);
  setValue('q_all', currentInputs.q_all);
  setValue('cover', currentInputs.cover);
  setValue('barSpacing', currentInputs.barSpacing);
  setValue('fcu', currentInputs.fcu);
  setValue('fy', currentInputs.fy);

  setupSegmentedPicker('barDia_group', [12, 16, 20, 25], currentInputs.barDia || 16, (dia) => {
    currentInputs.barDia = dia;
    triggerRecalc();
  });
}

function triggerRecalc() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    recalculate();
    Store.set(STORE_KEY, currentInputs);
  }, 100);
}

function recalculate() {
  const res = calculateRetainingWall(currentInputs);
  renderResults(res);
  renderSVGWall(currentInputs, res);
}

function renderResults(res) {
  const summaryBox = document.getElementById('summaryGrid');
  const container = document.getElementById('checksContainer');
  const stepsContainer = document.getElementById('stepsTableBody');

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-item">
        <div class="label">Overturning Stability</div>
        <div class="value">${res.FoS_OT.toFixed(2)} <span style="font-size: 13px;">${res.pass_OT ? '(PASS ≥ 2.0)' : '(FAIL < 2.0)'}</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Sliding Stability</div>
        <div class="value">${res.FoS_slide.toFixed(2)} <span style="font-size: 13px;">${res.pass_slide ? '(PASS ≥ 1.5)' : '(FAIL < 1.5)'}</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Base Pressure (pmax)</div>
        <div class="value">${res.p_max.toFixed(1)} <span style="font-size: 13px;">kPa (all ${res.inputs.q_all} kPa)</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Stem Flexure (Mu)</div>
        <div class="value">${res.Mu.toFixed(1)} <span style="font-size: 13px;">kNm/m (As ${res.As_prov.toFixed(0)} mm²)</span></div>
      </div>
    `;
  }

  if (container && res.report) {
    container.innerHTML = res.report.checks.map(c => UIKit.renderStatusCard({
      title: c.title,
      clause: c.clause,
      actual: `${typeof c.actual === 'number' ? c.actual.toFixed(2) : c.actual} ${c.unit || ''}`,
      allowable: `${typeof c.allowable === 'number' ? c.allowable.toFixed(2) : c.allowable} ${c.unit || ''}`,
      ratio: c.ratio,
      pass: c.pass
    })).join('');
  }

  if (stepsContainer && res.report) {
    stepsContainer.innerHTML = res.report.steps.map((st, i) => `
      <tr>
        <td style="font-weight: 600;">${i + 1}. ${st.description}</td>
        <td class="code-cell">${st.formula || '—'}</td>
        <td class="code-cell">${st.values || '—'}</td>
        <td class="code-cell" style="color: var(--text-muted);">${st.ref || '—'}</td>
      </tr>
    `).join('');
  }
}

/**
 * Scaled SVG Drawing of Retaining Wall, Thrusts, and Soil Pressure
 */
function renderSVGWall(input, res) {
  const svg = document.getElementById('wallSVG');
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 440;
  const viewH = 340;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const H = res.H; // m
  const B = res.B; // m
  const b_toe = Number(input.b_toe) || 0.8;
  const t_stem = Number(input.t_stem) || 0.3;
  const b_heel = Number(input.b_heel) || 2.4;
  const h_stem = Number(input.h_stem) || 4.0;
  const t_base = Number(input.t_base) || 0.4;

  const padX = 70;
  const padTop = 45;
  const availW = viewW - 2 * padX;
  const availH = viewH - padTop - 70;

  const scale = Math.min(availW / B, availH / H);

  const baseW = B * scale;
  const baseH = t_base * scale;
  const stemW = t_stem * scale;
  const stemH = h_stem * scale;
  const toeW = b_toe * scale;
  const heelW = b_heel * scale;

  const startX = padX;
  const groundY = padTop;
  const baseTopY = groundY + stemH;
  const baseBottomY = baseTopY + baseH;
  const stemLeftX = startX + toeW;
  const stemRightX = stemLeftX + stemW;

  const markup = `
    <!-- Backfill Soil Hatch / Fill -->
    <rect x="${stemRightX}" y="${groundY}" width="${heelW + 20}" height="${stemH}" fill="rgba(245, 158, 11, 0.12)" stroke="none" />
    <line x1="${stemRightX}" y1="${groundY}" x2="${stemRightX + heelW + 20}" y2="${groundY}" stroke="#d97706" stroke-width="2" />
    <text x="${stemRightX + 15}" y="${groundY + 20}" font-size="11" fill="#b45309" font-weight="600">Backfill Soil (γ=${input.gamma_soil})</text>

    <!-- Surcharge Arrows -->
    ${[0.2, 0.5, 0.8].map(frac => {
      const sx = stemRightX + frac * heelW;
      return `
        <line x1="${sx}" y1="${groundY - 24}" x2="${sx}" y2="${groundY - 4}" stroke="#d97706" stroke-width="1.5" />
        <polygon points="${sx - 3},${groundY - 9} ${sx + 3},${groundY - 9} ${sx},${groundY - 3}" fill="#d97706" />
      `;
    }).join('')}
    <text x="${stemRightX + heelW / 2}" y="${groundY - 28}" text-anchor="middle" font-size="10" fill="#d97706" font-weight="bold">q = ${input.q_surcharge} kPa</text>

    <!-- Wall Concrete Profile (Inverted-T) -->
    <path d="
      M ${startX} ${baseTopY}
      L ${stemLeftX} ${baseTopY}
      L ${stemLeftX} ${groundY}
      L ${stemRightX} ${groundY}
      L ${stemRightX} ${baseTopY}
      L ${startX + baseW} ${baseTopY}
      L ${startX + baseW} ${baseBottomY}
      L ${startX} ${baseBottomY}
      Z
    " fill="#cbd5e1" stroke="#0f172a" stroke-width="2.5" />

    <!-- Stem Vertical Rebars (Tension side near soil face) -->
    <line x1="${stemRightX - (input.cover / 1000) * scale}" y1="${groundY + 15}" x2="${stemRightX - (input.cover / 1000) * scale}" y2="${baseTopY + baseH * 0.7}" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="2,1" />

    <!-- Active Soil Thrust Vector Pa (at H/3 from base) -->
    <line x1="${stemRightX + 45}" y1="${baseBottomY - (H / 3) * scale}" x2="${stemRightX + 2}" y2="${baseBottomY - (H / 3) * scale}" stroke="#2563eb" stroke-width="2.5" />
    <polygon points="${stemRightX + 8},${baseBottomY - (H / 3) * scale - 4} ${stemRightX + 8},${baseBottomY - (H / 3) * scale + 4} ${stemRightX + 2},${baseBottomY - (H / 3) * scale}" fill="#2563eb" />
    <text x="${stemRightX + 50}" y="${baseBottomY - (H / 3) * scale + 4}" font-size="10" fill="#2563eb" font-weight="bold">Pa = ${res.Pa.toFixed(1)} kN/m</text>

    <!-- Surcharge Thrust Vector Pq (at H/2 from base) -->
    <line x1="${stemRightX + 45}" y1="${baseBottomY - (H / 2) * scale}" x2="${stemRightX + 2}" y2="${baseBottomY - (H / 2) * scale}" stroke="#7c3aed" stroke-width="2" />
    <polygon points="${stemRightX + 8},${baseBottomY - (H / 2) * scale - 4} ${stemRightX + 8},${baseBottomY - (H / 2) * scale + 4} ${stemRightX + 2},${baseBottomY - (H / 2) * scale}" fill="#7c3aed" />
    <text x="${stemRightX + 50}" y="${baseBottomY - (H / 2) * scale + 4}" font-size="10" fill="#7c3aed" font-weight="bold">Pq = ${res.Pq.toFixed(1)} kN/m</text>

    <!-- Base Bearing Pressure Trapezoid -->
    <path d="
      M ${startX} ${baseBottomY + 8}
      L ${startX + baseW} ${baseBottomY + 8}
      L ${startX + baseW} ${baseBottomY + 8 + Math.min(35, res.p_min * 0.3)}
      L ${startX} ${baseBottomY + 8 + Math.min(45, res.p_max * 0.3)}
      Z
    " fill="rgba(16, 185, 129, 0.18)" stroke="#059669" stroke-width="1.5" />
    <text x="${startX}" y="${baseBottomY + 24 + Math.min(35, res.p_max * 0.3)}" font-size="10" fill="#059669" font-weight="bold">pmax = ${res.p_max.toFixed(1)}</text>
    <text x="${startX + baseW}" y="${baseBottomY + 24 + Math.min(35, res.p_min * 0.3)}" text-anchor="end" font-size="10" fill="#059669" font-weight="bold">pmin = ${res.p_min.toFixed(1)}</text>

    <!-- Base Width Dimension -->
    <line x1="${startX}" y1="${baseBottomY + 45}" x2="${startX + baseW}" y2="${baseBottomY + 45}" stroke="#475569" stroke-width="1.5" />
    <line x1="${startX}" y1="${baseBottomY + 40}" x2="${startX}" y2="${baseBottomY + 50}" stroke="#475569" stroke-width="1.5" />
    <line x1="${startX + baseW}" y1="${baseBottomY + 40}" x2="${startX + baseW}" y2="${baseBottomY + 50}" stroke="#475569" stroke-width="1.5" />
    <text x="${startX + baseW / 2}" y="${baseBottomY + 58}" text-anchor="middle" font-size="11" fill="#334155" font-weight="bold">B = ${B.toFixed(2)} m (Toe ${b_toe}m | Stem ${t_stem}m | Heel ${b_heel}m)</text>
  `;

  svg.innerHTML = markup;
}
