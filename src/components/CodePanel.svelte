<script lang="ts">
  import { store } from '../store.svelte'
  import { generateProjectCode } from '../engine/codegen'

  let code = $derived(generateProjectCode(store.cards))
  let collapsed = $state(false)

  function copyCode() {
    navigator.clipboard.writeText(code)
  }
</script>

<div class="border-t border-gray-800 bg-gray-900 transition-all {collapsed ? 'h-8' : 'h-48'}">
  <div class="flex items-center gap-2 border-b border-gray-800 px-3 py-1.5">
    <span class="text-[10px] font-bold uppercase tracking-wider text-gray-500">Generated Code</span>
    <span class="ml-1 text-[10px] text-gray-600">
      (paste into <a href="https://strudel.cc" target="_blank" rel="noreferrer" class="text-violet-500 hover:text-violet-400">strudel.cc</a> REPL)
    </span>
    <div class="ml-auto flex items-center gap-2">
      {#if !collapsed && code !== 'silence()'}
        <button
          onclick={copyCode}
          class="text-[10px] text-gray-500 hover:text-violet-400 transition-colors"
        >
          copy
        </button>
      {/if}
      <button
        onclick={() => (collapsed = !collapsed)}
        class="text-[10px] text-gray-500 hover:text-white"
      >
        {collapsed ? '▲' : '▼'}
      </button>
    </div>
  </div>

  {#if !collapsed}
    <div class="h-full overflow-auto px-3 py-2">
      <pre class="font-mono text-[11px] text-emerald-400 leading-relaxed whitespace-pre-wrap">{code}</pre>
    </div>
  {/if}
</div>
