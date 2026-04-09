import type { PatternCard, DrumSequenceCard, MelodyCard, Modifier } from '../store.svelte'

// MIDI note number → note name (e.g. 60 → "c4")
function midiToNoteName(midi: number): string {
  const names = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b']
  const octave = Math.floor(midi / 12) - 1
  const note = names[midi % 12]
  return `${note}${octave}`
}

function applyModifiers(base: string, modifiers: Modifier[]): string {
  let code = base
  for (const m of modifiers) {
    if (m.type === 'fast')   code += `.fast(${m.params.rate ?? 2})`
    if (m.type === 'slow')   code += `.slow(${m.params.rate ?? 2})`
    if (m.type === 'rev')    code += `.rev()`
    if (m.type === 'lpf')    code += `.lpf(${m.params.freq ?? 800})`
    if (m.type === 'delay')  code += `.delay(${m.params.level ?? 0.5}).delaytime(${m.params.time ?? 0.25})`
    if (m.type === 'reverb') code += `.room(${m.params.level ?? 0.5})`
  }
  return code
}

function generateDrumCode(card: DrumSequenceCard): string {
  if (card.tracks.length === 0) return 'silence()'

  const trackCodes = card.tracks.map(track => {
    const pattern = track.steps.map(s => (s ? track.sound : '~')).join(' ')
    return `sound("${pattern}")`
  })

  const base =
    trackCodes.length === 1
      ? trackCodes[0]
      : `stack(\n  ${trackCodes.join(',\n  ')}\n)`

  return applyModifiers(base, card.modifiers)
}

function generateMelodyCode(card: MelodyCard): string {
  if (card.notes.length === 0) return 'silence()'

  // Sort notes by start time, convert pitch to note name
  const sorted = [...card.notes].sort((a, b) => a.start - b.start)
  const noteNames = sorted.map(n => midiToNoteName(n.pitch)).join(' ')
  const base = `note("${noteNames}").s("${card.instrument}")`
  return applyModifiers(base, card.modifiers)
}

export function generateCardCode(card: PatternCard): string {
  if (card.type === 'drum-sequence') return generateDrumCode(card)
  if (card.type === 'melody') return generateMelodyCode(card)
  return 'silence()'
}

export function generateProjectCode(cards: PatternCard[]): string {
  const active = cards.filter(c => !c.muted)
  if (active.length === 0) return 'silence()'
  const parts = active.map(generateCardCode)
  if (parts.length === 1) return parts[0]
  return `stack(\n  ${parts.join(',\n  ')}\n)`
}
