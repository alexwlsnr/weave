# UI Redesign + Live Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic dark UI with a Neon Synth aesthetic and add auto-debounced live pattern updates (400ms) while playing.

**Architecture:** Design tokens live in `app.css` as CSS custom properties. `codeStatus` ('synced' | 'pending' | 'error') is added to the global `AppStore` so both `App.svelte` (debounce effect) and `TransportBar.svelte` (reset on play) can access it without prop-drilling. `CodePanel` reads `codeStatus` from the store directly. All visual changes are contained to their respective component files — no new files needed.

**Tech Stack:** Svelte 5, Tailwind CSS v4, TypeScript. Verification: `bun run build` after each task (no test framework — build + visual browser check).

**Working directory:** `/home/alex/dev/strudel-experiments/weave`
**Run all commands with:** `~/.bun/bin/bun`

---

## Task 1: CSS design tokens + global base styles

**Files:**
- Modify: `src/app.css`

- [ ] **Step 1: Replace app.css with design tokens and base styles**

```css
/* src/app.css */
@import "tailwindcss";

:root {
  /* Surfaces */
  --bg:        #050510;
  --surface-1: #0d0520;
  --surface-2: #080320;

  /* Borders */
  --border-subtle: #1a0535;
  --border-active: #2d0a5e;

  /* Accents */
  --accent:        #7c3aed;
  --accent-light:  #c084fc;
  --accent-glow:   #9333ea;
  --cyan:          #38bdf8;
  --cyan-glow:     #0ea5e9;
  --green:         #4ade80;
  --green-glow:    #22c55e;
  --amber:         #f59e0b;
  --red:           #ef4444;

  /* Text */
  --text-primary:   #e0c0ff;
  --text-secondary: #7040c0;
  --text-dim:       #3d1060;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  height: 100vh;
  overflow: hidden;
}

/* Glowing range slider thumb — used by modifier chips */
input[type="range"].weave-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 2px;
  background: var(--border-active);
  border-radius: 1px;
  cursor: pointer;
  width: 32px;
}
input[type="range"].weave-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-light);
  box-shadow: 0 0 4px var(--accent-glow);
  cursor: pointer;
}
input[type="range"].weave-slider::-moz-range-thumb {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-light);
  box-shadow: 0 0 4px var(--accent-glow);
  border: none;
  cursor: pointer;
}
/* Cyan variant for sd/lpf chips */
input[type="range"].weave-slider-cyan::-webkit-slider-thumb {
  background: var(--cyan);
  box-shadow: 0 0 4px var(--cyan-glow);
}
input[type="range"].weave-slider-cyan::-moz-range-thumb {
  background: var(--cyan);
  box-shadow: 0 0 4px var(--cyan-glow);
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

Expected: `✓ built in ...`

- [ ] **Step 3: Commit**

```bash
git add src/app.css && git commit -m "feat: add Neon Synth CSS design tokens and slider styles"
```

---

## Task 2: Add `codeStatus` to store + live-update effect in App.svelte

**Files:**
- Modify: `src/store.svelte.ts`
- Modify: `src/App.svelte`

- [ ] **Step 1: Add `codeStatus` to AppStore**

In `src/store.svelte.ts`, add one field to the `AppStore` class:

```typescript
class AppStore {
  cards = $state<PatternCard[]>([])
  bpm = $state(120)
  isPlaying = $state(false)
  codeStatus = $state<'synced' | 'pending' | 'error'>('synced')
}
```

- [ ] **Step 2: Rewrite App.svelte with live-update effect and Neon Synth start overlay**

```svelte
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
</script>

