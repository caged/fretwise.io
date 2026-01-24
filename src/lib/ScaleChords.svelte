<script>
  import { Mode } from "tonal";
  import Chord from "$lib/Chord.svelte";

  let { scale } = $props();

  let chords = $derived(
    Mode.triads(scale.type, scale.tonic)
      .map((chord) => chord.replace("E#", "F").replace("B#", "C"))
      .sort((a, b) => {
        const aIsDim = a.includes("dim") || a.includes("°") || a.includes("o");
        const bIsDim = b.includes("dim") || b.includes("°") || b.includes("o");
        if (aIsDim && !bIsDim) return 1;
        if (!aIsDim && bIsDim) return -1;
        return 0;
      }),
  );

  $effect(() => {
    console.log("ScaleChords chords:", chords);
  });
</script>

<div
  class="text-xs text-gray-500 grid grid-cols-4 md:grid-cols-7 gap-5 dark:text-gray-400">
  {#each chords as chord}
    <div
      class="bg-gray-50 border border-transparent hover:bg-gray-100 hover:border-gray-200 transition-all dark:bg-blue-900/20 dark:border dark:border-blue-900/50 dark:hover:bg-blue-900/40 rounded">
      <Chord chordName={chord} />
    </div>
  {/each}
</div>
