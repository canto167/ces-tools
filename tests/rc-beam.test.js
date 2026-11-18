import { test, describe } from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateRcBeam } from '../calculators/rc-beam/engine.js';

describe('C1 RC Rectangular Beam Acceptance Test Suite', () => {
  const common = {
    b: 300,
    h: 500,
    cover: 30,
    link_dia: 10,
    link_legs: 2,
    link_spacing: 150,
    fck: 30,
    fcu: 30,
    fyk: 500,
    fy: 500,
    fywk: 500,
    fyv: 500,
    L: 6.0,
    support: 'simply_supported',
    agg: 20,
    top_bars_n: 2,
    top_bars_dia: 16
  };

  test('EC2-1: Singly reinforced beam with 4H20', () => {
    const input = {
      ...common,
      code: 'EC2',
      bars_n: 4,
      bars_dia: 20,
      M: 189,
      V: 126
    };

    const out = calculateRcBeam(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.d, 450.0, 0.5, 'EC2-1 d');
    expectClose(out.results.K, 0.1037, 0.5, 'EC2-1 K');
    expectClose(out.results.z, 404.2, 0.5, 'EC2-1 z');
    expectClose(out.results.As, 1075.5, 0.5, 'EC2-1 As');
    expectClose(out.results.As_prov, 1256.6, 0.5, 'EC2-1 As,prov');
    expectClose(out.results.VRd_c, 81.9, 0.5, 'EC2-1 VRd,c');
    expectClose(out.results.VRd_max, 442.4, 0.5, 'EC2-1 VRd,max');
    expectClose(out.results.Asw_s, 0.286, 0.5, 'EC2-1 Asw/s');
    expectClose(out.results.ld_basic, 16.65, 0.5, 'EC2-1 l/d basic');
    expectClose(out.results.ld_allowable, 19.45, 0.5, 'EC2-1 l/d allowable');
    expectClose(out.results.ld_actual, 13.33, 0.5, 'EC2-1 actual span/d');

    // Bar spacing check: b=300, cover=30, link=10 -> width inside = 220. 4H20 -> gap = (220 - 80) / 3 = 46.67mm >= 25mm PASS
    const barSpacingCheck = out.checks.find(c => c.name === 'Clear Horizontal Bar Spacing');
    assert.strictEqual(barSpacingCheck.status, 'PASS');
  });

  test('EC2-2: Doubly reinforced beam with 5H25 (Fails bar spacing)', () => {
    const input = {
      ...common,
      code: 'EC2',
      bars_n: 5,
      bars_dia: 25,
      M: 330,
      V: 200
    };

    const out = calculateRcBeam(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.d, 447.5, 0.5, 'EC2-2 d');
    expectClose(out.results.K, 0.1831, 0.5, 'EC2-2 K');
    expectClose(out.results.z, 367.2, 0.5, 'EC2-2 z');
    expectClose(out.results.As2, 167.0, 0.5, 'EC2-2 As2 (compression steel)');
    expectClose(out.results.As, 2052.4, 0.5, 'EC2-2 As1 (total tension steel)');
    expectClose(out.results.As_prov, 2454.4, 0.5, 'EC2-2 As,prov');
    expectClose(out.results.VRd_c, 102.1, 0.5, 'EC2-2 VRd,c');
    expectClose(out.results.VRd_max, 440.0, 0.5, 'EC2-2 VRd,max');
    expectClose(out.results.Asw_s, 0.457, 0.5, 'EC2-2 Asw/s');
    expectClose(out.results.ld_basic, 14.42, 0.5, 'EC2-2 l/d basic');
    expectClose(out.results.ld_allowable, 17.25, 0.5, 'EC2-2 l/d allowable');
    expectClose(out.results.ld_actual, 13.41, 0.5, 'EC2-2 actual span/d');

    // Bar spacing check must FAIL: (220 - 125) / 4 = 23.75 mm < 25 mm
    const barSpacingCheck = out.checks.find(c => c.name === 'Clear Horizontal Bar Spacing');
    assert.strictEqual(barSpacingCheck.status, 'FAIL');
    expectClose(out.results.bar_gap, 23.75, 0.1, 'Bar gap');
  });

  test('BS-1: BS 8110 Singly reinforced beam with 4H20', () => {
    const input = {
      ...common,
      code: 'BS8110',
      bars_n: 4,
      bars_dia: 20,
      M: 198,
      V: 132
    };

    const out = calculateRcBeam(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.d, 450.0, 0.5, 'BS-1 d');
    expectClose(out.results.K, 0.1086, 0.5, 'BS-1 K');
    expectClose(out.results.z, 386.8, 0.5, 'BS-1 z');
    expectClose(out.results.As, 1176.8, 0.5, 'BS-1 As');
    expectClose(out.results.v, 0.978, 0.5, 'BS-1 v');
    expectClose(out.results.vc, 0.637, 0.5, 'BS-1 vc');
    expectClose(out.results.Asv_sv, 0.276, 0.5, 'BS-1 Asv/sv');
    expectClose(out.results.fs, 312.1, 0.5, 'BS-1 fs');
    expectClose(out.results.MFt, 0.880, 0.5, 'BS-1 MFt');
    expectClose(out.results.MFc, 1.090, 0.5, 'BS-1 MFc');
    expectClose(out.results.ld_allowable, 19.20, 0.5, 'BS-1 allowable span/d');
    expectClose(out.results.ld_actual, 13.33, 0.5, 'BS-1 actual span/d');
  });

  test('BS-2: BS 8110 Doubly reinforced beam with 5H25', () => {
    const input = {
      ...common,
      code: 'BS8110',
      bars_n: 5,
      bars_dia: 25,
      M: 300,
      V: 200
    };

    const out = calculateRcBeam(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.d, 447.5, 0.5, 'BS-2 d');
    expectClose(out.results.K, 0.1665, 0.5, 'BS-2 K');
    expectClose(out.results.z, 347.7, 0.5, 'BS-2 z');
    expectClose(out.results.As2, 108.4, 0.5, 'BS-2 As\'');
    expectClose(out.results.As, 1967.6, 0.5, 'BS-2 As');
    expectClose(out.results.v, 1.490, 0.5, 'BS-2 v');
    expectClose(out.results.vc, 0.798, 0.5, 'BS-2 vc');
    expectClose(out.results.Asv_sv, 0.477, 0.5, 'BS-2 Asv/sv');
    expectClose(out.results.fs, 267.2, 0.5, 'BS-2 fs');
    expectClose(out.results.MFt, 0.847, 0.5, 'BS-2 MFt');
    expectClose(out.results.MFc, 1.091, 0.5, 'BS-2 MFc');
    expectClose(out.results.ld_allowable, 18.47, 0.5, 'BS-2 allowable span/d');
    expectClose(out.results.ld_actual, 13.41, 0.5, 'BS-2 actual span/d');
  });
});