<div style="display:flex;flex-direction:column;height:100vh;background:var(--bg);overflow:hidden">
  {#if !audioReady}
    <div style="
      position:fixed;inset:0;z-index:50;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:var(--bg);gap:12px
    ">
      <div style="font-family:monospace;font-size:32px;font-weight:700;color:var(--accent);
                  text-shadow:0 0 24px var(--accent-glow),0 0 48px var(--accent);
                  letter-spacing:6px">WEAVE</div>
      <div style="font-size:12px;color:var(--text-dim);letter-spacing:2px;text-transform:uppercase;margin-bottom:24px">
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
          font-size:13px;
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
        <div style="color:var(--red);font-size:11px;margin-top:8px">{initError}</div>
      {/if}
    </div>
  {:else}
    <TransportBar />
    <div style="display:flex;flex:1;overflow:hidden">
      <Palette />
      <Canvas />
    </div>
    <CodePanel />
  {/if}
</div>
```

- [ ] **Step 3: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

Expected: `✓ built in ...`

- [ ] **Step 4: Commit**

```bash
git add src/store.svelte.ts src/App.svelte && git commit -m "feat: add codeStatus to store + live-update debounce effect in App"
```

---

## Task 3: Redesign TransportBar

**Files:**
- Modify: `src/components/TransportBar.svelte`

- [ ] **Step 1: Rewrite TransportBar with Neon Synth styling**

When Play is pressed, evaluate the current code immediately (don't wait for debounce) and mark codeStatus synced.

```svelte
<!-- src/components/TransportBar.svelte -->
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
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TransportBar.svelte && git commit -m "feat: Neon Synth TransportBar — outlined buttons, monospace, glow logo"
```

---

## Task 4: Redesign CodePanel with gradient gutter

**Files:**
- Modify: `src/components/CodePanel.svelte`

- [ ] **Step 1: Rewrite CodePanel**

The gutter colour maps: `synced` → `var(--accent)`, `pending` → `var(--amber)`, `error` → `var(--red)`.
Collapsed height ~36px; expanded shows full code block + strudel.cc link.

```svelte
<!-- src/components/CodePanel.svelte -->
<script lang="ts">
  import { store } from '../store.svelte'
  import { generateProjectCode } from '../engine/codegen'

  let code = $derived(generateProjectCode(store.cards))
  let expanded = $state(false)

  let gutterColor = $derived(
    store.codeStatus === 'error'   ? 'var(--red)'   :
    store.codeStatus === 'pending' ? 'var(--amber)'  :
                                     'var(--accent)'
  )

  function copyCode() {
    navigator.clipboard.writeText(code)
  }

  // First non-empty line for the collapsed preview
  let previewLine = $derived(code.split('\n').find(l => l.trim()) ?? code)
</script>

<div style="
  display:flex;flex-direction:column;
  border-top:1px solid var(--border-subtle);
  background:var(--surface-2);
  flex-shrink:0;
  transition:height 0.2s ease;
  height:{expanded ? '160px' : '36px'};
  overflow:hidden;
">
  <!-- Collapsed bar — always visible, click to toggle -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onclick={() => (expanded = !expanded)}
    style="
      display:flex;align-items:stretch;height:36px;cursor:pointer;flex-shrink:0;
    "
  >
    <!-- Status gutter -->
    <div style="width:4px;background:{gutterColor};transition:background 0.3s;flex-shrink:0"></div>

    <!-- Content row -->
    <div style="
      flex:1;display:flex;align-items:center;gap:10px;
      padding:0 10px;overflow:hidden;
    ">
      <span style="font-family:monospace;font-size:9px;letter-spacing:2px;color:var(--text-dim);flex-shrink:0;text-transform:uppercase">
        Code
      </span>
      <span style="
        font-family:monospace;font-size:10px;color:{gutterColor};
        flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        transition:color 0.3s;
      ">{previewLine}</span>
      {#if store.codeStatus === 'pending'}
        <span style="font-family:monospace;font-size:9px;color:var(--amber);flex-shrink:0">● pending</span>
      {:else if store.codeStatus === 'error'}
        <span style="font-family:monospace;font-size:9px;color:var(--red);flex-shrink:0">● error</span>
      {/if}
      <button
        onclick={(e) => { e.stopPropagation(); copyCode() }}
        style="
          font-family:monospace;font-size:9px;color:var(--text-dim);
          background:none;border:none;cursor:pointer;flex-shrink:0;padding:0;
        "
        onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--accent-light)'}
        onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
      >copy</button>
      <span style="font-family:monospace;font-size:9px;color:var(--text-dim);flex-shrink:0">
        {expanded ? '▼' : '▲'}
      </span>
    </div>
  </div>

  <!-- Expanded code block -->
  {#if expanded}
    <div style="flex:1;overflow:auto;padding:8px 14px 8px 14px;border-top:1px solid var(--border-subtle)">
      <pre style="
        margin:0;font-family:monospace;font-size:10px;
        color:{gutterColor};line-height:1.7;white-space:pre-wrap;
        transition:color 0.3s;
      ">{code}</pre>
      <a
        href="https://strudel.cc"
        target="_blank"
        rel="noreferrer"
        style="
          display:inline-block;margin-top:8px;
          font-family:monospace;font-size:9px;
          color:var(--text-dim);text-decoration:none;letter-spacing:1px;
        "
        onclick={(e) => e.stopPropagation()}
      >try at strudel.cc ↗</a>
    </div>
  {/if}
</div>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/CodePanel.svelte && git commit -m "feat: CodePanel gradient gutter (violet/amber/red) + expand/collapse"
```

---

## Task 5: Redesign Palette sidebar

**Files:**
- Modify: `src/components/Palette.svelte`

- [ ] **Step 1: Rewrite Palette with Neon Synth styling, no emojis**

```svelte
<!-- src/components/Palette.svelte -->
<script lang="ts">
  import { addCard, nextId } from '../store.svelte'
  import type { Modifier } from '../store.svelte'

  function addDrumCard() {
    addCard({
      id: nextId(),
      type: 'drum-sequence',
      stepCount: 16,
      tracks: [
        { sound: 'bd', steps: Array(16).fill(false) },
        { sound: 'sd', steps: Array(16).fill(false) },
        { sound: 'hh', steps: Array(16).fill(false) },
      ],
      modifiers: [],
      muted: false,
    })
  }

  function addMelodyCard() {
    addCard({
      id: nextId(),
      type: 'melody',
      notes: [],
      instrument: 'triangle',
      modifiers: [],
      muted: false,
    })
  }

  const MODIFIERS: { label: string; color: string; mod: Omit<Modifier, 'id'> }[] = [
    { label: 'fast ×2', color: 'var(--accent-light)', mod: { type: 'fast',   params: { rate: 2 } } },
    { label: 'slow ×2', color: 'var(--cyan)',          mod: { type: 'slow',   params: { rate: 2 } } },
    { label: 'rev',     color: 'var(--green)',          mod: { type: 'rev',    params: {} } },
    { label: 'lpf',     color: 'var(--cyan)',           mod: { type: 'lpf',    params: { freq: 800 } } },
    { label: 'delay',   color: 'var(--accent-light)',   mod: { type: 'delay',  params: { level: 0.5, time: 0.25 } } },
    { label: 'reverb',  color: 'var(--accent-light)',   mod: { type: 'reverb', params: { level: 0.5 } } },
  ]

  function onModifierDragStart(e: DragEvent, mod: Omit<Modifier, 'id'>) {
    e.dataTransfer!.effectAllowed = 'copy'
    e.dataTransfer!.setData('application/weave-modifier', JSON.stringify(mod))
  }

  function addFourOnFloor() {
    addCard({
      id: nextId(),
      type: 'drum-sequence',
      stepCount: 16,
      tracks: [
        { sound: 'bd', steps: [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false] },
        { sound: 'sd', steps: [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false] },
        { sound: 'hh', steps: [true,false,true,false,true,false,true,false,true,false,true,false,true,false,true,false] },
      ],
      modifiers: [],
      muted: false,
    })
  }

  function addCMajorArp() {
    addCard({
      id: nextId(),
      type: 'melody',
      notes: [
        { pitch: 60, start: 0,    duration: 0.25 },
        { pitch: 64, start: 0.25, duration: 0.25 },
        { pitch: 67, start: 0.5,  duration: 0.25 },
        { pitch: 71, start: 0.75, duration: 0.25 },
      ],
      instrument: 'triangle',
      modifiers: [],
      muted: false,
    })
  }
</script>

<aside style="
  width:144px;flex-shrink:0;
  background:var(--surface-1);
  border-right:1px solid var(--border-subtle);
  display:flex;flex-direction:column;gap:0;
  overflow-y:auto;padding:12px 10px;
">
  <!-- Cards section -->
  <div style="margin-bottom:16px">
    <div style="font-family:monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px">
      Cards
    </div>
    <button onclick={addDrumCard} style="
      display:block;width:100%;text-align:left;
      background:transparent;border:1px solid var(--border-active);
      color:var(--text-secondary);padding:6px 8px;border-radius:4px;
      font-family:monospace;font-size:10px;cursor:pointer;
      margin-bottom:4px;transition:border-color 0.15s,color 0.15s;
    "
    onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-light)' }}
    onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-active)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
    >
      Drum Grid
    </button>
    <button onclick={addMelodyCard} style="
      display:block;width:100%;text-align:left;
      background:transparent;border:1px solid var(--border-active);
      color:var(--text-secondary);padding:6px 8px;border-radius:4px;
      font-family:monospace;font-size:10px;cursor:pointer;
      transition:border-color 0.15s,color 0.15s;
    "
    onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-light)' }}
    onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-active)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
    >
      Melody
    </button>
  </div>

  <!-- Modifiers section -->
  <div style="margin-bottom:16px">
    <div style="font-family:monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:4px">
      Modifiers
    </div>
    <div style="font-size:9px;color:var(--text-dim);margin-bottom:8px">drag onto a card</div>
    <div style="display:flex;flex-direction:column;gap:4px">
      {#each MODIFIERS as { label, color, mod }}
        <div
          role="button"
          tabindex="0"
          draggable="true"
          ondragstart={(e) => onModifierDragStart(e, mod)}
          style="
            border:1px solid {color}40;
            color:{color};
            padding:4px 8px;border-radius:20px;
            font-family:monospace;font-size:9px;
            cursor:grab;text-align:center;
            transition:background 0.15s;
          "
          onmouseenter={(e) => (e.currentTarget as HTMLElement).style.background = `${color}15`}
          onmouseleave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
        >{label}</div>
      {/each}
    </div>
  </div>

  <!-- Presets section -->
  <div>
    <div style="font-family:monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-dim);margin-bottom:8px">
      Presets
    </div>
    <button onclick={addFourOnFloor} style="
      display:block;width:100%;text-align:left;
      background:transparent;border:none;
      color:var(--text-dim);padding:4px 0;
      font-family:monospace;font-size:9px;cursor:pointer;
      transition:color 0.15s;
    "
    onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--accent-light)'}
    onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
    >Four on floor</button>
    <button onclick={addCMajorArp} style="
      display:block;width:100%;text-align:left;
      background:transparent;border:none;
      color:var(--text-dim);padding:4px 0;
      font-family:monospace;font-size:9px;cursor:pointer;
      transition:color 0.15s;
    "
    onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--accent-light)'}
    onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
    >C major arp</button>
  </div>
