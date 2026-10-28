import { stat } from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'tinyglobby'

export const SOURCE_EXTENSIONS = ['js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'mts', 'cts']

export const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/coverage/**',
  '**/.git/**',
  '**/.next/**',
  '**/*.min.js',
  '**/*.d.ts',
]

export interface FindOptions {
  /** Extra glob patterns to exclude, added to `DEFAULT_IGNORE`. */
  ignore?: string[]
  cwd?: string
}

/** Expands files and directories into a sorted, de-duplicated list of absolute source paths. */
export async function findSourceFiles(
  inputs: string[],
  options: FindOptions = {},
): Promise<string[]> {
  const cwd = options.cwd ?? process.cwd()
  const ignore = [...DEFAULT_IGNORE, ...(options.ignore ?? [])]
  const found = new Set<string>()

  for (const input of inputs.length > 0 ? inputs : ['.']) {
    const absolute = path.resolve(cwd, input)
    const info = await stat(absolute).catch(() => null)
    if (!info) throw new Error(`Path not found: ${input}`)
    if (info.isFile()) {
      found.add(absolute)
      continue
    }
    const matches = await glob(`**/*.{${SOURCE_EXTENSIONS.join(',')}}`, {
      cwd: absolute,
      ignore,
      absolute: true,
      dot: false,
    })
    for (const match of matches) found.add(path.normalize(match))
  }
  return [...found].sort()
}
