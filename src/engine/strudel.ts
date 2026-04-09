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

  // Tap a master AnalyserNode between destinationGain and context.destination
  try {
    const ctx = getAudioContext() as AudioContext
    const controller = getSuperdoughAudioController() as any
    if (ctx && controller?.destinationGain) {
      analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 2048
      analyserNode.smoothingTimeConstant = 0.8
      controller.destinationGain.disconnect()
      controller.destinationGain.connect(analyserNode)
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
