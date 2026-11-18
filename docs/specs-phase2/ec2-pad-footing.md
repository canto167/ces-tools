# Specification: Isolated Pad Footing to Eurocode 2 with Biaxial Moments

> **UNVERIFIED — engineer review required**

## 1. Scope
Design of isolated rectangular reinforced concrete pad foundations supporting columns subjected to axial compression ($N_{Ed}$) and overturning moments ($M_{Ed,x}, M_{Ed,y}$) in accordance with:
- Eurocode 7 (EN 1997-1:2004) Geotechnical bearing capacity and eccentricity limits.
- Eurocode 2 (EN 1992-1-1:2004) Structural flexure, beam shear ($V_{Rd,c}$), and 2d punching shear.

---

## 2. Inputs
- Column dimensions: $c_1 \times c_2$ (or diameter $D$).
- Footing geometry: length $L_x$, width $L_y$, thickness $h$.
- Applied loads (SLS & ULS combinations):
  - Axial load: $N_{k}$ (service), $N_{Ed}$ (ultimate).
  - Bending moments: $M_{x}, M_{y}$ at column base.
  - Horizontal shear: $H_x, H_y$.
- Geotechnical parameters: allowable soil bearing pressure $q_{all}$ (or drained cohesion $c'$, friction $\phi'$, groundwater depth).
- Materials: concrete grade $f_{ck}$, steel yield $f_{yk}$, cover $c_{nom}$.

---

## 3. Governing Equations

### 3.1 Soil Contact Pressure & Meyerhof Effective Area (EC7 Cl 6.5.2)
Eccentricities of resultant:
$$e_x = \frac{M_{y,base}}{N_{total}}, \quad e_y = \frac{M_{x,base}}{N_{total}}$$
Effective footing dimensions (Meyerhof):
$$L_x' = L_x - 2 e_x, \quad L_y' = L_y - 2 e_y$$
Effective uniform contact pressure:
$$q_{eff} = \frac{N_{total}}{L_x' \cdot L_y'} \le q_{Rd}$$

Elastic trapezoidal/triangular distribution:
$$q(x, y) = \frac{N}{A} \pm \frac{M_y}{W_y} \pm \frac{M_x}{W_x}$$
Requirement: $e_x \le L_x / 6$ and $e_y \le L_y / 6$ to avoid base uplift.

### 3.2 Flexural Design at Column Face (EC2 Cl 6.1)
Cantilever moment per unit width:
$$M_{Ed,x} = \int q_{u}(x) \cdot (x - x_{face}) dx$$
Required flexural steel:
$$K = \frac{M_{Ed}}{b d^2 f_{ck}} \le 0.167$$
$$A_s = \frac{M_{Ed}}{f_{yd} z}$$

### 3.3 One-Way (Beam) Shear at $1.0 d$ from Face (EC2 Cl 6.2.2)
$$V_{Ed} = \int_{x_{face} + d}^{L_x/2} q_{u}(x) dx$$
$$v_{Ed} = \frac{V_{Ed}}{b d} \le v_{Rd,c}$$
$$v_{Rd,c} = \max\left(0.12 k (100 \rho_l f_{ck})^{1/3}, 0.035 k^{3/2} f_{ck}^{1/2}\right)$$

### 3.4 Punching Shear at $2.0 d$ Control Perimeter (EC2 Cl 6.4)
Control perimeter $u_1$ at distance $2d$ from column face with rounded corners.
$$v_{Ed} = \frac{\beta V_{Ed,red}}{u_1 d} \le v_{Rd,c}$$
where $V_{Ed,red} = V_{Ed} - \Delta V_{Ed}$ ($\Delta V_{Ed}$ = upward soil reaction inside perimeter $u_1$).
For eccentric loading:
$$\beta = 1 + k \frac{M_{Ed}}{V_{Ed}} \frac{u_1}{W_1}$$

---

## 4. Tables Needed
- EC2 Table 6.1: Values of $k$ for rectangular columns in punching shear (VERIFY AGAINST CODE).
- EC7 Partial factors for Design Approaches DA1-1, DA1-2, DA2 (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: Uniaxial Eccentricity to EC2 / EC7
- Column $400 \times 400\text{ mm}$, Base $3.0 \times 3.0\text{ m}$, $h = 650\text{ mm}$, $c = 50\text{ mm} \implies d = 584\text{ mm}$.
- $N_{Ed} = 1500\text{ kN}, M_{Ed} = 225\text{ kNm} \implies e = 225 / 1500 = 0.15\text{ m} \le B/6 = 0.50\text{ m}$.
- Hand working verify:
  - $p_{max} = \frac{1500}{9}(1 + 6 \times 0.15 / 3.0) = 166.7 \times 1.30 = 216.7\text{ kPa}$.
  - $p_{min} = 166.7 \times 0.70 = 116.7\text{ kPa}$.
  - Bending moment at face $a = (3.0 - 0.4)/2 = 1.30\text{ m}$.
  - $v_{Ed}$ at $1.0d$ beam shear.
  - $v_{Ed}$ at $2.0d$ punching shear.

### Test Case 2: Biaxial Eccentricity
- Base $3.2 \times 2.8\text{ m}, N = 1200\text{ kN}, M_x = 120\text{ kNm}, M_y = 80\text{ kNm}$. Verify corner pressure.

---

## 6. Known Pitfalls
1. Net upward pressure for structural design includes column loads but excludes footing self-weight.
2. In EC2, soil pressure inside the control perimeter relieves the net punching force ($V_{Ed,red}$), significantly reducing required punching links.

---

## 7. Questions for Review
- Should the tool support UK NA $\beta$ simplified values ($1.15$ internal, $1.4$ edge, $1.5$ corner) or exact $W_1$ sector integration?
