<script lang="ts">
  let {
    tracks,
    stepCount = 16,
  }: {
    tracks: { sound: string; steps: boolean[] }[]
    stepCount: number
  } = $props()

  let canvas: HTMLCanvasElement

  const CELL_W = 28
  const CELL_H = 24
  const GAP = 2
  const LABEL_W = 32
  const PADDING = 8

  const TRACK_COLORS: Record<string, string> = {
    bd: '#a855f7',
    sd: '#3b82f6',
    hh: '#10b981',
    oh: '#f59e0b',
    cp: '#ef4444',
  }

  function trackColor(sound: string): string {
    return TRACK_COLORS[sound] ?? '#6366f1'
  }

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const width = LABEL_W + stepCount * (CELL_W + GAP) + PADDING * 2
    const height = tracks.length * (CELL_H + GAP) + PADDING * 2

    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)

    tracks.forEach((track, row) => {
      const y = PADDING + row * (CELL_H + GAP)

      // Track label
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(track.sound, LABEL_W / 2, y + CELL_H / 2 + 4)

      // Steps
      track.steps.forEach((on, col) => {
        const x = LABEL_W + PADDING + col * (CELL_W + GAP)
        const isQuarter = col % 4 === 0

        // Cell background
        ctx.fillStyle = on
          ? trackColor(track.sound)
          : isQuarter
            ? '#1f2937'
            : '#1a1f2e'
        ctx.beginPath()
        ctx.roundRect(x, y, CELL_W, CELL_H, 3)
        ctx.fill()

        // Quarter beat marker dot (when off)
        if (!on && isQuarter) {
          ctx.fillStyle = '#374151'
          ctx.beginPath()
          ctx.arc(x + CELL_W / 2, y + CELL_H / 2, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })
    })
  })
</script>

<canvas bind:this={canvas} class="block rounded"></canvas>
