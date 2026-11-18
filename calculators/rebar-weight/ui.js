/**
 * C9 — Rebar Weight and Quantity Schedule UI Controller & CSV Exporter
 */

import { calculateSchedule, rebarWeightPerMetre, rebarRuleOfThumb } from './engine.js';
import { UIKit } from '../../shared/js/core/ui-kit.js';
import { Share } from '../../shared/js/core/share.js';
import { Store } from '../../shared/js/core/store.js';
import { Embed } from '../../shared/js/core/embed.js';

const SLUG = 'rebar-weight';
const STORE_KEY = `ces_tool_${SLUG}`;

const INITIAL_ROWS = [
  { id: 1, mark: '01', dia: 16, members: 10, barsPerMember: 4, length: 6.0 },
  { id: 2, mark: '02', dia: 20, members: 5, barsPerMember: 2, length: 7.5 },
  { id: 3, mark: '03', dia: 12, members: 20, barsPerMember: 8, length: 2.4 }
];

let currentRows = [...INITIAL_ROWS];
let wastagePct = 5;
let nextId = 4;

export function initRebarWeightUI() {
  Embed.init(SLUG);

  const urlParams = Share.deserialize();
  const savedState = Store.get(STORE_KEY);

  if (urlParams && urlParams.rows) {
    try {
      currentRows = JSON.parse(decodeURIComponent(urlParams.rows));
      wastagePct = Number(urlParams.wastage) || 0;
    } catch (e) {
      currentRows = [...INITIAL_ROWS];
    }
  } else if (savedState && savedState.rows) {
    currentRows = savedState.rows;
    wastagePct = savedState.wastagePct || 5;
  }

  setupEventListeners();
  renderUnitWeightTable();
  recalculate();
}

function setupEventListeners() {
  const btnAdd = document.getElementById('btnAddRow');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      currentRows.push({
        id: nextId++,
        mark: `B${nextId}`,
        dia: 16,
        members: 1,
        barsPerMember: 1,
        length: 6.0
      });
      recalculate();
    });
  }

  const wastageInput = document.getElementById('wastagePct');
  if (wastageInput) {
    wastageInput.value = wastagePct;
    wastageInput.addEventListener('input', () => {
      wastagePct = Number(wastageInput.value) || 0;
      recalculate();
    });
  }

  const btnReset = document.getElementById('btnLoadExample');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      currentRows = [
        { id: 1, mark: '01', dia: 16, members: 10, barsPerMember: 4, length: 6.0 }
      ];
      wastagePct = 0;
      if (wastageInput) wastageInput.value = 0;
      recalculate();
      UIKit.showToast('Reset to acceptance test case (10x4x6m H16)');
    });
  }

  const btnExport = document.getElementById('btnExportCSV');
  if (btnExport) {
    btnExport.addEventListener('click', exportToCSV);
  }

  const btnShare = document.getElementById('btnCopyLink');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      const state = {
        rows: encodeURIComponent(JSON.stringify(currentRows)),
        wastage: wastagePct
      };
      const link = Share.getShareableLink(state);
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
}

function recalculate() {
  const result = calculateSchedule(currentRows, wastagePct);
  renderScheduleTable(result);
  renderSummary(result);
  Store.set(STORE_KEY, { rows: currentRows, wastagePct });
}

function renderScheduleTable(result) {
  const tbody = document.getElementById('scheduleTableBody');
  if (!tbody) return;

  tbody.innerHTML = result.rows.map(row => `
    <tr>
      <td>
        <input type="text" class="form-input form-input-sm" value="${row.mark}" style="width:70px;" onchange="window.cesUpdateRow(${row.id}, 'mark', this.value)" />
      </td>
      <td>
        <select class="form-select form-select-sm" style="width:75px;" onchange="window.cesUpdateRow(${row.id}, 'dia', Number(this.value))">
          ${[6, 8, 10, 12, 16, 20, 25, 32, 40].map(d => `
            <option value="${d}" ${d === row.dia ? 'selected' : ''}>φ${d}</option>
          `).join('')}
        </select>
      </td>
      <td>
        <input type="number" class="form-input form-input-sm" value="${row.members}" min="1" step="1" style="width:70px;" onchange="window.cesUpdateRow(${row.id}, 'members', Number(this.value))" />
      </td>
      <td>
        <input type="number" class="form-input form-input-sm" value="${row.barsPerMember}" min="1" step="1" style="width:70px;" onchange="window.cesUpdateRow(${row.id}, 'barsPerMember', Number(this.value))" />
      </td>
      <td>
        <input type="number" class="form-input form-input-sm" value="${row.length}" min="0.1" step="0.1" style="width:80px;" onchange="window.cesUpdateRow(${row.id}, 'length', Number(this.value))" />
      </td>
      <td style="font-weight:600; text-align:right;">${row.totalLength.toFixed(1)} m</td>
      <td style="color:var(--text-muted); font-size:12px; text-align:right;">${row.unitWeight.toFixed(3)}</td>
      <td style="font-weight:700; text-align:right;">${row.totalWeightKg.toFixed(1)} kg</td>
      <td class="no-print" style="text-align:center;">
        <button type="button" class="btn btn-sm btn-outline-danger" onclick="window.cesDeleteRow(${row.id})">✕</button>
      </td>
    </tr>
  `).join('');
}

