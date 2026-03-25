<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MietzinsResult, ResultContext } from '../tools/mietzins/types'
import MietzinsForm from '../tools/mietzins/MietzinsForm.vue'
import MietzinsResultView from '../tools/mietzins/MietzinsResult.vue'

const formRef = ref<InstanceType<typeof MietzinsForm> | null>(null)

const result = computed<MietzinsResult | null>(() => formRef.value?.result ?? null)
const resultContext = computed<ResultContext | null>(() => formRef.value?.resultContext ?? null)
</script>

<template>
  <div class="mietzins-page">
    <h1>Mietzinsanpassung</h1>
    <p class="description">
      Berechnung der Mietzinsanpassung bei Änderung des Referenzzinssatzes
      gemäss VMWG Art. 12–16.
    </p>

    <div class="layout">
      <MietzinsForm ref="formRef" />
      <MietzinsResultView
        v-if="result && resultContext"
        :result="result"
        :context="resultContext"
      />
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  margin-bottom: 1.5rem;
}

.layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }
}
</style>
