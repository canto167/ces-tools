import { test, describe } from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculatePunchingShear } from '../calculators/punching-shear/engine.js';

describe('C4 Punching Shear Acceptance Test Suite', () => {
  test('EC2-1: Internal rectangular column 400x400, VEd=750kN', () => {
    const input = {
      col_shape: 'rectangular',
      col_type: 'internal',
      c1: 400,
      c2: 400,
      d: 210,
      VEd: 750,
      beta: 1.15,
      fck: 30,
      rho_l: 0.0075,
      fywk: 500,
      link_dia: 10,
      sr: 150,
      vrdmax_factor: 0.4
    };

    const out = calculatePunchingShear(input);
    assert.strictEqual(out.ok, true);

    expectClose(out.results.u0, 1600.0, 0.5, 'EC2-1 u0');
    expectClose(out.results.vEd_0, 2.567, 0.5, 'EC2-1 vEd,0');
    expectClose(out.results.vRd_max, 4.224, 0.5, 'EC2-1 vRd,max (0.4 factor)');
    expectClose(out.results.u1, 4238.9, 0.5, 'EC2-1 u1');
    expectClose(out.results.vEd_1, 0.969, 0.5, 'EC2-1 vEd,1');
    expectClose(out.results.k, 1.976, 0.5, 'EC2-1 k');
    expectClose(out.results.vRd_c, 0.669, 0.5, 'EC2-1 vRd,c');
    expectClose(out.results.v_min, 0.532, 0.5, 'EC2-1 vmin');
    expectClose(out.results.fywd_ef, 302.5, 0.5, 'EC2-1 fywd,ef');
    expectClose(out.results.Asw_sr, 4.362, 0.5, 'EC2-1 Asw/sr');
    expectClose(out.results.Asw_per_perimeter, 654.2, 0.5, 'EC2-1 Asw per perimeter');
    assert.strictEqual(out.results.legs_per_perimeter, 9);
    expectClose(out.results.uout, 6135.7, 0.5, 'EC2-1 uout');
    expectClose(out.results.r_out, 721.9, 0.5, 'EC2-1 r');
    expectClose(out.results.last_perim_dist, 406.9, 0.5, 'EC2-1 last perimeter dist');

    // Test UK NA factor 0.5
    const outUK = calculatePunchingShear({ ...input, vrdmax_factor: 0.5 });
    expectClose(outUK.results.vRd_max, 5.280, 0.5, 'EC2-1 UK NA vRd,max (0.5 factor)');
  });
});
