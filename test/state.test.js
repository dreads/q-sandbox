import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  densityMatrix,
  concurrence,
  purity,
  bellFromInput,
  inputFromBell,
  stateLabel,
} from '../src/state.js';

const BELL = { psi: false, negative: false, theta: Math.PI / 4, dephasing: 0 };
const close = (a, b, tol = 1e-9) =>
  assert.ok(Math.abs(a - b) < tol, `${a} not within ${tol} of ${b}`);

test('pure Bell state has four entries of one half', () => {
  const rho = densityMatrix(BELL);
  close(rho[0][0], 0.5);
  close(rho[3][3], 0.5);
  close(rho[0][3], 0.5);
  close(rho[3][0], 0.5);
  close(rho[1][1], 0);
  close(rho[2][2], 0);
});

test('trace is one across the parameter space', () => {
  for (const theta of [0, 0.3, Math.PI / 4, 1.2, Math.PI / 2]) {
    for (const dephasing of [0, 0.25, 0.5, 1]) {
      const rho = densityMatrix({ psi: false, negative: false, theta, dephasing });
      const trace = rho[0][0] + rho[1][1] + rho[2][2] + rho[3][3];
      close(trace, 1);
    }
  }
});

test('negative phase flips only the off-diagonal sign', () => {
  const plus = densityMatrix(BELL);
  const minus = densityMatrix({ ...BELL, negative: true });
  close(minus[0][0], plus[0][0]);
  close(minus[3][3], plus[3][3]);
  close(minus[0][3], -plus[0][3]);
});

test('psi family populates the inner block', () => {
  const rho = densityMatrix({ ...BELL, psi: true });
  close(rho[1][1], 0.5);
  close(rho[2][2], 0.5);
  close(rho[0][0], 0);
  close(rho[3][3], 0);
});

test('dephasing leaves the diagonal untouched', () => {
  const clean = densityMatrix(BELL);
  const dirty = densityMatrix({ ...BELL, dephasing: 0.5 });
  close(dirty[0][0], clean[0][0]);
  close(dirty[3][3], clean[3][3]);
  close(dirty[0][3], 0.25);
});

test('full dephasing destroys entanglement but keeps populations', () => {
  const rho = densityMatrix({ ...BELL, dephasing: 1 });
  close(concurrence(rho), 0);
  close(rho[0][0], 0.5);
  close(purity(rho), 0.5);
});

test('maximally entangled state has concurrence one and purity one', () => {
  const rho = densityMatrix(BELL);
  close(concurrence(rho), 1);
  close(purity(rho), 1);
});

test('product state is pure but unentangled', () => {
  for (const theta of [0, Math.PI / 2]) {
    const rho = densityMatrix({ ...BELL, theta });
    close(concurrence(rho), 0);
    close(purity(rho), 1);
  }
});

test('partial imbalance gives intermediate concurrence at full purity', () => {
  const rho = densityMatrix({ ...BELL, theta: Math.PI / 8 });
  const c = concurrence(rho);
  assert.ok(c > 0 && c < 1, `concurrence ${c} should be strictly between 0 and 1`);
  close(purity(rho), 1);
});

test('purity never exceeds one', () => {
  for (let t = 0; t <= 90; t += 5) {
    for (let p = 0; p <= 100; p += 10) {
      const rho = densityMatrix({
        psi: false,
        negative: false,
        theta: (t * Math.PI) / 180,
        dephasing: p / 100,
      });
      assert.ok(purity(rho) <= 1 + 1e-9, `purity exceeded one at theta=${t}, p=${p}`);
    }
  }
});

test('matrix is symmetric', () => {
  const rho = densityMatrix({ psi: true, negative: true, theta: 0.7, dephasing: 0.3 });
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      close(rho[r][c], rho[c][r]);
    }
  }
});

test('input bits map to the four Bell states bijectively', () => {
  const seen = new Set();
  for (const q0 of [0, 1]) {
    for (const q1 of [0, 1]) {
      const bell = bellFromInput(q0, q1);
      seen.add(stateLabel(bell));
      assert.deepEqual(inputFromBell(bell), { q0, q1 });
    }
  }
  assert.equal(seen.size, 4);
});
