import { describe, it, expect } from 'vitest'
import {
  berechneReferenzzinsAenderung,
  berechneTeuerungsausgleich,
  berechneKostensteigerung,
  berechneMietzinsanpassung,
} from './calculator'
import { convertLIK } from './likBases'
import { referenzzinsFuerMonat, likBasisFuerMonat } from './referenzzinsHistory'
import { likWertePaarAufGemeinsamerBasis } from './likData'

describe('berechneReferenzzinsAenderung', () => {
  it('1 Schritt Erhöhung (1.25% → 1.50%): +3.00%', () => {
    const result = berechneReferenzzinsAenderung(1.25, 1.5)
    expect(result.veraenderung).toBe(3)
    expect(result.schritte).toBe(1)
  })

  it('2 Schritte Erhöhung (1.25% → 1.75%): +6.00%', () => {
    const result = berechneReferenzzinsAenderung(1.25, 1.75)
    expect(result.veraenderung).toBe(6)
    expect(result.schritte).toBe(2)
  })

  it('1 Schritt Senkung (1.50% → 1.25%): -2.91%', () => {
    const result = berechneReferenzzinsAenderung(1.5, 1.25)
    expect(result.veraenderung).toBe(-2.91)
    expect(result.schritte).toBe(-1)
  })

  it('2 Schritte Senkung (1.75% → 1.25%): -5.66%', () => {
    const result = berechneReferenzzinsAenderung(1.75, 1.25)
    expect(result.veraenderung).toBe(-5.66)
    expect(result.schritte).toBe(-2)
  })

  it('3 Schritte Senkung (2.00% → 1.25%): -8.26%', () => {
    const result = berechneReferenzzinsAenderung(2.0, 1.25)
    expect(result.veraenderung).toBe(-8.26)
    expect(result.schritte).toBe(-3)
  })

  it('4 Schritte Senkung (2.25% → 1.25%): -10.71%', () => {
    const result = berechneReferenzzinsAenderung(2.25, 1.25)
    expect(result.veraenderung).toBe(-10.71)
    expect(result.schritte).toBe(-4)
  })

  it('keine Änderung: 0%', () => {
    const result = berechneReferenzzinsAenderung(1.5, 1.5)
    expect(result.veraenderung).toBe(0)
    expect(result.schritte).toBe(0)
  })
})

/**
 * PROOF: Vollständige Verifikation der Referenzzins-Überwälzungssätze
 * gegen die offizielle HEV-Schweiz-Tabelle.
 *
 * Rechtsgrundlage: VMWG Art. 13 Abs. 1
 * - Erhöhung von 0.25%: max 3% (bei Referenzzins < 5%)
 * - Erhöhung von 0.25%: max 2.5% (bei Referenzzins 5-6%)
 * - Erhöhung von 0.25%: max 2% (bei Referenzzins > 6%)
 *
 * Bei Erhöhungen: einfache Addition (N Schritte × Satz)
 * Bei Senkungen: inverse Formel → Senkung = Erhöhung / (100 + Erhöhung) × 100
 *
 * Quelle: https://www.hev-schweiz.ch/vermieten/mietverhaeltnis/referenzzinssatz/ueberwaelzungssaetze
 */
