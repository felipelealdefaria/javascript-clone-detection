import type { Dataset } from './build.js'
import { pairKey, type ToolRun } from './tools.js'

export interface Rate {
  hits: number
  total: number
}

export interface Metrics {
  tool: string
  durationMs: number
  recall: { t1: Rate; t2: Rate; t3: Rate; t4: Rate }
  recallByDomain: Record<string, { t1: Rate; t2: Rate; t3: Rate }>
  t3ByEdits: Record<string, Rate>
  precision: { truePositives: number; falsePositives: number }
}

export const rate = (r: Rate) => (r.total === 0 ? 0 : r.hits / r.total)
export const pct = (r: Rate) => `${(rate(r) * 100).toFixed(1)}%`
const add = (r: Rate, hit: boolean) => {
  r.total++
  if (hit) r.hits++
}
const empty = (): Rate => ({ hits: 0, total: 0 })

export function evaluate(dataset: Dataset, run: ToolRun): Metrics {
  const groupOf = new Map<string, string>()
  for (const f of dataset.families)
    for (const file of Object.values(f.files)) groupOf.set(file, f.id)
  for (const p of dataset.type4) {
    groupOf.set(p.a, p.id)
    groupOf.set(p.b, p.id)
  }

  const m: Metrics = {
    tool: run.tool,
    durationMs: Math.round(run.durationMs),
    recall: { t1: empty(), t2: empty(), t3: empty(), t4: empty() },
    recallByDomain: {},
    t3ByEdits: {},
    precision: { truePositives: 0, falsePositives: 0 },
  }
  for (const f of dataset.families) {
    m.recallByDomain[f.domain] ??= { t1: empty(), t2: empty(), t3: empty() }
    const domain = m.recallByDomain[f.domain] as { t1: Rate; t2: Rate; t3: Rate }
    m.t3ByEdits[f.t3Edits] ??= empty()
    for (const type of ['t1', 't2', 't3'] as const) {
      const hit = run.pairs.has(pairKey(f.files.original, f.files[type]))
      add(m.recall[type], hit)
      add(domain[type], hit)
      if (type === 't3') add(m.t3ByEdits[f.t3Edits] as Rate, hit)
    }
  }
  for (const p of dataset.type4) add(m.recall.t4, run.pairs.has(pairKey(p.a, p.b)))

  // Any detected pair across groups is a false positive: originals were chosen not to be clones.
  for (const key of run.pairs) {
    const [a, b] = key.split('|') as [string, string]
    if (groupOf.get(a) !== undefined && groupOf.get(a) === groupOf.get(b))
      m.precision.truePositives++
    else m.precision.falsePositives++
  }
  return m
}
