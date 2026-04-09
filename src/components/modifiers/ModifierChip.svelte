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
