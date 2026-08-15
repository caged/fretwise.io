import { Chord, Note } from 'tonal';
import guitar from '@tombatossals/chords-db/lib/guitar.json';

/**
 * The tuning that every fingering in chords-db is defined against, low string
 * first. Fingerings for any other tuning are derived from these by
 * `retunePosition` below.
 *
 * Deliberately a local constant rather than an import from `$lib`: this module
 * is unit-tested by vitest, which does not load the SvelteKit alias config.
 */
export const CHORDS_DB_TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

/**
 * chords-db keys its chord table by pitch class, using one fixed spelling per
 * chroma. Indexing by chroma (rather than by note name) means every enharmonic
 * spelling resolves, including double accidentals like Cb, Fb, Bbb and F##,
 * which a name-keyed lookup table misses.
 */
const CHROMA_TO_DB_KEY = [
  'C',
  'Csharp',
  'D',
  'Eb',
  'E',
  'F',
  'Fsharp',
  'G',
  'Ab',
  'A',
  'Bb',
  'B'
];

/** Highest fret we consider a fingering playable at. */
const MAX_FRET = 24;

/**
 * Get fingering positions for a chord using the chords-db library
 *
 * @param {string} chordName - The chord name (e.g., "Amin7", "C", "Gmaj7")
 * @returns {Object|null} Object with positions array and chord name, or null if not found
 *
 * @example
 * ```js
 * const result = getChordFingerings("Amin7");
 * // Returns:
 * // {
 * //   positions: [...],  // Array of positions with frets, fingers, barres, etc.
 * //   name: "Amin7"
 * // }
 *
 * const result2 = getChordFingerings("C#");
 * // Returns:
 * // {
 * //   positions: [...],
 * //   name: "Csharpmajor"
 * // }
 * ```
 */
export function getChordFingerings(chordName) {
  // Parse the chord using Tonal to get the tonic and suffix
  const chord = Chord.get(chordName);

  if (chord.empty) {
    console.warn(`Invalid chord: ${chordName}`);
    return null;
  }

  const tonic = chord.tonic;
  const suffix = chord.aliases?.[0] || chord.type;

  // Normalise the tonic to a pitch class index, then to the spelling chords-db
  // uses for that pitch. Going via chroma handles every enharmonic spelling —
  // including the double accidentals (Cb, Fb, Bbb, Ebb, F##) that Mode.triads
  // produces for keys like Eb minor and Ab minor.
  const { chroma } = Note.get(tonic);

  if (chroma === undefined) {
    console.warn(`Unknown tonic: ${tonic}`);
    return null;
  }

  const dbKey = CHROMA_TO_DB_KEY[chroma];

  // Find the chord in the database
  const chordData = guitar.chords[dbKey];

  if (!chordData) {
    console.warn(`No chords found for key: ${dbKey}`);
    return null;
  }

  // Search for matching suffix
  // Try exact match first, then try common variations
  const suffixVariations = [
    suffix,
    chord.type,
    ...chord.aliases
  ];

  for (const suffixVariant of suffixVariations) {
    const match = chordData.find(c => c.suffix === suffixVariant);
    if (match) {
      const name = `${dbKey}${suffixVariant}`;
      return {
        positions: match.positions,
        name
      };
    }
  }

  console.warn(`No fingerings found for ${chordName} (key: ${dbKey}, suffix: ${suffix})`);
  return null;
}

/**
 * Semitone offset per string between the chords-db reference tuning and a
 * target tuning. A positive value means the target string is tuned *lower*, so
 * every note on it must be fretted that many frets higher to sound the same
 * pitch.
 *
 * @param {string[]} tuning - Target tuning, low string first
 * @returns {number[]|null} Per-string offsets, or null if the tuning is not
 *   comparable (wrong string count, or unparseable note names)
 */
function tuningOffsets(tuning) {
  if (!Array.isArray(tuning) || tuning.length !== CHORDS_DB_TUNING.length) {
    return null;
  }

  const offsets = tuning.map((note, i) => {
    const target = Note.midi(note);
    const reference = Note.midi(CHORDS_DB_TUNING[i]);
    if (target === null || reference === null) return null;
    return reference - target;
  });

  return offsets.some((o) => o === null) ? null : offsets;
}

/**
 * Re-fret a chords-db position so it sounds the same pitches in a different
 * tuning.
 *
 * The voicing is preserved exactly — only the fret each string is stopped at
 * changes. In Drop D, for example, a shape that used the low E open now needs
 * that string at the 2nd fret. Notes that would fall behind the nut are muted,
 * and shapes that run off the end of the neck are dropped entirely.
 *
 * @param {Object} position - A chords-db position
 * @param {number[]} offsets - Per-string semitone offsets from `tuningOffsets`
 * @param {string[]} tuning - Target tuning, low string first
 * @returns {Object|null} A chords-db-shaped position, or null if unplayable
 */
