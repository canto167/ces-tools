# C12 Section Properties Calculator

Area, centroid, second moment of area (I), elastic section modulus (S, top/bottom/minimum), plastic section modulus (Z, from the equal-area axis), radius of gyration (r) and shape factor, about both centroidal axes.

Shapes: rectangle, symmetric I (UB / W / IPE), T, channel, box (RHS/SHS), solid circle, pipe (CHS), built-up (up to 12 rectangles). Units: mm or inches.

Method: every shape except circles is a set of axis-aligned rectangles. I uses the parallel axis theorem, S = I / extreme-fibre distance, and Z sums first moments either side of the plastic neutral axis (found by bisection). Root radii and fillets are ignored, so rolled sections differ slightly from published tables.

Tests: tests/section-properties.test.js. Hand-checked rectangle, I, T (PNA in the flange), circle, pipe, box, channel, built-up = T, imperial units and input guards.
