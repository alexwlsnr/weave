// Global reactive state — placeholder
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

export let cards = $state<PatternCard[]>([])
export let bpm = $state(120)
export let isPlaying = $state(false)
