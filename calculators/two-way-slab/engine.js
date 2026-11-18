/**
 * Two-Way Slab (Simply Supported) Calculation Engine
 * Pure mathematical functions implementing BS 8110-1:1997 Table 3.13.
 */

import { Bars } from '../../shared/js/core/bars.js';
import { CalculationReport } from '../../shared/js/core/report.js';
import { Validate } from '../../shared/js/core/validate.js';

const TABLE_313 = [
  { ratio: 1.0, asx: 0.062, asy: 0.062 },
  { ratio: 1.1, asx: 0.074, asy: 0.061 },
  { ratio: 1.2, asx: 0.084, asy: 0.059 },
  { ratio: 1.3, asx: 0.093, asy: 0.055 },
  { ratio: 1.4, asx: 0.099, asy: 0.051 },
  { ratio: 1.5, asx: 0.104, asy: 0.046 },
  { ratio: 1.75, asx: 0.113, asy: 0.037 },
  { ratio: 2.0, asx: 0.118, asy: 0.029 }
];

function interpolateTable313(ratio) {
  if (ratio <= 1.0) return { asx: TABLE_313[0].asx, asy: TABLE_313[0].asy };
  if (ratio >= 2.0) {
    if (ratio > 2.0) {
      return { asx: 0.125, asy: 0.0 };
    }
    const last = TABLE_313[TABLE_313.length - 1];
    return { asx: last.asx, asy: last.asy };
  }

  for (let i = 0; i < TABLE_313.length - 1; i++) {
    const p1 = TABLE_313[i];
    const p2 = TABLE_313[i + 1];
    if (ratio >= p1.ratio && ratio <= p2.ratio) {
      const frac = (ratio - p1.ratio) / (p2.ratio - p1.ratio);
      return {
        asx: p1.asx + frac * (p2.asx - p1.asx),
        asy: p1.asy + frac * (p2.asy - p1.asy)
      };
    }
  }
  return { asx: 0.118, asy: 0.029 };
}

