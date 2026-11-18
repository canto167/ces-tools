/**
 * Pre-launch fixes (audit items S5-S16).
 * Expected values are worked out by hand in the comments, independently of the engines.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateRcBeam } from '../calculators/rc-beam/engine.js';
import { calculateOneWaySlab } from '../calculators/one-way-slab/engine.js';
import { calculateTwoWaySlab } from '../calculators/two-way-slab/engine.js';
import { calculatePadFooting } from '../calculators/pad-footing/engine.js';
import { calculatePunchingShear } from '../calculators/punching-shear/engine.js';
import { calculateShortColumn } from '../calculators/short-column/engine.js';
import { calculateAnchorageLapEC2, calculateAnchorageLapBS8110 } from '../calculators/anchorage-lap/engine.js';
import { calculateBeam } from '../calculators/beam-formulas/engine.js';
import { calculateSchedule } from '../calculators/rebar-weight/engine.js';
import { calculateRetainingWall } from '../calculators/retaining-wall/engine.js';
import { convertUnits, convertAllInCategory } from '../calculators/unit-converter/engine.js';

const beam = {
  b: 300, h: 500, cover: 30, link_dia: 10, link_legs: 2, link_spacing: 150,
  fck: 30, fcu: 30, fyk: 500, fy: 500, fywk: 500, fyv: 500,
  L: 6.0, support: 'simply_supported', agg: 20, top_bars_n: 2, top_bars_dia: 16
};
const slab = { L: 4.0, h: 175, cover: 25, main_bar_dia: 10, dist_bar_dia: 10, finishes: 1.0, qk: 3.0, support: 'simply_supported', main_bar_spacing: 150 };
const twoWay = { lx: 4.0, ly: 5.0, h: 175, cover: 25, bar_dia: 10, sx: 200, sy: 300, fcu: 30, fy: 500, finishes: 1.0, qk: 3.0 };
const pad = { Gk: 800, Qk: 400, q_all: 200, col_c: 400, B: 2.7, h: 600, cover: 50, bar_dia: 16, bar_spacing: 150, fcu: 30, fy: 500 };
const punch = { col_shape: 'rectangular', col_type: 'internal', c1: 400, c2: 400, d: 210, VEd: 750, beta: 1.15, fck: 30, rho_l: 0.0075, fywk: 500, link_dia: 10, sr: 150, vrdmax_factor: 0.4 };
const wall = { h_stem: 4.0, t_stem: 0.3, t_base: 0.4, b_toe: 0.8, b_heel: 2.4, gamma_soil: 18.0, phi: 30.0, q_surcharge: 10.0, mu: 0.5, gamma_conc: 24.0, q_all: 150.0, cover: 40, barDia: 16, barSpacing: 150, fcu: 30, fy: 500 };
const column = { b: 300, h: 300, l0: 3.2, topEnd: 1, bottomEnd: 1, N: 1500, fcu: 30, fy: 500, cover: 30, barCount: 4, barDiam: 20 };

describe('C1 RC beam fixes', () => {
  test('S8: rejects an unknown design code instead of running BS 8110', () => {
    const out = calculateRcBeam({ ...beam, code: 'EN1992', bars_n: 4, bars_dia: 20, M: 189, V: 126 });
    assert.strictEqual(out.ok, false);
    assert(out.errors.some(e => e.includes('Invalid design code')));
  });

  test('S8: alpha_cc = 1.0 changes the stress block (K\' = 0.1965, z from 0.75K/acc)', () => {
    const out = calculateRcBeam({ ...beam, code: 'EC2', acc: 1.0, bars_n: 4, bars_dia: 20, M: 189, V: 126 });
    assert.strictEqual(out.ok, true);
    // d = 500 - 30 - 10 - 10 = 450; K = 189e6 / (300 * 450² * 30) = 0.10370
    // z = 450 * (0.5 + sqrt(0.25 - 0.75 * 0.10370)) = 450 * 0.91497 = 411.7 mm
    // As = 189e6 / (434.78 * 411.7) = 1055.8 mm²
    expectClose(out.results.K_prime, 0.19647, 0.1, "K' at acc = 1.0");
    expectClose(out.results.z, 411.7, 0.2, 'z at acc = 1.0');
    expectClose(out.results.As, 1055.8, 0.2, 'As at acc = 1.0');
  });

  test('S6: compression steel that does not yield uses the reduced stress fsc', () => {
    // Deep cover to the top bars: cover 60, link 10, top H25 -> d2 = 82.5 mm; bottom 3H25 -> d = 500 - 82.5 = 417.5 mm
    const out = calculateRcBeam({ ...beam, cover: 60, top_bars_n: 2, top_bars_dia: 25, code: 'EC2', bars_n: 3, bars_dia: 25, M: 300, V: 100 });
    assert.strictEqual(out.ok, true);
    const d = 417.5, d2 = 82.5;
    // K' = 0.167; z = d(0.5 + sqrt(0.25 - 0.75*0.167/0.85)) = 0.82029d; x = (d - z)/0.4 = 0.44928d
    const x = (d - 0.82029 * d) / 0.4;
    const fsc = 200000 * 0.0035 * (1 - d2 / x); // = 392.1 N/mm² < fyd = 434.8
    expectClose(out.results.fsc, fsc, 0.3, 'fsc');
    assert(out.results.fsc < 500 / 1.15);
    assert(out.warnings.some(w => w.includes('Compression steel does not yield')));
  });

  test('S7: EC2 deflection modifier includes 500/fyk', () => {
    const out = calculateRcBeam({ ...beam, code: 'EC2', fyk: 460, fy: 460, bars_n: 4, bars_dia: 20, M: 150, V: 100 });
    assert.strictEqual(out.ok, true);
    const r = out.results;
    const mod = Math.min((500 / 460) * r.As_prov / Math.max(r.As, r.As_min), 1.5);
    expectClose(r.ld_allowable, r.ld_basic * mod, 0.1, '(l/d) allowable with 500/fyk');
  });

  test('S5: warns when rho_l is capped at 0.02 in the EC2 shear check', () => {
    const out = calculateRcBeam({ ...beam, b: 200, h: 300, code: 'EC2', bars_n: 3, bars_dia: 25, M: 20, V: 40, top_bars_n: 2, top_bars_dia: 12 });
    // rho = 1472.6 / (200 * 247.5) = 0.0297 > 0.02
    assert.strictEqual(out.ok, true);
    assert(out.warnings.some(w => w.includes('exceeds 0.02')));
  });

  test('S9: BS 8110 minimum steel is 0.24% bh for fy = 250', () => {
    const out = calculateRcBeam({ ...beam, code: 'BS8110', fy: 250, fyk: 250, bars_n: 4, bars_dia: 20, M: 50, V: 50 });
    assert.strictEqual(out.ok, true);
    expectClose(out.results.As_min, 0.0024 * 300 * 500, 0.01, 'As,min (fy 250) = 360 mm²');
  });

  test('S1: a zero bar count is rejected, not replaced by a default', () => {
    const out = calculateRcBeam({ ...beam, code: 'EC2', bars_n: 0, bars_dia: 20, M: 100, V: 50 });
    assert.strictEqual(out.ok, false);
  });
});

describe('C2 / C3 slab fixes', () => {
  test('S15: negative imposed load is rejected (C2 and C3)', () => {
    assert.strictEqual(calculateOneWaySlab({ ...slab, code: 'BS8110', fcu: 30, fy: 500, qk: -3 }).ok, false);
    assert.strictEqual(calculateTwoWaySlab({ ...twoWay, qk: -3 }).ok, false);
    assert.strictEqual(calculateTwoWaySlab({ ...twoWay, finishes: -1 }).ok, false);
  });

  test('S8: unknown code rejected in C2', () => {
    const out = calculateOneWaySlab({ ...slab, code: 'ACI', fcu: 30, fy: 500 });
    assert.strictEqual(out.ok, false);
  });

  test('S9: BS 8110 slab minimum steel 0.24% bh for fy = 250', () => {
    const out = calculateOneWaySlab({ ...slab, code: 'BS8110', fcu: 30, fy: 250 });
    assert.strictEqual(out.ok, true);
    expectClose(out.results.As_min, 0.0024 * 1000 * 175, 0.01, 'As,min = 420 mm²/m');
  });

  test('Valid inputs still pass after the guards (C2 EC2, C3, C5, C4, C10)', () => {
    assert.strictEqual(calculateOneWaySlab({ ...slab, code: 'EC2', fck: 30, fyk: 500, main_bar_spacing: 175 }).ok, true);
    assert.strictEqual(calculateTwoWaySlab(twoWay).ok, true);
    assert.strictEqual(calculatePadFooting(pad).ok, true);
    assert.strictEqual(calculatePunchingShear(punch).ok, true);
    assert.strictEqual(calculateRetainingWall(wall).ok, true);
  });
});

describe('C7 anchorage and lap fixes', () => {
  test('S10: EC2 lap length l0 does not include alpha4 (Eq 8.10)', () => {
    // lb,rqd = 572.1 mm (phi16, C30/37, good bond). alpha4 = 0.7 reduces lbd but not l0:
    // lbd = 0.7 * 572.1 = 400.5 mm; l0 = 1.5 * 572.1 = 858.2 mm
    const res = calculateAnchorageLapEC2({ barDia: 16, fck: 30, fyk: 500, bondCondition: 'good', alpha4: 0.7, alpha6: 1.5 });
    assert.strictEqual(res.ok, true);
    expectClose(res.lbd, 400.5, 0.2, 'lbd with alpha4 = 0.7');
    expectClose(res.l0, 858.2, 0.2, 'l0 without alpha4');
  });

  test('S10: fctd is limited to the C60/75 value', () => {
    const r60 = calculateAnchorageLapEC2({ barDia: 16, fck: 60, fyk: 500 });
    const r70 = calculateAnchorageLapEC2({ barDia: 16, fck: 70, fyk: 500 });
    expectClose(r70.fbd, r60.fbd, 0.01, 'fbd at C70 = fbd at C60');
  });

  test('alpha factors outside 0.7-1.0 are rejected', () => {
    const res = calculateAnchorageLapEC2({ barDia: 16, fck: 30, fyk: 500, alpha2: 0.5 });
    assert.strictEqual(res.ok, false);
  });

  test('S11: BS 8110 compression lap = 1.25 x compression anchorage (Cl 3.12.8.15)', () => {
    // fbu = 0.63 * sqrt(30) = 3.4506; l = 435 * 16 / (4 * 3.4506) = 504.3 mm; lap = 1.25 * 504.3 = 630.4 mm
    const res = calculateAnchorageLapBS8110({ barDia: 16, fcu: 30, fy: 500, forceType: 'compression' });
    assert.strictEqual(res.ok, true);
    expectClose(res.anchorage, 504.3, 0.2, 'compression anchorage');
    expectClose(res.lap_1_0, 630.4, 0.2, 'compression lap');
  });

  test('BS 8110 plain bars use beta = 0.28 in tension (Table 3.26)', () => {
    const res = calculateAnchorageLapBS8110({ barDia: 16, fcu: 30, fy: 250, forceType: 'tension', barType: 'plain' });
    expectClose(res.fbu, 0.28 * Math.sqrt(30), 0.01, 'fbu plain');
  });
});

describe('C6 column guards', () => {
  test('S12: end condition 4 and k = 0.8 are rejected; valid input passes', () => {
    assert.strictEqual(calculateShortColumn({ ...column, topEnd: 4 }).ok, false);
    assert.strictEqual(calculateShortColumn({ ...column, k: 0.8 }).ok, false);
    assert.strictEqual(calculateShortColumn({ ...column, barCount: 5 }).ok, false);
    assert.strictEqual(calculateShortColumn(column).ok, true);
  });
});

describe('C8 beam formulas guards', () => {
  test('S13: unknown support type is rejected', () => {
    const res = calculateBeam({ supportType: 'pinned_roller', L: 6, pointLoads: [{ P: 10, a: 3 }] });
    assert.strictEqual(res.ok, false);
  });

  test('Fixed-fixed beam with a partial UDL: end moments and equilibrium', () => {
    // w = 10 kN/m on 0-3 m of a 6 m fixed-fixed beam:
    // MA = -11wL²/192 = -20.625 kNm, MB = +5wL²/192 = 9.375 kNm
    // RB = (30 * 1.5 - 20.625 + 9.375) / 6 = 5.625 kN, RA = 24.375 kN
    const res = calculateBeam({ supportType: 'fixed_fixed', L: 6, distributedLoads: [{ w: 10, x1: 0, x2: 3 }], E: 200000, I: 4e8 });
    expectClose(res.MA, -20.625, 0.1, 'MA');
    expectClose(res.MB, 9.375, 0.1, 'MB');
    expectClose(res.RA, 24.375, 0.1, 'RA');
    expectClose(res.RB, 5.625, 0.1, 'RB');
    assert(Math.abs(res.delta_mm[res.delta_mm.length - 1]) < 1e-3, 'deflection at the fixed end B is zero');
  });
});

describe('C9 rebar schedule guards', () => {
  test('S14: invalid rows are flagged and left out of the totals', () => {
    const res = calculateSchedule([
      { mark: '01', dia: 16, members: 10, barsPerMember: 4, length: 6.0 },
      { mark: '02', dia: 17, members: 1, barsPerMember: 1, length: 6.0 },
      { mark: '03', dia: 12, members: 1, barsPerMember: 1, length: -5 }
    ], 0);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.errors.length, 2);
    expectClose(res.grandTotalWeightKg, 378.8, 0.1, 'only row 01 counted');
    assert.strictEqual(res.rows.length, 3, 'invalid rows stay visible for editing');
  });

  test('Valid schedule with wastage', () => {
    const res = calculateSchedule([{ mark: '01', dia: 16, members: 10, barsPerMember: 4, length: 6.0 }], 5);
    assert.strictEqual(res.ok, true);
    expectClose(res.grandTotalWithWastageKg, 378.8 * 1.05, 0.1, 'with 5% wastage');
  });
});

describe('C11 unit converter', () => {
  test('Unknown units throw; valid conversions work', () => {
    assert.throws(() => convertUnits(1, 'furlong', 'm', 'length'));
    const all = convertAllInCategory(1, 'nonexistent', 'length');
    assert.deepStrictEqual(all, []);
  });
});

describe('S16: every engine returns named checks and labelled steps', () => {
  const engines = [
    ['C1 EC2', () => calculateRcBeam({ ...beam, code: 'EC2', bars_n: 4, bars_dia: 20, M: 189, V: 126 })],
    ['C1 BS', () => calculateRcBeam({ ...beam, code: 'BS8110', bars_n: 4, bars_dia: 20, M: 189, V: 126 })],
    ['C2', () => calculateOneWaySlab({ ...slab, code: 'BS8110', fcu: 30, fy: 500 })],
    ['C3', () => calculateTwoWaySlab(twoWay)],
    ['C4', () => calculatePunchingShear(punch)],
    ['C5', () => calculatePadFooting(pad)],
    ['C6', () => calculateShortColumn(column)],
    ['C8', () => calculateBeam({ supportType: 'simply_supported', L: 6, pointLoads: [{ P: 10, a: 3 }] })],
    ['C10', () => calculateRetainingWall(wall)]
  ];
  for (const [name, run] of engines) {
    test(`${name}: no undefined names, statuses or labels`, () => {
      const out = run();
      assert.strictEqual(out.ok, true, `${name} should be ok`);
      const checks = out.checks || (out.report && out.report.checks) || [];
      const steps = out.steps || (out.report && out.report.steps) || [];
      if (name !== 'C8') assert(checks.length > 0, `${name} has checks`); // C8 is analysis only
      assert(steps.length > 0, `${name} has steps`);
      checks.forEach(c => {
        assert(c.name && c.name !== 'undefined', `${name} check name`);
        assert(['PASS', 'FAIL', 'WARN', 'INFO'].includes(c.status), `${name} check status ${c.status}`);
      });
      steps.forEach(s => assert(s.label && s.label !== 'undefined', `${name} step label`));
    });
  }

  test('C7: steps are labelled (EC2 and BS)', () => {
    const ec2 = calculateAnchorageLapEC2({ barDia: 16, fck: 30, fyk: 500 });
    const bs = calculateAnchorageLapBS8110({ barDia: 16, fcu: 30, fy: 500 });
    [ec2, bs].forEach(r => r.report.steps.forEach(s => assert(s.label && s.label !== 'undefined')));
  });
});

describe('UI uses the normalised report fields (B3 regression)', () => {
  test('no ui.js reads legacy check or step fields', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const { join } = await import('node:path');
    const dir = new URL('../calculators/', import.meta.url);
    for (const slug of readdirSync(dir)) {
      const src = readFileSync(join(dir.pathname.replace(/^\/([A-Za-z]:)/, '$1'), slug, 'ui.js'), 'utf8');
      for (const legacy of ['st.description', 'st.formula', 'st.values', 'st.ref', 'c.title', 'c.actual', 'c.allowable', 'c.pass']) {
        assert(!src.includes('${' + legacy), `${slug}/ui.js still uses ${legacy}`);
      }
    }
  });

  test('C4: punching reinforcement required shows WARN, not FAIL', () => {
    const out = calculatePunchingShear(punch);
    const c = out.checks.find(x => x.name.startsWith('Control Perimeter'));
    assert.strictEqual(c.status, 'WARN');
  });
});
