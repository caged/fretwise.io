import { Scale, Note } from 'tonal';
import { ModuleTypes, DisplayTypes } from '../types.js';
import frets from '../../frets/index.js';
import { tunings } from '$lib';

/**
 * Scale pattern practice module
 * Generates exercises for practicing scale positions across the neck
 */
export const scalePatternModule = {
  id: 'scale-patterns',
  name: 'Scale Patterns',
  description: 'Practice scale positions using different systems (CAGED, 3NPS, etc.)',
  type: ModuleTypes.SCALE,

  config: {
    systems: ['CAGED', '3NPS'],
    directions: ['ascending', 'descending', 'both'],
    keys: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    scaleTypes: ['major', 'minor', 'minor pentatonic', 'major pentatonic']
  },

  /**
   * Generate practice steps for scale patterns
   * @param {Object} options
   * @param {string} options.key - Key to practice in
   * @param {string} options.scaleType - Type of scale
   * @param {string} options.system - Position system (CAGED, 3NPS)
   * @param {string} options.direction - Direction to play
   * @param {number[]} [options.positions] - Which positions to practice (default: all)
   */
  generate(options) {
    const { key, scaleType, system, direction = 'both', positions } = options;
    const scale = Scale.get(`${key} ${scaleType}`);
    const tuning = tunings.get('Standard');
    const fretData = frets(tuning, 16, scale);

    const steps = [];
    const positionsToUse = positions || [1, 2, 3, 4, 5];

    positionsToUse.forEach(position => {
      // Filter fretboard data for this position
      const filteredStrings = fretData.strings.map(notes =>
        notes.map(note => {
          const isInPosition = note.positions[system]?.includes(position);
          return {
            ...note,
            inPosition: isInPosition && !!note.interval
          };
        })
      );

      // Generate MIDI sequence for this position
      const midi = generateScaleMIDI(filteredStrings, direction);

      steps.push({
        id: `${key}-${scaleType}-${system}-pos${position}-${direction}`,
        name: `${key} ${scaleType} - Position ${position}`,
        displayType: DisplayTypes.FRETBOARD,
        data: {
          scale,
          position,
          system,
          fretData: {
            ...fretData,
            strings: filteredStrings
          }
        },
        midi,
        description: `${direction} through position ${position}`
      });
    });

    return steps;
  }
};

/**
 * Generate MIDI note sequence from filtered fretboard data
 */
function generateScaleMIDI(strings, direction) {
  const notes = [];

  // Collect all notes in position from low to high string
  for (let stringIdx = strings.length - 1; stringIdx >= 0; stringIdx--) {
    const stringNotes = strings[stringIdx]
      .filter(note => note.inPosition)
      .sort((a, b) => a.fret - b.fret);

    stringNotes.forEach(note => {
      if (note.midi) {
        notes.push(note.midi);
      }
    });
  }

  if (direction === 'descending') {
    return notes.reverse();
  } else if (direction === 'both') {
    return [...notes, ...notes.slice().reverse()];
  }

  return notes;
}
