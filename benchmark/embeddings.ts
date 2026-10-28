/**
 * Experiment: structural (jscd) vs. learned (code embeddings) clone detection.
 *
 * Every dataset file is embedded with a code embedding model; a pair is a clone when the cosine
 * similarity of its embeddings clears a threshold. The threshold is tuned for F1 on half of the
 * families and evaluated on the other half, so the embeddings are not scored on the data that
 * calibrated them. jscd needs no calibration and is scored on the same test half.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { env, pipeline } from '@huggingface/transformers'
import type { Dataset } from './build.js'
import { DATASET_DIR } from './build.js'
import { CACHE_DIR } from './corpus.js'
import { Rng } from './rng.js'
import { pairKey, runJscd } from './tools.js'

export const MODEL = 'jinaai/jina-embeddings-v2-base-code'

interface Group {
  id: string
  kind: 'family' | 't4'
  files: string[]
  /** Labeled pairs to score recall on, with their clone type. */
  targets: { a: string; b: string; type: 't1' | 't2' | 't3' | 't4' }[]
}

function groups(dataset: Dataset): Group[] {
  return [
    ...dataset.families.map((f) => ({
      id: f.id,
      kind: 'family' as const,
      files: Object.values(f.files),
      targets: (['t1', 't2', 't3'] as const).map((type) => ({
        a: f.files.original,
        b: f.files[type],
        type,
      })),
    })),
    ...dataset.type4.map((p) => ({
      id: p.id,
      kind: 't4' as const,
      files: [p.a, p.b],
      targets: [{ a: p.a, b: p.b, type: 't4' as const }],
    })),
  ]
}

async function embed(files: string[]): Promise<Map<string, Float32Array>> {
  env.cacheDir = path.join(CACHE_DIR, 'models')
  const extractor = await pipeline('feature-extraction', MODEL, { dtype: 'q8' })
  const vectors = new Map<string, Float32Array>()
  const batch = 8
  for (let i = 0; i < files.length; i += batch) {
    const chunk = files.slice(i, i + batch)
    const texts = chunk.map((f) => readFileSync(path.join(DATASET_DIR, f), 'utf8'))
    const output = await extractor(texts, { pooling: 'mean', normalize: true })
    const rows = output.tolist() as number[][]
    chunk.forEach((f, j) => {
      vectors.set(f, Float32Array.from(rows[j] as number[]))
    })
    process.stdout.write(`\rEmbedding ${Math.min(i + batch, files.length)}/${files.length}`)
  }
  process.stdout.write('\n')
  return vectors
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += (a[i] as number) * (b[i] as number)
  return dot
}

interface Scored {
  key: string
  similarity: number
  positive: boolean
}

function scorePairs(subset: Group[], vectors: Map<string, Float32Array>): Scored[] {
  const groupOf = new Map<string, string>()
  for (const g of subset) for (const f of g.files) groupOf.set(f, g.id)
  const files = [...groupOf.keys()]
  const out: Scored[] = []
  for (let i = 0; i < files.length; i++) {
    for (let j = i + 1; j < files.length; j++) {
      const a = files[i] as string
      const b = files[j] as string
      out.push({
        key: pairKey(a, b),
        similarity: cosine(vectors.get(a) as Float32Array, vectors.get(b) as Float32Array),
        positive: groupOf.get(a) === groupOf.get(b),
      })
    }
  }
  return out
}

/** Threshold with the best F1 on the calibration pairs. */
function calibrate(pairs: Scored[]): number {
  const sorted = [...pairs].sort((x, y) => y.similarity - x.similarity)
  const positives = pairs.filter((p) => p.positive).length
  let tp = 0
  let best = { f1: -1, threshold: 1 }
  sorted.forEach((p, i) => {
    if (p.positive) tp++
    const precision = tp / (i + 1)
    const recall = tp / positives
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
    if (f1 > best.f1) best = { f1, threshold: p.similarity }
  })
  return best.threshold
}

interface Row {
  method: string
  recall: Record<'t1' | 't2' | 't3' | 't4', { hits: number; total: number }>
  precision: { tp: number; fp: number }
}

function evaluate(
  method: string,
  detected: Set<string>,
  test: Group[],
  positives: Set<string>,
): Row {
  const recall: Row['recall'] = {
    t1: { hits: 0, total: 0 },
    t2: { hits: 0, total: 0 },
    t3: { hits: 0, total: 0 },
    t4: { hits: 0, total: 0 },
  }
  for (const g of test) {
    for (const t of g.targets) {
      recall[t.type].total++
      if (detected.has(pairKey(t.a, t.b))) recall[t.type].hits++
    }
  }
  let tp = 0
  let fp = 0
  for (const key of detected) {
    if (positives.has(key)) tp++
    else fp++
  }
  return { method, recall, precision: { tp, fp } }
}

export async function embeddingsExperiment(
  dataset: Dataset,
): Promise<{ json: unknown; markdown: string }> {
  const all = groups(dataset)
  const rng = new Rng(99)
  const shuffled = rng.shuffle(all)
  const calibration = shuffled.filter((_, i) => i % 2 === 0)
  const test = shuffled.filter((_, i) => i % 2 === 1)

  const started = performance.now()
  const vectors = await embed(all.flatMap((g) => g.files))
  const embedMs = performance.now() - started

  const threshold = calibrate(scorePairs(calibration, vectors))
  const testPairs = scorePairs(test, vectors)
  const testFiles = new Set(test.flatMap((g) => g.files))
  const positives = new Set(testPairs.filter((p) => p.positive).map((p) => p.key))

  const embeddings = new Set(testPairs.filter((p) => p.similarity >= threshold).map((p) => p.key))
  const jscd = new Set(
    [...runJscd(DATASET_DIR).pairs].filter((key) => key.split('|').every((f) => testFiles.has(f))),
  )
  const rows = [
    evaluate('jscd (defaults)', jscd, test, positives),
    evaluate('Embeddings', embeddings, test, positives),
    evaluate('jscd ∪ embeddings', new Set([...jscd, ...embeddings]), test, positives),
  ]

  const pct = (r: { hits: number; total: number }) =>
    r.total === 0 ? '–' : `${((r.hits / r.total) * 100).toFixed(1)}%`
  const prec = (p: Row['precision']) =>
    p.tp + p.fp === 0 ? '–' : `${((p.tp / (p.tp + p.fp)) * 100).toFixed(1)}%`
  const t4 = (r: Row) => `${r.recall.t4.hits}/${r.recall.t4.total}`

  const markdown = [
    '## Experiment: structural vs. learned detection',
    '',
    `Each file embedded with [\`${MODEL}\`](https://huggingface.co/${MODEL}) (8-bit quantized, mean pooling) in ${(embedMs / 1000).toFixed(0)} s. Cosine threshold tuned for F1 on a calibration half of the groups: **${threshold.toFixed(3)}**. Scores below are on the other half (${test.length} groups, ${testPairs.length} file pairs).`,
    '',
    '| Method | Type-1 | Type-2 | Type-3 | Type-4 | Precision |',
    '|---|---:|---:|---:|---:|---:|',
    ...rows.map(
      (r) =>
        `| ${r.method} | ${pct(r.recall.t1)} | ${pct(r.recall.t2)} | ${pct(r.recall.t3)} | ${t4(r)} | ${prec(r.precision)} |`,
    ),
    '',
  ].join('\n')

  return {
    json: {
      model: MODEL,
      threshold,
      embedMs: Math.round(embedMs),
      testGroups: test.length,
      testPairs: testPairs.length,
      rows,
    },
    markdown,
  }
}
