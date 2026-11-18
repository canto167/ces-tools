/**
 * C7 — Anchorage & Lap Length UI Controller & Scaled SVG Splice
 */

import { calculateAnchorageLapEC2, calculateAnchorageLapBS8110 } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'anchorage-lap';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLE = {
  code: 'EC2', // 'EC2' or 'BS8110'
  barDia: 16,
  fck: 30,
  fcu: 30,
  fyk: 500,
  fy: 500,
  bondCondition: 'good',
  forceType: 'tension',
  alpha1: 1.0,
  alpha2: 1.0,
  alpha3: 1.0,
  alpha4: 1.0,
  alpha5: 1.0,
  alpha6: 1.5,
  rho1: 100
};

let currentInputs = { ...EXAMPLE };
let debounceTimer = null;

export function initAnchorageLapUI() {
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
  // Code toggle
  const codeRadios = document.querySelectorAll('input[name="designCode"]');
  codeRadios.forEach(r => {
    r.addEventListener('change', () => {
      currentInputs.code = r.value;
      updateCodeVisibility();
      triggerRecalc();
    });
  });

  const numericIds = ['fck', 'fcu', 'fyk', 'fy', 'rho1'];
  numericIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      currentInputs[id] = Number(el.value);
      triggerRecalc();
    });

    const step = el.getAttribute('step') ? Number(el.getAttribute('step')) : 5;
    const min = el.getAttribute('min') ? Number(el.getAttribute('min')) : 0;
    UIKit.bindStepper(el, step, min, Infinity, () => triggerRecalc());
  });

  ['bondCondition', 'forceType'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      currentInputs[id] = el.value;
      triggerRecalc();
    });
  });

  // Bar diameter segmented picker
  setupSegmentedPicker('barDia_group', [10, 12, 16, 20, 25, 32], currentInputs.barDia || 16, (dia) => {
    currentInputs.barDia = dia;
    triggerRecalc();
  });

  // Buttons
  const btnExample = document.getElementById('btnLoadExample');
  if (btnExample) {
    btnExample.addEventListener('click', () => {
      currentInputs = { ...EXAMPLE };
      populateUIFromState();
      updateCodeVisibility();
      triggerRecalc();
      UIKit.showToast('Reset to C7 test example');
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

function updateCodeVisibility() {
  const isEC2 = currentInputs.code === 'EC2';
  const ec2Panel = document.getElementById('panel-ec2');
  const bsPanel = document.getElementById('panel-bs8110');
  if (ec2Panel) ec2Panel.style.display = isEC2 ? 'block' : 'none';
  if (bsPanel) bsPanel.style.display = isEC2 ? 'none' : 'block';
}

function setupSegmentedPicker(containerId, options, selectedVal, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const group = UIKit.createSegmentedGroup(containerId, options, selectedVal, onSelect);
  container.appendChild(group);
}

function populateUIFromState() {
  const codeRadios = document.querySelectorAll('input[name="designCode"]');
  codeRadios.forEach(r => {
    r.checked = (r.value === (currentInputs.code || 'EC2'));
  });

  const setValue = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setValue('fck', currentInputs.fck);
  setValue('fcu', currentInputs.fcu);
  setValue('fyk', currentInputs.fyk);
  setValue('fy', currentInputs.fy);
  setValue('rho1', currentInputs.rho1);
  setValue('bondCondition', currentInputs.bondCondition);
  setValue('forceType', currentInputs.forceType);

  setupSegmentedPicker('barDia_group', [10, 12, 16, 20, 25, 32], currentInputs.barDia || 16, (dia) => {
    currentInputs.barDia = dia;
    triggerRecalc();
  });

  updateCodeVisibility();
}

function triggerRecalc() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    recalculate();
    Store.set(STORE_KEY, currentInputs);
  }, 100);
}

