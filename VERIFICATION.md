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
