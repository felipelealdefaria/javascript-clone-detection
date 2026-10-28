import { javascript } from '@codemirror/lang-javascript'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { basicSetup, EditorView } from 'codemirror'
import { compareSources, type UnitComparison } from '../../src/core/index.js'
import { diff, type Segment } from './diff.js'
import { PRESETS } from './presets.js'

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T

const EXPLANATIONS: Record<string, string> = {
  1: 'Identical code. Only layout, comments or the function syntax (arrow vs. regular) differ.',
  2: 'Same structure. Only names and literal values differ.',
  3: 'A near-miss copy. Statements were added, removed or changed.',
  none: 'Not similar enough to be a structural clone.',
}
const BEHAVIOR_NOTE =
  ' If both do the same thing in different ways, that is a Type-4 clone, which structure alone cannot see. The benchmark has an experiment with code embeddings for that.'

// --- State in the URL hash, so a comparison can be shared as a link. -------------------------

interface State {
  a: string
  b: string
  threshold: number
}

function encode(state: State): string {
  let binary = ''
  for (const byte of new TextEncoder().encode(JSON.stringify(state)))
    binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decode(hash: string): State | null {
  try {
    const base64 = hash.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    const state = JSON.parse(new TextDecoder().decode(bytes)) as State
    return typeof state.a === 'string' && typeof state.b === 'string' ? state : null
  } catch {
    return null
  }
}

// --- Editors ------------------------------------------------------------------------------

const initial = decode(location.hash.slice(1)) ?? {
  a: PRESETS[1]?.a ?? '',
  b: PRESETS[1]?.b ?? '',
  threshold: 0.8,
}

const theme = EditorView.theme({
  '&': { height: '100%' },
  '.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.6' },
})

// Colors come from CSS variables, so the editor follows the page's light and dark themes.
const highlight = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.operatorKeyword, tags.modifier, tags.controlKeyword],
    color: 'var(--carbon)',
  },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--syn-string)' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--syn-number)' },
  {
    tag: [tags.comment, tags.lineComment, tags.blockComment],
    color: 'var(--muted)',
    fontStyle: 'italic',
  },
  { tag: [tags.typeName, tags.className, tags.tagName], color: 'var(--syn-type)' },
  {
    tag: [tags.function(tags.variableName), tags.definition(tags.variableName)],
    color: 'var(--ink)',
    fontWeight: '500',
  },
  { tag: [tags.propertyName, tags.attributeName], color: 'var(--syn-property)' },
])

let scheduled = 0
const schedule = () => {
  cancelAnimationFrame(scheduled)
  scheduled = requestAnimationFrame(update)
}

const makeEditor = (parent: HTMLElement, doc: string, label: string) =>
  new EditorView({
    doc,
    parent,
    extensions: [
      basicSetup,
      javascript({ jsx: true, typescript: true }),
      syntaxHighlighting(highlight),
      theme,
      EditorView.contentAttributes.of({ 'aria-label': label }),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) schedule()
      }),
    ],
  })

const editorA = makeEditor($('editor-a'), initial.a, 'Snippet A')
const editorB = makeEditor($('editor-b'), initial.b, 'Snippet B')

const slider = $<HTMLInputElement>('threshold')
const sliderValue = $<HTMLOutputElement>('threshold-value')
slider.value = String(initial.threshold)

// --- Presets ------------------------------------------------------------------------------

const presetBar = document.querySelector('.presets') as HTMLElement
for (const preset of PRESETS) {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = preset.label
  button.dataset.preset = preset.id
  button.addEventListener('click', () => {
    for (const [editor, text] of [
      [editorA, preset.a],
      [editorB, preset.b],
    ] as const) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: text } })
    }
  })
  presetBar.append(button)
}

// --- Rendering ----------------------------------------------------------------------------

function renderSegments(target: HTMLElement, segments: Segment[]) {
  target.replaceChildren(
    ...segments.map((s) => {
      if (!s.changed) return document.createTextNode(s.text)
      const mark = document.createElement('mark')
      mark.className = 'diff'
      mark.textContent = s.text
      return mark
    }),
  )
}

function label(c: UnitComparison) {
  return c.type ? `Type-${c.type} clone` : 'Not a clone'
}

let selected = 0
let lastVerdict = ''

function render(comparisons: UnitComparison[], errors: string[]) {
  const verdict = $('verdict-type')
  const detail = $('verdict-detail')
  const pairs = $('pairs')
  const normA = $('normalized-a')
  const normB = $('normalized-b')

  if (errors.length > 0) {
    verdict.textContent = 'Could not parse'
    verdict.dataset.kind = 'error'
    detail.textContent = `${errors.join(' ')} Fix the syntax to compare.`
    pairs.replaceChildren()
    return
  }
  if (comparisons.length === 0) {
    verdict.textContent = 'Nothing to compare yet'
    verdict.dataset.kind = 'none'
    detail.textContent = 'Each side needs at least one function, method or class.'
    pairs.replaceChildren()
    normA.textContent = ''
    normB.textContent = ''
    return
  }

  selected = Math.min(selected, comparisons.length - 1)
  const current = comparisons[selected] as UnitComparison
  const text = label(current)
  verdict.replaceChildren(
    document.createTextNode(text),
    Object.assign(document.createElement('span'), {
      className: 'score',
      textContent: `${Math.round(current.similarity * 100)}% similar`,
    }),
  )
  verdict.dataset.kind = current.type ? `t${current.type}` : 'none'
  if (text !== lastVerdict) {
    verdict.classList.remove('changed')
    void verdict.offsetWidth
    verdict.classList.add('changed')
    lastVerdict = text
  }
  detail.textContent =
    EXPLANATIONS[current.type ?? 'none'] + (current.type === null ? BEHAVIOR_NOTE : '')

  // With several functions per side, list every pair so one can be picked.
  if (comparisons.length > 1) {
    const list = document.createElement('ul')
    comparisons.forEach((c, i) => {
      const item = document.createElement('li')
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('aria-pressed', String(i === selected))
      button.textContent = `${c.a.name} ↔ ${c.b.name} — ${label(c)}, ${Math.round(c.similarity * 100)}%`
      button.addEventListener('click', () => {
        selected = i
        render(comparisons, errors)
      })
      item.append(button)
      list.append(item)
    })
    pairs.replaceChildren(
      Object.assign(document.createElement('p'), { textContent: 'All pairs, most similar first:' }),
      list,
    )
  } else {
    pairs.replaceChildren()
  }

  const segments = diff(current.normalized.a, current.normalized.b)
  renderSegments(normA, segments.a)
  renderSegments(normB, segments.b)
}

function update() {
  const threshold = Number(slider.value)
  sliderValue.textContent = threshold.toFixed(2)
  const a = editorA.state.doc.toString()
  const b = editorB.state.doc.toString()

  let comparisons: UnitComparison[] = []
  let errors: string[] = []
  try {
    const result = compareSources(
      { path: 'A.tsx', code: a },
      { path: 'B.tsx', code: b },
      { threshold },
    )
    comparisons = result.comparisons
    errors = result.errors.map((e) => `Snippet ${e.file[0]}: ${e.message}.`)
  } catch (error) {
    errors = [error instanceof Error ? error.message : String(error)]
  }
  render(comparisons, errors)

  for (const button of presetBar.querySelectorAll<HTMLButtonElement>('button')) {
    const preset = PRESETS.find((p) => p.id === button.dataset.preset)
    button.setAttribute('aria-pressed', String(preset?.a === a && preset?.b === b))
  }
  history.replaceState(null, '', `#${encode({ a, b, threshold })}`)
}

slider.addEventListener('input', schedule)
update()
