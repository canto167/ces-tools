/**
 * C6 — Short Braced Column (Axial Load) Designer to BS 8110-1:1997
 * Cl 3.8.4.3 (Eq. 38), Cl 3.8.4.4 (Eq. 39), Cl 3.8.1.3, 3.8.1.6, Table 3.19
 *
 * Checked against BS 8110-1:1997 incorporating Amendments 1-4:
 *   Eq 38 (Cl 3.8.4.3, column cannot be subjected to significant moments): N = 0.4 fcu Ac + 0.75 Asc fy
 *   Eq 39 (Cl 3.8.4.4, short braced column, approximately symmetrical beams, UDL, spans within 15%):
 *         N = 0.35 fcu Ac + 0.67 Asc fy
 *   Ac = NET cross-sectional area of concrete (Cl 3.8.1.1), i.e. b h - Asc.
 */

import { Bars } from '../../shared/js/core/bars.js';
import { CalculationReport } from '../../shared/js/core/report.js';
import { Validate } from '../../shared/js/core/validate.js';

// Table 3.19: β values for braced columns
// Rows: Top end condition 1, 2, 3
// Columns: Bottom end condition 1, 2, 3
export const BETA_TABLE_BRACED = [
  [0.75, 0.80, 0.90],
  [0.80, 0.85, 0.95],
  [0.90, 0.95, 1.00]
];

export function getBeta(topEnd, bottomEnd) {
  const t = Math.max(1, Math.min(3, parseInt(topEnd, 10))) - 1;
  const b = Math.max(1, Math.min(3, parseInt(bottomEnd, 10))) - 1;
  return BETA_TABLE_BRACED[t][b];
}

