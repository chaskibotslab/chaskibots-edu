/**
 * Grade-based access policy for the platform's main program areas.
 *
 * Robótica and IA are available to every grade (content complexity scales
 * per level instead of being locked). Hacking and the AI-assisted CAD
 * generation require more abstract reasoning about risk/ethics and spatial
 * composition, so they open later — matching the existing `programs`
 * catalog (prog-8egb-hacking is the first hacking entry) and common
 * K-12 CS curricula (CSTA K-12 CS Standards, CyberStart/PicoCTF introduce
 * security concepts starting around middle school).
 */
export type ProgramArea = 'robotica' | 'ia' | 'diseno_visor' | 'hacking' | 'diseno_ia'

export const PROGRAM_MIN_GRADE: Record<ProgramArea, number> = {
  robotica: -Infinity,   // Inicial 1 (grade_number -1) and up
  ia: -Infinity,         // Inicial 2 and up ("IA para Niños")
  diseno_visor: 4,       // 4to EGB — basic 3D shape exploration (Tinkercad-style)
  hacking: 8,            // 8vo EGB — matches prog-8egb-hacking
  diseno_ia: 8,          // 8vo EGB — AI-composed 3D generation needs more abstraction
}

export function isProgramAvailable(area: ProgramArea, gradeNumber: number | null | undefined): boolean {
  if (gradeNumber === null || gradeNumber === undefined) return true // no level assigned yet — don't block
  return gradeNumber >= PROGRAM_MIN_GRADE[area]
}

const GRADE_LABELS: Record<number, string> = {
  [-1]: 'Inicial 1', 0: 'Inicial 2', 1: '1° EGB', 2: '2° EGB', 3: '3° EGB',
  4: '4° EGB', 5: '5° EGB', 6: '6° EGB', 7: '7° EGB', 8: '8° EGB',
  9: '9° EGB', 10: '10° EGB', 11: '1° BGU', 12: '2° BGU', 13: '3° BGU',
}

export function minGradeLabel(area: ProgramArea): string {
  const min = PROGRAM_MIN_GRADE[area]
  if (min === -Infinity) return 'Inicial 1'
  return GRADE_LABELS[min] || `grado ${min}`
}
