# Benchmark

How well does jscd find clones, compared with [jscpd](https://github.com/kucherenko/jscpd), the most widely used JavaScript copy-paste detector? Results: [results/results.md](results/results.md). Experiment with code embeddings: [results/embeddings.md](results/embeddings.md).

```bash
npm run bench                  # ~5 s once the corpus is cached
npm run bench -- --rebuild     # regenerate the dataset
npm run bench:embeddings       # also run the embeddings experiment (downloads ~160 MB)
```

## Method

There is no standard clone benchmark for JavaScript or React; BigCloneBench, the usual reference, is Java. So this one follows the **mutation-based approach** of Roy & Cordy (2009): take real code, apply edits whose clone type is known by construction, and check which detectors find the pairs.

**1. Corpus.** Real, MIT-licensed code at pinned versions, fetched with `npm pack`. It is only ever parsed, never executed.

| Package             | Version | Used as            |
| ------------------- | ------- | ------------------ |
| `lodash-es`         | 4.17.21 | plain JavaScript   |
| `reactstrap`        | 9.2.3   | React (JSX source) |
| `semantic-ui-react` | 2.1.5   | React (JSX source) |

**2. Originals.** Top-level functions and classes with 60–600 normalized tokens (above jscd's 50-token minimum, so a Type-3 deletion does not push a unit out of scope). React originals must contain JSX. Exact duplicates are collapsed. Then up to 100 per domain are sampled with a fixed seed, **after removing every original that any tool flags as a clone of another original**. Without that step, a tool would be penalized for finding real clones in the corpus. The filter applies to all tools alike.

**3. Mutants.** Each original gets three mutants ([mutate.ts](mutate.ts)):

| Type   | Operators                                                                                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type-1 | Re-printed with different layout, quotes and indentation; comments added on ~20% of statements. Checked by construction: the mutant's AST must equal the original's. |
| Type-2 | Type-1 + ~80% of bindings renamed consistently (through Babel's scope tracker) + ~50% of literal values changed.                                                     |
| Type-3 | Type-2 + 1–3 statement-level edits: insert a statement, delete a statement, swap an operator, or add a call argument.                                                |

**4. Type-4.** No mutation can produce "same behavior, different code", so 16 pairs were written by hand ([type4/](type4)): loop vs. `reduce`, recursion vs. stack, class component vs. hooks, `if` chain vs. lookup table, and so on.

**5. Scoring.** Each unit is its own file, so a detection counts at file level: a tool finds the `original ↔ mutant` pair if it reports any clone between the two files. Recall is per type. On this dataset, precision counts every reported pair across two different families as a false positive.

**6. Precision on real code.** Mutation benchmarks measure recall well and precision poorly, because a dataset of planted clones has few chances for false alarms. So jscd also runs on the **unmodified** corpus, and a seeded sample of what it reports is labeled by inspection: at most one pair per clone class, with Type-3 spread over similarity bands. The full sample, with code, is in [results/precision-sample.md](results/precision-sample.md), and the labels are in [precision-labels.json](precision-labels.json), so every label can be audited.

## Tool configurations

| Name               | Command                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| jscd (defaults)    | `detectClones(files)`: threshold 0.8, 50 tokens                                                                           |
| jscpd (defaults)   | `jscpd <dir>`                                                                                                             |
| jscpd (structural) | `jscpd <dir> --ignore-identifiers --ignore-literals --similarity 0.8`: jscpd's own renamed-clone and AST similarity modes |

Both tools' Type-3 scores are also swept from 0.6 to 0.9, because they measure different things (token LCS vs. shared subtrees) and a single cut-off could favor one.

## Threats to validity

- **Type-1 and Type-2 recall are expected to be 100% for jscd.** The mutations are exactly what its normalizer erases. These rows show that the normalizer is correct, not that the approach is clever. The informative rows are Type-3, Type-4, the threshold sweep, and precision on real code.
- **The benchmark was used during development.** It exposed a real bug: renaming a destructured prop (`{ title }` → `{ title: heading }`) made React components look different. Fixing it (property names got their own renaming namespace) raised React Type-2 recall from 21% to 100%. The fix is a general correctness change, but the numbers are post-fix.
- **The candidate search was tuned outside the benchmark.** The benchmark is too small to stress it. Shingle size and posting cap were tuned against an exhaustive run on grafana (39,000 units), keeping 99.9% of its Type-3 pairs. Benchmark results did not change.
- **Mutants are synthetic.** Real copy-paste edits are messier. Real-code precision partly covers this gap; real-code recall is not measured.
- **Type-4 is small and hand-written:** 16 pairs, written by the same author as the tool.
- **Precision on real code covers jscd only,** with 29 labeled pairs. The table shows 95% Wilson lower bounds for that reason.
- **One corpus.** Three libraries; application code may behave differently.
