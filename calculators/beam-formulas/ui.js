/**
 * C8 — Beam Formulas, SFD, BMD & Deflection UI Controller & SVG Graphs
 */

import { calculateBeam } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'beam-formulas';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLE = {
  supportType: 'simply_supported',
  L: 6.0,
  w: 10.0,
  x1: 0,
  x2: 6.0,
  P: 0,
  a: 3.0,
  E: 200000,
  I_cm4: 10000 // 1.0e8 mm4 = 10,000 cm4
};

let currentInputs = { ...EXAMPLE };
let debounceTimer = null;

export function initBeamFormulasUI() {
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
  const numericIds = ['L', 'w', 'x1', 'x2', 'P', 'a', 'E', 'I_cm4'];
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

  const supportSelect = document.getElementById('supportType');
  if (supportSelect) {
    supportSelect.addEventListener('change', () => {
      currentInputs.supportType = supportSelect.value;
      triggerRecalc();
    });
  }

  // Material Presets
  const presetSelect = document.getElementById('matPreset');
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const val = presetSelect.value;
      if (val === 'steel') currentInputs.E = 200000;
      else if (val === 'concrete') currentInputs.E = 33000;
      else if (val === 'timber') currentInputs.E = 11000;
      const elE = document.getElementById('E');
      if (elE) elE.value = currentInputs.E;
      triggerRecalc();
    });
  }

  // Buttons
  const btnExample = document.getElementById('btnLoadExample');
  if (btnExample) {
    btnExample.addEventListener('click', () => {
      currentInputs = { ...EXAMPLE };
      populateUIFromState();
      triggerRecalc();
      UIKit.showToast('Reset to SS beam example');
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

  // Diagram tab buttons
  document.querySelectorAll('.diag-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diag-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.diag-tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
    });
  });

  // Report tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
    });
  });
}

function populateUIFromState() {
  const setValue = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setValue('supportType', currentInputs.supportType);
  setValue('L', currentInputs.L);
  setValue('w', currentInputs.w);
  setValue('x1', currentInputs.x1 !== undefined ? currentInputs.x1 : 0);
  setValue('x2', currentInputs.x2 !== undefined ? currentInputs.x2 : currentInputs.L);
  setValue('P', currentInputs.P);
  setValue('a', currentInputs.a);
  setValue('E', currentInputs.E);
  setValue('I_cm4', currentInputs.I_cm4);
}

function triggerRecalc() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    recalculate();
    Store.set(STORE_KEY, currentInputs);
  }, 100);
}

function recalculate() {
  const L = currentInputs.L || 6.0;
  const pointLoads = [];
  if (currentInputs.P && currentInputs.P > 0) {
    pointLoads.push({ P: currentInputs.P, a: Math.min(L, currentInputs.a || 0) });
  }

  const distributedLoads = [];
  if (currentInputs.w && currentInputs.w > 0) {
    distributedLoads.push({
      w: currentInputs.w,
      x1: currentInputs.x1 || 0,
      x2: currentInputs.x2 !== undefined ? currentInputs.x2 : L
    });
  }

  // I in mm4 = I_cm4 * 10,000
  const I_mm4 = (currentInputs.I_cm4 || 10000) * 10000;

  const res = calculateBeam({
    supportType: currentInputs.supportType || 'simply_supported',
    L,
    pointLoads,
    distributedLoads,
    E: currentInputs.E || 200000,
    I: I_mm4
  });

  renderResults(res);
  renderDiagrams(res);
}

