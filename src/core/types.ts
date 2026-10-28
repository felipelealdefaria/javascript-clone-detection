/** 1 = identical, 2 = identical after renaming identifiers and literals, 3 = near-miss (edited). */
export type CloneType = 1 | 2 | 3

export type UnitKind = 'function' | 'method' | 'class'

export interface Position {
  /** 1-based line. */
  line: number
  /** 0-based column. */
  column: number
}

export interface SourceFile {
  /** Path used in reports. Relative paths keep reports portable. */
  path: string
  code: string
}

export interface UnitRef {
  file: string
  /** Best-effort name: declaration, variable, property or method name; `<anonymous>` otherwise. */
  name: string
  kind: UnitKind
  start: Position
  end: Position
  /** Number of normalized tokens. */
  tokens: number
}

export interface ClonePair {
  type: CloneType
  /** 1 for Type-1 and Type-2. For Type-3, 2·LCS / (|a| + |b|) over normalized tokens. */
  similarity: number
  a: UnitRef
  b: UnitRef
  /** Stable across runs while both units keep the same normalized shape. */
  fingerprint: string
}

export interface CloneClass {
  /** The weakest link in the class: 3 if any member is only a near-miss of another. */
  type: CloneType
  members: UnitRef[]
}

export interface ParseError {
  file: string
  message: string
}

export interface DetectOptions {
  /** Minimum similarity for Type-3 clones, from 0 to 1. Default 0.8. */
  threshold?: number
  /** Units with fewer normalized tokens are ignored. Default 30. */
  minTokens?: number
}

export interface DetectionResult {
  files: number
  units: number
  pairs: ClonePair[]
  classes: CloneClass[]
  errors: ParseError[]
  stats: {
    durationMs: number
    /** Candidate pairs that reached the exact LCS comparison. */
    comparisons: number
  }
}
