# CES Tools

A suite of free, high-precision structural engineering web calculators for **Civil Engineer Society** (structure-structural-software.blogspot.com).

## How to Test
Run Node.js built-in test runner:
```bash
npm test
# or
node --test tests/*.test.js
```

## How to Run Locally
Open `index.html` directly in any modern browser, or launch a local static server:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

## Design Philosophy
- **Correct First**: Every calculator is ground-truth verified against textbook problems and strict code clauses (Eurocode 2, BS 8110, Eurocode 3).
- **Clear Second**: Step-by-step clause transparency showing equations, substituted numbers, and design limits.
- **Fast & Zero Maintenance**: Pure client-side JavaScript, zero npm runtime dependencies, $0 hosting cost on GitHub Pages / Blogger iframes.
