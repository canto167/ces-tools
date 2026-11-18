# Specification: Slender Column Designer with Uniaxial & Biaxial Bending

> **UNVERIFIED — engineer review required**

## 1. Scope
Design of slender and short reinforced concrete columns subjected to combined axial compression and bending moments (uniaxial or biaxial).
- Eurocode 2 (EN 1992-1-1:2004) Clause 5.8: Second order effects with nominal curvature ($1/r$).
- BS 8110-1:1997 Clauses 3.8.3 (Additional moments for slenderness) and 3.8.4.5 (Biaxial bending simplification).

---

## 2. Inputs
- Section dimensions: width $b$, depth $h$.
- Clear height $l_0$, effective lengths $l_{ex}, l_{ey}$ (braced or unbraced).
- Design ultimate axial load $N_{Ed} / N$.
- First-order end moments about major axis ($M_{01,x}, M_{02,x}$) and minor axis ($M_{01,y}, M_{02,y}$).
- Material properties: concrete $f_{ck} / f_{cu}$, steel $f_{yk} / f_y$, nominal cover $c$.
- Creep ratio $\phi_{ef} = \phi(\infty, t_0) \cdot M_{0Eqp} / M_{0Ed}$.

---

## 3. Governing Equations

### 3.1 Slenderness Assessment
- **BS 8110 Cl 3.8.1.5:**
  Slender if $l_{ex}/h \ge 15$ or $l_{ey}/b \ge 15$ (braced), or $\ge 10$ (unbraced).
- **EC2 Cl 5.8.3.1:**
  Slenderness $\lambda = l_0 / i$. Limiting slenderness:
  $$\lambda_{lim} = \frac{20 \cdot A \cdot B \cdot C}{\sqrt{n}}$$
  where $A = 1 / (1 + 0.2 \phi_{ef})$, $B = \sqrt{1 + 2\omega}$, $C = 1.7 - r_m$, $n = N_{Ed} / (A_c f_{cd})$.
  If $\lambda > \lambda_{lim}$, second-order moments must be considered.

### 3.2 Second-Order Additional Moments

#### Eurocode 2 Nominal Curvature Method (Cl 5.8.8)
Total design moment:
$$M_{Ed} = M_{0Ed} + M_2$$
$$M_2 = N_{Ed} e_2 = N_{Ed} \left(\frac{1}{r}\right) \frac{l_0^2}{c}$$
where $c = 10$ (for sinusoidal/constant curvature);
$$\frac{1}{r} = K_r K_\phi \left(\frac{1}{r_0}\right)$$
$$\frac{1}{r_0} = \frac{\epsilon_{yd}}{0.45 d} = \frac{f_{yd} / E_s}{0.45 d}$$
$$K_r = \frac{n_u - n}{n_u - n_{bal}} \le 1.0$$
$$K_\phi = 1 + \beta \phi_{ef} \ge 1.0, \quad \beta = 0.35 + \frac{f_{ck}}{200} - \frac{\lambda}{150}$$

#### BS 8110 Additional Moment Method (Cl 3.8.3)
$$M_{add} = N \cdot a_u$$
$$a_u = \beta_a K h$$
$$\beta_a = \frac{1}{2000} \left(\frac{l_e}{h}\right)^2$$
$$K = \frac{N_{uz} - N}{N_{uz} - N_{bal}} \le 1.0$$
Total design moment:
$$M_t = M_i + M_{add} \ge M_2$$
where equivalent first-order moment $M_i = 0.4 M_1 + 0.6 M_2 \ge 0.4 M_2$.

### 3.3 Biaxial Bending Simplification (BS 8110 Cl 3.8.4.5)
When a column experiences moments about both axes simultaneously, it is designed for an equivalent uniaxial moment about one critical axis:
- If $\frac{M_x}{h'} \ge \frac{M_y}{b'}$:
  $$M_x' = M_x + \beta \left(\frac{h'}{b'}\right) M_y$$
- If $\frac{M_x}{h'} < \frac{M_y}{b'}$:
  $$M_y' = M_y + \beta \left(\frac{b'}{h'}\right) M_x$$
where $\beta$ is a function of $N / (b h f_{cu})$ from Table 3.22 (ranging from $0.3$ to $0.9$).

---

## 4. Tables Needed
- BS 8110 Table 3.22: Coefficient $\beta$ for biaxial bending (VERIFY AGAINST CODE).
- EC2 Table 5.1: Effective length coefficients for sway and non-sway columns (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: Slender Uniaxial Braced Column to BS 8110
- $b = 300\text{ mm}, h = 300\text{ mm}, l_e = 6.0\text{ m} \implies l_e/h = 20 > 15$ (Slender).
- $N = 1000\text{ kN}, M_1 = 30\text{ kNm}, M_2 = 45\text{ kNm}, f_{cu} = 35\text{ MPa}, f_y = 500\text{ MPa}$.
- Hand working verify:
  - $\beta_a = (20)^2 / 2000 = 0.20$.
  - $a_u = 0.20 \times 1.0 \times 0.3 = 0.06\text{ m} = 60\text{ mm}$.
  - $M_{add} = 1000 \times 0.06 = 60\text{ kNm}$.
  - $M_i = 0.4(30) + 0.6(45) = 39\text{ kNm}$.
  - $M_t = 39 + 60 = 99\text{ kNm}$.

### Test Case 2: Biaxial Short Column to BS 8110
- $300 \times 400\text{ mm}, N = 800\text{ kN}, M_x = 70\text{ kNm}, M_y = 40\text{ kNm}$.
- Calculate equivalent enhanced uniaxial moment $M_x'$ using Table 3.22 factor $\beta$.

---

## 6. Known Pitfalls
1. Iterative $K$ factor: $K$ depends on steel area $A_s$, but $A_s$ depends on design moment $M_t$. A 2-pass iterative loop is required.
2. Minimum eccentricity moment $M_{min} = N \cdot e_{min}$ must never be omitted.

---

## 7. Questions for Review
- Should we plot interactive $N-M$ interaction charts ($P-M$ envelopes) directly in SVG?
