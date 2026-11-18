# Specification: Restrained Two-Way Slab Panels (BS 8110 Table 3.14 & EC2)

> **UNVERIFIED — engineer review required**

## 1. Scope
Design of rectangular two-way reinforced concrete slab panels where corners are held down and edges are restrained (continuous or monolithic with support beams/walls).
- BS 8110-1:1997 Clause 3.5.3.5 and Table 3.14 (9 standard edge boundary conditions).
- Eurocode 2 (EN 1992-1-1:2004) elastic plate theory / strip method / yield line analogy.

---

## 2. Inputs
- Clear / effective dimensions: short span $l_x$, long span $l_y$. Aspect ratio $l_y / l_x \le 2.0$ (if $> 2.0$, design as one-way slab).
- Panel boundary case (1 to 9 per Table 3.14):
  1. Interior panel (all 4 edges continuous).
  2. One short edge discontinuous.
  3. One long edge discontinuous.
  4. Two adjacent edges discontinuous (corner panel).
  5. Two short edges discontinuous.
  6. Two long edges discontinuous.
  7. Three edges discontinuous (one long edge continuous).
  8. Three edges discontinuous (one short edge continuous).
  9. Four edges discontinuous (simply supported with corners prevented from lifting).
- Slab thickness $h$, cover $c$.
- Characteristic dead load $g_k$ (including self-weight) and imposed load $q_k$.
- Material strengths: $f_{cu} / f_{ck}, f_y / f_{yk}$.

---

## 3. Governing Equations

### 3.1 Design Ultimate Bending Moments (BS 8110-1:1997 Cl 3.5.3.5)
Design ultimate load per unit area:
$$n = 1.4 g_k + 1.6 q_k \quad (\text{BS 8110}) \quad \text{or} \quad n = 1.35 g_k + 1.5 q_k \quad (\text{EC2})$$

Bending moments per unit width:
- Short span continuous support moment: $M_{sx,supp} = \beta_{sx,supp} \cdot n \cdot l_x^2$
- Short span midspan sagging moment: $M_{sx,mid} = \beta_{sx,mid} \cdot n \cdot l_x^2$
- Long span continuous support moment: $M_{sy,supp} = \beta_{sy,supp} \cdot n \cdot l_x^2$
- Long span midspan sagging moment: $M_{sy,mid} = \beta_{sy,mid} \cdot n \cdot l_x^2$

### 3.2 Table 3.14 Moment Coefficients ($\beta$)
Values depend on $l_y / l_x$ ($1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.75, 2.0$):
*(VERIFY ALL TABLE VALUES AGAINST BS 8110-1:1997 Table 3.14)*

For Case 1 (Interior Panel):
- Short span support: $\beta = 0.031$ to $0.063$
- Short span span: $\beta = 0.024$ to $0.048$
- Long span support: $\beta = 0.032$ (constant)
- Long span span: $\beta = 0.024$ (constant)

For Case 4 (Two Adjacent Edges Discontinuous — Corner Panel):
- Short span continuous support: $\beta = 0.045$ to $0.081$
- Short span midspan: $\beta = 0.034$ to $0.061$
- Long span continuous support: $\beta = 0.045$
- Long span midspan: $\beta = 0.034$

### 3.3 Torsion Reinforcement at Corners (Cl 3.5.3.5)
- Where both edges meeting at a corner are discontinuous (Case 4, 7, 8, 9):
  - Provide top and bottom torsion reinforcement mats in outer $l_x / 5$ square zones.
  - Required area: $A_{st} = \frac{3}{4} \times A_{s,sx,mid}$ in both directions, top and bottom.
- Where one edge meeting at a corner is continuous and one discontinuous:
  - $A_{st} = \frac{3}{8} \times A_{s,sx,mid}$.

---

## 4. Proposed Worked Test Cases

### Test Case 1: Case 1 Interior Panel
- $l_x = 4.0\text{ m}, l_y = 5.0\text{ m} \implies l_y/l_x = 1.25$.
- $h = 175\text{ mm}, g_k = 5.2\text{ kN/m}^2, q_k = 3.0\text{ kN/m}^2 \implies n = 12.08\text{ kN/m}^2$.
- Interpolate Table 3.14 for ratio $1.25$:
  - $\beta_{sx,supp} = 0.0425 \implies M_{sx,supp} = 0.0425 \times 12.08 \times 16 = 8.21\text{ kNm/m}$.
  - $\beta_{sx,mid} = 0.0320 \implies M_{sx,mid} = 0.0320 \times 12.08 \times 16 = 6.18\text{ kNm/m}$.
  - $\beta_{sy,supp} = 0.032 \implies M_{sy,supp} = 0.032 \times 12.08 \times 16 = 6.18\text{ kNm/m}$.
  - $\beta_{sy,mid} = 0.024 \implies M_{sy,mid} = 0.024 \times 12.08 \times 16 = 4.64\text{ kNm/m}$.

### Test Case 2: Case 4 Corner Panel
- Same dimensions and loading, Case 4 boundary condition.
- Verify corner torsion mesh detailing ($A_{st} = 0.75 A_{sx,mid}$).

---

## 5. Known Pitfalls
1. Table 3.14 assumes adjacent panels have similar spans and loading; if adjacent panels differ by $> 15\%$, moment distribution across the support is required.
2. Effective depths differ between short span outer layer ($d_x = h - c - \phi/2$) and long span inner layer ($d_y = h - c - 1.5\phi$).

---

## 6. Questions for Review
- Should we provide moment redistribution across unbalanced adjacent slab panels, or flag a warning to check manually?
