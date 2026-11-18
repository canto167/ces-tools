/**
 * C7 — Anchorage and Lap Length Engine
 * Implementing Eurocode 2 (EN 1992-1-1 Cl 8.4, 8.7) and BS 8110-1:1997 Cl 3.12.8
 */

import { CalculationReport } from '../../shared/js/core/report.js';
import { Validate } from '../../shared/js/core/validate.js';

export function calculateAnchorageLapEC2(params) {
  const {
    barDia = 16,
    fck = 30,
    fyk = 500,
    bondCondition = 'good', // 'good' or 'poor'
    sigma_sd = null,        // Default to fyd
    alpha1 = 1.0,
    alpha2 = 1.0,
    alpha3 = 1.0,
    alpha4 = 1.0,
    alpha5 = 1.0,
    alpha6 = 1.5,           // Lap factor or derived from rho1
    rho1 = 100              // % of lapped bars
  } = params;

  const errors = [];
  const warnings = [];

  if (!Validate.isNumber(barDia) || barDia < 6 || barDia > 40) {
    errors.push(`Bar diameter barDia (${barDia} mm) must be in standard range [6, 40] mm.`);
  }
  const fckCheck = Validate.concreteStrength(fck, 'EC2');
  if (!fckCheck.valid) errors.push(fckCheck.error);
  const fyCheck = Validate.steelStrength(fyk, 'Steel yield strength fyk');
  if (!fyCheck.valid) errors.push(fyCheck.error);
  if (bondCondition !== 'good' && bondCondition !== 'poor') errors.push(`Bond condition must be "good" or "poor" (got "${bondCondition}").`);
  [['alpha1', alpha1], ['alpha2', alpha2], ['alpha3', alpha3], ['alpha4', alpha4], ['alpha5', alpha5]].forEach(([name, val]) => {
    if (!Validate.isNumber(val) || val < 0.7 || val > 1.0) errors.push(`${name} must be between 0.7 and 1.0 (EN 1992-1-1 Table 8.2), got ${val}.`);
  });
  if (params.alpha6 !== undefined && (!Validate.isNumber(alpha6) || alpha6 < 1.0 || alpha6 > 1.5)) {
    errors.push(`alpha6 must be between 1.0 and 1.5 (EN 1992-1-1 Table 8.3), got ${alpha6}.`);
  }
  if (!Validate.isNumber(rho1) || rho1 <= 0 || rho1 > 100) errors.push(`Percentage of lapped bars rho1 must be between 0 and 100% (got ${rho1}).`);
  if (sigma_sd !== null && (!Validate.isNumber(Number(sigma_sd)) || Number(sigma_sd) <= 0 || Number(sigma_sd) > fyk / 1.15)) {
    errors.push(`Design bar stress σsd must be greater than 0 and not more than fyd = ${(fyk / 1.15).toFixed(1)} N/mm².`);
  }

  warnings.push('Scope: Standard straight tension and compression anchorage and lap lengths to EN 1992-1-1 Cl 8.4 & 8.7. Bundled bars, welded transverse bars, and mechanical couplers are excluded.');

  const report = new CalculationReport({
    title: 'Anchorage & Lap Length to Eurocode 2 (EN 1992-1-1)',
    subtitle: `Bar φ${barDia} mm, C${fck}/${fck + 7}, Grade B${fyk}`,
    code: 'EN 1992-1-1:2004'
  });

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results: {}, checks: [], steps: [] };
  }

  const eta1 = bondCondition === 'good' ? 1.0 : 0.7;
  const eta2 = barDia <= 32 ? 1.0 : (132 - barDia) / 100;

  // Tensile strength. Cl 8.4.2(2): fctd is limited to the value for C60/75.
  const fck_bond = Math.min(fck, 60);
  if (fck > 60) warnings.push('fctd is limited to the C60/75 value for bond (EN 1992-1-1 Cl 8.4.2(2)).');
  const fctm = 0.30 * Math.pow(fck_bond, 2 / 3);
  const fctk005 = 0.70 * fctm;
  const gamma_c = 1.5;
  const alpha_ct = 1.0;
  const fctd = (alpha_ct * fctk005) / gamma_c;

  // Design bond stress
  const fbd = 2.25 * eta1 * eta2 * fctd;

  // Steel design stress
  const fyd = fyk / 1.15;
  const sigma = sigma_sd !== null ? Number(sigma_sd) : fyd;

  // Basic required anchorage length
  const lb_rqd = (barDia / 4) * (sigma / fbd);
  const lb_rqd_phi = lb_rqd / barDia;

  // Design coefficients
  const a235_prod = alpha2 * alpha3 * alpha5;
  const a235_eff = Math.max(0.7, a235_prod);
  const a_total = alpha1 * alpha4 * a235_eff;

  // Minimum anchorage length
  const lb_min = Math.max(0.3 * lb_rqd, 10 * barDia, 100);
  const lbd = Math.max(a_total * lb_rqd, lb_min);
  const lbd_phi = lbd / barDia;

  // Lap factor alpha6
  let a6 = alpha6;
  if (rho1 !== undefined && params.alpha6 === undefined) {
    a6 = Math.min(1.5, Math.max(1.0, Math.sqrt(rho1 / 25)));
  }

  // Lap length, EN 1992-1-1 Eq 8.10: l0 = alpha1 alpha2 alpha3 alpha5 alpha6 lb,rqd >= l0,min (alpha4 is not included).
  const l0_min = Math.max(0.3 * a6 * lb_rqd, 15 * barDia, 200);
  const l0 = Math.max(alpha1 * a235_eff * a6 * lb_rqd, l0_min);
  const l0_phi = l0 / barDia;

  report.addStep({
    ref: 'Table 3.1 & Cl 3.1.6',
    description: 'Concrete Tensile Strengths',
    formula: 'f_{ctm} = 0.30 f_{ck}^{2/3}, f_{ctk,0.05} = 0.7 f_{ctm}, f_{ctd} = f_{ctk,0.05}/1.5',
    values: `f_{ctm} = ${fctm.toFixed(3)} MPa, f_{ctk,0.05} = ${fctk005.toFixed(3)} MPa, f_{ctd} = ${fctd.toFixed(3)} MPa`
  });

  report.addStep({
    ref: 'Cl 8.4.2',
    description: 'Design Bond Strength fbd',
    formula: 'f_{bd} = 2.25 \\eta_1 \\eta_2 f_{ctd}',
    values: `\\eta_1 = ${eta1}, \\eta_2 = ${eta2.toFixed(2)} \\rightarrow f_{bd} = ${fbd.toFixed(3)} MPa`
  });

  report.addStep({
    ref: 'Cl 8.4.3',
    description: 'Basic Required Anchorage Length',
    formula: 'l_{b,rqd} = (\\phi / 4)(\\sigma_{sd} / f_{bd})',
    values: `\\phi = ${barDia} mm, \\sigma_{sd} = ${sigma.toFixed(2)} MPa \\rightarrow l_{b,rqd} = ${lb_rqd.toFixed(1)} mm (${lb_rqd_phi.toFixed(1)} \\phi)`
  });

  report.addStep({
    ref: 'Cl 8.4.4',
    description: 'Design Anchorage Length lbd',
    formula: 'l_{bd} = \\alpha_1 \\alpha_2 \\alpha_3 \\alpha_4 \\alpha_5 l_{b,rqd} \\ge l_{b,min}',
    values: `l_{b,min} = ${lb_min.toFixed(1)} mm \\rightarrow l_{bd} = ${lbd.toFixed(1)} mm (${lbd_phi.toFixed(1)} \\phi)`
  });

  report.addStep({
    ref: 'Cl 8.7.3',
    description: 'Design Lap Length l0',
    formula: 'l_0 = \\alpha_1 \\alpha_2 \\alpha_3 \\alpha_5 \\alpha_6 l_{b,rqd} \\ge l_{0,min}',
    values: `\\alpha_6 = ${a6.toFixed(2)}, l_{0,min} = ${l0_min.toFixed(1)} mm \\rightarrow l_0 = ${l0.toFixed(1)} mm (${l0_phi.toFixed(1)} \\phi)`
  });

  return {
    barDia,
    fck,
    fyk,
    bondCondition,
    fctm,
    fctk005,
    fctd,
    fbd,
    sigma,
    lb_rqd,
    lb_rqd_phi,
    lb_min,
    lbd,
    lbd_phi,
    a6,
    l0_min,
    l0,
    l0_phi,
    ok: errors.length === 0,
    errors,
    warnings,
    report
  };
}

