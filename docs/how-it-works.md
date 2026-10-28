# How it works

The detail behind the summary in the [README](../README.md#how-it-works): how each step runs, why it was built that way, and what it costs.

## Pipeline

1. **Parse.** Every file is parsed with `@babel/parser`, with error recovery on. `.js` and `.jsx` files get the JSX plugin, `.ts` files the TypeScript plugin, and `.tsx` files both. A file that cannot be parsed is reported and skipped; the run goes on.
2. **Extract units.** Every function, method and class becomes a unit, including nested ones. Each unit gets a best-effort name: its declaration, the variable it is assigned to, its property or method key, or `<items.map callback>` for an anonymous callback.
3. **Tokenize each unit twice.** A walk over the unit's syntax tree emits two parallel token streams:
   - **Raw** keeps identifier names and literal values. Equal raw streams are Type-1 clones.
   - **Normalized** replaces identifiers by their order of first appearance (`Id#0`, `Id#1`, …), property names by theirs in a separate namespace (`Prop#0`, …), and literals by their kind. Equal normalized streams are Type-2 clones.

   In both streams, every function form (declaration, expression, arrow, method) prints the same way, an arrow's expression body counts as `{ return … }`, the unit's own name is left out, type annotations are dropped, and whitespace-only JSX text is ignored. Blocks get a closing marker, so `if (a) { b } c` and `if (a) { b c }` stay different.
4. **Type-1 and Type-2** are found by grouping units on their raw and normalized streams.
5. **Type-3** pairs are found without comparing every pair:
   - Units with the same normalized stream compare identically to everything else, so only one representative per stream is compared, and matches are expanded to the whole group.
   - Representatives are indexed by **8-token shingles**. Units under 64 tokens are also indexed by 3-token shingles, because short near-copies may not share an 8-token run. Shingles found in more than 1,000 units (boilerplate) are skipped.
   - Units are **sorted by length**. A pair can only reach similarity `t` if `2·min(n, m) / (n + m) ≥ t`, so each unit walks only the partners whose length can still qualify.
   - A candidate must then pass an **upper bound from token counts** (the multiset intersection), computed in O(n + m).
   - Survivors get the exact score, **2·LCS / (|a| + |b|)** over normalized tokens. The LCS is bit-parallel (Allison & Dix 1986; Hyyrö 2004): each step handles 32 cells of the dynamic-programming table, and a unit's bit masks are built once and reused across all its candidates.
6. **Report.** A pair whose enclosing units are also a reported pair is dropped: a clone inside a clone is not news. Pairs are grouped into clone classes (connected components). Text and SARIF reports list classes, and JSON has every pair. SARIF fingerprints hash each unit's normalized shape, so alerts survive unrelated edits.

## Design decisions

| Decision | Alternative | Why |
|---|---|---|
| Compare token streams from the syntax tree | Compare source text (v0.6) | Text similarity rewards similar length, not similar structure. The 2021 version scored an `if/else` vs. `switch` pair above a real edited copy. |
| Consistent renaming (`a + b` ≠ `b + a`) | Rename every name to one placeholder (v0.6) | Blind renaming makes unrelated functions look identical. |
| Property names get their own namespace | One namespace for all names | Renaming a destructured prop (`{ title }` → `{ title: heading }`) must not change the shape. The benchmark caught this. |
| Units are functions, methods and classes | Fixed-size token windows (jscpd) | Reports name what was copied. It misses copies smaller than a function. |
| Default 50-token minimum | 30, or none (v0.6) | On a real shadcn/ui project, half the reported units were one-line wrapper components. On the thesis projects, it lifted sampled precision from 64% to 96%. |
| Default threshold 0.8 | Lower | Precision falls from 88% at 0.7 to 44% at 0.6 ([sweep](../benchmark/results/results.md#type-3-threshold-sweep)). |
| 8-token shingles and a length window | 3-token shingles only | Tuned against an exhaustive run on grafana: 99.9% of its Type-3 pairs at about 1/13 of the cost, with no change on the benchmark. |
| One unit's AST is kept only when asked (`keepNodes`) | Keep every AST | Lets file ASTs be garbage-collected after tokenizing: peak memory on a 1,600-file repo fell from 900 MB to 370 MB. |

## Performance

On an M5 Pro, with defaults:

| Codebase | Files | Lines | Units | Time |
|---|---:|---:|---:|---:|
| grafana `public/app` | 7,164 | 1.1 million | 39,276 | 12 s |
| sentry `static/app` | 8,703 | 1.3 million | 33,648 | 10 s |
| All 12 apps of the [study](../study/README.md) | 47,044 | 6.1 million | 161,104 | 42 s |

Before the candidate search was tuned, grafana took 54 s, 88% of it spent walking shingle posting lists.
