<script>
  import { Mode } from "tonal";
  import Chord from "$lib/Chord.svelte";

  let { scale, tuning, tuningName = null } = $props();

  // Chord names are passed through as Mode.triads spells them — enharmonic
  // normalisation happens in the chords-db lookup, so Cb/Fb/E#/B# and the
  // double accidentals all resolve without rewriting the displayed name.
  let chords = $derived(
    Mode.triads(scale.type, scale.tonic).sort((a, b) => {
      const aIsDim = a.includes("dim") || a.includes("°") || a.includes("o");
      const bIsDim = b.includes("dim") || b.includes("°") || b.includes("o");
      if (aIsDim && !bIsDim) return 1;
      if (!aIsDim && bIsDim) return -1;
      return 0;
    }),
  );
</script>

<div
  class="text-xs text-gray-500 grid grid-cols-4 md:grid-cols-7 gap-5 dark:text-gray-400">
  {#each chords as chord}
    <div
      class="bg-gray-50 border border-transparent hover:bg-gray-100 hover:border-gray-200 transition-all dark:bg-blue-900/20 dark:border dark:border-blue-900/50 dark:hover:bg-blue-900/40 rounded">
      <Chord chordName={chord} {tuning} {tuningName} />
    </div>
  {/each}
</div>
