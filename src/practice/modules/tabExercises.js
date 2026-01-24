import { DisplayTypes, ModuleTypes } from "../types.js";

/**
 * Tab-based exercise module using AlphaTab
 * Loads and plays exercises written in AlphaTex format
 */
export const tabExerciseModule = {
  id: "tab-exercises",
  name: "Tab Exercises",
  description: "Practice from tab notation with playback",
  type: ModuleTypes.TAB,

  config: {
    categories: ["technique", "riffs", "etudes", "warm-ups"],
  },

  /**
   * Generate practice steps from tab exercises
   * @param {Object} options
   * @param {Array<{name: string, alphaTexTab: string, description?: string}>} options.exercises
   */
  generate(options) {
    const { exercises } = options;

    return exercises.map((exercise, idx) => ({
      id: `tab-exercise-${idx}`,
      name: exercise.name,
      displayType: DisplayTypes.TAB,
      data: {
        alphaTexTab: exercise.alphaTexTab,
      },
      alphaTexTab: exercise.alphaTexTab,
      description: exercise.description || `Tab exercise: ${exercise.name}`,
    }));
  },
};

/**
 * Example tab exercises in AlphaTex format
 * See: https://alphatab.net/docs/alphatex/introduction
 */
export const exampleExercises = [
  {
    name: "Chromatic Exercise",
    description: "Four-finger chromatic warm-up across all strings",
    alphaTexTab: `\\title "Chromatic Exercise"
\\tempo 100
\\instrument 28
.
:4 1.6 2.6 3.6 4.6 | 1.5 2.5 3.5 4.5 | 1.4 2.4 3.4 4.4 | 1.3 2.3 3.3 4.3`,
  },
  {
    name: "Alternate Picking",
    description: "Practice alternate picking across all strings",
    alphaTexTab: `\\title "Alternate Picking"
\\tempo 100
\\instrument 28
.
:16 5.6 5.6 5.5 5.5 5.4 5.4 5.3 5.3 | 5.2 5.2 5.1 5.1 5.2 5.2 5.3 5.3 |
7.6 7.6 7.5 7.5 7.4 7.4 7.3 7.3 | 7.2 7.2 7.1 7.1 7.2 7.2 7.3 7.3`,
  },
  {
    name: "C Major Scale (CAGED)",
    description: "C major scale - all five CAGED positions",
    alphaTexTab: `\\title "C Major Scale (CAGED)"
\\tempo 100
\\instrument 28
.
\\section "C"
:8 0.6 1.6 3.6 0.5 2.5 3.5 0.4 2.4 | 3.4 0.3 2.3 0.2 1.2 3.2 0.1 1.1 |
3.1 1.1 0.1 3.2 1.2 0.2 2.3 0.3 | 3.4 2.4 0.4 3.5 2.5 0.5 3.6 1.6 | :2 0.6 r |
\\section "A"
:8 3.6 5.6 2.5 3.5 5.5 2.4 3.4 5.4 | 2.3 4.3 5.3 3.2 5.2 6.2 3.1 5.1 |
5.1 3.1 6.2 5.2 3.2 5.3 4.3 2.3 | 5.4 3.4 2.4 5.5 3.5 2.5 5.6 3.6 |
\\section "G"
:8 5.6 7.6 8.6 5.5 7.5 8.5 5.4 7.4 | 4.3 5.3 7.3 5.2 6.2 8.2 5.1 7.1 |
8.1 7.1 5.1 8.2 6.2 5.2 7.3 5.3 | 4.3 7.4 5.4 8.5 7.5 5.5 8.6 7.6 | :2 5.6 r |
\\section "E"
:8 7.6 8.6 10.6 7.5 8.5 10.5 7.4 9.4 | 10.4 7.3 9.3 10.3 8.2 10.2 7.1 8.1 |
10.1 8.1 7.1 10.2 8.2 10.3 9.3 7.3 | 10.4 9.4 7.4 10.5 8.5 7.5 10.6 8.6 | :2 7.6 r |
\\section "D"
:8 10.6 12.6 13.6 10.5 12.5 9.4 10.4 12.4 | 9.3 10.3 12.3 10.2 12.2 13.2 10.1 12.1 |
13.1 12.1 10.1 13.2 12.2 10.2 12.3 10.3 | 9.3 12.4 10.4 9.4 12.5 10.5 13.6 12.6 | :2 10.6 r`,
  },
  {
    name: "Spider Exercise",
    description: "Classic finger independence exercise",
    alphaTexTab: `\\title "Spider Exercise"
\\tempo 70
\\instrument 28
.
:4 1.6 2.5 3.4 4.3 | 1.5 2.4 3.3 4.2 | 4.3 3.4 2.5 1.6 | 4.2 3.3 2.4 1.5`,
  },
  {
    name: "String Skipping",
    description: "Practice skipping strings for wider intervals",
    alphaTexTab: `\\title "String Skipping"
\\tempo 80
\\instrument 28
.
:8 5.6 r 5.4 r 5.6 r 5.4 r | 7.5 r 7.3 r 7.5 r 7.3 r |
5.6 5.4 5.6 5.4 7.5 7.3 7.5 7.3 | 5.4 5.6 7.3 7.5 5.4 5.6 7.3 7.5`,
  },
  {
    name: "Minor Pentatonic Box 1",
    description: "A minor pentatonic pattern in first position",
    alphaTexTab: `\\title "Am Pentatonic"
\\tempo 90
\\instrument 28
.
:8 5.6 8.6 5.5 7.5 5.4 7.4 5.3 7.3 | 5.2 8.2 5.1 8.1 8.1 5.1 8.2 5.2 |
7.3 5.3 7.4 5.4 7.5 5.5 8.6 5.6 | 5.6 8.6 5.5 7.5 5.4 7.4 5.3 7.3`,
  },
  {
    name: "Hammer-ons & Pull-offs",
    description: "Legato exercise - hammer-ons go up, pull-offs go down",
    alphaTexTab: `\\title "Legato Exercise"
\\tempo 80
\\instrument 28
.
\\tuning E2 A2 D3 G3 B3 E4
:8 3.3{h} 5.3 5.3{h} 3.3 3.3{h} 5.3 5.3{h} 3.3 | 3.4{h} 5.4 5.4{h} 3.4 3.4{h} 5.4 5.4{h} 3.4 |
5.3{h} 7.3 7.3{h} 5.3 5.3{h} 7.3 7.3{h} 5.3 | 5.4{h} 7.4 7.4{h} 5.4 5.4{h} 7.4 7.4{h} 5.4`,
  },
  {
    name: "Bending Exercise",
    description: "Practice string bends - half bends and full bends",
    alphaTexTab: `\\title "Bending Exercise"
\\tempo 70
\\instrument 28
.
\\tuning E2 A2 D3 G3 B3 E4
:4 7.3{b (0 4)} 7.3 7.3{b (0 4 4 0)} 7.3 | 5.2{b (0 4)} 5.2 5.2{b (0 4 4 0)} 5.2 |
:4 7.3{b (0 2)} 7.3 7.3{b (0 2 2 0)} 7.3 | 5.2{b (0 2)} 5.2 5.2{b (0 2 2 0)} 5.2`,
  },
  {
    name: "Combined Techniques",
    description: "Hammer-ons, pull-offs, bends, and slides in one exercise",
    alphaTexTab: `\\title "Combined Techniques"
\\tempo 75
\\instrument 28
.
\\tuning E2 A2 D3 G3 B3 E4
:8 5.3{h} 7.3 7.3{h} 5.3 5.3{sl} 7.3 7.3{sl} 9.3 | 9.3{b (0 4)} r 7.3{b (0 2 2 0)} r 5.3 7.3 5.3 r |
:8 5.4{h} 7.4 7.4{h} 5.4 5.4{ss} 7.4 7.4{ss} 9.4 | 9.4{b (0 4 4 0)} r :4 7.4{sod} r`,
  },
];
