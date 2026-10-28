import { styleText } from 'node:util'
import type { ClonePair, DetectionResult, UnitRef } from '../core/types.js'

type Style = Parameters<typeof styleText>[0]

function span(ref: UnitRef): string {
  return `${ref.file}:${ref.start.line}-${ref.end.line}`
}

function plural(n: number, word: string, many = `${word}s`): string {
  return `${n} ${n === 1 ? word : many}`
}

/** Human-readable report. Colors are applied only when `color` is true. */
export function toText(result: DetectionResult, { color = false } = {}): string {
  const paint = (style: Style, text: string) => (color ? styleText(style, text) : text)
  const lines: string[] = []

  const describe = (pair: ClonePair) => {
    const label = `Type-${pair.type}`
    const score = pair.type === 3 ? ` · ${(pair.similarity * 100).toFixed(0)}% similar` : ''
    const width = Math.max(span(pair.a).length, span(pair.b).length)
    lines.push(paint(pair.type === 3 ? 'yellow' : 'red', `${label} clone${score}`))
    for (const ref of [pair.a, pair.b]) {
      lines.push(
        `  ${paint('cyan', span(ref).padEnd(width))}  ${paint('dim', `${ref.name} (${ref.tokens} tokens)`)}`,
      )
    }
    lines.push('')
  }
  for (const pair of result.pairs) describe(pair)

  for (const error of result.errors) {
    lines.push(paint('yellow', `Skipped ${error.file}: ${error.message}`))
  }
  if (result.errors.length > 0) lines.push('')

  const byType = [1, 2, 3].map((type) => result.pairs.filter((p) => p.type === type).length)
  const summary =
    result.pairs.length === 0
      ? paint('green', 'No clones found.')
      : `${plural(result.pairs.length, 'clone pair')} (${byType[0]} Type-1, ${byType[1]} Type-2, ${byType[2]} Type-3) in ${plural(result.classes.length, 'clone class', 'clone classes')}.`
  lines.push(summary)
  lines.push(
    paint(
      'dim',
      `Scanned ${plural(result.files, 'file')} and ${plural(result.units, 'unit')} in ${result.stats.durationMs} ms.`,
    ),
  )
  return `${lines.join('\n')}\n`
}
