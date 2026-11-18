/**
 * One-Way Slab Calculation Engine
 * Pure mathematical functions implementing Eurocode 2 and BS 8110 for a 1-metre design strip.
 */

import { Bars } from '../../shared/js/core/bars.js';
import { CalculationReport } from '../../shared/js/core/report.js';
import { Validate } from '../../shared/js/core/validate.js';

export function calculateOneWaySlab(input) {
  const errors = [];
  const warnings = [];
  const report = new CalculationReport();
  const results = {};

  const code = (input.code || 'BS8110').toUpperCase();
  const L = Number(input.L); // m
  const h = Number(input.h); // mm
  const cover = Number(input.cover); // mm
  const finishes = Number(input.finishes || 0); // kN/m²
  const qk = Number(input.qk || 0); // kN/m²
  const support = input.support || 'simply_supported';

  const main_dia = Number(input.main_bar_dia || 10);
  const main_spacing = Number(input.main_bar_spacing || 150);
  const dist_dia = Number(input.dist_bar_dia || 10);

  const fck = Number(input.fck || input.fcu || 30);
  const fcu = fck;
  const fyk = Number(input.fyk || input.fy || 500);
  const fy = fyk;

  // Validation
  if (!Validate.isNumber(L) || L <= 0) errors.push('Span length L must be greater than 0.');
  if (!Validate.isNumber(h) || h < 75) errors.push(`Slab overall depth h must be at least 75 mm (got ${h}).`);
  const coverCheck = Validate.coverSanity(cover, 1000, h);
  if (!coverCheck.valid) errors.push(coverCheck.error);
  if (!Validate.isNumber(main_spacing) || main_spacing <= 0) errors.push('Main bar spacing must be greater than 0.');

  const concCheck = Validate.concreteStrength(fck, code);
  if (!concCheck.valid) errors.push(concCheck.error);

  const steelCheck = Validate.steelStrength(fyk, 'Main steel yield strength');
  if (!steelCheck.valid) errors.push(steelCheck.error);

  warnings.push('Scope: Simply supported or continuous one-way slab 1m design strip. Openings, concentrated point loads, and transverse load redistribution excluded.');

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results, checks: [], steps: [] };
  }

  const b = 1000.0; // 1 metre strip
  const gamma_conc = code === 'EC2' ? 25.0 : 24.0;
  const self_weight = (h / 1000.0) * gamma_conc;
  const gk = self_weight + finishes;

  // Factored Ultimate Design Load per m²
  let n = 0;
  if (code === 'EC2') {
    n = 1.35 * gk + 1.5 * qk;
  } else {
    n = 1.4 * gk + 1.6 * qk;
  }

  // Moments and Shears
  let M = 0; // kNm/m
  let V = 0; // kN/m
  const F_total = n * L; // Total load on span

  if (support === 'simply_supported') {
    M = (n * L * L) / 8.0;
    V = (n * L) / 2.0;
  } else if (support === 'end_span') {
    // BS 8110 Table 3.12: End span moment 0.086 FL, Outer support shear 0.4 F, Penultimate 0.6 F
    M = 0.086 * F_total * L;
    V = 0.6 * F_total;
    if (code === 'EC2') {
      warnings.push('BS 8110 Table 3.12 simplified coefficients used as approximation for continuous EC2 slab.');
    }
  } else if (support === 'interior_span') {
    // Interior span moment 0.063 FL, shear 0.5 F
    M = 0.063 * F_total * L;
    V = 0.5 * F_total;
    if (code === 'EC2') {
      warnings.push('BS 8110 Table 3.12 simplified coefficients used as approximation for continuous EC2 slab.');
    }
  }

  const d = h - cover - main_dia / 2.0;
  const As_prov = Bars.areaPerMetre(main_dia, main_spacing);

  results.b = b;
  results.d = d;
  results.gk = gk;
  results.n = n;
  results.M = M;
  results.V = V;
  results.As_prov = As_prov;

  report.addStep({
    label: 'Dead Load gk',
    equation: 'gk = (h / 1000) * γconc + finishes',
    substituted: `(${h} / 1000) * ${gamma_conc} + ${finishes}`,
    value: gk,
    unit: 'kN/m²',
    clause: 'Loading'
  });

  report.addStep({
    label: 'Factored Ultimate Load n',
    equation: code === 'EC2' ? 'n = 1.35 * gk + 1.5 * qk' : 'n = 1.4 * gk + 1.6 * qk',
    substituted: code === 'EC2' ? `1.35 * ${gk.toFixed(3)} + 1.5 * ${qk}` : `1.4 * ${gk.toFixed(2)} + 1.6 * ${qk}`,
    value: n,
    unit: 'kN/m²',
    clause: code === 'EC2' ? 'EN 1990' : 'BS 8110 Cl 2.4.3'
  });

  report.addStep({
    label: 'Design Bending Moment M',
    equation: support === 'simply_supported' ? 'M = n * L² / 8' : 'M = coeff * n * L²',
    substituted: support === 'simply_supported' ? `${n.toFixed(3)} * ${L}² / 8` : `coeff * ${n.toFixed(3)} * ${L}²`,
    value: M,
    unit: 'kNm/m',
    clause: 'Analysis'
  });

  // Flexure
  let As_req = 0;
  let As_min = 0;
  let K = 0;
  let z = 0;

  if (code === 'EC2') {
    const fcd = fck / 1.5;
    const fyd = fyk / 1.15;
    K = (M * 1e6) / (b * d * d * fck);
    const K_prime = 0.167;

    z = d * (0.5 + Math.sqrt(Math.max(0, 0.25 - K / 1.134)));
    z = Math.min(z, 0.95 * d);
    As_req = (M * 1e6) / (fyd * z);

    const fctm = 0.30 * Math.pow(fck, 2 / 3);
    As_min = Math.max(0.26 * (fctm / fyk) * b * d, 0.0013 * b * d);

    // Max spacing: min(3h, 400mm)
    const s_max_main = Math.min(3 * h, 400);
    const s_max_sec = Math.min(3.5 * h, 450);

    // Shear EC2
    const k_shear = Math.min(1.0 + Math.sqrt(200.0 / d), 2.0);
    const rho_l = Math.min(As_prov / (b * d), 0.02);
    const v_calc = 0.12 * k_shear * Math.pow(100.0 * rho_l * fck, 1 / 3);
    const v_min = 0.035 * Math.pow(k_shear, 1.5) * Math.sqrt(fck);
    const v_Rd_c = Math.max(v_calc, v_min);
    const VRd_c = (v_Rd_c * b * d) * 1e-3; // kN/m

    // Deflection EC2 Eq 7.16
    const rho0 = Math.sqrt(fck) * 1e-3;
    const rho = As_req / (b * d);
    let ld_basic = 0;
    if (rho <= rho0) {
      ld_basic = 11.0 + 1.5 * Math.sqrt(fck) * (rho0 / rho) + 3.2 * Math.sqrt(fck) * Math.pow(Math.max(0, (rho0 / rho) - 1.0), 1.5);
    } else {
      ld_basic = 11.0 + 1.5 * Math.sqrt(fck) * (rho0 / rho) + (1.0 / 12.0) * Math.sqrt(fck) * Math.sqrt(0);
    }

    let Ks = 1.0;
    if (support === 'end_span') Ks = 1.3;
    else if (support === 'interior_span') Ks = 1.5;

    const spanMod = L > 7.0 ? 7.0 / L : 1.0;
    const steelMod = Math.min(As_prov / As_req, 1.5);
    const ld_allowable = Ks * ld_basic * steelMod * spanMod;
    const ld_actual = (L * 1000.0) / d;

    results.K = K;
    results.z = z;
    results.As = As_req;
    results.As_min = As_min;
    results.VRd_c = VRd_c;
    results.v_min = v_min;
    results.ld_basic = ld_basic;
    results.ld_allowable = ld_allowable;
    results.ld_actual = ld_actual;
    results.s_max_main = s_max_main;

    report.addCheck({
      name: 'Flexural Reinforcement Capacity',
      demand: As_req,
      capacity: As_prov,
      clause: 'EN 1992-1-1 Cl 6.1',
      unit: 'mm²/m'
    });

    report.addCheck({
      name: 'Minimum Reinforcement',
      demand: As_min,
      capacity: As_prov,
      clause: 'EN 1992-1-1 Cl 9.3.1.1',
      unit: 'mm²/m'
    });

    report.addCheck({
      name: 'Main Bar Spacing Limit',
      demand: main_spacing,
      capacity: s_max_main,
      ratio: main_spacing / s_max_main,
      clause: 'EN 1992-1-1 Cl 9.3.1.1(3)',
      unit: 'mm'
    });

    report.addCheck({
      name: 'Concrete Shear Capacity Without Links',
      demand: V,
      capacity: VRd_c,
      clause: 'EN 1992-1-1 Cl 6.2.2',
      unit: 'kN/m'
    });

    report.addCheck({
      name: 'Span-to-Depth Deflection Check',
      demand: ld_actual,
      capacity: ld_allowable,
      clause: 'EN 1992-1-1 Cl 7.4.2',
      unit: 'ratio'
    });

  } else {
    // BS 8110
    K = (M * 1e6) / (b * d * d * fcu);
    z = Math.min(d * (0.5 + Math.sqrt(Math.max(0, 0.25 - K / 0.9))), 0.95 * d);
    As_req = (M * 1e6) / (0.87 * fy * z);
    As_min = 0.0013 * b * h;

    const s_max_main = Math.min(3 * d, 750);

    // Shear BS 8110
    const v = (V * 1e3) / (b * d);
    const p_prov = Math.min((100.0 * As_prov) / (b * d), 3.0);
    const f_d = Math.max(Math.pow(400.0 / d, 0.25), 1.0); // >= 1.0 for slabs without links
    const f_cu = Math.pow(Math.min(fcu, 40.0) / 25.0, 1 / 3);
    const vc = (0.79 / 1.25) * Math.pow(p_prov, 1 / 3) * f_d * f_cu;

    // Deflection BS 8110
    let basicLd = 20.0;
    if (support === 'end_span' || support === 'interior_span') basicLd = 26.0;

    const fs = (2.0 * fy * As_req) / (3.0 * As_prov);
    const M_bd2 = (M * 1e6) / (b * d * d);
    const MF = Math.min(2.0, 0.55 + (477.0 - fs) / (120.0 * (0.9 + M_bd2)));
    const allowableLd = basicLd * MF;
    const actualLd = (L * 1000.0) / d;

    results.K = K;
    results.z = z;
    results.As = As_req;
    results.As_min = As_min;
    results.v = v;
    results.vc = vc;
    results.fs = fs;
    results.MF = MF;
    results.ld_allowable = allowableLd;
    results.ld_actual = actualLd;
    results.s_max_main = s_max_main;

    report.addCheck({
      name: 'Flexural Reinforcement Capacity',
      demand: As_req,
      capacity: As_prov,
      clause: 'BS 8110 Cl 3.4.4.4',
      unit: 'mm²/m'
    });

    report.addCheck({
      name: 'Minimum Reinforcement (0.13% bh)',
      demand: As_min,
      capacity: As_prov,
      clause: 'BS 8110 Cl 3.12.5.3',
      unit: 'mm²/m'
    });

    report.addCheck({
      name: 'Main Bar Spacing Limit',
      demand: main_spacing,
      capacity: s_max_main,
      ratio: main_spacing / s_max_main,
      clause: 'BS 8110 Cl 3.12.11.2.7',
      unit: 'mm'
    });

    report.addCheck({
      name: 'Slab Shear Stress (v ≤ vc)',
      demand: v,
      capacity: vc,
      clause: 'BS 8110 Cl 3.5.5.2',
      unit: 'N/mm²'
    });

    report.addCheck({
      name: 'Span-to-Depth Deflection Check',
      demand: actualLd,
      capacity: allowableLd,
      clause: 'BS 8110 Cl 3.4.6.3',
      unit: 'ratio'
    });
  }

  // Distribution reinforcement recommendation
  const dist_area_single = Bars.area(dist_dia);
  const dist_spacing_calc = Math.floor((1000.0 * dist_area_single) / As_min / 25.0) * 25.0;
  const dist_spacing_final = Math.min(dist_spacing_calc, code === 'EC2' ? Math.min(3.5 * h, 450) : Math.min(3 * d, 750));
  results.dist_spacing_recommended = dist_spacing_final;

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    results,
    checks: report.getChecks(),
    steps: report.getSteps()
  };
}
