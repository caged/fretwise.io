/**
 * @typedef {Object} PracticeModule
 * @property {string} id - Unique identifier for the module
 * @property {string} name - Display name
 * @property {string} description - Brief description
 * @property {'scale' | 'chord' | 'tab' | 'technique'} type - Module type
 * @property {Object} config - Configuration options
 * @property {function(Object): PracticeStep[]} generate - Generates practice steps
 */

/**
 * @typedef {Object} PracticeStep
 * @property {string} id - Unique identifier for the step
 * @property {string} name - Display name for this step
 * @property {'fretboard' | 'chord' | 'tab'} displayType - How to render this step
 * @property {Object} data - Data needed to render/play this step
 * @property {number[]} [midi] - MIDI notes to play
 * @property {string} [alphaTexTab] - AlphaTex format for tab display
 */

/**
 * @typedef {Object} PracticeRoutine
 * @property {string} id - Unique identifier
 * @property {string} name - Routine name
 * @property {string} description - Description
 * @property {PracticeModule[]} modules - Modules in this routine
 * @property {Object} settings - Global settings (tempo, repetitions, etc.)
 */

export const ModuleTypes = {
  SCALE: 'scale',
  CHORD: 'chord',
  TAB: 'tab',
  TECHNIQUE: 'technique'
};

export const DisplayTypes = {
  FRETBOARD: 'fretboard',
  CHORD: 'chord',
  TAB: 'tab'
};