function recalculate() {
  const isEC2 = currentInputs.code === 'EC2';
  const ec2Res = calculateAnchorageLapEC2({
    barDia: currentInputs.barDia,
    fck: currentInputs.fck || 30,
    fyk: currentInputs.fyk || 500,
    bondCondition: currentInputs.bondCondition || 'good',
    alpha1: currentInputs.alpha1 || 1.0,
    alpha2: currentInputs.alpha2 || 1.0,
    alpha3: currentInputs.alpha3 || 1.0,
    alpha4: currentInputs.alpha4 || 1.0,
    alpha5: currentInputs.alpha5 || 1.0,
    alpha6: currentInputs.alpha6 || 1.5,
    rho1: currentInputs.rho1 || 100
  });

  const bsRes = calculateAnchorageLapBS8110({
    barDia: currentInputs.barDia,
    fcu: currentInputs.fcu || 30,
    fy: currentInputs.fy || 500,
    forceType: currentInputs.forceType || 'tension'
  });

  renderResults(isEC2 ? ec2Res : bsRes, isEC2, ec2Res, bsRes);
  renderSVGLap(currentInputs, isEC2 ? ec2Res : bsRes, isEC2);
}

function renderResults(res, isEC2, ec2Res, bsRes) {
  const summaryBox = document.getElementById('summaryGrid');
  const stepsContainer = document.getElementById('stepsTableBody');
  const compBody = document.getElementById('compTableBody');

  if (summaryBox) {
    if (isEC2) {
      summaryBox.innerHTML = `
        <div class="summary-item">
          <div class="label">Basic Req Anchorage lb,rqd</div>
          <div class="value">${res.lb_rqd.toFixed(1)} <span style="font-size: 13px;">mm (${res.lb_rqd_phi.toFixed(1)}φ)</span></div>
        </div>
        <div class="summary-item">
          <div class="label">Design Anchorage lbd</div>
          <div class="value">${res.lbd.toFixed(1)} <span style="font-size: 13px;">mm (${res.lbd_phi.toFixed(1)}φ)</span></div>
        </div>
        <div class="summary-item">
          <div class="label">Design Lap Length l0</div>
          <div class="value">${res.l0.toFixed(1)} <span style="font-size: 13px;">mm (${res.l0_phi.toFixed(1)}φ)</span></div>
        </div>
        <div class="summary-item">
          <div class="label">Design Bond Stress fbd</div>
          <div class="value">${res.fbd.toFixed(2)} <span style="font-size: 13px;">N/mm²</span></div>
        </div>
      `;
    } else {
      summaryBox.innerHTML = `
        <div class="summary-item">
          <div class="label">Tension Anchorage Length</div>
          <div class="value">${res.anchorage.toFixed(1)} <span style="font-size: 13px;">mm (${res.anchorage_phi.toFixed(1)}φ)</span></div>
        </div>
        <div class="summary-item">
          <div class="label">Standard Lap (1.0x)</div>
          <div class="value">${res.lap_1_0.toFixed(1)} <span style="font-size: 13px;">mm (${res.lap_1_0_phi.toFixed(1)}φ)</span></div>
        </div>
        <div class="summary-item">
          <div class="label">Top-Cast / Min Cover (1.4x)</div>
          <div class="value">${res.lap_1_4.toFixed(1)} <span style="font-size: 13px;">mm (${res.lap_1_4_phi.toFixed(1)}φ)</span></div>
        </div>
        <div class="summary-item">
          <div class="label">Both Factors Applied (2.0x)</div>
          <div class="value">${res.lap_2_0.toFixed(1)} <span style="font-size: 13px;">mm (${res.lap_2_0_phi.toFixed(1)}φ)</span></div>
        </div>
      `;
    }
  }

  // Steps Table
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

  // Comparison Table
  if (compBody) {
    compBody.innerHTML = `
      <tr>
        <td><strong>Basic Anchorage Length</strong></td>
        <td>${ec2Res.lb_rqd.toFixed(1)} mm (${ec2Res.lb_rqd_phi.toFixed(1)}φ)</td>
        <td>${bsRes.anchorage.toFixed(1)} mm (${bsRes.anchorage_phi.toFixed(1)}φ)</td>
        <td>${((ec2Res.lb_rqd - bsRes.anchorage) / bsRes.anchorage * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td><strong>Design Lap Length (Full Stagger / 1.0x)</strong></td>
        <td>${(ec2Res.lb_rqd * 1.0).toFixed(1)} mm (${(ec2Res.lb_rqd_phi * 1.0).toFixed(1)}φ)</td>
        <td>${bsRes.lap_1_0.toFixed(1)} mm (${bsRes.lap_1_0_phi.toFixed(1)}φ)</td>
        <td>${((ec2Res.lb_rqd - bsRes.lap_1_0) / bsRes.lap_1_0 * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td><strong>Design Lap Length (100% Lapped / 1.4x-1.5x)</strong></td>
        <td>${ec2Res.l0.toFixed(1)} mm (${ec2Res.l0_phi.toFixed(1)}φ) [α₆=1.5]</td>
        <td>${bsRes.lap_1_4.toFixed(1)} mm (${bsRes.lap_1_4_phi.toFixed(1)}φ) [1.4x]</td>
        <td>${((ec2Res.l0 - bsRes.lap_1_4) / bsRes.lap_1_4 * 100).toFixed(1)}%</td>
      </tr>
      <tr>
        <td><strong>Design Bond Strength</strong></td>
        <td>${ec2Res.fbd.toFixed(3)} N/mm² (fbd)</td>
        <td>${bsRes.fbu.toFixed(3)} N/mm² (fbu)</td>
        <td>${((ec2Res.fbd - bsRes.fbu) / bsRes.fbu * 100).toFixed(1)}%</td>
      </tr>
    `;
  }
}

