# Specification: Reinforcement Bar Shape Codes and Cut Lengths to BS 8666:2020

> **UNVERIFIED — engineer review required**

## 1. Scope
Calculation of exact cutting lengths, total fabrication dimensions, and minimum mandrel bend radii for standard scheduled reinforcing steel bar shapes in accordance with **BS 8666:2020** (Scheduling, dimensioning, bending and cutting of steel reinforcement for concrete).

---

## 2. Inputs
- Shape Code (e.g., Code 00, 11, 12, 13, 21, 33, 41, 51, 63, 67, 77, 99).
- Bar nominal diameter $\phi$ (6, 8, 10, 12, 16, 20, 25, 32, 40 mm).
- Leg dimensions: $A, B, C, D, E, R$ (in mm).
- Minimum bend radius $r$ (mandrel diameter $2r$).

---

## 3. Governing Equations and Standard Shape Formulas (BS 8666:2020 Table 1)

### 3.1 Minimum Former / Mandrel Diameters (Table 2)
- For $\phi \le 16\text{ mm}$: minimum mandrel diameter $= 4 \phi$.
- For $\phi > 16\text{ mm}$: minimum mandrel diameter $= 7 \phi$.

### 3.2 Standard Shape Cut Length Formulas

1. **Shape Code 00 (Straight bar):**
   $$L = A$$

2. **Shape Code 11 (One $90^\circ$ bend / L-bar):**
   $$L = A + B - 0.5 r - \phi$$

3. **Shape Code 12 (One crank bend):**
   $$L = A + B + C - r - 2\phi$$

4. **Shape Code 13 (U-bar / Hairpin):**
   $$L = A + 0.57 B + C - 1.6 \phi$$

5. **Shape Code 21 (Double bend / Offset):**
   $$L = A + B + C - r - 2\phi$$

6. **Shape Code 33 (Chair / Z-bar):**
   $$L = A + 2 B + C + E - 2 r - 4 \phi$$

7. **Shape Code 41 (Column/beam closed link with $90^\circ$ hooks):**
   $$L = 2 A + 2 B + 20 \phi$$

8. **Shape Code 51 (Link with $135^\circ$ seismic hooks):**
   $$L = 2 A + 2 B + 24 \phi$$

9. **Shape Code 67 (Continuous circular spiral / helical binder):**
   $$L = \pi n \sqrt{D^2 + p^2}$$
   where $n$ is number of turns, $D$ is outside diameter, $p$ is pitch.

10. **Shape Code 99 (Non-standard / Special shape):**
    Dimensioned by drawing with verified cutting length algorithm.

---

## 4. Tables Needed
- Table 1: Mathematical formulas for cut lengths of Shape Codes 00 to 98 (VERIFY AGAINST CODE).
- Table 2: Minimum radius of bending and end hook allowances (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: Shape Code 11 (L-Bar)
- $\phi = 16\text{ mm}, A = 600\text{ mm}, B = 400\text{ mm}$.
- Mandrel diameter for $\phi 16 = 4 \phi = 64\text{ mm} \implies r = 32\text{ mm}$.
- Cut length:
  $$L = 600 + 400 - 0.5(32) - 16 = 1000 - 16 - 16 = 968\text{ mm}$$

### Test Case 2: Shape Code 41 (Closed Link)
- $\phi = 10\text{ mm}, A = 250\text{ mm}, B = 450\text{ mm}$.
- Cut length:
  $$L = 2(250) + 2(450) + 20(10) = 500 + 900 + 200 = 1600\text{ mm}$$

---

## 6. Known Pitfalls
1. Sum of outside leg dimensions differs significantly from cutting length because of corner bend deductions.
2. In seismic detailing, $135^\circ$ hooks require minimum $10 \phi$ extension beyond the arc of the bend.

---

## 7. Questions for Review
- Should we include 2D SVG schematics showing dimensions $A, B, C$ dynamically updated for each shape code?
