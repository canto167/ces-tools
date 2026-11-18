import test from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateBeam } from '../calculators/beam-formulas/engine.js';

test('C8 Beam Formulas & Diagrams Acceptance Test Suite', async (t) => {
  const E = 200000; // MPa
  const I = 1.0e8;   // mm4

  await t.test('Test 1: SS, L=6m, UDL=10 kN/m', () => {
    const res = calculateBeam({
      supportType: 'simply_supported',
      L: 6.0,
      distributedLoads: [{ w: 10, x1: 0, x2: 6.0 }],
      E,
      I
    });

    expectClose(res.RA, 30.0, 0.5, 'RA reaction');
    expectClose(res.RB, 30.0, 0.5, 'RB reaction');
    expectClose(res.maxM, 45.0, 0.5, 'Max sagging moment');
    expectClose(res.maxMLoc, 3.0, 0.5, 'Max moment location');
    expectClose(res.maxDeflection_mm, 8.4375, 0.5, 'Max deflection (mm)');
  });

  await t.test('Test 2a: SS, L=6m, Point Load P=40kN at a=2m', () => {
    const res = calculateBeam({
      supportType: 'simply_supported',
      L: 6.0,
      pointLoads: [{ P: 40, a: 2.0 }],
      E,
      I
    });

    expectClose(res.RA, 26.667, 0.5, 'RA reaction');
    expectClose(res.RB, 13.333, 0.5, 'RB reaction');
    expectClose(res.maxM, 53.333, 0.5, 'Max moment');
    expectClose(res.maxMLoc, 2.0, 0.5, 'Max moment location');
  });

  await t.test('Test 2b: SS, L=6m, Central Point Load P=40kN at a=3m -> delta=9.000 mm', () => {
    const res = calculateBeam({
      supportType: 'simply_supported',
      L: 6.0,
      pointLoads: [{ P: 40, a: 3.0 }],
      E,
      I
    });

    expectClose(res.maxDeflection_mm, 9.000, 0.5, 'Midspan deflection (mm)');
    expectClose(res.maxDeflectionLoc_m, 3.0, 0.5, 'Midspan deflection location');
  });

  await t.test('Test 3: SS, L=8m, UDL=5 kN/m + P=20kN at a=3m', () => {
    const res = calculateBeam({
      supportType: 'simply_supported',
      L: 8.0,
      distributedLoads: [{ w: 5, x1: 0, x2: 8.0 }],
      pointLoads: [{ P: 20, a: 3.0 }],
      E,
      I
    });

    expectClose(res.RA, 32.5, 0.5, 'RA reaction');
    expectClose(res.RB, 27.5, 0.5, 'RB reaction');
    expectClose(res.maxM, 75.0, 0.5, 'Max moment at x=3m');
    expectClose(res.maxMLoc, 3.0, 0.5, 'Max moment location');

    // Moment at x = 4m: index 4 / 8 * 2000 = 1000
    const mAt4m = res.M[1000];
    expectClose(mAt4m, 70.0, 0.5, 'Moment at x=4m');
  });

  await t.test('Test 4: Cantilever, L=3m, UDL=8 kN/m + Tip P=10kN at x=3m', () => {
    const res = calculateBeam({
      supportType: 'cantilever',
      L: 3.0,
      distributedLoads: [{ w: 8, x1: 0, x2: 3.0 }],
      pointLoads: [{ P: 10, a: 3.0 }],
      E,
      I
    });

    expectClose(res.RA, 34.0, 0.5, 'Total shear reaction at fixed support');
    expectClose(res.MA, -66.0, 0.5, 'Moment at fixed support');

    // UDL only deflection check: delta_tip = 4.05 mm
    const resUdlOnly = calculateBeam({
      supportType: 'cantilever',
      L: 3.0,
      distributedLoads: [{ w: 8, x1: 0, x2: 3.0 }],
      E,
      I
    });
    expectClose(resUdlOnly.maxDeflection_mm, 4.05, 0.5, 'Tip deflection for UDL only (mm)');
  });

  await t.test('Test 5: Fixed–Fixed, L=6m, UDL=10 kN/m', () => {
    const res = calculateBeam({
      supportType: 'fixed_fixed',
      L: 6.0,
      distributedLoads: [{ w: 10, x1: 0, x2: 6.0 }],
      E,
      I
    });

    expectClose(res.MA, -30.0, 0.5, 'Support moment MA');
    expectClose(res.MB, 30.0, 0.5, 'Support moment MB (fixed end moment)');
    const midM = res.M[1000]; // x = 3.0m
    expectClose(midM, 15.0, 0.5, 'Midspan moment Mmid');
    expectClose(res.maxDeflection_mm, 1.6875, 0.5, 'Midspan deflection (mm)');
  });

  await t.test('Test 5b: Fixed–Fixed Unsymmetrical Point Load (B1 Verification: P=40kN at a=1.5m on L=6m)', () => {
    const res = calculateBeam({
      supportType: 'fixed_fixed',
      L: 6.0,
      pointLoads: [{ P: 40, a: 1.5 }],
      E,
      I
    });

    // Exact theoretical values:
    // b = 4.5m
    // MA = -P*a*b^2/L^2 = -40*1.5*20.25/36 = -33.75 kNm
    // MB = +P*a^2*b/L^2 = +40*2.25*4.5/36 = +11.25 kNm
    // RB = P*a^2*(3L - 2a)/L^3 = 40*2.25*15/216 = 6.25 kN
    // RA = 40 - 6.25 = 33.75 kN
    expectClose(res.MA, -33.75, 0.5, 'Fixed end moment MA');
    expectClose(res.MB, 11.25, 0.5, 'Fixed end moment MB');
    expectClose(res.RA, 33.75, 0.5, 'Left vertical reaction RA');
    expectClose(res.RB, 6.25, 0.5, 'Right vertical reaction RB');
  });

  await t.test('Test 6: Propped Cantilever, L=6m, UDL=10 kN/m', () => {
    const res = calculateBeam({
      supportType: 'propped_cantilever',
      L: 6.0,
      distributedLoads: [{ w: 10, x1: 0, x2: 6.0 }],
      E,
      I
    });

    expectClose(res.RB, 22.5, 0.5, 'Prop reaction RB');
    expectClose(res.RA, 37.5, 0.5, 'Fixed reaction RA');
    expectClose(res.MA, -45.0, 0.5, 'Fixed end moment MA');
    expectClose(res.maxM, 25.3125, 0.5, 'Maximum sagging moment');
    expectClose(res.maxMLoc, 3.75, 0.5, 'Location of max sagging moment from A');
    expectClose(res.maxDeflection_mm, 3.51, 1.0, 'Max deflection (within 1%)');
  });
});
