import type { DetectionResult } from '../core/types.js'
import { VERSION } from '../version.js'

export function toJson(result: DetectionResult): string {
  return `${JSON.stringify({ tool: 'javascript-clone-detection', version: VERSION, ...result }, null, 2)}\n`
}
