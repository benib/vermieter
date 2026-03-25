<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import type { MietzinsResult, ResultContext } from './types'
import { berechneMietzinsanpassung } from './calculator'
import {
  referenzzinsFuerMonat,
  REFERENZZINS_OPTIONEN,
} from './referenzzinsHistory'
import { likWertePaarAufGemeinsamerBasis, LIK_LETZTER_MONAT } from './likData'

const MONATE_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function defaultLetzteAnpassung(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 2)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function aktuellerMonat(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function zweiMonateZurueck(monat: string): string {
  const [j, m] = monat.split('-').map(Number)
  const d = new Date(j, m - 3, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const defaultMonat = defaultLetzteAnpassung()
const jetzt = aktuellerMonat()

const form = reactive({
  letzteAnpassung: defaultMonat,
  alterReferenzzins: referenzzinsFuerMonat(defaultMonat) ?? 1.75,
  neuerReferenzzins: referenzzinsFuerMonat(jetzt) ?? 1.25,
  alterLIKMonat: zweiMonateZurueck(defaultMonat),
  neuerLIKMonat: LIK_LETZTER_MONAT,
  aktuelleNettomiete: 1500,
  kostensteigerungProJahr: 0.5,
})

// Bei Änderung des Datums: Referenzzinssatz und alter LIK-Monat aktualisieren
watch(() => form.letzteAnpassung, (monat) => {
  const satz = referenzzinsFuerMonat(monat)
  if (satz !== null) {
    form.alterReferenzzins = satz
  }
  form.alterLIKMonat = zweiMonateZurueck(monat)
})

const berechnungsLIK = computed(() => {
  return likWertePaarAufGemeinsamerBasis(form.alterLIKMonat, form.neuerLIKMonat)
})

const berechneteMonate = computed(() => {
  const [jahr, monat] = form.letzteAnpassung.split('-').map(Number)
  const now = new Date()
  return (now.getFullYear() - jahr) * 12 + (now.getMonth() + 1 - monat)
})

const letzteAnpassungLabel = computed(() => {
  const [jahr, monat] = form.letzteAnpassung.split('-').map(Number)
  return `${MONATE_DE[monat - 1]} ${jahr} (${berechneteMonate.value} Monate)`
})

function formatMonat(monat: string): string {
  const [jahr, m] = monat.split('-').map(Number)
  return `${MONATE_DE[m - 1]} ${jahr}`
}

// Live-Berechnung bei jeder Änderung
const result = computed<MietzinsResult | null>(() => {
  const lik = berechnungsLIK.value
  if (!lik) return null
  return berechneMietzinsanpassung({
    alterReferenzzins: form.alterReferenzzins,
    neuerReferenzzins: form.neuerReferenzzins,
    alterLIK: lik.alterWert,
    neuerLIK: lik.neuerWert,
    aktuelleNettomiete: form.aktuelleNettomiete,
    kostensteigerungProJahr: form.kostensteigerungProJahr,
    monate: berechneteMonate.value,
  })
})

const resultContext = computed<ResultContext>(() => ({
  alterReferenzzins: form.alterReferenzzins,
  neuerReferenzzins: form.neuerReferenzzins,
  alterLIKMonat: form.alterLIKMonat,
  neuerLIKMonat: form.neuerLIKMonat,
  letzteAnpassung: form.letzteAnpassung,
}))

defineExpose({ result, resultContext, berechnungsLIK })
</script>

<template>
  <div class="form">
    <fieldset class="highlight">
      <legend>Letzte Anpassung</legend>
      <div class="field">
        <label for="letzteAnpassung">Monat der letzten Mietzinsanpassung</label>
        <input id="letzteAnpassung" type="month" v-model="form.letzteAnpassung" required />
      </div>
      <p class="info-label">{{ letzteAnpassungLabel }}</p>
      <div class="field">
        <label for="aktuelleNettomiete">Aktuelle Nettomiete (CHF/Monat)</label>
        <input id="aktuelleNettomiete" type="number" step="5" v-model.number="form.aktuelleNettomiete" required />
      </div>
    </fieldset>

    <fieldset>
      <legend>Referenzzinssatz</legend>
      <div class="field-row">
        <div class="field">
          <label for="alterReferenzzins">Alter Referenzzinssatz</label>
          <select id="alterReferenzzins" v-model.number="form.alterReferenzzins">
            <option v-for="opt in REFERENZZINS_OPTIONEN" :key="opt" :value="opt">
              {{ opt.toFixed(2) }}%
            </option>
          </select>
        </div>
        <div class="field">
          <label for="neuerReferenzzins">Neuer Referenzzinssatz</label>
          <select id="neuerReferenzzins" v-model.number="form.neuerReferenzzins">
            <option v-for="opt in REFERENZZINS_OPTIONEN" :key="opt" :value="opt">
              {{ opt.toFixed(2) }}%
            </option>
          </select>
        </div>
      </div>
      <p class="hint">
        Aktueller Referenzzinssatz:
        <a href="https://www.bwo.admin.ch/de/referenzzinssatz" target="_blank" rel="noopener">BWO</a>
      </p>
    </fieldset>

    <fieldset>
      <legend>Teuerungsausgleich (LIK)</legend>
      <div class="field-row">
        <div class="field">
          <label for="alterLIKMonat">Alter Indexmonat</label>
          <input id="alterLIKMonat" type="month" v-model="form.alterLIKMonat" required />
        </div>
        <div class="field">
          <label for="neuerLIKMonat">Neuer Indexmonat</label>
          <input id="neuerLIKMonat" type="month" v-model="form.neuerLIKMonat" :max="LIK_LETZTER_MONAT" required />
        </div>
      </div>
      <p v-if="berechnungsLIK" class="berechnung-hinweis">
        Basis Dez. {{ berechnungsLIK.basis }}:
        {{ berechnungsLIK.alterWert }} → {{ berechnungsLIK.neuerWert }}
      </p>
      <p v-if="berechnungsLIK?.neueBasis" class="berechnung-hinweis neue-basis">
        Basis Dez. {{ berechnungsLIK.neueBasis }}:
        {{ berechnungsLIK.neuerWertNeueBasis }}
        ({{ formatMonat(form.neuerLIKMonat) }}, für künftige Anpassungen)
      </p>
      <p v-if="!berechnungsLIK" class="berechnung-fehler">
        Keine LIK-Daten für diese Monate verfügbar.
      </p>
      <p class="hint">
        Landesindex der Konsumentenpreise:
        <a href="https://www.bfs.admin.ch/bfs/de/home/statistiken/preise/landesindex-konsumentenpreise.html" target="_blank" rel="noopener">BFS</a>
      </p>
    </fieldset>

    <fieldset>
      <legend>Allgemeine Kostensteigerung</legend>
      <div class="field">
        <label for="kostensteigerungProJahr">Pauschale (% pro Jahr)</label>
        <input id="kostensteigerungProJahr" type="number" step="0.25" min="0" max="2" v-model.number="form.kostensteigerungProJahr" required />
      </div>
      <p class="info-label">Ausgeglichen bis {{ letzteAnpassungLabel }}</p>
      <p class="hint">
        Übliche Pauschale Bern: 0.50% p.a.
        (<a href="https://www.mietrecht.ch" target="_blank" rel="noopener">mietrecht.ch</a>)
      </p>
    </fieldset>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

fieldset {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  background: #fff;
}

fieldset.highlight {
  border-color: #1a6b3c;
  background: #f0fdf4;
}

legend {
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0 0.5rem;
  color: #1a6b3c;
}

.field-row {
  display: flex;
  gap: 1rem;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

label {
  font-size: 0.85rem;
  color: #555;
}

input,
select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

input:focus,
select:focus {
  outline: none;
  border-color: #1a6b3c;
  box-shadow: 0 0 0 2px rgba(26, 107, 60, 0.15);
}

.berechnung-hinweis {
  font-size: 0.85rem;
  color: #555;
  margin-top: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.berechnung-hinweis.neue-basis {
  background: #eff6ff;
  color: #1e40af;
}

.berechnung-fehler {
  font-size: 0.85rem;
  color: #b45309;
  margin-top: 0.5rem;
}

.info-label {
  font-size: 0.85rem;
  color: #1a6b3c;
  font-weight: 500;
  margin-top: 0.5rem;
}

.hint {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.5rem;
}

.hint a {
  color: #1a6b3c;
}

@media (max-width: 500px) {
  .field-row {
    flex-direction: column;
  }
}
</style>
