import { initStrudel, samples } from '@strudel/web'

let ready = false

export async function init(): Promise<void> {
  if (ready) return
  await initStrudel({
    prebake: async () => {
      // Load the dirt-samples library (bd, sd, hh, cp, etc.)
      await samples('github:tidalcycles/dirt-samples')
    },
  })
  ready = true
}

export function isReady(): boolean {
  return ready
}

export function play(code: string): void {
  ;(globalThis as any).evaluate(code)
}

export function stop(): void {
  ;(globalThis as any).hush()
}

// Build a Pattern object from code string for queryArc() visualization only (no audio)
export function buildPattern(code: string): any {
  try {
    // Use the globals that initStrudel() set up to evaluate a pattern expression
    // eslint-disable-next-line no-new-func
    return new Function(...Object.keys(globalThis as any), `return ${code}`)(
      ...Object.values(globalThis as any)
    )
  } catch {
    return null
  }
}
