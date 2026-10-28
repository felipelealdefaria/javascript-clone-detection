#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { DEFAULT_MIN_TOKENS, DEFAULT_THRESHOLD } from './core/detect.js'
import { detectClonesInPaths } from './index.js'
import { toJson } from './report/json.js'
import { toSarif } from './report/sarif.js'
import { toText } from './report/text.js'
import { VERSION } from './version.js'

const HELP = `jscd ${VERSION} — find duplicated code in JavaScript, TypeScript and React projects

Usage
  jscd [paths...] [options]

Options
  -t, --threshold <0-1>   Minimum similarity for Type-3 clones (default ${DEFAULT_THRESHOLD})
  -m, --min-tokens <n>    Ignore functions smaller than n normalized tokens (default ${DEFAULT_MIN_TOKENS})
  -f, --format <format>   text | json | sarif (default text)
  -o, --output <file>     Write the report to a file instead of stdout
  -i, --ignore <glob>     Exclude files matching a glob (repeatable)
  -c, --changed <ref>     Only report clones touching lines changed since <ref> (git)
      --fail              Exit with code 1 when clones are found
  -v, --version           Print the version
  -h, --help              Print this help

Examples
  jscd src
  jscd src --threshold 0.9 --ignore "**/*.test.ts"
  jscd . --format sarif --output clones.sarif
  jscd src --changed origin/main --fail
`

function fail(message: string): never {
  process.stderr.write(`jscd: ${message}\nRun "jscd --help" for usage.\n`)
  process.exit(2)
}

function numberOption(value: string | undefined, name: string, fallback: number): number {
  if (value === undefined) return fallback
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) fail(`--${name} must be a number, got "${value}"`)
  return parsed
}

async function main(): Promise<void> {
  let parsed: ReturnType<typeof parse>
  try {
    parsed = parse()
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  }
  const { values, positionals } = parsed

  if (values.help) {
    process.stdout.write(HELP)
    return
  }
  if (values.version) {
    process.stdout.write(`${VERSION}\n`)
    return
  }

  const threshold = numberOption(values.threshold, 'threshold', DEFAULT_THRESHOLD)
  const minTokens = numberOption(values['min-tokens'], 'min-tokens', DEFAULT_MIN_TOKENS)
  if (threshold <= 0 || threshold > 1) fail('--threshold must be between 0 (exclusive) and 1')
  if (minTokens < 0) fail('--min-tokens must be 0 or more')
  const format = values.format ?? 'text'
  if (!['text', 'json', 'sarif'].includes(format)) fail(`unknown format "${format}"`)

  let result: Awaited<ReturnType<typeof detectClonesInPaths>>
  try {
    result = await detectClonesInPaths(positionals, {
      threshold,
      minTokens,
      ignore: values.ignore,
      changedSince: values.changed,
    })
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error))
  }

  const color = !values.output && process.stdout.isTTY && !process.env.NO_COLOR
  const report =
    format === 'json'
      ? toJson(result)
      : format === 'sarif'
        ? toSarif(result)
        : toText(result, { color })

  if (values.changed)
    process.stderr.write(`Only clones touching changes since ${values.changed}.\n`)
  if (values.output) {
    await writeFile(values.output, report)
    process.stderr.write(`Wrote ${result.pairs.length} clone pairs to ${values.output}\n`)
  } else {
    process.stdout.write(report)
  }

  if (values.fail && result.pairs.length > 0) process.exitCode = 1
}

function parse() {
  return parseArgs({
    allowPositionals: true,
    options: {
      threshold: { type: 'string', short: 't' },
      'min-tokens': { type: 'string', short: 'm' },
      format: { type: 'string', short: 'f' },
      output: { type: 'string', short: 'o' },
      ignore: { type: 'string', short: 'i', multiple: true },
      changed: { type: 'string', short: 'c' },
      fail: { type: 'boolean' },
      version: { type: 'boolean', short: 'v' },
      help: { type: 'boolean', short: 'h' },
    },
  })
}

await main()
