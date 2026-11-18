# Specification: Concrete Cover Calculator (Eurocode 2 Cl 4.4.1 & BS 8500 / BS 8110)

> **UNVERIFIED — engineer review required**

## 1. Scope
Determination of nominal concrete cover ($c_{nom}$) to reinforcement to guarantee durability (environmental corrosion resistance), bond transmission, and fire resistance.
- Eurocode 2 (EN 1992-1-1:2004) Clause 4.4.1, Table 4.3N (Structural Class), Table 4.4N / 4.5N (Durability).
- UK National Annex / BS 8500-1 / Malaysian Annex adjustments.

---

## 2. Inputs
- Environmental Exposure Class (EN 206 / EC2 Table 4.1):
  - X0 (No risk of corrosion)
  - XC1 to XC4 (Corrosion induced by carbonation)
  - XD1 to XD3 (Corrosion induced by chlorides other than sea water)
  - XS1 to XS3 (Corrosion induced by airborne or direct sea water chlorides)
  - XF1 to XF4 (Freeze/thaw attack)
  - XA1 to XA3 (Chemical attack)
- Design Working Life: 50 years or 100 years.
- Structural Member Type: Slab, Wall, Beam, Column.
- Concrete Characteristic Strength: $f_{ck}$ (e.g., C25/30, C30/37, C35/45, C40/50).
- Special Quality Controls: Special concrete quality control system, air entrainment, compacting method.
- Bar Geometry: Maximum bar diameter $\phi$ or equivalent bundled bar diameter $\phi_n$. Maximum aggregate size $d_g$.
- Allowance for Execution Tolerance: $\Delta c_{dev}$ (standard default $10\text{ mm}$; reducible to $5\text{ mm}$ with quality control).

---

## 3. Governing Equations

### 3.1 Nominal Cover Formulation (Cl 4.4.1.1 Eq 4.1)
$$c_{nom} = c_{min} + \Delta c_{dev}$$
where:
$$c_{min} = \max(c_{min,b}, c_{min,dur} + \Delta c_{dur,\gamma} - \Delta c_{dur,st} - \Delta c_{dur,add}, 10\text{ mm})$$

### 3.2 Minimum Cover for Bond ($c_{min,b}$ Cl 4.4.1.2)
- For individual bars: $c_{min,b} \ge \phi$.
- For bundled bars: $c_{min,b} \ge \phi_n = \phi \sqrt{n_b} \le 55\text{ mm}$.
- If aggregate size $d_g > 32\text{ mm}$: $c_{min,b}$ increased by $5\text{ mm}$.

### 3.3 Minimum Cover for Durability ($c_{min,dur}$ Cl 4.4.1.2)
Based on Structural Class (default Class S4):
Class adjustment formula (Table 4.3N):
$$\text{Class} = S4 \pm \Delta(\text{Working Life}) \pm \Delta(f_{ck}) \pm \Delta(\text{Member Type}) \pm \Delta(\text{Quality Control})$$
- 100-year working life: $+2$ classes.
- High strength concrete:
  - $\ge$ C30/37 for XC2-XC4: $-1$ class.
  - $\ge$ C35/45 for XC1: $-1$ class.
  - $\ge$ C40/50 for XD/XS: $-1$ class.
- Slab/wall geometry (positioning unaffected by construction): $-1$ class.
- Minimum class is S1.

Look up $c_{min,dur}$ from Table 4.4N (Carbon steel) / Table 4.5N (Prestressing steel).

---

## 4. Tables Needed
- Table 4.1: Exposure classes (VERIFY AGAINST CODE).
- Table 4.3N: Structural class modification factors (VERIFY AGAINST CODE).
- Table 4.4N: Values of $c_{min,dur}$ for reinforcement (VERIFY AGAINST CODE).
- Table 4.2: Execution tolerance $\Delta c_{dev}$ (VERIFY AGAINST CODE).

---

## 5. Proposed Worked Test Cases

### Test Case 1: External Beam in Marine Atmosphere (XS1)
- Beam, 50-year life, Exposure XS1, C35/45 concrete, main bar $\phi 25\text{ mm}$, aggregate $20\text{ mm}$, standard tolerance $\Delta c_{dev} = 10\text{ mm}$.
- *Hand working target:*
  - Base class: S4.
  - Working life 50 yr: $0$.
  - Beam member: $0$.
  - Concrete C35/45 in XS1: 0 (needs C40/50 for -1).
  - Effective class = S4.
  - From Table 4.4N for XS1 & Class S4: $c_{min,dur} = 35\text{ mm}$.
  - Bond: $c_{min,b} = 25\text{ mm}$.
  - $c_{min} = \max(25, 35, 10) = 35\text{ mm}$.
  - $c_{nom} = 35 + 10 = 45\text{ mm}$.

### Test Case 2: Internal Slab (XC1)
- Slab, 50-year life, Exposure XC1, C25/30 concrete, bar $\phi 12\text{ mm}$.
- Class = S4 - 1 (slab) = S3. Table 4.4N $\implies c_{min,dur} = 10\text{ mm}$.
- $c_{min} = \max(12, 10, 10) = 12\text{ mm}$.
- $c_{nom} = 12 + 10 = 22\text{ mm}$ (or $25\text{ mm}$ specified).

---

## 6. Known Pitfalls
1. Cast against uneven ground: $c_{min} \ge 75\text{ mm}$ (no blinding) or $\ge 40\text{ mm}$ (with blinding).
2. National Annexes frequently overwrite Table 4.4N with national values (e.g., BS 8500 tables).

---

## 7. Questions for Review
- Should BS 8500-1 table lookups (min cement content, max w/c ratio) be integrated as companion recommendations?
