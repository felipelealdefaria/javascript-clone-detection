import { styleText } from 'node:util'
import type { CloneClass, DetectionResult, UnitRef } from '../core/types.js'

type Style = Parameters<typeof styleText>[0]

/** Members listed per class before collapsing into "… and N more". */
const MAX_MEMBERS = 10

function span(ref: UnitRef): string {
  return `${ref.file}:${ref.start.line}-${ref.end.line}`
}

function plural(n: number, word: string, many = `${word}s`): string {
  return `${n} ${n === 1 ? word : many}`
}

/** Human-readable report, one block per clone class. Colors only when `color` is true. */
export function toText(result: DetectionResult, { color = false } = {}): string {
  const paint = (style: Style, text: string) => (color ? styleText(style, text) : text)
  const lines: string[] = []

  const describe = (cls: CloneClass, index: number) => {
    const score = cls.type === 3 ? ` · ≥ ${Math.floor(cls.similarity * 100)}% similar` : ''
    const header = `#${index + 1} Type-${cls.type} · ${plural(cls.members.length, 'copy', 'copies')}${score}`
    lines.push(paint(['bold', cls.type === 3 ? 'yellow' : 'red'], header))
    const shown = cls.members.slice(0, MAX_MEMBERS)
    const width = Math.max(...shown.map((m) => span(m).length))
    for (const ref of shown) {
      lines.push(
        `  ${paint('cyan', span(ref).padEnd(width))}  ${paint('dim', `${ref.name} · ${ref.tokens} tokens`)}`,
      )
    }
    if (cls.members.length > MAX_MEMBERS) {
      lines.push(
        paint(
          'dim',
          `  … and ${cls.members.length - MAX_MEMBERS} more (use --format json for all)`,
        ),
      )
    }
    lines.push('')
  }
  result.classes.forEach(describe)

  for (const error of result.errors) {
    lines.push(paint('yellow', `Skipped ${error.file}: ${error.message}`))
  }
  if (result.errors.length > 0) lines.push('')

  const byType = [1, 2, 3].map((type) => result.pairs.filter((p) => p.type === type).length)
  lines.push(
    result.pairs.length === 0
      ? paint('green', 'No clones found.')
      : `${plural(result.classes.length, 'clone class', 'clone classes')} from ${plural(result.pairs.length, 'clone pair')} (${byType[0]} Type-1, ${byType[1]} Type-2, ${byType[2]} Type-3).`,
  )
  lines.push(
    paint(
      'dim',
      `Scanned ${plural(result.files, 'file')} and ${plural(result.units, 'unit')} in ${result.stats.durationMs} ms.`,
    ),
  )
  return `${lines.join('\n')}\n`
}