function retunePosition(position, offsets, tuning) {
  const { frets, fingers, barres, baseFret = 1, capo } = position;

  // Work in absolute fret numbers: chords-db stores frets relative to baseFret,
  // with 0 meaning an open string and -1 a muted one.
  const toAbsolute = (fret) => (fret <= 0 ? fret : fret + baseFret - 1);

  const absolute = frets.map((fret, i) => {
    if (fret === -1 || fret === 'x') return -1;
    const shifted = toAbsolute(fret) + offsets[i];
    // Behind the nut: this string cannot sound the required pitch here.
    if (shifted < 0) return -1;
    return shifted;
  });

  if (absolute.every((fret) => fret === -1)) return null;
  if (absolute.some((fret) => fret > MAX_FRET)) return null;

  // A barre only survives if every string it covers moved by the same amount;
  // otherwise the strings no longer line up and we render individual dots.
  const absoluteBarres = [];
  const barresList = Array.isArray(barres) ? barres : barres ? [barres] : [];

  for (const barreFret of barresList) {
    const members = frets
      .map((fret, i) => (fret === barreFret ? i : -1))
      .filter((i) => i !== -1);

    if (members.length < 2) continue;
    if (members.some((i) => absolute[i] === -1)) continue;

    const shifts = new Set(members.map((i) => offsets[i]));
    if (shifts.size !== 1) continue;

    absoluteBarres.push(toAbsolute(barreFret) + offsets[members[0]]);
  }

  // Choose a display window: sit at the nut when the shape fits there,
  // otherwise start at the lowest fretted note.
  const fretted = absolute.filter((fret) => fret > 0);
  const highest = fretted.length ? Math.max(...fretted) : 0;
  const lowest = fretted.length ? Math.min(...fretted) : 0;
  const newBaseFret = highest <= 4 || !fretted.length ? 1 : lowest;

  const toRelative = (fret) => (fret <= 0 ? fret : fret - newBaseFret + 1);

  // Recompute the sounding pitches from the target tuning rather than reusing
  // the database's midi array, so playback matches what is drawn.
  const midi = absolute
    .map((fret, i) => (fret === -1 ? null : Note.midi(tuning[i]) + fret))
    .filter((note) => note !== null);

  return {
    frets: absolute.map(toRelative),
    fingers,
    barres: absoluteBarres.map(toRelative),
    baseFret: newBaseFret,
    capo: capo && absoluteBarres.length > 0,
    midi
  };
}

/**
 * Convert chords-db format to svguitar format
 *
 * @param {Object} position - A position object from chords-db
 * @returns {Object} Chord data formatted for svguitar with MIDI info preserved
 *
 * @example
 * ```js
 * const dbPosition = {
 *   frets: [-1, 3, 2, 0, 1, 0],
 *   fingers: [0, 3, 2, 0, 1, 0],
 *   baseFret: 1,
 *   barres: [],
 *   midi: [43, 48, 52, 55, 59, 64]
 * };
 *
 * const svguitarChord = convertToSVGuitarFormat(dbPosition);
 * // Returns:
 * // {
 * //   fingers: [[2, 3, '3'], [3, 2, '2'], [5, 1, '1']],
 * //   barres: [],
 * //   position: 1,
 * //   midi: [43, 48, 52, 55, 59, 64]
 * // }
 * ```
 */
export function convertToSVGuitarFormat(position) {
  const { frets, barres, baseFret = 1, midi } = position;

  const svguitarBarres = [];

  if (barres) {
    // Handle both number and array formats
    const barresList = Array.isArray(barres) ? barres : [barres];

    for (const barreFret of barresList) {
      // Find the range of strings for this barre
      const barreStrings = [];

      for (let i = 0; i < frets.length; i++) {
        if (frets[i] === barreFret) {
          const stringNumber = 6 - i;
          barreStrings.push(stringNumber);
        }
      }

      if (barreStrings.length > 1) {
        svguitarBarres.push({
          fromString: Math.max(...barreStrings),
          toString: Math.min(...barreStrings),
          fret: barreFret,
        });
      }
    }
  }

  // Convert fret positions to svguitar format
  // String numbering: chords-db uses 0-5 (low to high), svguitar uses 1-6 (high to low)
  const svguitarFingers = [];

  for (let i = 0; i < frets.length; i++) {
    const fret = frets[i];
    const stringNumber = 6 - i; // Reverse string order

    if (fret === -1 || fret === 'x') {
      // Muted string
      svguitarFingers.push([stringNumber, 'x']);
    } else if (fret === 0) {
      // Open string
      svguitarFingers.push([stringNumber, 0]);
    } else {
      // Fretted note
      svguitarFingers.push([stringNumber, fret]);
    }
  }

  const result = {
    fingers: svguitarFingers,
    barres: svguitarBarres,
    position: baseFret
  };

  // Include MIDI data if available
  if (midi) {
    result.midi = midi;
  }

  return result;
}

/**
 * Get all fingering variations for a chord in svguitar format
 *
 * When a tuning is supplied, fingerings are re-fretted so they sound the same
 * pitches in that tuning (see `retunePosition`). Tunings with a string count
 * other than six fall back to the standard-tuning fingerings — see the note on
 * seven-string support in the README.
 *
 * @param {string} chordName - The chord name (e.g., "Amin7", "C", "Gmaj7")
 * @param {string[]} [tuning] - Target tuning, low string first. Defaults to standard.
 * @returns {Object|null} `{ name, positions }` for svguitar, or null if not found
 *
 * @example
 * ```js
 * const variations = getChordVariations("C");
 * // Returns multiple fingering options, each ready to use with svguitar
 *
 * const dropD = getChordVariations("G", ["D2", "A2", "D3", "G3", "B3", "E4"]);
 * // Same G major voicings, with the low string fretted two frets higher
 * ```
 */
export function getChordVariations(chordName, tuning = CHORDS_DB_TUNING) {
  const result = getChordFingerings(chordName);

  if (!result) {
    return null;
  }

  const offsets = tuningOffsets(tuning);

  // No usable offsets (unsupported string count, unparseable notes) or nothing
  // to change: use the database fingerings as they stand.
  const positions =
    offsets && offsets.some((offset) => offset !== 0)
      ? result.positions
          .map((pos) => retunePosition(pos, offsets, tuning))
          .filter((pos) => pos !== null)
      : result.positions;

  return {
    name: result.name,
    positions: positions.map((pos) => convertToSVGuitarFormat(pos))
  };
}
