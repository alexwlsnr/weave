<script lang="ts">
  import { store, addCard, nextId } from '../store.svelte'
  import type { Modifier } from '../store.svelte'

  // Card templates
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

  // Modifier templates draggable from palette
  const MODIFIERS: { label: string; mod: Omit<Modifier, 'id'> }[] = [
    { label: 'fast ×2', mod: { type: 'fast', params: { rate: 2 } } },
    { label: 'slow ×2', mod: { type: 'slow', params: { rate: 2 } } },
    { label: 'rev',     mod: { type: 'rev',  params: {} } },
    { label: 'lpf',     mod: { type: 'lpf',  params: { freq: 800 } } },
    { label: 'delay',   mod: { type: 'delay',params: { level: 0.5, time: 0.25 } } },
    { label: 'reverb',  mod: { type: 'reverb',params: { level: 0.5 } } },
  ]

  const MOD_COLORS: Record<string, string> = {
    fast: 'border-orange-700 text-orange-400 hover:bg-orange-900/40',
    slow: 'border-blue-700 text-blue-400 hover:bg-blue-900/40',
    rev: 'border-teal-700 text-teal-400 hover:bg-teal-900/40',
    lpf: 'border-indigo-700 text-indigo-400 hover:bg-indigo-900/40',
    delay: 'border-purple-700 text-purple-400 hover:bg-purple-900/40',
    reverb: 'border-violet-700 text-violet-400 hover:bg-violet-900/40',
  }

  function onModifierDragStart(e: DragEvent, mod: Omit<Modifier, 'id'>) {
    e.dataTransfer!.effectAllowed = 'copy'
    e.dataTransfer!.setData('application/weave-modifier', JSON.stringify(mod))
  }
</script>

<aside class="flex w-44 flex-col gap-4 border-r border-gray-800 bg-gray-900 p-3 overflow-y-auto">
  <!-- Card templates -->
  <section>
    <h3 class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Cards</h3>
    <div class="flex flex-col gap-2">
      <button
        onclick={addDrumCard}
        class="flex flex-col items-start rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-left hover:border-violet-600 hover:bg-gray-750 transition-colors"
      >
        <span class="text-xs font-medium text-white">Drum Grid</span>
        <span class="text-[10px] text-gray-500">16-step sequencer</span>
      </button>
      <button
        onclick={addMelodyCard}
        class="flex flex-col items-start rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-left hover:border-violet-600 transition-colors"
      >
        <span class="text-xs font-medium text-white">Melody</span>
        <span class="text-[10px] text-gray-500">Piano roll</span>
      </button>
    </div>
  </section>

  <!-- Modifier palette -->
  <section>
    <h3 class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
      Modifiers
    </h3>
    <p class="mb-2 text-[9px] text-gray-600">Drag onto a card</p>
    <div class="flex flex-col gap-1.5">
      {#each MODIFIERS as { label, mod }}
        <div
          role="listitem"
          draggable="true"
          ondragstart={(e) => onModifierDragStart(e, mod)}
          class="cursor-grab rounded-full border px-3 py-1 text-[11px] active:cursor-grabbing {MOD_COLORS[mod.type] ?? 'border-gray-600 text-gray-400 hover:bg-gray-800'}"
        >
          {label}
        </div>
      {/each}
    </div>
  </section>

  <!-- Presets -->
  <section>
    <h3 class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Presets</h3>
    <button
      onclick={() => {
        // Four on the floor preset
        addCard({
          id: nextId(),
          type: 'drum-sequence',
          stepCount: 16,
          tracks: [
            { sound: 'bd', steps: [true,false,false,false, true,false,false,false, true,false,false,false, true,false,false,false] },
            { sound: 'sd', steps: [false,false,false,false, true,false,false,false, false,false,false,false, true,false,false,false] },
            { sound: 'hh', steps: [true,false,true,false, true,false,true,false, true,false,true,false, true,false,true,false] },
          ],
          modifiers: [],
          muted: false,
        })
      }}
      class="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-left text-[10px] text-gray-400 hover:border-violet-600 hover:text-white transition-colors"
    >
      Four on the floor
    </button>
    <button
      onclick={() => {
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
      }}
      class="mt-1.5 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1.5 text-left text-[10px] text-gray-400 hover:border-violet-600 hover:text-white transition-colors"
    >
      C major arp
    </button>
  </section>
</aside>
