<!-- src/components/Canvas.svelte -->
<script lang="ts">
  import { store } from '../store.svelte'
  import DrumSequenceCard from './cards/DrumSequenceCard.svelte'
  import MelodyCard from './cards/MelodyCard.svelte'
</script>

<main style="
  flex:1;overflow:auto;padding:20px;
  background:var(--bg);
">
  {#if store.cards.length === 0}
    <div style="
      height:100%;display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:8px;
    ">
      <div style="font-family:monospace;font-size:14px;letter-spacing:3px;color:var(--text-dim);text-transform:uppercase">
        no cards
      </div>
      <div style="width:32px;height:1px;background:linear-gradient(to right,transparent,var(--border-active),transparent)"></div>
      <div style="font-family:monospace;font-size:13px;color:var(--text-dim)">
        add a card from the sidebar to start
      </div>
    </div>
  {:else}
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
      {#each store.cards as card (card.id)}
        {#if card.type === 'drum-sequence'}
          <DrumSequenceCard bind:card={card} />
        {:else if card.type === 'melody'}
          <MelodyCard bind:card={card} />
        {/if}
      {/each}
    </div>
  {/if}
</main>
