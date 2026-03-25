# Tools für Vermieter

Kleine Web-App mit Berechnungstools für Vermieter von Wohnungen in der Schweiz.

## Mietzinsanpassungs-Rechner

Berechnet die zulässige Mietzinsanpassung gemäss VMWG Art. 12–16 basierend auf drei Komponenten:

- **Referenzzinssatz** — Überwälzung gemäss Art. 13 VMWG (3% pro 0.25%-Schritt bei Sätzen unter 5%). Historische Sätze seit Einführung 2008 hinterlegt (Quelle: BWO).
- **Teuerungsausgleich** — 40% der Teuerung auf dem risikotragenden Kapital, basierend auf dem Landesindex der Konsumentenpreise (LIK). Monatliche Indexwerte auf den Basen 2010–2025 eingebettet (Quelle: BFS).
- **Allgemeine Kostensteigerung** — Konfigurierbare Jahrespauschale (Standard: 0.50% p.a. für Bern).

### Features

- Datum der letzten Anpassung steuert automatisch: Referenzzinssatz, LIK-Monat, Kostensteigerungsmonate
- LIK-Werte werden automatisch aus BFS-Daten befüllt — per Monatswahl, nicht manuelle Eingabe
- Berechnung immer auf gemeinsamer Basis (kein Rundungsfehler über Basisgrenzen hinweg)

## Tech Stack

- Vue 3 + TypeScript + Vite
- Scoped CSS (kein Framework)
- Vitest für Tests

## Entwicklung

```sh
npm install
npm run dev
```

Öffne http://localhost:5173

### Tests

```sh
npm test
```

### LIK-Daten aktualisieren

Die monatlichen LIK-Indexwerte stammen aus der BFS-Datei `cc-d-05.02.08.xlsx`. Bei neuen Monatswerten:

1. Excel herunterladen von [BFS Indexierungstabelle](https://www.bfs.admin.ch/bfs/de/home/statistiken/preise/landesindex-konsumentenpreise/indexierung.assetdetail.36483222.html)
2. `src/tools/mietzins/likData.ts` neu generieren (Sheet `Index_m`, Spalten 9–12 für Basen 2010–2025)
