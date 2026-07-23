import {
  densityMatrix,
  concurrence,
  purity,
  bellFromInput,
  inputFromBell,
  stateLabel,
  partialTrace0,
  partialTrace1,
  blochVector,
} from './state.js';
import { createMatrixGrid } from './matrix-grid.js';
import { createBlochSpheres } from './bloch-sphere.js';
import { createCircuitDiagram } from './circuit-diagram.js';

const model = {
  q0: 0,
  q1: 0,
  theta: Math.PI / 4,
  dephasing: 0,
};

const dom = {};
let draw;
let drawBloch;
let drawCircuit;

function query() {
  [
    'grid',
    'q0',
    'q1',
    'phase',
    'family',
    'dephasing',
    'dephasing-value',
    'theta',
    'theta-value',
    'state-label',
    'concurrence',
    'purity',
    'reading',
    'bloch-spheres',
    'circuit-diagram',
  ].forEach((id) => {
    dom[id] = document.getElementById(id);
  });
}

function toggleBit(which) {
  model[which] = model[which] === 1 ? 0 : 1;
  render();
}

/**
 * Both toggle pairs write the same two bits, so pressing "phase" moves q0 and
 * vice versa. Buttons carry aria-pressed so the coupling is announced too.
 */
function setPair(button, pressed, label) {
  button.textContent = label;
  button.setAttribute('aria-pressed', String(pressed));
}

function interpret({ conc, pur, dephasing, theta }) {
  const nearZero = (x) => Math.abs(x) < 0.02;
  if (nearZero(conc) && dephasing > 0.98) {
    return 'Fully dephased. The coherences are gone, so this is a classical correlated mixture with the same measurement statistics but no entanglement.';
  }
  if (nearZero(conc) && (nearZero(theta) || nearZero(theta - Math.PI / 2))) {
    return 'All amplitude sits on one basis state. Still a pure state, but a product state with nothing to entangle.';
  }
  if (conc > 0.98 && pur > 0.98) {
    return 'A maximally entangled Bell state. Equal populations, full coherence between them.';
  }
  if (pur > 0.98) {
    return 'Pure but only partially entangled. Unequal amplitudes weaken the correlation without introducing any mixedness.';
  }
  return 'Partially dephased. The coherence terms have shrunk while the populations hold, so entanglement is decaying toward a classical mixture.';
}

function render() {
  const { psi, negative } = bellFromInput(model.q0, model.q1);
  const rho = densityMatrix({
    psi,
    negative,
    theta: model.theta,
    dephasing: model.dephasing,
  });

  draw(rho);

  setPair(dom.q0, model.q0 === 1, `q0 = ${model.q0}`);
  setPair(dom.q1, model.q1 === 1, `q1 = ${model.q1}`);
  setPair(dom.phase, negative, `phase ${negative ? '−' : '+'}`);
  setPair(dom.family, psi, `${psi ? 'Ψ' : 'Φ'} family`);

  const degrees = Math.round((model.theta * 180) / Math.PI);
  const percent = Math.round(model.dephasing * 100);
  dom['theta-value'].textContent = `${degrees}°`;
  dom['dephasing-value'].textContent = `${percent}%`;

  const conc = concurrence(rho);
  const pur = purity(rho);

  const label = stateLabel({ psi, negative });
  dom['state-label'].textContent = label;
  dom.concurrence.textContent = conc.toFixed(2);
  dom.purity.textContent = pur.toFixed(2);
  dom.reading.textContent = interpret({
    conc,
    pur,
    dephasing: model.dephasing,
    theta: model.theta,
  });

  drawBloch(
    blochVector(partialTrace0(rho)),
    blochVector(partialTrace1(rho)),
  );
  drawCircuit({ q0: model.q0, q1: model.q1, label });
}

function init() {
  query();
  draw = createMatrixGrid(dom.grid);
  drawBloch = createBlochSpheres(dom['bloch-spheres']);
  drawCircuit = createCircuitDiagram(dom['circuit-diagram']);

  dom.q0.addEventListener('click', () => toggleBit('q0'));
  dom.phase.addEventListener('click', () => toggleBit('q0'));
  dom.q1.addEventListener('click', () => toggleBit('q1'));
  dom.family.addEventListener('click', () => toggleBit('q1'));

  dom.dephasing.addEventListener('input', (e) => {
    model.dephasing = Number(e.target.value) / 100;
    render();
  });

  dom.theta.addEventListener('input', (e) => {
    model.theta = (Number(e.target.value) * Math.PI) / 180;
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', init);

export { model, inputFromBell };
