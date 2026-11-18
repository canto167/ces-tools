/**
 * Input validation helpers
 * Ensures no NaN, null, negative or out-of-range values pass silently.
 */

export const Validate = {
  isNumber(val) {
    return typeof val === 'number' && !Number.isNaN(val) && Number.isFinite(val);
  },

  isPositive(val) {
    return Validate.isNumber(val) && val > 0;
  },

  isNonNegative(val) {
    return Validate.isNumber(val) && val >= 0;
  },

  inRange(val, min, max) {
    return Validate.isNumber(val) && val >= min && val <= max;
  },

  /**
   * Validate required numeric fields
   * @param {Object} input 
   * @param {Array<{field: string, label: string, min?: number, max?: number, positive?: boolean}>} schema 
   * @returns {{ valid: boolean, errors: string[] }}
   */
  check(input, schema) {
    const errors = [];
    for (const rule of schema) {
      const val = input[rule.field];
      const label = rule.label || rule.field;

      if (!Validate.isNumber(val)) {
        errors.push(`${label} must be a valid number.`);
        continue;
      }

      if (rule.positive && val <= 0) {
        errors.push(`${label} must be greater than 0.`);
      }

      if (rule.min !== undefined && val < rule.min) {
        errors.push(`${label} cannot be less than ${rule.min}.`);
      }

      if (rule.max !== undefined && val > rule.max) {
        errors.push(`${label} cannot exceed ${rule.max}.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
