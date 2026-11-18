/**
 * Square Pad Footing Calculation Engine
 * Pure mathematical functions implementing BS 8110-1:1997 Section 3.11.
 */

import { Bars } from '../../shared/js/core/bars.js';
import { CalculationReport } from '../../shared/js/core/report.js';

export function calculatePadFooting(input) {
  const errors = [];
  const warnings = [];
  const report = new CalculationReport();
  const results = {};

  const Gk = Number(input.Gk);
  const Qk = Number(input.Qk);
  const q_all = Number(input.q_all || 200);
  const col_c = Number(input.col_c || 400); // mm
  const B = Number(input.B); // m
  const h = Number(input.h); // mm
  const cover = Number(input.cover || 50); // mm
  const dia = Number(input.bar_dia || 16); // mm
  const spacing = Number(input.bar_spacing || 150); // mm
  const fcu = Number(input.fcu || 30);
  const fy = Number(input.fy || 500);

  // Validation
  if (Gk === undefined || Number.isNaN(Gk) || Gk < 0) errors.push('Dead load Gk must be 0 or positive.');
  if (Qk === undefined || Number.isNaN(Qk) || Qk < 0) errors.push('Imposed load Qk must be 0 or positive.');
  if (!q_all || q_all <= 0) errors.push('Allowable bearing capacity q_all must be greater than 0.');
  if (!B || B <= 0) errors.push('Footing width B must be greater than 0.');
  if (!h || h <= 0) errors.push('Footing thickness h must be greater than 0.');
  if (!col_c || col_c <= 0) errors.push('Column size must be greater than 0.');
  if (col_c >= B * 1000) errors.push('Column size cannot exceed footing width.');

  // Minimum recommended width from service loads (with ~10% self-weight estimate)
  const est_service_load = 1.1 * (Gk + Qk);
  const B_min_bearing = Math.sqrt(est_service_load / q_all);
  results.B_min_bearing = B_min_bearing;

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results, checks: [], steps: [] };
  }

  // 1. Serviceability: Soil Bearing Pressure
  const gamma_conc = 24.0; // kN/m³
  const self_weight = B * B * (h / 1000.0) * gamma_conc;
  const service_pressure = (Gk + Qk + self_weight) / (B * B);

  results.self_weight = self_weight;
  results.service_pressure = service_pressure;

  report.addStep({
    label: 'Footing Self-Weight',
    equation: 'SW = B² * h * γconc',
    substituted: `${B}² * (${h}/1000) * ${gamma_conc}`,
    value: self_weight,
    unit: 'kN',
    clause: 'BS 8110 Cl 3.11.2.1'
  });

  report.addStep({
    label: 'Service Ground Bearing Pressure',
    equation: 'q = (Gk + Qk + SW) / B²',
    substituted: `(${Gk} + ${Qk} + ${self_weight.toFixed(2)}) / ${B}²`,
    value: service_pressure,
    unit: 'kN/m²',
    clause: 'BS 8110 Cl 3.11.2.1'
  });

  report.addCheck({
    name: 'Allowable Ground Bearing Pressure',
    demand: service_pressure,
    capacity: q_all,
    clause: 'BS 8110 Cl 3.11.2.1',
    unit: 'kN/m²'
  });

  // 2. Ultimate Limit State: Design Soil Pressure pu
  const N = 1.4 * Gk + 1.6 * Qk;
  const pu = N / (B * B);

  results.N = N;
  results.pu = pu;

  report.addStep({
    label: 'Factored Ultimate Column Load N',
    equation: 'N = 1.4 * Gk + 1.6 * Qk',
    substituted: `1.4 * ${Gk} + 1.6 * ${Qk}`,
    value: N,
    unit: 'kN',
    clause: 'BS 8110 Cl 2.4.3'
  });

  report.addStep({
    label: 'Ultimate Ground Pressure pu',
    equation: 'pu = N / B²',
    substituted: `${N.toFixed(1)} / ${B}²`,
    value: pu,
    unit: 'kN/m²',
    clause: 'BS 8110 Cl 3.11.2.2'
  });

  // 3. Flexure at Column Face
  const col_c_m = col_c / 1000.0;
  const a = (B - col_c_m) / 2.0; // projection
  const M = (pu * B * a * a) / 2.0; // kNm

  // Average effective depth d for 2 orthogonal layers
  const d = h - cover - dia; // mm
  const B_mm = B * 1000.0;
  const h_mm = h;

  const K = (M * 1e6) / (B_mm * d * d * fcu);
  const z = Math.min(d * (0.5 + Math.sqrt(Math.max(0, 0.25 - K / 0.9))), 0.95 * d);
  const As = (M * 1e6) / (0.87 * fy * z);
  const As_min = 0.0013 * B_mm * h_mm;

  // Provided reinforcement: bars across width B
  const single_bar_area = Bars.area(dia);
  const As_prov = (B_mm / spacing) * single_bar_area;

  results.d = d;
  results.a = a;
  results.M = M;
  results.K = K;
  results.z = z;
  results.As = As;
  results.As_min = As_min;
  results.As_prov = As_prov;

  report.addStep({
    label: 'Cantilever Projection a',
    equation: 'a = (B - c) / 2',
    substituted: `(${B} - ${col_c_m}) / 2`,
    value: a,
    unit: 'm',
    clause: 'BS 8110 Cl 3.11.2.2'
  });

  report.addStep({
    label: 'Design Bending Moment at Column Face',
    equation: 'M = pu * B * a² / 2',
    substituted: `${pu.toFixed(2)} * ${B} * ${a.toFixed(2)}² / 2`,
    value: M,
    unit: 'kNm',
    clause: 'BS 8110 Cl 3.11.2.2'
  });

  report.addStep({
    label: 'Required Flexural Reinforcement As',
    equation: 'As = M / (0.87 * fy * z)',
    substituted: `${M.toFixed(2)} * 10⁶ / (0.87 * ${fy} * ${z.toFixed(1)})`,
    value: As,
    unit: 'mm²',
    clause: 'BS 8110 Cl 3.4.4.4'
  });

  report.addCheck({
    name: 'Flexural Steel Capacity (Both Ways)',
    demand: As,
    capacity: As_prov,
    clause: 'BS 8110 Cl 3.4.4.4',
    unit: 'mm²'
  });

  report.addCheck({
    name: 'Minimum Reinforcement (0.13% Bh)',
    demand: As_min,
    capacity: As_prov,
    clause: 'BS 8110 Cl 3.12.5.3',
    unit: 'mm²'
  });

  // 4. Column Face Shear
  const v_face = (N * 1e3) / (4.0 * col_c * d);
  const v_max = Math.min(0.8 * Math.sqrt(fcu), 5.0);

  results.v_face = v_face;
  results.v_max = v_max;

  report.addStep({
    label: 'Column Perimeter Shear Stress (Face Shear)',
    equation: 'vface = N / (4 * c * d)',
    substituted: `${N.toFixed(1)} * 10³ / (4 * ${col_c} * ${d.toFixed(1)})`,
    value: v_face,
    unit: 'N/mm²',
    clause: 'BS 8110 Cl 3.11.3.1'
  });

  report.addCheck({
    name: 'Column Face Shear (vface ≤ vmax)',
    demand: v_face,
    capacity: v_max,
    clause: 'BS 8110 Cl 3.11.3.1',
    unit: 'N/mm²'
  });

  // 5. Punching Shear at 1.5d from Column Face
  const perim_side_mm = col_c + 3.0 * d;
  const perim_side_m = perim_side_mm / 1000.0;
  const V_punch = N - pu * (perim_side_m * perim_side_m);
  const v_punch = (V_punch * 1e3) / (4.0 * perim_side_mm * d);

  // Concrete shear capacity vc
  const p_prov = Math.min((100.0 * As_prov) / (B_mm * d), 3.0);
  const f_d = Math.max(Math.pow(400.0 / d, 0.25), 1.0); // >= 1.0 for bases without links
  const f_cu = Math.pow(Math.min(fcu, 40.0) / 25.0, 1 / 3);
  const vc = (0.79 / 1.25) * Math.pow(p_prov, 1 / 3) * f_d * f_cu;

  results.perim_side = perim_side_mm;
  results.V_punch = V_punch;
  results.v_punch = v_punch;
  results.vc = vc;

  report.addStep({
    label: '1.5d Punching Perimeter Side',
    equation: 'side = c + 3d',
    substituted: `${col_c} + 3 * ${d.toFixed(1)}`,
    value: perim_side_mm,
    unit: 'mm',
    clause: 'BS 8110 Cl 3.7.7.2'
  });

  report.addStep({
    label: 'Net Punching Shear Force',
    equation: 'Vpunch = N - pu * side²',
    substituted: `${N.toFixed(1)} - ${pu.toFixed(2)} * ${perim_side_m.toFixed(3)}²`,
    value: V_punch,
    unit: 'kN',
    clause: 'BS 8110 Cl 3.7.7.2'
  });

  report.addStep({
    label: 'Design Concrete Shear Capacity vc',
    equation: 'vc = 0.79/1.25 * (100As/bd)^(1/3) * (400/d)^(1/4) * (fcu/25)^(1/3)',
    substituted: `0.632 * (${p_prov.toFixed(3)})^(1/3) * ${f_d.toFixed(3)} * ${f_cu.toFixed(3)}`,
    value: vc,
    unit: 'N/mm²',
    clause: 'BS 8110 Table 3.8'
  });

  report.addCheck({
    name: '1.5d Punching Shear Stress (vpunch ≤ vc)',
    demand: v_punch,
    capacity: vc,
    clause: 'BS 8110 Cl 3.11.3.2',
    unit: 'N/mm²'
  });

  // 6. One-Way Beam Shear at Distance d from Column Face
  const d_m = d / 1000.0;
  const a_minus_d = Math.max(0, a - d_m);
  const V_beam = pu * B * a_minus_d;
  const v_beam = (V_beam * 1e3) / (B_mm * d);

  results.V_beam = V_beam;
  results.v_beam = v_beam;

  report.addStep({
    label: 'Beam Shear Force at Distance d',
    equation: 'Vbeam = pu * B * (a - d)',
    substituted: `${pu.toFixed(2)} * ${B} * (${a.toFixed(2)} - ${d_m.toFixed(3)})`,
    value: V_beam,
    unit: 'kN',
    clause: 'BS 8110 Cl 3.11.4.3'
  });

  report.addCheck({
    name: 'One-Way Beam Shear at d (vbeam ≤ vc)',
    demand: v_beam,
    capacity: vc,
    clause: 'BS 8110 Cl 3.11.4.3',
    unit: 'N/mm²'
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    results,
    checks: report.getChecks(),
    steps: report.getSteps()
  };
}
