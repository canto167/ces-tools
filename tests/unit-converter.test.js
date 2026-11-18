import test from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { convertUnits } from '../calculators/unit-converter/engine.js';

test('C11 Engineering Unit Converter Acceptance Test Suite', async (t) => {
  // Tolerance is 0.01% as specified in the prompt
  const TOL = 0.01;

  await t.test('1. 1 ksi = 6.894757 MPa', () => {
    const res = convertUnits(1.0, 'ksi', 'MPa', 'stress');
    expectClose(res, 6.894757, TOL, '1 ksi -> MPa');
  });

  await t.test('2. 1 kip = 4.448222 kN', () => {
    const res = convertUnits(1.0, 'kip', 'kN', 'force');
    expectClose(res, 4.448222, TOL, '1 kip -> kN');
  });

  await t.test('3. 1 kip·ft = 1.355818 kNm', () => {
    const res = convertUnits(1.0, 'kip·ft', 'kNm', 'moment');
    expectClose(res, 1.355818, TOL, '1 kip·ft -> kNm');
  });

  await t.test('4. 1 psf = 0.04788026 kN/m²', () => {
    const res = convertUnits(1.0, 'psf', 'kN/m2', 'area_load');
    expectClose(res, 0.04788026, TOL, '1 psf -> kN/m²');
  });

  await t.test('5. 1 lb/ft³ = 0.1570875 kN/m³', () => {
    const res = convertUnits(1.0, 'lb/ft3', 'kN/m3', 'density');
    expectClose(res, 0.1570875, TOL, '1 lb/ft³ -> kN/m³');
  });

  await t.test('6. 1 in⁴ = 416,231.4 mm⁴', () => {
    const res = convertUnits(1.0, 'in4', 'mm4', 'inertia');
    expectClose(res, 416231.4, TOL, '1 in⁴ -> mm⁴');
  });

  await t.test('7. 1 in³ = 16,387.06 mm³', () => {
    const res = convertUnits(1.0, 'in3', 'mm3', 'modulus');
    expectClose(res, 16387.06, TOL, '1 in³ -> mm³');
  });
});
