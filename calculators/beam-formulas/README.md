# C8 — Beam Formulas, SFD, BMD and Deflection Calculator

## 1. Scope and Limitations
This calculator computes reactions, shear force diagrams (SFD), bending moment diagrams (BMD), and elastic deflection profiles for beams subjected to any combination of point loads and uniform distributed loads (UDL).

### Included Support Conditions:
1. **Simply Supported (SS):** Pinned at $x = 0$, roller at $x = L$.
2. **Cantilever:** Fixed at $x = 0$, free at $x = L$.
3. **Fixed–Fixed:** Clamped at both ends ($x = 0$ and $x = L$).
4. **Propped Cantilever:** Clamped at $x = 0$, roller prop at $x = L$.

### Included Loading Types:
- Point loads: magnitude $P$ at location $a$ from left support.
- Uniformly distributed loads (UDL): full span or partial span ($w$ from $x_1$ to $x_2$).
- Multiple loads combined rigorously by linear elastic superposition.

### Outputs:
- End reactions ($R_A, R_B, M_A, M_B$).
- Shear force diagram $V(x)$ with key points and zero-crossings.
- Bending moment diagram $M(x)$ with maximum hogging and sagging moments.
- Deflection profile $\delta(x)$ with maximum deflection magnitude and location.
- Interactive SVG graphics with hover tooltips and dimension lines.

---

## 2. Governing Equations & Calculation Method
Linear elastic beam theory ($EI \frac{d^4 w}{dx^4} = q(x)$) under Euler-Bernoulli assumptions.
$EI = E \cdot I$ where:
- $E$ = modulus of elasticity ($200,000\text{ MPa} = 200\text{ kN/mm}^2 = 200 \times 10^6\text{ kN/m}^2$ default for structural steel; presets available for concrete).
- $I$ = second moment of area ($1.0 \times 10^8\text{ mm}^4 = 1.0 \times 10^{-4}\text{ m}^4$).

### 2.1 Simply Supported (SS)
- **UDL $w$ on full span:**
  $$R_A = R_B = \frac{w L}{2}$$
  $$V(x) = R_A - w x$$
  $$M(x) = \frac{w x}{2}(L - x), \quad M_{max} = \frac{w L^2}{8} \text{ at } x = \frac{L}{2}$$
  $$\delta(x) = \frac{w x}{24 E I}(L^3 - 2 L x^2 + x^3), \quad \delta_{max} = \frac{5 w L^4}{384 E I} \text{ at } x = \frac{L}{2}$$

- **Point load $P$ at $a$ ($b = L - a$):**
  $$R_A = \frac{P b}{L}, \quad R_B = \frac{P a}{L}$$
  $$M_{max} = \frac{P a b}{L} \text{ at } x = a$$
  $$\delta(x \le a) = \frac{P b x}{6 L E I}(L^2 - b^2 - x^2)$$
  $$\text{For } a = L/2: \quad \delta_{mid} = \frac{P L^3}{48 E I}$$

### 2.2 Cantilever (Fixed at $x = 0$)
- **UDL $w$ on full span:**
  $$R_A = w L, \quad M_A = -\frac{w L^2}{2}$$
  $$\delta_{tip} = \frac{w L^4}{8 E I}$$
- **Point load $P$ at tip ($x = L$):**
  $$R_A = P, \quad M_A = -P L$$
  $$\delta_{tip} = \frac{P L^3}{3 E I}$$

### 2.3 Fixed–Fixed
- **UDL $w$ on full span:**
  $$R_A = R_B = \frac{w L}{2}$$
  $$M_A = M_B = -\frac{w L^2}{12}, \quad M_{mid} = +\frac{w L^2}{24}$$
  $$\delta_{mid} = \frac{w L^4}{384 E I}$$

### 2.4 Propped Cantilever (Fixed at A, Prop at B)
- **UDL $w$ on full span:**
  $$R_B = \frac{3}{8} w L, \quad R_A = \frac{5}{8} w L$$
  $$M_A = -\frac{1}{8} w L^2$$
  $$x_{\text{zero shear}} = \frac{5}{8} L = 0.625 L \text{ from } A$$
  $$M_{sag,max} = \frac{9}{128} w L^2 \text{ at } x = \frac{5}{8} L$$
  $$\delta_{max} \approx \frac{w L^4}{185 E I} \text{ at } x \approx 0.4215 L$$

---

## 3. Verified Acceptance Test Cases

All evaluated with $E = 200,000\text{ MPa}$ and $I = 1.0 \times 10^8\text{ mm}^4$ ($EI = 20,000\text{ kNm}^2$):
1. **SS, $L = 6\text{ m}$, UDL $10\text{ kN/m}$:**
   - $R_A = 30\text{ kN}, R_B = 30\text{ kN}$
   - $M_{max} = 45.0\text{ kNm}$ at $x = 3.0\text{ m}$
   - $\delta_{max} = 8.4375\text{ mm}$
2. **SS, $L = 6\text{ m}$, $P = 40\text{ kN}$ at $a = 2\text{ m}$:**
   - $R_A = 26.667\text{ kN}, R_B = 13.333\text{ kN}$
   - $M_{max} = 53.333\text{ kNm}$ at $x = 2.0\text{ m}$
   - For central $P = 40\text{ kN}$ at $a = 3\text{ m}$: $\delta_{mid} = 9.000\text{ mm}$
3. **SS, $L = 8\text{ m}$, UDL $5\text{ kN/m}$ + $P = 20\text{ kN}$ at $a = 3\text{ m}$:**
   - $R_A = 32.5\text{ kN}, R_B = 27.5\text{ kN}$
   - $M_{max} = 75.0\text{ kNm}$ at $x = 3.0\text{ m}$
   - $M(4\text{ m}) = 70.0\text{ kNm}$
4. **Cantilever, $L = 3\text{ m}$, UDL $8\text{ kN/m}$ + tip $P = 10\text{ kN}$:**
   - Reaction $V = 34.0\text{ kN}, M = -66.0\text{ kNm}$
   - For UDL only: $\delta_{tip} = 4.05\text{ mm}$
5. **Fixed–Fixed, $L = 6\text{ m}$, UDL $10\text{ kN/m}$:**
   - Support moment $M_A = M_B = -30.0\text{ kNm}$
   - Midspan moment $M_{mid} = +15.0\text{ kNm}$
   - $\delta_{mid} = 1.6875\text{ mm}$
6. **Propped Cantilever, $L = 6\text{ m}$, UDL $10\text{ kN/m}$:**
   - $R_B = 22.5\text{ kN}, R_A = 37.5\text{ kN}$
   - $M_A = -45.0\text{ kNm}$
   - $M_{sag,max} = 25.3125\text{ kNm}$ at $x = 3.75\text{ m}$
   - $\delta_{max} \approx 3.51\text{ mm}$ (within 1%)
