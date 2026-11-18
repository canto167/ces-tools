import test from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateRetainingWall } from '../calculators/retaining-wall/engine.js';

test('C10 Cantilever Retaining Wall Acceptance Test Suite', async (t) => {
  await t.test('Test A: Full Wall Stability & Stem Design (Passes all checks)', () => {
    const res = calculateRetainingWall({
      h_stem: 4.0,
      t_stem: 0.3,
      t_base: 0.4,
      b_toe: 0.8,
      b_heel: 2.4,
      gamma_soil: 18.0,
      phi: 30.0,
      q_surcharge: 10.0,
      mu: 0.5,
      gamma_conc: 24.0,
      q_all: 150.0,
      cover: 40,
      barDia: 16,
      barSpacing: 150,
      fcu: 30,
      fy: 500
    });

    expectClose(res.Ka, 0.3333, 0.5, 'Active earth coefficient Ka');
    expectClose(res.Pa, 58.08, 0.5, 'Soil active thrust Pa (kN/m)');
    expectClose(res.Pq, 14.67, 0.5, 'Surcharge thrust Pq (kN/m)');
    expectClose(res.Mo, 117.45, 0.5, 'Overturning moment Mo (kNm/m)');

    expectClose(res.W_stem, 28.8, 0.5, 'Stem weight (kN/m)');
    expectClose(res.W_base, 33.6, 0.5, 'Base weight (kN/m)');
    expectClose(res.W_soil, 172.8, 0.5, 'Backfill soil weight (kN/m)');
    expectClose(res.W_tot, 235.2, 0.5, 'Total permanent vertical weight (kN/m)');
    expectClose(res.Mr, 483.6, 0.5, 'Restoring moment Mr (kNm/m)');

    expectClose(res.FoS_OT, 4.12, 0.5, 'Factor of safety against overturning');
    expectClose(res.FoS_slide, 1.62, 0.5, 'Factor of safety against sliding');

    expectClose(res.V_bear, 259.2, 0.5, 'Vertical load for bearing (kN/m)');
    expectClose(res.e, 0.124, 0.5, 'Resultant eccentricity e (m)');
    expectClose(res.p_max, 89.9, 0.5, 'Maximum base pressure (kPa)');
    expectClose(res.p_min, 58.3, 0.5, 'Minimum base pressure (kPa)');

    expectClose(res.Mu, 132.3, 0.5, 'Stem base design moment Mu (kNm/m)');
    expectClose(res.d_stem, 252.0, 0.5, 'Stem effective depth d (mm)');
    expectClose(res.As_req, 1317.6, 0.5, 'Stem required tension steel As,req (mm2/m)');
    expectClose(res.As_prov, 1340.4, 0.5, 'Stem provided steel H16@150 (mm2/m)');
    expectClose(res.Vu, 88.5, 0.5, 'Stem design shear Vu (kN/m)');
    expectClose(res.v_stem, 0.351, 0.5, 'Stem shear stress v (N/mm2)');
    expectClose(res.vc_stem, 0.611, 0.5, 'Concrete shear capacity vc (N/mm2)');

    assert.strictEqual(res.status, 'PASS', 'Overall design check must PASS');
  });

  await t.test('Test B: Reduced Heel (b_heel = 1.9m) -> Fails Sliding', () => {
    const res = calculateRetainingWall({
      h_stem: 4.0,
      t_stem: 0.3,
      t_base: 0.4,
      b_toe: 0.8,
      b_heel: 1.9,
      gamma_soil: 18.0,
      phi: 30.0,
      q_surcharge: 10.0,
      mu: 0.5,
      gamma_conc: 24.0,
      q_all: 150.0,
      cover: 40,
      barDia: 16,
      barSpacing: 150,
      fcu: 30,
      fy: 500
    });

    expectClose(res.W_tot, 194.4, 0.5, 'Total weight (kN/m)');
    expectClose(res.Mr, 351.0, 0.5, 'Restoring moment Mr (kNm/m)');
    expectClose(res.FoS_OT, 2.99, 0.5, 'FoS Overturning');
    expectClose(res.FoS_slide, 1.34, 0.5, 'FoS Sliding');
    assert.strictEqual(res.pass_slide, false, 'Must fail sliding requirement (1.34 < 1.5)');
    assert.strictEqual(res.status, 'FAIL', 'Overall status must be FAIL');
  });
});
