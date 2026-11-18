# C9 — Rebar Weight and Quantity Schedule Calculator

## 1. Scope and Limitations
This calculator computes the unit weights, total cut lengths, individual weights, subtotals by diameter, and grand total tonnage for reinforcing steel bars.

### Included Features:
- Exact theoretical linear weight: $w = \left(\frac{\pi \phi^2}{4}\right) \cdot \rho_{steel} \cdot 10^{-6}\text{ kg/m}$ with $\rho_{steel} = 7850\text{ kg/m}^3$.
- Traditional site rule of thumb: $w_{approx} = \frac{\phi^2}{162}\text{ kg/m}$ displayed side-by-side with exact values.
- Rebar schedule table:
  - Bar Mark (e.g., 01, 02, B1, T1)
  - Bar Diameter $\phi$ (6, 8, 10, 12, 16, 20, 25, 32, 40 mm)
  - Number of structural members
  - Number of bars per member
  - Length per bar ($L$ in metres)
  - Total length ($m$)
  - Total weight ($kg$)
- Subtotals aggregated by bar diameter (tonnage per diameter size).
- Grand total length ($m$) and grand total weight ($kg$ and metric tonnes).
- Optional rolling wastage allowance percentage (e.g., $0\%, 3\%, 5\%, 10\%$).
- One-click CSV export and print-ready schedule layout.

### Excluded / Limitations:
- BS 8666 shape codes and bend dimension deductions (covered in Phase 2).
- Fabric / welded mesh schedules.

---

## 2. Governing Equations

### 2.1 Exact Mass per Metre (BS 4449 / EN 10080)
$$w_{exact} = \left(\frac{\pi \phi^2}{4}\right) \times 7850 \times 10^{-6} \text{ kg/m}$$

### 2.2 Rule-of-Thumb Approximation
$$w_{rule} = \frac{\phi^2}{162} \text{ kg/m}$$
*(Derived from $\frac{\pi}{4} \times 7850 \times 10^{-6} = 0.00616538 \approx \frac{1}{162.19}$)*

### 2.3 Row Quantities
$$\text{Total Length } L_{tot} = N_{members} \times N_{bars} \times L_{bar} \quad (\text{m})$$
$$\text{Total Mass } W_{row} = L_{tot} \times w_{exact} \quad (\text{kg})$$

---

## 3. Verified Acceptance Test Cases

### 3.1 Unit Weight Comparison (Tolerance $\pm 0.1\%$)
- $\phi 12$: Exact $0.8878\text{ kg/m}$, Rule $0.889\text{ kg/m}$
- $\phi 16$: Exact $1.5783\text{ kg/m}$, Rule $1.580\text{ kg/m}$
- $\phi 20$: Exact $2.4662\text{ kg/m}$, Rule $2.469\text{ kg/m}$

### 3.2 Schedule Row Test
- 10 members $\times$ 4 bars $\times$ 6.0 m of $\phi 16$:
  - Total length = $240.0\text{ m}$
  - Exact total weight = $378.8\text{ kg}$
