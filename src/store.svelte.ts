// Global reactive state for Weave

export type DrumTrack = { sound: string; steps: boolean[] }

export type DrumSequenceCard = {
  id: string
  type: 'drum-sequence'
  tracks: DrumTrack[]
  stepCount: 16 | 32
  modifiers: Modifier[]
  muted: boolean
}

export type MelodyNote = { pitch: number; start: number; duration: number }

export type MelodyCard = {
  id: string
  type: 'melody'
  notes: MelodyNote[]
  instrument: string
  modifiers: Modifier[]
  muted: boolean
}

export type Modifier = {
  id: string
  type: 'fast' | 'slow' | 'rev' | 'lpf' | 'delay' | 'reverb'
  params: Record<string, number>
}

export type PatternCard = DrumSequenceCard | MelodyCard

// ---- Global state (class form required for $state in .svelte.ts) ----
class AppStore {
  cards = $state<PatternCard[]>([])
  bpm = $state(120)
  isPlaying = $state(false)
}

export const store = new AppStore()

// ---- Helpers ----
let _nextId = 1
export function nextId(): string {
  return String(_nextId++)
}

export function addCard(card: PatternCard) {
  store.cards.push(card)
}

export function removeCard(id: string) {
  const idx = store.cards.findIndex(c => c.id === id)
  if (idx !== -1) store.cards.splice(idx, 1)
}
