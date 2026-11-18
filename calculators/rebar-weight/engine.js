/**
 * C9 — Rebar Weight and Quantity Calculation Engine
 * Exact theoretical density (7850 kg/m3) & site rule-of-thumb (dia^2 / 162)
 */

import { CalculationReport } from '../../shared/js/core/report.js';

export const STEEL_DENSITY = 7850; // kg/m³

export function rebarWeightPerMetre(dia) {
  if (!dia || dia <= 0) return 0;
  return ((Math.PI * dia * dia) / 4) * STEEL_DENSITY * 1e-6; // kg/m
}

export function rebarRuleOfThumb(dia) {
  if (!dia || dia <= 0) return 0;
  return (dia * dia) / 162; // kg/m
}

export function calculateSchedule(rows = [], wastagePct = 0) {
  const report = new CalculationReport({
    title: 'Reinforcement Quantity & Bending Schedule',
    subtitle: 'Bar Cutting Lengths, Weights & Diameter Subtotals',
    code: 'BS 4449 / EN 10080 Steel Specifications'
  });

  const evaluatedRows = [];
  const diameterSummary = {};

  let grandTotalLength = 0;
  let grandTotalWeightKg = 0;

  const errors = [];
  const STANDARD_DIAS = [6, 8, 10, 12, 16, 20, 25, 32, 40];
  const wastageNum = Number(wastagePct);
  if (!Number.isFinite(wastageNum) || wastageNum < 0 || wastageNum > 50) {
    errors.push(`Wastage must be between 0 and 50% (got ${wastagePct}).`);
  }

  rows.forEach((row, idx) => {
    const mark = row.mark || `B${idx + 1}`;
    const dia = Number(row.dia);
    const members = Number(row.members);
    const barsPerMember = Number(row.barsPerMember);
    const length = Number(row.length); // m

    const rowErrors = [];
    if (!STANDARD_DIAS.includes(dia)) rowErrors.push(`bar diameter ${row.dia} is not a standard size`);
    if (!Number.isInteger(members) || members < 1) rowErrors.push('number of members must be a whole number of at least 1');
    if (!Number.isInteger(barsPerMember) || barsPerMember < 1) rowErrors.push('bars per member must be a whole number of at least 1');
    if (!Number.isFinite(length) || length <= 0 || length > 50) rowErrors.push('cut length must be greater than 0 and not more than 50 m');
    if (rowErrors.length) {
      errors.push(`Row ${mark}: ${rowErrors.join('; ')}. This row is left out of the totals.`);
      evaluatedRows.push({ id: row.id || idx + 1, mark, dia, members, barsPerMember, totalBars: 0, length, totalLength: 0, unitWeight: 0, ruleWeight: 0, totalWeightKg: 0, invalid: true });
      return;
    }

    const totalBars = members * barsPerMember;
    const totalLength = totalBars * length; // m
    const unitWeight = rebarWeightPerMetre(dia);
    const ruleWeight = rebarRuleOfThumb(dia);
    const totalWeightKg = totalLength * unitWeight;

    grandTotalLength += totalLength;
    grandTotalWeightKg += totalWeightKg;

    if (!diameterSummary[dia]) {
      diameterSummary[dia] = {
        dia,
        unitWeight,
        ruleWeight,
        totalBars: 0,
        totalLength: 0,
        totalWeightKg: 0
      };
    }
    diameterSummary[dia].totalBars += totalBars;
    diameterSummary[dia].totalLength += totalLength;
    diameterSummary[dia].totalWeightKg += totalWeightKg;

    evaluatedRows.push({
      id: row.id || idx + 1,
      mark,
      dia,
      members,
      barsPerMember,
      totalBars,
      length,
      totalLength,
      unitWeight,
      ruleWeight,
      totalWeightKg
    });
  });

  const wastageSafe = errors.some(e => e.startsWith('Wastage')) ? 0 : wastageNum;
  const wastageMultiplier = 1 + wastageSafe / 100;
  const grandTotalWithWastageKg = grandTotalWeightKg * wastageMultiplier;
  const grandTotalTonnes = grandTotalWithWastageKg / 1000;

  report.addStep({
    ref: 'BS 4449 / EN 10080',
    description: 'Unit Mass Formula',
    formula: 'w = \\left(\\frac{\\pi \\phi^2}{4}\\right) \\cdot 7850 \\times 10^{-6} \\text{ kg/m}, \\quad w_{site} \\approx \\frac{\\phi^2}{162}',
    values: 'Standard bar densities calculated across schedule'
  });

  report.addStep({
    ref: 'Bar Schedule Aggregation',
    description: 'Total Steel Weight',
    formula: 'W = \\sum (L_{tot} \\cdot w) \\times (1 + \\text{wastage})',
    values: `Total Length = ${grandTotalLength.toFixed(1)} m, Base Weight = ${grandTotalWeightKg.toFixed(1)} kg, With ${wastagePct}% Wastage = ${grandTotalWithWastageKg.toFixed(1)} kg (${grandTotalTonnes.toFixed(3)} t)`
  });

  return {
    rows: evaluatedRows,
    diameterSummary: Object.values(diameterSummary).sort((a, b) => a.dia - b.dia),
    grandTotalLength,
    grandTotalWeightKg,
    wastagePct: wastageSafe,
    ok: errors.length === 0,
    errors,
    grandTotalWithWastageKg,
    grandTotalTonnes,
    report
  };
}
