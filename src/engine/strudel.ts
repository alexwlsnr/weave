import { initStrudel, samples, evaluate as strudelEvaluate, hush as strudelHush, getAudioContext, getSuperdoughAudioController } from '@strudel/web'

let ready = false
export let analyserNode: AnalyserNode | null = null

export async function init(): Promise<void> {
  if (ready) return
  await initStrudel({
    prebake: async () => {
      // Load the TidalCycles dirt-samples (bd, sd, hh, cp, oh, etc.)
      await samples('github:tidalcycles/dirt-samples')
    },
  })

  // Tap a master AnalyserNode between destinationGain and context.destination.
  // getSuperdoughAudioController() returns a q2 instance; destinationGain is on q2.output (wS class).
  try {
    const ctx = getAudioContext() as AudioContext
    const output = (getSuperdoughAudioController() as any)?.output
    if (ctx && output?.destinationGain) {
      analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 2048
      analyserNode.smoothingTimeConstant = 0.8
      output.destinationGain.disconnect()
      output.destinationGain.connect(analyserNode)
      analyserNode.connect(ctx.destination)
    }
  } catch {
    // Non-fatal: visualiser just won't animate
  }

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
