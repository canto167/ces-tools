# C10 — Cantilever Retaining Wall Designer (Stability & BS 8110 Stem)

## 1. Scope and Limitations
This calculator performs the global stability analysis (overturning, sliding, eccentricity, soil bearing) and stem structural design for reinforced concrete inverted-T cantilever retaining walls.

### Included Features:
- Rankine active earth pressure for level backfill with surcharge $q$.
- Geometry: stem height ($h_{stem}$), stem thickness ($t_{stem}$), base slab thickness ($t_{base}$), toe projection ($b_{toe}$), and heel projection ($b_{heel}$). Total base width $B = b_{toe} + t_{stem} + b_{heel}$. Total retaining height $H = h_{stem} + t_{base}$.
- Overall stability checks using traditional factors of safety:
  - Overturning: $FoS_{OT} = M_r / M_o \ge 2.0$
  - Sliding: $FoS_{slide} = (\mu \Sigma V) / P_H \ge 1.5$ (passive resistance at toe ignored)
  - Resultant eccentricity: $e \le B/6$ (middle third, no base tension)
  - Maximum base pressure: $p_{max} \le q_{all}$ (allowable bearing capacity)
  - Minimum base pressure: $p_{min} \ge 0$
  - *Note on surcharge:* Surcharge on heel is excluded from overturning and sliding resistance (conservative practice), but included in total vertical load for bearing pressure calculations.
- Stem flexural and shear design to **BS 8110-1:1997**:
  - ULS design moment $M_u = 1.4 M_{a,stem} + 1.6 M_{q,stem}$ at the base of the stem.
  - ULS design shear $V_u = 1.4 P_{a,stem} + 1.6 P_{q,stem}$.
  - Flexural tension steel $A_{s,req}$ and selected bar spacing for 1 m wide vertical strip.
  - Concrete shear stress $v \le v_c$ (without shear links).
- Scaled SVG cross-section diagram showing backfill, surcharge arrows, active thrust vectors at their resultant heights, and trapezoidal base bearing pressure distribution.

### Excluded / Limitations:
- Sloping backfill or seismic active earth pressure (Mononobe-Okabe).
- Base key design (passive resistance on base key).
- Heel and toe slab structural bending design (covered in Phase 2).
- Eurocode 7 Design Approaches DA1-1 / DA1-2 partial factors (covered in Phase 2).

---

## 2. Governing Equations

### 2.1 Active Earth Pressure (Rankine)
$$K_a = \frac{1 - \sin\phi'}{1 + \sin\phi'}$$
$$H = h_{stem} + t_{base}$$
$$P_a = \frac{1}{2} K_a \gamma H^2 \quad \text{at height } \frac{H}{3}$$
$$P_q = K_a q H \quad \text{at height } \frac{H}{2}$$
$$M_o = P_a \frac{H}{3} + P_q \frac{H}{2}$$

### 2.2 Restoring Moments about Toe Tip ($x = 0$)
- Stem: $W_{stem} = t_{stem} h_{stem} \gamma_c, \quad x = b_{toe} + t_{stem}/2$
- Base: $W_{base} = B t_{base} \gamma_c, \quad x = B/2$
- Soil on heel: $W_{soil} = b_{heel} h_{stem} \gamma, \quad x = b_{toe} + t_{stem} + b_{heel}/2$
$$W_{tot} = W_{stem} + W_{base} + W_{soil}$$
$$M_r = W_{stem} x_{stem} + W_{base} x_{base} + W_{soil} x_{soil}$$

### 2.3 Factors of Safety & Base Pressures
$$FoS_{OT} = \frac{M_r}{M_o} \ge 2.0$$
$$FoS_{slide} = \frac{\mu W_{tot}}{P_a + P_q} \ge 1.5$$

For bearing (including surcharge $W_{sur} = q \cdot b_{heel}$):
$$\Sigma V = W_{tot} + W_{sur}$$
$$M_{net} = (M_r + W_{sur} x_{soil}) - M_o$$
$$\bar{x} = \frac{M_{net}}{\Sigma V}, \quad e = \frac{B}{2} - \bar{x}$$
$$p = \frac{\Sigma V}{B} \left(1 \pm \frac{6 e}{B}\right)$$

### 2.4 Stem Design at Stem Base (BS 8110-1:1997)
$$M_u = 1.4 \left(\frac{1}{6} K_a \gamma h_{stem}^3\right) + 1.6 \left(\frac{1}{2} K_a q h_{stem}^2\right)$$
$$V_u = 1.4 \left(\frac{1}{2} K_a \gamma h_{stem}^2\right) + 1.6 \left(K_a q h_{stem}\right)$$
$$d = t_{stem} - c - \frac{\phi}{2}$$
$$K = \frac{M_u}{b d^2 f_{cu}}, \quad z = d \left[0.5 + \sqrt{0.25 - \frac{K}{0.9}}\right] \le 0.95d$$
$$A_{s,req} = \frac{M_u}{0.87 f_y z}$$
$$v = \frac{V_u}{b d} \le v_c$$

---

## 3. Verified Acceptance Test Cases

### Test Case A (Passes all checks)
- Stem $4.0\text{ m}, t_{stem} = 0.3\text{ m}, t_{base} = 0.4\text{ m}, b_{toe} = 0.8\text{ m}, b_{heel} = 2.4\text{ m}$ ($B = 3.5\text{ m}$).
- Soil $\gamma = 18\text{ kN/m}^3, \phi' = 30^\circ, q = 10\text{ kPa}, \mu = 0.5, \gamma_c = 24\text{ kN/m}^3, q_{all} = 150\text{ kPa}$.
- Concrete $f_{cu} = 30\text{ MPa}$, cover $40\text{ mm}$, bar $\phi 16$ @ 150 mm.
- **Results:**
  - $K_a = 0.3333$
  - $P_a = 58.08\text{ kN/m}, P_q = 14.67\text{ kN/m}, M_o = 117.45\text{ kNm/m}$
  - $W_{stem} = 28.8, W_{base} = 33.6, W_{soil} = 172.8 \implies W_{tot} = 235.2\text{ kN/m}$
  - $M_r = 483.6\text{ kNm/m}$
  - $FoS_{OT} = 4.12 \ge 2.0$ (PASS)
  - $FoS_{slide} = 1.62 \ge 1.5$ (PASS)
  - $\Sigma V = 259.2\text{ kN/m}, e = 0.124\text{ m} \le B/6 = 0.583\text{ m}$
  - $p_{max} = 89.9\text{ kPa} \le 150\text{ kPa}, p_{min} = 58.3\text{ kPa} > 0$
  - Stem $M_u = 132.3\text{ kNm/m}, d = 252\text{ mm}, A_{s,req} = 1317.6\text{ mm}^2/\text{m}$
  - H16 @ 150 provides $1340.4\text{ mm}^2/\text{m}$ (PASS)
  - $V_u = 88.5\text{ kN/m}, v = 0.351\text{ MPa} \le v_c = 0.611\text{ MPa}$ (PASS).

### Test Case B (Fails sliding check)
- Same parameters except $b_{heel} = 1.9\text{ m}$ ($B = 3.0\text{ m}$).
- **Results:**
  - $W_{tot} = 194.4\text{ kN/m}, M_r = 351.0\text{ kNm/m}$
  - $FoS_{OT} = 2.99 \ge 2.0$ (PASS)
  - $FoS_{slide} = 1.34 < 1.5$ (FAIL — insufficient sliding resistance).
