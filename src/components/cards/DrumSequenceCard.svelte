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
    display:flex;flex-direction:column;gap:16px;
    border:1px solid #1e0848;border-radius:12px;
    background:var(--surface-1);padding:18px;
    min-width:fit-content;position:relative;
  "
>
  <!-- Header -->
  <div style="display:flex;align-items:center;gap:10px">
    <div style="
      width:9px;height:9px;border-radius:50%;
      background:var(--accent);
      box-shadow:0 0 8px var(--accent-glow);
      flex-shrink:0;
    "></div>
    <span style="font-family:monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-secondary)">
      Drum Sequence
    </span>
    <button
      onclick={() => (card.muted = !card.muted)}
      style="
        margin-left:auto;
        border:1px solid {card.muted ? 'var(--border-subtle)' : 'var(--border-active)'};
        color:{card.muted ? 'var(--text-dim)' : 'var(--text-secondary)'};
        background:transparent;border-radius:20px;
        padding:3px 10px;font-family:monospace;font-size:11px;cursor:pointer;
      "
    >{card.muted ? 'muted' : 'active'}</button>
    <button
      onclick={() => removeCard(card.id)}
      style="
        background:none;border:none;
        color:var(--text-dim);cursor:pointer;font-size:14px;padding:0;
        transition:color 0.15s;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
    >✕</button>
  </div>

  <!-- Step grid -->
  <div style="display:flex;flex-direction:column;gap:4px">
    {#each card.tracks as track, trackIdx}
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-family:monospace;font-size:12px;color:var(--text-dim);width:20px;text-align:right;flex-shrink:0">
          {track.sound}
        </span>
        <div style="display:flex;align-items:center">
          {#each track.steps as on, stepIdx}
            <button
              onclick={() => toggleStep(trackIdx, stepIdx)}
              style="
                width:22px;height:18px;border-radius:3px;border:none;cursor:pointer;
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
            cursor:pointer;font-size:13px;padding:0;transition:color 0.15s;
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
        color:var(--text-dim);font-family:monospace;font-size:12px;
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
