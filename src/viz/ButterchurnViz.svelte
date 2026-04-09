<script lang="ts">
  import { onMount } from 'svelte'
  import { analyserNode } from '../engine/strudel'
  import { store } from '../store.svelte'
  import { getAudioContext } from '@strudel/web'

  let canvas: HTMLCanvasElement
  let presetName = $state('')

  onMount(async () => {
    // Vite wraps the UMD bundles, so .default may itself be { default: Class }
    const [bcMod, bcpMod] = await Promise.all([
      import('butterchurn'),
      import('butterchurn-presets'),
    ])
    const butterchurn = (bcMod.default as any)?.default ?? bcMod.default
    const butterchurnPresets = (bcpMod.default as any)?.default ?? bcpMod.default

    const ctx = getAudioContext() as AudioContext
    if (!ctx || !canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const viz = butterchurn.createVisualizer(ctx, canvas, {
      width: canvas.width,
      height: canvas.height,
    })

    if (analyserNode) viz.connectAudio(analyserNode)

    const presets = butterchurnPresets.getPresets()
    const names: string[] = Object.keys(presets)
    let idx = Math.floor(Math.random() * names.length)

    function loadPreset(blendTime = 0) {
      presetName = names[idx]
      viz.loadPreset(presets[names[idx]], blendTime)
    }
    loadPreset(0)

    // Expose nav controls
    function next(blendTime = 2) { idx = (idx + 1) % names.length; loadPreset(blendTime) }
    function prev(blendTime = 2) { idx = (idx - 1 + names.length) % names.length; loadPreset(blendTime) }
    ;(canvas as any).__next = next
    ;(canvas as any).__prev = prev

    // Auto-cycle every 30s
    const cycleTimer = setInterval(() => next(2.5), 30000)

    // Resize
    function onResize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      viz.setRendererSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    // Escape closes
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') store.vizOpen = false
    }
    window.addEventListener('keydown', onKeydown)

    // Render loop
    let frame: number
    function render() { viz.render(); frame = requestAnimationFrame(render) }
    render()

    return () => {
      cancelAnimationFrame(frame)
      clearInterval(cycleTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeydown)
    }
  })

  function next() { (canvas as any).__next?.(2) }
  function prev() { (canvas as any).__prev?.(2) }
</script>

<div style="position:fixed;inset:0;z-index:100;background:#000">
  <canvas
    bind:this={canvas}
    style="position:absolute;inset:0;width:100%;height:100%"
  ></canvas>

  <!-- Top bar -->
  <div style="
    position:absolute;top:0;left:0;right:0;
    display:flex;align-items:center;gap:12px;padding:14px 18px;
    background:linear-gradient(to bottom,rgba(5,5,16,0.7) 0%,transparent 100%);
  ">
    <span style="
      font-family:monospace;font-size:14px;font-weight:700;
      letter-spacing:4px;color:var(--accent);
      text-shadow:0 0 12px var(--accent-glow);
    ">WEAVE</span>

    <button onclick={prev} style="
      background:transparent;border:1px solid rgba(124,58,237,0.35);
      color:var(--accent-light);padding:4px 12px;border-radius:3px;
      font-family:monospace;font-size:13px;cursor:pointer;
    ">‹</button>
    <button onclick={next} style="
      background:transparent;border:1px solid rgba(124,58,237,0.35);
      color:var(--accent-light);padding:4px 12px;border-radius:3px;
      font-family:monospace;font-size:13px;cursor:pointer;
    ">›</button>

    <span style="
      font-family:monospace;font-size:11px;color:rgba(192,132,252,0.5);
      flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
    ">{presetName}</span>

    <button onclick={() => (store.vizOpen = false)} style="
      background:transparent;border:1px solid rgba(124,58,237,0.35);
      color:rgba(192,132,252,0.7);padding:4px 12px;border-radius:3px;
      font-family:monospace;font-size:13px;cursor:pointer;
    ">✕</button>
  </div>

  <!-- Bottom hint -->
  <div style="
    position:absolute;bottom:0;left:0;right:0;
    padding:12px 18px;
    background:linear-gradient(to top,rgba(5,5,16,0.5) 0%,transparent 100%);
    display:flex;justify-content:center;
    pointer-events:none;
  ">
    <span style="font-family:monospace;font-size:11px;color:rgba(124,58,237,0.4);letter-spacing:1px">
      ESC to close · auto-cycles every 30s
    </span>
  </div>
</div>
