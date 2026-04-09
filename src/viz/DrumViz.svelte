<script lang="ts">
  let {
    tracks,
    stepCount = 16,
  }: {
    tracks: { sound: string; steps: boolean[] }[]
    stepCount: number
  } = $props()

  let canvas: HTMLCanvasElement

  const CELL_W = 18
  const CELL_H = 8
  const GAP = 3
  const LABEL_W = 24
  const PADDING = 6

  const TRACK_COLORS: Record<string, string> = {
    bd: '#c084fc', sd: '#38bdf8', hh: '#4ade80', oh: '#f59e0b', cp: '#ef4444',
  }
  const TRACK_GLOWS: Record<string, string> = {
    bd: '#9333ea', sd: '#0ea5e9', hh: '#22c55e', oh: '#d97706', cp: '#dc2626',
  }

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const width = LABEL_W + stepCount * (CELL_W + GAP) + PADDING * 2
    const height = tracks.length * (CELL_H + GAP) + PADDING * 2

    canvas.width = width
    canvas.height = height

    ctx.fillStyle = '#080320'
    ctx.fillRect(0, 0, width, height)

    tracks.forEach((track, row) => {
      const y = PADDING + row * (CELL_H + GAP)

      ctx.shadowBlur = 0
      ctx.fillStyle = '#6b21a8'
      ctx.font = '7px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(track.sound, LABEL_W - 4, y + CELL_H - 1)

      track.steps.forEach((on, col) => {
        const x = LABEL_W + PADDING + col * (CELL_W + GAP)
        const isQuarter = col % 4 === 0

        if (on) {
          ctx.shadowColor = TRACK_GLOWS[track.sound] ?? '#9333ea'
          ctx.shadowBlur = 6
          ctx.fillStyle = TRACK_COLORS[track.sound] ?? '#c084fc'
        } else {
          ctx.shadowBlur = 0
          ctx.fillStyle = isQuarter ? '#1c0d48' : '#160840'
        }
        ctx.beginPath()
        ctx.roundRect(x, y, CELL_W, CELL_H, 2)
        ctx.fill()
      })
    })
    ctx.shadowBlur = 0
  })
</script>

<canvas bind:this={canvas} style="display:block;border-radius:4px"></canvas>
