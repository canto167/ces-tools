import test from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateShortColumn, getBeta } from '../calculators/short-column/engine.js';

test('C6 Short Braced Column Acceptance Test Suite', async (t) => {
  await t.test('BS-1: 300x300 Column, lo=3.2m, Ends 1-1, N=1500kN (k=0.70)', () => {
    const res = calculateShortColumn({
      b: 300,
      h: 300,
      l0: 3.2,
      topEnd: 1,
      bottomEnd: 1,
      N: 1500,
      fcu: 30,
      fy: 500,
      k: 0.70,
      cover: 30,
      barCount: 4,
      barDiam: 20
    });

    expectClose(res.beta, 0.75, 0.5, 'Beta factor');
    expectClose(res.le, 2.40, 0.5, 'Effective length le (m)');
    expectClose(res.ratio_h, 8.0, 0.5, 'Slenderness ratio le/h');
    assert.strictEqual(res.isShort, true, 'Must be classified as short column');
    expectClose(res.Asc_req, 1200.0, 0.5, 'Required longitudinal steel Asc,req (mm2)');
    expectClose(res.Asc_prov, 1256.6, 0.5, 'Provided steel 4H20 (mm2)');
    expectClose(res.capacity, 1519.8, 0.5, 'Design axial capacity (kN)');
    expectClose(res.Nuz, 1761.6, 0.5, 'Short-term capacity Nuz (kN)');
    assert.strictEqual(res.linkDiam, 6, 'Link diameter must be 6 mm');
    expectClose(res.linkSpacing, 240, 0.5, 'Link spacing must be 240 mm');
    assert.strictEqual(res.status, 'PASS', 'Overall status must PASS');
  });

  await t.test('BS-1 with k=0.75 option', () => {
    const res = calculateShortColumn({
      b: 300,
      h: 300,
      l0: 3.2,
      topEnd: 1,
      bottomEnd: 1,
      N: 1500,
      fcu: 30,
      fy: 500,
      k: 0.75,
      cover: 30,
      barCount: 4,
      barDiam: 20
    });

    expectClose(res.Asc_req, 1120.0, 0.5, 'Required longitudinal steel with k=0.75 (mm2)');
  });

  await t.test('Slender column detection: lo=7.0m, Ends 3-3 -> Slender FAIL', () => {
    const res = calculateShortColumn({
      b: 300,
      h: 300,
      l0: 7.0,
      topEnd: 3,
      bottomEnd: 3,
      N: 1500,
      fcu: 30,
      fy: 500
    });

    assert.strictEqual(res.beta, 1.00);
    expectClose(res.ratio_h, 23.33, 0.5, 'Slenderness ratio');
    assert.strictEqual(res.isShort, false, 'Must fail slenderness');
    assert.strictEqual(res.status, 'FAIL', 'Overall status must be FAIL');
  });
});
