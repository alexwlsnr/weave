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
