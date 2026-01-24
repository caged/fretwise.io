export const prerender = false;

export function load({ params }) {
  // Use chord name directly from URL (e.g., "Cm", "CM7", "Ddim")
  const chordName = params.chord;

  return {
    chordName
  };
}
