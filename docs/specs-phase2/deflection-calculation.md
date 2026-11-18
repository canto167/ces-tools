# Specification: Deflection by Direct Calculation (Eurocode 2 Cl 7.4.3 & BS 8110-2 Cl 3.7)

> **UNVERIFIED — engineer review required**

## 1. Scope
Rigorous calculation of elastic, creep, and shrinkage deflections for reinforced concrete flexural members (beams and slabs) taking into account tension stiffening and crack formation, in accordance with **Eurocode 2 (EN 1992-1-1:2004) Clause 7.4.3** and **BS 8110-2:1985 Clause 3.7**.

---

## 2. Inputs
- Section geometry: $b, h, d, c$, flanged dimensions $b_{eff}, h_f$ if applicable.
- Reinforcement: tension steel $A_s$, compression steel $A_s'$.
- Material properties: concrete grade $f_{ck}$, tensile strength $f_{ctm} = 0.30 f_{ck}^{2/3}$, secant modulus $E_{cm}$.
- Loading conditions:
  - Cracking load combination (rare / characteristic $G_k + Q_k$).
  - Quasi-permanent combination ($G_k + \psi_2 Q_k$).
- Environmental & time factors:
  - Age at first loading $t_0$ (days).
  - Ambient relative humidity $RH$ (%).
  - Final creep coefficient $\phi(\infty, t_0)$.
  - Free shrinkage strain $\epsilon_{cs} = \epsilon_{cd} + \epsilon_{ca}$.

---

## 3. Governing Equations (Eurocode 2 Cl 7.4.3)

### 3.1 Interpolation between Uncracked and Fully Cracked State
For any deformation parameter $\alpha$ (curvature $1/r$ or deflection $a$):
$$\alpha = \zeta \alpha_{II} + (1 - \zeta) \alpha_{I}$$
where:
- $\alpha_I$ = parameter evaluated for uncracked state (State I).
- $\alpha_{II}$ = parameter evaluated for fully cracked state (State II).
- $\zeta$ = distribution / tension stiffening coefficient:
  $$\zeta = 1 - \beta \left(\frac{\sigma_{sr}}{\sigma_s}\right)^2 = 1 - \beta \left(\frac{M_{cr}}{M}\right)^2$$
  - $\beta = 1.0$ for single short-term loading.
  - $\beta = 0.5$ for sustained or repeated cyclic loading.
  - If $M \le M_{cr}$: $\zeta = 0$ (uncracked).

### 3.2 Cracking Moment $M_{cr}$
$$M_{cr} = \frac{f_{ctm} \cdot I_I}{h - x_I}$$
where $I_I$ is the gross uncracked second moment of area, and $x_I$ is uncracked neutral axis depth.

### 3.3 State I (Uncracked) Section Properties
Modular ratio: $\alpha_e = E_s / E_{c,eff}$ where $E_{c,eff} = E_{cm} / (1 + \phi)$.
$$A_I = b h + (\alpha_e - 1) A_s + (\alpha_e - 1) A_s'$$
$$x_I = \frac{b h (h/2) + (\alpha_e - 1) A_s d + (\alpha_e - 1) A_s' d'}{A_I}$$
$$I_I = \frac{b h^3}{12} + b h (x_I - h/2)^2 + (\alpha_e - 1) A_s (d - x_I)^2 + (\alpha_e - 1) A_s' (x_I - d')^2$$

### 3.4 State II (Fully Cracked) Section Properties
$$x_{II} = d \left[-\alpha_e \rho + \sqrt{(\alpha_e \rho)^2 + 2 \alpha_e \rho}\right]$$
$$I_{II} = \frac{b x_{II}^3}{3} + \alpha_e A_s (d - x_{II})^2 + (\alpha_e - 1) A_s' (x_{II} - d')^2$$

### 3.5 Shrinkage Curvature $(1/r)_{cs}$ (Cl 7.4.3 Eq 7.21)
$$\left(\frac{1}{r}\right)_{cs} = \epsilon_{cs} \alpha_e \frac{S}{I}$$
where $S$ is the first moment of area of reinforcement about the centroidal axis of the section, and $I$ is the second moment of area ($I_I$ or $I_{II}$).

### 3.6 Total Deflection
$$a_{total} = a_{load} + a_{shrinkage}$$
For a simply supported beam under UDL:
$$a_{load} = k_{load} \left(\frac{1}{r}\right) L^2, \quad k_{load} = \frac{5}{48}$$
$$a_{shrinkage} = k_{cs} \left(\frac{1}{r}\right)_{cs} L^2, \quad k_{cs} = \frac{1}{8}$$

---

## 4. Tables Needed
- Table 3.1: Elastic modulus $E_{cm}$ and tensile strength $f_{ctm}$ (VERIFY AGAINST CODE).
- Annex B: Mathematical expressions for creep coefficient $\phi(t, t_0)$ and drying shrinkage strain $\epsilon_{cd}$ (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: Simply Supported Beam Long-Term Deflection
- Span $L = 6.0\text{ m}, b = 300\text{ mm}, h = 500\text{ mm}, d = 450\text{ mm}, A_s = 1473\text{ mm}^2$ (3H25), $A_s' = 402\text{ mm}^2$ (2H16).
- C30/37 concrete ($f_{ck} = 30\text{ MPa}, E_{cm} = 33\text{ GPa}, f_{ctm} = 2.9\text{ MPa}$).
- Loading: $g_k = 18\text{ kN/m}$ (including self-weight), $q_k = 10\text{ kN/m}, \psi_2 = 0.3$.
- $w_{qp} = 18 + 0.3(10) = 21\text{ kN/m} \implies M_{qp} = 21 \times 36 / 8 = 94.5\text{ kNm}$.
- Creep $\phi = 2.2 \implies E_{c,eff} = 33 / (1 + 2.2) = 10.31\text{ GPa} \implies \alpha_e = 19.4$.
- Shrinkage $\epsilon_{cs} = 3.5 \times 10^{-4}$.
- Calculate uncracked curvature $(1/r)_I$, cracked curvature $(1/r)_{II}$, $\zeta$, and combined long-term deflection $a_{total}$. Verify $a_{total} \le L / 250 = 24.0\text{ mm}$.

### Test Case 2: Uncracked Lightly Loaded Slab
- Slab under low service moment where $M_{qp} < M_{cr} \implies \zeta = 0$ (entirely State I).

---

## 6. Known Pitfalls
1. Failing to account for early construction loading: if the beam cracks during construction, $\zeta$ cannot be zero even if service loads are lower than $M_{cr}$.
2. Shrinkage warpage is often responsible for $30\% - 50\%$ of long-term deflection in thin slabs.

---

## 7. Questions for Review
- Should we provide standard humidity presets ($50\%$ UK/Europe, $75\%$ Malaysia/Singapore tropical)?