describe('PROOF: Vollständige Überwälzungssätze-Tabelle (HEV Schweiz)', () => {
  // Offizielle Tabelle: [alterZins, neuerZins, erwarteteVeränderung]
  // Alle Werte aus der HEV-Schweiz-Tabelle für Referenzzinssätze < 5%
  const OFFIZIELLE_TABELLE: [number, number, number][] = [
    // === ERHÖHUNGEN (einfache Addition: N × 3%) ===
    [1.25, 1.50, +3.00],
    [1.25, 1.75, +6.00],
    [1.25, 2.00, +9.00],
    [1.25, 2.25, +12.00],
    [1.25, 2.50, +15.00],
    [1.25, 2.75, +18.00],
    [1.25, 3.00, +21.00],
    [1.25, 3.25, +24.00],
    [1.25, 3.50, +27.00],
    [1.25, 3.75, +30.00],
    [1.25, 4.00, +33.00],
    [1.50, 1.75, +3.00],
    [1.50, 2.00, +6.00],
    [1.50, 2.50, +12.00],
    [1.50, 3.00, +18.00],
    [1.50, 3.50, +24.00],
    [1.50, 4.00, +30.00],
    [1.75, 2.00, +3.00],
    [1.75, 2.50, +9.00],
    [1.75, 3.00, +15.00],
    [1.75, 3.50, +21.00],
    [1.75, 4.00, +27.00],
    [2.00, 2.50, +6.00],
    [2.00, 3.00, +12.00],
    [2.00, 4.00, +24.00],
    [2.50, 3.00, +6.00],
    [2.50, 3.50, +12.00],
    [2.50, 4.00, +18.00],
    [3.00, 3.50, +6.00],
    [3.00, 4.00, +12.00],
    [3.50, 4.00, +6.00],

    // === SENKUNGEN (inverse Formel: E/(100+E)×100) ===
    // 1 Schritt: 3/(100+3)×100 = 2.9126... ≈ 2.91
    [1.50, 1.25, -2.91],
    [1.75, 1.50, -2.91],
    [2.00, 1.75, -2.91],
    [2.25, 2.00, -2.91],
    [2.50, 2.25, -2.91],
    [3.00, 2.75, -2.91],
    [3.50, 3.25, -2.91],
    [4.00, 3.75, -2.91],
    // 2 Schritte: 6/(100+6)×100 = 5.6604... ≈ 5.66
    [1.75, 1.25, -5.66],
    [2.00, 1.50, -5.66],
    [2.50, 2.00, -5.66],
    [3.00, 2.50, -5.66],
    [3.50, 3.00, -5.66],
    [4.00, 3.50, -5.66],
    // 3 Schritte: 9/(100+9)×100 = 8.2569... ≈ 8.26
    [2.00, 1.25, -8.26],
    [2.25, 1.50, -8.26],
    [2.75, 2.00, -8.26],
    [3.25, 2.50, -8.26],
    [3.75, 3.00, -8.26],
    // 4 Schritte: 12/(100+12)×100 = 10.7143... ≈ 10.71
    [2.25, 1.25, -10.71],
    [2.50, 1.50, -10.71],
    [3.00, 2.00, -10.71],
    [3.50, 2.50, -10.71],
    [4.00, 3.00, -10.71],
    // 5 Schritte: 15/(100+15)×100 = 13.0435... ≈ 13.04
    [2.50, 1.25, -13.04],
    [2.75, 1.50, -13.04],
    [3.25, 2.00, -13.04],
    [3.75, 2.50, -13.04],
    // 6 Schritte: 18/(100+18)×100 = 15.2542... ≈ 15.25
    [2.75, 1.25, -15.25],
    [3.00, 1.50, -15.25],
    [3.50, 2.00, -15.25],
    [4.00, 2.50, -15.25],
    // 7 Schritte: 21/(100+21)×100 = 17.3554... ≈ 17.36
    [3.00, 1.25, -17.36],
    [3.25, 1.50, -17.36],
    [3.75, 2.00, -17.36],
    // 8 Schritte: 24/(100+24)×100 = 19.3548... ≈ 19.35
    [3.25, 1.25, -19.35],
    [3.50, 1.50, -19.35],
    [4.00, 2.00, -19.35],
    // 9 Schritte: 27/(100+27)×100 = 21.2598... ≈ 21.26
    [3.50, 1.25, -21.26],
    [3.75, 1.50, -21.26],
    // 10 Schritte: 30/(100+30)×100 = 23.0769... ≈ 23.08
    [3.75, 1.25, -23.08],
    [4.00, 1.50, -23.08],
    // 11 Schritte: 33/(100+33)×100 = 24.8120... ≈ 24.81
    [4.00, 1.25, -24.81],
  ]

  it.each(OFFIZIELLE_TABELLE)(
    'Referenzzins %f% → %f%: erwartet %f%',
    (alterZins, neuerZins, erwartet) => {
      const result = berechneReferenzzinsAenderung(alterZins, neuerZins)
      expect(result.veraenderung).toBe(erwartet)
    },
  )

  // Mathematischer Beweis der Senkungsformel:
  // Wenn eine Miete M um E% erhöht wird: M_neu = M × (1 + E/100)
  // Um dieselbe Miete M_neu wieder auf M zu senken:
  // M = M_neu × (1 - S/100)  →  S = (1 - M/M_neu) × 100
  //   = (1 - 1/(1 + E/100)) × 100
  //   = (E/100 / (1 + E/100)) × 100
  //   = E / (100 + E) × 100
  //
  // Beispiel: E = 3%
  //   S = 3 / (100 + 3) × 100 = 2.9126...% ≈ 2.91%
  //
  // Dies stellt sicher, dass Erhöhung + Senkung symmetrisch sind:
  // 1000 CHF × 1.03 = 1030 CHF → 1030 CHF × (1 - 0.0291...) = 1000 CHF
  it('Symmetrie-Beweis: Erhöhung gefolgt von Senkung ergibt Originalmiete', () => {
    const miete = 1500
    for (let schritte = 1; schritte <= 11; schritte++) {
      const erhoehung = schritte * 3
      const senkung = (erhoehung / (100 + erhoehung)) * 100
      const nachErhoehung = miete * (1 + erhoehung / 100)
      const nachSenkung = nachErhoehung * (1 - senkung / 100)
      expect(nachSenkung).toBeCloseTo(miete, 10) // exakt auf 10 Dezimalstellen
    }
  })

  // Beweis: Jede Senkung in der Tabelle ist exakt = N×3 / (100 + N×3) × 100, gerundet auf 2 Dezimalen
  it('Formel-Beweis: Alle Senkungswerte folgen exakt der inversen Formel', () => {
    for (let n = 1; n <= 11; n++) {
      const erhoehung = n * 3
      const berechnet = Math.round((erhoehung / (100 + erhoehung)) * 10000) / 100
      const alterZins = 1.25 + n * 0.25
      const result = berechneReferenzzinsAenderung(alterZins, 1.25)
      expect(Math.abs(result.veraenderung)).toBe(berechnet)
    }
  })
})

