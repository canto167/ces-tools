import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculatePunchingShear } from '../calculators/punching-shear/engine.js';
import { calculateRcBeam } from '../calculators/rc-beam/engine.js';
import { calculateOneWaySlab } from '../calculators/one-way-slab/engine.js';
import { calculateTwoWaySlab } from '../calculators/two-way-slab/engine.js';
import { calculatePadFooting } from '../calculators/pad-footing/engine.js';
import { calculateShortColumn } from '../calculators/short-column/engine.js';
import { calculateRetainingWall } from '../calculators/retaining-wall/engine.js';
import { calculateBeam } from '../calculators/beam-formulas/engine.js';
import { Validate } from '../shared/js/core/validate.js';

describe('STRUCT-Agent & Codex Hardening — Negative & Boundary Guard Tests', () => {

  // C4 Punching Shear Guards
  describe('C4 Punching Shear Guards', () => {
    test('Rejects invalid beta outside [1.0, 2.5]', () => {
      const res = calculatePunchingShear({
        c1: 400, c2: 400, d: 200, VEd: 500, fck: 30, beta: 3.5
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('beta')));
    });

    test('Rejects invalid vrdmax_factor outside [0.25, 0.60]', () => {
      const res = calculatePunchingShear({
        c1: 400, c2: 400, d: 200, VEd: 500, fck: 30, vrdmax_factor: 0.99
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('vRd,max factor')));
    });

    test('Emits explicit warning when rho_l > 0.02 (stops silent clamping)', () => {
      const res = calculatePunchingShear({
        c1: 400, c2: 400, d: 200, VEd: 500, fck: 30, rho_l: 0.035
      });
      assert.strictEqual(res.ok, true);
      assert(res.warnings.some(w => w.includes('exceeds Eurocode 2 Cl 6.4.4(1) maximum design limit of 2.0%')));
      assert.strictEqual(res.results.rho_l, 0.02);
    });

    test('Rejects degenerate column dimensions (< 100mm)', () => {
      const res = calculatePunchingShear({
        c1: 50, c2: 400, d: 200, VEd: 500, fck: 30
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Column dimension c1')));
    });
  });

  // C1 RC Beam Guards
  describe('C1 RC Beam Guards', () => {
    test('Rejects cover exceeding half beam depth', () => {
      const res = calculateRcBeam({
        b: 300, h: 400, cover: 250, M: 100, V: 50, L: 5, fck: 30, fyk: 500
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Nominal cover')));
    });

    test('Rejects concrete strength outside code standard range', () => {
      const res = calculateRcBeam({
        b: 300, h: 500, cover: 30, M: 100, V: 50, L: 5, fck: 5, fyk: 500
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Concrete strength')));
    });

    test('Rejects unrecognized support condition', () => {
      const res = calculateRcBeam({
        b: 300, h: 500, cover: 30, M: 100, V: 50, L: 5, fck: 30, fyk: 500, support: 'fixed_encastre'
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Invalid support condition')));
    });

    test('Rejects invalid link spacing or link legs', () => {
      const res = calculateRcBeam({
        b: 300, h: 500, cover: 30, M: 100, V: 50, L: 5, fck: 30, fyk: 500, link_spacing: 0
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Link spacing')));
    });
  });

  // C2 One-Way Slab Guards
  describe('C2 One-Way Slab Guards', () => {
    test('Rejects slab depth below practical minimum (< 75mm)', () => {
      const res = calculateOneWaySlab({
        L: 4.0, h: 50, cover: 20, main_bar_spacing: 150, fck: 30, fyk: 500
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('overall depth h must be at least 75 mm')));
    });

    test('Rejects unrecognized support condition', () => {
      const res = calculateOneWaySlab({
        L: 4.0, h: 150, cover: 20, main_bar_spacing: 150, fck: 30, fyk: 500, support: 'cantilever'
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Invalid support condition')));
    });

    test('Over-reinforced slab fails Section Ductility check (BS 8110)', () => {
      const res = calculateOneWaySlab({
        code: 'BS8110', L: 6.0, h: 100, cover: 20, finishes: 5.0, qk: 25.0, main_bar_spacing: 100, fcu: 25, fy: 500
      });
      assert.strictEqual(res.ok, true);
      const ductCheck = res.checks.find(c => c.name.includes('Section Ductility'));
      assert(ductCheck !== undefined);
      assert.strictEqual(ductCheck.status, 'FAIL');
      assert(res.warnings.some(w => w.includes('over-reinforced')));
    });

    test('Over-reinforced slab fails Section Ductility check (EC2)', () => {
      const res = calculateOneWaySlab({
        code: 'EC2', L: 6.0, h: 100, cover: 20, finishes: 5.0, qk: 25.0, main_bar_spacing: 100, fck: 25, fyk: 500
      });
      assert.strictEqual(res.ok, true);
      const ductCheck = res.checks.find(c => c.name.includes('Section Ductility'));
      assert(ductCheck !== undefined);
      assert.strictEqual(ductCheck.status, 'FAIL');
      assert(res.warnings.some(w => w.includes('over-reinforced')));
    });
  });

  // C3 Two-Way Slab Guards
  describe('C3 Two-Way Slab Guards', () => {
    test('Warns and clamps to one-way limit when aspect ratio ly/lx > 2.0', () => {
      const res = calculateTwoWaySlab({
        lx: 3.0, ly: 7.5, h: 150, cover: 20, fcu: 30, fy: 500
      });
      assert.strictEqual(res.ok, true);
      assert(res.warnings.some(w => w.includes('Two-way action ceases')));
      assert.strictEqual(res.results.alpha_sx, 0.125);
      assert.strictEqual(res.results.alpha_sy, 0.0);
    });

    test('Over-reinforced two-way slab fails Short Span Section Ductility', () => {
      const res = calculateTwoWaySlab({
        lx: 6.0, ly: 6.0, h: 100, cover: 20, finishes: 5.0, qk: 25.0, fcu: 25, fy: 500
      });
      assert.strictEqual(res.ok, true);
      const ductCheck = res.checks.find(c => c.name.includes('Short Span Section Ductility'));
      assert(ductCheck !== undefined);
      assert.strictEqual(ductCheck.status, 'FAIL');
    });
  });

  // C5 Pad Footing Guards
  describe('C5 Pad Footing Guards', () => {
    test('Rejects zero or unphysical allowable bearing capacity', () => {
      const res = calculatePadFooting({
        Gk: 500, Qk: 250, q_all: 0, B: 2.0, h: 500, col_c: 300, fcu: 30, fy: 500
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Allowable bearing capacity')));
    });

    test('Rejects zero bar spacing', () => {
      const res = calculatePadFooting({
        Gk: 500, Qk: 250, q_all: 200, B: 2.0, h: 500, col_c: 300, fcu: 30, fy: 500, bar_spacing: 0
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Bar spacing')));
    });

    test('Rejects column size exceeding footing dimension', () => {
      const res = calculatePadFooting({
        Gk: 500, Qk: 250, q_all: 200, B: 1.0, h: 500, col_c: 1200, fcu: 30, fy: 500
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Column size cannot exceed footing width')));
    });

    test('Over-reinforced footing fails Footing Flexure Ductility check', () => {
      // Extremely high load on shallow footing: N = 1.4*3000 + 1.6*2000 = 7400kN, B=4m, h=250mm
      const res = calculatePadFooting({
        Gk: 3000, Qk: 2000, q_all: 500, B: 4.0, h: 250, col_c: 400, fcu: 25, fy: 500
      });
      assert.strictEqual(res.ok, true);
      const ductCheck = res.checks.find(c => c.name.includes('Footing Flexure Ductility'));
      assert(ductCheck !== undefined);
      assert.strictEqual(ductCheck.status, 'FAIL');
      assert(res.warnings.some(w => w.includes('over-reinforced')));
    });
  });

  // C6 Short Column Guards
  describe('C6 Short Column Guards', () => {
    test('Slender column triggers FAIL check and explicit warning', () => {
      const res = calculateShortColumn({
        b: 250, h: 250, l0: 7.0, topEnd: 3, bottomEnd: 3, N: 1000, fcu: 30, fy: 500
      });
      assert.strictEqual(res.status, 'FAIL');
      assert.strictEqual(res.isShort, false);
    });

    test('Rejects column dimensions below minimum 150mm', () => {
      const res = calculateShortColumn({
        b: 100, h: 300, l0: 3.0, N: 500, fcu: 30, fy: 500
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Column width b must be at least 150 mm')));
    });
  });

  // C10 Retaining Wall Guards
  describe('C10 Retaining Wall Guards', () => {
    test('Rejects unphysical soil internal friction angle', () => {
      const res = calculateRetainingWall({
        h_stem: 4.0, t_stem: 0.3, t_base: 0.4, b_toe: 0.8, b_heel: 2.0, phi: 50.0
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('friction angle phi')));
    });

    test('Rejects zero concrete unit weight or zero bar spacing', () => {
      const res1 = calculateRetainingWall({
        h_stem: 4.0, t_stem: 0.3, t_base: 0.4, b_toe: 0.8, b_heel: 2.0, gamma_conc: 0
      });
      assert.strictEqual(res1.ok, false);
      assert(res1.errors.some(e => e.includes('gamma_conc')));

      const res2 = calculateRetainingWall({
        h_stem: 4.0, t_stem: 0.3, t_base: 0.4, b_toe: 0.8, b_heel: 2.0, barSpacing: 0
      });
      assert.strictEqual(res2.ok, false);
      assert(res2.errors.some(e => e.includes('Vertical bar spacing')));
    });

    test('Over-reinforced stem triggers FAIL check and warning', () => {
      // Very high wall with thin stem: h_stem = 6.0m, t_stem = 0.20m
      const res = calculateRetainingWall({
        h_stem: 6.0, t_stem: 0.20, t_base: 0.5, b_toe: 1.0, b_heel: 3.5, fcu: 25, fy: 500
      });
      assert.strictEqual(res.ok, true);
      assert.strictEqual(res.pass_K, false);
      assert.strictEqual(res.status, 'FAIL');
      assert(res.warnings.some(w => w.includes('over-reinforced')));
    });
  });

  // C8 Beam Formulas Guards
  describe('C8 Beam Formulas Guards', () => {
    test('Rejects point load placed outside beam span', () => {
      const res = calculateBeam({
        L: 6.0, pointLoads: [{ P: 50, a: 8.5 }]
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('outside beam span')));
    });
  });
});