function renderResults(res) {
  const summaryBox = document.getElementById('summaryGrid');
  const stepsContainer = document.getElementById('stepsTableBody');

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-item">
        <div class="label">Reactions RA / RB</div>
        <div class="value">${res.RA.toFixed(1)} / ${res.RB.toFixed(1)} <span style="font-size: 13px;">kN</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Max Sagging Moment</div>
        <div class="value">${res.maxM.toFixed(1)} <span style="font-size: 13px;">kNm (@ ${res.maxMLoc.toFixed(2)}m)</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Max Hogging Moment</div>
        <div class="value">${res.minM.toFixed(1)} <span style="font-size: 13px;">kNm (@ ${res.minMLoc.toFixed(2)}m)</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Max Elastic Deflection</div>
        <div class="value">${res.maxDeflection_mm.toFixed(3)} <span style="font-size: 13px;">mm (@ ${res.maxDeflectionLoc_m.toFixed(2)}m)</span></div>
      </div>
    `;
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
 * Render all 4 SVG Diagrams: Beam Model, SFD, BMD, Deflection
 */
function renderDiagrams(res) {
  renderSVGBeamModel(res);
  renderSVGPlot('sfdSVG', res.xVals, res.V, 'Shear Force (kN)', '#2563eb', true);
  renderSVGPlot('bmdSVG', res.xVals, res.M, 'Bending Moment (kNm)', '#dc2626', true);
  renderSVGPlot('deflSVG', res.xVals, res.delta_mm, 'Deflection (mm)', '#059669', false);
}

function renderSVGBeamModel(res) {
  const svg = document.getElementById('modelSVG');
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 440;
  const viewH = 180;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const padX = 50;
  const beamY = 110;
  const beamW = viewW - 2 * padX;
  const scale = beamW / res.L;

  let markup = `
    <!-- Beam Axis -->
    <line x1="${padX}" y1="${beamY}" x2="${padX + beamW}" y2="${beamY}" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
  `;

  // Supports
  if (res.supportType === 'simply_supported') {
    // Pin at A (padX)
    markup += `
      <polygon points="${padX},${beamY + 3} ${padX - 10},${beamY + 22} ${padX + 10},${beamY + 22}" fill="#64748b" />
      <line x1="${padX - 14}" y1="${beamY + 22}" x2="${padX + 14}" y2="${beamY + 22}" stroke="#334155" stroke-width="2" />
      <!-- Roller at B (padX + beamW) -->
      <polygon points="${padX + beamW},${beamY + 3} ${padX + beamW - 10},${beamY + 18} ${padX + beamW + 10},${beamY + 18}" fill="#64748b" />
      <circle cx="${padX + beamW - 6}" cy="${beamY + 22}" r="3" fill="#475569" />
      <circle cx="${padX + beamW + 6}" cy="${beamY + 22}" r="3" fill="#475569" />
      <line x1="${padX + beamW - 14}" y1="${beamY + 26}" x2="${padX + beamW + 14}" y2="${beamY + 26}" stroke="#334155" stroke-width="2" />
    `;
  } else if (res.supportType === 'cantilever') {
    // Fixed wall at A
    markup += `
      <line x1="${padX}" y1="${beamY - 30}" x2="${padX}" y2="${beamY + 30}" stroke="#0f172a" stroke-width="4" />
      ${[-25, -15, -5, 5, 15, 25].map(offset => `
        <line x1="${padX}" y1="${beamY + offset}" x2="${padX - 10}" y2="${beamY + offset + 8}" stroke="#475569" stroke-width="2" />
      `).join('')}
    `;
  } else if (res.supportType === 'fixed_fixed') {
    // Fixed walls at A and B
    markup += `
      <line x1="${padX}" y1="${beamY - 30}" x2="${padX}" y2="${beamY + 30}" stroke="#0f172a" stroke-width="4" />
      ${[-25, -15, -5, 5, 15, 25].map(offset => `
        <line x1="${padX}" y1="${beamY + offset}" x2="${padX - 10}" y2="${beamY + offset + 8}" stroke="#475569" stroke-width="2" />
      `).join('')}
      <line x1="${padX + beamW}" y1="${beamY - 30}" x2="${padX + beamW}" y2="${beamY + 30}" stroke="#0f172a" stroke-width="4" />
      ${[-25, -15, -5, 5, 15, 25].map(offset => `
        <line x1="${padX + beamW}" y1="${beamY + offset}" x2="${padX + beamW + 10}" y2="${beamY + offset - 8}" stroke="#475569" stroke-width="2" />
      `).join('')}
    `;
  } else if (res.supportType === 'propped_cantilever') {
    // Fixed at A, roller at B
    markup += `
      <line x1="${padX}" y1="${beamY - 30}" x2="${padX}" y2="${beamY + 30}" stroke="#0f172a" stroke-width="4" />
      ${[-25, -15, -5, 5, 15, 25].map(offset => `
        <line x1="${padX}" y1="${beamY + offset}" x2="${padX - 10}" y2="${beamY + offset + 8}" stroke="#475569" stroke-width="2" />
      `).join('')}
      <polygon points="${padX + beamW},${beamY + 3} ${padX + beamW - 10},${beamY + 18} ${padX + beamW + 10},${beamY + 18}" fill="#64748b" />
      <circle cx="${padX + beamW - 6}" cy="${beamY + 22}" r="3" fill="#475569" />
      <circle cx="${padX + beamW + 6}" cy="${beamY + 22}" r="3" fill="#475569" />
      <line x1="${padX + beamW - 14}" y1="${beamY + 26}" x2="${padX + beamW + 14}" y2="${beamY + 26}" stroke="#334155" stroke-width="2" />
    `;
  }

  // Distributed load arrows
  res.distributedLoads.forEach(dl => {
    const x1 = padX + (dl.x1 || 0) * scale;
    const x2 = padX + (dl.x2 !== undefined ? dl.x2 : res.L) * scale;
    const loadW = x2 - x1;
    const uY = beamY - 45;
    markup += `
      <rect x="${x1}" y="${uY}" width="${loadW}" height="35" fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" stroke-dasharray="3,3" />
      <line x1="${x1}" y1="${uY}" x2="${x2}" y2="${uY}" stroke="#2563eb" stroke-width="2" />
      <text x="${(x1 + x2) / 2}" y="${uY - 6}" text-anchor="middle" font-size="11" fill="#2563eb" font-weight="bold">w = ${dl.w} kN/m</text>
    `;
    const numArrows = Math.max(2, Math.floor(loadW / 30));
    for (let i = 0; i <= numArrows; i++) {
      const ax = x1 + (i / numArrows) * loadW;
      markup += `
        <line x1="${ax}" y1="${uY}" x2="${ax}" y2="${beamY - 4}" stroke="#2563eb" stroke-width="1.5" />
        <polygon points="${ax - 3},${beamY - 9} ${ax + 3},${beamY - 9} ${ax},${beamY - 3}" fill="#2563eb" />
      `;
    }
  });

  // Point load arrows
  res.pointLoads.forEach(pl => {
    const px = padX + pl.a * scale;
    const pY = beamY - 55;
    markup += `
      <line x1="${px}" y1="${pY}" x2="${px}" y2="${beamY - 4}" stroke="#dc2626" stroke-width="2.5" />
      <polygon points="${px - 4},${beamY - 11} ${px + 4},${beamY - 11} ${px},${beamY - 3}" fill="#dc2626" />
      <text x="${px}" y="${pY - 6}" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="bold">P = ${pl.P} kN</text>
    `;
  });

  // Reactions
  markup += `
    <text x="${padX}" y="${beamY + 45}" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">RA = ${res.RA.toFixed(1)} kN</text>
  `;
  if (res.supportType !== 'cantilever') {
    markup += `
      <text x="${padX + beamW}" y="${beamY + 45}" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">RB = ${res.RB.toFixed(1)} kN</text>
    `;
  }
  if (Math.abs(res.MA) > 0.01) {
    markup += `
      <text x="${padX - 25}" y="${beamY - 35}" font-size="10" fill="#dc2626" font-weight="bold">MA=${res.MA.toFixed(1)}</text>
    `;
  }

  svg.innerHTML = markup;
}

/**
 * Generic High-Resolution Function Plotter (SFD, BMD, Deflection)
 */
function renderSVGPlot(svgId, xVals, yVals, label, color, zeroCenter) {
  const svg = document.getElementById(svgId);
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 440;
  const viewH = 200;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const padX = 50;
  const padY = 30;
  const plotW = viewW - 2 * padX;
  const plotH = viewH - 2 * padY;

  const N = xVals.length - 1;
  const L = xVals[N];

  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i <= N; i++) {
    if (yVals[i] < minY) minY = yVals[i];
    if (yVals[i] > maxY) maxY = yVals[i];
  }

  if (zeroCenter) {
    const absMax = Math.max(Math.abs(minY), Math.abs(maxY), 1e-4);
    minY = -absMax;
    maxY = absMax;
  } else {
    // For deflection: usually all >= 0 downward
    if (minY > 0) minY = 0;
    if (maxY === minY) maxY = minY + 1;
  }

  const rangeY = maxY - minY;
  const yToPx = (val) => padY + plotH - ((val - minY) / rangeY) * plotH;
  const xToPx = (x) => padX + (x / L) * plotW;

  const baselineY = yToPx(0);

  // Build polygon points
  const points = [];
  points.push(`${padX},${baselineY}`);
  const step = Math.max(1, Math.floor(N / 200)); // Sample ~200 points for crisp SVG
  for (let i = 0; i <= N; i += step) {
    points.push(`${xToPx(xVals[i]).toFixed(1)},${yToPx(yVals[i]).toFixed(1)}`);
  }
  // Ensure last point is included
  points.push(`${xToPx(xVals[N]).toFixed(1)},${yToPx(yVals[N]).toFixed(1)}`);
  points.push(`${padX + plotW},${baselineY}`);

  const polyStr = points.join(' ');

  const markup = `
    <!-- Baseline -->
    <line x1="${padX}" y1="${baselineY}" x2="${padX + plotW}" y2="${baselineY}" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,3" />

    <!-- Area Fill -->
    <polygon points="${polyStr}" fill="${color}" fill-opacity="0.15" />

    <!-- Diagram Curve -->
    <polyline points="${points.slice(1, -1).join(' ')}" fill="none" stroke="${color}" stroke-width="2.5" />

    <!-- Label -->
    <text x="${padX + 5}" y="${padY + 12}" font-size="11" fill="${color}" font-weight="bold">${label}</text>

    <!-- Max & Min Values -->
    <text x="${padX + plotW}" y="${yToPx(maxY) - 4}" text-anchor="end" font-size="10" fill="#334155" font-weight="bold">Max: ${maxY.toFixed(2)}</text>
    <text x="${padX + plotW}" y="${yToPx(minY) + 12}" text-anchor="end" font-size="10" fill="#334155" font-weight="bold">Min: ${minY.toFixed(2)}</text>
  `;

  svg.innerHTML = markup;
}
