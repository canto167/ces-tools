# CES Tools Changelog

## [1.1.0-prelaunch] - 2026-11-19
### Fixed (audit items S1-S16 and UI)
- C1: design code must be EC2 or BS8110; alpha_cc (default 0.85, UK/Malaysian NA) now drives the EC2 stress block (K' = 0.167 x acc/0.85, z = d[0.5 + sqrt(0.25 - 0.75K/acc)]).
- C1: compression steel stress checked from strain (fsc = min(fyd, 700(1 - d2/x))); warning when it does not yield.
- C1, C2: EC2 deflection modifier now (500/fyk)(As,prov/As,req) <= 1.5; warnings when rho_l is capped at 0.02 (EC2) or 100As/bd at 3 (BS).
- C1, C2, C3, C5, C10: BS 8110 minimum steel 0.24% bh for fy = 250 (Table 3.25).
- C2, C3: negative finishes or imposed loads rejected; C2 rejects an unknown code.
- C7: EC2 lap length l0 follows Eq 8.10 (alpha4 removed); fctd limited to C60/75; alpha factors, sigma_sd and rho1 range-checked.
- C7: BS 8110 compression lap = 1.25 x compression anchorage (Cl 3.12.8.15); bar type (Table 3.26 beta) is now an input and stated in the output.
- C6: end conditions, k, bar count and diameter validated (no silent clamping).
- C8: unknown support types rejected.
- C9: invalid rows (non-standard diameter, zero/negative counts or lengths) are flagged and left out of the totals; wastage range-checked.
- C4: "reinforcement required" now shows WARN instead of FAIL.
- C6, C8, C10, C7 UIs: check cards and step tables read the normalised report fields (were showing "undefined" and FAIL).
### Changed
- Real blog links in a "Related guides" box on every tool (open in the parent page); "Open full screen" button shown when embedded.
- Tool pages and hub: noindex (googlebot: noindex, indexifembedded) so github.io does not compete with the blog posts.
- BS 8110/BS 8002 withdrawn-standard note added to the disclaimers.
- Load Example values match the blog posts: C1 links H8 at 300 (EC2 top bars 2H12); C8 E = 210 GPa, I = 95.1 x 10^6 mm4.
### Tests
- tests/prelaunch-fixes.test.js: 34 new tests with hand-calculated values; 107/107 pass.
### Fixed after checking BS 8110-1:1997 incorporating Amendments 1-4 (STRUCT-Agent codes/raw, page 71)
- S12, C6: Eq 38 (Cl 3.8.4.3, no significant moments) = 0.4 fcu Ac + 0.75 Asc fy; Eq 39 (Cl 3.8.4.4, approximately symmetrical beams) = 0.35 fcu Ac + 0.67 Asc fy. Ac is the net area (Cl 3.8.1.1). The tool now offers both equations (replacing the k = 0.70/0.75 option) and uses net Ac in the capacity and Nuz (0.45 fcu Ac + 0.87 fy Asc, Cl 3.8.3.1).
- C6 Load Example now matches the blog post: Eq 39, 4H25 (capacity 1,582 kN).

## [1.0.0-phase0] - 2026-11-18
### Added
- Core shared architecture (`shared/css/base.css`, `shared/css/print.css`).
- Core logic utilities (`units.js`, `bars.js`, `validate.js`, `report.js`, `share.js`, `store.js`, `svg.js`, `ui-kit.js`, `embed.js`).
- Test suite framework and automated tests (`tests/test-helpers.js`, `tests/core.test.js`).
- Project documentation (`PLAN.md`, `PROGRESS.md`, `VERIFICATION.md`, `README.md`).
