import assert from 'node:assert';

/**
 * Asserts that actual is within tolPct of expected.
 * @param {number} actual 
 * @param {number} expected 
 * @param {number} tolPct (default 0.5%)
 * @param {string} label 
 */
export function expectClose(actual, expected, tolPct = 0.5, label = '') {
  assert(typeof actual === 'number' && !Number.isNaN(actual), `${label}: actual value must be a valid number, got ${actual}`);
  assert(typeof expected === 'number' && !Number.isNaN(expected), `${label}: expected value must be a valid number, got ${expected}`);
  
  if (expected === 0) {
    const diff = Math.abs(actual);
    assert(diff <= 1e-4, `${label}: expected 0, got ${actual}`);
    return { actual, expected, diffPct: 0, pass: true };
  }

  const diffPct = (Math.abs(actual - expected) / Math.abs(expected)) * 100;
  const pass = diffPct <= tolPct + 1e-6;
  
  assert(
    pass,
    `${label ? label + ': ' : ''}Expected ${expected} ±${tolPct}%, but got ${actual} (diff: ${diffPct.toFixed(4)}%)`
  );

  return { actual, expected, diffPct, pass: true };
}
