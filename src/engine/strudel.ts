import { initStrudel, samples, evaluate as strudelEvaluate, hush as strudelHush } from '@strudel/web'

let ready = false

export async function init(): Promise<void> {
  if (ready) return
  await initStrudel({
    prebake: async () => {
      // Load the TidalCycles dirt-samples (bd, sd, hh, cp, oh, etc.)
      await samples('github:tidalcycles/dirt-samples')
    },
  })
  ready = true
}

export function isReady(): boolean {
  return ready
}

export function play(code: string): void {
  strudelEvaluate(code)
}

export function stop(): void {
  strudelHush()
}
