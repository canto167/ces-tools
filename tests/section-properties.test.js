import { test, describe } from 'node:test';
import assert from 'node:assert';
import { expectClose } from './test-helpers.js';
import { calculateSection } from '../calculators/section-properties/engine.js';

// Expected values worked out by hand in the comments.
describe('C12 Section Properties Acceptance Test Suite', () => {
  test('Rectangle 300 x 500 mm', () => {
    const r = calculateSection({ shape: 'rectangle', dims: { b: 300, h: 500 } }).results;
    expectClose(r.A, 150000, 0.01, 'A = 300*500');
    expectClose(r.ybar, 250, 0.01, 'ybar = h/2');
    expectClose(r.Ix, 3.125e9, 0.01, 'Ix = bh^3/12 = 300*500^3/12');
    expectClose(r.Iy, 1.125e9, 0.01, 'Iy = hb^3/12 = 500*300^3/12');
    expectClose(r.Sx, 1.25e7, 0.01, 'Sx = bh^2/6');
    expectClose(r.Zx, 1.875e7, 0.05, 'Zx = bh^2/4');
    expectClose(r.rx, 144.34, 0.05, 'rx = h/sqrt(12)');
    expectClose(r.shapeFactorX, 1.5, 0.05, 'shape factor 1.5');
  });

  test('Symmetric I-section h=400, bf=200, tf=15, tw=10 mm', () => {
    const r = calculateSection({ shape: 'i-section', dims: { h: 400, bf: 200, tf: 15, tw: 10 } }).results;
    // A = 2*200*15 + 10*370 = 9,700
    expectClose(r.A, 9700, 0.01, 'A');
    // Ix = (200*400^3 - 190*370^3)/12 = (12.8e9 - 9.62407e9)/12 = 2.64661e8
    expectClose(r.Ix, 2.64661e8, 0.01, 'Ix');
    // Iy = 2*15*200^3/12 + 370*10^3/12 = 2.0e7 + 30,833 = 2.003083e7
    expectClose(r.Iy, 2.003083e7, 0.01, 'Iy');
    // Sx = Ix/200 = 1.323305e6
    expectClose(r.Sx, 1.323305e6, 0.01, 'Sx');
    // Zx = 2*(200*15*192.5) + 2*(10*185*92.5) = 1,155,000 + 342,250 = 1,497,250
    expectClose(r.Zx, 1497250, 0.05, 'Zx');
    expectClose(r.ybar, 200, 0.01, 'ybar mid-depth');
  });

  test('T-section h=300, bf=200, tf=20, tw=12 mm (flange on top)', () => {
    const r = calculateSection({ shape: 't-section', dims: { h: 300, bf: 200, tf: 20, tw: 12 } }).results;
    // flange 200x20 at y=290 (A=4000), web 12x280 at y=140 (A=3360); A=7360
    const A = 7360, yb = (4000 * 290 + 3360 * 140) / A; // 221.522
    const Ix = 200 * 20 ** 3 / 12 + 4000 * (290 - yb) ** 2 + 12 * 280 ** 3 / 12 + 3360 * (140 - yb) ** 2;
    expectClose(r.A, A, 0.01, 'A');
    expectClose(r.ybar, yb, 0.01, 'ybar');
    expectClose(r.Ix, Ix, 0.01, 'Ix');
    // PNA: area below = A/2 = 3680 > web area 3360, so PNA is in the flange:
    // 3360 + 200*(y-280) = 3680 -> y = 281.6; Zx = 3360*(281.6-140) + 200*1.6*0.8 + 200*18.4*9.2
    const Zx = 3360 * 141.6 + 200 * 1.6 * 0.8 + 200 * 18.4 * 9.2;
    expectClose(r.pnaX, 281.6, 0.05, 'plastic neutral axis');
    expectClose(r.Zx, Zx, 0.05, 'Zx');
    expectClose(r.Sx_bot, Ix / yb, 0.01, 'Sx bottom');
    expectClose(r.Sx, Ix / yb, 0.01, 'Sx = min (bottom fibre further)');
  });

  test('Solid circle D=100 mm and pipe D=100, t=10 mm', () => {
    const c = calculateSection({ shape: 'circle', dims: { D: 100 } }).results;
    expectClose(c.A, Math.PI * 2500, 0.01, 'A circle');
    expectClose(c.Ix, Math.PI * 1e8 / 64, 0.01, 'I = pi D^4/64 = 4.9087e6');
    expectClose(c.Zx, 1e6 / 6, 0.01, 'Z = D^3/6');
    expectClose(c.rx, 25, 0.01, 'r = D/4');
    const p = calculateSection({ shape: 'pipe', dims: { D: 100, t: 10 } }).results;
    expectClose(p.Ix, Math.PI * (1e8 - 80 ** 4) / 64, 0.01, 'I pipe');
    expectClose(p.Zx, (1e6 - 80 ** 3) / 6, 0.01, 'Z pipe');
  });

  test('Box 200 x 300 x 10 mm walls', () => {
    const r = calculateSection({ shape: 'box', dims: { b: 200, h: 300, t: 10, tf: 10 } }).results;
    expectClose(r.A, 200 * 300 - 180 * 280, 0.01, 'A = outer - inner');
    expectClose(r.Ix, (200 * 300 ** 3 - 180 * 280 ** 3) / 12, 0.01, 'Ix = (BH^3 - bh^3)/12');
    expectClose(r.Iy, (300 * 200 ** 3 - 280 * 180 ** 3) / 12, 0.01, 'Iy');
  });

  test('Channel h=200, bf=75, tf=10, tw=6 mm: centroid from the web side', () => {
    const r = calculateSection({ shape: 'channel', dims: { h: 200, bf: 75, tf: 10, tw: 6 } }).results;
    // flanges 2 x 75x10 (A=750 each, x=37.5), web 6x180 (A=1080, x=3); A=2580
    const xb = (2 * 750 * 37.5 + 1080 * 3) / 2580; // 23.06 mm from the back of the web
    expectClose(r.A, 2580, 0.01, 'A');
    expectClose(r.xbar, xb, 0.01, 'xbar');
    expectClose(r.Ix, (75 * 200 ** 3 - 69 * 180 ** 3) / 12, 0.01, 'Ix');
  });

  test('Built-up: two rectangles equal a T-section', () => {
    const t = calculateSection({ shape: 't-section', dims: { h: 300, bf: 200, tf: 20, tw: 12 } }).results;
    const b = calculateSection({ shape: 'built-up', dims: { rects: [{ b: 200, h: 20, x: 0, y: 280 }, { b: 12, h: 280, x: 94, y: 0 }] } }).results;
    expectClose(b.Ix, t.Ix, 0.01, 'Ix matches');
    expectClose(b.Zx, t.Zx, 0.05, 'Zx matches');
  });

  test('Imperial: W-shape-like I in inches keeps units', () => {
    const out = calculateSection({ shape: 'i-section', units: 'in', dims: { h: 12, bf: 6, tf: 0.5, tw: 0.25 } });
    assert.strictEqual(out.units, 'in');
    // Ix = (6*12^3 - 5.75*11^3)/12 = (10368 - 7653.25)/12 = 226.229 in^4
    expectClose(out.results.Ix, 226.229, 0.01, 'Ix in^4');
    assert(out.steps.some(s => s.unit === 'in⁴'));
  });

  test('Guards: bad shapes and dimensions are rejected', () => {
    assert.strictEqual(calculateSection({ shape: 'hexagon', dims: {} }).ok, false);
    assert.strictEqual(calculateSection({ shape: 'rectangle', dims: { b: 0, h: 500 } }).ok, false);
    assert.strictEqual(calculateSection({ shape: 'i-section', dims: { h: 20, bf: 100, tf: 15, tw: 10 } }).ok, false);
    assert.strictEqual(calculateSection({ shape: 'pipe', dims: { D: 100, t: 60 } }).ok, false);
    assert.strictEqual(calculateSection({ shape: 'built-up', dims: { rects: [] } }).ok, false);
  });
});
