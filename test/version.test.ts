import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { VERSION } from '../src/version.js'

it('VERSION matches package.json', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  expect(VERSION).toBe(pkg.version)
})
