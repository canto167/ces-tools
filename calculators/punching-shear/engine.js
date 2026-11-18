/**
 * Punching Shear (Eurocode 2 EN 1992-1-1 Cl 6.4) Engine
 * Hardened with strict statutory guards, explicit warnings, and non-silent capping.
 */

import { Bars } from '../../shared/js/core/bars.js';
import { CalculationReport } from '../../shared/js/core/report.js';
import { Validate } from '../../shared/js/core/validate.js';

export function calculatePunchingShear(input) {
  const errors = [];
  const warnings = [];
  const report = new CalculationReport();
  const results = {};

  const col_shape = input.col_shape || 'rectangular';
  const col_type = input.col_type || 'internal';
  const c1 = Number(input.c1 || 400);
  const c2 = Number(input.c2 || c1);
  const d = Number(input.d);
  const VEd = Number(input.VEd); // kN
  const fck = Number(input.fck || 30);
  const rho_l_input = Number(input.rho_l !== undefined ? input.rho_l : 0.0075);
  const fywk = Number(input.fywk || 500);
  const link_dia = Number(input.link_dia || 10);
  const vrdmax_factor = Number(input.vrdmax_factor !== undefined ? input.vrdmax_factor : 0.4);

  // Simplified beta or user specified
  let beta = Number(input.beta);
  if (!beta || beta <= 0) {
    if (col_type === 'edge') beta = 1.40;
    else if (col_type === 'corner') beta = 1.50;
    else beta = 1.15; // internal
  }

  // 1. Validation Guards (STRUCT-Agent & Codex Hardening)
  if (!Validate.isNumber(d) || d < 50) {
    errors.push(`Mean effective depth d must be at least 50 mm (got ${d}).`);
  }
  if (!Validate.isNumber(VEd) || VEd <= 0) {
    errors.push(`Design shear force VEd must be a positive number greater than 0 kN (got ${VEd}).`);
  }
  if (!Validate.isNumber(c1) || c1 < 100) {
    errors.push(`Column dimension c1 must be at least 100 mm (got ${c1}).`);
  }
  if (col_shape === 'rectangular' && (!Validate.isNumber(c2) || c2 < 100)) {
    errors.push(`Column dimension c2 must be at least 100 mm (got ${c2}).`);
  }

  // Material strength guards
  const fckCheck = Validate.concreteStrength(fck, 'EC2');
  if (!fckCheck.valid) {
    errors.push(fckCheck.error);
  } else if (fck > 50) {
    warnings.push(`Concrete strength fck (${fck} N/mm²) exceeds 50 N/mm²; high-strength concrete reduction factors may apply.`);
  }

  const fyCheck = Validate.steelStrength(fywk, 'Link yield strength fywk');
  if (!fyCheck.valid) {
    errors.push(fyCheck.error);
  }

  // Beta factor range validation
  const betaCheck = Validate.punchingBeta(beta);
  if (!betaCheck.valid) {
    errors.push(betaCheck.error);
  }

  // vRd,max factor validation
  if (!Validate.isNumber(vrdmax_factor) || vrdmax_factor < 0.25 || vrdmax_factor > 0.60) {
    errors.push(`vRd,max factor (${vrdmax_factor}) is outside practical National Annex range [0.25, 0.60] (default EN is 0.40, UK NA is 0.50).`);
  }

  // Rebar ratio check (anti-silent-clamping)
  if (!Validate.isNumber(rho_l_input) || rho_l_input < 0) {
    errors.push(`Tension rebar ratio rho_l cannot be negative.`);
  }

  // Scope & advisory warnings
  warnings.push('Scope: Eurocode 2 Cl 6.4 flat slab punching shear at column support. Excludes prestressed slabs, foundation slabs with non-uniform soil pressure, drop panels, and shear heads.');
  warnings.push('Openings within 6d of the column face must be checked manually per EC2 Cl 6.4.2(3).');

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results, checks: [], steps: [] };
  }

  // 2. Concrete shear resistance rebar ratio handling (Explicit Warning instead of Silent Clamping)
  let rho_l = rho_l_input;
  if (rho_l_input > 0.02) {
    warnings.push(`Reinforcement ratio rho_l (${(rho_l_input * 100).toFixed(2)}%) exceeds Eurocode 2 Cl 6.4.4(1) maximum design limit of 2.0%. Capped at 0.02 for shear capacity calculation.`);
    rho_l = 0.02;
  }

  // 1. Column face perimeter u0
  let u0 = 0;
  if (col_shape === 'circular') {
    u0 = Math.PI * c1;
  } else {
    u0 = 2 * (c1 + c2);
  }

  // Shear stress at column face vEd,0
  const vEd_0 = (beta * VEd * 1e3) / (u0 * d);

  // Maximum crushing resistance vRd,max (Cl 6.4.5(3))
  const nu = 0.6 * (1.0 - fck / 250.0);
  const fcd = fck / 1.5;
  const vRd_max = vrdmax_factor * nu * fcd;

  // 2. Basic control perimeter u1 at 2d (Cl 6.4.2)
  let u1 = 0;
  if (col_shape === 'circular') {
    u1 = Math.PI * (c1 + 4 * d);
  } else {
    u1 = 2 * (c1 + c2) + 4 * Math.PI * d;
  }

  // Shear stress at control perimeter vEd,1
  const vEd_1 = (beta * VEd * 1e3) / (u1 * d);

  // 3. Concrete shear resistance without links vRd,c (Cl 6.4.4)
  const k = Math.min(1.0 + Math.sqrt(200.0 / d), 2.0);
  const v_calc = 0.12 * k * Math.pow(100.0 * rho_l * fck, 1 / 3);
  const v_min = 0.035 * Math.pow(k, 1.5) * Math.sqrt(fck);
  const vRd_c = Math.max(v_calc, v_min);

  // 4. Punching Shear Reinforcement (Cl 6.4.5(1))
  const fywd = fywk / 1.15;
  const fywd_ef = Math.min(250.0 + 0.25 * d, fywd);

  const needsLinks = vEd_1 > vRd_c;
  let Asw_sr = 0;
  let sr_max = 0.75 * d;
  let sr = Number(input.sr) || Math.min(150, sr_max);
  let Asw_per_perimeter = 0;
  let single_bar_area = Bars.area(link_dia);
  let legs_per_perimeter = 0;

  if (needsLinks) {
    Asw_sr = ((vEd_1 - 0.75 * vRd_c) * u1) / (1.5 * fywd_ef);
    Asw_per_perimeter = Asw_sr * sr;
    legs_per_perimeter = Math.ceil(Asw_per_perimeter / single_bar_area);
  }

  // 5. Outer perimeter u_out where links are no longer required (Cl 6.4.5(4))
  const uout = (beta * VEd * 1e3) / (vRd_c * d);
  let r_out = 0;
  if (col_shape === 'circular') {
    r_out = (uout / Math.PI - c1) / 2.0;
  } else {
    r_out = (uout - 2 * (c1 + c2)) / (2 * Math.PI);
  }
  const last_perim_dist = Math.max(0, r_out - 1.5 * d);
  const first_perim_min = 0.3 * d;
  const first_perim_max = 0.5 * d;

  results.u0 = u0;
  results.vEd_0 = vEd_0;
  results.vRd_max = vRd_max;
  results.u1 = u1;
  results.vEd_1 = vEd_1;
  results.k = k;
  results.rho_l = rho_l;
  results.vRd_c = vRd_c;
  results.v_min = v_min;
  results.fywd_ef = fywd_ef;
  results.needsLinks = needsLinks;
  results.Asw_sr = Asw_sr;
  results.sr = sr;
  results.sr_max = sr_max;
  results.Asw_per_perimeter = Asw_per_perimeter;
  results.legs_per_perimeter = legs_per_perimeter;
  results.uout = uout;
  results.r_out = r_out;
  results.last_perim_dist = last_perim_dist;
  results.first_perim_min = first_perim_min;
  results.first_perim_max = first_perim_max;

  report.addStep({
    label: 'Column Face Perimeter u0',
    equation: 'u0 = 2 * (c1 + c2)',
    substituted: `2 * (${c1} + ${c2})`,
    value: u0,
    unit: 'mm',
    clause: 'EN 1992-1-1 Cl 6.4.5(3)'
  });

  report.addStep({
    label: 'Shear Stress at Column Face vEd,0',
    equation: 'vEd,0 = β * VEd / (u0 * d)',
    substituted: `${beta} * ${VEd} * 10³ / (${u0.toFixed(1)} * ${d})`,
    value: vEd_0,
    unit: 'N/mm²',
    clause: 'EN 1992-1-1 Cl 6.4.5(3)'
  });

  report.addStep({
    label: 'Maximum Crushing Resistance vRd,max',
    equation: 'vRd,max = factor * ν * fcd',
    substituted: `${vrdmax_factor} * ${nu.toFixed(3)} * ${fcd.toFixed(2)}`,
    value: vRd_max,
    unit: 'N/mm²',
    clause: 'EN 1992-1-1 Cl 6.4.5(3)'
  });

  report.addStep({
    label: 'Basic Control Perimeter u1 (at 2d)',
    equation: 'u1 = 2 * (c1 + c2) + 4 * π * d',
    substituted: `2 * (${c1} + ${c2}) + 4 * π * ${d}`,
    value: u1,
    unit: 'mm',
    clause: 'EN 1992-1-1 Cl 6.4.2'
  });

  report.addStep({
    label: 'Shear Stress at 2d Perimeter vEd,1',
    equation: 'vEd,1 = β * VEd / (u1 * d)',
    substituted: `${beta} * ${VEd} * 10³ / (${u1.toFixed(1)} * ${d})`,
    value: vEd_1,
    unit: 'N/mm²',
    clause: 'EN 1992-1-1 Cl 6.4.3'
  });

  report.addStep({
    label: 'Concrete Resistance vRd,c',
    equation: 'vRd,c = max[0.12 * k * (100 * ρl * fck)^(1/3), vmin]',
    substituted: `max[0.12 * ${k.toFixed(3)} * (100 * ${rho_l.toFixed(4)} * ${fck})^(1/3), ${v_min.toFixed(3)}]`,
    value: vRd_c,
    unit: 'N/mm²',
    clause: 'EN 1992-1-1 Cl 6.4.4'
  });

  report.addCheck({
    name: 'Maximum Crushing at Column Face (vEd,0 ≤ vRd,max)',
    demand: vEd_0,
    capacity: vRd_max,
    clause: 'EN 1992-1-1 Cl 6.4.5(3)',
    unit: 'N/mm²'
  });

  report.addCheck({
    name: 'Control Perimeter Shear Resistance (vEd,1 ≤ vRd,c)',
    demand: vEd_1,
    capacity: vRd_c,
    clause: 'EN 1992-1-1 Cl 6.4.4',
    unit: 'N/mm²',
    message: needsLinks
      ? 'vEd,1 > vRd,c: Shear reinforcement (links or studs) REQUIRED.'
      : 'vEd,1 ≤ vRd,c: Concrete alone is adequate; no punching links required.'
  });

  if (needsLinks) {
    report.addStep({
      label: 'Effective Design Strength of Links fywd,ef',
      equation: 'fywd,ef = min(250 + 0.25d, fywd)',
      substituted: `min(250 + 0.25 * ${d}, ${fywd.toFixed(2)})`,
      value: fywd_ef,
      unit: 'N/mm²',
      clause: 'EN 1992-1-1 Cl 6.4.5(1)'
    });

    report.addStep({
      label: 'Required Shear Reinforcement Asw / sr',
      equation: 'Asw / sr = (vEd,1 - 0.75 * vRd,c) * u1 / (1.5 * fywd,ef)',
      substituted: `(${vEd_1.toFixed(3)} - 0.75 * ${vRd_c.toFixed(3)}) * ${u1.toFixed(1)} / (1.5 * ${fywd_ef.toFixed(1)})`,
      value: Asw_sr,
      unit: 'mm²/mm',
      clause: 'EN 1992-1-1 Cl 6.4.5(1)'
    });

    report.addStep({
      label: 'Outer Perimeter u_out',
      equation: 'uout = β * VEd / (vRd,c * d)',
      substituted: `${beta} * ${VEd} * 10³ / (${vRd_c.toFixed(3)} * ${d})`,
      value: uout,
      unit: 'mm',
      clause: 'EN 1992-1-1 Cl 6.4.5(4)'
    });

    report.addStep({
      label: 'Distance to Outer Perimeter r_out',
      equation: 'r = [uout - 2*(c1 + c2)] / (2π)',
      substituted: `[${uout.toFixed(1)} - 2*(${c1} + ${c2})] / (2π)`,
      value: r_out,
      unit: 'mm',
      clause: 'EN 1992-1-1 Cl 6.4.5(4)'
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    results,
    checks: report.getChecks(),
    steps: report.getSteps()
  };
}
