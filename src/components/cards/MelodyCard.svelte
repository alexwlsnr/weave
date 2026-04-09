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
    display:flex;flex-direction:column;gap:16px;
    border:1px solid #1e0848;border-radius:12px;
    background:var(--surface-1);padding:18px;
  "
>
  <!-- Header -->
  <div style="display:flex;align-items:center;gap:10px">
    <div style="
      width:9px;height:9px;border-radius:50%;
      background:var(--accent);box-shadow:0 0 8px var(--accent-glow);flex-shrink:0;
    "></div>
    <span style="font-family:monospace;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--text-secondary)">
      Melody
    </span>
    <select
      bind:value={card.instrument}
      style="
        background:var(--surface-2);border:1px solid var(--border-active);
        color:var(--text-secondary);padding:3px 8px;border-radius:3px;
        font-family:monospace;font-size:11px;cursor:pointer;outline:none;
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
        padding:3px 10px;font-family:monospace;font-size:11px;cursor:pointer;
      "
    >{card.muted ? 'muted' : 'active'}</button>
    <button
      onclick={() => removeCard(card.id)}
      style="
        background:none;border:none;color:var(--text-dim);
        cursor:pointer;font-size:14px;padding:0;transition:color 0.15s;
      "
      onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
      onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
    >✕</button>
  </div>

  <!-- Piano roll -->
  <MelodyViz notes={card.notes} onAddNote={addNote} onRemoveNote={removeNote} />
  <div style="display:flex;align-items:center;gap:8px">
    <span style="font-family:monospace;font-size:12px;color:var(--text-dim)">{card.notes.length} notes</span>
    {#if card.notes.length > 0}
      <button
        onclick={clearNotes}
        style="
          background:none;border:none;color:var(--text-dim);
          font-family:monospace;font-size:12px;cursor:pointer;padding:0;transition:color 0.15s;
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
