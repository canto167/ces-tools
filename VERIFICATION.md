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
| **C4 punching-shear** | EC2-1 | u0 (mm) | 1600.0 | 1600.00 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | vEd,0 (N/mm²) | 2.567 | 2.567 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | vRd,max (0.4) (N/mm²) | 4.224 | 4.224 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | vRd,max (0.5 UK) (N/mm²) | 5.280 | 5.280 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | u1 at 2d (mm) | 4238.9 | 4238.94 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | vEd,1 (N/mm²) | 0.969 | 0.969 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | k | 1.976 | 1.976 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | vRd,c (N/mm²) | 0.669 | 0.669 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | v_min (N/mm²) | 0.532 | 0.532 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | fywd,ef (N/mm²) | 302.5 | 302.50 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | Asw/sr (mm²/mm) | 4.362 | 4.362 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | Asw per perim (mm²) | 654.2 | 654.23 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | Link legs per perim | 9 | 9 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | uout (mm) | 6135.7 | 6135.66 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | r_out (mm) | 721.9 | 721.88 | 0.00% | 🟢 PASS |
| **C4 punching-shear** | EC2-1 | last perim dist (mm) | 406.9 | 406.88 | 0.00% | 🟢 PASS |