export function calculateAnchorageLapBS8110(params) {
  const {
    barDia = 16,
    fcu = 30,
    fy = 500,
    forceType = 'tension', // 'tension' or 'compression'
    barType = 'type2'      // 'type2' deformed (B500), 'type1' deformed, or 'plain' (BS 8110 Table 3.26)
  } = params;

  const errors = [];
  const warnings = [];

  if (!Validate.isNumber(barDia) || barDia < 6 || barDia > 40) {
    errors.push(`Bar diameter barDia (${barDia} mm) must be in standard range [6, 40] mm.`);
  }
  const fcuCheck = Validate.concreteStrength(fcu, 'BS8110');
  if (!fcuCheck.valid) errors.push(fcuCheck.error);
  const fyCheck = Validate.steelStrength(fy, 'Steel yield strength fy');
  if (!fyCheck.valid) errors.push(fyCheck.error);
  if (forceType !== 'tension' && forceType !== 'compression') errors.push(`Force type must be "tension" or "compression" (got "${forceType}").`);
  const BETA = { type2: [0.50, 0.63], type1: [0.40, 0.50], plain: [0.28, 0.35] };
  if (!BETA[barType]) errors.push(`Bar type must be type2, type1 or plain (got "${barType}").`);

  warnings.push('Scope: Standard straight tension and compression anchorage and lap lengths to BS 8110-1:1997 Cl 3.12.8.');
  warnings.push(`Bond coefficient β from BS 8110 Table 3.26 for ${barType === 'plain' ? 'plain bars' : barType === 'type1' ? 'type 1 deformed bars' : 'type 2 deformed bars (standard high-yield ribbed bar)'}.`);

  const report = new CalculationReport({
    title: 'Anchorage & Lap Length to BS 8110-1:1997',
    subtitle: `Bar φ${barDia} mm, Grade ${fcu}, fy = ${fy} MPa`,
    code: 'BS 8110-1:1997'
  });

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results: {}, checks: [], steps: [] };
  }

  // Cl 3.12.8.4: fcu <= 40 for bond calculation
  const fcu_eff = Math.min(fcu, 40);
  const beta = BETA[barType][forceType === 'tension' ? 0 : 1];
  const fbu = beta * Math.sqrt(fcu_eff);

  const fs = 0.87 * fy;
  const anchorage = (fs * barDia) / (4 * fbu);
  const anchorage_phi = anchorage / barDia;

  // Tension laps (Cl 3.12.8.13): 1.0x, 1.4x (top bars or small cover), 2.0x (both).
  // Compression laps (Cl 3.12.8.15): 1.25 x the compression anchorage length; the 1.4/2.0 factors do not apply.
  const lap_min = Math.max(15 * barDia, 300);
  const isComp = forceType === 'compression';
  const lap_1_0 = Math.max((isComp ? 1.25 : 1.0) * anchorage, lap_min);
  const lap_1_4 = isComp ? lap_1_0 : Math.max(1.4 * anchorage, lap_min);
  const lap_2_0 = isComp ? lap_1_0 : Math.max(2.0 * anchorage, lap_min);

  report.addStep({
    ref: 'Cl 3.12.8.4',
    description: 'Design Ultimate Bond Stress fbu',
    formula: 'f_{bu} = \\beta \\sqrt{f_{cu}}',
    values: `\\beta = ${beta}, f_{cu} = ${fcu_eff} MPa \\rightarrow f_{bu} = ${fbu.toFixed(3)} MPa`
  });

  report.addStep({
    ref: 'Cl 3.12.8.2',
    description: 'Anchorage Bond Length',
    formula: 'l = \\frac{f_s \\phi}{4 f_{bu}}',
    values: `f_s = 0.87 f_y = ${fs.toFixed(1)} MPa \\rightarrow l = ${anchorage.toFixed(1)} mm (${anchorage_phi.toFixed(1)} \\phi)`
  });

  report.addStep({
    ref: isComp ? 'Cl 3.12.8.15' : 'Cl 3.12.8.13',
    description: isComp ? 'Compression Lap Length' : 'Tension Lap Lengths',
    formula: isComp ? 'l_{lap} = 1.25 \\times l \\ge \\max(15\\phi, 300\\text{ mm})' : 'l_{lap} = \\text{factor} \\times l \\ge \\max(15\\phi, 300\\text{ mm})',
    values: isComp
      ? `Compression lap (1.25x) = ${lap_1_0.toFixed(1)} mm`
      : `Normal (1.0x) = ${lap_1_0.toFixed(1)} mm, Top/Min-cover (1.4x) = ${lap_1_4.toFixed(1)} mm, Both (2.0x) = ${lap_2_0.toFixed(1)} mm`
  });

  return {
    barDia,
    fcu,
    fcu_eff,
    fy,
    forceType,
    barType,
    beta,
    fbu,
    fs,
    anchorage,
    anchorage_phi,
    lap_min,
    lap_1_0,
    lap_1_0_phi: lap_1_0 / barDia,
    lap_1_4,
    lap_1_4_phi: lap_1_4 / barDia,
    lap_2_0,
    lap_2_0_phi: lap_2_0 / barDia,
    ok: errors.length === 0,
    errors,
    warnings,
    report
  };
}

export function calculateAnchorageLap(params) {
  const ec2 = calculateAnchorageLapEC2(params);
  const bs = calculateAnchorageLapBS8110(params);
  return { ec2, bs, inputs: params };
}
