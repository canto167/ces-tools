# Specification: Crack Width Calculation (EC2 Cl 7.3.4 & BS 8110-2 Cl 3.8)

> **UNVERIFIED — engineer review required**

## 1. Scope
Calculation of characteristic crack widths ($w_k$) under quasi-permanent / frequent SLS load combinations for reinforced concrete flexural members (beams and slabs) and members in pure tension.
- Eurocode 2: EN 1992-1-1:2004 Clause 7.3.4.
- BS 8110: BS 8110-2:1985 Clause 3.8.

---

## 2. Inputs
- Section geometry: $b, h, d, c$ (cover to tension bars).
- Tension reinforcement: bar diameter $\phi$, bar count $n$ or spacing $s$, provided area $A_s$.
- Material properties: concrete grade $f_{ck}$ (EC2) / $f_{cu}$ (BS 8110), steel yield $f_{yk} / f_y$, modular ratio $\alpha_e = E_s / E_{c,eff}$ where $E_{c,eff} = E_{cm} / (1 + \phi_{creep})$.
- Loading: service bending moment $M_{qp}$ (quasi-permanent) or axial tensile force $N_{qp}$.
- Environmental exposure class / allowable crack width limit ($w_{max} = 0.3\text{ mm}$ default; $0.2\text{ mm}$ for water-retaining or severe exposure).

---

## 3. Governing Equations

### 3.1 Eurocode 2 (EN 1992-1-1:2004 Cl 7.3.4)
1. **Crack Width Formulation (Eq 7.8):**
   $$w_k = s_{r,max} (\epsilon_{sm} - \epsilon_{cm})$$

2. **Mean Strain Difference $(\epsilon_{sm} - \epsilon_{cm})$ (Eq 7.9):**
   $$\epsilon_{sm} - \epsilon_{cm} = \frac{\sigma_s - k_t \frac{f_{ct,eff}}{\rho_{p,eff}} (1 + \alpha_e \rho_{p,eff})}{E_s} \ge 0.6 \frac{\sigma_s}{E_s}$$
   where:
   - $\sigma_s$ = service steel stress at cracked section.
   - $k_t$ = duration factor: $0.6$ for short-term, $0.4$ for long-term loading.
   - $f_{ct,eff} = f_{ctm} = 0.30 f_{ck}^{2/3}$.
   - $\rho_{p,eff} = A_s / A_{c,eff}$.
   - $A_{c,eff} = b \cdot h_{c,ef}$, where $h_{c,ef} = \min(2.5(h - d), (h - x)/3, h/2)$ (Eq 7.11).
   - $x$ = cracked neutral axis depth: $x = d [-\alpha_e \rho + \sqrt{(\alpha_e \rho)^2 + 2 \alpha_e \rho}]$.

3. **Maximum Crack Spacing $s_{r,max}$ (Eq 7.11):**
   When bar spacing $\le 5(c + \phi/2)$:
   $$s_{r,max} = k_3 c + \frac{k_1 k_2 k_4 \phi}{\rho_{p,eff}}$$
   where recommended values (VERIFY AGAINST NATIONAL ANNEX):
   - $k_1 = 0.8$ (high-bond ribbed bars), $1.6$ (plain).
   - $k_2 = 0.5$ (bending), $1.0$ (pure tension).
   - $k_3 = 3.4$ (UK NA / recommended), $k_4 = 0.425$.
   When bar spacing $> 5(c + \phi/2)$ (Eq 7.14):
   $$s_{r,max} = 1.3(h - x)$$

### 3.2 BS 8110-2:1985 Clause 3.8
1. **Design Surface Crack Width (Eq 12):**
   $$w = \frac{3 a_{cr} \epsilon_m}{1 + 2 \left(\frac{a_{cr} - c_{min}}{h - x}\right)}$$
   where:
   - $a_{cr}$ = distance from point of crack measurement to nearest longitudinal bar surface.
   - $c_{min}$ = minimum cover to tension steel.
   - $\epsilon_1 = \left(\frac{h - x}{d - x}\right) \frac{\sigma_s}{E_s}$ (strain at tension face).
   - $\epsilon_2 = \frac{b_t (h - x)^2}{3 E_s A_s (d - x)}$ (stiffening effect of concrete).
   - $\epsilon_m = \epsilon_1 - \epsilon_2$.

---

## 4. Tables Needed
- Table 7.1N: Recommended values of $w_{max}$ (VERIFY AGAINST CODE).
- Table 7.2N / 7.3N: Maximum bar diameters and spacings for crack control without direct calculation (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: Pure Flexure to EC2
- $b = 300\text{ mm}, h = 500\text{ mm}, d = 450\text{ mm}, c = 30\text{ mm}, f_{ck} = 30\text{ MPa}, E_s = 200\text{ GPa}, E_{c,eff} = 10\text{ GPa} \implies \alpha_e = 20$.
- Steel: 3H25 ($A_s = 1473\text{ mm}^2$).
- Quasi-permanent moment $M_{qp} = 120\text{ kNm}$.
- *Hand working target:*
  - $\rho = 1473 / (300 \times 450) = 0.01091$.
  - $x = 197.8\text{ mm}$.
  - $I_{cr} = 1.782 \times 10^9\text{ mm}^4$.
  - $\sigma_s = 20 \times 120 \times 10^6 \times (450 - 197.8) / 1.782 \times 10^9 = 339.7\text{ MPa}$.
  - $h_{c,ef} = \min(2.5 \times 50, (500 - 197.8)/3, 250) = \min(125, 100.7, 250) = 100.7\text{ mm}$.
  - $A_{c,eff} = 300 \times 100.7 = 30,210\text{ mm}^2 \implies \rho_{p,eff} = 1473 / 30,210 = 0.04876$.
  - $f_{ct,eff} = 2.896\text{ MPa}$.
  - $(\epsilon_{sm} - \epsilon_{cm}) = 1.488 \times 10^{-3}$.
  - $s_{r,max} = 3.4 \times 30 + (0.8 \times 0.5 \times 0.425 \times 25) / 0.04876 = 102 + 87.16 = 189.16\text{ mm}$.
  - $w_k = 189.16 \times 1.488 \times 10^{-3} = 0.281\text{ mm} \le 0.30\text{ mm}$ (PASS).

### Test Case 2: Deep Beam / Wide Bar Spacing to BS 8110-2
- $b = 300\text{ mm}, h = 600\text{ mm}, d = 540\text{ mm}, c_{min} = 40\text{ mm}, 2\text{H25 bars, } M = 110\text{ kNm}$.
- Calculate $a_{cr}$ at corner and at centre between bars.
- Hand working verify $w \le 0.30\text{ mm}$.

---

## 6. Known Pitfalls
1. Long-term creep significantly increases effective modular ratio ($\alpha_e$ moves from $\sim 6$ to $\sim 18-22$), increasing cracked neutral axis depth and steel stress.
2. The lower bound limit $0.6 \sigma_s / E_s$ in Eq 7.9 frequently governs in lightly reinforced members.
3. UK National Annex uses modified $k_3, k_4$ values that differ from EN 1992-1-1 recommended defaults.

---

## 7. Questions for Review
- Should the tool provide an automated default creep coefficient $\phi(t_0, \infty) \approx 2.0$ based on relative humidity and cement class, or simple user override?
- Should we implement water-retaining CIRIA C766 / BS EN 1992-3 autogenous shrinkage cracking in a separate tool?
