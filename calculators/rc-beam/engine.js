/**
 * RC Rectangular Beam Calculation Engine
 * Pure mathematical functions implementing Eurocode 2 (EN 1992-1-1) and BS 8110-1:1997.
 * No DOM references. Completely decoupled and testable via node:test.
 */

import { Bars } from '../../shared/js/core/bars.js';
import { CalculationReport } from '../../shared/js/core/report.js';

export function calculateRcBeam(input) {
  const errors = [];
  const warnings = [];
  const report = new CalculationReport();
  const results = {};

  const code = (input.code || 'EC2').toUpperCase();
  const b = Number(input.b);
  const h = Number(input.h);
  const cover = Number(input.cover);
  const M = Number(input.M); // kNm
  const V = Number(input.V); // kN
  const L = Number(input.L); // m
  const support = input.support || 'simply_supported';
  const agg = Number(input.agg || 20);

  const link_dia = Number(input.link_dia || 10);
  const link_legs = Number(input.link_legs || 2);
  const link_spacing = Number(input.link_spacing || 150);

  const top_bars_n = Number(input.top_bars_n || 2);
  const top_bars_dia = Number(input.top_bars_dia || 16);

  // Parse tension bars: support single layer or multiple layers
  let tensionLayers = input.tension_layers;
  if (!tensionLayers || !tensionLayers.length) {
    tensionLayers = [{
      n: Number(input.bars_n || 4),
      dia: Number(input.bars_dia || 20)
    }];
  }

  // Material properties based on code
  const fck = Number(input.fck || input.fcu || 30);
  const fcu = fck;
  const fyk = Number(input.fyk || input.fy || 500);
  const fy = fyk;
  const fywk = Number(input.fywk || input.fyv || 500);
  const fyv = fywk;
  const acc = Number(input.acc || 1.0); // National Annex parameter for EC2

  // Validation
  if (!b || b <= 0) errors.push('Beam width b must be greater than 0.');
  if (!h || h <= 0) errors.push('Beam depth h must be greater than 0.');
  if (!cover || cover <= 0) errors.push('Concrete cover must be greater than 0.');
  if (M === undefined || Number.isNaN(M) || M < 0) errors.push('Design moment M must be 0 or positive.');
  if (V === undefined || Number.isNaN(V) || V < 0) errors.push('Design shear V must be 0 or positive.');
  if (!L || L <= 0) errors.push('Span length L must be greater than 0.');

  if (code === 'EC2' && fck > 50) {
    errors.push('Concrete strength fck exceeds 50 N/mm² (higher grades require modified stress blocks).');
  }

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results, checks: [], steps: [] };
  }

  // 1. Geometry & Reinforcement Centers
  // Tension reinforcement calculation
  let totalAsProv = 0;
  let sumAy = 0; // for centroid from bottom face
  let primaryDia = tensionLayers[0].dia;
  let primaryN = tensionLayers[0].n;

  let currentDistFromBottom = cover + link_dia;
  tensionLayers.forEach((layer, idx) => {
    const layerArea = Bars.totalArea(layer.n, layer.dia);
    totalAsProv += layerArea;
    const yCenter = currentDistFromBottom + layer.dia / 2;
    sumAy += layerArea * yCenter;
    
    // Spacing between layers if more than 1 layer: max(dia, 25mm)
    const gap = Math.max(layer.dia, 25);
    currentDistFromBottom += layer.dia + gap;
  });

  const tensionCentroidY = totalAsProv > 0 ? sumAy / totalAsProv : (cover + link_dia + primaryDia / 2);
  const d = h - tensionCentroidY;
  const d2 = cover + link_dia + top_bars_dia / 2;
  const topAsProv = Bars.totalArea(top_bars_n, top_bars_dia);

  results.d = d;
  results.d2 = d2;
  results.As_prov = totalAsProv;
  results.As_top_prov = topAsProv;

  report.addStep({
    label: 'Effective Depth d',
    equation: 'd = h - centroid_y',
    substituted: `${h} - ${tensionCentroidY.toFixed(2)}`,
    value: d,
    unit: 'mm',
    clause: code === 'EC2' ? 'EN 1992-1-1 Cl 5.3.2' : 'BS 8110 Cl 3.4.4.1'
  });

  // 2. Bar Spacing Check (Detailing)
  const widthInsideLinks = b - 2 * cover - 2 * link_dia;
  const layer1 = tensionLayers[0];
  const barGap = layer1.n > 1 
    ? (widthInsideLinks - layer1.n * layer1.dia) / (layer1.n - 1)
    : widthInsideLinks - layer1.dia;
  const minBarGap = code === 'EC2' 
    ? Math.max(layer1.dia, agg + 5, 20)
    : Math.max(layer1.dia, agg + 5);

  results.bar_gap = barGap;
  results.min_bar_gap = minBarGap;

  report.addCheck({
    name: 'Clear Horizontal Bar Spacing',
    demand: minBarGap,
    capacity: barGap,
    ratio: minBarGap / barGap,
    status: barGap >= minBarGap ? 'PASS' : 'FAIL',
    clause: code === 'EC2' ? 'EN 1992-1-1 Cl 8.2' : 'BS 8110 Cl 3.12.11',
    unit: 'mm',
    message: barGap >= minBarGap 
      ? `Clear gap (${barGap.toFixed(1)} mm) satisfies minimum (${minBarGap} mm).`
      : `Clear gap (${barGap.toFixed(1)} mm) is less than minimum (${minBarGap} mm). Detailing fails.`
  });

  // 3. Flexural Design
  let As_req = 0;
  let As2_req = 0;
  let K = 0;
  let K_prime = 0;
  let z = 0;
  let isDoublyReinforced = false;

  if (code === 'EC2') {
    // EN 1992-1-1 Cl 6.1
    const fcd = (acc * fck) / 1.5;
    const fyd = fyk / 1.15;
    K = (M * 1e6) / (b * d * d * fck);
    K_prime = 0.167; // standard redistribution ratio delta = 1.0

    results.K = K;
    results.K_prime = K_prime;

    if (K <= K_prime) {
      // Singly reinforced
      z = d * (0.5 + Math.sqrt(Math.max(0, 0.25 - K / 1.134)));
      z = Math.min(z, 0.95 * d);
      As_req = (M * 1e6) / (fyd * z);
    } else {
      // Doubly reinforced
      isDoublyReinforced = true;
      z = d * (0.5 + Math.sqrt(Math.max(0, 0.25 - K_prime / 1.134)));
      z = Math.min(z, 0.95 * d);
      As2_req = ((K - K_prime) * fck * b * d * d) / (fyd * (d - d2));
      As_req = ((K_prime * fck * b * d * d) / (fyd * z)) + As2_req;
    }

    // Minimum and Maximum longitudinal steel
    const fctm = 0.30 * Math.pow(fck, 2 / 3);
    const As_min = Math.max(0.26 * (fctm / fyk) * b * d, 0.0013 * b * d);
    const As_max = 0.04 * b * h;

    results.z = z;
    results.As = As_req;
    results.As2 = As2_req;
    results.As_min = As_min;
    results.As_max = As_max;

    report.addStep({
      label: 'K Factor',
      equation: 'K = M / (b * d² * fck)',
      substituted: `${M} * 10⁶ / (${b} * ${d.toFixed(1)}² * ${fck})`,
      value: K,
      clause: 'EN 1992-1-1 Cl 6.1'
    });

    report.addStep({
      label: 'Lever Arm z',
      equation: 'z = d * [0.5 + √(0.25 - K / 1.134)] ≤ 0.95d',
      substituted: `${d.toFixed(1)} * [0.5 + √(0.25 - ${(isDoublyReinforced ? K_prime : K).toFixed(4)} / 1.134)]`,
      value: z,
      unit: 'mm',
      clause: 'EN 1992-1-1 Cl 6.1'
    });

    if (isDoublyReinforced) {
      report.addStep({
        label: 'Compression Steel Req. As2',
        equation: 'As2 = (K - K\') * fck * b * d² / [fyd * (d - d2)]',
        substituted: `(${K.toFixed(4)} - ${K_prime}) * ${fck} * ${b} * ${d.toFixed(1)}² / [${fyd.toFixed(2)} * (${d.toFixed(1)} - ${d2})]`,
        value: As2_req,
        unit: 'mm²',
        clause: 'EN 1992-1-1 Cl 6.1'
      });
      report.addStep({
        label: 'Total Tension Steel Req. As1',
        equation: 'As1 = K\' * fck * b * d² / (fyd * z) + As2',
        substituted: `${K_prime} * ${fck} * ${b} * ${d.toFixed(1)}² / [${fyd.toFixed(2)} * ${z.toFixed(1)}] + ${As2_req.toFixed(1)}`,
        value: As_req,
        unit: 'mm²',
        clause: 'EN 1992-1-1 Cl 6.1'
      });
    } else {
      report.addStep({
        label: 'Required Tension Steel As',
        equation: 'As = M / (fyd * z)',
        substituted: `${M} * 10⁶ / [${fyd.toFixed(2)} * ${z.toFixed(1)}]`,
        value: As_req,
        unit: 'mm²',
        clause: 'EN 1992-1-1 Cl 6.1'
      });
    }

    report.addCheck({
      name: 'Tension Steel Capacity',
      demand: As_req,
      capacity: totalAsProv,
      clause: 'EN 1992-1-1 Cl 6.1',
      unit: 'mm²'
    });

    if (isDoublyReinforced) {
      report.addCheck({
        name: 'Compression Steel Capacity',
        demand: As2_req,
        capacity: topAsProv,
        clause: 'EN 1992-1-1 Cl 6.1',
        unit: 'mm²'
      });
    }

    report.addCheck({
      name: 'Minimum Tension Reinforcement',
      demand: As_min,
      capacity: totalAsProv,
      clause: 'EN 1992-1-1 Cl 9.2.1.1',
      unit: 'mm²'
    });

    report.addCheck({
      name: 'Maximum Reinforcement Limit (0.04 Ac)',
      demand: totalAsProv,
      capacity: As_max,
      clause: 'EN 1992-1-1 Cl 9.2.1.1',
      unit: 'mm²'
    });

    // 4. Shear Design (EC2 Variable Strut Method)
    const cot_theta = 2.5;
    const z_shear = 0.9 * d;
    const fcd_shear = fck / 1.5;
    const fywd = fywk / 1.15;
    const nu1 = 0.6 * (1.0 - fck / 250.0);
    const VRd_max = (b * z_shear * nu1 * fcd_shear / (2.5 + 0.4)) * 1e-3; // kN

    const k_shear = Math.min(1.0 + Math.sqrt(200.0 / d), 2.0);
    const rho_l = Math.min(totalAsProv / (b * d), 0.02);
    const VRd_c = Math.max(
      0.12 * k_shear * Math.pow(100.0 * rho_l * fck, 1 / 3),
      0.035 * Math.pow(k_shear, 1.5) * Math.sqrt(fck)
    ) * b * d * 1e-3; // kN

    const Asw_s = (V * 1e3) / (z_shear * fywd * cot_theta);
    const Asw_s_min = (0.08 * Math.sqrt(fck) / fywk) * b;
    const s_max = 0.75 * d;

    // Provided shear links Asw/s
    const linkAreaSingle = Bars.area(link_dia);
    const Asw_prov = link_legs * linkAreaSingle;
    const Asw_s_prov = Asw_prov / link_spacing;

    results.VRd_c = VRd_c;
    results.VRd_max = VRd_max;
    results.Asw_s = Asw_s;
    results.Asw_s_min = Asw_s_min;
    results.s_max = s_max;
    results.Asw_s_prov = Asw_s_prov;

    report.addStep({
      label: 'Concrete Strut Capacity VRd,max',
      equation: 'VRd,max = b * z * ν1 * fcd / (cot θ + tan θ)',
      substituted: `${b} * ${z_shear.toFixed(1)} * ${nu1.toFixed(3)} * ${fcd_shear.toFixed(2)} / 2.9`,
      value: VRd_max,
      unit: 'kN',
      clause: 'EN 1992-1-1 Cl 6.2.3'
    });

    report.addStep({
      label: 'Concrete Shear Resistance VRd,c',
      equation: 'VRd,c = [0.12 * k * (100 * ρl * fck)^(1/3)] * b * d',
      substituted: `[0.12 * ${k_shear.toFixed(3)} * (100 * ${rho_l.toFixed(4)} * ${fck})^(1/3)] * ${b} * ${d.toFixed(1)}`,
      value: VRd_c,
      unit: 'kN',
      clause: 'EN 1992-1-1 Cl 6.2.2'
    });

    report.addStep({
      label: 'Required Shear Links Asw / s',
      equation: 'Asw / s = VEd / (z * fywd * cot θ)',
      substituted: `${V} * 10³ / (${z_shear.toFixed(1)} * ${fywd.toFixed(2)} * 2.5)`,
      value: Asw_s,
      unit: 'mm²/mm',
      clause: 'EN 1992-1-1 Cl 6.2.3'
    });

    report.addCheck({
      name: 'Concrete Strut Crushing (VRd,max)',
      demand: V,
      capacity: VRd_max,
      clause: 'EN 1992-1-1 Cl 6.2.3',
      unit: 'kN'
    });

    report.addCheck({
      name: 'Provided Shear Reinforcement Asw/s',
      demand: Math.max(Asw_s, Asw_s_min),
      capacity: Asw_s_prov,
      clause: 'EN 1992-1-1 Cl 6.2.3 / 9.2.2',
      unit: 'mm²/mm'
    });

    report.addCheck({
      name: 'Maximum Longitudinal Link Spacing',
      demand: link_spacing,
      capacity: s_max,
      ratio: link_spacing / s_max,
      clause: 'EN 1992-1-1 Cl 9.2.2(6)',
      unit: 'mm'
    });

    // 5. Deflection (EC2 Cl 7.4.2 Eq 7.16)
    const rho0 = Math.sqrt(fck) * 1e-3;
    const rho = As_req / (b * d);
    const rho_prime = As2_req / (b * d);

    let ld_basic = 0;
    if (rho <= rho0) {
      ld_basic = 11.0 + 1.5 * Math.sqrt(fck) * (rho0 / rho) + 3.2 * Math.sqrt(fck) * Math.pow(Math.max(0, (rho0 / rho) - 1.0), 1.5);
    } else {
      ld_basic = 11.0 + 1.5 * Math.sqrt(fck) * (rho0 / (rho - rho_prime)) + (1.0 / 12.0) * Math.sqrt(fck) * Math.sqrt(rho_prime / rho0);
    }

    let Ks = 1.0;
    if (support === 'end_span') Ks = 1.3;
    else if (support === 'interior_span') Ks = 1.5;
    else if (support === 'cantilever') Ks = 0.4;

    const spanMod = L > 7.0 ? 7.0 / L : 1.0;
    const steelMod = Math.min(totalAsProv / As_req, 1.5);
    const ld_allowable = Ks * ld_basic * steelMod * spanMod;
    const ld_actual = (L * 1000.0) / d;

    results.ld_basic = Ks * ld_basic;
    results.ld_allowable = ld_allowable;
    results.ld_actual = ld_actual;

    report.addStep({
      label: 'Basic Span / Effective Depth (l/d)basic',
      equation: 'EC2 Eq. 7.16',
      substituted: `Ks=${Ks}, ρ0=${rho0.toFixed(5)}, ρ=${rho.toFixed(5)}, ρ\'=${rho_prime.toFixed(5)}`,
      value: Ks * ld_basic,
      clause: 'EN 1992-1-1 Cl 7.4.2'
    });

    report.addStep({
      label: 'Allowable Span / Effective Depth (l/d)allow',
      equation: '(l/d)basic * min(As,prov / As,req, 1.5) * (7/L if L>7m)',
      substituted: `${(Ks * ld_basic).toFixed(2)} * ${steelMod.toFixed(3)} * ${spanMod.toFixed(3)}`,
      value: ld_allowable,
      clause: 'EN 1992-1-1 Cl 7.4.2'
    });

    report.addCheck({
      name: 'Span-to-Depth Deflection Limit',
      demand: ld_actual,
      capacity: ld_allowable,
      clause: 'EN 1992-1-1 Cl 7.4.2',
      unit: 'ratio'
    });

  } else {
    // ==========================================
    // BS 8110-1:1997
    // ==========================================
    K = (M * 1e6) / (b * d * d * fcu);
    K_prime = 0.156;

    results.K = K;
    results.K_prime = K_prime;

    if (K <= K_prime) {
      z = d * (0.5 + Math.sqrt(Math.max(0, 0.25 - K / 0.9)));
      z = Math.min(z, 0.95 * d);
      As_req = (M * 1e6) / (0.87 * fy * z);
    } else {
      isDoublyReinforced = true;
      z = d * (0.5 + Math.sqrt(Math.max(0, 0.25 - K_prime / 0.9)));
      z = Math.min(z, 0.95 * d);
      As2_req = ((K - K_prime) * fcu * b * d * d) / (0.87 * fy * (d - d2));
      As_req = ((K_prime * fcu * b * d * d) / (0.87 * fy * z)) + As2_req;
    }

    const As_min = 0.0013 * b * h;
    const As_max = 0.04 * b * h;

    results.z = z;
    results.As = As_req;
    results.As2 = As2_req;
    results.As_min = As_min;
    results.As_max = As_max;

    report.addStep({
      label: 'K Factor',
      equation: 'K = M / (b * d² * fcu)',
      substituted: `${M} * 10⁶ / (${b} * ${d.toFixed(1)}² * ${fcu})`,
      value: K,
      clause: 'BS 8110 Cl 3.4.4.4'
    });

    report.addStep({
      label: 'Lever Arm z',
      equation: 'z = d * [0.5 + √(0.25 - K / 0.9)] ≤ 0.95d',
      substituted: `${d.toFixed(1)} * [0.5 + √(0.25 - ${(isDoublyReinforced ? K_prime : K).toFixed(4)} / 0.9)]`,
      value: z,
      unit: 'mm',
      clause: 'BS 8110 Cl 3.4.4.4'
    });

    if (isDoublyReinforced) {
      report.addStep({
        label: 'Compression Steel Req. As\'',
        equation: 'As\' = (K - K\') * fcu * b * d² / [0.87 * fy * (d - d2)]',
        substituted: `(${K.toFixed(4)} - ${K_prime}) * ${fcu} * ${b} * ${d.toFixed(1)}² / [${(0.87 * fy).toFixed(1)} * (${d.toFixed(1)} - ${d2})]`,
        value: As2_req,
        unit: 'mm²',
        clause: 'BS 8110 Cl 3.4.4.4'
      });
    }

    report.addStep({
      label: 'Tension Steel Req. As',
      equation: isDoublyReinforced ? 'As = K\' * fcu * b * d² / (0.87*fy*z) + As\'' : 'As = M / (0.87*fy*z)',
      substituted: `${M} * 10⁶ / [${(0.87 * fy).toFixed(1)} * ${z.toFixed(1)}]`,
      value: As_req,
      unit: 'mm²',
      clause: 'BS 8110 Cl 3.4.4.4'
    });

    report.addCheck({
      name: 'Tension Steel Capacity',
      demand: As_req,
      capacity: totalAsProv,
      clause: 'BS 8110 Cl 3.4.4.4',
      unit: 'mm²'
    });

    if (isDoublyReinforced) {
      report.addCheck({
        name: 'Compression Steel Capacity',
        demand: As2_req,
        capacity: topAsProv,
        clause: 'BS 8110 Cl 3.4.4.4',
        unit: 'mm²'
      });
    }

    report.addCheck({
      name: 'Minimum Reinforcement (0.13% bh)',
      demand: As_min,
      capacity: totalAsProv,
      clause: 'BS 8110 Cl 3.12.5.3',
      unit: 'mm²'
    });

    // Shear BS 8110 Cl 3.4.5
    const v = (V * 1e3) / (b * d);
    const v_max = Math.min(0.8 * Math.sqrt(fcu), 5.0);
    const p_prov = Math.min((100.0 * totalAsProv) / (b * d), 3.0);
    const f_d = Math.max(Math.pow(400.0 / d, 0.25), 0.67);
    const f_cu = Math.pow(Math.min(fcu, 40.0) / 25.0, 1 / 3);
    const vc = (0.79 / 1.25) * Math.pow(p_prov, 1 / 3) * f_d * f_cu;

    let Asv_sv = 0;
    if (v < vc + 0.4) {
      Asv_sv = (0.4 * b) / (0.87 * fyv);
    } else {
      Asv_sv = (b * (v - vc)) / (0.87 * fyv);
    }

    const s_max = 0.75 * d;
    const Asw_prov = link_legs * Bars.area(link_dia);
    const Asv_sv_prov = Asw_prov / link_spacing;

    results.v = v;
    results.vc = vc;
    results.v_max = v_max;
    results.Asv_sv = Asv_sv;
    results.Asv_sv_prov = Asv_sv_prov;
    results.s_max = s_max;

    report.addStep({
      label: 'Design Shear Stress v',
      equation: 'v = V / (b * d)',
      substituted: `${V} * 10³ / (${b} * ${d.toFixed(1)})`,
      value: v,
      unit: 'N/mm²',
      clause: 'BS 8110 Cl 3.4.5.2'
    });

    report.addStep({
      label: 'Design Concrete Shear Stress vc',
      equation: 'vc = 0.79/1.25 * (100As/bd)^(1/3) * (400/d)^(1/4) * (fcu/25)^(1/3)',
      substituted: `0.632 * (${p_prov.toFixed(3)})^(1/3) * ${f_d.toFixed(3)} * ${f_cu.toFixed(3)}`,
      value: vc,
      unit: 'N/mm²',
      clause: 'BS 8110 Table 3.8'
    });

    report.addStep({
      label: 'Required Shear Links Asv / sv',
      equation: v < vc + 0.4 ? 'Asv / sv = 0.4 * b / (0.87 * fyv)' : 'Asv / sv = b * (v - vc) / (0.87 * fyv)',
      substituted: `b=${b}, v=${v.toFixed(3)}, vc=${vc.toFixed(3)}`,
      value: Asv_sv,
      unit: 'mm²/mm',
      clause: 'BS 8110 Table 3.7'
    });

    report.addCheck({
      name: 'Maximum Shear Stress Limit (vmax)',
      demand: v,
      capacity: v_max,
      clause: 'BS 8110 Cl 3.4.5.2',
      unit: 'N/mm²'
    });

    report.addCheck({
      name: 'Provided Shear Reinforcement Asv/sv',
      demand: Asv_sv,
      capacity: Asv_sv_prov,
      clause: 'BS 8110 Table 3.7',
      unit: 'mm²/mm'
    });

    report.addCheck({
      name: 'Maximum Link Spacing',
      demand: link_spacing,
      capacity: s_max,
      ratio: link_spacing / s_max,
      clause: 'BS 8110 Cl 3.4.5.5',
      unit: 'mm'
    });

    // Deflection BS 8110 Cl 3.4.6
    let basicLd = 20.0;
    if (support === 'cantilever') basicLd = 7.0;
    else if (support === 'end_span' || support === 'interior_span') basicLd = 26.0;

    const fs = (2.0 * fy * As_req) / (3.0 * totalAsProv);
    const M_bd2 = (M * 1e6) / (b * d * d);
    const MFt = Math.min(2.0, 0.55 + (477.0 - fs) / (120.0 * (0.9 + M_bd2)));

    const p_prime = (100.0 * topAsProv) / (b * d);
    const MFc = Math.min(1.5, 1.0 + p_prime / (3.0 + p_prime));

    const spanMod = L > 10.0 ? 10.0 / L : 1.0;
    const allowableLd = basicLd * MFt * MFc * spanMod;
    const actualLd = (L * 1000.0) / d;

    results.fs = fs;
    results.MFt = MFt;
    results.MFc = MFc;
    results.ld_basic = basicLd;
    results.ld_allowable = allowableLd;
    results.ld_actual = actualLd;

    report.addStep({
      label: 'Service Stress fs',
      equation: 'fs = 2 * fy * As,req / (3 * As,prov)',
      substituted: `2 * ${fy} * ${As_req.toFixed(1)} / (3 * ${totalAsProv.toFixed(1)})`,
      value: fs,
      unit: 'N/mm²',
      clause: 'BS 8110 Cl 3.4.6.5'
    });

    report.addStep({
      label: 'Tension Modification Factor MFt',
      equation: 'MFt = 0.55 + (477 - fs) / [120 * (0.9 + M/bd²)] ≤ 2.0',
      substituted: `0.55 + (477 - ${fs.toFixed(1)}) / [120 * (0.9 + ${M_bd2.toFixed(3)})]`,
      value: MFt,
      clause: 'BS 8110 Table 3.10'
    });

    report.addStep({
      label: 'Compression Modification Factor MFc',
      equation: 'MFc = 1 + p\' / (3 + p\') ≤ 1.5',
      substituted: `1 + ${p_prime.toFixed(3)} / (3 + ${p_prime.toFixed(3)})`,
      value: MFc,
      clause: 'BS 8110 Table 3.11'
    });

    report.addCheck({
      name: 'Span-to-Depth Deflection Limit',
      demand: actualLd,
      capacity: allowableLd,
      clause: 'BS 8110 Cl 3.4.6.1',
      unit: 'ratio'
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
