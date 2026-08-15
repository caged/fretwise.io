import { describe, it, expect } from "vitest";
import { Mode, Note, Scale } from "tonal";
import {
  CHORDS_DB_TUNING,
  getChordVariations,
} from "./chordFingerings.js";

// Every scale the UI offers in ScaleSelector, and every key in KeySelector.
// Mode.triads over this matrix is exactly what ScaleChords renders, so any
// combination that fails to resolve is a blank page in production.
const KEYS = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const SCALES = [
  "major",
  "minor",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "locrian",
  "harmonic minor",
  "melodic minor",
];

const TUNINGS = {
  Standard: ["E2", "A2", "D3", "G3", "B3", "E4"],
  "Half Step Down": ["Eb2", "Ab2", "Db3", "Gb3", "Bb3", "Eb4"],
  "Drop D": ["D2", "A2", "D3", "G3", "B3", "E4"],
  "Drop C": ["C2", "G2", "C3", "F3", "A3", "D4"],
};

/** Every triad the app can ask for, as [key, scale, chordName] tuples. */
function allTriads() {
  const out = [];
  for (const key of KEYS) {
    for (const scaleName of SCALES) {
      const scale = Scale.get(`${key} ${scaleName}`);
      let triads = [];
      try {
        triads = Mode.triads(scale.type, scale.tonic);
      } catch {
        continue;
      }
      for (const chord of triads) out.push([key, scaleName, chord]);
    }
  }
  return out;
}

/** Absolute fret of each string in an svguitar position, or null if muted. */
function absoluteFrets(position) {
  // svguitar numbers strings 1..6 high-to-low; return them low-to-high.
  const byString = new Map(position.fingers.map(([str, fret]) => [str, fret]));
  return [6, 5, 4, 3, 2, 1].map((str) => {
    const fret = byString.get(str);
    if (fret === "x" || fret === undefined) return null;
    if (fret === 0) return 0;
    return fret + position.position - 1;
  });
}

describe("chord lookup across every key and scale the UI offers", () => {
  const triads = allTriads();

  it("covers the full 12 keys x 9 scales matrix", () => {
    expect(triads.length).toBe(588);
  });

  // Regression for the crash on keys like Eb minor and Ab minor: Mode.triads
  // spells these with double accidentals (Cb, Fb, Bbb, Ebb, F##), which a
  // note-name-keyed lookup misses. getChordVariations returned null and the
  // render sites dereferenced it, blanking the whole page.
  it.each(triads)("resolves %s %s -> %s", (_key, _scale, chordName) => {
    const result = getChordVariations(chordName);
    expect(result).not.toBeNull();
    expect(result.positions.length).toBeGreaterThan(0);
  });
});

describe("enharmonic spellings resolve to the same fingerings", () => {
  // Left side is what Mode.triads produces; right side is the spelling
  // chords-db actually stores.
  it.each([
    ["Cb", "B"],
    ["Fb", "E"],
    ["Bbb", "A"],
    ["Ebb", "D"],
    ["F##", "G"],
    ["E#", "F"],
    ["B#", "C"],
    ["Cbm", "Bm"],
    ["F##dim", "Gdim"],
  ])("%s resolves identically to %s", (spelled, canonical) => {
    const a = getChordVariations(spelled);
    const b = getChordVariations(canonical);

    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a.positions).toEqual(b.positions);
  });

  it("still returns null for a chord that is not a chord", () => {
    expect(getChordVariations("InvalidChord")).toBeNull();
  });
});

describe("tuning-aware fingerings", () => {
  it("returns the database fingerings unchanged for standard tuning", () => {
    expect(getChordVariations("C", CHORDS_DB_TUNING)).toEqual(
      getChordVariations("C")
    );
  });

  it("frets the low string higher in Drop D", () => {
    const standard = getChordVariations("G", TUNINGS.Standard).positions[0];
    const dropD = getChordVariations("G", TUNINGS["Drop D"]).positions[0];

    // Open low E in standard G; two frets up in Drop D to sound the same G.
    expect(absoluteFrets(standard)[0]).toBe(3);
    expect(absoluteFrets(dropD)[0]).toBe(5);
  });

  it("shifts every string up one fret in Half Step Down", () => {
    const standard = getChordVariations("C", TUNINGS.Standard).positions[0];
    const halfStep = getChordVariations(
      "C",
      TUNINGS["Half Step Down"]
    ).positions[0];

    const before = absoluteFrets(standard);
    const after = absoluteFrets(halfStep);

    before.forEach((fret, i) => {
      if (fret === null) expect(after[i]).toBeNull();
      else expect(after[i]).toBe(fret + 1);
    });
  });

  it("preserves the sounding pitches in every supported tuning", () => {
    for (const chordName of ["C", "G", "Am", "F", "Bdim", "Dm7", "Emaj7"]) {
      const reference = getChordVariations(
        chordName,
        TUNINGS.Standard
      ).positions.map((p) => JSON.stringify(p.midi));

      for (const [label, tuning] of Object.entries(TUNINGS)) {
        const positions = getChordVariations(chordName, tuning).positions;
        expect(positions.length, `${chordName} in ${label}`).toBeGreaterThan(0);

        for (const position of positions) {
          expect(
            reference,
            `${chordName} in ${label} changed the voicing`
          ).toContain(JSON.stringify(position.midi));
        }
      }
    }
  });

  it("midi matches what the diagram actually shows", () => {
    for (const [, tuning] of Object.entries(TUNINGS)) {
      for (const chordName of ["C", "G", "F", "Am"]) {
        for (const position of getChordVariations(chordName, tuning)
          .positions) {
          const sounded = absoluteFrets(position)
            .map((fret, i) =>
              fret === null ? null : Note.midi(tuning[i]) + fret
            )
            .filter((note) => note !== null);
          expect(sounded).toEqual(position.midi);
        }
      }
    }
  });

  it("never emits a fret behind the nut", () => {
    for (const [, tuning] of Object.entries(TUNINGS)) {
      for (const [, , chordName] of allTriads()) {
        const result = getChordVariations(chordName, tuning);
        for (const position of result.positions) {
          expect(position.position).toBeGreaterThan(0);
          for (const [, fret] of position.fingers) {
            if (typeof fret === "number") expect(fret).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  // Seven-string support is a known gap: convertToSVGuitarFormat hardcodes a
  // six-string reversal (6 - i). Rather than emit wrong shapes we fall back to
  // the standard-tuning fingerings.
  it("falls back to standard fingerings for a seven-string tuning", () => {
    const sevenString = ["B2", "E2", "A2", "D3", "G3", "B3", "E4"];
    expect(getChordVariations("C", sevenString)).toEqual(
      getChordVariations("C")
    );
  });
});