describe('LIK-Basisumrechnung', () => {

  it('gleiche Basis: keine Umrechnung', () => {
    expect(convertLIK(106.9, '2020', '2020')).toBe(106.9)
  })

  it('Basis 2020 → 2025: Dez 2025 war 106.9 auf Basis 2020, also 100 auf Basis 2025', () => {
    // 106.9 (Basis 2020) × (100/106.9) = 100.0
    expect(convertLIK(106.9, '2020', '2025')).toBeCloseTo(100.0, 1)
  })

  it('Basis 2025 → 2020: 100 (Basis 2025) → 106.9 (Basis 2020)', () => {
    expect(convertLIK(100.0, '2025', '2020')).toBeCloseTo(106.9, 1)
  })

  it('Basis 2015 → 2025: Dez 2025 war 107.9 auf Basis 2015, also 100 auf Basis 2025', () => {
    expect(convertLIK(107.9, '2015', '2025')).toBeCloseTo(100.0, 1)
  })

  it('Praxisbeispiel: Alter LIK 104.5 (Basis 2020), neuer LIK 100.5 (Basis 2025)', () => {
    // Alter umrechnen auf Basis 2025: 104.5 × (100/106.9) = 97.75...
    const alterAufBasis2025 = convertLIK(104.5, '2020', '2025')
    expect(alterAufBasis2025).toBeCloseTo(97.75, 1)
    // Teuerung: (100.5 - 97.75) / 97.75 × 100 × 40% = positiv
    const teuerung = ((100.5 - alterAufBasis2025) / alterAufBasis2025) * 100 * 0.4
    expect(teuerung).toBeGreaterThan(0)
  })
})

