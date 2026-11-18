/**
 * C6 — Short Braced Column (Axial Load) Designer to BS 8110-1:1997
 * Cl 3.8.4.3 (Eq. 38), Cl 3.8.1.5, 3.8.1.6, Table 3.19
 */

import { Bars } from '../../shared/js/core/bars.js';
import { CalculationReport } from '../../shared/js/core/report.js';

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
    k = 0.70,           // Design steel stress factor (0.70 or 0.75)
    cover = 30,         // Nominal concrete cover to links (mm)
    barCount = 4,       // Number of longitudinal bars (even number >= 4)
    barDiam = 20        // Diameter of longitudinal bars (mm)
  } = params;

  const report = new CalculationReport({
    title: 'Short Braced Column Design to BS 8110-1:1997',
    subtitle: `${b}x${h} mm RC Column (BS 8110 Cl 3.8.4.3)`,
    code: 'BS 8110-1:1997'
  });

  report.addStep({
    ref: 'Clause 3.8.1.1',
    description: 'Geometry & Material Properties',
    formula: 'b \\times h, f_{cu}, f_y, l_0',
    values: `b = ${b} mm, h = ${h} mm, f_{cu} = ${fcu} MPa, f_y = ${fy} MPa, l_0 = ${l0} m, k = ${k}`
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

  const Ac = b * h; // mm2
  const N_concrete = (0.4 * fcu * Ac) / 1000; // kN

  // Required steel area from Equation 38: N = 0.4 fcu Ac + k Asc fy
  // Asc,req = (N - 0.4 fcu Ac) / (k fy)
  const N_net = N - N_concrete; // kN
  let Asc_req = 0;
  if (N_net > 0) {
    Asc_req = (N_net * 1000) / (k * fy);
  }

  // Minimum and Maximum steel
  const Asc_min = 0.004 * Ac; // 0.4% Ac
  const Asc_max = 0.06 * Ac;  // 6% Ac

  report.addStep({
    ref: 'Cl 3.8.4.3 Eq 38',
    description: 'Axial Resistance & Required Steel',
    formula: 'N = 0.4 f_{cu} A_c + k A_{sc} f_y \\rightarrow A_{sc,req} = \\frac{N - 0.4 f_{cu} A_c}{k f_y}',
    values: `N = ${N} kN, N_{conc} = ${N_concrete.toFixed(1)} kN, A_{sc,req} = ${Asc_req.toFixed(1)} mm²`
  });

  report.addStep({
    ref: 'Cl 3.12.5.3',
    description: 'Reinforcement Limits',
    formula: '0.4\\% A_c \\le A_{sc} \\le 6.0\\% A_c',
    values: `A_{sc,min} = ${Asc_min.toFixed(1)} mm², A_{sc,max} = ${Asc_max.toFixed(1)} mm²`
  });

  // Provided reinforcement
  const singleBarArea = Bars.area(barDiam);
  const Asc_prov = barCount * singleBarArea;

  const steelPass = Asc_prov >= Math.max(Asc_req, Asc_min) && Asc_prov <= Asc_max;
  report.addCheck({
    title: 'Longitudinal Reinforcement Area',
    ratio: Math.max(Asc_req, Asc_min) / Asc_prov,
    allowable: Asc_prov,
    actual: Math.max(Asc_req, Asc_min),
    unit: 'mm²',
    pass: steelPass,
    clause: 'BS 8110 Cl 3.8.4.3 & 3.12.5.3',
    message: `${barCount}H${barDiam} provided (${Asc_prov.toFixed(1)} mm²)`
  });

  // Capacity with provided steel
  const capacity = (0.4 * fcu * Ac + k * Asc_prov * fy) / 1000; // kN
  const capPass = capacity >= N;

  report.addCheck({
    title: 'Axial Load Capacity',
    ratio: N / capacity,
    allowable: capacity,
    actual: N,
    unit: 'kN',
    pass: capPass,
    clause: 'BS 8110-1:1997 Cl 3.8.4.3',
    message: `N = ${N} kN <= N_cap = ${capacity.toFixed(1)} kN`
  });

  // Short term capacity Nuz (Cl 3.8.3.7)
  const Nuz = (0.45 * fcu * Ac + 0.87 * fy * Asc_prov) / 1000; // kN
  report.addStep({
    ref: 'Cl 3.8.3.7',
    description: 'Short-Term Capacity Nuz',
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
    inputs: { b, h, l0, topEnd, bottomEnd, N, fcu, fy, k, cover, barCount, barDiam },
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
    report
  };
}
