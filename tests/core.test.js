import { test, describe } from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { Units } from '../shared/js/core/units.js';
import { Bars, STANDARD_BAR_DIAS } from '../shared/js/core/bars.js';
import { Validate } from '../shared/js/core/validate.js';
import { CalculationReport } from '../shared/js/core/report.js';
import { Share } from '../shared/js/core/share.js';
import { Store } from '../shared/js/core/store.js';

describe('Core Helper Test Suite', () => {
  test('expectClose helper works within tolerance and catches deviations', () => {
    const res = expectClose(100.2, 100.0, 0.5, 'Test close value');
    assert.strictEqual(res.pass, true);
    assert.throws(() => {
      expectClose(101.0, 100.0, 0.5, 'Should fail tolerance');
    });
  });

  test('Units format and conversions', () => {
    assert.strictEqual(Units.format(1234.567, 2), '1,234.57');
    assert.strictEqual(Units.formatStress(25.4), '25.4 N/mm²');
    assert.strictEqual(Units.formatForce(150.8), '150.8 kN');
    assert.strictEqual(Units.formatMoment(75.321), '75.32 kNm');
  });

  test('Bars geometry, areas and weights', () => {
    // Area of H16: π * 16² / 4 = 201.0619 mm²
    expectClose(Bars.area(16), 201.0619, 0.01, 'Area H16');
    // Area of 4H20: 4 * π * 20² / 4 = 1256.637 mm²
    expectClose(Bars.totalArea(4, 20), 1256.637, 0.01, 'Area 4H20');
    // Unit weight H16: (π * 16² / 4) * 7850 * 10^-6 = 1.5783 kg/m
    expectClose(Bars.weightPerMetreExact(16), 1.5783, 0.05, 'Weight exact H16');
    // Rule of thumb H16: 16² / 162 = 1.5802 kg/m
    expectClose(Bars.weightPerMetreRule(16), 1.5802, 0.05, 'Weight rule H16');
    // Spacing check EC2
    assert.strictEqual(Bars.minClearSpacing(25, 20, 'EC2'), 25);
    assert.strictEqual(Bars.minClearSpacing(12, 20, 'EC2'), 25); // max(12, 20+5, 20) = 25
  });

  test('Validate checks rules correctly', () => {
    assert.strictEqual(Validate.isNumber(42), true);
    assert.strictEqual(Validate.isNumber(NaN), false);
    assert.strictEqual(Validate.isPositive(10), true);
    assert.strictEqual(Validate.isPositive(0), false);
    
    const schema = [
      { field: 'b', label: 'Width', positive: true },
      { field: 'fck', label: 'Concrete strength', min: 20, max: 50 }
    ];
    
    const validRes = Validate.check({ b: 300, fck: 30 }, schema);
    assert.strictEqual(validRes.valid, true);
    
    const invalidRes = Validate.check({ b: -50, fck: 60 }, schema);
    assert.strictEqual(invalidRes.valid, false);
    assert.strictEqual(invalidRes.errors.length, 2);
  });

  test('CalculationReport tracks steps and checks', () => {
    const report = new CalculationReport();
    report.addStep({
      label: 'Effective Depth',
      equation: 'd = h - cover - φ_link - φ/2',
      substituted: 'd = 500 - 30 - 10 - 20/2',
      value: 450,
      unit: 'mm',
      clause: 'EN 1992-1-1 Cl 5.3'
    });

    report.addCheck({
      name: 'Flexural Steel Capacity',
      demand: 1075.5,
      capacity: 1256.6,
      clause: 'Cl 6.1',
      unit: 'mm²'
    });

    assert.strictEqual(report.getSteps().length, 1);
    assert.strictEqual(report.getChecks().length, 1);
    assert.strictEqual(report.allPass(), true);
    expectClose(report.getChecks()[0].ratio, 1075.5 / 1256.6, 0.01, 'Check ratio');
  });

  test('Share serializes and deserializes parameters', () => {
    const input = { code: 'EC2', b: 300, h: 500, active: true };
    const query = Share.serialize(input);
    assert.strictEqual(query, 'code=EC2&b=300&h=500&active=true');

    const parsed = Share.deserialize(`?${query}`);
    assert.strictEqual(parsed.code, 'EC2');
    assert.strictEqual(parsed.b, 300);
    assert.strictEqual(parsed.h, 500);
    assert.strictEqual(parsed.active, true);
  });
});
