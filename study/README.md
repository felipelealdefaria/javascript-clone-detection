# How much code do JavaScript and React projects clone?

This study revisits the question of my 2021 thesis, _Estudo empírico sobre duplicação de código em aplicações JavaScript_ ([UTFPR repository](http://repositorio.utfpr.edu.br/jspui/handle/1/30141)), with the v1 detector. It has two parts:

1. **Replication.** The thesis's three projects at their 2021 state, compared with the thesis's own results.
2. **React applications.** Twelve well-known open-source React apps: how much of their code is cloned, of which type, and in which kinds of code.

Full tables: [results/results.md](results/results.md). Every labeled pair, linked to its code: [results/sample.md](results/sample.md).

```bash
npm run study              # fetches each project once (sparse, shallow), then analyzes all
npm run study -- grafana   # one project
```

## Findings

**1. The minimum size explains most of the precision gap between v0.6 and v1.** Run without a size minimum, as v0.6 was, v1's precision is close to v0.6's. The 50-token minimum is what lifts it:

|                                        | Real clones among reported pairs | 95% lower bound |
| -------------------------------------- | -------------------------------: | --------------: |
| v0.6 (thesis, every candidate labeled) |                  219/320 (68.4%) |             63% |
| v1, no size minimum (36 sampled)       |                      23/36 (64%) |             48% |
| v1, defaults (27 sampled)              |                      26/27 (96%) |             82% |

Without a minimum, the false positives are what the thesis described: one-line callbacks, getters and two-field constructors that share a shape by coincidence. The thesis had its own hypothesis: stop normalizing function-call names. That raised freeCodeCamp's precision from 45% to 80%. A size minimum gets a similar effect differently, by never comparing units too small to carry a signal.

**2. In React apps, a median of 3.8% of production code sits in a cloned function, method or class** (range 1.7–13.2%, pooled 4.5%), across 12 apps, 47,000 files and 6.1 million lines. That is below the 7–23% the thesis cites for typical systems (Roy & Cordy, 2008). The definitions differ, though: here a clone must be a whole function, method or class of at least 50 tokens, at 0.8 similarity.

**3. Test code is cloned about six times as often as production code:** median 24.9% of test lines, pooled 26.8%. About 70% of all clone classes are in tests, mostly copy-adapted test cases. It is the clearest pattern in the data, and the reason `--ignore "**/*.test.*"` is a sensible default for teams that accept duplication in tests.

**4. Most production clones are not components.** Of the 2,845 production clone classes, 21.5% are components, 4.9% hooks and 73.7% other code: API service methods, Redux thunks, event handlers, utilities. The thesis proposal focused on duplicated React components, which the existing tools missed. In these apps they are a minority of production clones.

**5. 83% of clone classes are Type-3:** copies that were edited after pasting. Exact copies are 3.8%, renamed copies 12.9%. The thesis also found mostly Type-3 clones. Detectors that only find exact or renamed copies miss most real duplication.

**6. Precision on application code:** 31 of 36 sampled pairs are real clones (86%; ≥ 71% at 95% confidence). The five false positives are test or story code with coincidentally similar structure, plus two React idioms: constructors that bind handlers, and a tab list rendered next to its tab panels.

### Patterns seen while labeling

- **Mirrored pairs:** next/previous, add/subtract, allow/decline, left/right rotations. Each is written twice, with one operator or direction changed.
- **Per-variant copies:** setup docs per framework (Sentry), notification components per type (Mastodon), the same `useEffect` in two modals (Plane).
- **Request templates:** a Redux thunk or service method copied for each endpoint, with request, success and failure steps.
- **Copy-adapted tests:** the largest group by far.

## Method

**Projects** ([projects.ts](projects.ts)) are pinned to a commit and fetched with a sparse, shallow `git` checkout of the scanned folders only. The code is parsed, never installed or run.

| Part        | Projects                                                                                                                            | Commit                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Replication | freeCodeCamp (`api-server/src`), trekhleb/javascript-algorithms (`src`), TheAlgorithms/JavaScript                                   | Last commit before 2021-10-01, the thesis's analysis period |
| React apps  | excalidraw, outline, mastodon, element-web, jitsi-meet, twenty, plane, bluesky social-app, Signal-Desktop, grafana, sentry, posthog | 2026-10-28                                                  |

**Detection:** jscd defaults (threshold 0.8, at least 50 tokens). Generated, vendored, locale and minified files are excluded. The replication also excludes test files, as v0.6 only compared top-level functions and never saw test callbacks.

**Cloned code** is the share of non-blank lines inside a unit that belongs to a clone class. Files are split by path into tests (`__tests__/`, `test/`, `test-*/`, `*.test.*`, `*_test.*`, …), stories (`*.stories.*`) and production. Unit kinds are heuristics: hooks start with `use`, and components are capitalized units in `.jsx`/`.tsx` files.

**jscpd** (5.4.2, defaults) also runs on each app, for reference. Its percentage counts duplicated lines in token windows, so it is not the same measure.

**Precision** is from a seeded sample with at most one pair per clone class: 12 per replication project and setting, 3 per app. Pairs are labeled with the thesis's rubric. A pair is a clone when both units are copies with the same intent, so a fix to one would likely be needed in the other; that includes copies that differ only by an operator, as in the thesis's Figure 25. Coincidental similarity between units with different purposes is not a clone, as in the thesis's Figure 22. Labels and notes: [labels.json](labels.json).

## Threats to validity

- **The labels are AI-assisted** and were made by the same project that built the tool. The thesis labels were made by an invited developer and reviewed by the author and advisor. Every pair links to its code so the labels can be audited.
- **Samples are small.** The table shows 95% Wilson lower bounds for that reason.
- **The thesis labeled every candidate pair; this study samples one pair per clone class.** Classes with many copies weigh less here.
- **The v0.6 and v1 numbers come from the same code but different unit definitions.** v1 also compares methods and nested functions. Counts are not directly comparable; precision is.
- **Twelve apps, chosen for popularity.** They are not a random sample of React code, and the kind heuristics will misclassify some units.
