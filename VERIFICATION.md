# CES Tools Verification Ledger

All acceptance tests must match expected values within stated tolerances (default $\pm 0.5\%$, unit conversions $\pm 0.01\%$).

| Calculator | Code | Parameter | Expected | Actual | Diff (%) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **C1 rc-beam** | EC2-1 | d (mm) | 450.0 | 450.00 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | K | 0.1037 | 0.1037 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | z (mm) | 404.2 | 404.16 | 0.01% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | As (mm²) | 1075.5 | 1075.52 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | As,prov (mm²) | 1256.6 | 1256.64 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | VRd,c (kN) | 81.9 | 81.91 | 0.01% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | VRd,max (kN) | 442.4 | 442.42 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | Asw/s (mm²/mm) | 0.286 | 0.286 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | l/d basic | 16.65 | 16.65 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | l/d allowable | 19.45 | 19.45 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-1 | actual span/d | 13.33 | 13.33 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | d (mm) | 447.5 | 447.50 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | K | 0.1831 | 0.1831 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | z (mm) | 367.2 | 367.19 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | As2 (mm²) | 167.0 | 167.01 | 0.01% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | As1 (mm²) | 2052.4 | 2052.44 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | As,prov (mm²) | 2454.4 | 2454.37 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | VRd,c (kN) | 102.1 | 102.09 | 0.01% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | VRd,max (kN) | 440.0 | 439.96 | 0.01% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | Asw/s (mm²/mm) | 0.457 | 0.457 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | l/d basic | 14.42 | 14.42 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | l/d allowable | 17.25 | 17.25 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | actual span/d | 13.41 | 13.41 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | EC2-2 | Bar spacing check | FAIL | FAIL (gap 23.8mm < 25mm) | — | 🟢 PASS |
| **C1 rc-beam** | BS-1 | d (mm) | 450.0 | 450.00 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | K | 0.1086 | 0.1086 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | z (mm) | 386.8 | 386.83 | 0.01% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | As (mm²) | 1176.8 | 1176.82 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | v (N/mm²) | 0.978 | 0.978 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | vc (N/mm²) | 0.637 | 0.637 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | Asv/sv (mm²/mm) | 0.276 | 0.276 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | fs (N/mm²) | 312.1 | 312.16 | 0.02% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | MFt | 0.880 | 0.880 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | MFc | 1.090 | 1.090 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | allowable l/d | 19.20 | 19.20 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-1 | actual span/d | 13.33 | 13.33 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | d (mm) | 447.5 | 447.50 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | K | 0.1665 | 0.1665 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | z (mm) | 347.7 | 347.66 | 0.01% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | As' (mm²) | 108.4 | 108.43 | 0.03% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | As (mm²) | 1967.6 | 1967.61 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | v (N/mm²) | 1.490 | 1.490 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | vc (N/mm²) | 0.798 | 0.798 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | Asv/sv (mm²/mm) | 0.477 | 0.477 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | fs (N/mm²) | 267.2 | 267.18 | 0.01% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | MFt | 0.847 | 0.847 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | MFc | 1.091 | 1.091 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | allowable l/d | 18.47 | 18.47 | 0.00% | 🟢 PASS |
| **C1 rc-beam** | BS-2 | actual span/d | 13.41 | 13.41 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | d (mm) | 145.0 | 145.00 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | gk (kN/m²) | 5.20 | 5.20 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | n (kN/m²) | 12.08 | 12.08 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | M (kNm/m) | 24.16 | 24.16 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | V (kN/m) | 24.16 | 24.16 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | K | 0.0383 | 0.0383 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | z (mm) | 137.75 | 137.75 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | As (mm²/m) | 403.2 | 403.20 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | As,min (mm²/m) | 227.5 | 227.50 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | As,prov (mm²/m) | 523.6 | 523.60 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | fs (N/mm²) | 256.7 | 256.68 | 0.01% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | MF | 1.446 | 1.446 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | allowable l/d | 28.92 | 28.92 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | actual span/d | 27.59 | 27.59 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | v (N/mm²) | 0.167 | 0.167 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1 | vc (N/mm²) | 0.616 | 0.616 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1b | As,prov (mm²/m) | 448.8 | 448.80 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1b | MF | 1.272 | 1.272 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1b | allowable l/d | 25.44 | 25.44 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | BS-1b | Deflection Check | FAIL | FAIL (actual 27.59 > 25.44) | — | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | gk (kN/m²) | 5.375 | 5.375 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | n (kN/m²) | 11.756 | 11.756 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | M (kNm/m) | 23.513 | 23.513 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | V (kN/m) | 23.513 | 23.513 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | K | 0.0373 | 0.0373 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | z (mm) | 137.75 | 137.75 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | As (mm²/m) | 392.6 | 392.59 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | As,min (mm²/m) | 218.4 | 218.40 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | As,prov (mm²/m) | 448.8 | 448.80 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | l/d basic | 45.76 | 45.76 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | allowable l/d | 52.31 | 52.31 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | actual span/d | 27.59 | 27.59 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | v,min (N/mm²) | 0.5422 | 0.5422 | 0.00% | 🟢 PASS |
| **C2 one-way-slab** | EC2-1 | VRd,c (kN/m) | 78.6 | 78.62 | 0.03% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | ratio (ly/lx) | 1.25 | 1.25 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | alpha_sx | 0.0885 | 0.0885 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | alpha_sy | 0.0570 | 0.0570 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | n (kN/m²) | 12.08 | 12.08 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | msx (kNm/m) | 17.11 | 17.11 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | msy (kNm/m) | 11.02 | 11.02 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | dx (mm) | 145.0 | 145.00 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | dy (mm) | 135.0 | 135.00 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | Asx (mm²/m) | 285.5 | 285.50 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | Asy (mm²/m) | 197.5 | 197.50 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | As,min (mm²/m) | 227.5 | 227.50 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | Apx (mm²/m) | 392.7 | 392.70 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | Apy (mm²/m) | 261.8 | 261.80 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | MF | 1.691 | 1.691 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | allowable l/d | 33.83 | 33.83 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | actual span/d | 27.59 | 27.59 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | v (N/mm²) | 0.167 | 0.167 | 0.00% | 🟢 PASS |
| **C3 two-way-slab** | BS-1 | vc (N/mm²) | 0.561 | 0.560 | 0.18% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | self-weight (kN) | 104.98 | 104.98 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | service q (kN/m²) | 179.0 | 179.01 | 0.01% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | N (kN) | 1760.0 | 1760.00 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | pu (kN/m²) | 241.43 | 241.43 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | d (mm) | 534.0 | 534.00 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | a (m) | 1.15 | 1.15 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | M (kNm) | 431.04 | 431.04 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | K | 0.0187 | 0.0187 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | z (mm) | 507.3 | 507.30 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | As (mm²) | 1953.3 | 1953.34 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | As,min (mm²) | 2106.0 | 2106.00 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | As,prov (mm²) | 3619.1 | 3619.11 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | v_face (N/mm²) | 2.060 | 2.060 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | vmax (N/mm²) | 4.382 | 4.382 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | vc (N/mm²) | 0.424 | 0.424 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | perim_side (mm) | 2002.0 | 2002.00 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | Vpunch (kN) | 792.4 | 792.40 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | v_punch (N/mm²) | 0.185 | 0.185 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | Vbeam (kN) | 401.5 | 401.49 | 0.00% | 🟢 PASS |
| **C5 pad-footing** | BS-1 | v_beam (N/mm²) | 0.278 | 0.278 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 | beta | 0.75 | 0.75 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 | le (m) | 2.40 | 2.40 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 | le/h | 8.0 | 8.0 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 (Eq 38, net Ac) | Asc,req (mm²) | 1157.0 | 1157.02 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 | Asc,prov (mm²) | 1256.6 | 1256.64 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 (Eq 38, net Ac) | capacity (kN) | 1536.2 | 1536.16 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 (net Ac) | Nuz (kN) | 1744.7 | 1744.67 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 | link phi (mm) | 6 | 6 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-1 | link spacing (mm) | 240 | 240 | 0.00% | 🟢 PASS |
| **C6 short-column** | BS-2 (Eq 39) | Asc,req (mm²) | 1710.3 | 1710.32 | 0.00% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | fctm (MPa) | 2.896 | 2.896 | 0.02% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | fctk,0.05 (MPa) | 2.028 | 2.028 | 0.02% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | fctd (MPa) | 1.352 | 1.352 | 0.02% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | fbd (MPa) | 3.041 | 3.041 | 0.01% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | lb,rqd (mm) | 572.1 | 571.84 | 0.05% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | lb,rqd (phi) | 35.8 | 35.74 | 0.17% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | lb,min (mm) | 171.6 | 171.55 | 0.03% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | l0 (mm) | 858.2 | 857.76 | 0.05% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 | l0,min (mm) | 257.5 | 257.33 | 0.07% | 🟢 PASS |
| **C7 anchorage-lap** | EC2-1 (Poor) | lb,rqd (mm) | 817.3 | 816.91 | 0.05% | 🟢 PASS |
| **C7 anchorage-lap** | BS-1 | fbu (MPa) | 2.739 | 2.739 | 0.01% | 🟢 PASS |
| **C7 anchorage-lap** | BS-1 | anchorage (mm) | 635.4 | 635.36 | 0.01% | 🟢 PASS |
| **C7 anchorage-lap** | BS-1 | anchorage (phi) | 39.7 | 39.71 | 0.03% | 🟢 PASS |
| **C7 anchorage-lap** | BS-1 | lap x1.4 (mm) | 889.5 | 889.50 | 0.00% | 🟢 PASS |
| **C7 anchorage-lap** | BS-1 | lap x2.0 (mm) | 1270.7 | 1270.72 | 0.00% | 🟢 PASS |
| **C7 anchorage-lap** | BS-1 | lap min (mm) | 300.0 | 300.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 1 (SS UDL) | RA (kN) | 30.0 | 30.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 1 (SS UDL) | RB (kN) | 30.0 | 30.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 1 (SS UDL) | Mmax (kNm) | 45.0 | 45.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 1 (SS UDL) | delta_max (mm) | 8.4375 | 8.4375 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 2a (SS P) | RA (kN) | 26.667 | 26.667 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 2a (SS P) | RB (kN) | 13.333 | 13.333 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 2a (SS P) | Mmax (kNm) | 53.333 | 53.333 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 2b (Central P) | delta_mid (mm) | 9.000 | 9.000 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 3 (SS UDL+P) | RA (kN) | 32.5 | 32.50 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 3 (SS UDL+P) | RB (kN) | 27.5 | 27.50 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 3 (SS UDL+P) | Mmax (kNm) | 75.0 | 75.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 3 (SS UDL+P) | M at 4m (kNm) | 70.0 | 70.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 4 (Cantilever) | V (kN) | 34.0 | 34.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 4 (Cantilever) | M (kNm) | -66.0 | -66.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 4 (Cantilever) | delta_tip (mm) | 4.05 | 4.050 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 5 (Fixed-Fixed)| Msupport (kNm) | -30.0 | -30.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 5 (Fixed-Fixed)| Mmid (kNm) | 15.0 | 15.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 5 (Fixed-Fixed)| delta_mid (mm) | 1.6875 | 1.6875 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 6 (Propped Cant)| RB (kN) | 22.5 | 22.50 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 6 (Propped Cant)| RA (kN) | 37.5 | 37.50 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 6 (Propped Cant)| MA (kNm) | -45.0 | -45.00 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 6 (Propped Cant)| Msag,max (kNm) | 25.3125 | 25.3125 | 0.00% | 🟢 PASS |
| **C8 beam-formulas** | Test 6 (Propped Cant)| delta_max (mm) | 3.51 | 3.503 | 0.20% | 🟢 PASS |
| **C9 rebar-weight** | phi12 | Exact kg/m | 0.8878 | 0.8878 | 0.00% | 🟢 PASS |
| **C9 rebar-weight** | phi12 | Rule kg/m | 0.889 | 0.889 | 0.01% | 🟢 PASS |
| **C9 rebar-weight** | phi16 | Exact kg/m | 1.5783 | 1.5783 | 0.00% | 🟢 PASS |
| **C9 rebar-weight** | phi16 | Rule kg/m | 1.580 | 1.580 | 0.02% | 🟢 PASS |
| **C9 rebar-weight** | phi20 | Exact kg/m | 2.4662 | 2.4662 | 0.00% | 🟢 PASS |
| **C9 rebar-weight** | phi20 | Rule kg/m | 2.469 | 2.469 | 0.01% | 🟢 PASS |
| **C9 rebar-weight** | Row Test | Total Length (m) | 240.0 | 240.00 | 0.00% | 🟢 PASS |
| **C9 rebar-weight** | Row Test | Total Weight (kg)| 378.8 | 378.80 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Ka | 0.3333 | 0.3333 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Pa (kN/m) | 58.08 | 58.08 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Pq (kN/m) | 14.67 | 14.67 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Mo (kNm/m) | 117.45 | 117.45 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | W_stem (kN/m) | 28.8 | 28.80 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | W_base (kN/m) | 33.6 | 33.60 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | W_soil (kN/m) | 172.8 | 172.80 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | W_tot (kN/m) | 235.2 | 235.20 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Mr (kNm/m) | 483.6 | 483.60 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | FoS Overturning | 4.12 | 4.12 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | FoS Sliding | 1.62 | 1.62 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | V_bear (kN/m) | 259.2 | 259.20 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | e (m) | 0.124 | 0.124 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | pmax (kPa) | 89.9 | 89.85 | 0.05% | 🟢 PASS |
| **C10 retaining-wall** | Test A | pmin (kPa) | 58.3 | 58.26 | 0.07% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Stem Mu (kNm/m) | 132.3 | 132.27 | 0.02% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Stem d (mm) | 252.0 | 252.00 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Stem As,req (mm²/m) | 1317.6 | 1317.59 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Stem As,prov (mm²/m) | 1340.4 | 1340.41 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Stem Vu (kN/m) | 88.5 | 88.53 | 0.03% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Stem v (N/mm²) | 0.351 | 0.351 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test A | Stem vc (N/mm²) | 0.611 | 0.611 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test B | W_tot (kN/m) | 194.4 | 194.40 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test B | Mr (kNm/m) | 351.0 | 351.00 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test B | FoS Overturning | 2.99 | 2.99 | 0.00% | 🟢 PASS |
| **C10 retaining-wall** | Test B | FoS Sliding | 1.34 | 1.34 | 0.00% | 🟢 PASS (FAIL verified) |
| **C11 unit-converter** | Stress | 1 ksi → MPa | 6.894757 | 6.894757 | 0.000% | 🟢 PASS |
| **C11 unit-converter** | Force | 1 kip → kN | 4.448222 | 4.448222 | 0.000% | 🟢 PASS |
| **C11 unit-converter** | Moment | 1 kip·ft → kNm | 1.355818 | 1.355818 | 0.000% | 🟢 PASS |
| **C11 unit-converter** | Area Load | 1 psf → kN/m² | 0.04788026 | 0.04788026 | 0.000% | 🟢 PASS |
| **C11 unit-converter** | Density | 1 lb/ft³ → kN/m³ | 0.1570875 | 0.1570875 | 0.000% | 🟢 PASS |
| **C11 unit-converter** | Inertia | 1 in⁴ → mm⁴ | 416231.4 | 416231.43 | 0.000% | 🟢 PASS |
| **C11 unit-converter** | Modulus | 1 in³ → mm³ | 16387.06 | 16387.06 | 0.000% | 🟢 PASS |
