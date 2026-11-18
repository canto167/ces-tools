# One-Way Slab Designer (`one-way-slab`)

A structural design tool for solid one-way reinforced concrete slabs (1 metre design strip) according to **Eurocode 2 (EN 1992-1-1)** and **BS 8110-1:1997**.

---

## 1. Scope & Capabilities
- **Design Unit**: 1 metre strip ($b = 1000\text{ mm}$).
- **Support Framing**:
  - Simply supported single span ($M = n L^2 / 8$, $V = n L / 2$).
  - Continuous spans using BS 8110 Table 3.12 simplified moment & shear coefficients:
    - End span: $0.086 F L$, Penultimate support: $-0.086 F L$, Interior span: $0.063 F L$, Interior support: $-0.063 F L$.
    - Shear: $0.4 F$ at outer support, $0.6 F$ at first interior support, $0.5 F$ at internal supports.
- **Design Verifications**:
  - Flexural reinforcement sizing and minimum secondary/distribution steel.
  - Concrete shear capacity without links ($v \le v_c$ in BS 8110, $V_{Ed} \le V_{Rd,c}$ in EC2).
  - Span-to-depth deflection check with tension modification factors.
  - Maximum bar spacing rules for main and distribution steel.

---

## 2. Input Parameters
- **Span $L$ (m)**: Centre-to-centre distance between supports.
- **Slab Thickness $h$ (mm)**: Total structural depth.
- **Nominal Cover $c$ (mm)**: Clear concrete cover to main bars.
- **Loads**: Finishes ($kN/m^2$), Imposed Variable load $q_k$ ($kN/m^2$). Concrete self-weight is computed automatically ($25\text{ kN/m}^3$ for EC2, $24\text{ kN/m}^3$ for BS 8110).
- **Material Strengths**: $f_{ck}$ (EC2) / $f_{cu}$ (BS 8110), steel yield strength $f_{yk} / f_y$.
- **Reinforcement Layout**: Main bar diameter & spacing (mm), Distribution bar diameter.

---

## 3. Governing Clauses
- **EC2 Flexure & Detailing**: Cl 6.1 (flexure), Cl 9.3.1.1 (minimum steel $A_{s,min} = \max(0.26 \frac{f_{ctm}}{f_{yk}} b d, 0.0013 b d)$), Cl 9.3.1.1(3) (max spacing $s_{max,slabs} = \min(3h, 400\text{ mm})$ for main, $\min(3.5h, 450\text{ mm})$ for secondary).
- **EC2 Shear**: Cl 6.2.2 ($V_{Rd,c} = \max[0.12 k (100 \rho_l f_{ck})^{1/3}, 0.035 k^{1.5} f_{ck}^{0.5}] b d$).
- **EC2 Deflection**: Cl 7.4.2 Eq. 7.16 ($K_s = 1.0$ simply supported, $1.3$ end span, $1.5$ interior span).
- **BS 8110 Flexure & Detailing**: Cl 3.4.4.4, Cl 3.12.5.3 ($A_{s,min} = 0.13\% b h$), Cl 3.12.11.2.7 ($s \le \min(3d, 750\text{ mm})$).
- **BS 8110 Shear**: Cl 3.5.5 ($v = V / b d \le v_c$, where $(400/d)^{1/4} \ge 1.0$ for slabs).
- **BS 8110 Deflection**: Cl 3.4.6 (Basic $l/d = 20$ simply supported, $26$ continuous; modification factor $MF_t$).