</aside>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Palette.svelte && git commit -m "feat: Neon Synth Palette — no emojis, monospace, coloured modifier chips"
```

---

## Task 6: Redesign Canvas empty state

**Files:**
- Modify: `src/components/Canvas.svelte`

- [ ] **Step 1: Rewrite Canvas with Neon Synth empty state**

```svelte
<!-- src/components/Canvas.svelte -->
<script lang="ts">
  import { store } from '../store.svelte'
  import DrumSequenceCard from './cards/DrumSequenceCard.svelte'
  import MelodyCard from './cards/MelodyCard.svelte'
</script>

<main style="
  flex:1;overflow:auto;padding:20px;
  background:var(--bg);
">
  {#if store.cards.length === 0}
    <div style="
      height:100%;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:8px;
    ">
      <div style="font-family:monospace;font-size:11px;letter-spacing:3px;color:var(--text-dim);text-transform:uppercase">
        no cards
      </div>
      <div style="width:32px;height:1px;background:linear-gradient(to right,transparent,var(--border-active),transparent)"></div>
      <div style="font-family:monospace;font-size:10px;color:var(--text-dim)">
        add a card from the sidebar to start
      </div>
    </div>
  {:else}
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
      {#each store.cards as card (card.id)}
        {#if card.type === 'drum-sequence'}
          <DrumSequenceCard bind:card={card} />
        {:else if card.type === 'melody'}
          <MelodyCard bind:card={card} />
        {/if}
      {/each}
    </div>
  {/if}
</main>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Canvas.svelte && git commit -m "feat: Neon Synth Canvas empty state"
```

---

## Task 7: Redesign ModifierChip

**Files:**
- Modify: `src/components/modifiers/ModifierChip.svelte`

- [ ] **Step 1: Rewrite ModifierChip as outlined pill with glowing inline slider**

Chip accent colours: fast/delay/reverb → violet (`var(--accent-light)`), slow/lpf → cyan (`var(--cyan)`), rev → green (`var(--green)`).

```svelte
<!-- src/components/modifiers/ModifierChip.svelte -->
<script lang="ts">
  import type { Modifier } from '../../store.svelte'

  let { modifier, onremove }: { modifier: Modifier; onremove: () => void } = $props()

  // Colour per modifier type
  const COLOR: Record<string, string> = {
    fast:   'var(--accent-light)',
    slow:   'var(--cyan)',
    rev:    'var(--green)',
    lpf:    'var(--cyan)',
    delay:  'var(--accent-light)',
    reverb: 'var(--accent-light)',
  }
  const SLIDER_CLASS: Record<string, string> = {
    fast:   'weave-slider',
    slow:   'weave-slider-cyan',
    lpf:    'weave-slider-cyan',
    delay:  'weave-slider',
    reverb: 'weave-slider',
  }

  let color = $derived(COLOR[modifier.type] ?? 'var(--text-secondary)')
  let sliderClass = $derived(SLIDER_CLASS[modifier.type] ?? 'weave-slider')
  let hasSlider = $derived(['fast', 'slow', 'lpf', 'delay', 'reverb'].includes(modifier.type))

  function label(): string {
    if (modifier.type === 'fast')   return `fast ×${modifier.params.rate ?? 2}`
    if (modifier.type === 'slow')   return `slow ×${modifier.params.rate ?? 2}`
    if (modifier.type === 'rev')    return 'rev'
    if (modifier.type === 'lpf')    return `lpf`
    if (modifier.type === 'delay')  return `delay`
    if (modifier.type === 'reverb') return `reverb`
    return modifier.type
  }

  function sliderMin(): number { return modifier.type === 'lpf' ? 100 : 0.25 }
  function sliderMax(): number {
    if (modifier.type === 'lpf') return 8000
    if (modifier.type === 'fast' || modifier.type === 'slow') return 8
    return 1
  }
  function sliderStep(): number { return modifier.type === 'lpf' ? 50 : 0.25 }
  function sliderValue(): number {
    if (modifier.type === 'fast' || modifier.type === 'slow') return modifier.params.rate ?? 2
    if (modifier.type === 'lpf')    return modifier.params.freq ?? 800
    if (modifier.type === 'delay')  return modifier.params.level ?? 0.5
    if (modifier.type === 'reverb') return modifier.params.level ?? 0.5
    return 0
  }

  function handleSlider(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value)
    if (modifier.type === 'fast' || modifier.type === 'slow') modifier.params.rate = val
    if (modifier.type === 'lpf')    modifier.params.freq = val
    if (modifier.type === 'delay')  modifier.params.level = val
    if (modifier.type === 'reverb') modifier.params.level = val
  }
</script>

<div style="
  display:inline-flex;align-items:center;gap:6px;
  border:1px solid {color}60;border-radius:20px;
  padding:3px 8px;
  font-family:monospace;font-size:9px;color:{color};
">
  <span>{label()}</span>
  {#if hasSlider}
    <input
      type="range"
      class={sliderClass}
      min={sliderMin()}
      max={sliderMax()}
      step={sliderStep()}
      value={sliderValue()}
      oninput={handleSlider}
    />
  {/if}
  <button
    onclick={onremove}
    style="
      background:none;border:none;padding:0;
      color:{color}60;cursor:pointer;font-size:9px;line-height:1;
      transition:color 0.15s;
    "
    onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = color}
    onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = `${color}60`}
    aria-label="Remove modifier"
  >✕</button>
</div>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/modifiers/ModifierChip.svelte && git commit -m "feat: ModifierChip outlined pill with glowing inline slider"
```

---

## Task 8: Redesign DrumSequenceCard

**Files:**
- Modify: `src/components/cards/DrumSequenceCard.svelte`

- [ ] **Step 1: Rewrite DrumSequenceCard with spacious + rounded Neon Synth design**

Step colours per sound:
- `bd` → `var(--accent-light)` / glow `var(--accent-glow)`
- `sd` → `var(--cyan)` / glow `var(--cyan-glow)`
- `hh` → `var(--green)` / glow `var(--green-glow)`
- `oh`, `cp`, others → `var(--accent-light)` / glow `var(--accent-glow)`

Quarter-beat gaps: `margin-left: 4px` on every step where `stepIdx % 4 === 0 && stepIdx > 0`.

```svelte
<!-- src/components/cards/DrumSequenceCard.svelte -->
<script lang="ts">
  import type { DrumSequenceCard } from '../../store.svelte'
  import { removeCard, nextId } from '../../store.svelte'
  import { generateCardCode } from '../../engine/codegen'
  import DrumViz from '../../viz/DrumViz.svelte'
  import ModifierChip from '../modifiers/ModifierChip.svelte'

  let { card }: { card: DrumSequenceCard } = $props()

  let code = $derived(generateCardCode(card))

  const STEP_COLOR: Record<string, { on: string; glow: string }> = {
    bd: { on: 'var(--accent-light)', glow: 'var(--accent-glow)' },
    sd: { on: 'var(--cyan)',         glow: 'var(--cyan-glow)' },
    hh: { on: 'var(--green)',        glow: 'var(--green-glow)' },
    oh: { on: 'var(--amber)',        glow: '#d97706' },
    cp: { on: 'var(--red)',          glow: '#dc2626' },
  }

  function stepStyle(sound: string, on: boolean, stepIdx: number): string {
    const c = STEP_COLOR[sound] ?? STEP_COLOR.bd
    const marginLeft = (stepIdx % 4 === 0 && stepIdx > 0) ? 'margin-left:4px;' : ''
    if (on) return `${marginLeft}background:${c.on};box-shadow:0 0 7px ${c.glow};`
    const isQuarter = stepIdx % 4 === 0
    return `${marginLeft}background:${isQuarter ? '#1c0d48' : '#160840'};`
  }

  function toggleStep(trackIdx: number, stepIdx: number) {
    card.tracks[trackIdx].steps[stepIdx] = !card.tracks[trackIdx].steps[stepIdx]
  }

  function addTrack() {
    const sounds = ['bd', 'sd', 'hh', 'oh', 'cp']
    const existing = card.tracks.map(t => t.sound)
    const next = sounds.find(s => !existing.includes(s)) ?? 'perc'
    card.tracks.push({ sound: next, steps: Array(card.stepCount).fill(false) })
  }

  function removeTrack(idx: number) { card.tracks.splice(idx, 1) }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'copy'
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    const data = e.dataTransfer?.getData('application/weave-modifier')
    if (!data) return
    try {
      const mod = JSON.parse(data)
      mod.id = nextId()
      card.modifiers.push(mod)
    } catch {}
  }

  function removeModifier(idx: number) { card.modifiers.splice(idx, 1) }
