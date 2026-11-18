/**
 * SVG geometry and technical drawing helpers
 */

export const SVG = {
  NS: 'http://www.w3.org/2000/svg',

  create(tag, attrs = {}) {
    const el = document.createElementNS(SVG.NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, String(v));
    }
    return el;
  },

  /**
   * Draw a dimension line with arrows and text label
   */
  dimension(x1, y1, x2, y2, label, offset = 20, isVertical = false) {
    const g = SVG.create('g', { class: 'svg-dimension' });
    
    // Dimension line coordinates shifted by offset
    const dx = isVertical ? offset : 0;
    const dy = isVertical ? 0 : offset;
    
    const lx1 = x1 + dx;
    const ly1 = y1 + dy;
    const lx2 = x2 + dx;
    const ly2 = y2 + dy;

    // Witness / extension lines
    g.appendChild(SVG.create('line', {
      x1, y1, x2: lx1, y2: ly1,
      stroke: '#94a3b8', 'stroke-width': '1', 'stroke-dasharray': '2,2'
    }));
    g.appendChild(SVG.create('line', {
      x2, y2, x2: lx2, y2: ly2,
      stroke: '#94a3b8', 'stroke-width': '1', 'stroke-dasharray': '2,2'
    }));

    // Main dimension line
    g.appendChild(SVG.create('line', {
      x1: lx1, y1: ly1, x2: lx2, y2: ly2,
      stroke: '#475569', 'stroke-width': '1.5'
    }));

    // Arrows / tick marks
    const tickLen = 5;
    g.appendChild(SVG.create('line', {
      x1: lx1 - (isVertical ? tickLen : 0),
      y1: ly1 - (isVertical ? 0 : tickLen),
      x2: lx1 + (isVertical ? tickLen : 0),
      y2: ly1 + (isVertical ? 0 : tickLen),
      stroke: '#475569', 'stroke-width': '1.5'
    }));
    g.appendChild(SVG.create('line', {
      x1: lx2 - (isVertical ? tickLen : 0),
      y1: ly2 - (isVertical ? 0 : tickLen),
      x2: lx2 + (isVertical ? tickLen : 0),
      y2: ly2 + (isVertical ? 0 : tickLen),
      stroke: '#475569', 'stroke-width': '1.5'
    }));

    // Text label
    const mx = (lx1 + lx2) / 2;
    const my = (ly1 + ly2) / 2;
    const text = SVG.create('text', {
      x: mx,
      y: isVertical ? my : my - 4,
      fill: '#0f172a',
      'font-size': '11',
      'font-family': 'ui-sans-serif, system-ui, sans-serif',
      'font-weight': '600',
      'text-anchor': 'middle',
      'dominant-baseline': isVertical ? 'central' : 'auto'
    });
    if (isVertical) {
      text.setAttribute('transform', `rotate(-90, ${mx}, ${my})`);
      text.setAttribute('y', my - 8);
    }
    text.textContent = label;
    g.appendChild(text);

    return g;
  }
};
