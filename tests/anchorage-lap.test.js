import test from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateAnchorageLapEC2, calculateAnchorageLapBS8110 } from '../calculators/anchorage-lap/engine.js';

test('C7 Anchorage & Lap Length Acceptance Test Suite', async (t) => {
  await t.test('EC2-1: φ16, C30/37, Good Bond, σsd = fyd', () => {
    const res = calculateAnchorageLapEC2({
      barDia: 16,
      fck: 30,
      fyk: 500,
      bondCondition: 'good',
      alpha1: 1.0,
      alpha2: 1.0,
      alpha3: 1.0,
      alpha4: 1.0,
      alpha5: 1.0,
      alpha6: 1.5
    });

    expectClose(res.fctm, 2.896, 0.5, 'EC2 fctm (MPa)');
    expectClose(res.fctk005, 2.028, 0.5, 'EC2 fctk,0.05 (MPa)');
    expectClose(res.fctd, 1.352, 0.5, 'EC2 fctd (MPa)');
    expectClose(res.fbd, 3.041, 0.5, 'EC2 fbd (MPa)');
    expectClose(res.lb_rqd, 572.1, 0.5, 'EC2 lb,rqd (mm)');
    expectClose(res.lb_rqd_phi, 35.8, 0.5, 'EC2 lb,rqd in multiples of phi');
    expectClose(res.lb_min, 171.6, 0.5, 'EC2 lb,min (mm)');
    expectClose(res.l0, 858.2, 0.5, 'EC2 l0 lap length (mm)');
    expectClose(res.l0_min, 257.5, 0.5, 'EC2 l0,min (mm)');
  });

  await t.test('EC2-1 Poor Bond Condition: φ16, C30/37', () => {
    const res = calculateAnchorageLapEC2({
      barDia: 16,
      fck: 30,
      fyk: 500,
      bondCondition: 'poor',
      alpha6: 1.5
    });

    expectClose(res.lb_rqd, 817.3, 0.5, 'EC2 lb,rqd poor bond (mm)');
  });

  await t.test('BS-1: φ16, fcu=30, fy=500, Tension', () => {
    const res = calculateAnchorageLapBS8110({
      barDia: 16,
      fcu: 30,
      fy: 500,
      forceType: 'tension'
    });

    expectClose(res.fbu, 2.739, 0.5, 'BS 8110 fbu (MPa)');
    expectClose(res.anchorage, 635.4, 0.5, 'BS 8110 anchorage length (mm)');
    expectClose(res.anchorage_phi, 39.7, 0.5, 'BS 8110 anchorage in multiples of phi');
    expectClose(res.lap_1_4, 889.5, 0.5, 'BS 8110 lap x1.4 (mm)');
    expectClose(res.lap_2_0, 1270.7, 0.5, 'BS 8110 lap x2.0 (mm)');
    assert.strictEqual(res.lap_min, 300, 'Minimum lap must be 300 mm');
  });
});
