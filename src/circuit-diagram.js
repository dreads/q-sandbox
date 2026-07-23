const SVG_NS = 'http://www.w3.org/2000/svg';

const W = 540;
const H = 90;
const Y0 = 28;   // q0 wire
const Y1 = 62;   // q1 wire
const X_WIRE_START = 80;
const X_H = 178;    // H gate centre
const X_CNOT = 312; // CNOT centre
const X_WIRE_END = 416;
const X_BRACKET = 430;
const X_OUT = 494;
const GATE_W = 34;
const GATE_H = 28;
const XOR_R = 12;

function el(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function txt(x, y, str, attrs = {}) {
  const t = el('text', {
    x,
    y,
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    ...attrs,
  });
  t.textContent = str;
  return t;
}

export function createCircuitDiagram(container) {
  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    width: '100%',
    class: 'circuit-svg',
    role: 'img',
    'aria-label': 'H + CNOT quantum circuit',
  });

  // Wires
  svg.appendChild(el('line', { x1: X_WIRE_START, y1: Y0, x2: X_WIRE_END, y2: Y0, class: 'circuit-wire' }));
  svg.appendChild(el('line', { x1: X_WIRE_START, y1: Y1, x2: X_WIRE_END, y2: Y1, class: 'circuit-wire' }));

  // H gate
  svg.appendChild(el('rect', {
    x: X_H - GATE_W / 2, y: Y0 - GATE_H / 2,
    width: GATE_W, height: GATE_H,
    class: 'circuit-gate',
  }));
  svg.appendChild(txt(X_H, Y0, 'H', { class: 'circuit-gate-label' }));

  // CNOT: vertical line from control to XOR edge
  svg.appendChild(el('line', {
    x1: X_CNOT, y1: Y0,
    x2: X_CNOT, y2: Y1 - XOR_R,
    class: 'circuit-wire',
  }));

  // CNOT control dot
  svg.appendChild(el('circle', { cx: X_CNOT, cy: Y0, r: 5, class: 'circuit-control' }));

  // CNOT target: XOR symbol (circle with cross)
  svg.appendChild(el('circle', { cx: X_CNOT, cy: Y1, r: XOR_R, class: 'circuit-xor' }));
  svg.appendChild(el('line', {
    x1: X_CNOT - XOR_R, y1: Y1, x2: X_CNOT + XOR_R, y2: Y1,
    class: 'circuit-wire',
  }));
  svg.appendChild(el('line', {
    x1: X_CNOT, y1: Y1 - XOR_R, x2: X_CNOT, y2: Y1 + XOR_R,
    class: 'circuit-wire',
  }));

  // Output bracket (vertical line + ticks)
  const TICK = 8;
  svg.appendChild(el('line', { x1: X_BRACKET, y1: Y0, x2: X_BRACKET, y2: Y1, class: 'circuit-bracket' }));
  svg.appendChild(el('line', { x1: X_BRACKET, y1: Y0, x2: X_BRACKET + TICK, y2: Y0, class: 'circuit-bracket' }));
  svg.appendChild(el('line', { x1: X_BRACKET, y1: Y1, x2: X_BRACKET + TICK, y2: Y1, class: 'circuit-bracket' }));

  // Wire qubit name labels (faint, left edge)
  svg.appendChild(txt(14, Y0, 'q0', { class: 'circuit-qubit-label' }));
  svg.appendChild(txt(14, Y1, 'q1', { class: 'circuit-qubit-label' }));

  // Dynamic elements
  const inLabel0 = txt(50, Y0, '|0⟩', { class: 'circuit-ket' });
  const inLabel1 = txt(50, Y1, '|0⟩', { class: 'circuit-ket' });
  const outLabel = txt(X_OUT, (Y0 + Y1) / 2, '|Φ⁺⟩', { class: 'circuit-ket circuit-out' });

  svg.appendChild(inLabel0);
  svg.appendChild(inLabel1);
  svg.appendChild(outLabel);

  container.appendChild(svg);

  return function draw({ q0, q1, label }) {
    inLabel0.textContent = `|${q0}⟩`;
    inLabel1.textContent = `|${q1}⟩`;
    outLabel.textContent = label;
  };
}
