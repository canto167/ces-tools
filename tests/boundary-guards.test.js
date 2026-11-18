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
  });

  // C3 Two-Way Slab Guards
  describe('C3 Two-Way Slab Guards', () => {
    test('Warns when aspect ratio ly/lx > 2.0 (one-way spanning limit)', () => {
      const res = calculateTwoWaySlab({
        lx: 3.0, ly: 7.5, h: 150, cover: 20, fcu: 30, fy: 500
      });
      assert.strictEqual(res.ok, true);
      assert(res.warnings.some(w => w.includes('Two-way action ceases')));
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

    test('Rejects column size exceeding footing dimension', () => {
      const res = calculatePadFooting({
        Gk: 500, Qk: 250, q_all: 200, B: 1.0, h: 500, col_c: 1200, fcu: 30, fy: 500
      });
      assert.strictEqual(res.ok, false);
      assert(res.errors.some(e => e.includes('Column size cannot exceed footing width')));
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
