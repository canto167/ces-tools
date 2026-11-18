import { test, describe } from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateOneWaySlab } from '../calculators/one-way-slab/engine.js';

describe('C2 One-Way Slab Acceptance Test Suite', () => {
  const common = {
    L: 4.0,
    h: 175,
    cover: 25,
    main_bar_dia: 10,
    dist_bar_dia: 10,
    finishes: 1.0,
    qk: 3.0,
    support: 'simply_supported'
  };

  test('BS-1: BS 8110 Simply Supported One-Way Slab with H10@150', () => {
    const input = {
      ...common,
      code: 'BS8110',
      fcu: 30,
      fy: 500,
      main_bar_spacing: 150
    };

    const out = calculateOneWaySlab(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.d, 145.0, 0.5, 'BS-1 d');
    expectClose(out.results.gk, 5.20, 0.5, 'BS-1 gk');
    expectClose(out.results.n, 12.08, 0.5, 'BS-1 n');
    expectClose(out.results.M, 24.16, 0.5, 'BS-1 M');
    expectClose(out.results.V, 24.16, 0.5, 'BS-1 V');
    expectClose(out.results.K, 0.0383, 0.5, 'BS-1 K');
    expectClose(out.results.z, 137.75, 0.5, 'BS-1 z');
    expectClose(out.results.As, 403.2, 0.5, 'BS-1 As');
    expectClose(out.results.As_min, 227.5, 0.5, 'BS-1 As,min');
    expectClose(out.results.As_prov, 523.6, 0.5, 'BS-1 As,prov');
    expectClose(out.results.fs, 256.7, 0.5, 'BS-1 fs');
    expectClose(out.results.MF, 1.446, 0.5, 'BS-1 MF');
    expectClose(out.results.ld_allowable, 28.92, 0.5, 'BS-1 allowable l/d');
    expectClose(out.results.ld_actual, 27.59, 0.5, 'BS-1 actual l/d');
    expectClose(out.results.v, 0.167, 0.5, 'BS-1 v');
    expectClose(out.results.vc, 0.616, 0.5, 'BS-1 vc');

    const deflCheck = out.checks.find(c => c.name === 'Span-to-Depth Deflection Check');
    assert.strictEqual(deflCheck.status, 'PASS');
  });

  test('BS-1b: Same slab with H10@175 designed to FAIL deflection', () => {
    const input = {
      ...common,
      code: 'BS8110',
      fcu: 30,
      fy: 500,
      main_bar_spacing: 175
    };

    const out = calculateOneWaySlab(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.As_prov, 448.8, 0.5, 'BS-1b As,prov');
    expectClose(out.results.MF, 1.272, 0.5, 'BS-1b MF');
    expectClose(out.results.ld_allowable, 25.44, 0.5, 'BS-1b allowable l/d');

    const deflCheck = out.checks.find(c => c.name === 'Span-to-Depth Deflection Check');
    assert.strictEqual(deflCheck.status, 'FAIL');
  });

  test('EC2-1: EC2 Simply Supported One-Way Slab with H10@175', () => {
    const input = {
      ...common,
      code: 'EC2',
      fck: 30,
      fyk: 500,
      main_bar_spacing: 175
    };

    const out = calculateOneWaySlab(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.gk, 5.375, 0.5, 'EC2-1 gk');
    expectClose(out.results.n, 11.756, 0.5, 'EC2-1 n');
    expectClose(out.results.M, 23.513, 0.5, 'EC2-1 M');
    expectClose(out.results.V, 23.513, 0.5, 'EC2-1 V');
    expectClose(out.results.K, 0.0373, 0.5, 'EC2-1 K');
    expectClose(out.results.z, 137.75, 0.5, 'EC2-1 z');
    expectClose(out.results.As, 392.6, 0.5, 'EC2-1 As');
    expectClose(out.results.As_min, 218.4, 0.5, 'EC2-1 As,min');
    expectClose(out.results.As_prov, 448.8, 0.5, 'EC2-1 As,prov');
    expectClose(out.results.ld_basic, 45.76, 0.5, 'EC2-1 l/d basic');
    expectClose(out.results.ld_allowable, 52.31, 0.5, 'EC2-1 allowable l/d');
    expectClose(out.results.ld_actual, 27.59, 0.5, 'EC2-1 actual l/d');
    expectClose(out.results.v_min, 0.5422, 0.5, 'EC2-1 v,min');
    expectClose(out.results.VRd_c, 78.6, 0.5, 'EC2-1 VRd,c');

    const deflCheck = out.checks.find(c => c.name === 'Span-to-Depth Deflection Check');
    assert.strictEqual(deflCheck.status, 'PASS');
  });
});