/**
 * Scaled SVG Lap Splice & Anchorage Drawing
 */
function renderSVGLap(input, res, isEC2) {
  const svg = document.getElementById('lapSVG');
  if (!svg) return;

  svg.innerHTML = '';
  const viewW = 440;
  const viewH = 240;
  svg.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);

  const dia = Number(input.barDia) || 16;
  const lapLen = isEC2 ? res.l0 : res.lap_1_4;
  const anchLen = isEC2 ? res.lb_rqd : res.anchorage;

  const barThick = Math.max(6, Math.min(14, dia * 0.5));
  const centerY = viewH / 2;

  const markup = `
    <!-- Concrete element background -->
    <rect x="25" y="45" width="390" height="150" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4" rx="4" />
    <text x="35" y="65" font-size="11" fill="#64748b" font-weight="600">Concrete Member Section</text>

    <!-- Top rebar (Bar 1) -->
    <line x1="45" y1="${centerY - barThick - 3}" x2="310" y2="${centerY - barThick - 3}" stroke="#2563eb" stroke-width="${barThick}" stroke-linecap="round" />
    
    <!-- Bottom rebar (Bar 2 - spliced) -->
    <line x1="130" y1="${centerY + barThick + 3}" x2="395" y2="${centerY + barThick + 3}" stroke="#dc2626" stroke-width="${barThick}" stroke-linecap="round" />

    <!-- Overlap splice dimension -->
    <line x1="130" y1="${centerY - 32}" x2="310" y2="${centerY - 32}" stroke="#0f172a" stroke-width="1.5" />
    <line x1="130" y1="${centerY - 38}" x2="130" y2="${centerY - 26}" stroke="#0f172a" stroke-width="1.5" />
    <line x1="310" y1="${centerY - 38}" x2="310" y2="${centerY - 26}" stroke="#0f172a" stroke-width="1.5" />
    <text x="220" y="${centerY - 40}" text-anchor="middle" font-size="12" fill="#0f172a" font-weight="bold">Lap l₀ = ${lapLen.toFixed(0)} mm (${(lapLen / dia).toFixed(1)}φ)</text>

    <!-- Anchorage length dimension -->
    <line x1="45" y1="${centerY + 42}" x2="310" y2="${centerY + 42}" stroke="#2563eb" stroke-width="1.5" />
    <line x1="45" y1="${centerY + 36}" x2="45" y2="${centerY + 48}" stroke="#2563eb" stroke-width="1.5" />
    <line x1="310" y1="${centerY + 36}" x2="310" y2="${centerY + 48}" stroke="#2563eb" stroke-width="1.5" />
    <text x="175" y="${centerY + 58}" text-anchor="middle" font-size="11" fill="#2563eb" font-weight="600">Anchorage = ${anchLen.toFixed(0)} mm (${(anchLen / dia).toFixed(1)}φ)</text>

    <!-- Bar labels -->
    <text x="50" y="${centerY - barThick - 12}" font-size="11" fill="#2563eb" font-weight="600">Bar A: φ${dia} mm</text>
    <text x="390" y="${centerY + barThick + 22}" text-anchor="end" font-size="11" fill="#dc2626" font-weight="600">Bar B: φ${dia} mm</text>
  `;

  svg.innerHTML = markup;
}
