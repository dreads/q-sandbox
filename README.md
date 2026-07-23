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

## Readouts

**Concurrence** measures entanglement from 0 (separable) to 1 (maximal). For
this family of states it is exactly twice the magnitude of the coherence.

**Purity** is `Tr(ρ²)`, which is 1 for a pure state and 0.5 for the fully
dephased mixture here. The two quantities are independent: an imbalanced pure
state has purity 1 and concurrence below 1.

## Structure

```
index.html            markup and controls
src/state.js          density matrix, concurrence, purity — no DOM
src/matrix-grid.js    SVG rendering
src/app.js            control wiring
src/styles.css        light and dark themes
test/state.test.js    physics tests
```

`src/state.js` has no DOM dependency, so it can be imported in Node, tested, or
reused elsewhere.

## Extending

Some directions the current structure supports:

- Amplitude damping alongside dephasing (relaxation toward \|00⟩ rather than
  loss of coherence). This moves the diagonal, unlike dephasing.
- Complex phases, requiring a second grid for the imaginary part or a phase
  channel in each cell.
- A circuit diagram above the matrix, showing the gates that produce the
  selected state.
- Measurement in a rotated basis, showing the interference that distinguishes a
  superposition from a mixture.

## License

MIT
