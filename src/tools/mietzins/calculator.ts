import type { MietzinsInput, MietzinsResult } from './types'

/**
 * Berechnet die Mietzinsänderung durch Referenzzinssatz gemäss VMWG Art. 13.
 *
 * Pro 0.25%-Schritt:
 * - Referenzzins < 5%: 3% Mietzinsänderung
 * - Referenzzins 5-6%: 2.5%
 * - Referenzzins > 6%: 2%
 *
 * Erhöhungen: einfache Addition (Schritte × Satz)
 * Senkungen: inverse Formel (Erhöhung / (100 + Erhöhung) × 100)
 */
export function berechneReferenzzinsAenderung(
  alterZins: number,
  neuerZins: number,
): { veraenderung: number; schritte: number } {
  const schritte = Math.round((neuerZins - alterZins) / 0.25)

  if (schritte === 0) {
    return { veraenderung: 0, schritte: 0 }
  }

  const absSchritte = Math.abs(schritte)

  // Bestimme den Satz pro Schritt basierend auf dem Zinsniveau.
  // Bei Raten unter 5% gilt 3%, bei 5-6% gilt 2.5%, darüber 2%.
  // Für die Bestimmung des Niveaus ist der höhere der beiden Sätze massgebend.
  const maxZins = Math.max(alterZins, neuerZins)
  let satzProSchritt: number
  if (maxZins > 6) {
    satzProSchritt = 2
  } else if (maxZins >= 5) {
    satzProSchritt = 2.5
  } else {
    satzProSchritt = 3
  }

  const erhoehungProzent = absSchritte * satzProSchritt

  if (schritte > 0) {
    // Erhöhung: einfache Addition
    return { veraenderung: erhoehungProzent, schritte }
  } else {
    // Senkung: inverse Formel
    const senkung = (erhoehungProzent / (100 + erhoehungProzent)) * 100
    return { veraenderung: -round2(senkung), schritte }
  }
}

/**
 * Berechnet den Teuerungsausgleich nach LIK.
 * Formel: ((neuerLIK - alterLIK) / alterLIK) × 100 × 40%
 *
 * 40% weil Standardfinanzierung = 40% Eigenkapital / 60% Fremdkapital.
 * Nur der Eigenkapitalanteil wird teuerungsbereinigt.
 */
export function berechneTeuerungsausgleich(
  alterLIK: number,
  neuerLIK: number,
): number {
  if (alterLIK <= 0) return 0
  return ((neuerLIK - alterLIK) / alterLIK) * 100 * 0.4
}

/**
 * Berechnet die allgemeine Kostensteigerung.
 * Formel: Jahressatz × (Monate / 12)
 */
export function berechneKostensteigerung(
  jahressatz: number,
  monate: number,
): number {
  return jahressatz * (monate / 12)
}

/**
 * Berechnet die gesamte Mietzinsanpassung.
 * Die drei Komponenten werden additiv auf Prozentebene kombiniert.
 */
export function berechneMietzinsanpassung(input: MietzinsInput): MietzinsResult {
  const { veraenderung: referenzzinsVeraenderung, schritte } =
    berechneReferenzzinsAenderung(input.alterReferenzzins, input.neuerReferenzzins)

  const teuerungsausgleich = berechneTeuerungsausgleich(
    input.alterLIK,
    input.neuerLIK,
  )

  const kostensteigerung = berechneKostensteigerung(
    input.kostensteigerungProJahr,
    input.monate,
  )

  // Total aus ungerundeten Einzelwerten berechnen
  const totalUngerundet =
    referenzzinsVeraenderung + teuerungsausgleich + kostensteigerung

  const neueNettomieteExakt =
    input.aktuelleNettomiete * (1 + totalUngerundet / 100)

  // Differenz auf Rappen gerundet (für Total-Zeile)
  const differenzExakt = neueNettomieteExakt - input.aktuelleNettomiete
  const differenz = round2(differenzExakt)

  // Neue Miete auf ganze Franken abgerundet (für Schlussresultat)
  const neueNettomiete = Math.floor(neueNettomieteExakt)

  return {
    referenzzinsVeraenderung: round2(referenzzinsVeraenderung),
    referenzzinsSchritte: schritte,
    teuerungsausgleich: round2(teuerungsausgleich),
    kostensteigerung: round2(kostensteigerung),
    alteNettomiete: input.aktuelleNettomiete,
    neueNettomiete,
    differenz,
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
