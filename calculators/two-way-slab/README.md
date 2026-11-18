# Two-Way Slab (Simply Supported) Designer (`two-way-slab`)

A structural calculation tool for rectangular two-way reinforced concrete slabs supported on four edges with corners not held down, according to **BS 8110-1:1997 Table 3.13**.

---

## 1. Scope & Limitations
- **Boundary Conditions**: 4 edges simply supported, free to lift at corners. (Restrained panels under Table 3.14 are covered in Phase 2).
- **Aspect Ratio**: $l_y / l_x \le 2.0$. If $l_y / l_x > 2.0$, the panel carries load primarily in one direction and must be designed as a one-way slab (`one-way-slab`).
- **Design Actions**: Bending moments in short ($l_x$) and long ($l_y$) directions per 1-metre design strip.
- **Serviceability**: Deflection check performed on the critical short span with tension reinforcement modification factor.

---

## 2. Input Parameters
- **Span Dimensions**: Short span $l_x$ (m), Long span $l_y$ (m).
- **Section**: Overall slab depth $h$ (mm), nominal cover $c$ (mm).
- **Loads**: Finishes ($kN/m^2$), Imposed Variable load $q_k$ ($kN/m^2$). Concrete self-weight is computed automatically ($24\text{ kN/m}^3$).
- **Materials**: Cube strength $f_{cu}$ (N/mm²), steel yield strength $f_y$ (N/mm²).
- **Reinforcement**: Main bar diameter $\phi$ (mm), short span bar spacing $s_x$ (mm), long span bar spacing $s_y$ (mm).

---

## 3. Governing Equations & Clauses
- **Bending Moments (BS 8110 Cl 3.5.3.3 & Table 3.13)**:
  $$m_{sx} = \alpha_{sx} n l_x^2, \quad m_{sy} = \alpha_{sy} n l_x^2$$
  where $\alpha_{sx}$ and $\alpha_{sy}$ are linearly interpolated from Table 3.13 based on $l_y / l_x$.
- **Effective Depths**:
  $$d_x = h - c - \phi/2 \quad \text{(short span outer layer)}$$
  $$d_y = h - c - 1.5\phi \quad \text{(long span inner layer)}$$
- **Flexural Reinforcement (Cl 3.4.4.4)**:
  $$K = \frac{M}{b d^2 f_{cu}}, \quad z = \min(d [0.5 + \sqrt{0.25 - K/0.9}], 0.95d), \quad A_s = \frac{M}{0.87 f_y z}$$
  $$A_{s,min} = 0.0013 b h$$
- **Deflection Check (Cl 3.4.6.3)**:
  $$\text{Basic } l/d = 20, \quad f_s = \frac{2 f_y A_{sx}}{3 A_{px}}, \quad MF = \min\left(2.0, 0.55 + \frac{477 - f_s}{120 (0.9 + m_{sx}/bd_x^2)}\right)$$
- **Shear Stress (Cl 3.5.5)**:
  $$V = \frac{n l_x}{2}, \quad v = \frac{V \times 10^3}{b d_x} \le v_c$$
