/** Lexical pieces of normalized code: words, single symbols and whitespace runs. */
function lex(code: string): string[] {
  return code.match(/\s+|[A-Za-z_$][\w$]*|\d+|"(?:[^"\\]|\\.)*"|./g) ?? []
}

export interface Segment {
  text: string
  changed: boolean
}

/**
 * Word-level diff of two normalized sources (LCS over non-whitespace pieces). Returns each side
 * as segments, with `changed` set on pieces that have no counterpart on the other side.
 */
export function diff(a: string, b: string): { a: Segment[]; b: Segment[] } {
  const pa = lex(a)
  const pb = lex(b)
  const wa = pa.map((t, i) => ({ t, i })).filter((x) => x.t.trim())
  const wb = pb.map((t, i) => ({ t, i })).filter((x) => x.t.trim())

  // Too large for a quadratic table: show both sides unmarked.
  if (wa.length * wb.length > 4_000_000) {
    return { a: [{ text: a, changed: false }], b: [{ text: b, changed: false }] }
  }

  const n = wa.length
  const m = wb.length
  const table = new Uint16Array((n + 1) * (m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i * (m + 1) + j] =
        wa[i]?.t === wb[j]?.t
          ? (table[(i + 1) * (m + 1) + j + 1] as number) + 1
          : Math.max(table[(i + 1) * (m + 1) + j] as number, table[i * (m + 1) + j + 1] as number)
    }
  }

  const keepA = new Set<number>()
  const keepB = new Set<number>()
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (wa[i]?.t === wb[j]?.t) {
      keepA.add(wa[i]?.i as number)
      keepB.add(wb[j]?.i as number)
      i++
      j++
    } else if ((table[(i + 1) * (m + 1) + j] as number) >= (table[i * (m + 1) + j + 1] as number))
      i++
    else j++
  }

  const segments = (pieces: string[], keep: Set<number>): Segment[] => {
    const flags = pieces.map((text, index) => text.trim() !== '' && !keep.has(index))
    // Whitespace joins a mark only when both neighbours are marked, so marks don't trail spaces.
    pieces.forEach((text, k) => {
      if (text.trim() || text.includes('\n')) return
      flags[k] = flags[k - 1] === true && flags[k + 1] === true
    })
    const out: Segment[] = []
    pieces.forEach((text, k) => {
      const last = out.at(-1)
      if (last && last.changed === flags[k]) last.text += text
      else out.push({ text, changed: flags[k] === true })
    })
    return out
  }
  return { a: segments(pa, keepA), b: segments(pb, keepB) }
}
