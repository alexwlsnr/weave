<script lang="ts">
  import { store } from '../store.svelte'
  import DrumSequenceCard from './cards/DrumSequenceCard.svelte'
  import MelodyCard from './cards/MelodyCard.svelte'
</script>

<main class="flex-1 overflow-auto p-4">
  {#if store.cards.length === 0}
    <div class="flex h-full flex-col items-center justify-center gap-3 text-gray-600">
      <div class="text-5xl opacity-30">♩</div>
      <p class="text-sm">Drag a card from the palette to start composing</p>
    </div>
  {:else}
    <div class="flex flex-wrap gap-4">
      {#each store.cards as card (card.id)}
        {#if card.type === 'drum-sequence'}
          <DrumSequenceCard {card} />
        {:else if card.type === 'melody'}
          <MelodyCard {card} />
        {/if}
      {/each}
    </div>
  {/if}
</main>
