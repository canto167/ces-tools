# Specification: Punching Shear in Flat Slabs to BS 8110

> **UNVERIFIED — engineer review required**

## 1. Scope
Punching shear verification and link reinforcement design for flat slabs around column heads and concentrated loads according to **BS 8110-1:1997 Clause 3.7.7**.

---

## 2. Inputs
- Slab geometry: effective depth $d = (d_x + d_y) / 2$, overall slab depth $h$.
- Column dimensions: rectangular $c_1 \times c_2$ or circular diameter $D$.
- Column position: internal, edge (bending toward interior/parallel to edge), or corner.
- Design ultimate vertical shear load $V_{eff} = 1.15 V_t$ (internal), $1.25 V_t$ or $1.4 V_t$ (edge), $1.25 V_t$ (corner) (BS 8110 Cl 3.7.6.2).
- Tensile reinforcement ratio $100 A_s / (b d) \le 3.0$.
- Materials: concrete cube strength $f_{cu} \le 40\text{ MPa}$ for $v_c$, steel yield $f_y$.

---

## 3. Governing Equations

### 3.1 Maximum Shear Stress at Column Face (Cl 3.7.7.2)
$$v_{max} = \frac{V_{eff}}{u_0 d} \le \min(0.8 \sqrt{f_{cu}}, 5.0\text{ N/mm}^2)$$
where $u_0$ is the perimeter of the column face.

### 3.2 Shear Stress at 1.5d Failure Zone (Cl 3.7.7.3)
Perimeter $u_1$ is rectangular with rounded or squared corners at distance $1.5 d$ from column face:
$$u_1 = 2 (c_1 + c_2) + 8 \times 1.5 d = 2 (c_1 + c_2) + 12 d \quad (\text{square corners})$$
$$v = \frac{V_{eff}}{u_1 d}$$

Design concrete shear stress $v_c$ from Table 3.8:
$$v_c = \frac{0.79}{1.25} \left(\frac{100 A_s}{u_1 d}\right)^{1/3} \left(\frac{400}{d}\right)^{1/4} \left(\frac{f_{cu}}{25}\right)^{1/3}$$
where $(400/d)^{1/4} \ge 1.0$ for slabs without links.

### 3.3 Shear Reinforcement Provision (Cl 3.7.7.5)
- If $v \le v_c$: No shear links required.
- If $v_c < v \le 2.0 v_c$: Shear links required.
  $$\Sigma A_{sv} \ge \frac{(v - v_c) u_1 d}{0.87 f_{yv}}$$
  Provide links in two perimeters:
  - First perimeter at $\le 0.5 d$ from column face.
  - Second perimeter at $1.25 d$ from column face.
- If $v > 2.0 v_c$: Section thickness must be increased (shear failure cannot be prevented by links in thin slabs).

### 3.4 Outer Perimeters
Continue checking outer perimeters at successive $0.75 d$ intervals until $v \le v_c$.

---

## 4. Tables Needed
- BS 8110 Table 3.8: Values of $v_c$ (VERIFY AGAINST CODE).
- Clause 3.7.6.2: Values of magnification factor $1.15, 1.25, 1.40$ for $V_{eff}$ (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: Internal Column Punching Shear
- Slab $h = 250\text{ mm}, d = 200\text{ mm}, c_1 = 400\text{ mm}, c_2 = 400\text{ mm}, f_{cu} = 30\text{ MPa}$.
- Tension steel: H16 @ 150 both ways $\implies 100 A_s / (b d) = 100 \times 1340 / (1000 \times 200) = 0.67\%$.
- $V = 650\text{ kN} \implies V_{eff} = 1.15 \times 650 = 747.5\text{ kN}$.
- Hand working verify:
  - Column face $u_0 = 1600\text{ mm} \implies v_{face} = 747,500 / (1600 \times 200) = 2.336\text{ N/mm}^2 \le 4.38\text{ N/mm}^2$ (PASS).
  - $1.5d$ perimeter $u_1 = 1600 + 12(200) = 4000\text{ mm}$.
  - $v = 747,500 / (4000 \times 200) = 0.934\text{ N/mm}^2$.
  - $v_c = 0.638\text{ N/mm}^2$.
  - $v_c < v < 2 v_c \implies$ Links required. $\Sigma A_{sv} = (0.934 - 0.638) \times 4000 \times 200 / (0.87 \times 500) = 543.4\text{ mm}^2$.

### Test Case 2: Edge Column Punching Shear
- Edge column $400 \times 400\text{ mm}$, $V = 400\text{ kN}, V_{eff} = 1.4 \times 400 = 560\text{ kN}$.
- U-shaped 3-sided failure perimeter $u_1 = c_1 + 2 c_2 + 6 d$.

---

## 6. Known Pitfalls
1. BS 8110 sets the control perimeter at $1.5 d$ from column face with square corners, whereas Eurocode 2 sets it at $2.0 d$ with rounded corners.
2. In BS 8110, if $v > 2 v_c$, increasing links does not work—the slab depth or column dimensions must be increased.

---

## 7. Questions for Review
- Should the tool support drop panels (Cl 3.7.7.8) and shear ladders/stud rails?
