<script>
  import { scalePatternModule, chordVoicingModule, tabExerciseModule, exampleExercises } from '$practice/modules';
  import PracticePlayer from '$lib/PracticePlayer.svelte';

  let selectedModule = $state(null);
  let practiceSteps = $state([]);
  let currentStepIndex = $state(0);

  // Example configurations for each module type
  const moduleExamples = [
    {
      module: scalePatternModule,
      config: {
        key: 'C',
        scaleType: 'major',
        system: 'CAGED',
        direction: 'both',
        positions: [1, 2, 3]
      }
    },
    {
      module: chordVoicingModule,
      config: {
        chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am'],
        allPositions: false
      }
    },
    {
      module: tabExerciseModule,
      config: {
        exercises: exampleExercises
      }
    }
  ];

  function loadModule(example) {
    selectedModule = example.module;
    practiceSteps = example.module.generate(example.config);
    currentStepIndex = 0;
  }

  function nextStep() {
    if (currentStepIndex < practiceSteps.length - 1) {
      currentStepIndex++;
    }
  }

  function prevStep() {
    if (currentStepIndex > 0) {
      currentStepIndex--;
    }
  }

  const currentStep = $derived(practiceSteps[currentStepIndex]);
</script>

<svelte:head>
  <title>Practice Routines</title>
  <meta name="Description" content="Interactive guitar practice routines" />
</svelte:head>

<div class="container mx-auto p-8">
  <div class="mb-8">
    <h1 class="text-4xl font-bold mb-2 dark:text-gray-100">Practice Routines</h1>
    <p class="text-gray-600 dark:text-gray-400">
      Modular practice exercises for scales, chords, and technique
    </p>
  </div>

  {#if !selectedModule}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each moduleExamples as example}
        <button
          onclick={() => loadModule(example)}
          class="p-6 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all dark:bg-blue-900/20 dark:border-blue-900/50 dark:hover:bg-blue-900/40 text-left">
          <h2 class="text-xl font-bold mb-2 dark:text-gray-100">
            {example.module.name}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            {example.module.description}
          </p>
          <div class="mt-4 text-xs text-blue-600 dark:text-blue-400">
            Click to start →
          </div>
        </button>
      {/each}
    </div>

    <div class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
      <h3 class="font-bold mb-2 dark:text-gray-100">How it works</h3>
      <ul class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <li>• Select a practice module to begin</li>
        <li>• Each module generates a sequence of exercises</li>
        <li>• Use playback controls to hear and practice each step</li>
        <li>• Mix and match modules to create custom routines</li>
      </ul>
    </div>
  {:else}
    <div class="mb-6 flex items-center justify-between">
      <button
        onclick={() => { selectedModule = null; practiceSteps = []; }}
        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-gray-100">
        ← Back to Modules
      </button>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Step {currentStepIndex + 1} of {practiceSteps.length}
      </div>
    </div>

    {#if currentStep}
      <PracticePlayer step={currentStep} />

      <div class="mt-6 flex gap-4 justify-center">
        <button
          onclick={prevStep}
          disabled={currentStepIndex === 0}
          class="px-6 py-3 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-gray-100">
          ← Previous
        </button>
        <button
          onclick={nextStep}
          disabled={currentStepIndex === practiceSteps.length - 1}
          class="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          Next →
        </button>
      </div>
    {/if}
  {/if}
</div>
