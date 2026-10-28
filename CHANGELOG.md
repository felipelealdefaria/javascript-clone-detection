# Changelog

## 1.0.0 — 2026

A rewrite. The 2021 idea (normalize syntax trees, then compare) stays; everything else is new.

### Added

- JSX, TypeScript and TSX support (Babel parser with error recovery).
- Functions, methods and classes as units, including nested ones.
- Type-1, Type-2 and Type-3 classification, with clone classes.
- `jscd` CLI with text, JSON and SARIF reports, `--ignore` and `--fail`.
- Node API (`detectClonesInPaths`) and a browser-safe core (`javascript-clone-detection/core`).
- GitHub Action for code scanning.
- Browser playground.
- Benchmark against jscpd, with real-code precision and an embeddings experiment.

### Changed

- Consistent renaming, with a separate namespace for property names (v0.6 renamed every name to one placeholder).
- Scoring by bit-parallel LCS over normalized tokens, behind a candidate index (v0.6 ran Levenshtein on regenerated code for every pair).
- Deterministic output; nothing is written to the scanned directory.

### Removed

- The `clone-analisys` binary and the `__base-functions.js`, `__cleanned-functions.js`, `__similarity-matrix.csv` and `__coefficient-by-functions/` outputs.

## 0.6.0 — 2021-09-12

Last version of the thesis prototype. See [v0.6.0](https://github.com/felipelealdefaria/javascript-clone-detection/tree/e46ca101352ca0f8dd1e5317982fa9da3a629cab).
