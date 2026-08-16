<script>
  import { getChordVariations, FRET_WINDOW } from "../frets/chordFingerings.js";
  import { tunings } from "$lib";
  import { getContext, onMount } from "svelte";
  import { SVGuitarChord } from "svguitar";

  let {
    chordName,
    position = 0,
    tuning = tunings.get("Standard"),
    tuningName = null,
    frets = FRET_WINDOW,
  } = $props();

  const { player } = getContext("app");

  let el = $state(null);
  let width = $state(0);
  let height = $state(0);
  let isDarkMode = $state(false);

  // getChordVariations returns null when the chord has no entry in chords-db.
  // Degrade to an empty diagram rather than taking the whole page down.
  const variations = $derived(getChordVariations(chordName, tuning));
  const chordData = $derived(variations?.positions?.[position] ?? null);

  // Carry the tuning into the link, or the chord page falls back to Standard
  // and shows different shapes than the ones just clicked.
  const chordHref = $derived(
    `/chords/${encodeURIComponent(chordName)}` +
      (tuningName ? `?tuning=${encodeURIComponent(tuningName)}` : ""),
  );

  // Colors based on color scheme
  const chordColor = $derived(isDarkMode ? "#e5e7eb" : "#333");

  function playChord() {
    if (chordData?.midi) {
      player.play(chordData.midi, 15);
    }
  }

  onMount(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    isDarkMode = mediaQuery.matches;

    const handler = (e) => {
      isDarkMode = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  $effect(() => {
    // Redraw the chord whenever props or chordData changes
    if (!el || !chordData) return;

    // Clear the existing SVG content
    el.innerHTML = "";

    // Create a new SVGuitar instance and draw
    const chart = new SVGuitarChord(el);
    chart
      .configure({
        strings: tuning.length,
        frets: frets,
        position: chordData.position,
        strokeWidth: 1,
        fingerSize: 0.5,
        fingerColor: chordColor,
        fingerTextColor: isDarkMode ? "#374151" : "#fff",
        fingerTextSize: 20,
        fretSize: 1.1,
        fretColor: chordColor,
        color: chordColor,
        titleFontSize: 40,
        titleBottomMargin: 10,
        fretLabelFontSize: 20,
        tuning,
        nutWidth: 12,
        sidePadding: 0.2,
        barreChordRadius: 0.5,
        fontFamily:
          'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
      })
      .chord({
        fingers: chordData.fingers,
        barres: chordData.barres,
      })
      .draw();
  });
</script>

<div
  class="flex flex-col justify-center items-center relative w-full h-full p-1">
  <a
    bind:clientWidth={width}
    bind:clientHeight={height}
    bind:this={el}
    data-chord={chordName}
    href={chordHref}
    title="View all positions for {chordName}"
    class="w-full h-full flex">
  </a>
  {#if !chordData}
    <p
      class="flex items-center justify-center w-full h-full text-xs text-center text-gray-400 dark:text-gray-500">
      No diagram available
    </p>
  {/if}
  <div class="flex w-full justify-center items-center py-2">
    <button
      class="flex justify-center items-center gap-1 w-full h-fit p-1 mx-5 text-xs cursor-pointer border border-gray-500 bg-gray-200 rounded-full dark:bg-blue-500 dark:border-blue-400 dark:text-white hover:text-white hover:bg-green-600 hover:border-green-800"
      aria-label="Play {chordName} chord at position {position}"
      disabled={!chordData?.midi}
      onclick={playChord}>
      <div class="font-medium">{chordName}</div>
      <span>▶</span>
    </button>
  </div>
</div>

<style>
  @reference "tailwindcss";
  :global(.barre-rectangle) {
    @apply fill-[#333] dark:fill-blue-400/50;
  }

  :global(.tuning) {
    display: none;
  }
</style>
