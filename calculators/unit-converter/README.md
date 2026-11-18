# C11 — Engineering Unit Converter (SI ↔ US Customary)

## 1. Scope and Limitations
This calculator performs high-precision bidirectional conversion between International System (SI) and US Customary / Imperial engineering units across 9 essential structural engineering categories.

### Supported Categories & Units:
1. **Length:** Millimetres ($\text{mm}$), Centimetres ($\text{cm}$), Metres ($\text{m}$), Inches ($\text{in}$), Feet ($\text{ft}$).
2. **Area:** $\text{mm}^2$, $\text{cm}^2$, $\text{m}^2$, $\text{in}^2$, $\text{ft}^2$.
3. **Force:** Newtons ($\text{N}$), Kilonewtons ($\text{kN}$), Meganewtons ($\text{MN}$), Pounds-force ($\text{lbf}$), Kips ($\text{kip}$), Kilograms-force ($\text{kgf}$), Metric Tonnes-force ($\text{tonnef}$).
4. **Bending Moment / Torque:** $\text{Nm}$, $\text{kNm}$, $\text{MNm}$, $\text{lbf}\cdot\text{ft}$, $\text{lbf}\cdot\text{in}$, $\text{kip}\cdot\text{ft}$, $\text{kip}\cdot\text{in}$.
5. **Stress / Pressure:** Pascals ($\text{Pa}$), Kilopascals ($\text{kPa}$), Megapascals ($\text{MPa}$), Gigapascals ($\text{GPa}$), $\text{N/mm}^2$, $\text{kN/m}^2$, $\text{psi}$, $\text{ksi}$, $\text{psf}$, $\text{ksf}$, $\text{bar}$.
6. **Line Load:** $\text{N/m}$, $\text{kN/m}$, $\text{lbf/ft}$, $\text{kip/ft}$, $\text{plf}$, $\text{klf}$.
7. **Area Load / Pressure:** $\text{kN/m}^2$, $\text{kPa}$, $\text{psf}$, $\text{ksf}$, $\text{kg/m}^2$.
8. **Density / Unit Weight:** $\text{kN/m}^3$, $\text{kg/m}^3$, $\text{pcf}$ ($\text{lb/ft}^3$), $\text{g/cm}^3$.
9. **Section Properties:**
   - Second Moment of Area: $\text{mm}^4$, $\text{cm}^4$, $\text{m}^4$, $\text{in}^4$.
   - Elastic / Plastic Section Modulus: $\text{mm}^3$, $\text{cm}^3$, $\text{in}^3$.

---

## 2. Exact Conversion Factors (NIST SP 811)
- $1\text{ in} = 0.0254\text{ m}$ (exact)
- $1\text{ ft} = 0.3048\text{ m}$ (exact)
- $1\text{ lbf} = 4.4482216152605\text{ N}$ (exact via $g = 9.80665\text{ m/s}^2$)
- $1\text{ kip} = 1000\text{ lbf} = 4.4482216152605\text{ kN}$
- $1\text{ ksi} = 1000\text{ psi} = 6.894757293\text{ MPa}$
- $1\text{ kip}\cdot\text{ft} = 1.355817948\text{ kNm}$
- $1\text{ psf} = 0.0478802589\text{ kN/m}^2$
- $1\text{ lb/ft}^3 = 0.157087464\text{ kN/m}^3$
- $1\text{ in}^4 = 416,231.4256\text{ mm}^4$
- $1\text{ in}^3 = 16,387.064\text{ mm}^3$

---

## 3. Verified Acceptance Test Cases (Tolerance $\pm 0.01\%$)
1. $1\text{ ksi} = 6.894757\text{ MPa}$
2. $1\text{ kip} = 4.448222\text{ kN}$
3. $1\text{ kip}\cdot\text{ft} = 1.355818\text{ kNm}$
4. $1\text{ psf} = 0.04788026\text{ kN/m}^2$
5. $1\text{ lb/ft}^3 = 0.1570875\text{ kN/m}^3$
6. $1\text{ in}^4 = 416,231.4\text{ mm}^4$
7. $1\text{ in}^3 = 16,387.06\text{ mm}^3$
