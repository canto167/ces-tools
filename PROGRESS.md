# CES Tools Implementation Progress

## Status Legend
- 🟢 **DONE / PASS**: Verified against acceptance tests within $\pm 0.5\%$, UI complete, commit tagged.
- 🟡 **IN PROGRESS**: Current focus.
- 🔴 **BLOCKED**: Acceptance test mismatch or engineering discrepancy awaiting review.
- ⚪ **PENDING**: Scheduled in sequence.

---

## Phase 0 — Core Architecture & Infrastructure
- [x] Shared design system (`shared/css/base.css`, `shared/css/print.css`) 🟢
- [x] Core units, bars, validation, report, share, and svg helpers 🟢
- [x] Unit test framework & test helper (`expectClose`) 🟢
- [x] Hub catalog page (`index.html`) 🟢
- [x] Build script (`build.js`) 🟢

---

## Phase 1 — Core Calculators Suite (C1 - C11)
- [x] **C1: RC Rectangular Beam** (`rc-beam`) — EC2 & BS 8110 🟢 (4/4 Tests Pass; 4 Screenshots)
- [x] **C2: One-Way Slab** (`one-way-slab`) — EC2 & BS 8110 🟢 (3/3 Tests Pass; 4 Screenshots)
- [x] **C3: Two-Way Slab (Simply Supported)** (`two-way-slab`) — BS 8110 Table 3.13 🟢 (1/1 Tests Pass; 4 Screenshots)
- [x] **C4: Punching Shear** (`punching-shear`) — EC2 🟢 (1/1 Tests Pass; 4 Screenshots)
- [ ] **C5: Square Pad Footing** (`pad-footing`) — BS 8110 ⚪
- [ ] **C6: Short Braced Column (Axial)** (`short-column`) — BS 8110 ⚪
- [ ] **C7: Anchorage & Lap Length** (`anchorage-lap`) — EC2 & BS 8110 ⚪
- [ ] **C8: Beam Formulas (SFD, BMD, Deflection)** (`beam-formulas`) — 4 Support Types ⚪
- [ ] **C9: Rebar Weight & Quantity List** (`rebar-weight`) ⚪
- [ ] **C10: Cantilever Retaining Wall** (`retaining-wall`) — Stability + BS 8110 Stem ⚪
- [ ] **C11: Engineering Unit Converter** (`unit-converter`) — SI & US ⚪

---

## Phase 2 — Written Specifications Only (Docs)
- [ ] 1. Crack width check (EC2 Cl 7.3.4 & BS 8110-2 Cl 3.8) ⚪
- [ ] 2. Restrained two-way slabs (BS 8110 Table 3.14 & EC2) ⚪
- [ ] 3. Column with moments and slenderness ⚪
- [ ] 4. Flanged (T and L) beams ⚪
- [ ] 5. Pad footing to EC2 with moments ⚪
- [ ] 6. BS 8110 punching shear ⚪
- [ ] 7. Concrete cover calculator ⚪
- [ ] 8. Precast lifting (strands/rebars & CG) ⚪
- [ ] 9. Steel member checks (EC3) ⚪
- [ ] 10. BS 8666 bar shape codes ⚪
- [ ] 11. Deflection by calculation (EC2 Cl 7.4.3) ⚪