window.cesUpdateRow = function(id, field, value) {
  const row = currentRows.find(r => r.id === id);
  if (row) {
    row[field] = value;
    recalculate();
  }
};

window.cesDeleteRow = function(id) {
  if (currentRows.length <= 1) {
    UIKit.showToast('Schedule must contain at least one row');
    return;
  }
  currentRows = currentRows.filter(r => r.id !== id);
  recalculate();
};

function renderSummary(result) {
  const summaryBox = document.getElementById('summaryGrid');
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div class="summary-item">
        <div class="label">Total Bar Length</div>
        <div class="value">${result.grandTotalLength.toFixed(1)} <span style="font-size: 13px;">metres</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Theoretical Steel Mass</div>
        <div class="value">${result.grandTotalWeightKg.toFixed(1)} <span style="font-size: 13px;">kg (${(result.grandTotalWeightKg / 1000).toFixed(3)} t)</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Wastage Allowance</div>
        <div class="value">${result.wastagePct}% <span style="font-size: 13px;">(+${(result.grandTotalWithWastageKg - result.grandTotalWeightKg).toFixed(1)} kg)</span></div>
      </div>
      <div class="summary-item">
        <div class="label">Grand Total Steel Tonnage</div>
        <div class="value">${result.grandTotalTonnes.toFixed(3)} <span style="font-size: 13px;">tonnes (${result.grandTotalWithWastageKg.toFixed(1)} kg)</span></div>
      </div>
    `;
  }

  // Diameter Subtotals Table
  const diaTbody = document.getElementById('diaSubtotalBody');
  if (diaTbody) {
    diaTbody.innerHTML = result.diameterSummary.map(ds => `
      <tr>
        <td><strong>φ${ds.dia} mm</strong></td>
        <td>${ds.unitWeight.toFixed(4)} kg/m</td>
        <td>${ds.ruleWeight.toFixed(3)} kg/m</td>
        <td style="text-align:right;">${ds.totalBars}</td>
        <td style="text-align:right; font-weight:600;">${ds.totalLength.toFixed(1)} m</td>
        <td style="text-align:right; font-weight:700;">${ds.totalWeightKg.toFixed(1)} kg</td>
        <td style="text-align:right; font-weight:700;">${(ds.totalWeightKg / 1000).toFixed(3)} t</td>
      </tr>
    `).join('');
  }
}

function renderUnitWeightTable() {
  const tbody = document.getElementById('unitWeightBody');
  if (!tbody) return;

  const dias = [6, 8, 10, 12, 16, 20, 25, 32, 40];
  tbody.innerHTML = dias.map(d => {
    const exact = rebarWeightPerMetre(d);
    const rule = rebarRuleOfThumb(d);
    const diff = ((rule - exact) / exact) * 100;
    return `
      <tr>
        <td><strong>φ${d}</strong></td>
        <td>${exact.toFixed(4)} kg/m</td>
        <td>${rule.toFixed(3)} kg/m</td>
        <td style="color:${Math.abs(diff) < 0.5 ? '#16a34a' : '#d97706'}; font-weight:600;">${diff > 0 ? '+' : ''}${diff.toFixed(2)}%</td>
      </tr>
    `;
  }).join('');
}

function exportToCSV() {
  const res = calculateSchedule(currentRows, wastagePct);
  let csv = 'Bar Mark,Diameter (mm),Members,Bars/Member,Length (m),Total Length (m),Unit Weight (kg/m),Total Weight (kg)\n';

  res.rows.forEach(r => {
    csv += `"${r.mark}",${r.dia},${r.members},${r.barsPerMember},${r.length.toFixed(2)},${r.totalLength.toFixed(2)},${r.unitWeight.toFixed(4)},${r.totalWeightKg.toFixed(2)}\n`;
  });

  csv += '\nDiameter Breakdown:\nDiameter (mm),Unit Weight (kg/m),Total Bars,Total Length (m),Total Weight (kg),Total Weight (tonnes)\n';
  res.diameterSummary.forEach(ds => {
    csv += `φ${ds.dia},${ds.unitWeight.toFixed(4)},${ds.totalBars},${ds.totalLength.toFixed(2)},${ds.totalWeightKg.toFixed(2)},${(ds.totalWeightKg / 1000).toFixed(3)}\n`;
  });

  csv += `\nGrand Totals:\nTotal Length (m),${res.grandTotalLength.toFixed(2)}\nTheoretical Weight (kg),${res.grandTotalWeightKg.toFixed(2)}\nWastage (%),${res.wastagePct}%\nGrand Total Weight (kg),${res.grandTotalWithWastageKg.toFixed(2)}\nGrand Total Tonnes,${res.grandTotalTonnes.toFixed(3)}\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rebar_schedule_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  UIKit.showToast('CSV schedule exported');
}