</script>

<div
  role="region"
  aria-label="Drum sequence card"
  ondragover={onDragOver}
  ondrop={onDrop}
  style="
    display:flex;flex-direction:column;gap:12px;
    border:1px solid #1e0848;border-radius:12px;
    background:var(--surface-1);padding:14px;
    min-width:fit-content;position:relative;
  "
>
  <!-- Header -->
  <div style="display:flex;align-items:center;gap:8px">
    <div style="
      width:7px;height:7px;border-radius:50%;
      background:var(--accent);
      box-shadow:0 0 8px var(--accent-glow);
      flex-shrink:0;
    "></div>
    <span style="font-family:monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-secondary)">
      Drum Sequence
    </span>
    <button
      onclick={() => (card.muted = !card.muted)}
      style="
        margin-left:auto;
        border:1px solid {card.muted ? 'var(--border-subtle)' : 'var(--border-active)'};
        color:{card.muted ? 'var(--text-dim)' : 'var(--text-secondary)'};
        background:transparent;border-radius:20px;
        padding:2px 8px;font-family:monospace;font-size:8px;cursor:pointer;
      "
    >{card.muted ? 'muted' : 'active'}</button>
    <button
      onclick={() => removeCard(card.id)}
      style="
        background:none;border:none;
        color:var(--text-dim);cursor:pointer;font-size:11px;padding:0;
        transition:color 0.15s;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
    >✕</button>
  </div>

  <!-- Step grid -->
  <div style="display:flex;flex-direction:column;gap:4px">
    {#each card.tracks as track, trackIdx}
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-family:monospace;font-size:8px;color:var(--text-dim);width:16px;text-align:right;flex-shrink:0">
          {track.sound}
        </span>
        <div style="display:flex;align-items:center">
          {#each track.steps as on, stepIdx}
            <button
              onclick={() => toggleStep(trackIdx, stepIdx)}
              style="
                width:18px;height:14px;border-radius:3px;border:none;cursor:pointer;
                transition:background 0.1s,box-shadow 0.1s;
                {stepStyle(track.sound, on, stepIdx)}
              "
              aria-label="{track.sound} step {stepIdx + 1} {on ? 'on' : 'off'}"
            ></button>
          {/each}
        </div>
        <button
          onclick={() => removeTrack(trackIdx)}
          style="
            background:none;border:none;color:var(--text-dim);
            cursor:pointer;font-size:10px;padding:0;transition:color 0.15s;
          "
          onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
          onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
        >✕</button>
      </div>
    {/each}
  </div>

  {#if card.tracks.length < 6}
    <button
      onclick={addTrack}
      style="
        align-self:flex-start;background:none;border:none;
        color:var(--text-dim);font-family:monospace;font-size:9px;
        cursor:pointer;padding:0;transition:color 0.15s;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--accent-light)'}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
    >+ add track</button>
  {/if}

  {#if card.tracks.length > 0}
    <DrumViz tracks={card.tracks} stepCount={card.stepCount} />
  {/if}

  {#if card.modifiers.length > 0}
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      {#each card.modifiers as modifier, idx}
        <ModifierChip {modifier} onremove={() => removeModifier(idx)} />
      {/each}
    </div>
  {/if}
</div>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/cards/DrumSequenceCard.svelte && git commit -m "feat: DrumSequenceCard Neon Synth — glowing steps, rounded, quarter-beat gaps"
```

---

## Task 9: Redesign MelodyCard

**Files:**
- Modify: `src/components/cards/MelodyCard.svelte`

- [ ] **Step 1: Rewrite MelodyCard with matching Neon Synth card chrome**

```svelte
<!-- src/components/cards/MelodyCard.svelte -->
<script lang="ts">
  import type { MelodyCard, MelodyNote } from '../../store.svelte'
  import { removeCard, nextId } from '../../store.svelte'
  import { generateCardCode } from '../../engine/codegen'
  import MelodyViz from '../../viz/MelodyViz.svelte'
  import ModifierChip from '../modifiers/ModifierChip.svelte'

  let { card }: { card: MelodyCard } = $props()

  let code = $derived(generateCardCode(card))

  const INSTRUMENTS = ['triangle', 'sawtooth', 'square', 'sine', 'supersaw', 'pulse']

  function addNote(note: MelodyNote) { card.notes.push(note) }
  function removeNote(idx: number)   { card.notes.splice(idx, 1) }
  function clearNotes()              { card.notes.splice(0, card.notes.length) }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'copy'
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    const data = e.dataTransfer?.getData('application/weave-modifier')
    if (!data) return
    try {
      const mod = JSON.parse(data)
      mod.id = nextId()
      card.modifiers.push(mod)
    } catch {}
  }

  function removeModifier(idx: number) { card.modifiers.splice(idx, 1) }
</script>

<div
  role="region"
  aria-label="Melody card"
  ondragover={onDragOver}
  ondrop={onDrop}
  style="
    display:flex;flex-direction:column;gap:12px;
    border:1px solid #1e0848;border-radius:12px;
    background:var(--surface-1);padding:14px;
  "
>
  <!-- Header -->
  <div style="display:flex;align-items:center;gap:8px">
    <div style="
      width:7px;height:7px;border-radius:50%;
      background:var(--accent);box-shadow:0 0 8px var(--accent-glow);flex-shrink:0;
    "></div>
    <span style="font-family:monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--text-secondary)">
      Melody
    </span>
    <select
      bind:value={card.instrument}
      style="
        background:var(--surface-2);border:1px solid var(--border-active);
        color:var(--text-secondary);padding:2px 6px;border-radius:3px;
        font-family:monospace;font-size:8px;cursor:pointer;outline:none;
      "
    >
      {#each INSTRUMENTS as inst}
        <option value={inst}>{inst}</option>
      {/each}
    </select>
    <button
      onclick={() => (card.muted = !card.muted)}
      style="
        margin-left:auto;
        border:1px solid {card.muted ? 'var(--border-subtle)' : 'var(--border-active)'};
        color:{card.muted ? 'var(--text-dim)' : 'var(--text-secondary)'};
        background:transparent;border-radius:20px;
        padding:2px 8px;font-family:monospace;font-size:8px;cursor:pointer;
      "
    >{card.muted ? 'muted' : 'active'}</button>
    <button
      onclick={() => removeCard(card.id)}
      style="
        background:none;border:none;color:var(--text-dim);
        cursor:pointer;font-size:11px;padding:0;transition:color 0.15s;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
    >✕</button>
  </div>

  <!-- Piano roll -->
  <MelodyViz notes={card.notes} onAddNote={addNote} onRemoveNote={removeNote} />
  <div style="display:flex;align-items:center;gap:8px">
    <span style="font-family:monospace;font-size:9px;color:var(--text-dim)">{card.notes.length} notes</span>
    {#if card.notes.length > 0}
      <button
        onclick={clearNotes}
        style="
          background:none;border:none;color:var(--text-dim);
          font-family:monospace;font-size:9px;cursor:pointer;padding:0;transition:color 0.15s;
        "
        onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
        onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
      >clear</button>
    {/if}
  </div>

  {#if card.modifiers.length > 0}
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      {#each card.modifiers as modifier, idx}
        <ModifierChip {modifier} onremove={() => removeModifier(idx)} />
      {/each}
    </div>
  {/if}
</div>
```

- [ ] **Step 2: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

- [ ] **Step 3: Commit**

```bash
git add src/components/cards/MelodyCard.svelte && git commit -m "feat: MelodyCard Neon Synth — matching card chrome, monospace labels"
```

---

## Task 10: Update DrumViz and MelodyViz canvas colours

**Files:**
- Modify: `src/viz/DrumViz.svelte`
- Modify: `src/viz/MelodyViz.svelte`

- [ ] **Step 1: Update DrumViz colours to match Neon Synth palette**

The `TRACK_COLORS` map and off-step colours need to match the card design exactly.

In `src/viz/DrumViz.svelte`, update the constants inside the `$effect` body:

```typescript
// Replace the existing color constants with:
const TRACK_COLORS: Record<string, string> = {
  bd: '#c084fc',
  sd: '#38bdf8',
  hh: '#4ade80',
  oh: '#f59e0b',
  cp: '#ef4444',
}
const TRACK_GLOWS: Record<string, string> = {
  bd: '#9333ea',
  sd: '#0ea5e9',
  hh: '#22c55e',
  oh: '#d97706',
  cp: '#dc2626',
}

// Background
ctx.fillStyle = '#080320'
ctx.fillRect(0, 0, width, height)

// In the step rendering, replace fill logic with:
if (on) {
  const glow = TRACK_GLOWS[track.sound] ?? '#9333ea'
  ctx.shadowColor = glow
  ctx.shadowBlur = 6
  ctx.fillStyle = TRACK_COLORS[track.sound] ?? '#c084fc'
} else {
  ctx.shadowBlur = 0
  ctx.fillStyle = isQuarter ? '#1c0d48' : '#160840'
}
```

Full updated `src/viz/DrumViz.svelte`:

```svelte
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
      ctx.fillStyle = '#3d1060'
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
```

- [ ] **Step 2: Update MelodyViz colours**

In `src/viz/MelodyViz.svelte`, update the colour constants:

```typescript
// Background
ctx.fillStyle = '#080320'
ctx.fillRect(0, 0, W, H)

// Piano key lanes
const isBlack = [1, 3, 6, 8, 10].includes(p % 12)
ctx.fillStyle = isBlack ? '#060218' : '#0a0328'

// Grid lines
ctx.strokeStyle = '#160840'

// Notes
ctx.fillStyle = '#7c3aed'  // note body
// Left edge highlight:
ctx.fillStyle = '#a78bfa'
```

Full updated `src/viz/MelodyViz.svelte`:

```svelte
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

  function pitchRange(): number { return maxPitch - minPitch }
  function noteY(pitch: number): number { return H - ((pitch - minPitch) / pitchRange()) * H }
  function noteX(start: number): number { return start * W }

  $effect(() => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#080320'
    ctx.fillRect(0, 0, W, H)

    const pitchH = H / pitchRange()
    for (let p = minPitch; p < maxPitch; p++) {
      const isBlack = [1, 3, 6, 8, 10].includes(p % 12)
      ctx.fillStyle = isBlack ? '#060218' : '#0a0328'
      ctx.fillRect(0, noteY(p + 1), W, pitchH)
    }

    ctx.strokeStyle = '#160840'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * W
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }

    notes.forEach(note => {
      const x = noteX(note.start)
      const y = noteY(note.pitch + 1)
      const w = Math.max(note.duration * W - 2, 6)
      const h = pitchH - 1

      ctx.shadowColor = '#9333ea'
      ctx.shadowBlur = 6
      ctx.fillStyle = '#7c3aed'
      ctx.beginPath(); ctx.roundRect(x + 1, y, w, h, 2); ctx.fill()

      ctx.shadowBlur = 0
      ctx.fillStyle = '#a78bfa'
      ctx.beginPath(); ctx.roundRect(x + 1, y, 3, h, [2, 0, 0, 2]); ctx.fill()
    })
    ctx.shadowBlur = 0
  })

  function handleClick(e: MouseEvent) {
    if (!onAddNote && !onRemoveNote) return
    const rect = canvas.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    const start = Math.round((px / W) * 8) / 8
    const pitch = Math.round(maxPitch - (py / H) * pitchRange())
    const clampedPitch = Math.max(minPitch, Math.min(maxPitch - 1, pitch))

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
  style="display:block;cursor:crosshair;border-radius:4px;width:{W}px;height:{H}px"
></canvas>
```

- [ ] **Step 3: Verify build passes**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun run build 2>&1 | grep -E "✓ built|error"
```

- [ ] **Step 4: Commit**

```bash
git add src/viz/DrumViz.svelte src/viz/MelodyViz.svelte && git commit -m "feat: update DrumViz and MelodyViz to Neon Synth palette"
```

---

## Task 11: Final browser smoke test + cleanup

**Files:** none (verification only)

- [ ] **Step 1: Run dev server**

```bash
cd /home/alex/dev/strudel-experiments/weave && ~/.bun/bin/bun dev
```

- [ ] **Step 2: Verify in browser**

Open the app. Check:
1. Start overlay: "WEAVE" glows violet, button outlined style
2. After clicking start: transport bar shows correctly — "WEAVE" logo glows, outlined PLAY/STOP buttons
3. Click "Drum Grid" in sidebar: card appears with glowing dot header, 14px steps
4. Toggle steps: off steps are dark, on steps glow in their colour (bd=violet, sd=cyan, hh=green)
5. Code bar at bottom: gutter is violet initially, click to expand and see formatted code
6. Toggle a step: gutter turns amber, 400ms later if playing gutter turns violet again
7. Drag a modifier from sidebar onto card: chip appears as outlined pill with inline slider
8. Click "C major arp" preset: melody card appears with piano roll
9. Both cards playing together: no errors in console

- [ ] **Step 3: Remove leftover Counter component from scaffold if present**

```bash
rm -f /home/alex/dev/strudel-experiments/weave/src/lib/Counter.svelte
```

- [ ] **Step 4: Final commit**

```bash
cd /home/alex/dev/strudel-experiments/weave && git add -A && git commit -m "chore: remove scaffold leftover (Counter.svelte)"
```
