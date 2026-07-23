# Bell state density matrix explorer

An interactive visualisation of the two-qubit density matrix for Bell states,
with controls for dephasing and amplitude balance.

No build step, no dependencies. Plain ES modules served as static files.

## Running locally

```bash
npm run serve
```

Then open <http://localhost:8000>. Any static server works; the ES module
imports mean opening `index.html` directly from the filesystem will not.

## Tests

```bash
npm test
```

Twelve tests covering the physics in `src/state.js`: trace preservation,
symmetry, the effect of dephasing on populations versus coherences, and the
bijection between input bits and Bell states.

## Deploying to GitHub Pages

1. Push to a GitHub repository with `main` as the default branch.
2. In the repository, go to Settings → Pages.
3. Under "Build and deployment", set Source to **GitHub Actions**.
4. Push to `main`. The workflow in `.github/workflows/deploy.yml` runs the
   tests, then publishes the repository root.

The site appears at `https://<user>.github.io/<repo>/`. Because every path in
`index.html` is relative, it works from a subdirectory without configuration.

## Circuit diagram

The circuit diagram panel shows the two-gate sequence that produces each Bell
state from a pair of classical input bits.

```
q0: |q0⟩ ──[H]──●──
                 |    ──  |Bell state⟩
q1: |q1⟩ ───────⊕──
```

**Hadamard gate (H)** is applied to q0. It takes a basis state and places it
into an equal superposition:

```
|0⟩  →  (|0⟩ + |1⟩) / √2
|1⟩  →  (|0⟩ − |1⟩) / √2
```

After H, q0 is genuinely in both states simultaneously — not a classical
coin flip but a coherent superposition that can interfere. The minus sign in
the second line is what produces the phase difference between Φ⁺/Φ⁻ and Ψ⁺/Ψ⁻.

**CNOT gate** uses q0 as the control (●) and q1 as the target (⊕). It flips
q1 if and only if q0 is \|1⟩. When the control is already in superposition,
this conditional flip correlates the two qubits in a way that cannot be
described by any product state — that correlation is entanglement.

The input ket labels update as you toggle the input buttons, and the output
label updates to the corresponding Bell state. The circuit itself never
changes; only the input changes.

## How to read the matrix

Rows and columns are ordered 00, 01, 10, 11 in both directions.

Fill darkness encodes magnitude. A knocked-out horizontal bar marks a negative
entry. Blank cells are exactly zero.

Diagonal entries are the probabilities of each measurement outcome in the
computational basis. Off-diagonal entries are coherences: the phase relationship
between the two branches of the superposition. A classical mixture has the same
diagonal but no off-diagonal terms, which is why dephasing leaves measurement
statistics unchanged while destroying entanglement.

## Controls

The four toggles sit on two underlying bits, so `q0` and `phase` are the same
switch, as are `q1` and `Φ/Ψ family`. This mirrors the H + CNOT circuit: the
control qubit's input bit sets the relative phase, the target qubit's sets
whether the outcomes are correlated or anticorrelated.

| Input | Output |
| --- | --- |
| \|00⟩ | \|Φ⁺⟩ |
| \|01⟩ | \|Ψ⁺⟩ |
| \|10⟩ | \|Φ⁻⟩ |
| \|11⟩ | \|Ψ⁻⟩ |

**Dephasing** damps the off-diagonal terms by a factor of `1 - p` and leaves the
diagonal alone. At `p = 1` the state is a classical correlated mixture.

**Balance θ** sets the state to `cos θ |aa⟩ + sin θ |bb⟩`. At 45° the amplitudes
are equal and the state is maximally entangled. At 0° or 90° it collapses to a
product state — still pure, but with nothing to entangle.

## Bloch spheres

A Bloch sphere represents the state of a single qubit as a point in or on a
unit sphere. Pure states sit on the surface; mixed states sit inside; the
maximally mixed state — equal probability of 0 and 1, no phase information —
sits at the centre.

The poles have a direct physical meaning:

| Position | State |
| --- | --- |
| North pole | \|0⟩ with certainty |
| South pole | \|1⟩ with certainty |
| Equator | equal superposition, phase varies around the equator |
| Centre | maximally mixed — no information survives |

The two panels show q0 and q1 individually. Because the full state is a
two-qubit state, each panel shows the **reduced density matrix** — the result
of tracing out (averaging over) the other qubit. This is the quantum analogue
of looking at one variable in a joint probability distribution while ignoring
the other.

**How the controls move the vectors**

*Balance θ* is the most direct control. The Bloch vector length is
`|cos 2θ|`, so it reaches the pole at θ = 0° or 90° and collapses to the
centre at θ = 45°. That collapse is the most important thing the spheres show:
at maximum entanglement the global two-qubit state is perfectly pure, yet each
individual qubit is completely random. All the information lives in the
correlations between the qubits, not in either qubit alone. Entanglement made
visible.

*Φ / Ψ family toggle* (q1 button) controls whether the two qubits are
correlated (both 00 or both 11 in the Φ family) or anti-correlated (01 or 10
in the Ψ family). Switching families flips q1's Bloch vector to the opposite
pole while leaving q0 unchanged.

*Phase toggle* (q0 button or phase button) sets the relative sign between the
two superposition branches. It does not appear in either Bloch sphere at all —
the partial trace that produces the individual qubit state washes out any
global phase. Phase is a two-qubit property, invisible to either qubit alone.

*Dephasing* also leaves the Bloch vectors stationary. Dephasing damps the
off-diagonal terms of the two-qubit density matrix, but the individual qubit
populations (the diagonal terms) are untouched, and it is the populations
alone that determine the Bloch vector under partial trace. You can watch
entanglement decay in the density matrix — the off-diagonal cells fading —
while the Bloch spheres show nothing happening. That contrast is the
difference between coherence (a property of the joint state) and the marginal
state of each qubit.

**Connecting Bloch spheres to the matrix**

The density matrix diagonal gives the probability of each two-qubit outcome:
p(00), p(01), p(10), p(11). The Bloch vector z-component for q0 is
`p(0●) − p(1●)`, the difference between the probability of measuring q0 as 0
versus 1 regardless of q1. At θ = 45° those probabilities are equal, the
difference is zero, and the vector vanishes. At θ = 0° all weight is on \|00⟩
or \|01⟩, so p(0●) = 1, and the q0 vector reaches the north pole. The spheres
are a geometric summary of information already present in the diagonal of the
density matrix.

## Readouts

**Concurrence** measures entanglement from 0 (separable) to 1 (maximal). For
this family of states it is exactly twice the magnitude of the coherence.

**Purity** is `Tr(ρ²)`, which is 1 for a pure state and 0.5 for the fully
dephased mixture here. The two quantities are independent: an imbalanced pure
state has purity 1 and concurrence below 1.

## Structure

```
index.html              markup and controls
src/state.js            density matrix, concurrence, purity, partial trace — no DOM
src/matrix-grid.js      density matrix SVG rendering
src/bloch-sphere.js     individual qubit Bloch sphere rendering
src/circuit-diagram.js  H + CNOT circuit diagram
src/app.js              control wiring
src/styles.css          light and dark themes
test/state.test.js      physics tests
```

`src/state.js` has no DOM dependency, so it can be imported in Node, tested, or
reused elsewhere.

## Extending

Some directions the current structure supports:

- Amplitude damping alongside dephasing (relaxation toward \|00⟩ rather than
  loss of coherence). This moves the diagonal, unlike dephasing, and would
  visibly displace the Bloch vectors toward the south pole.
- Complex phases, requiring a second grid for the imaginary part or a hue
  channel in each cell. Complex off-diagonal entries would also produce
  non-zero x and y Bloch vector components, making the spheres more dynamic.
- Measurement in a rotated basis, showing the interference that distinguishes a
  superposition from a mixture.

## License

MIT
