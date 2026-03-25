<script setup lang="ts">
import type { MietzinsResult, ResultContext } from './types'

const MONATE_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function formatMonat(monat: string): string {
  const [jahr, m] = monat.split('-').map(Number)
  return `${MONATE_DE[m - 1]} ${jahr}`
}

const props = defineProps<{
  result: MietzinsResult
  context: ResultContext
}>()

function formatProzent(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}

function formatCHF(value: number): string {
  return Number.isInteger(value) ? `CHF ${value}` : `CHF ${value.toFixed(2)}`
}

function formatCHFRappen(value: number): string {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}CHF ${value.toFixed(2)}`
}

function formatAktuellerMonat(): string {
  const now = new Date()
  return `${MONATE_DE[now.getMonth()]} ${now.getFullYear()}`
}

function isErhoehung(value: number): boolean {
  return value > 0
}
</script>

<template>
  <div class="result">
    <h2>Ergebnis</h2>

    <table class="result-table">
      <thead>
        <tr>
          <th>Komponente</th>
          <th class="text-right">Veränderung</th>
          <th class="text-right">CHF/Monat</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Referenzzinssatz
            <br /><span class="detail">
              ({{ props.context.alterReferenzzins.toFixed(2) }}% → {{ props.context.neuerReferenzzins.toFixed(2) }}%)
            </span>
          </td>
          <td class="text-right" :class="{ positive: isErhoehung(props.result.referenzzinsVeraenderung), negative: !isErhoehung(props.result.referenzzinsVeraenderung) && props.result.referenzzinsVeraenderung !== 0 }">
            {{ formatProzent(props.result.referenzzinsVeraenderung) }}
          </td>
          <td class="text-right">
            {{ formatCHF(props.result.alteNettomiete * props.result.referenzzinsVeraenderung / 100) }}
          </td>
        </tr>
        <tr>
          <td>
            Teuerungsausgleich
            <br /><span class="detail">
              (40% der Teuerung, LIK {{ formatMonat(props.context.alterLIKMonat) }} → {{ formatMonat(props.context.neuerLIKMonat) }})
            </span>
          </td>
          <td class="text-right" :class="{ positive: isErhoehung(props.result.teuerungsausgleich), negative: !isErhoehung(props.result.teuerungsausgleich) && props.result.teuerungsausgleich !== 0 }">
            {{ formatProzent(props.result.teuerungsausgleich) }}
          </td>
          <td class="text-right">
            {{ formatCHF(props.result.alteNettomiete * props.result.teuerungsausgleich / 100) }}
          </td>
        </tr>
        <tr>
          <td>
            Allg. Kostensteigerung
            <br /><span class="detail">
              (0.50% p.a. pauschal, ausgeglichen bis {{ formatAktuellerMonat() }})
            </span>
          </td>
          <td class="text-right" :class="{ positive: isErhoehung(props.result.kostensteigerung) }">
            {{ formatProzent(props.result.kostensteigerung) }}
          </td>
          <td class="text-right">
            {{ formatCHF(props.result.alteNettomiete * props.result.kostensteigerung / 100) }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td></td>
          <td class="text-right" :class="{ positive: isErhoehung(props.result.differenz), negative: props.result.differenz < 0 }">
            <strong>{{ formatCHFRappen(props.result.differenz) }}</strong>
          </td>
        </tr>
      </tfoot>
    </table>

    <div class="neue-miete" :class="{ erhoehung: isErhoehung(props.result.differenz), senkung: props.result.differenz < 0 }">
      <div class="label">
        Neue Nettomiete
      </div>
      <div class="betrag">{{ formatCHF(props.result.neueNettomiete) }}</div>
      <div class="alt">bisher: {{ formatCHF(props.result.alteNettomiete) }}</div>
    </div>

  </div>
</template>

<style scoped>
.result {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

h2 {
  font-size: 1.15rem;
  margin: 0;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 0.6rem 0.75rem;
  text-align: left;
  font-size: 0.9rem;
}

th {
  background: #f5f5f5;
  font-weight: 600;
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

tbody tr {
  border-top: 1px solid #eee;
}

tfoot tr {
  border-top: 2px solid #ccc;
  background: #f9f9f9;
}

.text-right {
  text-align: right;
  white-space: nowrap;
}

.detail {
  font-size: 0.75rem;
  color: #888;
  white-space: nowrap;
}

.positive {
  color: #b45309;
}

.negative {
  color: #1a6b3c;
}

.neue-miete {
  padding: 1.25rem;
  border-radius: 8px;
  text-align: center;
}

.neue-miete.erhoehung {
  background: #fef3c7;
  border: 1px solid #f59e0b;
}

.neue-miete.senkung {
  background: #d1fae5;
  border: 1px solid #10b981;
}

.neue-miete .label {
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 0.25rem;
}

.neue-miete .betrag {
  font-size: 2rem;
  font-weight: 700;
}

.neue-miete .alt {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}
</style>