describe('Referenzzinssatz-History Lookup', () => {
  it('vor Einführung (2008-08): null', () => {
    expect(referenzzinsFuerMonat('2008-08')).toBeNull()
  })

  it('Einführung Sep 2008: 3.50%', () => {
    expect(referenzzinsFuerMonat('2008-09')).toBe(3.50)
  })

  it('Jun 2009: 3.25% (nach erster Senkung)', () => {
    expect(referenzzinsFuerMonat('2009-06')).toBe(3.25)
  })

  it('Mai 2009: noch 3.50% (vor der Senkung am 3.6.)', () => {
    expect(referenzzinsFuerMonat('2009-05')).toBe(3.50)
  })

  it('Jan 2020: 1.50% (vor Senkung im März)', () => {
    expect(referenzzinsFuerMonat('2020-01')).toBe(1.50)
  })

  it('Mär 2020: 1.25% (nach Senkung)', () => {
    expect(referenzzinsFuerMonat('2020-03')).toBe(1.25)
  })

  it('Jun 2023: 1.50%', () => {
    expect(referenzzinsFuerMonat('2023-06')).toBe(1.50)
  })

  it('Dez 2023: 1.75%', () => {
    expect(referenzzinsFuerMonat('2023-12')).toBe(1.75)
  })

  it('Sep 2025: 1.25%', () => {
    expect(referenzzinsFuerMonat('2025-09')).toBe(1.25)
  })

  it('Mär 2026 (aktuell): 1.25%', () => {
    expect(referenzzinsFuerMonat('2026-03')).toBe(1.25)
  })
})

describe('LIK-Basis für Monat', () => {
  it('2021-06: Basis 2015 (noch nicht gewechselt)', () => {
    expect(likBasisFuerMonat('2021-06')).toBe('2015')
  })

  it('2022-01: Basis 2020', () => {
    expect(likBasisFuerMonat('2022-01')).toBe('2020')
  })

  it('2025-12: Basis 2020', () => {
    expect(likBasisFuerMonat('2025-12')).toBe('2020')
  })

  it('2026-01: Basis 2025', () => {
    expect(likBasisFuerMonat('2026-01')).toBe('2025')
  })
})

describe('LIK gemeinsame Basis (kein Rundungsfehler über Basisgrenzen)', () => {
  it('107.4 Basis 2020 auf 100.6 Basis 2025 = gleich wie 107.4 auf 107.6 Basis 2020', () => {
    // Feb 2025: Basis 2020 = 107.4, Feb 2026: Basis 2020 = 107.6, Basis 2025 = 100.6
    // Ohne gemeinsame Basis: convertLIK(107.4, '2020', '2025') = 107.4 * 100/106.9 = 100.467...
    // Teuerung mit Umrechnung: (100.6 - 100.467) / 100.467 ≠ (107.6 - 107.4) / 107.4
    // Mit gemeinsamer Basis: beide auf 2020 → (107.6 - 107.4) / 107.4 → exakt korrekt
    const paar = likWertePaarAufGemeinsamerBasis('2025-02', '2026-02')
    expect(paar).not.toBeNull()
    expect(paar!.basis).toBe('2020') // neueste gemeinsame Basis
    expect(paar!.alterWert).toBe(107.4)
    expect(paar!.neuerWert).toBe(107.6)

    const teuerung = berechneTeuerungsausgleich(paar!.alterWert, paar!.neuerWert)
    const teuerungGleicheBasis = berechneTeuerungsausgleich(107.4, 107.6)
    expect(teuerung).toBe(teuerungGleicheBasis)
  })

  it('findet neueste gemeinsame Basis', () => {
    // Dez 2025 hat Basen 2010, 2015, 2020, 2025 — Feb 2026 ebenso
    const paar = likWertePaarAufGemeinsamerBasis('2025-12', '2026-02')
    expect(paar).not.toBeNull()
    expect(paar!.basis).toBe('2025')
  })

  it('Monate die nur alte Basis haben', () => {
    // 2014-06 hat nur Basis 2010, 2016-06 hat 2010 + 2015
    const paar = likWertePaarAufGemeinsamerBasis('2014-06', '2016-06')
    expect(paar).not.toBeNull()
    expect(paar!.basis).toBe('2010')
  })
})

