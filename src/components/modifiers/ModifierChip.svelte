<script lang="ts">
  import type { Modifier } from '../../store.svelte'

  let {
    modifier,
    onremove,
  }: {
    modifier: Modifier
    onremove: () => void
  } = $props()

  const LABELS: Record<string, string> = {
    fast: 'fast ×',
    slow: 'slow ×',
    rev: 'rev',
    lpf: 'lpf',
    delay: 'delay',
    reverb: 'reverb',
  }

  const COLORS: Record<string, string> = {
    fast: 'bg-orange-900 border-orange-700 text-orange-300',
    slow: 'bg-blue-900 border-blue-700 text-blue-300',
    rev: 'bg-teal-900 border-teal-700 text-teal-300',
    lpf: 'bg-indigo-900 border-indigo-700 text-indigo-300',
    delay: 'bg-purple-900 border-purple-700 text-purple-300',
    reverb: 'bg-violet-900 border-violet-700 text-violet-300',
  }

  function chipColor(): string {
    return COLORS[modifier.type] ?? 'bg-gray-800 border-gray-600 text-gray-300'
  }

  function paramLabel(): string {
    if (modifier.type === 'fast') return `${modifier.params.rate ?? 2}`
    if (modifier.type === 'slow') return `${modifier.params.rate ?? 2}`
    if (modifier.type === 'lpf') return `${modifier.params.freq ?? 800}Hz`
    if (modifier.type === 'delay') return `${modifier.params.level ?? 0.5}`
    if (modifier.type === 'reverb') return `${modifier.params.level ?? 0.5}`
    return ''
  }

  function handleSlider(e: Event) {
    const val = parseFloat((e.target as HTMLInputElement).value)
    if (modifier.type === 'fast' || modifier.type === 'slow') modifier.params.rate = val
    if (modifier.type === 'lpf') modifier.params.freq = val
    if (modifier.type === 'delay') modifier.params.level = val
    if (modifier.type === 'reverb') modifier.params.level = val
  }

  let hasSlider = $derived(['fast', 'slow', 'lpf', 'delay', 'reverb'].includes(modifier.type))

  function sliderMin(): number {
    if (modifier.type === 'lpf') return 100
    return 0.25
  }

  function sliderMax(): number {
    if (modifier.type === 'lpf') return 8000
    if (modifier.type === 'fast' || modifier.type === 'slow') return 8
    return 1
  }

  function sliderStep(): number {
    if (modifier.type === 'lpf') return 50
    return 0.25
  }

  function sliderValue(): number {
    if (modifier.type === 'fast' || modifier.type === 'slow') return modifier.params.rate ?? 2
    if (modifier.type === 'lpf') return modifier.params.freq ?? 800
    if (modifier.type === 'delay') return modifier.params.level ?? 0.5
    if (modifier.type === 'reverb') return modifier.params.level ?? 0.5
    return 0
  }
</script>

<div class="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] {chipColor()}">
  <span>{LABELS[modifier.type] ?? modifier.type}{paramLabel()}</span>
  {#if hasSlider}
    <input
      type="range"
      min={sliderMin()}
      max={sliderMax()}
      step={sliderStep()}
      value={sliderValue()}
      oninput={handleSlider}
      class="h-1 w-14 cursor-pointer accent-current"
    />
  {/if}
  <button
    onclick={onremove}
    class="ml-0.5 opacity-60 hover:opacity-100"
    aria-label="Remove modifier"
  >✕</button>
</div>