export function calculateShortColumn(params) {
  const {
    b = 300,            // Column width (mm)
    h = 300,            // Column depth (mm)
    l0 = 3.2,           // Clear height between restraints (m)
    topEnd = 1,         // Top end condition (1, 2, 3)
    bottomEnd = 1,      // Bottom end condition (1, 2, 3)
    N = 1500,           // Design ultimate axial load (kN)
    fcu = 30,           // Concrete characteristic cube strength (N/mm2)
    fy = 500,           // Reinforcement characteristic yield strength (N/mm2)
    equation = 'eq38',  // 'eq38' (Cl 3.8.4.3) or 'eq39' (Cl 3.8.4.4)
    cover = 30,         // Nominal concrete cover to links (mm)
    barCount = 4,       // Number of longitudinal bars (even number >= 4)
    barDiam = 20        // Diameter of longitudinal bars (mm)
  } = params;

  const errors = [];
  const warnings = [];

  // 1. Input Guards (STRUCT-Agent & Codex Hardening)
  if (!Validate.isNumber(b) || b < 150) errors.push(`Column width b must be at least 150 mm (got ${b}).`);
  if (!Validate.isNumber(h) || h < 150) errors.push(`Column depth h must be at least 150 mm (got ${h}).`);
  if (!Validate.isNumber(l0) || l0 <= 0) errors.push(`Clear column height l0 must be greater than 0 m (got ${l0}).`);
  if (!Validate.isNumber(N) || N <= 0) errors.push(`Design ultimate axial load N must be greater than 0 kN (got ${N}).`);

  const coverCheck = Validate.coverSanity(cover, b, h);
  if (!coverCheck.valid) errors.push(coverCheck.error);

  const concCheck = Validate.concreteStrength(fcu, 'BS8110');
  if (!concCheck.valid) errors.push(concCheck.error);

  const steelCheck = Validate.steelStrength(fy, 'Column steel yield strength');
  if (!steelCheck.valid) errors.push(steelCheck.error);
  [['Top end condition', topEnd], ['Bottom end condition', bottomEnd]].forEach(([name, v]) => {
    if (![1, 2, 3].includes(Number(v))) errors.push(`${name} must be 1, 2 or 3 (BS 8110 Cl 3.8.1.6), got ${v}.`);
  });
  const EQ = {
    eq38: { kc: 0.40, ks: 0.75, ref: 'Cl 3.8.4.3 Eq 38', name: 'Eq 38 (no significant moments)' },
    eq39: { kc: 0.35, ks: 0.67, ref: 'Cl 3.8.4.4 Eq 39', name: 'Eq 39 (approximately symmetrical beams)' }
  };
  if (!EQ[equation]) errors.push(`Equation must be eq38 or eq39 (got ${equation}).`);
  if (!Validate.isNumber(barCount) || barCount < 4 || barCount % 2 !== 0) errors.push(`Number of bars must be an even number of at least 4 (got ${barCount}).`);
  if (!Validate.isNumber(barDiam) || barDiam < 12 || barDiam > 40) errors.push(`Bar diameter must be between 12 and 40 mm (got ${barDiam}).`);

  warnings.push('Scope: Short braced axial column checker (BS 8110 Cl 3.8.4.3). Predominantly axial loading with nominal eccentricity (e_min = 0.05h <= 20mm). Excludes slender columns and significant applied moments.');

  const report = new CalculationReport({
    title: 'Short Braced Column Design to BS 8110-1:1997',
    subtitle: `${b}x${h} mm RC Column (BS 8110 Cl 3.8.4.3)`,
    code: 'BS 8110-1:1997'
  });

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results: {}, checks: [], steps: [] };
  }

  report.addStep({
    ref: 'Clause 3.8.1.1',
    description: 'Geometry & Material Properties',
    formula: 'b \\times h, f_{cu}, f_y, l_0',
    values: `b = ${b} mm, h = ${h} mm, f_{cu} = ${fcu} MPa, f_y = ${fy} MPa, l_0 = ${l0} m, ${EQ[equation].name}`
  });

  // Effective height and slenderness
  const beta = getBeta(topEnd, bottomEnd);
  const le = beta * l0; // m
  const le_mm = le * 1000;

  const ratio_h = le_mm / h;
  const ratio_b = le_mm / b;
  const isShort = ratio_h < 15.0 && ratio_b < 15.0;

  report.addStep({
    ref: 'Table 3.19',
    description: 'Effective Height Factor β',
    formula: '\\beta = f(\\text{Top End}, \\text{Bottom End})',
    values: `Top=${topEnd}, Bottom=${bottomEnd} \\rightarrow \\beta = ${beta.toFixed(2)}, l_e = ${le.toFixed(2)} m`
  });

  report.addStep({
    ref: 'Clause 3.8.1.5',
    description: 'Slenderness Check',
    formula: 'l_e / h < 15 \\text{ and } l_e / b < 15',
    values: `l_e/h = ${ratio_h.toFixed(1)}, l_e/b = ${ratio_b.toFixed(1)} \\rightarrow ${isShort ? 'Short Column' : 'Slender Column'}`
  });

  report.addCheck({
    title: 'Slenderness Assessment',
    ratio: Math.max(ratio_h, ratio_b) / 15.0,
    allowable: 15.0,
    actual: Math.max(ratio_h, ratio_b),
    unit: '',
    pass: isShort,
    clause: 'BS 8110-1:1997 Cl 3.8.1.5',
    message: isShort ? 'Short column verified (< 15)' : 'Slender column (>= 15) - additional moments required (Phase 2)'
  });

  const { kc, ks, ref: eqRef } = EQ[equation];
  if (equation === 'eq39') {
    warnings.push('Eq 39 applies only when the beams are designed for uniformly distributed imposed loads and their spans differ by no more than 15% of the longer (BS 8110 Cl 3.8.4.4).');
  } else {
    warnings.push('Eq 38 applies only where, due to the nature of the structure, the column cannot be subjected to significant moments (BS 8110 Cl 3.8.4.3). For a column supporting an approximately symmetrical arrangement of beams use Eq 39.');
  }

  const Ag = b * h; // gross area, mm2
  // Provided reinforcement
  const singleBarArea = Bars.area(barDiam);
  const Asc_prov = barCount * singleBarArea;
  const Ac = Ag - Asc_prov; // net concrete area (Cl 3.8.1.1)

  // Required steel: N = kc fcu (Ag - Asc) + ks Asc fy  ->  Asc = (N - kc fcu Ag) / (ks fy - kc fcu)
  const N_concrete = (kc * fcu * Ag) / 1000; // kN, concrete alone on the gross area
  const N_net = N - N_concrete; // kN
  let Asc_req = 0;
  if (N_net > 0) {
    Asc_req = (N_net * 1000) / (ks * fy - kc * fcu);
  }

  // Minimum and maximum steel (Cl 3.12.5.3 / 3.12.6.2), on the gross section
  const Asc_min = 0.004 * Ag; // 0.4%
  const Asc_max = 0.06 * Ag;  // 6% (10% at laps)

  report.addStep({
    ref: eqRef,
    description: 'Axial Resistance & Required Steel',
    formula: `N = ${kc} f_{cu} A_c + ${ks} A_{sc} f_y, \\; A_c = bh - A_{sc} \\rightarrow A_{sc,req} = \\frac{N - ${kc} f_{cu} bh}{${ks} f_y - ${kc} f_{cu}}`,
    values: `N = ${N} kN, ${kc} f_{cu} bh = ${N_concrete.toFixed(1)} kN, A_{sc,req} = ${Asc_req.toFixed(1)} mm²`
  });

  report.addStep({
    ref: 'Cl 3.12.5.3',
    description: 'Reinforcement Limits',
    formula: '0.4\\% A_{c,gross} \\le A_{sc} \\le 6.0\\% A_{c,gross}',
    values: `A_{sc,min} = ${Asc_min.toFixed(1)} mm², A_{sc,max} = ${Asc_max.toFixed(1)} mm²`
  });

  const steelPass = Asc_prov >= Math.max(Asc_req, Asc_min) && Asc_prov <= Asc_max;
  report.addCheck({
    title: 'Longitudinal Reinforcement Area',
    ratio: Math.max(Asc_req, Asc_min) / Asc_prov,
    allowable: Asc_prov,
    actual: Math.max(Asc_req, Asc_min),
    unit: 'mm²',
    pass: steelPass,
    clause: `BS 8110 ${eqRef} & Cl 3.12.5.3`,
    message: `${barCount}H${barDiam} provided (${Asc_prov.toFixed(1)} mm²)`
  });

  // Capacity with provided steel (net concrete area)
  const capacity = (kc * fcu * Ac + ks * Asc_prov * fy) / 1000; // kN
  const capPass = capacity >= N;

  report.addCheck({
    title: 'Axial Load Capacity',
    ratio: N / capacity,
    allowable: capacity,
    actual: N,
    unit: 'kN',
    pass: capPass,
    clause: `BS 8110-1:1997 ${eqRef}`,
    message: `N = ${N} kN ${capPass ? '<=' : '>'} N_cap = ${capacity.toFixed(1)} kN`
  });

  // Short term capacity Nuz (Cl 3.8.3.1, net concrete area)
  const Nuz = (0.45 * fcu * Ac + 0.87 * fy * Asc_prov) / 1000; // kN (Cl 3.8.3.1)
  report.addStep({
    ref: 'Cl 3.8.3.1',
    description: 'Axial Capacity Nuz (for reference)',
    formula: 'N_{uz} = 0.45 f_{cu} A_c + 0.87 f_y A_{sc}',
    values: `N_{uz} = ${Nuz.toFixed(1)} kN`
  });

  // Nominal eccentricity (Cl 3.8.2.4)
  const emin = Math.min(0.05 * h, 20); // mm
  report.addStep({
    ref: 'Cl 3.8.2.4',
    description: 'Minimum Eccentricity',
    formula: 'e_{min} = \\min(0.05 h, 20\\text{ mm})',
    values: `e_{min} = ${emin.toFixed(1)} mm`
  });

  // Transverse links (Cl 3.12.7.1)
  const minLinkDiam = Math.max(6, Math.ceil(barDiam / 4));
  // Round to nearest standard link diameter: 6, 8, 10, 12
  const linkDiam = [6, 8, 10, 12].find(d => d >= minLinkDiam) || 12;
  const maxLinkSpacing = Math.min(12 * barDiam, b, h);

  report.addStep({
    ref: 'Cl 3.12.7.1',
    description: 'Containment Links',
    formula: '\\phi_{link} \\ge \\max(6\\text{ mm}, \\phi/4), s_v \\le \\min(12\\phi, b, h)',
    values: `Link \\phi = ${linkDiam} mm, spacing \\le ${maxLinkSpacing} mm`
  });

  return {
    inputs: { b, h, l0, topEnd, bottomEnd, N, fcu, fy, equation, cover, barCount, barDiam },
    equation,
    Ag,
    beta,
    le,
    ratio_h,
    ratio_b,
    isShort,
    Ac,
    N_concrete,
    Asc_req,
    Asc_min,
    Asc_max,
    Asc_prov,
    capacity,
    Nuz,
    emin,
    linkDiam,
    linkSpacing: maxLinkSpacing,
    status: isShort && capPass && steelPass ? 'PASS' : 'FAIL',
    ok: errors.length === 0,
    errors,
    warnings,
    checks: report.getChecks(),
    steps: report.getSteps(),
    report
  };
}
