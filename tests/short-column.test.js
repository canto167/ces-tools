import test from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateShortColumn, getBeta } from '../calculators/short-column/engine.js';

test('C6 Short Braced Column Acceptance Test Suite', async (t) => {
  // BS 8110-1:1997 (Amd 1-4) Eq 38: N = 0.4 fcu Ac + 0.75 Asc fy, Ac = net area = bh - Asc
  await t.test('BS-1: 300x300 Column, lo=3.2m, Ends 1-1, N=1500kN, Eq 38', () => {
    const res = calculateShortColumn({
      b: 300, h: 300, l0: 3.2, topEnd: 1, bottomEnd: 1, N: 1500,
      fcu: 30, fy: 500, equation: 'eq38', cover: 30, barCount: 4, barDiam: 20
    });

    expectClose(res.beta, 0.75, 0.5, 'Beta factor');
    expectClose(res.le, 2.40, 0.5, 'Effective length le (m)');
    expectClose(res.ratio_h, 8.0, 0.5, 'Slenderness ratio le/h');
    assert.strictEqual(res.isShort, true, 'Must be classified as short column');
    // Asc,req = (1500e3 - 0.4*30*90000) / (0.75*500 - 0.4*30) = 420000 / 363 = 1157.0 mm²
    expectClose(res.Asc_req, 1157.0, 0.5, 'Required longitudinal steel Asc,req (mm2)');
    expectClose(res.Asc_prov, 1256.6, 0.5, 'Provided steel 4H20 (mm2)');
    expectClose(res.Ac, 88743.4, 0.1, 'Net concrete area Ac (mm2)');
    // N = 0.4*30*88743.4 + 0.75*500*1256.6 = 1064.9 + 471.2 = 1536.2 kN
    expectClose(res.capacity, 1536.2, 0.5, 'Design axial capacity (kN)');
    // Nuz = 0.45*30*88743.4 + 0.87*500*1256.6 = 1198.0 + 546.6 = 1744.7 kN
    expectClose(res.Nuz, 1744.7, 0.5, 'Nuz (kN)');
    assert.strictEqual(res.linkDiam, 6, 'Link diameter must be 6 mm');
    expectClose(res.linkSpacing, 240, 0.5, 'Link spacing must be 240 mm');
    assert.strictEqual(res.status, 'PASS', 'Overall status must PASS');
  });

  // Eq 39: N = 0.35 fcu Ac + 0.67 Asc fy (approximately symmetrical beams)
  await t.test('BS-2: same column with Eq 39 needs more steel; 4H20 fails, 6H20 passes', () => {
    const base = { b: 300, h: 300, l0: 3.2, topEnd: 1, bottomEnd: 1, N: 1500, fcu: 30, fy: 500, equation: 'eq39', cover: 30, barDiam: 20 };
    const r4 = calculateShortColumn({ ...base, barCount: 4 });
    // Asc,req = (1500e3 - 0.35*30*90000) / (0.67*500 - 0.35*30) = 555000 / 324.5 = 1710.3 mm²
    expectClose(r4.Asc_req, 1710.3, 0.5, 'Asc,req Eq 39');
    // N = 0.35*30*88743.4 + 0.67*500*1256.6 = 931.8 + 421.0 = 1352.8 kN < 1500
    expectClose(r4.capacity, 1352.8, 0.5, 'capacity 4H20 Eq 39');
    assert.strictEqual(r4.status, 'FAIL');
    const r6 = calculateShortColumn({ ...base, barCount: 6 });
    // Asc = 1885.0; Ac = 88115.0; N = 0.35*30*88115 + 0.67*500*1885 = 925.2 + 631.5 = 1556.7 kN
    expectClose(r6.capacity, 1556.7, 0.5, 'capacity 6H20 Eq 39');
    assert.strictEqual(r6.status, 'PASS');
  });

  await t.test('Unknown equation is rejected', () => {
    const res = calculateShortColumn({ b: 300, h: 300, l0: 3.2, N: 1500, equation: 'eq40' });
    assert.strictEqual(res.ok, false);
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
