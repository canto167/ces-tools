/**
 * C6 — Short Braced Column UI Controller & Scaled SVG Section
 */

import { calculateShortColumn } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'short-column';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLE = {
  b: 300,
  h: 300,
  l0: 3.2,
  topEnd: 1,
  bottomEnd: 1,
  N: 1500,
  fcu: 30,
  fy: 500,
  k: 0.70,
  cover: 30,
  barCount: 4,
  barDiam: 20
};

let currentInputs = { ...EXAMPLE };
let debounceTimer = null;

export function initShortColumnUI() {
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
  const numericIds = ['b', 'h', 'l0', 'N', 'fcu', 'fy', 'cover'];
  numericIds.forEach(id => {
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

  ['topEnd', 'bottomEnd', 'k'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      currentInputs[id] = Number(el.value);
      triggerRecalc();
    });
  });

  // Segmented pickers
  setupSegmentedPicker('barCount_group', [4, 6, 8], currentInputs.barCount || 4, (cnt) => {
    currentInputs.barCount = cnt;
    triggerRecalc();
  });

  setupSegmentedPicker('barDiam_group', [16, 20, 25, 32], currentInputs.barDiam || 20, (dia) => {
    currentInputs.barDiam = dia;
    triggerRecalc();
  });

  // Buttons
  const btnExample = document.getElementById('btnLoadExample');
  if (btnExample) {
    btnExample.addEventListener('click', () => {
      currentInputs = { ...EXAMPLE };
      populateUIFromState();
      triggerRecalc();
      UIKit.showToast('Reset to BS-1 worked example');
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

  setValue('b', currentInputs.b);
  setValue('h', currentInputs.h);
  setValue('l0', currentInputs.l0);
  setValue('topEnd', currentInputs.topEnd);
  setValue('bottomEnd', currentInputs.bottomEnd);
  setValue('N', currentInputs.N);
  setValue('fcu', currentInputs.fcu);
  setValue('fy', currentInputs.fy);
  setValue('k', currentInputs.k);
  setValue('cover', currentInputs.cover);

  setupSegmentedPicker('barCount_group', [4, 6, 8], currentInputs.barCount || 4, (cnt) => {
    currentInputs.barCount = cnt;
    triggerRecalc();
  });

  setupSegmentedPicker('barDiam_group', [16, 20, 25, 32], currentInputs.barDiam || 20, (dia) => {
    currentInputs.barDiam = dia;
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
  const out = calculateShortColumn(currentInputs);
  renderResults(out);
  renderSVGColumn(currentInputs, out);
}

function renderResults(out) {
  const container = document.getElementById('checksContainer');
  const summaryBox = document.getElementById('summaryGrid');
  const stepsContainer = document.getElementById('stepsTableBody');
  const alertBox = document.getElementById('errorAlert');

  if (!out.isShort) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerHTML = `<strong>Slender Column Warning:</strong> le/h = ${out.ratio_h.toFixed(1)} or le/b = ${out.ratio_b.toFixed(1)} &ge; 15. Additional moments must be calculated to BS 8110 Cl 3.8.3 (Phase 2).`;
    }
  } else {
    if (alertBox) alertBox.style.display = 'none';
  }

  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-item">
        <div class="label">Effective Height le</div>
        <div class="value">${out.le.toFixed(2)} <span style="font-size: 13px;">m (β = ${out.beta.toFixed(2)})</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Slenderness Ratio</div>
        <div class="value">${Math.max(out.ratio_h, out.ratio_b).toFixed(1)} <span style="font-size: 13px;">${out.isShort ? '(< 15 Short)' : '(&ge; 15 Slender)'}</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Asc Req / Provided</div>
        <div class="value">${out.Asc_prov.toFixed(0)} <span style="font-size: 13px;">mm² (req ${out.Asc_req.toFixed(0)})</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Axial Capacity Ncap</div>
        <div class="value">${out.capacity.toFixed(0)} <span style="font-size: 13px;">kN (N = ${out.inputs.N} kN)</span></div>
      </div>
    `;
  }

  if (container && out.report) {
    container.innerHTML = out.report.checks.map(c => UIKit.renderStatusCard({
      title: c.title,
      clause: c.clause,
      actual: `${typeof c.actual === 'number' ? c.actual.toFixed(1) : c.actual} ${c.unit || ''}`,
      allowable: `${typeof c.allowable === 'number' ? c.allowable.toFixed(1) : c.allowable} ${c.unit || ''}`,
      ratio: c.ratio,
      pass: c.pass
    })).join('');
  }

  if (stepsContainer && out.report) {
    stepsContainer.innerHTML = out.report.steps.map((st, i) => `
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
 * Scaled SVG Section of Rectangular Column
 */
function renderSVGColumn(input, out) {
  const svg = document.getElementById('columnSVG');
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 380;
  const viewH = 320;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const b = Number(input.b) || 300;
  const h = Number(input.h) || 300;
  const cover = Number(input.cover) || 30;
  const barCount = Number(input.barCount) || 4;
  const barDiam = Number(input.barDiam) || 20;
  const linkDia = out.linkDiam || 6;

  const padX = 65;
  const padY = 55;
  const availW = viewW - 2 * padX;
  const availH = viewH - 2 * padY;

  const scale = Math.min(availW / b, availH / h);
  const rectW = b * scale;
  const rectH = h * scale;
  const startX = padX + (availW - rectW) / 2;
  const startY = padY + (availH - rectH) / 2;

  const linkOffset = cover * scale;
  const linkX = startX + linkOffset;
  const linkY = startY + linkOffset;
  const linkW = rectW - 2 * linkOffset;
  const linkH = rectH - 2 * linkOffset;

  // Rebars positioning
  const cornerInset = (cover + linkDia + barDiam / 2) * scale;
  const barPositions = [];
  const leftX = startX + cornerInset;
  const rightX = startX + rectW - cornerInset;
  const topY = startY + cornerInset;
  const botY = startY + rectH - cornerInset;

  if (barCount === 4) {
    barPositions.push([leftX, topY], [rightX, topY], [leftX, botY], [rightX, botY]);
  } else if (barCount === 6) {
    barPositions.push(
      [leftX, topY], [(leftX + rightX) / 2, topY], [rightX, topY],
      [leftX, botY], [(leftX + rightX) / 2, botY], [rightX, botY]
    );
  } else if (barCount === 8) {
    barPositions.push(
      [leftX, topY], [(leftX + rightX) / 2, topY], [rightX, topY],
      [leftX, (topY + botY) / 2], [rightX, (topY + botY) / 2],
      [leftX, botY], [(leftX + rightX) / 2, botY], [rightX, botY]
    );
  } else {
    barPositions.push([leftX, topY], [rightX, topY], [leftX, botY], [rightX, botY]);
  }

  const rBar = Math.max(3.5, (barDiam / 2) * scale);

  const markup = `
    <!-- Concrete section -->
    <rect x="${startX}" y="${startY}" width="${rectW}" height="${rectH}" fill="#e2e8f0" stroke="#0f172a" stroke-width="2.5" rx="3" />
    
    <!-- Transverse link -->
    <rect x="${linkX}" y="${linkY}" width="${linkW}" height="${linkH}" fill="none" stroke="#2563eb" stroke-width="2" rx="6" />

    <!-- Longitudinal rebars -->
    ${barPositions.map(([bx, by]) => `
      <circle cx="${bx}" cy="${by}" r="${rBar}" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.5" />
    `).join('')}

    <!-- Dimension b -->
    <line x1="${startX}" y1="${startY + rectH + 16}" x2="${startX + rectW}" y2="${startY + rectH + 16}" stroke="#475569" stroke-width="1.5" />
    <line x1="${startX}" y1="${startY + rectH + 10}" x2="${startX}" y2="${startY + rectH + 22}" stroke="#475569" stroke-width="1.5" />
    <line x1="${startX + rectW}" y1="${startY + rectH + 10}" x2="${startX + rectW}" y2="${startY + rectH + 22}" stroke="#475569" stroke-width="1.5" />
    <text x="${startX + rectW / 2}" y="${startY + rectH + 30}" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="600">b = ${b} mm</text>

    <!-- Dimension h -->
    <line x1="${startX - 16}" y1="${startY}" x2="${startX - 16}" y2="${startY + rectH}" stroke="#475569" stroke-width="1.5" />
    <line x1="${startX - 22}" y1="${startY}" x2="${startX - 10}" y2="${startY}" stroke="#475569" stroke-width="1.5" />
    <line x1="${startX - 22}" y1="${startY + rectH}" x2="${startX - 10}" y2="${startY + rectH}" stroke="#475569" stroke-width="1.5" />
    <text x="${startX - 24}" y="${startY + rectH / 2 + 4}" text-anchor="end" font-size="11" fill="#1e293b" font-weight="600">h = ${h} mm</text>

    <!-- Axial load arrow -->
    <line x1="${startX + rectW / 2}" y1="12" x2="${startX + rectW / 2}" y2="${startY - 6}" stroke="#dc2626" stroke-width="2.5" />
    <polygon points="${startX + rectW / 2 - 4},${startY - 12} ${startX + rectW / 2 + 4},${startY - 12} ${startX + rectW / 2},${startY - 4}" fill="#dc2626" />
    <text x="${startX + rectW / 2}" y="24" text-anchor="middle" font-size="11" fill="#dc2626" font-weight="bold">N = ${input.N} kN</text>

    <!-- Callouts -->
    <text x="${startX + 8}" y="${startY + 18}" font-size="10" fill="#2563eb" font-weight="600">Link φ${linkDia} @ ${out.linkSpacing} c/c</text>
    <text x="${startX + rectW - 8}" y="${startY + rectH - 12}" text-anchor="end" font-size="10" fill="#dc2626" font-weight="600">${barCount}H${barDiam}</text>
  `;

  svg.innerHTML = markup;
}
