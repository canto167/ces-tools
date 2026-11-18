# C7 — Anchorage and Lap Length Calculator (Eurocode 2 & BS 8110)

## 1. Scope and Limitations
This calculator computes the required tension and compression anchorage lengths and lap lengths for reinforcing steel bars in accordance with:
- **Eurocode 2 (EN 1992-1-1:2004) Clauses 8.4 and 8.7**
- **BS 8110-1:1997 Clause 3.12.8**

### Included:
- Standard bar diameters: $\phi 6$ to $\phi 40\text{ mm}$.
- Eurocode 2:
  - Ultimate design bond stress $f_{bd}$ accounting for bond conditions ($\eta_1 = 1.0$ good, $0.7$ poor) and bar size ($\eta_2$).
  - Basic required anchorage length $l_{b,rqd}$.
  - Design anchorage length $l_{bd} = \alpha_1 \alpha_2 \alpha_3 \alpha_4 \alpha_5 l_{b,rqd}$ with $(\alpha_2 \alpha_3 \alpha_5 \ge 0.7)$.
  - Minimum anchorage length $l_{b,min}$.
  - Lap length $l_0 = \alpha_6 l_{bd}$ with $\alpha_6 = \sqrt{\rho_1/25}$ ($1.0 \le \alpha_6 \le 1.5$) based on percentage of lapped bars $\rho_1$.
  - Minimum lap length $l_{0,min}$.
  - Output in both millimeters ($\text{mm}$) and diameter multiples ($\times \phi$).
- BS 8110:
  - Design ultimate anchorage bond stress $f_{bu} = \beta \sqrt{f_{cu}}$ ($\beta = 0.50$ deformed type 2 tension, $0.63$ compression).
  - Tension and compression anchorage length $l = f_s \phi / (4 f_{bu})$.
  - Lap lengths: normal ($1.0 \times$), top-cast / minimum cover or clearance ($1.4 \times$), and combined top-cast + minimum clearance ($2.0 \times$).
  - Minimum lap $\max(15\phi, 300\text{ mm})$.
- Side-by-side comparison table between EC2 and BS 8110 for identical bar and concrete grades.

### Excluded / Limitations:
- Bundled bars ($> 3$ bars in a bundle).
- Welded mesh / fabric reinforcement (specific lap rules in EC2 8.7.4).
- Mechanical couplers and anchor plates (proprietary manufacturer design).

---

## 2. Governing Equations and Code Clauses

### 2.1 Eurocode 2 (EN 1992-1-1:2004)
1. **Tensile Concrete Strength (Table 3.1):**
   $$f_{ctm} = 0.30 f_{ck}^{2/3} \quad (\text{for } f_{ck} \le 50\text{ MPa})$$
   $$f_{ctk,0.05} = 0.70 f_{ctm}$$
   $$f_{ctd} = \alpha_{ct} \frac{f_{ctk,0.05}}{\gamma_c} \quad (\alpha_{ct} = 1.0, \gamma_c = 1.5)$$

2. **Ultimate Bond Stress (Cl 8.4.2):**
   $$f_{bd} = 2.25 \eta_1 \eta_2 f_{ctd}$$
   where $\eta_1 = 1.0$ for good bond, $0.7$ for poor bond; $\eta_2 = 1.0$ for $\phi \le 32\text{ mm}$, or $(132 - \phi)/100$ for $\phi > 32\text{ mm}$.

3. **Basic Required Anchorage Length (Cl 8.4.3):**
   $$l_{b,rqd} = \left(\frac{\phi}{4}\right) \left(\frac{\sigma_{sd}}{f_{bd}}\right)$$
   where $\sigma_{sd} = f_{yd} = f_{yk} / 1.15$ for full design yield stress.

4. **Design Anchorage Length (Cl 8.4.4):**
   $$l_{bd} = \alpha_1 \alpha_2 \alpha_3 \alpha_4 \alpha_5 l_{b,rqd} \ge l_{b,min}$$
   $$l_{b,min} = \max(0.3 l_{b,rqd}, 10\phi, 100\text{ mm})$$

5. **Design Lap Length (Cl 8.7.3):**
   $$l_0 = \alpha_6 l_{bd} \ge l_{0,min}$$
   $$\alpha_6 = \sqrt{\frac{\rho_1}{25}}, \quad 1.0 \le \alpha_6 \le 1.5$$
   $$l_{0,min} = \max(0.3 \alpha_6 l_{b,rqd}, 15\phi, 200\text{ mm})$$

### 2.2 BS 8110-1:1997 Clause 3.12.8
1. **Design Bond Stress:**
   $$f_{bu} = \beta \sqrt{f_{cu}}$$
   where $\beta = 0.50$ (Type 2 deformed bars in tension) or $0.63$ (Type 2 bars in compression). Note: $f_{cu} \le 40\text{ MPa}$ limit in BS 8110-1:1997 Cl 3.12.8.4 for bond calculations.

2. **Anchorage Length:**
   $$l = \frac{f_s \phi}{4 f_{bu}}$$
   where $f_s = 0.87 f_y$.

3. **Lap Lengths:**
   - Standard tension lap: $1.0 \times l \ge \max(15\phi, 300\text{ mm})$.
   - Top-cast bars or cover $< 2\phi$ / clear spacing $< 75\text{ mm}$: $1.4 \times l$.
   - Both top-cast AND minimum clearance: $2.0 \times l$.

---

## 3. Verified Acceptance Test Cases

### Test Case EC2-1
- $\phi = 16\text{ mm}$, Concrete C30/37 ($f_{ck} = 30\text{ MPa}$), Good bond ($\eta_1 = 1.0$), $\sigma_{sd} = f_{yd} = 434.78\text{ MPa}$, $\alpha_1 \dots \alpha_5 = 1.0, \alpha_6 = 1.5$.
- Results:
  - $f_{ctm} = 2.896\text{ MPa}$
  - $f_{ctk,0.05} = 2.028\text{ MPa}$
  - $f_{ctd} = 1.352\text{ MPa}$
  - $f_{bd} = 3.041\text{ MPa}$
  - $l_{b,rqd} = 572.1\text{ mm} \quad (35.8\phi)$
  - $l_{b,min} = 171.6\text{ mm}$
  - $l_0 = 858.2\text{ mm}$
  - $l_{0,min} = 257.5\text{ mm}$
  - Poor bond ($\eta_1 = 0.7$): $l_{b,rqd} = 817.3\text{ mm} \quad (51.1\phi)$.

### Test Case BS-1
- $\phi = 16\text{ mm}$, Concrete Grade $30$ ($f_{cu} = 30\text{ MPa}$), Steel $f_y = 500\text{ MPa}$, Type 2 Deformed Tension.
- Results:
  - $f_{bu} = 2.739\text{ MPa}$
  - Anchorage length $l = 635.4\text{ mm} \quad (39.7\phi)$
  - Lap length ($\times 1.4$) = $889.5\text{ mm} \quad (55.6\phi)$
  - Lap length ($\times 2.0$) = $1270.7\text{ mm} \quad (79.4\phi)$
  - Minimum lap = $300\text{ mm}$.
