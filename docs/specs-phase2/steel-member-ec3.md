# Specification: Steel Member Design Checks to Eurocode 3 (EN 1993-1-1)

> **UNVERIFIED — engineer review required**

## 1. Scope
Cross-section classification and design resistance checks for structural steel I/H sections (UB, UC, HEA, HEB, IPE) subjected to tension, compression, bending, and shear according to **Eurocode 3 (EN 1993-1-1:2005)**.

> **LEGAL NOTICE ON SECTION PROPERTY DATA:**
> Section database tables must NOT be scraped from proprietary paid software or copyright-protected paywalled handbooks. Standard geometric dimensions (depth $h$, width $b$, web thickness $t_w$, flange thickness $t_f$, root radius $r$) must be sourced directly from open public standards (BS EN 10365:2017 / EN 10034) or derived mathematically from first-principle CAD geometry equations ($A, I_y, I_z, W_{el}, W_{pl}, I_t, I_w$).

---

## 2. Inputs
- Section properties: $h, b, t_w, t_f, r, A, I_y, I_z, W_{el,y}, W_{pl,y}, W_{el,z}, W_{pl,z}, I_t, I_w$.
- Steel grade: S235, S275, S355, S460 ($f_y$ and $f_u$ based on element thickness $t \le 16\text{ mm}$ or $16 < t \le 40\text{ mm}$).
- Internal actions: $N_{Ed}$ (tension or compression), $M_{y,Ed}, M_{z,Ed}, V_{z,Ed}$.
- Effective lengths for member buckling: $L_{cr,y}, L_{cr,z}, L_{cr,LT}$ (lateral torsional buckling length).

---

## 3. Governing Equations

### 3.1 Cross-Section Classification (EN 1993-1-1 Table 5.2)
$$\epsilon = \sqrt{\frac{235}{f_y}}$$
- **Flange outstand in compression ($c / t_f$):**
  - Class 1: $c/t_f \le 9 \epsilon$
  - Class 2: $c/t_f \le 10 \epsilon$
  - Class 3: $c/t_f \le 14 \epsilon$
- **Web in bending ($c / t_w$):**
  - Class 1: $c/t_w \le 72 \epsilon$
  - Class 2: $c/t_w \le 83 \epsilon$
  - Class 3: $c/t_w \le 124 \epsilon$

### 3.2 Tension Resistance (Cl 6.2.3)
$$N_{t,Rd} = N_{pl,Rd} = \frac{A \cdot f_y}{\gamma_{M0}} \quad (\gamma_{M0} = 1.0)$$

### 3.3 Compression Resistance (Cl 6.2.4 & Cl 6.3.1.1)
Cross-section resistance: $N_{c,Rd} = \frac{A f_y}{\gamma_{M0}}$.
Buckling resistance (flexural buckling):
$$N_{b,Rd} = \frac{\chi A f_y}{\gamma_{M1}} \quad (\gamma_{M1} = 1.0)$$
$$\chi = \frac{1}{\Phi + \sqrt{\Phi^2 - \bar{\lambda}^2}} \le 1.0$$
$$\Phi = 0.5 [1 + \alpha(\bar{\lambda} - 0.2) + \bar{\lambda}^2]$$
$$\bar{\lambda} = \sqrt{\frac{A f_y}{N_{cr}}} = \frac{L_{cr}}{i} \frac{1}{\lambda_1}, \quad \lambda_1 = 93.9 \epsilon$$
Imperfection factor $\alpha$ selected from buckling curves $a_0, a, b, c, d$ (Table 6.2).

### 3.4 Bending Resistance (Cl 6.2.5 & Cl 6.3.2)
$$M_{c,Rd} = \frac{W_{pl} f_y}{\gamma_{M0}} \quad (\text{Class 1 or 2})$$
$$M_{b,Rd} = \frac{\chi_{LT} W_{pl,y} f_y}{\gamma_{M1}} \quad (\text{Lateral Torsional Buckling})$$

### 3.5 Shear Resistance (Cl 6.2.6)
$$V_{pl,Rd} = \frac{A_v (f_y / \sqrt{3})}{\gamma_{M0}}$$
where $A_v \approx A - 2 b t_f + (t_w + 2 r) t_f$ for rolled I/H sections.

---

## 4. Tables Needed
- Table 5.2: Maximum width-to-thickness ratios for compression parts (VERIFY AGAINST CODE).
- Table 6.1: Imperfection factors for buckling curves (VERIFY AGAINST CODE).
- Table 6.2: Selection of buckling curve for cross-sections (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: UB 406x178x60 in S355
- $h = 406.4\text{ mm}, b = 177.9\text{ mm}, t_w = 7.9\text{ mm}, t_f = 12.8\text{ mm}, r = 10.2\text{ mm}, A = 76.5\text{ cm}^2, W_{pl,y} = 1199\text{ cm}^3$.
- Steel grade S355 ($t_f \le 16\text{ mm} \implies f_y = 355\text{ MPa}$).
- $\epsilon = \sqrt{235 / 355} = 0.8136$.
- Flange $c/t_f = 5.86 \le 9\epsilon = 7.32 \implies$ Class 1.
- Web $c/t_w = 45.6 \le 72\epsilon = 58.58 \implies$ Class 1.
- Bending resistance $M_{c,Rd} = 1199 \times 10^3 \times 355 \times 10^{-6} = 425.6\text{ kNm}$.
- Shear resistance $V_{pl,Rd} = 373.2\text{ kN}$.

### Test Case 2: UC 203x203x52 Column Buckling
- UC section, height $4.0\text{ m}$ pinned-pinned ($L_{cr} = 4.0\text{ m}$).
- Calculate $N_{b,Rd}$ about major and minor axes.

---

## 6. Known Pitfalls
1. Shear-moment interaction (Cl 6.2.8): when design shear $V_{Ed} > 0.5 V_{pl,Rd}$, reduced moment capacity $M_{y,V,Rd}$ must be computed using reduced yield strength $(1 - \rho) f_y$.
2. For Class 4 slender sections, effective cross-section area $A_{eff}$ with plate buckling deductions (EN 1993-1-5) must be determined.

---

## 7. Questions for Review
- Should we provide standard rolled open-source section lists (BS EN 10365) via an embedded JSON catalog?
