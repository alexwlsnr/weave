<script lang="ts">
  import './app.css'
  import { init } from './engine/strudel'
  import TransportBar from './components/TransportBar.svelte'
  import Palette from './components/Palette.svelte'
  import Canvas from './components/Canvas.svelte'
  import CodePanel from './components/CodePanel.svelte'

  let audioReady = $state(false)
  let loading = $state(false)
  let error = $state('')

  async function startAudio() {
    loading = true
    try {
      await init()
      audioReady = true
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to initialize audio'
    } finally {
      loading = false
    }
  }
</script>

<div class="flex h-screen flex-col bg-gray-950 text-white overflow-hidden">
  {#if !audioReady}
    <!-- Click-to-start overlay (required for Web Audio API) -->
    <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950">
      <h1 class="text-4xl font-bold tracking-tight text-white mb-2">Weave</h1>
      <p class="text-gray-400 mb-8 text-sm">A graphical pattern composer</p>
      <button
        onclick={startAudio}
        disabled={loading}
        class="px-8 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg font-medium text-white transition-colors"
      >
        {loading ? 'Starting…' : 'Click to start audio'}
      </button>
      {#if error}
        <p class="mt-4 text-red-400 text-sm">{error}</p>
      {/if}
    </div>
  {:else}
    <TransportBar />
    <div class="flex flex-1 overflow-hidden">
      <Palette />
      <Canvas />
    </div>
    <CodePanel />
  {/if}
</div>
