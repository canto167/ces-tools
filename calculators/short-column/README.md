# C6 — Short Braced Column (Axial Load) Designer to BS 8110

## 1. Scope and Limitations
This calculator designs short, braced rectangular reinforced concrete columns subjected predominantly to axial compression in accordance with **BS 8110-1:1997 clause 3.8.4.3 (Equation 38)**.

### Included:
- Rectangular and square cross-sections ($b \times h$).
- Effective height determination using Table 3.19 end condition coefficients ($\beta$).
- Slenderness assessment for both axes ($l_{ex}/h < 15$ and $l_{ey}/b < 15$).
- Required longitudinal reinforcement $A_{sc,req}$ for specified design ultimate axial load $N$.
- User-selectable bar arrangements (even number $\ge 4$).
- Ultimate axial load capacity $N_{cap}$ and short-term axial capacity $N_{uz}$.
- Transverse link sizing ($\ge \max(6\text{ mm}, \phi_{main}/4)$) and maximum link spacing ($\le \min(12\phi_{main}, b, h)$).
- Code checks: minimum reinforcement ($0.4\% A_c$), maximum reinforcement ($6\% A_c$ or $4\%$ at laps), nominal eccentricity $e_{min} = \min(0.05h, 20\text{ mm})$.

### Excluded / Limitations:
- Slender columns ($l_e/h \ge 15$ or $l_e/b \ge 15$) — requires additional moment calculation (BS 8110 clause 3.8.3, covered in Phase 2).
- Columns subject to significant design moments (uniaxial / biaxial bending — covered in Phase 2 with column interaction charts).
- Unbraced columns (sway frames — Table 3.20, covered in Phase 2).
- Circular or non-rectangular shapes.

---

## 2. Governing Equations and Code Clauses

### 2.1 Effective Height and Slenderness (BS 8110-1:1997 Cl 3.8.1.5, 3.8.1.6)
For braced columns, the effective height is given by:
$$l_e = \beta \cdot l_0$$
where $\beta$ is determined from **Table 3.19** based on the end restraint conditions at top and bottom (Conditions 1, 2, or 3):

| Top \ Bottom | Condition 1 | Condition 2 | Condition 3 |
| :--- | :---: | :---: | :---: |
| **Condition 1** | 0.75 | 0.80 | 0.90 |
| **Condition 2** | 0.80 | 0.85 | 0.95 |
| **Condition 3** | 0.90 | 0.95 | 1.00 |

A column is classified as **short** (Cl 3.8.1.5) when both:
$$\frac{l_{ex}}{h} < 15 \quad \text{and} \quad \frac{l_{ey}}{b} < 15$$
If either ratio $\ge 15$, the column is slender and is blocked by this calculator.

### 2.2 Ultimate Axial Compression Capacity (BS 8110-1:1997 Cl 3.8.4.3 and 3.8.4.4)
Checked against BS 8110-1:1997 incorporating Amendments 1–4 (page 71):

- **Eq 38 (Cl 3.8.4.3)**, where the column cannot be subjected to significant moments:
  $$N = 0.4 f_{cu} A_c + 0.75 A_{sc} f_y$$
- **Eq 39 (Cl 3.8.4.4)**, short braced column supporting an approximately symmetrical arrangement of beams (beams designed for UDL imposed loads, spans within 15% of the longer):
  $$N = 0.35 f_{cu} A_c + 0.67 A_{sc} f_y$$

Both include the allowance for $\gamma_m$. $A_c$ is the **net** concrete area (Cl 3.8.1.1): $A_c = bh - A_{sc}$. The tool defaults to Eq 38; choose Eq 39 for the symmetrical-beams case.

Required steel, with $k_c, k_s$ = (0.4, 0.75) or (0.35, 0.67):
$$A_{sc,req} = \frac{N - k_c f_{cu} bh}{k_s f_y - k_c f_{cu}}$$

### 2.3 Axial Capacity $N_{uz}$ (Cl 3.8.3.1)
$$N_{uz} = 0.45 f_{cu} A_c + 0.87 f_y A_{sc}$$

### 2.4 Reinforcement Limits (Cl 3.12.5.3, 3.12.7.1)
- Minimum steel: $A_{sc,min} = 0.004 A_c = 0.4\% b h$.
- Maximum steel: $A_{sc,max} = 0.06 A_c = 6\% b h$ (at non-lap sections).
- Minimum link diameter: $\phi_{link} \ge \max(6\text{ mm}, \phi_{main}/4)$.
- Maximum link spacing: $s_v \le \min(12\phi_{main}, b, h)$.

### 2.5 Minimum Construction Eccentricity (Cl 3.8.2.4)
$$e_{min} = \min(0.05 h, 20\text{ mm})$$

---

## 3. Verified Acceptance Test Case

### Test Case BS-1
- Inputs: $b = 300\text{ mm}, h = 300\text{ mm}, l_0 = 3.2\text{ m}$, Top End 1, Bottom End 1.
- Design load: $N = 1500\text{ kN}$.
- Materials: $f_{cu} = 30\text{ N/mm}^2, f_y = 500\text{ N/mm}^2$, Eq 38.
- Selected bars: 4H20 ($A_{sc,prov} = 1256.6\text{ mm}^2$).
- Results:
  - $\beta = 0.75$
  - $l_e = 2.40\text{ m}$
  - $l_e/h = 8.0 < 15$ (Short column — PASS)
  - $A_{sc,req} = 420000 / 363 = 1157.0\text{ mm}^2$; $A_c = 90000 - 1256.6 = 88743.4\text{ mm}^2$
  - Capacity $N_{cap} = 1064.9 + 471.2 = 1536.2\text{ kN} \ge 1500\text{ kN}$ (PASS)
  - $N_{uz} = 1744.7\text{ kN}$
  - Minimum link diameter $\phi 6\text{ mm}$, spacing $240\text{ mm}$
  - With Eq 39: $A_{sc,req} = 1710.3\text{ mm}^2$, 4H20 capacity 1352.8 kN (FAIL), 6H20 capacity 1556.7 kN (PASS).
