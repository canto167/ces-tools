# Punching Shear Designer (Eurocode 2) (`punching-shear`)

A structural calculation tool for checking column-slab punching shear and sizing shear reinforcement studs or links according to **Eurocode 2 (EN 1992-1-1:2004 Section 6.4)**.

---

## 1. Scope & Capabilities
- **Column Geometry**: Internal, edge, and corner columns (rectangular $c_1 \times c_2$ or circular diameter $D$).
- **Control Perimeters**:
  - $u_0$: Column face perimeter.
  - $u_1$: Basic control perimeter at distance $2d$ from column face with rounded corners.
  - $u_{out}$: Outer perimeter where shear reinforcement is no longer required ($v_{Ed} \le v_{Rd,c}$).
- **Shear Verifications**:
  - Maximum shear stress at column face ($v_{Ed,0} \le v_{Rd,max}$).
  - Punching shear resistance without shear reinforcement ($v_{Ed,1} \le v_{Rd,c}$).
  - Required shear reinforcement ($A_{sw}/s_r$) and minimum number of link legs per perimeter.
  - Radial placement: first perimeter at $0.3d - 0.5d$, maximum radial spacing $s_r \le 0.75d$, last perimeter at $\ge r - 1.5d$.

---

## 2. Input Parameters
- **Column Size**: Rectangular $c_1, c_2$ (mm) or Circular $D$ (mm).
- **Column Location**: Internal ($\beta = 1.15$), Edge ($\beta = 1.40$), Corner ($\beta = 1.50$), or Custom $\beta$.
- **Effective Depth $d$ (mm)**: Mean effective depth $(d_y + d_z)/2$.
- **Design Shear Force $V_{Ed}$ (kN)**: Factored axial column reaction transferred to slab.
- **Concrete Grade $f_{ck}$ (N/mm²)**: Characteristic cylinder strength.
- **Tension Reinforcement Ratio $\rho_l$**: $\sqrt{\rho_{ly} \rho_{lz}} \le 0.02$.
- **Link Steel $f_{ywk}$ (N/mm²)**: Yield strength of shear links/studs.
- **Link Diameter $\phi$ (mm)**: Bar size of vertical links.
- **National Annex Parameter**: $v_{Rd,max}$ factor: 0.40 (EN Recommended) or 0.50 (UK NA).

---

## 3. Governing Equations & Clauses (EN 1992-1-1)
1. **Design Shear Stress**:
   $$v_{Ed} = \frac{\beta V_{Ed}}{u_i d}$$
2. **Column Face Resistance (Cl 6.4.5(3))**:
   $$u_0 = 2(c_1 + c_2) \quad \text{(Rectangular)}$$
   $$\nu = 0.6 \left(1 - \frac{f_{ck}}{250}\right), \quad f_{cd} = \frac{f_{ck}}{1.5}$$
   $$v_{Rd,max} = \text{factor} \times \nu f_{cd} \quad (\text{factor} = 0.4 \text{ default, } 0.5 \text{ UK NA})$$
3. **Basic Control Perimeter $u_1$ (Cl 6.4.2)**:
   $$u_1 = 2(c_1 + c_2) + 4\pi d \quad \text{(Internal Rectangular)}$$
4. **Concrete Resistance without Links (Cl 6.4.4)**:
   $$k = \min\left(1 + \sqrt{\frac{200}{d}}, \; 2.0\right), \quad \rho_l = \min(\rho_l, 0.02)$$
   $$v_{Rd,c} = \max\left(0.12 k (100 \rho_l f_{ck})^{1/3}, \; 0.035 k^{1.5} f_{ck}^{0.5}\right)$$
5. **Shear Reinforcement (Cl 6.4.5(1))**:
   If $v_{Ed,1} > v_{Rd,c}$:
   $$f_{ywd,ef} = \min(250 + 0.25d, \; f_{ywd}), \quad f_{ywd} = \frac{f_{ywk}}{1.15}$$
   $$\frac{A_{sw}}{s_r} = \frac{(v_{Ed,1} - 0.75 v_{Rd,c}) u_1}{1.5 f_{ywd,ef}}$$
   $$s_r \le 0.75d$$
6. **Outer Perimeter $u_{out}$ (Cl 6.4.5(4))**:
   $$u_{out} = \frac{\beta V_{Ed}}{v_{Rd,c} d}, \quad r = \frac{u_{out} - 2(c_1 + c_2)}{2\pi}$$
   $$\text{Last perimeter position from face} \ge r - 1.5d$$
