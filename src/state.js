const BASIS = ['00', '01', '10', '11'];

function zeros() {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

/**
 * Build the density matrix for a generalised Bell-type state.
 *
 * The pure state is  cos(theta)|aa> + sign * sin(theta)|bb'>  where the pair of
 * populated basis states is chosen by `psi`:
 *   psi = false -> {00, 11}   (Phi family, correlated)
 *   psi = true  -> {01, 10}   (Psi family, anticorrelated)
 * and `negative` sets the relative sign.
 *
 * Dephasing with probability p damps the off-diagonal (coherence) terms by
 * a factor of (1 - p) and leaves the diagonal (populations) untouched.
 *
 * @param {object} opts
 * @param {boolean} opts.psi        Psi family if true, Phi family if false.
 * @param {boolean} opts.negative   Relative phase is minus if true.
 * @param {number}  opts.theta      Amplitude balance in radians, 0 to PI/2.
 * @param {number}  opts.dephasing  Dephasing probability, 0 to 1.
 * @returns {number[][]} 4x4 real symmetric density matrix.
 */
export function densityMatrix({ psi, negative, theta, dephasing }) {
  const a = Math.cos(theta);
  const b = Math.sin(theta);
  const i = psi ? 1 : 0;
  const j = psi ? 2 : 3;

  const rho = zeros();
  rho[i][i] = a * a;
  rho[j][j] = b * b;

  const coherence = a * b * (1 - dephasing) * (negative ? -1 : 1);
  rho[i][j] = coherence;
  rho[j][i] = coherence;

  return rho;
}

/**
 * Concurrence, an entanglement measure running 0 (separable) to 1 (maximal).
 * For this two-populated-state family it reduces to twice the coherence.
 */
export function concurrence(rho) {
  const i = rho[0][0] + rho[3][3] > rho[1][1] + rho[2][2] ? 0 : 1;
  const j = i === 0 ? 3 : 2;
  return 2 * Math.abs(rho[i][j]);
}

/** Purity, Tr(rho^2). 1 for a pure state, 0.25 for maximally mixed. */
export function purity(rho) {
  let sum = 0;
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      sum += rho[r][c] * rho[c][r];
    }
  }
  return sum;
}

/** Diagonal of rho: the probability of each measurement outcome. */
export function outcomeProbabilities(rho) {
  return BASIS.map((label, k) => ({ label, probability: rho[k][k] }));
}

/**
 * Map the two input bits of the H + CNOT circuit to a Bell state.
 * q0 (control, receives H) sets the phase; q1 (target) sets the family.
 */
export function bellFromInput(q0, q1) {
  return { negative: q0 === 1, psi: q1 === 1 };
}

/** Inverse of bellFromInput. */
export function inputFromBell({ negative, psi }) {
  return { q0: negative ? 1 : 0, q1: psi ? 1 : 0 };
}

/** Ket label such as |Phi+>, using Unicode. */
export function stateLabel({ psi, negative }) {
  return `|${psi ? 'Ψ' : 'Φ'}${negative ? '⁻' : '⁺'}⟩`;
}

/** Reduced 2×2 density matrix for qubit 0 (trace out qubit 1). */
export function partialTrace0(rho) {
  return [
    [rho[0][0] + rho[1][1], rho[0][2] + rho[1][3]],
    [rho[2][0] + rho[3][1], rho[2][2] + rho[3][3]],
  ];
}

/** Reduced 2×2 density matrix for qubit 1 (trace out qubit 0). */
export function partialTrace1(rho) {
  return [
    [rho[0][0] + rho[2][2], rho[0][1] + rho[2][3]],
    [rho[1][0] + rho[3][2], rho[1][1] + rho[3][3]],
  ];
}

/**
 * Bloch vector [rx, ry, rz] from a 2×2 density matrix.
 * rx = Tr(ρ σx), ry = Tr(ρ σy), rz = Tr(ρ σz).
 * For real-valued matrices ry is always 0.
 */
export function blochVector(rho2) {
  return [
    rho2[0][1] + rho2[1][0],  // rx
    0,                          // ry (zero for real ρ)
    rho2[0][0] - rho2[1][1],  // rz
  ];
}

export { BASIS };
