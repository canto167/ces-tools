# Specification: Flanged (T and L) Beam Designer (EC2 & BS 8110)

> **UNVERIFIED — engineer review required**

## 1. Scope
Flexural and shear design of T-beams and L-beams monolithic with slabs or precast composite sections under sagging and hogging bending moments.
- Eurocode 2 (EN 1992-1-1:2004) Clause 5.3.2.1 ($b_{eff}$) and Clause 6.1.
- BS 8110-1:1997 Clause 3.4.1.5 ($b_{eff}$) and Clause 3.4.4.5 (Flanged section flexure).

---

## 2. Inputs
- Web width $b_w$, overall depth $h$, slab/flange thickness $h_f$.
- Beam span $L_0$, beam spacing $b$ (or clear distance between webs $b_1, b_2$).
- Flange type: T-beam (flange on both sides) or L-beam (flange on one side).
- Support condition: Simply supported, continuous, cantilever.
- Design bending moment $M_u$ (sagging or hogging) and shear force $V_u$.
- Materials: concrete grade $f_{ck} / f_{cu}$, steel yield $f_{yk} / f_y$, nominal cover $c$.

---

## 3. Governing Equations

### 3.1 Effective Flange Width $b_{eff}$

#### Eurocode 2 Cl 5.3.2.1
$$b_{eff} = \sum b_{eff,i} + b_w \le b$$
$$b_{eff,i} = 0.2 b_i + 0.1 L_0 \le 0.2 L_0 \quad \text{and} \quad \le b_i$$
where $L_0$ is distance between points of zero moment ($0.85 L$ for end spans, $0.70 L$ for interior spans, $1.0 L$ for simply supported).

#### BS 8110-1:1997 Cl 3.4.1.5
- T-beam: $b_{eff} = b_w + \frac{L_z}{5} \le b$ (where $L_z = 0.7 L$ for continuous, $1.0 L$ for simply supported).
- L-beam: $b_{eff} = b_w + \frac{L_z}{10} \le b$.

### 3.2 Flexural Design under Sagging Moment
Neutral axis depth relative to flange thickness $h_f$:
1. **Neutral axis inside flange ($x \le h_f$):**
   Section behaves as a rectangular beam of width $b_{eff}$.
   $$K = \frac{M}{b_{eff} d^2 f_{cu}} \le K'$$
   Calculate $z$ and $A_s$ using standard rectangular beam equations.

2. **Neutral axis in web ($x > h_f$):**
   Concrete compression force split into flange overhangs and web:
   $$M_f = 0.45 f_{cu} (b_{eff} - b_w) h_f (d - 0.5 h_f) \quad (\text{BS 8110})$$
   Residual moment carried by web: $M_w = M - M_f$.
   $$K_w = \frac{M_w}{b_w d^2 f_{cu}}$$
   $$A_s = \frac{M_f}{0.87 f_y (d - 0.5 h_f)} + \frac{M_w}{0.87 f_y z_w}$$

### 3.3 Hogging Moment at Supports
Under hogging bending moment, the flange is in tension (cracked). The section is designed as a rectangular beam of width $b_w$.

---

## 4. Tables Needed
- BS 8110 Table 3.7: Limiting values of $K'$ (VERIFY AGAINST CODE).
- EC2 Figure 5.3: Values of $L_0$ for different continuous beam configurations (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: T-Beam with NA in Flange
- $b_w = 300\text{ mm}, h = 600\text{ mm}, h_f = 150\text{ mm}, L = 8.0\text{ m}$ (simply supported), $b = 1800\text{ mm}$.
- $b_{eff} = 300 + 8000 / 5 = 1900\text{ mm} \implies \text{governs } b = 1800\text{ mm}$.
- $d = 540\text{ mm}, M = 450\text{ kNm}, f_{cu} = 30\text{ MPa}, f_y = 500\text{ MPa}$.
- Hand verify: $K = 450 \times 10^6 / (1800 \times 540^2 \times 30) = 0.0286 \implies x < 150\text{ mm}$ (inside flange).

### Test Case 2: Heavily Loaded T-Beam with NA in Web
- Same beam with $M = 950\text{ kNm}$. Verify flange resistance $M_f$ and web reinforcement.

---

## 6. Known Pitfalls
1. Longitudinal shear at the interface between flange and web (EC2 Cl 6.2.4) requires transverse reinforcement across the top slab.
2. Under reverse (hogging) moments, the large compression capacity of the flange disappears completely.

---

## 7. Questions for Review
- Should interface longitudinal shear verification ($v_{Edi} \le v_{Rdi}$) be included on the same sheet?
