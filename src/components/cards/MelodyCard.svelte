<script lang="ts">
  import type { MelodyCard, MelodyNote } from '../../store.svelte'
  import { removeCard, nextId } from '../../store.svelte'
  import { generateCardCode } from '../../engine/codegen'
  import MelodyViz from '../../viz/MelodyViz.svelte'
  import ModifierChip from '../modifiers/ModifierChip.svelte'

  let { card }: { card: MelodyCard } = $props()

  let code = $derived(generateCardCode(card))

  const INSTRUMENTS = ['piano', 'sawtooth', 'square', 'triangle', 'sine', 'gm_acoustic_guitar_nylon']

  function addNote(note: MelodyNote) {
    card.notes.push({ ...note, id: nextId() } as any)
  }

  function removeNote(idx: number) {
    card.notes.splice(idx, 1)
  }

  function clearNotes() {
    card.notes.splice(0, card.notes.length)
  }

  // Drag-over: accept modifier drops
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

  function removeModifier(idx: number) {
    card.modifiers.splice(idx, 1)
  }
</script>

<div
  role="region"
  aria-label="Melody card"
  ondragover={onDragOver}
  ondrop={onDrop}
  class="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-900 p-4"
>
  <!-- Header -->
  <div class="flex items-center gap-2">
    <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Melody</span>
    <select
      bind:value={card.instrument}
      class="ml-2 rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-white"
    >
      {#each INSTRUMENTS as inst}
        <option value={inst}>{inst}</option>
      {/each}
    </select>
    <button
      onclick={() => (card.muted = !card.muted)}
      class="ml-auto rounded px-2 py-0.5 text-xs {card.muted ? 'bg-gray-700 text-gray-400' : 'bg-violet-700 text-white'}"
    >
      {card.muted ? 'muted' : 'active'}
    </button>
    <button
      onclick={() => removeCard(card.id)}
      class="text-gray-500 hover:text-red-400 text-xs"
    >✕</button>
  </div>

  <!-- Piano roll (click to add/remove notes) -->
  <div class="relative">
    <MelodyViz notes={card.notes} onAddNote={addNote} onRemoveNote={removeNote} />
    <p class="mt-1 text-[10px] text-gray-600">Click to add notes · Click existing notes to remove</p>
  </div>

  <!-- Note count + clear -->
  <div class="flex items-center gap-2">
    <span class="text-xs text-gray-500">{card.notes.length} notes</span>
    {#if card.notes.length > 0}
      <button onclick={clearNotes} class="text-xs text-gray-600 hover:text-red-400">clear</button>
    {/if}
  </div>

  <!-- Modifiers -->
  {#if card.modifiers.length > 0}
    <div class="flex flex-wrap gap-1.5">
      {#each card.modifiers as modifier, idx}
        <ModifierChip {modifier} onremove={() => removeModifier(idx)} />
      {/each}
    </div>
  {/if}

  <!-- Code preview -->
  <div class="rounded bg-gray-950 p-2 font-mono text-[10px] text-gray-500 leading-relaxed">
    {code}
  </div>
</div>
