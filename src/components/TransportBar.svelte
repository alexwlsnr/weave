<script lang="ts">
  import { store } from '../store.svelte'
  import { play, stop } from '../engine/strudel'
  import { generateProjectCode } from '../engine/codegen'

  function handlePlay() {
    const code = generateProjectCode(store.cards)
    play(code)
    store.isPlaying = true
  }

  function handleStop() {
    stop()
    store.isPlaying = false
  }

  function handleBpmChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value)
    if (!isNaN(val) && val > 0 && val <= 300) {
      store.bpm = val
      // Re-evaluate if playing to apply new BPM via setcps
      if (store.isPlaying) {
        const cps = store.bpm / 60 / 4
        ;(globalThis as any).setcps?.(cps)
      }
    }
  }
</script>

<header class="flex items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 py-2">
  <span class="text-sm font-bold tracking-widest text-violet-400 uppercase">Weave</span>

  <div class="flex items-center gap-2">
    <button
      onclick={handlePlay}
      disabled={store.isPlaying}
      class="flex items-center gap-1.5 rounded bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
    >
      ▶ Play
    </button>
    <button
      onclick={handleStop}
      disabled={!store.isPlaying}
      class="flex items-center gap-1.5 rounded bg-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-40 transition-colors"
    >
      ■ Stop
    </button>
  </div>

  <label class="flex items-center gap-2 text-sm text-gray-400">
    BPM
    <input
      type="number"
      min="40"
      max="300"
      value={store.bpm}
      oninput={handleBpmChange}
      class="w-16 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-center text-white focus:border-violet-500 focus:outline-none"
    />
  </label>

  <div class="ml-auto flex items-center gap-2 text-xs text-gray-500">
    {store.cards.length} {store.cards.length === 1 ? 'card' : 'cards'}
  </div>
</header>
