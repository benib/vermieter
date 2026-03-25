/**
 * LIK-Basisjahre und Verkettungsfaktoren.
 *
 * Der Landesindex der Konsumentenpreise wird ca. alle 5 Jahre auf 100 rebasiert.
 * Um Werte verschiedener Basen vergleichen zu können, verwenden wir den
 * Indexstand im Dezember 2025 als gemeinsamen Ankerpunkt.
 *
 * Quelle: BFS Indexierungstabelle cc-d-05.02.08.xlsx, Zeile Dez. 2025
 */

export interface LIKBasis {
  label: string
  /** Indexstand im Dezember 2025 auf dieser Basis */
  indexDez2025: number
}

/**
 * Verfügbare LIK-Basen mit ihrem jeweiligen Dezember-2025-Indexwert.
 * Damit lässt sich jeder Wert von einer Basis in eine andere umrechnen:
 *
 *   wertInZiel = wertInQuelle × (zielBasis.indexDez2025 / quellBasis.indexDez2025)
 */
export const LIK_BASEN: Record<string, LIKBasis> = {
  '2005': { label: 'Dez. 2005 = 100', indexDez2025: 109.3 },
  '2010': { label: 'Dez. 2010 = 100', indexDez2025: 105.0 },
  '2015': { label: 'Dez. 2015 = 100', indexDez2025: 107.9 },
  '2020': { label: 'Dez. 2020 = 100', indexDez2025: 106.9 },
  '2025': { label: 'Dez. 2025 = 100', indexDez2025: 100.0 },
}

/**
 * Rechnet einen LIK-Indexwert von einer Basis in eine andere um.
 */
export function convertLIK(
  value: number,
  fromBasis: string,
  toBasis: string,
): number {
  if (fromBasis === toBasis) return value
  const from = LIK_BASEN[fromBasis]
  const to = LIK_BASEN[toBasis]
  if (!from || !to) return value
  return value * (to.indexDez2025 / from.indexDez2025)
}
