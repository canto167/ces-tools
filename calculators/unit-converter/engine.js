/**
 * C11 — Engineering Unit Converter Engine
 * High-precision exact conversion factors (NIST SP 811)
 */

export const UNIT_DEFINITIONS = {
  stress: {
    name: 'Stress & Pressure',
    base: 'Pa',
    units: {
      Pa: { factor: 1.0, label: 'Pa (Pascals)' },
      kPa: { factor: 1e3, label: 'kPa (Kilopascals)' },
      MPa: { factor: 1e6, label: 'MPa (N/mm²)' },
      GPa: { factor: 1e9, label: 'GPa (Gigapascals)' },
      'N/mm2': { factor: 1e6, label: 'N/mm²' },
      'kN/m2': { factor: 1e3, label: 'kN/m²' },
      psi: { factor: 6894.757293168361, label: 'psi (lbf/in²)' },
      ksi: { factor: 6894757.293168361, label: 'ksi (kip/in²)' },
      psf: { factor: 47.88025898033584, label: 'psf (lbf/ft²)' },
      ksf: { factor: 47880.25898033584, label: 'ksf (kip/ft²)' },
      bar: { factor: 1e5, label: 'bar' }
    }
  },
  force: {
    name: 'Force',
    base: 'N',
    units: {
      N: { factor: 1.0, label: 'N (Newtons)' },
      kN: { factor: 1e3, label: 'kN (Kilonewtons)' },
      MN: { factor: 1e6, label: 'MN (Meganewtons)' },
      lbf: { factor: 4.4482216152605, label: 'lbf (Pound-force)' },
      kip: { factor: 4448.2216152605, label: 'kip (1000 lbf)' },
      kgf: { factor: 9.80665, label: 'kgf (Kilogram-force)' },
      tonnef: { factor: 9806.65, label: 'tonnef (Metric Tonne-force)' }
    }
  },
  moment: {
    name: 'Bending Moment & Torque',
    base: 'Nm',
    units: {
      Nm: { factor: 1.0, label: 'Nm (Newton-metres)' },
      kNm: { factor: 1e3, label: 'kNm (Kilonewton-metres)' },
      MNm: { factor: 1e6, label: 'MNm (Meganewton-metres)' },
      'lbf·ft': { factor: 1.3558179483314004, label: 'lbf·ft (Pound-feet)' },
      'lbf·in': { factor: 0.1129848290276167, label: 'lbf·in (Pound-inches)' },
      'kip·ft': { factor: 1355.8179483314004, label: 'kip·ft (Kip-feet)' },
      'kip·in': { factor: 112.9848290276167, label: 'kip·in (Kip-inches)' }
    }
  },
  area_load: {
    name: 'Area Load & Pressure',
    base: 'kN/m2',
    units: {
      'kN/m2': { factor: 1.0, label: 'kN/m²' },
      kPa: { factor: 1.0, label: 'kPa' },
      psf: { factor: 0.04788025898033584, label: 'psf (lb/ft²)' },
      ksf: { factor: 47.88025898033584, label: 'ksf (kip/ft²)' }
    }
  },
  density: {
    name: 'Density & Unit Weight',
    base: 'kN/m3',
    units: {
      'kN/m3': { factor: 1.0, label: 'kN/m³' },
      'kg/m3': { factor: 0.00980665, label: 'kg/m³' },
      'lb/ft3': { factor: 0.15708746437954045, label: 'pcf (lb/ft³)' },
      'g/cm3': { factor: 9.80665, label: 'g/cm³' }
    }
  },
  inertia: {
    name: 'Second Moment of Area (Inertia)',
    base: 'mm4',
    units: {
      mm4: { factor: 1.0, label: 'mm⁴' },
      cm4: { factor: 1e4, label: 'cm⁴' },
      m4: { factor: 1e12, label: 'm⁴' },
      in4: { factor: 416231.4256, label: 'in⁴' }
    }
  },
  modulus: {
    name: 'Section Modulus (Elastic/Plastic)',
    base: 'mm3',
    units: {
      mm3: { factor: 1.0, label: 'mm³' },
      cm3: { factor: 1e3, label: 'cm³' },
      in3: { factor: 16387.064, label: 'in³' }
    }
  },
  length: {
    name: 'Length',
    base: 'mm',
    units: {
      mm: { factor: 1.0, label: 'mm' },
      cm: { factor: 10.0, label: 'cm' },
      m: { factor: 1000.0, label: 'm' },
      in: { factor: 25.4, label: 'in (Inches)' },
      ft: { factor: 304.8, label: 'ft (Feet)' }
    }
  },
  area: {
    name: 'Area',
    base: 'mm2',
    units: {
      mm2: { factor: 1.0, label: 'mm²' },
      cm2: { factor: 100.0, label: 'cm²' },
      m2: { factor: 1e6, label: 'm²' },
      in2: { factor: 645.16, label: 'in²' },
      ft2: { factor: 92903.04, label: 'ft²' }
    }
  },
  line_load: {
    name: 'Line Load',
    base: 'kN/m',
    units: {
      'kN/m': { factor: 1.0, label: 'kN/m' },
      'N/m': { factor: 1e-3, label: 'N/m' },
      'lbf/ft': { factor: 0.014593902937206364, label: 'lbf/ft (plf)' },
      'kip/ft': { factor: 14.593902937206364, label: 'kip/ft (klf)' }
    }
  }
};

export function convertUnits(value, fromUnit, toUnit, category) {
  const cat = UNIT_DEFINITIONS[category];
  if (!cat) throw new Error(`Unknown category: ${category}`);

  const uFrom = cat.units[fromUnit];
  const uTo = cat.units[toUnit];
  if (!uFrom) throw new Error(`Unknown source unit: ${fromUnit} in ${category}`);
  if (!uTo) throw new Error(`Unknown target unit: ${toUnit} in ${category}`);

  const baseVal = value * uFrom.factor;
  const result = baseVal / uTo.factor;
  return result;
}

export function convertAllInCategory(value, fromUnit, category) {
  const cat = UNIT_DEFINITIONS[category];
  if (!cat) return [];

  const uFrom = cat.units[fromUnit];
  if (!uFrom) return [];

  const baseVal = value * uFrom.factor;
  return Object.keys(cat.units).map(key => {
    const u = cat.units[key];
    const val = baseVal / u.factor;
    return {
      unitKey: key,
      label: u.label,
      value: val,
      isSource: key === fromUnit
    };
  });
}
