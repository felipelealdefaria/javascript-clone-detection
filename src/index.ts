import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { detectClones } from './core/detect.js'
import type { DetectionResult, DetectOptions, SourceFile } from './core/types.js'
import { changedLines, onlyChanged } from './node/changed.js'
import { type FindOptions, findSourceFiles } from './node/files.js'

export * from './core/index.js'
export { changedLines, onlyChanged } from './node/changed.js'
export { DEFAULT_IGNORE, findSourceFiles, SOURCE_EXTENSIONS } from './node/files.js'
export { toJson } from './report/json.js'
export { toSarif } from './report/sarif.js'
export { toText } from './report/text.js'
export { VERSION } from './version.js'

export interface PathOptions extends DetectOptions, FindOptions {
  /**
   * Git ref (e.g. `origin/main`). When set, only clones with a copy on a line changed since the
   * merge-base with this ref are reported. The whole project is still scanned.
   */
  changedSince?: string
}

/** Finds source files under `paths`, reads them and detects clones. Paths in the result are relative to `cwd`. */
export async function detectClonesInPaths(
  paths: string[],
  options: PathOptions = {},
): Promise<DetectionResult> {
  const cwd = options.cwd ?? process.cwd()
  // Resolve the diff first, so a bad ref fails before the scan.
  const changed = options.changedSince ? changedLines(options.changedSince, cwd) : null
  const absolute = await findSourceFiles(paths, options)
  const files: SourceFile[] = await Promise.all(
    absolute.map(async (file) => ({
      path: path.relative(cwd, file).split(path.sep).join('/'),
      code: await readFile(file, 'utf8'),
    })),
  )
  const result = detectClones(files, options)
  return changed ? onlyChanged(result, changed, cwd) : result
}