describe('berechneTeuerungsausgleich', () => {
  it('Merkblatt Beispiel 1: LIK 100.4 → 106.0 = +2.23%', () => {
    const result = berechneTeuerungsausgleich(100.4, 106.0)
    expect(result).toBeCloseTo(2.23, 2)
  })

  it('Merkblatt Beispiel 2 (Senkung): LIK 102.2 → 101.9 = -0.12%', () => {
    const result = berechneTeuerungsausgleich(102.2, 101.9)
    expect(result).toBeCloseTo(-0.12, 2)
  })

  it('Merkblatt Beispiel 2 (Seite 4): LIK 102.4 → 106.9 = +1.76%', () => {
    const result = berechneTeuerungsausgleich(102.4, 106.9)
    expect(result).toBeCloseTo(1.76, 2)
  })
})

describe('berechneKostensteigerung', () => {
  it('Merkblatt Beispiel 1: 0.5% p.a., 33 Monate = 1.38%', () => {
    // 2 Jahre 9 Monate = 33 Monate
    const result = berechneKostensteigerung(0.5, 33)
    expect(result).toBeCloseTo(1.375, 2)
  })

  it('Merkblatt Beispiel 2: 0.5% p.a., 49 Monate = 2.04%', () => {
    // 4 Jahre 1 Monat = 49 Monate
    const result = berechneKostensteigerung(0.5, 49)
    expect(result).toBeCloseTo(2.04, 2)
  })
})

describe('berechneMietzinsanpassung (Gesamtberechnung)', () => {
  it('Merkblatt Beispiel 1: Anstieg 1.25% → 1.50%, Total +6.61%', () => {
    const result = berechneMietzinsanpassung({
      alterReferenzzins: 1.25,
      neuerReferenzzins: 1.5,
      alterLIK: 100.4,
      neuerLIK: 106.0,
      aktuelleNettomiete: 1000,
      kostensteigerungProJahr: 0.5,
      monate: 33,
    })

    expect(result.referenzzinsVeraenderung).toBe(3)
    expect(result.teuerungsausgleich).toBeCloseTo(2.23, 1)
    expect(result.kostensteigerung).toBeCloseTo(1.38, 1)
    // Total ~+6.61% → bei 1000 CHF = ~66.10 CHF Differenz
    expect(result.differenz).toBeCloseTo(66.10, 0)
  })

  it('Merkblatt Beispiel 2: Senkung 1.50% → 1.25%, Total +0.89%', () => {
    const result = berechneMietzinsanpassung({
      alterReferenzzins: 1.5,
      neuerReferenzzins: 1.25,
      alterLIK: 102.4,
      neuerLIK: 106.9,
      aktuelleNettomiete: 1000,
      kostensteigerungProJahr: 0.5,
      monate: 49,
    })

    expect(result.referenzzinsVeraenderung).toBe(-2.91)
    expect(result.teuerungsausgleich).toBeCloseTo(1.76, 1)
    expect(result.kostensteigerung).toBeCloseTo(2.04, 1)
    // Total ~+0.89% → bei 1000 CHF = ~8.90 CHF Differenz
    expect(result.differenz).toBeCloseTo(8.90, 0)
  })
})
