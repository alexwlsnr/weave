<!-- src/App.svelte -->
<script lang="ts">
  import './app.css'
  import { init, play } from './engine/strudel'
  import { generateProjectCode } from './engine/codegen'
  import { store } from './store.svelte'
  import TransportBar from './components/TransportBar.svelte'
  import Palette from './components/Palette.svelte'
  import Canvas from './components/Canvas.svelte'
  import CodePanel from './components/CodePanel.svelte'
  import ButterchurnViz from './viz/ButterchurnViz.svelte'

  let audioReady = $state(false)
  let loading = $state(false)
  let initError = $state('')

  async function startAudio() {
    loading = true
    try {
      await init()
      audioReady = true
    } catch (e) {
      initError = e instanceof Error ? e.message : 'Failed to initialize audio'
    } finally {
      loading = false
    }
  }

  // Live-update: re-evaluate 400ms after last card change, while playing
  let lastEvaluatedCode = ''
  let debounceTimer: ReturnType<typeof setTimeout>

  $effect(() => {
    const code = generateProjectCode(store.cards)
    if (code === lastEvaluatedCode) return
    store.codeStatus = 'pending'
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (!store.isPlaying) return
      try {
        play(code)
        lastEvaluatedCode = code
        store.codeStatus = 'synced'
      } catch {
        store.codeStatus = 'error'
      }
    }, 400)
  })

  // Playhead animation: update cyclePhase 60fps while playing
  let animFrame = 0
  let playStartAudioTime = 0

  $effect(() => {
    if (!store.isPlaying) {
      cancelAnimationFrame(animFrame)
      store.cyclePhase = 0
      return
    }

    // Record audio time at start of playback
    const ctx = (globalThis as any).getAudioContext?.() as AudioContext | undefined
    playStartAudioTime = ctx?.currentTime ?? 0

    function tick() {
      // Prefer Strudel's own scheduler clock (perfectly synced to audio)
      const schedulerNow: number | undefined = (globalThis as any).scheduler?.now?.()
      if (typeof schedulerNow === 'number') {
        store.cyclePhase = ((schedulerNow % 1) + 1) % 1
      } else {
        // Fallback: compute from elapsed audio time + BPM
        const c = (globalThis as any).getAudioContext?.() as AudioContext | undefined
        if (c) {
          const elapsed = c.currentTime - playStartAudioTime
          const cps = store.bpm / 60 / 4
          store.cyclePhase = ((elapsed * cps) % 1 + 1) % 1
        }
      }
      animFrame = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(animFrame)
      store.cyclePhase = 0
    }
  })
</script>

<div style="display:flex;flex-direction:column;height:100vh;background:var(--bg);overflow:hidden">
  {#if !audioReady}
    <div style="
      position:fixed;inset:0;z-index:50;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:var(--bg);gap:12px
    ">
      <div style="font-family:monospace;font-size:44px;font-weight:700;color:var(--accent);
                  text-shadow:0 0 24px var(--accent-glow),0 0 48px var(--accent);
                  letter-spacing:6px">WEAVE</div>
      <div style="font-size:15px;color:var(--text-dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:24px">
        graphical pattern composer
      </div>
      <button
        onclick={startAudio}
        disabled={loading}
        style="
          background:transparent;
          border:1px solid var(--accent);
          color:var(--accent-light);
          padding:10px 32px;
          border-radius:4px;
          font-family:monospace;
          font-size:16px;
          letter-spacing:2px;
          cursor:pointer;
          text-shadow:0 0 8px var(--accent);
          transition:box-shadow 0.2s;
        "
        onmouseenter={(e) => (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px var(--accent)'}
        onmouseleave={(e) => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
      >
        {loading ? 'LOADING...' : 'CLICK TO START'}
      </button>
      {#if initError}
        <div style="color:var(--red);font-size:14px;margin-top:8px">{initError}</div>
      {/if}
    </div>
  {:else}
    <TransportBar />
    <div style="display:flex;flex:1;overflow:hidden">
      <Palette />
      <Canvas />
    </div>
    <CodePanel />
    {#if store.vizOpen}
      <ButterchurnViz />
    {/if}
  {/if}
</div>
