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

  let strudelLink = $derived('https://strudel.cc/#' + btoa(unescape(encodeURIComponent(code))))
</script>

<div style="
  display:flex;flex-direction:column;
  border-top:1px solid var(--border-subtle);
  background:var(--surface-2);
  flex-shrink:0;
  transition:height 0.2s ease;
  height:{expanded ? '200px' : '44px'};
  overflow:hidden;
">
  <!-- Collapsed bar — always visible, click to toggle -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    onclick={() => (expanded = !expanded)}
    style="
      display:flex;align-items:stretch;height:44px;cursor:pointer;flex-shrink:0;
    "
  >
    <!-- Status gutter -->
    <div style="width:4px;background:{gutterColor};transition:background 0.3s;flex-shrink:0"></div>

    <!-- Content row -->
    <div style="
      flex:1;display:flex;align-items:center;gap:10px;
      padding:0 10px;overflow:hidden;
    ">
      <span style="font-family:monospace;font-size:12px;letter-spacing:2px;color:var(--text-dim);flex-shrink:0;text-transform:uppercase">
        Code
      </span>
      <span style="
        font-family:monospace;font-size:13px;color:{gutterColor};
        flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        transition:color 0.3s;
      ">{previewLine}</span>
      {#if store.codeStatus === 'pending'}
        <span style="font-family:monospace;font-size:12px;color:var(--amber);flex-shrink:0">● pending</span>
      {:else if store.codeStatus === 'error'}
        <span style="font-family:monospace;font-size:12px;color:var(--red);flex-shrink:0">● error</span>
      {/if}
      <button
        onclick={(e) => { e.stopPropagation(); copyCode() }}
        style="
          font-family:monospace;font-size:12px;color:var(--text-dim);
          background:none;border:none;cursor:pointer;flex-shrink:0;padding:0;
        "
        onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--accent-light)'}
        onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'}
      >copy</button>
      <span style="font-family:monospace;font-size:12px;color:var(--text-dim);flex-shrink:0">
        {expanded ? '▼' : '▲'}
      </span>
    </div>
  </div>

  <!-- Expanded code block -->
  {#if expanded}
    <div style="flex:1;overflow:auto;padding:8px 14px 8px 14px;border-top:1px solid var(--border-subtle)">
      <pre style="
        margin:0;font-family:monospace;font-size:13px;
        color:{gutterColor};line-height:1.7;white-space:pre-wrap;
        transition:color 0.3s;
      ">{code}</pre>
      <a
        href={strudelLink}
        target="_blank"
        rel="noreferrer"
        style="
          display:inline-block;margin-top:8px;
          font-family:monospace;font-size:12px;
          color:var(--text-dim);text-decoration:none;letter-spacing:1px;
        "
        onclick={(e) => e.stopPropagation()}
      >try at strudel.cc ↗</a>
      <a
        href="https://github.com/alexwlsnr/weave"
        target="_blank"
        rel="noreferrer"
        style="
          display:inline-block;margin-top:8px;margin-left:16px;
          font-family:monospace;font-size:12px;
          color:var(--text-dim);text-decoration:none;letter-spacing:1px;
        "
        onclick={(e) => e.stopPropagation()}
      >source ↗</a>
    </div>
  {/if}
</div>
