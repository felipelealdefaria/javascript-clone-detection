/**
 * Prints sampled pairs with their code, from the local cache, for labeling.
 *   npx tsx study/show.ts <project-id> [defaults|nomin] [maxLines]
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { CACHE_DIR } from './fetch.js'

const [id, which = 'defaults', max = '28'] = process.argv.slice(2)
const results = JSON.parse(
  readFileSync(path.join(import.meta.dirname, 'results', 'results.json'), 'utf8'),
)
const project = results.find((r: { id: string }) => r.id === id)
const dir = path.join(
  CACHE_DIR,
  readdirSync(CACHE_DIR).find((d) => d.startsWith(`${id}@`)) as string,
)
const samples = which === 'nomin' ? project.noMinimum.sample : project.sample

const show = (url: string) => {
  const m = /blob\/[0-9a-f]+\/(.+)#L(\d+)-L(\d+)$/.exec(url) as RegExpExecArray
  const lines = readFileSync(path.join(dir, m[1] as string), 'utf8')
    .split('\n')
    .slice(Number(m[2]) - 1, Number(m[3]))
  const limit = Number(max)
  const body =
    lines.length > limit
      ? [...lines.slice(0, limit), `    … ${lines.length - limit} more lines`]
      : lines
  return `  ${m[1]}:${m[2]}\n${body.map((l) => `    ${l}`).join('\n')}`
}

samples.forEach(
  (s: { key: string; type: number; similarity: number; a: string; b: string }, i: number) => {
    console.log(`\n### ${i + 1} T${s.type} ${(s.similarity * 100).toFixed(0)}%  ${s.key}`)
    console.log(show(s.a))
    console.log(show(s.b))
  },
)
