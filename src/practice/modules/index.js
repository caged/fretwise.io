export { scalePatternModule } from './scalePatterns.js';
export { chordVoicingModule } from './chordVoicings.js';
export { tabExerciseModule, exampleExercises } from './tabExercises.js';

// Registry of all available practice modules
export const practiceModules = {
  'scale-patterns': () => import('./scalePatterns.js').then(m => m.scalePatternModule),
  'chord-voicings': () => import('./chordVoicings.js').then(m => m.chordVoicingModule),
  'tab-exercises': () => import('./tabExercises.js').then(m => m.tabExerciseModule)
};
