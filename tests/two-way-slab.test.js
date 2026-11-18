import { test, describe } from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateTwoWaySlab } from '../calculators/two-way-slab/engine.js';

describe('C3 Two-Way Slab Acceptance Test Suite', () => {
  test('BS-1: Simply supported two-way slab (4m x 5m, Table 3.13)', () => {
    const input = {
      lx: 4.0,
      ly: 5.0,
      h: 175,
      cover: 25,
      bar_dia: 10,
      sx: 200,
      sy: 300,
      fcu: 30,
      fy: 500,
      finishes: 1.0,
      qk: 3.0
    };

    const out = calculateTwoWaySlab(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.ratio, 1.25, 0.5, 'BS-1 ratio');
    expectClose(out.results.alpha_sx, 0.0885, 0.5, 'BS-1 alpha_sx');
    expectClose(out.results.alpha_sy, 0.0570, 0.5, 'BS-1 alpha_sy');
    expectClose(out.results.n, 12.08, 0.5, 'BS-1 n');
    expectClose(out.results.msx, 17.11, 0.5, 'BS-1 msx');
    expectClose(out.results.msy, 11.02, 0.5, 'BS-1 msy');
    expectClose(out.results.dx, 145.0, 0.5, 'BS-1 dx');
    expectClose(out.results.dy, 135.0, 0.5, 'BS-1 dy');
    expectClose(out.results.Asx, 285.5, 0.5, 'BS-1 Asx');
    expectClose(out.results.Asy, 197.5, 0.5, 'BS-1 Asy');
    expectClose(out.results.As_min, 227.5, 0.5, 'BS-1 As,min');
    expectClose(out.results.Apx, 392.7, 0.5, 'BS-1 Apx');
    expectClose(out.results.Apy, 261.8, 0.5, 'BS-1 Apy');
    expectClose(out.results.MF, 1.691, 0.5, 'BS-1 MF');
    expectClose(out.results.ld_allowable, 33.83, 0.5, 'BS-1 allowable l/d');
    expectClose(out.results.ld_actual, 27.59, 0.5, 'BS-1 actual l/d');
    expectClose(out.results.v, 0.167, 0.5, 'BS-1 v');
    expectClose(out.results.vc, 0.561, 0.5, 'BS-1 vc');

    // All checks pass
    assert.strictEqual(out.checks.every(c => c.status === 'PASS'), true);
  });
});
