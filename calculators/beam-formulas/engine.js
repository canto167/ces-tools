/**
 * C8 — Beam Formulas, SFD, BMD and Deflection Calculation Engine
 * Support types: simply_supported, cantilever, fixed_fixed, propped_cantilever
 * High-resolution numerical integration (N = 2000) combined with exact closed-form checks.
 */

import { CalculationReport } from '../../shared/js/core/report.js';
import { Validate } from '../../shared/js/core/validate.js';

export function calculateBeam(params) {
  const {
    supportType = 'simply_supported', // 'simply_supported', 'cantilever', 'fixed_fixed', 'propped_cantilever'
    L = 6.0,                          // Span length (m)
    pointLoads = [],                  // Array of { P: number (kN), a: number (m) }
    distributedLoads = [],            // Array of { w: number (kN/m), x1: number (m), x2: number (m) }
    E = 200000,                       // Modulus of elasticity (MPa = N/mm2 = 1000 kN/m2 * 1000 = 10^6 kN/m2)
    I = 1.0e8                         // Second moment of area (mm4)
  } = params;

  const errors = [];
  const warnings = [];

  if (!Validate.isNumber(L) || L <= 0) errors.push(`Beam span L must be greater than 0 m (got ${L}).`);
  if (!Validate.isNumber(E) || E <= 0) errors.push(`Modulus of elasticity E must be greater than 0 MPa (got ${E}).`);
  if (!Validate.isNumber(I) || I <= 0) errors.push(`Second moment of area I must be greater than 0 mm⁴ (got ${I}).`);

  // Guard load positions
  pointLoads.forEach((pl, idx) => {
    if (!Validate.isNumber(pl.a) || pl.a < 0 || pl.a > L) {
      errors.push(`Point load #${idx + 1} position a (${pl.a} m) is outside beam span [0, ${L}] m.`);
    }
  });

  warnings.push('Scope: Linear elastic beam analysis under static transverse loads. Concrete cracking, creep, reinforcement design, and moment redistribution are excluded.');

  if (errors.length > 0) {
    return { ok: false, errors, warnings, results: {}, checks: [], steps: [] };
  }

  // Convert E and I to consistent kN and m units
  // E in MPa = N/mm2 = 10^6 N/m2 = 10^3 kN/m2 -> E_kNm2 = E * 1000
  // I in mm4 = 10^-12 m4 -> I_m4 = I * 1e-12
  // EI in kNm2 = (E * 1000) * (I * 1e-12) = E * I * 1e-9 kNm2
  const EI = E * I * 1e-9; // kNm²

  const report = new CalculationReport({
    title: 'Beam Elastic Analysis & Deflection Profile',
    subtitle: `${formatSupportTitle(supportType)}, Span L = ${L} m`,
    code: 'Euler-Bernoulli Elastic Beam Theory'
  });

  const N_PTS = 2000;
  const dx = L / N_PTS;
  const xVals = new Float64Array(N_PTS + 1);
  for (let i = 0; i <= N_PTS; i++) xVals[i] = i * dx;

  // 1. Reactions & Support Moments
  let RA = 0;
  let RB = 0;
  let MA = 0;
  let MB = 0;

  // Total applied vertical load and statical moment about A
  let totalW = 0;
  let momentAboutA = 0;

  pointLoads.forEach(pl => {
    totalW += pl.P;
    momentAboutA += pl.P * pl.a;
  });

  distributedLoads.forEach(dl => {
    const start = Math.max(0, Math.min(L, dl.x1 !== undefined ? dl.x1 : 0));
    const end = Math.max(0, Math.min(L, dl.x2 !== undefined ? dl.x2 : L));
    const length = Math.max(0, end - start);
    const wTotal = dl.w * length;
    const centroid = start + length / 2;
    totalW += wTotal;
    momentAboutA += wTotal * centroid;
  });

  if (supportType === 'simply_supported') {
    RB = momentAboutA / L;
    RA = totalW - RB;
    MA = 0;
    MB = 0;
  } else if (supportType === 'cantilever') {
    // Fixed at A, free at B
    RA = totalW;
    RB = 0;
    MA = -momentAboutA; // Hogging moment at fixed support
    MB = 0;
  } else if (supportType === 'fixed_fixed') {
    // Exact superposition using standard fixed end moments
    pointLoads.forEach(pl => {
      const a = pl.a;
      const b = L - a;
      const femA = -(pl.P * a * b * b) / (L * L);
      const femB = +(pl.P * a * a * b) / (L * L);
      MA += femA;
      MB += femB;
    });

    distributedLoads.forEach(dl => {
      const start = Math.max(0, Math.min(L, dl.x1 !== undefined ? dl.x1 : 0));
      const end = Math.max(0, Math.min(L, dl.x2 !== undefined ? dl.x2 : L));
      if (start === 0 && end === L) {
        // Full span UDL
        MA += -(dl.w * L * L) / 12;
        MB += +(dl.w * L * L) / 12;
      } else {
        // Numerical integration for partial UDL fixed end moments
        for (let i = 0; i < N_PTS; i++) {
          const xMid = (xVals[i] + xVals[i + 1]) / 2;
          if (xMid >= start && xMid <= end) {
            const dP = dl.w * dx;
            const a = xMid;
            const b = L - a;
            MA += -(dP * a * b * b) / (L * L);
            MB += +(dP * a * a * b) / (L * L);
          }
        }
      }
    });

    // From statics with known end moments:
    // RB * L + MA + MB - momentAboutA = 0
    RB = (momentAboutA - MA - MB) / L;
    RA = totalW - RB;
  } else if (supportType === 'propped_cantilever') {
    // Fixed at A (x=0), Prop at B (x=L)
    // Flexibility method: primary cantilever fixed at A
    let deltaB0 = 0;
    pointLoads.forEach(pl => {
      const a = pl.a;
      // Deflection at tip B of cantilever due to P at a: P a^2 (3L - a) / (6 EI)
      deltaB0 += (pl.P * a * a * (3 * L - a)) / (6 * EI);
    });

    distributedLoads.forEach(dl => {
      const start = Math.max(0, Math.min(L, dl.x1 !== undefined ? dl.x1 : 0));
      const end = Math.max(0, Math.min(L, dl.x2 !== undefined ? dl.x2 : L));
      if (start === 0 && end === L) {
        // Full span UDL: w L^4 / (8 EI)
        deltaB0 += (dl.w * Math.pow(L, 4)) / (8 * EI);
      } else {
        for (let i = 0; i < N_PTS; i++) {
          const xMid = (xVals[i] + xVals[i + 1]) / 2;
          if (xMid >= start && xMid <= end) {
            const dP = dl.w * dx;
            deltaB0 += (dP * xMid * xMid * (3 * L - xMid)) / (6 * EI);
          }
        }
      }
    });

    // Tip deflection due to unit upward force at B: fBB = L^3 / (3 EI)
    const fBB = Math.pow(L, 3) / (3 * EI);
    RB = deltaB0 / fBB;
    RA = totalW - RB;
    MA = -(momentAboutA - RB * L);
    MB = 0;
  }

  // 2. Compute Shear Force V(x) and Bending Moment M(x) across span
  const V = new Float64Array(N_PTS + 1);
  const M = new Float64Array(N_PTS + 1);

  for (let i = 0; i <= N_PTS; i++) {
    const x = xVals[i];

    // Shear: V(x) = RA - sum(loads to the left)
    let v_x = RA;
    let m_x = MA + RA * x;

    pointLoads.forEach(pl => {
      if (x >= pl.a) {
        v_x -= pl.P;
        m_x -= pl.P * (x - pl.a);
      }
    });

    distributedLoads.forEach(dl => {
      const start = dl.x1 !== undefined ? dl.x1 : 0;
      const end = dl.x2 !== undefined ? dl.x2 : L;
      if (x > start) {
        const covered = Math.min(x, end) - start;
        if (covered > 0) {
          const wForce = dl.w * covered;
          const arm = x - (start + covered / 2);
          v_x -= wForce;
          m_x -= wForce * arm;
        }
      }
    });

    V[i] = v_x;
    M[i] = m_x;
  }

  // 3. Compute Slope theta(x) and Deflection delta(x) by double integration of M / EI
  const theta = new Float64Array(N_PTS + 1);
  const delta = new Float64Array(N_PTS + 1);

  if (supportType === 'cantilever' || supportType === 'fixed_fixed' || supportType === 'propped_cantilever') {
    // Fixed at x = 0 -> theta(0) = 0, delta(0) = 0
    theta[0] = 0;
    delta[0] = 0;

    for (let i = 0; i < N_PTS; i++) {
      // Trapezoidal rule for slope
      const mAvg = (M[i] + M[i + 1]) / 2;
      theta[i + 1] = theta[i] + (mAvg / EI) * dx;

      // Trapezoidal rule for deflection
      const thAvg = (theta[i] + theta[i + 1]) / 2;
      delta[i + 1] = delta[i] + thAvg * dx;
    }
  } else {
    // Simply Supported: delta(0) = 0, delta(L) = 0
    // Integrate M/EI with arbitrary theta0 = 0, then rotate to satisfy delta(L) = 0
    const tempTheta = new Float64Array(N_PTS + 1);
    const tempDelta = new Float64Array(N_PTS + 1);
    tempTheta[0] = 0;
    tempDelta[0] = 0;

    for (let i = 0; i < N_PTS; i++) {
      const mAvg = (M[i] + M[i + 1]) / 2;
      tempTheta[i + 1] = tempTheta[i] + (mAvg / EI) * dx;
      const thAvg = (tempTheta[i] + tempTheta[i + 1]) / 2;
      tempDelta[i + 1] = tempDelta[i] + thAvg * dx;
    }

    const endDelta = tempDelta[N_PTS];
    const initialSlope = -endDelta / L;

    theta[0] = initialSlope;
    delta[0] = 0;
    for (let i = 0; i < N_PTS; i++) {
      const mAvg = (M[i] + M[i + 1]) / 2;
      theta[i + 1] = theta[i] + (mAvg / EI) * dx;
      const thAvg = (theta[i] + theta[i + 1]) / 2;
      delta[i + 1] = delta[i] + thAvg * dx;
    }
    delta[N_PTS] = 0; // Exactly clamped to support
  }

  // Convert deflection to mm (positive = downward deflection)
  const delta_mm = new Float64Array(N_PTS + 1);
  let maxDeflection_mm = 0;
  let maxDeflectionLoc_m = 0;

  for (let i = 0; i <= N_PTS; i++) {
    // Standard sign convention: positive delta is downward
    const d = -delta[i] * 1000; // mm
    delta_mm[i] = d;
    if (Math.abs(d) > Math.abs(maxDeflection_mm)) {
      maxDeflection_mm = d;
      maxDeflectionLoc_m = xVals[i];
    }
  }

  // Find Extrema of Shear and Moment
  let maxV = -Infinity;
  let minV = Infinity;
  let maxM = -Infinity; // Max sagging (positive)
  let minM = Infinity;  // Max hogging (negative)
  let maxMLoc = 0;
  let minMLoc = 0;

  for (let i = 0; i <= N_PTS; i++) {
    const vVal = V[i];
    const mVal = M[i];
    if (vVal > maxV) maxV = vVal;
    if (vVal < minV) minV = vVal;
    if (mVal > maxM) {
      maxM = mVal;
      maxMLoc = xVals[i];
    }
    if (mVal < minM) {
      minM = mVal;
      minMLoc = xVals[i];
    }
  }

  report.addStep({
    ref: 'Static Equilibrium',
    description: 'Reaction Forces & Moments',
    formula: '\\sum F_y = 0, \\sum M = 0',
    values: `R_A = ${RA.toFixed(3)} kN, R_B = ${RB.toFixed(3)} kN, M_A = ${MA.toFixed(3)} kNm, M_B = ${MB.toFixed(3)} kNm`
  });

  report.addStep({
    ref: 'Shear Force Diagram',
    description: 'Maximum & Minimum Shear',
    formula: 'V(x) = R_A - \\sum W',
    values: `V_{max} = ${maxV.toFixed(2)} kN, V_{min} = ${minV.toFixed(2)} kN`
  });

  report.addStep({
    ref: 'Bending Moment Diagram',
    description: 'Maximum Sagging & Hogging Moments',
    formula: 'M(x) = M_A + R_A x - \\sum W(x - x_i)',
    values: `M_{sag,max} = ${maxM.toFixed(3)} kNm (at x = ${maxMLoc.toFixed(2)} m), M_{hog,max} = ${minM.toFixed(3)} kNm`
  });

  report.addStep({
    ref: 'Elastic Deflection',
    description: 'Maximum Deflection & Location',
    formula: 'EI \\frac{d^2 y}{dx^2} = M(x), EI = ' + EI.toFixed(0) + ' \\text{ kNm}²',
    values: `\\delta_{max} = ${Math.abs(maxDeflection_mm).toFixed(4)} mm (at x = ${maxDeflectionLoc_m.toFixed(2)} m)`
  });

  return {
    supportType,
    L,
    E,
    I,
    EI,
    pointLoads,
    distributedLoads,
    RA,
    RB,
    MA,
    MB,
    maxV,
    minV,
    maxM,
    maxMLoc,
    minM,
    minMLoc,
    maxDeflection_mm: Math.abs(maxDeflection_mm),
    maxDeflectionLoc_m,
    xVals,
    V,
    M,
    delta_mm,
    ok: errors.length === 0,
    errors,
    warnings,
    checks: report.getChecks(),
    steps: report.getSteps(),
    report
  };
}

function formatSupportTitle(type) {
  switch (type) {
    case 'simply_supported': return 'Simply Supported Beam';
    case 'cantilever': return 'Cantilever Beam';
    case 'fixed_fixed': return 'Fixed–Fixed Beam';
    case 'propped_cantilever': return 'Propped Cantilever Beam';
    default: return type;
  }
}
