/**
 * Unit helpers and display formatters
 * Rule: Never round intermediate values; round only for display.
 */

export const Units = {
  // Common SI conversion factors
  MM_TO_M: 1e-3,
  M_TO_MM: 1e3,
  KN_TO_N: 1e3,
  N_TO_KN: 1e-3,
  MPA_TO_N_MM2: 1.0,
  KNM_TO_NMM: 1e6,
  NMM_TO_KNM: 1e-6,

  /**
   * Format number for display with fixed decimals or significant figures.
   * Strips trailing zeros after decimal if needed.
   */
  format(val, decimals = 2) {
    if (val === null || val === undefined || Number.isNaN(val)) return '—';
    if (!Number.isFinite(val)) return val > 0 ? '+∞' : '-∞';
    return Number(val.toFixed(decimals)).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Format with exact decimal places.
   */
  formatFixed(val, decimals = 2) {
    if (val === null || val === undefined || Number.isNaN(val)) return '—';
    if (!Number.isFinite(val)) return val > 0 ? '+∞' : '-∞';
    return val.toFixed(decimals);
  },

  /**
   * Format stress (N/mm² or MPa)
   */
  formatStress(val) {
    return `${Units.format(val, 2)} N/mm²`;
  },

  /**
   * Format force (kN)
   */
  formatForce(val) {
    return `${Units.format(val, 1)} kN`;
  },

  /**
   * Format moment (kNm)
   */
  formatMoment(val) {
    return `${Units.format(val, 2)} kNm`;
  },

  /**
   * Format area (mm²)
   */
  formatArea(val) {
    return `${Units.format(val, 1)} mm²`;
  },

  /**
   * Format dimension (mm)
   */
  formatDim(val) {
    return `${Units.format(val, 0)} mm`;
  }
};
