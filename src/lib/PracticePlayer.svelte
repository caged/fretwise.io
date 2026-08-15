<script>
  import { getContext, onMount } from 'svelte';
  import { DisplayTypes } from '$practice/types.js';
  import FretBoard from './FretBoard.svelte';
  import Chord from './Chord.svelte';
  import AlphaTabPlayer from './AlphaTabPlayer.svelte';

  let { step } = $props();

  const { player } = getContext('app');

  function playStep() {
    if (step.midi) {
      // For chord steps, play all notes together
      if (step.displayType === DisplayTypes.CHORD) {
        player.play(step.midi, 15);
      } else {
        // For scale steps, play notes in sequence
        playSequence(step.midi);
      }
    }
  }

  async function playSequence(midiNotes, noteLength = 500) {
    for (const note of midiNotes) {
      player.play([note], noteLength);
      await new Promise(resolve => setTimeout(resolve, noteLength));
    }
  }
</script>

<div class="practice-player">
  <div class="mb-4 p-4 bg-white border border-gray-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
    <h2 class="text-2xl font-bold mb-2 dark:text-gray-100">{step.name}</h2>
    {#if step.description}
      <p class="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
    {/if}
  </div>

  <div class="practice-display bg-gray-50 border border-gray-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-900/50">
    {#if step.displayType === DisplayTypes.FRETBOARD}
      <div class="h-72">
        <FretBoard fretData={step.data.fretData} />
      </div>
    {:else if step.displayType === DisplayTypes.CHORD}
      <div class="flex justify-center">
        <div class="w-64">
          <Chord
            chordName={step.data.chordName}
            position={step.data.position}
            tuning={step.data.tuning}
          />
        </div>
      </div>
    {:else if step.displayType === DisplayTypes.TAB}
      <AlphaTabPlayer alphaTexTab={step.alphaTexTab} />
    {/if}
  </div>

  {#if step.midi}
    <div class="mt-4 flex justify-center">
      <button
        onclick={playStep}
        class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
        <span>▶</span>
        <span>Play</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .practice-player {
    max-width: 100%;
  }
</style>
