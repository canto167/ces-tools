# Square Pad Footing Designer (BS 8110) (`pad-footing`)

A structural calculation tool for isolated square reinforced concrete pad foundations carrying concentric axial column loads, according to **BS 8110-1:1997 Section 3.11**.

---

## 1. Scope & Limitations
- **Footing Geometry**: Square isolated pad base ($B \times B$) of uniform thickness $h$.
- **Column Geometry**: Square concentric column ($c \times c$) without applied overturning moments.
- **Serviceability (Soil Bearing)**: Factored service load ($G_k + Q_k + \text{self-weight}$) checked against allowable bearing capacity $q_{all}$.
- **Structural Strength (ULS)**:
  - Factored column load $N = 1.4 G_k + 1.6 Q_k$.
  - Flexural bending moment at column face ($M = p_u B a^2 / 2$).
  - Face shear at column perimeter ($v_{face} \le \min(0.8\sqrt{f_{cu}}, 5\text{ N/mm}^2)$).
  - Punching shear at $1.5d$ perimeter ($v_{punch} \le v_c$).
  - One-way beam shear at $d$ from column face ($v_{beam} \le v_c$).

---

## 2. Input Parameters
- **Column Loads**: Dead load $G_k$ (kN), Imposed variable load $Q_k$ (kN).
- **Soil Bearing**: Net allowable bearing capacity $q_{all}$ (kN/m²).
- **Column Size**: Column side dimension $c$ (mm).
- **Footing Dimensions**: Base width $B$ (m), Base thickness $h$ (mm), nominal cover $c_{nom}$ (mm).
- **Materials**: Concrete cube strength $f_{cu}$ (N/mm²), steel yield strength $f_y$ (N/mm²).
- **Reinforcement**: Main bottom bar diameter $\phi$ (mm) and spacing $s$ (mm) in both directions.

---

## 3. Governing Equations & Clauses (BS 8110-1:1997)
1. **Soil Bearing Pressure**:
   $$\text{Self-weight} = B^2 h \gamma_{conc} \quad (\gamma_{conc} = 24\text{ kN/m}^3)$$
   $$q_{serv} = \frac{G_k + Q_k + \text{Self-weight}}{B^2} \le q_{all}$$
2. **Ultimate Soil Pressure (Cl 3.11.2.2)**:
   $$N = 1.4 G_k + 1.6 Q_k, \quad p_u = \frac{N}{B^2}$$
3. **Bending Moment at Column Face (Cl 3.11.2.2)**:
   $$a = \frac{B - c/1000}{2}, \quad M = \frac{p_u B a^2}{2}$$
   $$d = h - c_{nom} - \phi \quad \text{(average effective depth)}$$
   $$K = \frac{M}{B d^2 f_{cu}}, \quad z = \min(d [0.5 + \sqrt{0.25 - K/0.9}], 0.95d), \quad A_s = \frac{M}{0.87 f_y z}$$
   $$A_{s,min} = 0.0013 B h$$
4. **Column Face Shear (Cl 3.11.3.1)**:
   $$v_{face} = \frac{N \times 10^3}{4 c d} \le \min(0.8\sqrt{f_{cu}}, 5\text{ N/mm}^2)$$
5. **Punching Shear at $1.5d$ (Cl 3.7.7.2 & 3.11.3.2)**:
   $$\text{Perimeter side} = c + 3d$$
   $$V_{punch} = N - p_u (\text{Perimeter side}/1000)^2$$
   $$v_{punch} = \frac{V_{punch} \times 10^3}{4 (\text{Perimeter side}) d} \le v_c$$
6. **Beam Shear at Distance $d$ (Cl 3.11.4.3)**:
   $$V_{beam} = p_u B (a - d/1000)$$
   $$v_{beam} = \frac{V_{beam} \times 10^3}{B d} \le v_c$$
