<script>
  import { onMount, onDestroy } from "svelte";

  let { alphaTexTab } = $props();

  let viewport = $state(null);
  let main = $state(null);
  let api = $state(null);
  let isPlaying = $state(false);
  let isReady = $state(false);
  let loadingMessage = $state("Loading...");
  let currentTime = $state(0);
  let totalTime = $state(0);
  let tempo = $state(100);
  let previousTab = $state(null);
  let metronomeEnabled = $state(true);
  let countInEnabled = $state(true);

  onMount(async () => {
    if (!main || !viewport) return;

    const alphaTab = await import("@coderline/alphatab");

    api = new alphaTab.AlphaTabApi(main, {
      core: {
        fontDirectory: "/font/",
        tex: true,
      },
      display: {
        layoutMode: alphaTab.LayoutMode.Page,
        staveProfile: alphaTab.StaveProfile.Tab,
      },
      notation: {
        elements: {
          scoreTitle: false,
          scoreSubTitle: false,
          scoreArtist: false,
          scoreAlbum: false,
          guitarTuning: false,
          scoreCopyright: false,
        },
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        soundFont:
          "https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2",
        scrollElement: viewport,
      },
    });

    api.playerReady.on(() => {
      console.log("Player ready");
      isReady = true;
      loadingMessage = "";
    });

    api.playerStateChanged.on((e) => {
      console.log("Player state changed:", e.state);
      isPlaying = e.state === alphaTab.synth.PlayerState.Playing;
    });

    api.playerPositionChanged.on((e) => {
      currentTime = e.currentTime;
      totalTime = e.endTime;
    });

    api.renderStarted.on(() => {
      loadingMessage = "Rendering...";
    });

    api.renderFinished.on(() => {
      console.log("Render finished");
      loadingMessage = isReady ? "" : "Loading player...";
    });

    api.soundFontLoad.on((e) => {
      loadingMessage = `Loading sounds... ${Math.round((e.loaded / e.total) * 100)}%`;
    });

    api.error.on((error) => {
      console.error("AlphaTab error:", error);
    });

    console.log("Loading AlphaTex:", alphaTexTab);
    api.tex(alphaTexTab);
    api.playbackSpeed = tempo / 100;
    api.metronomeVolume = metronomeEnabled ? 1 : 0;
    api.countInVolume = countInEnabled ? 1 : 0;
    previousTab = alphaTexTab;
  });

  onDestroy(() => {
    if (api) {
      api.destroy();
    }
  });

  // Reload tab when alphaTexTab prop changes
  $effect(() => {
    if (api && alphaTexTab && alphaTexTab !== previousTab) {
      console.log("Tab changed, reloading:", alphaTexTab);
      previousTab = alphaTexTab;
      // Stop any current playback
      api.stop();
      // Reset time display
      currentTime = 0;
      totalTime = 0;
      // Load the new tab
      api.tex(alphaTexTab);
    }
  });

  function playPause() {
    if (!api || !isReady) return;
    api.playPause();
  }

  function stop() {
    if (!api) return;
    api.stop();
  }

  function updateTempo(newTempo) {
    tempo = newTempo;
    if (api) {
      api.playbackSpeed = tempo / 100;
    }
  }

  function toggleMetronome() {
    metronomeEnabled = !metronomeEnabled;
    if (api) {
      api.metronomeVolume = metronomeEnabled ? 1 : 0;
    }
  }

  function toggleCountIn() {
    countInEnabled = !countInEnabled;
    if (api) {
      api.countInVolume = countInEnabled ? 1 : 0;
    }
  }

  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<div class="alphatab-player">
  <div bind:this={viewport} class="alphatab-viewport">
    <div bind:this={main} class="alphatab-main"></div>
  </div>

  {#if loadingMessage}
    <div class="mt-2 text-sm text-blue-600 dark:text-blue-400">
      {loadingMessage}
    </div>
  {/if}

  <div
    class="controls mt-4 p-4 bg-white border border-gray-200 rounded dark:bg-blue-950 dark:border-blue-800">
    <div class="flex items-center gap-4 mb-4">
      <button
        onclick={playPause}
        disabled={!isReady}
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button
        onclick={stop}
        disabled={!isReady}
        class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
        ⏹
      </button>

      <div class="flex-1 text-sm text-gray-600 dark:text-gray-400">
        {formatTime(currentTime)} / {formatTime(totalTime)}
      </div>
    </div>

    <div class="flex items-center gap-4">
      <label for="tempo-slider" class="text-sm text-gray-600 dark:text-gray-400"
        >Tempo:</label>
      <input
        id="tempo-slider"
        type="range"
        min="50"
        max="200"
        value={tempo}
        oninput={(e) => updateTempo(parseInt(e.target.value))}
        class="flex-1"
        aria-label="Tempo adjustment" />
      <span class="text-sm font-mono dark:text-gray-300">{tempo}%</span>
    </div>

    <div
      class="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-blue-800">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={countInEnabled}
          onchange={toggleCountIn}
          class="w-4 h-4 accent-green-600" />
        <span class="text-sm text-gray-600 dark:text-gray-400">Count-in</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={metronomeEnabled}
          onchange={toggleMetronome}
          class="w-4 h-4 accent-green-600" />
        <span class="text-sm text-gray-600 dark:text-gray-400">Metronome</span>
      </label>
    </div>
  </div>
</div>

<style>
  .alphatab-viewport {
    min-height: 300px;
    max-height: 400px;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow-y: auto;
    background: white;
    position: relative;
  }

  .alphatab-main {
    padding: 20px;
  }

  :global(.dark) .alphatab-viewport {
    background: rgb(23 37 84);
    border-color: rgb(30 58 138 / 0.5);
  }

  /* Playback cursor styles */
  :global(.at-cursor-bar) {
    background: rgba(34, 197, 94, 0.2);
  }

  :global(.at-cursor-beat) {
    background: rgba(34, 197, 94, 0.9);
    width: 3px;
  }

  :global(.at-selection div) {
    background: rgba(34, 197, 94, 0.1);
  }

  :global(.at-highlight *) {
    fill: #16a34a;
    stroke: #16a34a;
  }

  input[type="range"] {
    accent-color: #16a34a;
  }
</style>
