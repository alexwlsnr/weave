<script lang="ts">
  import type { MelodyNote } from '../store.svelte'

  let {
    notes,
    minPitch = 48,
    maxPitch = 84,
    onAddNote,
    onRemoveNote,
  }: {
    notes: MelodyNote[]
    minPitch?: number
    maxPitch?: number
    onAddNote?: (note: MelodyNote) => void
    onRemoveNote?: (idx: number) => void
  } = $props()

  let canvas: HTMLCanvasElement

  const W = 400
  const H = 160

  function pitchRange(): number {
    return maxPitch - minPitch
  }

  function noteY(pitch: number): number {
    return H - ((pitch - minPitch) / pitchRange()) * H
  }

  function noteX(start: number): number {
    return start * W
  }

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, H)

    // Draw piano roll lane backgrounds (alternating for black keys)
    const pitchH = H / pitchRange()
    for (let p = minPitch; p < maxPitch; p++) {
      const isBlack = [1, 3, 6, 8, 10].includes(p % 12)
      ctx.fillStyle = isBlack ? '#0d1526' : '#111827'
      ctx.fillRect(0, noteY(p + 1), W, pitchH)
    }

    // Grid lines (beats)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * W
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }

    // Notes
    notes.forEach(note => {
      const x = noteX(note.start)
      const y = noteY(note.pitch + 1)
      const w = Math.max(note.duration * W - 2, 6)
      const h = pitchH - 1

      ctx.fillStyle = '#7c3aed'
      ctx.beginPath()
      ctx.roundRect(x + 1, y, w, h, 2)
      ctx.fill()

      ctx.fillStyle = '#a78bfa'
      ctx.beginPath()
      ctx.roundRect(x + 1, y, 3, h, [2, 0, 0, 2])
      ctx.fill()
    })
  })

  function handleClick(e: MouseEvent) {
    if (!onAddNote && !onRemoveNote) return
    const rect = canvas.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    const start = Math.round((px / W) * 8) / 8  // snap to 1/8
    const pitch = Math.round(maxPitch - (py / H) * pitchRange())
    const clampedPitch = Math.max(minPitch, Math.min(maxPitch - 1, pitch))

    // Check if clicking on an existing note to remove it
    const hitIdx = notes.findIndex(n => {
      const nx = noteX(n.start)
      const ny = noteY(n.pitch + 1)
      const nw = n.duration * W
      const nh = H / pitchRange()
      return px >= nx && px <= nx + nw && py >= ny && py <= ny + nh
    })

    if (hitIdx !== -1) {
      onRemoveNote?.(hitIdx)
    } else {
      onAddNote?.({ pitch: clampedPitch, start, duration: 0.25 })
    }
  }
</script>

<canvas
  bind:this={canvas}
  onclick={handleClick}
  class="block cursor-crosshair rounded"
  style="width:{W}px;height:{H}px"
></canvas>
