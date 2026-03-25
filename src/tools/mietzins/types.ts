export interface MietzinsInput {
  /** Alter Referenzzinssatz in % (z.B. 1.75) */
  alterReferenzzins: number
  /** Neuer Referenzzinssatz in % (z.B. 1.25) */
  neuerReferenzzins: number
  /** Alter Landesindex der Konsumentenpreise */
  alterLIK: number
  /** Neuer Landesindex der Konsumentenpreise */
  neuerLIK: number
  /** Aktuelle Nettomiete in CHF */
  aktuelleNettomiete: number
  /** Allgemeine Kostensteigerung in % pro Jahr (z.B. 0.5) */
  kostensteigerungProJahr: number
  /** Anzahl Monate seit letzter Mietzinsanpassung */
  monate: number
}

export interface MietzinsResult {
  /** Veränderung durch Referenzzinssatz in % */
  referenzzinsVeraenderung: number
  /** Anzahl 0.25%-Schritte Differenz */
  referenzzinsSchritte: number
  /** Teuerungsausgleich in % */
  teuerungsausgleich: number
  /** Allgemeine Kostensteigerung in % */
  kostensteigerung: number
  /** Alte Nettomiete in CHF */
  alteNettomiete: number
  /** Neue Nettomiete in CHF */
  neueNettomiete: number
  /** Differenz in CHF */
  differenz: number
}

/** Kontext-Infos für die Ergebnis-Anzeige (aus dem Formular) */
export interface ResultContext {
  alterReferenzzins: number
  neuerReferenzzins: number
  alterLIKMonat: string
  neuerLIKMonat: string
  letzteAnpassung: string
}