/**
 * Reinforcement bar geometry, weights and tables
 * Densities and formulas comply with EN 1992-1-1 and BS 8110 / BS 4449
 */

export const STANDARD_BAR_DIAS = [6, 8, 10, 12, 16, 20, 25, 32, 40];
export const STEEL_DENSITY = 7850; // kg/m³

export const Bars = {
  /**
   * Cross-sectional area of a single rebar (mm²)
   * Area = π * φ² / 4
   */
  area(dia) {
    if (!dia || dia <= 0) return 0;
    return (Math.PI * dia * dia) / 4;
  },

  /**
   * Total cross-sectional area of n rebars (mm²)
   */
  totalArea(numBars, dia) {
    if (!numBars || numBars <= 0 || !dia || dia <= 0) return 0;
    return numBars * Bars.area(dia);
  },

  /**
   * Slab reinforcement area per metre width (mm²/m)
   * As/m = 1000 * (π * φ² / 4) / spacing
   */
  areaPerMetre(dia, spacing) {
    if (!dia || dia <= 0 || !spacing || spacing <= 0) return 0;
    return (1000 * Bars.area(dia)) / spacing;
  },

  /**
   * Unit weight of rebar (kg/m)
   * Exact: (π * φ² / 4) * 7850 * 10^-6
   */
  weightPerMetreExact(dia) {
    if (!dia || dia <= 0) return 0;
    return (Bars.area(dia) * STEEL_DENSITY) * 1e-6;
  },

  /**
   * Rule of thumb unit weight (kg/m): φ² / 162
   */
  weightPerMetreRule(dia) {
    if (!dia || dia <= 0) return 0;
    return (dia * dia) / 162;
  },

  /**
   * Minimum clear spacing between bars
   * EC2 Cl 8.2: max(k1 * φ, d_g + k2, 20mm), where k1=1, k2=5mm
   * BS 8110 Cl 3.12.11: max(φ, agg + 5mm)
   */
  minClearSpacing(dia, aggSize = 20, code = 'EC2') {
    if (code === 'EC2') {
      return Math.max(dia, aggSize + 5, 20);
    }
    // BS 8110
    return Math.max(dia, aggSize + 5);
  }
};
