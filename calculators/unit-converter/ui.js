/**
 * C11 — Engineering Unit Converter UI Controller
 */

import { UNIT_DEFINITIONS, convertUnits, convertAllInCategory } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'unit-converter';
const STORE_KEY = `ces_tool_${SLUG}`;

const EXAMPLE = {
  category: 'stress',
  fromUnit: 'ksi',
  toUnit: 'MPa',
  value: 1.0
};

let currentInputs = { ...EXAMPLE };

export function initUnitConverterUI() {
  Embed.init(SLUG);

  const urlParams = Share.deserialize();
  const savedState = Store.get(STORE_KEY);

  if (Object.keys(urlParams).length > 0) {
    currentInputs = { ...currentInputs, ...urlParams };
  } else if (savedState) {
    currentInputs = { ...currentInputs, ...savedState };
  }

  setupEventListeners();
  populateCategorySelect();
  updateUnitSelects();
  recalculate();
}

function setupEventListeners() {
  const catSelect = document.getElementById('categorySelect');
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      currentInputs.category = catSelect.value;
      const cat = UNIT_DEFINITIONS[currentInputs.category];
      const keys = Object.keys(cat.units);
      currentInputs.fromUnit = keys[0];
      currentInputs.toUnit = keys[1] || keys[0];
      updateUnitSelects();
      recalculate();
    });
  }

  const valInput = document.getElementById('inputValue');
  if (valInput) {
    valInput.addEventListener('input', () => {
      currentInputs.value = Number(valInput.value) || 0;
      recalculate();
    });
  }

  const fromSel = document.getElementById('fromUnitSelect');
  if (fromSel) {
    fromSel.addEventListener('change', () => {
      currentInputs.fromUnit = fromSel.value;
      recalculate();
    });
  }

  const toSel = document.getElementById('toUnitSelect');
  if (toSel) {
    toSel.addEventListener('change', () => {
      currentInputs.toUnit = toSel.value;
      recalculate();
    });
  }

  const btnSwap = document.getElementById('btnSwapUnits');
  if (btnSwap) {
    btnSwap.addEventListener('click', () => {
      const temp = currentInputs.fromUnit;
      currentInputs.fromUnit = currentInputs.toUnit;
      currentInputs.toUnit = temp;
      updateUnitSelects();
      recalculate();
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

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentInputs.category = btn.dataset.cat;
      currentInputs.fromUnit = btn.dataset.from;
      currentInputs.toUnit = btn.dataset.to;
      currentInputs.value = Number(btn.dataset.val) || 1.0;
      if (catSelect) catSelect.value = currentInputs.category;
      if (valInput) valInput.value = currentInputs.value;
      updateUnitSelects();
      recalculate();
    });
  });
}

function populateCategorySelect() {
  const catSelect = document.getElementById('categorySelect');
  if (!catSelect) return;
  catSelect.innerHTML = Object.keys(UNIT_DEFINITIONS).map(k => `
    <option value="${k}" ${k === currentInputs.category ? 'selected' : ''}>${UNIT_DEFINITIONS[k].name}</option>
  `).join('');
}

function updateUnitSelects() {
  const cat = UNIT_DEFINITIONS[currentInputs.category];
  if (!cat) return;

  const fromSel = document.getElementById('fromUnitSelect');
  const toSel = document.getElementById('toUnitSelect');

  if (fromSel) {
    fromSel.innerHTML = Object.keys(cat.units).map(k => `
      <option value="${k}" ${k === currentInputs.fromUnit ? 'selected' : ''}>${cat.units[k].label}</option>
    `).join('');
  }

  if (toSel) {
    toSel.innerHTML = Object.keys(cat.units).map(k => `
      <option value="${k}" ${k === currentInputs.toUnit ? 'selected' : ''}>${cat.units[k].label}</option>
    `).join('');
  }
}

function recalculate() {
  try {
    const res = convertUnits(currentInputs.value, currentInputs.fromUnit, currentInputs.toUnit, currentInputs.category);
    const outEl = document.getElementById('outputValue');
    const outUnitEl = document.getElementById('outputUnitLabel');
    const cat = UNIT_DEFINITIONS[currentInputs.category];

    if (outEl) {
      outEl.textContent = formatSmartNumber(res);
    }
    if (outUnitEl && cat && cat.units[currentInputs.toUnit]) {
      outUnitEl.textContent = cat.units[currentInputs.toUnit].label;
    }

    renderAllUnitsTable();
    Store.set(STORE_KEY, currentInputs);
  } catch (err) {
    console.error('Conversion error:', err);
  }
}

function renderAllUnitsTable() {
  const tbody = document.getElementById('allUnitsTableBody');
  if (!tbody) return;

  const list = convertAllInCategory(currentInputs.value, currentInputs.fromUnit, currentInputs.category);
  tbody.innerHTML = list.map(item => `
    <tr style="${item.isSource ? 'background: rgba(37, 99, 235, 0.08); font-weight: 700;' : ''}">
      <td>${item.label}</td>
      <td style="font-family: monospace; font-size: 14px; text-align: right;">${formatSmartNumber(item.value)}</td>
      <td style="font-family: monospace; font-size: 13px; color: var(--text-muted); text-align: right;">${item.value.toExponential(4)}</td>
    </tr>
  `).join('');
}

function formatSmartNumber(num) {
  if (Math.abs(num) >= 1e6 || (Math.abs(num) < 1e-4 && num !== 0)) {
    return num.toExponential(6);
  }
  // Trim trailing zeros beyond reasonable precision
  const fixed = num.toFixed(6);
  return parseFloat(fixed).toString();
}
