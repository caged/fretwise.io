import { getChordVariations } from '../../frets/chordFingerings.js';
import { tunings } from '$lib';
import { ModuleTypes, DisplayTypes } from '../types.js';

/**
 * Chord voicing practice module
 * Generates exercises for practicing different chord positions
 */
export const chordVoicingModule = {
  id: 'chord-voicings',
  name: 'Chord Voicings',
  description: 'Practice alternate voicings and positions for chords',
  type: ModuleTypes.CHORD,

  config: {
    chordTypes: ['', 'm', '7', 'maj7', 'm7', 'dim', 'aug'],
    roots: ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  },

  /**
   * Generate practice steps for chord voicings
   * @param {Object} options
   * @param {string[]} options.chords - Array of chord names to practice
   * @param {boolean} options.allPositions - Practice all positions or just common ones
   */
  generate(options) {
    const { chords, allPositions = true } = options;
    const tuning = tunings.get('Standard');
    const steps = [];

    chords.forEach(chordName => {
      const variations = getChordVariations(chordName, tuning);

      variations.positions.forEach((chordData, idx) => {
        // Skip if not practicing all positions and this is beyond position 3
        if (!allPositions && idx > 2) return;

        steps.push({
          id: `${chordName}-pos${idx}`,
          name: `${chordName} - Position ${idx + 1}`,
          displayType: DisplayTypes.CHORD,
          data: {
            chordName,
            position: idx,
            tuning,
            chordData
          },
          midi: chordData.midi,
          description: `${chordName} chord at position ${idx + 1}`
        });
      });
    });

    return steps;
  }
};
