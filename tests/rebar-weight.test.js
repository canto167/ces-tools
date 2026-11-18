import test from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { rebarWeightPerMetre, rebarRuleOfThumb, calculateSchedule } from '../calculators/rebar-weight/engine.js';

test('C9 Rebar Weight & Quantity Acceptance Test Suite', async (t) => {
  await t.test('Unit weights: exact vs rule of thumb (tol 0.1%)', () => {
    // φ12
    expectClose(rebarWeightPerMetre(12), 0.8878, 0.1, 'φ12 exact weight (kg/m)');
    expectClose(rebarRuleOfThumb(12), 0.889, 0.1, 'φ12 rule weight (kg/m)');

    // φ16
    expectClose(rebarWeightPerMetre(16), 1.5783, 0.1, 'φ16 exact weight (kg/m)');
    expectClose(rebarRuleOfThumb(16), 1.580, 0.1, 'φ16 rule weight (kg/m)');

    // φ20
    expectClose(rebarWeightPerMetre(20), 2.4662, 0.1, 'φ20 exact weight (kg/m)');
    expectClose(rebarRuleOfThumb(20), 2.469, 0.1, 'φ20 rule weight (kg/m)');
  });

  await t.test('Row test: 10 members x 4 bars x 6.0m of φ16 -> 240m, 378.8 kg', () => {
    const res = calculateSchedule([
      { mark: '01', dia: 16, members: 10, barsPerMember: 4, length: 6.0 }
    ], 0);

    const row = res.rows[0];
    expectClose(row.totalLength, 240.0, 0.1, 'Row total length (m)');
    expectClose(row.totalWeightKg, 378.8, 0.1, 'Row total weight (kg)');
    expectClose(res.grandTotalLength, 240.0, 0.1, 'Grand total length (m)');
    expectClose(res.grandTotalWeightKg, 378.8, 0.1, 'Grand total weight (kg)');
    expectClose(res.grandTotalTonnes, 0.3788, 0.1, 'Grand total tonnes');
  });

  await t.test('Wastage allowance: 5% on 378.8 kg -> 397.74 kg', () => {
    const res = calculateSchedule([
      { mark: '01', dia: 16, members: 10, barsPerMember: 4, length: 6.0 }
    ], 5);

    expectClose(res.grandTotalWithWastageKg, 397.74, 0.1, 'Weight with 5% wastage (kg)');
  });
});
