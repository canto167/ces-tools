/**
 * Step-by-step engineering calculation report builder
 * Generates transparent clauses, equations, substitutions and checks.
 * Built with universal adapter supporting standard and alternate field naming schemas.
 */

export class CalculationReport {
  constructor(metadata = {}) {
    this.title = metadata.title || '';
    this.subtitle = metadata.subtitle || '';
    this.code = metadata.code || '';
    this.steps = [];
    this.checks = [];
  }

  /**
   * Add calculation step
   * Supports standard { label, equation, substituted, value, unit, clause }
   * and legacy { description/title, formula, values, ref }
   */
  addStep(step) {
    const label = step.label || step.description || step.title || step.ref || 'Step';
    const equation = step.equation || step.formula || '';
    const substituted = step.substituted || step.values || '';
    const value = step.value !== undefined ? step.value : (step.values !== undefined ? step.values : '');
    const unit = step.unit || '';
    const clause = step.clause || step.ref || '';

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
   * Supports standard { name, demand, capacity, ratio, status, clause, unit, message }
   * and legacy { title, actual, allowable/limit, pass }
   */
  addCheck(check) {
    const name = check.name || check.title || 'Design Check';
    const demand = check.demand !== undefined ? check.demand : (check.actual !== undefined ? check.actual : 0);
    const capacity = check.capacity !== undefined ? check.capacity : (check.allowable !== undefined ? check.allowable : (check.limit !== undefined ? check.limit : 0));
    
    let computedRatio = check.ratio;
    if (computedRatio === undefined) {
      if (typeof capacity === 'number' && capacity > 0 && typeof demand === 'number') {
        computedRatio = demand / capacity;
      } else {
        computedRatio = 0;
      }
    }

    let computedStatus = check.status;
    if (!computedStatus) {
      if (check.pass !== undefined) {
        computedStatus = check.pass ? 'PASS' : 'FAIL';
      } else if (computedRatio !== undefined && typeof computedRatio === 'number') {
        computedStatus = computedRatio <= 1.0 ? 'PASS' : 'FAIL';
      } else {
        computedStatus = 'PASS';
      }
    }

    const clause = check.clause || check.ref || '';
    const unit = check.unit || '';
    const defaultMsg = computedStatus === 'PASS' ? 'Design check satisfied' : 'Design capacity exceeded';
    const message = check.message || defaultMsg;

    this.checks.push({
      name,
      demand,
      capacity,
      ratio: computedRatio,
      status: computedStatus,
      clause,
      unit,
      message
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
