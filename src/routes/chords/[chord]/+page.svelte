<script>
  import { page } from "$app/stores";
  import Chord from "$lib/Chord.svelte";
  import { getChordVariations } from "$frets/chordFingerings.js";
  import { tunings } from "$lib";

  let { data } = $props();

  // Read state from URL params with defaults
  let tuning = $state($page.url.searchParams.get("tuning") || "Standard");
  let positionParam = $page.url.searchParams.get("position");
  let position = $state(positionParam ? parseInt(positionParam) : 0);

  const chordName = $derived(data.chordName);
  const tuningObj = $derived(tunings.get(tuning));
  // Null for any chord with no chords-db entry — treat as "no positions" so the
  // empty state renders instead of throwing.
  const variations = $derived(getChordVariations(chordName, tuningObj));
  const positions = $derived(variations?.positions ?? []);
</script>

<svelte:head>
  <title>{chordName} Chord</title>
  <meta name="Description" content="{chordName} chord variations for guitar" />
</svelte:head>

<div class="container mx-auto p-8">
  <div class="mb-8">
    <h1 class="text-4xl font-bold mb-2 dark:text-gray-100">{chordName}</h1>
    <p class="text-gray-600 dark:text-gray-400">
      {positions.length} position{positions.length !== 1 ? "s" : ""} available
    </p>
  </div>

  {#if positions.length > 0}
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {#each positions as _, idx}
        <div
          class="relative bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all dark:bg-blue-900/20 dark:border dark:border-blue-900/50 dark:hover:bg-blue-900/40 dark:hover:border-blue-500/50 rounded-lg p-4">
          <div class="absolute top-2 right-2 text-xs text-blue-500">
            Position {idx + 1}
          </div>
          <Chord {chordName} position={idx} tuning={tuningObj} />
        </div>
      {/each}
    </div>
  {:else}
    <div
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 dark:bg-yellow-900/20 dark:border-yellow-800">
      <p class="text-yellow-800 dark:text-yellow-200">
        No chord variations found for {chordName}. Try a different chord name.
      </p>
    </div>
  {/if}
</div>
