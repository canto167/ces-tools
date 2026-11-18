/**
 * C10 — Cantilever Retaining Wall Calculation Engine
 * Stability (Overturning, Sliding, Bearing) & BS 8110 Stem Design
 */

import { CalculationReport } from '../../shared/js/core/report.js';
import { Validate } from '../../shared/js/core/validate.js';

export function calculateRetainingWall(params) {
  const p = params || {};
  const h_stem = p.h_stem !== undefined ? Number(p.h_stem) : 4.0;       // Stem height (m)
  const t_stem = p.t_stem !== undefined ? Number(p.t_stem) : 0.3;       // Stem thickness (m)
  const t_base = p.t_base !== undefined ? Number(p.t_base) : 0.4;       // Base thickness (m)
  const b_toe = p.b_toe !== undefined ? Number(p.b_toe) : 0.8;         // Toe projection (m)
  const b_heel = p.b_heel !== undefined ? Number(p.b_heel) : 2.4;       // Heel projection (m)
  const gamma_soil = p.gamma_soil !== undefined ? Number(p.gamma_soil) : 18.0;  // Soil unit weight (kN/m3)
  const phi = p.phi !== undefined ? Number(p.phi) : 30.0;          // Angle of internal friction (deg)
  const q_surcharge = p.q_surcharge !== undefined ? Number(p.q_surcharge) : 10.0; // Surcharge pressure (kN/m2)
  const mu = p.mu !== undefined ? Number(p.mu) : 0.5;            // Base-soil coefficient of friction
  const gamma_conc = p.gamma_conc !== undefined ? Number(p.gamma_conc) : 24.0;  // Concrete unit weight (kN/m3)
  const q_all = p.q_all !== undefined ? Number(p.q_all) : 150.0;       // Allowable soil bearing capacity (kN/m2)
  const cover = p.cover !== undefined ? Number(p.cover) : 40;          // Nominal cover to stem vertical bars (mm)
  const barDia = p.barDia !== undefined ? Number(p.barDia) : 16;        // Vertical bar diameter (mm)
  const barSpacing = p.barSpacing !== undefined ? Number(p.barSpacing) : 150;   // Vertical bar spacing (mm c/c)
  const fcu = p.fcu !== undefined ? Number(p.fcu) : 30;            // Concrete cube strength (MPa)
  const fy = p.fy !== undefined ? Number(p.fy) : 500;             // Reinforcement yield strength (MPa)

  const errors = [];
  const warnings = [];

  // Input Guards (STRUCT-Agent & Codex Hardening)
  if (!Validate.isNumber(h_stem) || h_stem < 1.0) errors.push(`Stem height h_stem must be at least 1.0 m (got ${h_stem}).`);
  if (!Validate.isNumber(t_stem) || t_stem < 0.15) errors.push(`Stem thickness t_stem must be at least 0.15 m (got ${t_stem}).`);
  if (!Validate.isNumber(t_base) || t_base < 0.20) errors.push(`Base thickness t_base must be at least 0.20 m (got ${t_base}).`);
  if (!Validate.isNumber(b_toe) || b_toe < 0.1) errors.push(`Toe projection b_toe must be at least 0.1 m (got ${b_toe}).`);
  if (!Validate.isNumber(b_heel) || b_heel < 0.2) errors.push(`Heel projection b_heel must be at least 0.2 m (got ${b_heel}).`);

  const phiCheck = Validate.soilFriction(phi);
  if (!phiCheck.valid) errors.push(phiCheck.error);

  if (!Validate.isNumber(gamma_soil) || gamma_soil < 12 || gamma_soil > 24) {
    errors.push(`Soil unit weight gamma_soil (${gamma_soil} kN/m³) is outside standard range [12, 24] kN/m³.`);
  }
  if (!Validate.isNumber(mu) || mu < 0.2 || mu > 0.8) {
    errors.push(`Base-soil friction coefficient mu (${mu}) must be in range [0.2, 0.8].`);
  }
  if (!Validate.isNumber(q_all) || q_all <= 0) {
    errors.push(`Allowable soil bearing capacity q_all must be greater than 0.`);
  }
  if (!Validate.isNumber(gamma_conc) || gamma_conc <= 0) {
    errors.push(`Concrete unit weight gamma_conc must be greater than 0.`);
  }
  if (!Validate.isNumber(barSpacing) || barSpacing <= 0) {
    errors.push(`Vertical bar spacing must be greater than 0.`);
  }
  if (!Validate.isNumber(barDia) || barDia <= 0) {
    errors.push(`Vertical bar diameter must be greater than 0.`);
  }
  if (!Validate.isNumber(q_surcharge) || q_surcharge < 0) {
    errors.push(`Surcharge pressure q_surcharge must be 0 or positive.`);
  }

  const concCheck = Validate.concreteStrength(fcu, 'BS8110');
  if (!concCheck.valid) errors.push(concCheck.error);

  const steelCheck = Validate.steelStrength(fy, 'Steel yield strength');
  if (!steelCheck.valid) errors.push(steelCheck.error);

  const coverCheck = Validate.coverSanity(cover, t_stem * 1000, t_stem * 1000);
  if (!coverCheck.valid) errors.push(coverCheck.error);

  warnings.push('Scope: Cantilever RC retaining wall with dry granular cohesive-less backfill (Rankine theory, horizontal backfill). Hydrostatic groundwater pressure, sloping backfill, seismic forces, and deep global slip-circle slope stability excluded.');
  warnings.push('Scope Limitation: Verification applies to overall wall stability and stem section only. Heel and toe base slab flexure and shear design are excluded and must be designed separately.');

  const report = new CalculationReport({
    title: 'Cantilever Retaining Wall Stability & Stem Design',
    subtitle: `H = ${(h_stem + t_base).toFixed(2)} m, Base B = ${(b_toe + t_stem + b_heel).toFixed(2)} m`,
    code: 'Rankine Active Earth Pressure & BS 8110-1:1997'
  });

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results: {}, checks: [], steps: [] };
  }

  // Overall Geometry
  const H = h_stem + t_base; // Total height (m)
  const B = b_toe + t_stem + b_heel; // Total base width (m)

  // 1. Rankine Active Earth Pressure Coefficient
  const phiRad = (phi * Math.PI) / 180;
  const sinPhi = Math.sin(phiRad);
  const Ka = (1 - sinPhi) / (1 + sinPhi);

  // Active thrust on full height H
  const Pa = 0.5 * Ka * gamma_soil * H * H; // kN/m
  const y_Pa = H / 3; // m from base

  const Pq = Ka * q_surcharge * H; // kN/m
  const y_Pq = H / 2; // m from base

  const PH = Pa + Pq; // Total horizontal driving thrust (kN/m)
  const Mo = Pa * y_Pa + Pq * y_Pq; // Overturning moment about toe (kNm/m)

  // 2. Vertical Restoring Forces & Moments about Toe (x = 0)
  // Stem:
  const W_stem = t_stem * h_stem * gamma_conc;
  const x_stem = b_toe + t_stem / 2;
  const Mr_stem = W_stem * x_stem;

  // Base:
  const W_base = B * t_base * gamma_conc;
  const x_base = B / 2;
  const Mr_base = W_base * x_base;

  // Backfill Soil on Heel:
  const W_soil = b_heel * h_stem * gamma_soil;
  const x_soil = b_toe + t_stem + b_heel / 2;
  const Mr_soil = W_soil * x_soil;

  // Permanent Restoring Totals (Surcharge excluded from OT and sliding resistance)
  const W_tot = W_stem + W_base + W_soil; // kN/m
  const Mr = Mr_stem + Mr_base + Mr_soil; // kNm/m

  // Factors of Safety
  const FoS_OT = Mr / Mo;
  const pass_OT = FoS_OT >= 2.0;

  const R_slide = mu * W_tot; // Frictional resistance (kN/m)
  const FoS_slide = R_slide / PH;
  const pass_slide = FoS_slide >= 1.5;

  // 3. Soil Bearing Pressure (including surcharge on heel)
  const W_sur = q_surcharge * b_heel; // kN/m
  const x_sur = x_soil;
  const Mr_sur = W_sur * x_sur;

  const V_bear = W_tot + W_sur; // Total vertical force for bearing (kN/m)
  const Mr_bear_total = Mr + Mr_sur;
  const M_net = Mr_bear_total - Mo; // Net restoring moment about toe

  const x_bar = M_net / V_bear; // Line of action of resultant from toe (m)
  const e = B / 2 - x_bar; // Eccentricity from centerline of base (m)
  const kern = B / 6; // Middle third limit (m)
  const pass_kern = Math.abs(e) <= kern;

  let p_max = 0;
  let p_min = 0;
  let pass_bearing = false;

  if (pass_kern) {
    p_max = (V_bear / B) * (1 + (6 * e) / B);
    p_min = (V_bear / B) * (1 - (6 * e) / B);
    pass_bearing = p_max <= q_all && p_min >= 0;
  } else {
    // Resultant outside kern: triangular distribution
    p_max = (2 * V_bear) / (3 * x_bar);
    p_min = 0;
    pass_bearing = p_max <= q_all;
  }

  // 4. Stem Design at Base of Stem (BS 8110-1:1997)
  const Pa_stem = 0.5 * Ka * gamma_soil * Math.pow(h_stem, 2);
  const Ma_stem = Pa_stem * (h_stem / 3);

  const Pq_stem = Ka * q_surcharge * h_stem;
  const Mq_stem = Pq_stem * (h_stem / 2);

  // ULS design moment & shear (1.4 earth + 1.6 surcharge)
  const Mu = 1.4 * Ma_stem + 1.6 * Mq_stem; // kNm/m
  const Vu = 1.4 * Pa_stem + 1.6 * Pq_stem; // kN/m

  const b_strip = 1000; // 1 m strip width (mm)
  const d_stem = t_stem * 1000 - cover - barDia / 2; // Effective depth (mm)

  const K_stem = (Mu * 1e6) / (b_strip * Math.pow(d_stem, 2) * fcu);
  const K_prime = 0.156;
  const pass_K = K_stem <= K_prime;
  if (!pass_K) {
    warnings.push(`Stem section is over-reinforced (K = ${K_stem.toFixed(4)} > K' = ${K_prime}). Concrete crushing governs; stem thickness t_stem must be increased.`);
  }

  const z_stem = Math.min(
    0.95 * d_stem,
    d_stem * (0.5 + Math.sqrt(Math.max(0, 0.25 - K_stem / 0.9)))
  );

  const As_req = (Mu * 1e6) / (0.87 * fy * z_stem); // mm2/m
  const As_min = 0.0013 * b_strip * (t_stem * 1000); // 0.13% bh
  const As_gov_req = Math.max(As_req, As_min);

  const singleBarArea = (Math.PI * barDia * barDia) / 4;
  const As_prov = (1000 / barSpacing) * singleBarArea; // mm2/m
  const pass_steel = pass_K && As_prov >= As_gov_req;

  // Shear stress at stem base
  const v_stem = (Vu * 1000) / (b_strip * d_stem); // N/mm2

  // Concrete shear stress capacity vc (BS 8110 Table 3.8)
  const fcu_shear = Math.min(fcu, 40);
  const p100 = Math.min(3.0, (100 * As_prov) / (b_strip * d_stem));
  const depthFactor = Math.max(1.0, Math.pow(400 / d_stem, 0.25));
  const vc_stem = (0.79 / 1.25) * Math.pow(p100, 1 / 3) * depthFactor * Math.pow(fcu_shear / 25, 1 / 3);
  const pass_shear = v_stem <= vc_stem;

  const overallPass = pass_OT && pass_slide && pass_kern && pass_bearing && pass_steel && pass_shear && pass_K;

  // Add steps to report
  report.addStep({
    ref: 'Rankine Theory',
    description: 'Active Earth Pressure Coefficients',
    formula: 'K_a = \\frac{1 - \\sin\\phi\'}{1 + \\sin\\phi\'}',
    values: `\\phi\' = ${phi}^\\circ \\rightarrow K_a = ${Ka.toFixed(4)}, H = ${H.toFixed(2)} m`
  });

  report.addStep({
    ref: 'Lateral Thrusts',
    description: 'Active Earth & Surcharge Thrusts',
    formula: 'P_a = \\frac{1}{2} K_a \\gamma H^2, P_q = K_a q H',
    values: `P_a = ${Pa.toFixed(2)} kN/m, P_q = ${Pq.toFixed(2)} kN/m, M_o = ${Mo.toFixed(2)} kNm/m`
  });

  report.addStep({
    ref: 'Permanent Weights',
    description: 'Restoring Forces & Moments about Toe',
    formula: 'W = W_{stem} + W_{base} + W_{soil}',
    values: `Stem = ${W_stem.toFixed(1)}, Base = ${W_base.toFixed(1)}, Soil = ${W_soil.toFixed(1)} \\rightarrow W_{tot} = ${W_tot.toFixed(1)} kN/m, M_r = ${Mr.toFixed(1)} kNm/m`
  });

  report.addCheck({
    title: 'Overturning Stability (FoS_OT)',
    ratio: 2.0 / FoS_OT,
    allowable: 2.0,
    actual: FoS_OT,
    unit: '',
    pass: pass_OT,
    clause: 'BS 8002 / Traditional Safety',
    message: `FoS_OT = ${FoS_OT.toFixed(2)} >= 2.0`
  });

  report.addCheck({
    title: 'Sliding Stability (FoS_slide)',
    ratio: 1.5 / FoS_slide,
    allowable: 1.5,
    actual: FoS_slide,
    unit: '',
    pass: pass_slide,
    clause: 'BS 8002 / Traditional Safety',
    message: `FoS_slide = ${FoS_slide.toFixed(2)} >= 1.5`
  });

  report.addCheck({
    title: 'Base Pressure & Middle-Third Kern',
    ratio: p_max / q_all,
    allowable: q_all,
    actual: p_max,
    unit: 'kPa',
    pass: pass_bearing && pass_kern,
    clause: 'Soil Bearing Capacity Check',
    message: `e = ${e.toFixed(3)} m <= B/6 = ${kern.toFixed(3)} m; p_max = ${p_max.toFixed(1)} kPa <= ${q_all} kPa, p_min = ${p_min.toFixed(1)} kPa`
  });

  report.addStep({
    ref: 'BS 8110-1:1997 Cl 3.4.4',
    description: 'Stem Base ULS Design Actions',
    formula: 'M_u = 1.4 M_{a,stem} + 1.6 M_{q,stem}, V_u = 1.4 P_{a,stem} + 1.6 P_{q,stem}',
    values: `M_u = ${Mu.toFixed(1)} kNm/m, V_u = ${Vu.toFixed(1)} kN/m, d = ${d_stem.toFixed(0)} mm`
  });

  report.addCheck({
    title: "Stem Section Ductility (K <= K')",
    ratio: K_stem / K_prime,
    allowable: K_prime,
    actual: K_stem,
    unit: 'ratio',
    pass: pass_K,
    clause: 'BS 8110-1:1997 Cl 3.4.4.4',
    message: pass_K
      ? `K = ${K_stem.toFixed(4)} <= K' = ${K_prime} (singly reinforced stem valid)`
      : `Stem section is over-reinforced (K = ${K_stem.toFixed(4)} > K' = ${K_prime}). Concrete crushing governs. Stem thickness t_stem must be increased.`
  });

  report.addCheck({
    title: 'Stem Flexural Reinforcement',
    ratio: As_gov_req / As_prov,
    allowable: As_prov,
    actual: As_gov_req,
    unit: 'mm²/m',
    pass: pass_steel,
    clause: 'BS 8110-1:1997 Cl 3.4.4.4',
    message: `H${barDia} @ ${barSpacing} mm (${As_prov.toFixed(1)} mm²/m) >= As,req = ${As_gov_req.toFixed(1)} mm²/m`
  });

  report.addCheck({
    title: 'Stem Shear Stress (No Shear Links)',
    ratio: v_stem / vc_stem,
    allowable: vc_stem,
    actual: v_stem,
    unit: 'N/mm²',
    pass: pass_shear,
    clause: 'BS 8110-1:1997 Cl 3.4.5.4',
    message: `v = ${v_stem.toFixed(3)} N/mm² <= vc = ${vc_stem.toFixed(3)} N/mm²`
  });

  return {
    inputs: params,
    H,
    B,
    Ka,
    Pa,
    Pq,
    PH,
    Mo,
    W_stem,
    W_base,
    W_soil,
    W_tot,
    Mr,
    FoS_OT,
    FoS_slide,
    V_bear,
    e,
    kern,
    p_max,
    p_min,
    Mu,
    Vu,
    d_stem,
    As_req,
    As_prov,
    v_stem,
    vc_stem,
    pass_OT,
    pass_slide,
    pass_kern,
    pass_bearing,
    pass_steel,
    pass_shear,
    pass_K,
    status_text: overallPass ? 'PASS (Stability & Stem Only - Base Slab Excluded)' : 'FAIL',
    status: overallPass ? 'PASS' : 'FAIL',
    ok: errors.length === 0,
    errors,
    warnings,
    checks: report.getChecks(),
    steps: report.getSteps(),
    report
  };
}
