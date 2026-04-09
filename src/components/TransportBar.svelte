<script lang="ts">
  import { store } from '../store.svelte'
  import { play, stop } from '../engine/strudel'
  import { generateProjectCode } from '../engine/codegen'

  function handlePlay() {
    const code = generateProjectCode(store.cards)
    play(code)
    store.isPlaying = true
    store.codeStatus = 'synced'
  }

  function handleStop() {
    stop()
    store.isPlaying = false
    store.codeStatus = 'synced'
  }

  function handleBpmChange(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value)
    if (!isNaN(val) && val >= 40 && val <= 300) {
      store.bpm = val
      if (store.isPlaying) {
        ;(globalThis as any).setcps?.(val / 60 / 4)
      }
    }
  }
</script>

<header style="
  display:flex;align-items:center;gap:16px;
  padding:0 16px;height:44px;
  background:var(--surface-2);
  border-bottom:1px solid var(--border-subtle);
  flex-shrink:0;
">
  <span style="
    font-family:monospace;font-size:13px;font-weight:700;
    letter-spacing:4px;color:var(--accent);
    text-shadow:0 0 12px var(--accent-glow);
  ">WEAVE</span>

  <div style="display:flex;gap:6px">
    <button
      onclick={handlePlay}
      disabled={store.isPlaying}
      style="
        background:transparent;
        border:1px solid {store.isPlaying ? 'var(--border-subtle)' : 'var(--accent)'};
        color:{store.isPlaying ? 'var(--text-dim)' : 'var(--accent-light)'};
        padding:4px 12px;border-radius:3px;
        font-family:monospace;font-size:11px;letter-spacing:1px;
        cursor:{store.isPlaying ? 'default' : 'pointer'};
        text-shadow:{store.isPlaying ? 'none' : '0 0 6px var(--accent)'};
        transition:all 0.15s;
      "
    >▶ PLAY</button>
    <button
      onclick={handleStop}
      disabled={!store.isPlaying}
      style="
        background:transparent;
        border:1px solid {store.isPlaying ? 'var(--border-active)' : 'var(--border-subtle)'};
        color:{store.isPlaying ? 'var(--text-secondary)' : 'var(--text-dim)'};
        padding:4px 12px;border-radius:3px;
        font-family:monospace;font-size:11px;letter-spacing:1px;
        cursor:{store.isPlaying ? 'pointer' : 'default'};
        transition:all 0.15s;
      "
    >■ STOP</button>
  </div>

  <label style="display:flex;align-items:center;gap:8px;font-family:monospace;font-size:11px;color:var(--text-dim)">
    BPM
    <input
      type="number"
      min="40"
      max="300"
      value={store.bpm}
      oninput={handleBpmChange}
      style="
        width:52px;background:var(--surface-1);
        border:1px solid var(--border-active);
        color:var(--text-secondary);
        padding:3px 6px;border-radius:3px;
        font-family:monospace;font-size:11px;
        text-align:center;outline:none;
      "
    />
  </label>

  <div style="margin-left:auto;font-family:monospace;font-size:10px;color:var(--text-dim)">
    {store.cards.length} {store.cards.length === 1 ? 'card' : 'cards'}
  </div>
</header>
