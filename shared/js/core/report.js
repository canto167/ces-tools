/**
 * Step-by-step engineering calculation report builder
 * Generates transparent clauses, equations, substitutions and checks.
 */

export class CalculationReport {
  constructor() {
    this.steps = [];
    this.checks = [];
  }

  /**
   * Add calculation step
   * @param {Object} param
   * @param {string} param.label
   * @param {string} param.equation
   * @param {string} param.substituted
   * @param {number|string} param.value
   * @param {string} param.unit
   * @param {string} param.clause
   */
  addStep({ label, equation, substituted, value, unit = '', clause = '' }) {
    this.steps.push({
      label,
      equation,
      substituted,
      value,
      unit,
      clause
    });
  }

  /**
   * Add design limit state check
   * @param {Object} param
   * @param {string} param.name
   * @param {number} param.demand
   * @param {number} param.capacity
   * @param {number} [param.ratio] (optional, computed if omitted)
   * @param {'PASS'|'FAIL'|'WARN'} [param.status]
   * @param {string} param.clause
   * @param {string} [param.unit]
   * @param {string} [param.message]
   */
  addCheck({ name, demand, capacity, ratio, status, clause = '', unit = '', message = '' }) {
    const computedRatio = ratio !== undefined ? ratio : (capacity > 0 ? demand / capacity : Infinity);
    const computedStatus = status || (computedRatio <= 1.0 ? 'PASS' : 'FAIL');

    this.checks.push({
      name,
      demand,
      capacity,
      ratio: computedRatio,
      status: computedStatus,
      clause,
      unit,
      message: message || (computedStatus === 'PASS' ? 'Design check satisfied' : 'Design capacity exceeded')
    });
  }

  getSteps() {
    return this.steps;
  }

  getChecks() {
    return this.checks;
  }

  allPass() {
    return this.checks.every(c => c.status === 'PASS');
  }
}
