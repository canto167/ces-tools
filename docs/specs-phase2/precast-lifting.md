# Specification: Precast Concrete Lifting & Rigging Designer

> **UNVERIFIED — engineer review required**

## 1. Scope
Design and verification of precast concrete lifting systems (loops made of prestressing strands or reinforcing steel bars, cast-in anchors, and sling angle geometry) accounting for dynamic amplification factors (DAF), formwork suction, and centre of gravity (CG) offsets.
- Governing guidelines: CIRIA Report 63, PCI Design Handbook (7th/8th Ed) Section 5, Eurocode 2 (bond of loops).

---

## 2. Inputs
- Precast element: self-weight $W_k$ (kN), length $L$, width $B$, thickness $t$, 3D centre of gravity coordinates $(x_g, y_g, z_g)$.
- Rigging configuration:
  - 2-point, 3-point, or 4-point lift (with or without spreader beam).
  - Anchor coordinates $(x_i, y_i)$ on the element face.
  - Sling angle to horizontal $\beta$ (or apex hook height $H_{hook}$).
- Lifting phase & dynamic factor:
  - Demoulding / stripping from mold (formwork adhesion factor $q_{adhesion} = 1.0 - 3.0\text{ kN/m}^2$).
  - Yard handling, transport, or site erection.
  - Dynamic amplification factor (DAF): $\psi = 1.2$ (fixed tower crane), $1.5$ (mobile crane), $2.0$ (rough site transport).
- Anchor type:
  - Deformed rebar loop (grade 500 MPa).
  - 7-wire prestressing strand loop (1860 MPa).
  - Cast-in proprietary lifting clutch/anchor.
- Concrete strength at time of lift $f_{ck,lift}$ (often early age, e.g., $15 - 20\text{ MPa}$).

---

## 3. Governing Equations

### 3.1 Total Design Lifting Force
$$F_{lift} = \gamma_f \cdot \psi \cdot (W_k + F_{adhesion})$$
where:
- $\gamma_f = 1.35$ (partial safety factor).
- $F_{adhesion} = q_{adhesion} \times A_{contact}$ (for stripping from mold).

### 3.2 Individual Anchor Sling Tension
For a 2-point lift symmetric about CG:
$$T_i = \frac{F_{lift}}{2 \sin\beta}$$
where $\beta$ is the sling angle to the top face of the precast element ($\beta \ge 45^\circ$, preferably $\ge 60^\circ$).

For 4-point lift without load equalizing sheaves:
Only 2 anchors are assumed to bear the load statically due to fabrication tolerances (3-legged stool effect):
$$T_{design} = \frac{F_{lift}}{2 \sin\beta}$$

### 3.3 Rebar / Strand Lifting Loop Capacity
1. **Steel Tensile Rupture:**
   $$R_{s} = n_{legs} \cdot A_s \cdot \left(\frac{f_y}{\gamma_s}\right)$$
   where safety factor $\gamma_s = 3.0$ for lifting loops under safety standards.

2. **Concrete Anchorage / Pullout Capacity:**
   $$R_{c} = 2.25 \eta_1 \eta_2 f_{ctd}(t) \cdot (\pi \phi \cdot l_b)$$
   where $l_b$ is embedded loop length.

3. **Concrete Cone Breakout (CEN/TS 1992-4 / ACI 318):**
   $$N_{Rk,c} = k_1 \sqrt{f_{ck,lift}} \cdot h_{ef}^{1.5}$$

---

## 4. Tables Needed
- Demoulding adhesion coefficients $q_{adhesion}$ for steel, timber, and concrete molds (VERIFY AGAINST CODE).
- Dynamic amplification factors $\psi$ by lifting equipment type (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: Precast Solid Plank Stripping & Transport
- Plank $6.0\text{ m} \times 1.2\text{ m} \times 0.2\text{ m}$, volume $1.44\text{ m}^3$, weight $W = 1.44 \times 25 = 36.0\text{ kN}$.
- Stripping: $A_{contact} = 6.0 \times 1.2 = 7.2\text{ m}^2$, adhesion $q = 1.5\text{ kPa} \implies F_{adh} = 10.8\text{ kN}$.
- Total stripped weight = $36 + 10.8 = 46.8\text{ kN}$. Dynamic factor $\psi = 1.3$.
- Design load = $1.35 \times 1.3 \times 46.8 = 82.13\text{ kN}$.
- 4-point lift with 2 effective lifting points at $\beta = 60^\circ$:
  $$T = \frac{82.13}{2 \sin(60^\circ)} = \frac{82.13}{1.732} = 47.42\text{ kN per anchor}$$
- Verify required rebar loop diameter or strand size.

### Test Case 2: Unequal Anchor Distance to CG
- Anchor 1 at $1.5\text{ m}$ from CG, Anchor 2 at $2.5\text{ m}$ from CG. Verify equilibrium tensions.

---

## 6. Known Pitfalls
1. Sling angle $< 45^\circ$ introduces severe lateral compression in thin precast panels, leading to out-of-plane flexural buckling during lift.
2. Concrete strength at lift ($f_{ck,lift}$) is typically much lower than 28-day strength ($f_{ck}$); loop embedment must be sized for stripping age strength.

---

## 7. Questions for Review
- Should the tool include bending checks on precast panels spanning between lifting points during transit?
