import { test, describe } from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculatePadFooting } from '../calculators/pad-footing/engine.js';

describe('C5 Square Pad Footing Acceptance Test Suite', () => {
  test('BS-1: Concentric square pad footing (2.7m x 2.7m x 0.6m, N=1760kN)', () => {
    const input = {
      Gk: 800,
      Qk: 400,
      q_all: 200,
      col_c: 400,
      B: 2.7,
      h: 600,
      cover: 50,
      bar_dia: 16,
      bar_spacing: 150,
      fcu: 30,
      fy: 500
    };

    const out = calculatePadFooting(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.self_weight, 104.98, 0.5, 'BS-1 self-weight');
    expectClose(out.results.service_pressure, 179.0, 0.5, 'BS-1 service pressure');
    expectClose(out.results.N, 1760.0, 0.5, 'BS-1 N');
    expectClose(out.results.pu, 241.43, 0.5, 'BS-1 pu');
    expectClose(out.results.d, 534.0, 0.5, 'BS-1 d');
    expectClose(out.results.a, 1.15, 0.5, 'BS-1 a');
    expectClose(out.results.M, 431.04, 0.5, 'BS-1 M');
    expectClose(out.results.K, 0.0187, 0.5, 'BS-1 K');
    expectClose(out.results.z, 507.3, 0.5, 'BS-1 z');
    expectClose(out.results.As, 1953.3, 0.5, 'BS-1 As');
    expectClose(out.results.As_min, 2106.0, 0.5, 'BS-1 As,min');
    expectClose(out.results.As_prov, 3619.1, 0.5, 'BS-1 As,prov');
    expectClose(out.results.v_face, 2.060, 0.5, 'BS-1 face shear v');
    expectClose(out.results.v_max, 4.382, 0.5, 'BS-1 vmax');
    expectClose(out.results.vc, 0.424, 0.5, 'BS-1 vc');
    expectClose(out.results.perim_side, 2002.0, 0.5, 'BS-1 perim_side');
    expectClose(out.results.V_punch, 792.4, 0.5, 'BS-1 Vpunch');
    expectClose(out.results.v_punch, 0.185, 0.5, 'BS-1 v_punch');
    expectClose(out.results.V_beam, 401.5, 0.5, 'BS-1 Vbeam');
    expectClose(out.results.v_beam, 0.278, 0.5, 'BS-1 v_beam');

    // All structural checks pass
    assert.strictEqual(out.checks.every(c => c.status === 'PASS'), true);
  });
});
