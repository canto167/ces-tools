# RC Rectangular Beam Designer (`rc-beam`)

A high-precision structural design calculator for rectangular reinforced concrete beams under flexure, shear, and serviceability deflection limits, complying with **Eurocode 2 (EN 1992-1-1)** and **BS 8110-1:1997**.

---

## 1. Scope & Capabilities
- **Cross-Section**: Solid rectangular concrete beams ($b \times h$).
- **Flexural Design**: Singly and doubly reinforced section capacity with compression steel requirements ($A_s, A_{s2} / A_s'$).
- **Shear Design**: Vertical shear link/stirrup spacing and area ($A_{sw}/s$ or $A_{sv}/s_v$), maximum concrete strut crushing check ($V_{Rd,max}$ or $v_{max}$).
- **Serviceability (Deflection)**: Span-to-effective-depth ratio limits ($l/d$) including tension reinforcement, compression reinforcement, and long-span modification factors.
- **Detailing Checks**: Minimum and maximum longitudinal steel, minimum shear links, maximum link spacing, and clear horizontal bar spacing.
- **Exclusions**: Flanged sections (T/L beams - Phase 2), torsion, dynamic fatigue, axial load interaction.

---

## 2. Input Parameters
| Parameter | Symbol | Unit | Typical Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| Design Code | Code | — | EC2 / BS 8110 | Governing structural standard |
| Beam Width | $b$ | mm | 150 – 800 | Section breadth |
| Beam Depth | $h$ | mm | 250 – 1500 | Overall section depth |
| Clear Cover | $c$ | mm | 20 – 60 | Nominal cover to shear links |
| Characteristic Concrete Strength | $f_{ck} / f_{cu}$ | N/mm² | 25 – 50 | Cylinder strength (EC2) or cube strength (BS 8110) |
| Characteristic Rebar Yield Strength | $f_{yk} / f_y$ | N/mm² | 500 (460/250) | Main longitudinal reinforcement |
| Link Steel Yield Strength | $f_{ywk} / f_{yv}$ | N/mm² | 500 (250) | Shear reinforcement |
| Maximum Aggregate Size | $d_g$ | mm | 20 (10, 14, 20) | Coarse aggregate nominal size |
| Ultimate Design Bending Moment | $M_{Ed} / M$ | kNm | > 0 | Sagging or hogging design moment |
| Ultimate Design Shear Force | $V_{Ed} / V$ | kN | > 0 | Critical design shear force |
| Effective Span | $L$ | m | 1.0 – 25.0 | Centre-to-centre or clear span + bearing |
| Support Condition | — | — | Simply Supported / End Span / Interior / Cantilever | Structural framing continuity |
| Tension Bars | $n \times \phi$ | mm | Layer 1 & 2 | Number and diameter of tension bars |
| Compression Bars | $n' \times \phi'$ | mm | — | Top hanger/compression bars |
| Link Legs & Diameter | $n_{legs}, \phi_{link}$ | mm | 2, 4 legs; 8, 10, 12 mm | Shear links arrangement |

---

## 3. Governing Equations & Clauses

### A. Eurocode 2 (EN 1992-1-1:2004)
1. **Effective Depth**:
   $$d = h - c - \phi_{link} - \phi / 2 \quad \text{(single layer)}$$
   $$d_2 = c + \phi_{link} + \phi' / 2$$
2. **Flexure (Cl 6.1 & Annex 2)**:
   $$K = \frac{M_{Ed}}{b d^2 f_{ck}}, \quad K' = 0.167$$
   If $K \le K'$ (Singly Reinforced):
   $$z = d \left[0.5 + \sqrt{0.25 - \frac{K}{1.134}}\right] \le 0.95d$$
   $$A_{s,req} = \frac{M_{Ed}}{f_{yd} z}, \quad f_{yd} = \frac{f_{yk}}{\gamma_s} = \frac{f_{yk}}{1.15}$$
   If $K > K'$ (Doubly Reinforced):
   $$z = d \left[0.5 + \sqrt{0.25 - \frac{K'}{1.134}}\right] \le 0.95d$$
   $$A_{s2} = \frac{(K - K') f_{ck} b d^2}{f_{yd} (d - d_2)}$$
   $$A_{s1} = \frac{K' f_{ck} b d^2}{f_{yd} z} + A_{s2}$$
3. **Minimum & Maximum Steel (Cl 9.2.1.1)**:
   $$f_{ctm} = 0.30 f_{ck}^{2/3}$$
   $$A_{s,min} = \max\left(0.26 \frac{f_{ctm}}{f_{yk}} b d, \; 0.0013 b d\right), \quad A_{s,max} = 0.04 b h$$
4. **Shear (Cl 6.2.2 & 6.2.3)**:
   $$k = \min\left(1 + \sqrt{\frac{200}{d}}, \; 2.0\right), \quad \rho_l = \min\left(\frac{A_{s,prov}}{b d}, \; 0.02\right)$$
   $$V_{Rd,c} = \max\left(0.12 k (100 \rho_l f_{ck})^{1/3}, \; 0.035 k^{1.5} f_{ck}^{0.5}\right) b d \times 10^{-3} \text{ (kN)}$$
   $$\cot \theta = 2.5, \quad z = 0.9d, \quad \nu_1 = 0.6 \left(1 - \frac{f_{ck}}{250}\right), \quad f_{cd} = \frac{f_{ck}}{1.5}$$
   $$V_{Rd,max} = \frac{b z \nu_1 f_{cd}}{\cot \theta + \tan \theta} = \frac{b z \nu_1 f_{cd}}{2.5 + 0.4} \times 10^{-3} \text{ (kN)}$$
   $$\frac{A_{sw}}{s} = \frac{V_{Ed}}{z f_{ywd} \cot \theta}, \quad \left(\frac{A_{sw}}{s}\right)_{min} = 0.08 \frac{\sqrt{f_{ck}}}{f_{ywk}} b, \quad s \le 0.75d$$
5. **Deflection (Cl 7.4.2, Eq 7.16)**:
   $$\rho_0 = \sqrt{f_{ck}} \times 10^{-3}, \quad \rho = \frac{A_{s,req}}{b d}, \quad \rho' = \frac{A_{s2}}{b d}$$
   If $\rho \le \rho_0$:
   $$\left(\frac{l}{d}\right)_{basic} = K_s \left[11 + 1.5 \sqrt{f_{ck}} \frac{\rho_0}{\rho} + 3.2 \sqrt{f_{ck}} \left(\frac{\rho_0}{\rho} - 1\right)^{1.5}\right]$$
   If $\rho > \rho_0$:
   $$\left(\frac{l}{d}\right)_{basic} = K_s \left[11 + 1.5 \sqrt{f_{ck}} \frac{\rho_0}{\rho - \rho'} + \frac{1}{12} \sqrt{f_{ck}} \sqrt{\frac{\rho'}{\rho_0}}\right]$$
   $$K_s = 1.0 \text{ (Simply Supported)}, 1.3 \text{ (End Span)}, 1.5 \text{ (Interior Span)}, 0.4 \text{ (Cantilever)}$$
   $$\left(\frac{l}{d}\right)_{allowable} = \left(\frac{l}{d}\right)_{basic} \times \min\left(\frac{A_{s,prov}}{A_{s,req}}, \; 1.5\right) \times \left(\frac{7}{L} \text{ if } L > 7\text{m else } 1.0\right)$$
6. **Clear Bar Spacing (Cl 8.2)**:
   $$\text{gap} = \frac{(b - 2c - 2\phi_{link}) - n \phi}{n - 1} \ge \max(\phi, \; d_g + 5, \; 20\text{mm})$$

---

### B. BS 8110-1:1997
1. **Flexure (Cl 3.4.4.4)**:
   $$K = \frac{M}{b d^2 f_{cu}}, \quad K' = 0.156$$
   If $K \le K'$:
   $$z = d \left[0.5 + \sqrt{0.25 - \frac{K}{0.9}}\right] \le 0.95d, \quad A_s = \frac{M}{0.87 f_y z}$$
   If $K > K'$:
   $$z = 0.7769 d \le 0.95d$$
   $$A_s' = \frac{(K - K') f_{cu} b d^2}{0.87 f_y (d - d_2)}, \quad A_s = \frac{K' f_{cu} b d^2}{0.87 f_y z} + A_s'$$
2. **Shear (Cl 3.4.5)**:
   $$v = \frac{V \times 10^3}{b d} \le \min(0.8 \sqrt{f_{cu}}, \; 5\text{ N/mm}^2)$$
   $$v_c = \frac{0.79}{1.25} \left(\frac{100 A_{s,prov}}{b d}\right)^{1/3} \left(\frac{400}{d}\right)^{1/4} \left(\frac{f_{cu}}{25}\right)^{1/3}$$
   If $v < v_c + 0.4$:
   $$\frac{A_{sv}}{s_v} = \frac{0.4 b}{0.87 f_{yv}} \quad \text{(nominal links)}$$
   Else:
   $$\frac{A_{sv}}{s_v} = \frac{b (v - v_c)}{0.87 f_{yv}}, \quad s_v \le 0.75d$$
3. **Deflection (Cl 3.4.6)**:
   $$\text{Basic } l/d = 20 \text{ (SS)}, 26 \text{ (Continuous)}, 7 \text{ (Cantilever)}$$
   $$f_s = \frac{2 f_y A_{s,req}}{3 A_{s,prov}}$$
   $$MF_t = \min\left(2.0, \; 0.55 + \frac{477 - f_s}{120 (0.9 + M / (b d^2))}\right)$$
   $$p' = \frac{100 A_{s,prov}'}{b d}, \quad MF_c = \min\left(1.5, \; 1.0 + \frac{p'}{3 + p'}\right)$$
   $$\left(\frac{l}{d}\right)_{allowable} = \text{Basic} \times MF_t \times MF_c \times \left(\frac{10}{L} \text{ if } L > 10\text{m else } 1.0\right)$$
