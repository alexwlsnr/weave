<script lang="ts">
  import type { DrumSequenceCard } from '../../store.svelte'
  import { store, removeCard, nextId } from '../../store.svelte'
  import { generateCardCode } from '../../engine/codegen'
  import DrumViz from '../../viz/DrumViz.svelte'
  import ModifierChip from '../modifiers/ModifierChip.svelte'

  let { card }: { card: DrumSequenceCard } = $props()

  // Derived: regenerate code whenever tracks/modifiers change
  let code = $derived(generateCardCode(card))

  const TRACK_COLORS: Record<string, string> = {
    bd: 'bg-purple-500',
    sd: 'bg-blue-500',
    hh: 'bg-emerald-500',
    oh: 'bg-amber-500',
    cp: 'bg-red-500',
  }

  function stepColor(sound: string, on: boolean): string {
    if (!on) return 'bg-gray-800 hover:bg-gray-700'
    const map: Record<string, string> = {
      bd: 'bg-purple-500 hover:bg-purple-400',
      sd: 'bg-blue-500 hover:bg-blue-400',
      hh: 'bg-emerald-500 hover:bg-emerald-400',
      oh: 'bg-amber-500 hover:bg-amber-400',
      cp: 'bg-red-500 hover:bg-red-400',
    }
    return map[sound] ?? 'bg-indigo-500 hover:bg-indigo-400'
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

  function removeTrack(idx: number) {
    card.tracks.splice(idx, 1)
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
  aria-label="Drum sequence card"
  ondragover={onDragOver}
  ondrop={onDrop}
  class="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-900 p-4 w-fit"
>
  <!-- Header -->
  <div class="flex items-center gap-2">
    <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Drum Sequence</span>
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

  <!-- Grid -->
  <div class="flex flex-col gap-1.5">
    {#each card.tracks as track, trackIdx}
      <div class="flex items-center gap-1.5">
        <!-- Sound label -->
        <span class="w-7 text-right text-[10px] font-mono text-gray-500">{track.sound}</span>
        <!-- Steps -->
        <div class="flex gap-0.5">
          {#each track.steps as on, stepIdx}
            <button
              onclick={() => toggleStep(trackIdx, stepIdx)}
              class="h-6 w-7 rounded-sm transition-colors {stepColor(track.sound, on)} {stepIdx % 4 === 0 ? 'ml-1' : ''}"
              aria-label="{track.sound} step {stepIdx + 1} {on ? 'on' : 'off'}"
            ></button>
          {/each}
        </div>
        <!-- Remove track -->
        <button
          onclick={() => removeTrack(trackIdx)}
          class="ml-1 text-gray-600 hover:text-red-400 text-xs"
        >✕</button>
      </div>
    {/each}
  </div>

  <!-- Add track -->
  {#if card.tracks.length < 6}
    <button
      onclick={addTrack}
      class="self-start text-xs text-gray-500 hover:text-violet-400"
    >+ add track</button>
  {/if}

  <!-- Visualization -->
  {#if card.tracks.length > 0}
    <DrumViz tracks={card.tracks} stepCount={card.stepCount} />
  {/if}

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
