# CES Tools Architecture & Execution Plan

## 1. Overview
CES Tools is a zero-dependency suite of professional structural engineering web calculators designed for practising structural engineers and students. It is engineered specifically for clean embedding into **Blogger (Blogspot)** via GitHub Pages iframes, as well as offline execution from local `file://`.

## 2. Architecture & Data Model

### Engine Contract (`engine.js`)
Every calculator features a purely functional calculation engine completely decoupled from the DOM:
```javascript
calculate(input) -> {
  ok: boolean,
  errors: string[],
  warnings: string[],
  results: Record<string, number | string>,
  checks: Array<{
    name: string,
    demand: number,
    capacity: number,
    ratio: number,
    status: 'PASS' | 'FAIL' | 'WARN',
    clause: string,
    unit?: string,
    message?: string
  }>,
  steps: Array<{
    label: string,
    equation: string,
    substituted: string,
    value: number | string,
    unit: string,
    clause: string
  }>
}
```

### Clean-Room & Code Grounding
- **Zero code copying**: Algorithms are constructed strictly from primary design code clauses:
  - **Eurocode 2 (EN 1992-1-1:2004 + A1:2014)** and **MS EN 1992-1-1 / SS EN 1992-1-1**
  - **BS 8110-1:1997 + AMD 1:2005**
  - **Eurocode 3 (EN 1993-1-1 / EN 1993-1-8)**
- **Verification gate**: Every calculator must match pre-computed textbook acceptance tests within $\pm 0.5\%$ tolerance via `node --test` before any UI or drawing is deployed.

### Blogger Hosting & Embed Strategy
- Standalone calculators live under `calculators/<slug>/index.html`.
- Responsive iframe snippets live under `embed/<slug>.html`.
- Embeds communicate real-time document height via `postMessage` (`ces-tool-resize`) to eliminate inner iframe scrollbars.
- Full offline compatibility with system font stacks, native SVG rendering, and zero CDN/npm runtime dependencies.