export function calculateTwoWaySlab(input) {
  const errors = [];
  const warnings = [];
  const report = new CalculationReport();
  const results = {};

  const lx = Number(input && input.lx);
  const ly = Number(input && input.ly);
  const h = Number(input && input.h);
  const cover = Number(input && input.cover);
  const dia = input && input.bar_dia !== undefined ? Number(input.bar_dia) : 10;
  const sx = input && input.sx !== undefined ? Number(input.sx) : 200;
  const sy = input && input.sy !== undefined ? Number(input.sy) : 300;

  const finishes = input && input.finishes !== undefined ? Number(input.finishes) : 0;
  const qk = input && input.qk !== undefined ? Number(input.qk) : 0;
  const fcu = input && input.fcu !== undefined ? Number(input.fcu) : 30;
  const fy = input && input.fy !== undefined ? Number(input.fy) : 500;

  if (!Validate.isNumber(finishes) || finishes < 0) errors.push('Finishes load must be 0 or positive.');
  if (!Validate.isNumber(qk) || qk < 0) errors.push('Imposed load qk must be 0 or positive.');
  if (!Validate.isNumber(lx) || lx <= 0) errors.push('Short span lx must be greater than 0.');
  if (!Validate.isNumber(ly) || ly <= 0) errors.push('Long span ly must be greater than 0.');
  if (lx > ly) errors.push('lx must be the shorter span (lx ≤ ly).');
  if (!Validate.isNumber(h) || h < 75) errors.push(`Slab overall depth h must be at least 75 mm (got ${h}).`);
  const coverCheck = Validate.coverSanity(cover, lx * 1000, h);
  if (!coverCheck.valid) errors.push(coverCheck.error);

  if (!Validate.isNumber(dia) || dia <= 0) errors.push('Bar diameter must be greater than 0.');
  if (!Validate.isNumber(sx) || sx <= 0) errors.push('Short span bar spacing sx must be greater than 0.');
  if (!Validate.isNumber(sy) || sy <= 0) errors.push('Long span bar spacing sy must be greater than 0.');

  const concCheck = Validate.concreteStrength(fcu, 'BS8110');
  if (!concCheck.valid) errors.push(concCheck.error);

  const steelCheck = Validate.steelStrength(fy, 'Steel yield strength');
  if (!steelCheck.valid) errors.push(steelCheck.error);

  const ratio = ly / lx;
  results.ratio = ratio;

  if (ratio > 2.0) {
    warnings.push(`Aspect ratio ly/lx (${ratio.toFixed(2)}) > 2.0: Two-way action ceases per BS 8110 Cl 3.5.3.3. Slabs with ly/lx > 2.0 must be designed as one-way spanning.`);
  }

  warnings.push('Scope: Simply supported rectangular slab on 4 non-deflecting supports with corners free to lift (BS 8110 Table 3.13). Continuous/restrained edges, torsional edge reinforcement, and point loads excluded.');

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results, checks: [], steps: [] };
  }

  const { asx, asy } = interpolateTable313(ratio);
  results.alpha_sx = asx;
  results.alpha_sy = asy;

  const gamma_conc = 24.0;
  const gk = (h / 1000.0) * gamma_conc + finishes;
  const n = 1.4 * gk + 1.6 * qk;

  const msx = asx * n * lx * lx;
  const msy = asy * n * lx * lx;

  const dx = h - cover - dia / 2.0;
  const dy = h - cover - 1.5 * dia;

  const b = 1000.0;
  const Kx = (msx * 1e6) / (b * dx * dx * fcu);
  const Ky = (msy * 1e6) / (b * dy * dy * fcu);
  const K_prime = 0.156;
  const pass_Kx = Kx <= K_prime;
  const pass_Ky = Ky <= K_prime;

  if (!pass_Kx) {
    warnings.push(`Short span section is over-reinforced (Kx = ${Kx.toFixed(4)} > K' = ${K_prime}). Concrete crushing governs; slab depth h must be increased.`);
  }
  if (!pass_Ky) {
    warnings.push(`Long span section is over-reinforced (Ky = ${Ky.toFixed(4)} > K' = ${K_prime}). Concrete crushing governs; slab depth h must be increased.`);
  }

  const zx = Math.min(dx * (0.5 + Math.sqrt(Math.max(0, 0.25 - Kx / 0.9))), 0.95 * dx);
  const Asx = (msx * 1e6) / (0.87 * fy * zx);

  const zy = Math.min(dy * (0.5 + Math.sqrt(Math.max(0, 0.25 - Ky / 0.9))), 0.95 * dy);
  const Asy = (msy * 1e6) / (0.87 * fy * zy);

  const As_min = (fy < 460 ? 0.0024 : 0.0013) * b * h; // BS 8110 Table 3.25
  const Apx = Bars.areaPerMetre(dia, sx);
  const Apy = Bars.areaPerMetre(dia, sy);

  // Deflection on short span
  const basicLd = 20.0;
  const fs = (2.0 * fy * Math.max(Asx, As_min)) / (3.0 * Apx);
  const M_bd2 = (msx * 1e6) / (b * dx * dx);
  const MF = Math.min(2.0, 0.55 + (477.0 - fs) / (120.0 * (0.9 + M_bd2)));
  const allowableLd = basicLd * MF;
  const actualLd = (lx * 1000.0) / dx;

  // Shear (conservative V = n * lx / 2)
  const V = (n * lx) / 2.0;
  const v = (V * 1e3) / (b * dx);
  const p_prov = Math.min((100.0 * Apx) / (b * dx), 3.0);
  const f_d = Math.max(Math.pow(400.0 / dx, 0.25), 1.0);
  const f_cu = Math.pow(Math.min(fcu, 40.0) / 25.0, 1 / 3);
  const vc = (0.79 / 1.25) * Math.pow(p_prov, 1 / 3) * f_d * f_cu;

  results.gk = gk;
  results.n = n;
  results.msx = msx;
  results.msy = msy;
  results.dx = dx;
  results.dy = dy;
  results.Asx = Asx;
  results.Asy = Asy;
  results.As_min = As_min;
  results.Apx = Apx;
  results.Apy = Apy;
  results.fs = fs;
  results.MF = MF;
  results.ld_allowable = allowableLd;
  results.ld_actual = actualLd;
  results.v = v;
  results.vc = vc;

  report.addStep({
    label: 'Aspect Ratio ly / lx',
    equation: 'ratio = ly / lx',
    substituted: `${ly} / ${lx}`,
    value: ratio,
    clause: 'BS 8110 Table 3.13'
  });

  report.addStep({
    label: 'Moment Coefficients',
    equation: 'Linear interpolation from Table 3.13',
    substituted: `αsx = ${asx.toFixed(4)}, αsy = ${asy.toFixed(4)}`,
    value: `${asx.toFixed(4)} / ${asy.toFixed(4)}`,
    clause: 'BS 8110 Table 3.13'
  });

  report.addStep({
    label: 'Short Span Moment msx',
    equation: 'msx = αsx * n * lx²',
    substituted: `${asx.toFixed(4)} * ${n.toFixed(2)} * ${lx}²`,
    value: msx,
    unit: 'kNm/m',
    clause: 'BS 8110 Cl 3.5.3.3'
  });

  report.addStep({
    label: 'Long Span Moment msy',
    equation: 'msy = αsy * n * lx²',
    substituted: `${asy.toFixed(4)} * ${n.toFixed(2)} * ${lx}²`,
    value: msy,
    unit: 'kNm/m',
    clause: 'BS 8110 Cl 3.5.3.3'
  });

  report.addCheck({
    name: "Short Span Section Ductility (Kx <= K')",
    demand: Kx,
    capacity: K_prime,
    status: pass_Kx ? 'PASS' : 'FAIL',
    clause: 'BS 8110 Cl 3.4.4.4',
    unit: 'ratio',
    message: pass_Kx
      ? `Kx = ${Kx.toFixed(4)} <= K' = ${K_prime} (singly reinforced ductile section)`
      : `Short span is over-reinforced (Kx = ${Kx.toFixed(4)} > K' = ${K_prime}). Concrete crushing governs. Slab depth h must be increased.`
  });

  report.addCheck({
    name: "Long Span Section Ductility (Ky <= K')",
    demand: Ky,
    capacity: K_prime,
    status: pass_Ky ? 'PASS' : 'FAIL',
    clause: 'BS 8110 Cl 3.4.4.4',
    unit: 'ratio',
    message: pass_Ky
      ? `Ky = ${Ky.toFixed(4)} <= K' = ${K_prime} (singly reinforced ductile section)`
      : `Long span is over-reinforced (Ky = ${Ky.toFixed(4)} > K' = ${K_prime}). Concrete crushing governs. Slab depth h must be increased.`
  });

  report.addCheck({
    name: 'Short Span (lx) Flexural Reinforcement',
    demand: Asx,
    capacity: Apx,
    clause: 'BS 8110 Cl 3.4.4.4',
    unit: 'mm²/m'
  });

  report.addCheck({
    name: 'Long Span (ly) Flexural Reinforcement',
    demand: Asy,
    capacity: Apy,
    clause: 'BS 8110 Cl 3.4.4.4',
    unit: 'mm²/m'
  });

  report.addCheck({
    name: 'Minimum Reinforcement (Short Span)',
    demand: As_min,
    capacity: Apx,
    clause: 'BS 8110 Cl 3.12.5.3',
    unit: 'mm²/m'
  });

  report.addCheck({
    name: 'Minimum Reinforcement (Long Span)',
    demand: As_min,
    capacity: Apy,
    clause: 'BS 8110 Cl 3.12.5.3',
    unit: 'mm²/m'
  });

  report.addCheck({
    name: 'Short Span Shear Stress (v ≤ vc)',
    demand: v,
    capacity: vc,
    clause: 'BS 8110 Cl 3.5.5.2',
    unit: 'N/mm²'
  });

  report.addCheck({
    name: 'Short Span Deflection Check',
    demand: actualLd,
    capacity: allowableLd,
    clause: 'BS 8110 Cl 3.4.6.3',
    unit: 'ratio'
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
