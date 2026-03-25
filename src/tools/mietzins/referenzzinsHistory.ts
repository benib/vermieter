/**
 * Historische Referenzzinssätze gemäss BWO.
 * Quelle: https://www.bwo.admin.ch/de/entwicklung-referenzzinssatz-und-durchschnittszinssatz
 *
 * Einträge nur bei effektiven Änderungen, sortiert chronologisch.
 * Das Datum ist der Tag der Bekanntgabe durch das BWO.
 */
const REFERENZZINS_AENDERUNGEN: { datum: string; satz: number }[] = [
  { datum: '2008-09-10', satz: 3.50 },
  { datum: '2009-06-03', satz: 3.25 },
  { datum: '2009-09-02', satz: 3.00 },
  { datum: '2010-12-02', satz: 2.75 },
  { datum: '2011-12-02', satz: 2.50 },
  { datum: '2012-06-02', satz: 2.25 },
  { datum: '2013-09-03', satz: 2.00 },
  { datum: '2015-06-02', satz: 1.75 },
  { datum: '2017-06-02', satz: 1.50 },
  { datum: '2020-03-03', satz: 1.25 },
  { datum: '2023-06-02', satz: 1.50 },
  { datum: '2023-12-02', satz: 1.75 },
  { datum: '2025-03-03', satz: 1.50 },
  { datum: '2025-09-02', satz: 1.25 },
]

/**
 * Gibt den Referenzzinssatz zurück, der in einem bestimmten Monat gültig war.
 * @param monat Format "YYYY-MM"
 */
export function referenzzinsFuerMonat(monat: string): number | null {
  // Letzten Tag des Monats als Vergleichsdatum verwenden
  const [jahr, mon] = monat.split('-').map(Number)
  const letzterTag = new Date(jahr, mon, 0) // letzter Tag des Monats

  let letzterSatz: number | null = null
  for (const eintrag of REFERENZZINS_AENDERUNGEN) {
    const d = new Date(eintrag.datum)
    if (d <= letzterTag) {
      letzterSatz = eintrag.satz
    } else {
      break
    }
  }
  return letzterSatz
}

/**
 * Gibt die wahrscheinliche LIK-Basis für einen bestimmten Monat zurück.
 * Die BFS wechselt die publizierte Basis jeweils ca. im Frühling
 * des übernächsten Jahres nach dem Basisjahr.
 */
export function likBasisFuerMonat(monat: string): string {
  const [jahr] = monat.split('-').map(Number)
  if (jahr >= 2026) return '2025'
  if (jahr >= 2022) return '2020'
  if (jahr >= 2017) return '2015'
  if (jahr >= 2012) return '2010'
  return '2005'
}

/**
 * Alle verfügbaren Referenzzinssätze (für Dropdown).
 */
export const REFERENZZINS_OPTIONEN = [
  1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 3.25, 3.50,
]
