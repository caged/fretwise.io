<script>
  import { tunings } from "../lib";
  import frets from "../frets";
  import { Scale, Mode } from "tonal";
  import TuningSelector from "../lib/TuningSelector.svelte";
  import FretBoard from "../lib/FretBoard.svelte";
  import KeySelector from "../lib/KeySelector.svelte";
  import ScaleSelector from "../lib/ScaleSelector.svelte";
  import ScaleChords from "../lib/ScaleChords.svelte";
  import ScaleInfo from "../lib/ScaleInfo.svelte";
  import SystemSelector from "../lib/SystemSelector.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  // Read state from URL params with defaults
  let tuning = $state($page.url.searchParams.get("tuning") || "Standard");
  let key = $state($page.url.searchParams.get("key") || "C");
  let scale = $state($page.url.searchParams.get("scale") || "minor pentatonic");
  let system = $state($page.url.searchParams.get("system") || "CAGED");
  let positionParam = $page.url.searchParams.get("position");
  let position = $state(positionParam ? parseInt(positionParam) : null);

  let scaleObj = $derived(Scale.get(`${key} ${scale}`));
  let fretData = $derived(frets(tunings.get(tuning), 16, scaleObj));
  let triads = $derived(Mode.triads(scaleObj.type, scaleObj.tonic));

  // Update URL when state changes
  function updateURL() {
    const params = new URLSearchParams();
    params.set("tuning", tuning);
    params.set("key", key);
    params.set("scale", scale);
    params.set("system", system);
    if (position) {
      params.set("position", position);
    }
    goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
  }

  // Watch for state changes and update URL
  $effect(() => {
    if (scaleObj.intervals?.length === 7) {
      system = "CAGED";
    }
    // Access all reactive values
    tuning;
    key;
    scale;
    system;
    position;

    // Update URL after state changes
    updateURL();
  });

  // Filter fretData based on selected system and position
  let filteredFretData = $derived.by(() => {
    if (!position || !system) return fretData;
    // Check if the current scale has positions for this system
    const hasSystemPositions = fretData.strings.some((string) =>
      string.some(
        (note) => note.positions[system] && note.positions[system].length > 0,
      ),
    );

    if (!hasSystemPositions) return fretData;

    // Create filtered strings with only notes in the selected position
    const filteredStrings = fretData.strings.map((notes) =>
      notes.map((note) => {
        // Keep the note but mark if it should be in the selected position
        // Only show notes that are in the scale AND in the selected position
        const isInPosition = note.positions[system]?.includes(position);
        return {
          ...note,
          inPosition: isInPosition && !!note.interval, // Only scale notes in this position
        };
      }),
    );

    return {
      ...fretData,
      strings: filteredStrings,
    };
  });

</script>

<svelte:head>
  <title>{key} {scale} Scale</title>
  <meta name="Description" content="{key} {scale} scale for guitar" />
</svelte:head>

<div
  class="flex items-center bg-gray-50 *:p-5 *:border-r *:border-gray-200 border-b border-gray-300 dark:bg-blue-950 dark:*:border-blue-900 dark:border-blue-900">
  <div>
    <TuningSelector bind:value={tuning} />
  </div>
  <div>
    <KeySelector bind:value={key} />
  </div>
  <div>
    <ScaleSelector bind:value={scale} />
  </div>
  <div class="">
    <SystemSelector bind:system bind:position />
  </div>
  <div class="border-r-0">
    <ScaleInfo scale={scaleObj} />
  </div>
</div>

<div class="p-5 h-72">
  <FretBoard fretData={filteredFretData} />
</div>

{#if triads.length > 0}
  <div class="relative px-5 dark:border-blue-900">
    <ScaleChords scale={scaleObj} tuning={tunings.get(tuning)} />
  </div>
{/if}
