/**
 * Input validation helpers & Structural Engineering Guards
 * Implements statutory invariants and boundary checks inspired by BS 8110, Eurocode 2, and STRUCT Agent.
 * Ensures no NaN, null, infinite, negative, or unphysical values pass silently.
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
   * Validate that a value is a finite numerical value.
   * Throws or pushes error message if invalid.
   */
  finiteNumber(name, val, { allowNegative = false, min = -Infinity, max = Infinity } = {}) {
    if (!Validate.isNumber(val)) {
      return { valid: false, error: `Parameter '${name}' must be a finite numerical value.` };
    }
    if (!allowNegative && val < 0) {
      return { valid: false, error: `Parameter '${name}' cannot be negative (got ${val}).` };
    }
    if (val < min) {
      return { valid: false, error: `Parameter '${name}' (${val}) cannot be less than ${min}.` };
    }
    if (val > max) {
      return { valid: false, error: `Parameter '${name}' (${val}) cannot exceed ${max}.` };
    }
    return { valid: true, value: val };
  },

  /**
   * Validate section dimension (must be positive and >= minVal)
   */
  dimension(name, val, minVal = 1.0) {
    if (!Validate.isNumber(val) || val < minVal) {
      return { valid: false, error: `Dimension '${name}' must be at least ${minVal} mm (got ${val}).` };
    }
    return { valid: true, value: val };
  },

  /**
   * Concrete compressive strength check
   * EC2: fck in [12, 90] MPa (cylinder)
   * BS 8110: fcu in [20, 60] MPa (cube)
   */
  concreteStrength(f, code = 'EC2') {
    const isBS = String(code).toUpperCase().includes('BS');
    const min = isBS ? 20 : 12;
    const max = isBS ? 60 : 90;
    const label = isBS ? 'fcu (cube strength)' : 'fck (cylinder strength)';

    if (!Validate.isNumber(f) || f < min || f > max) {
      return {
        valid: false,
        error: `Concrete strength ${label} (${f} N/mm²) is outside the standard design range [${min}, ${max}] N/mm² per ${isBS ? 'BS 8110-1:1997 Cl 3.1.7.2' : 'EN 1992-1-1:2004 Table 3.1'}.`
      };
    }
    return { valid: true, value: f };
  },

  /**
   * Steel reinforcing yield strength check
   * Standard range: 250 to 600 MPa (Grade 250, Grade 460, Grade 500, Grade B500B)
   */
  steelStrength(fy, label = 'Steel yield strength') {
    if (!Validate.isNumber(fy) || fy < 250 || fy > 600) {
      return {
        valid: false,
        error: `${label} (${fy} N/mm²) is outside the standard structural rebar range [250, 600] N/mm² (BS 4449 / BS 8110 / EC2).`
      };
    }
    return { valid: true, value: fy };
  },

  /**
   * Concrete cover physical sanity check
   * Concrete cover cannot exceed half the minimum section dimension.
   */
  coverSanity(cover, b, h) {
    const minDim = Math.min(b, h);
    if (!Validate.isNumber(cover) || cover <= 0) {
      return { valid: false, error: `Concrete cover must be greater than 0 mm (got ${cover}).` };
    }
    if (cover >= minDim / 2.0) {
      return {
        valid: false,
        error: `Nominal cover (${cover} mm) exceeds or equals half the minimum section dimension (${minDim / 2.0} mm). Infeasible section geometry.`
      };
    }
    return { valid: true, value: cover };
  },

  /**
   * Punching shear beta magnification factor
   * Practical design range: [1.0, 2.5]
   */
  punchingBeta(beta) {
    if (!Validate.isNumber(beta) || beta < 1.0 || beta > 2.5) {
      return {
        valid: false,
        error: `Punching shear magnification factor beta (${beta}) is outside the acceptable range [1.0, 2.5] per EN 1992-1-1 Cl 6.4.3.`
      };
    }
    return { valid: true, value: beta };
  },

  /**
   * Soil internal friction angle phi (degrees)
   * Standard granular soil: [15, 45] deg
   */
  soilFriction(phi) {
    if (!Validate.isNumber(phi) || phi < 15 || phi > 45) {
      return {
        valid: false,
        error: `Internal friction angle phi (${phi}°) is outside standard geotechnical range [15°, 45°] (BS 8002 / EC7).`
      };
    }
    return { valid: true, value: phi };
  },

  /**
   * Validate required numeric fields (Declarative schema validator)
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
