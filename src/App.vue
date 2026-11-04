<template>
  <UApp>
    <main class="drill">
      <section class="stage">
        <p
          v-if="round"
          class="stage__round"
        >
          Round {{ round.number }} of {{ round.count }}
        </p>
        <p
          v-if="clock"
          class="stage__clock"
          :class="{ 'stage__clock--closing': closing }"
        >
          {{ clock }}
        </p>
        <span
          v-if="call"
          :key="call.id"
          class="stage__punch"
        >{{ call.punch }}</span>
        <p
          v-else-if="resting"
          class="stage__rest"
        >
          Rest
        </p>
        <p
          v-else-if="finished"
          class="stage__rest"
        >
          Done
        </p>
        <p
          v-else-if="running"
          class="stage__wait"
        >
          Hands up
        </p>
        <h1
          v-else
          class="stage__title"
        >
          Willie bag
        </h1>
        <UButton
          v-if="!running"
          label="What the numbers mean"
          color="neutral"
          variant="outline"
          size="lg"
          class="stage__chart"
          @click="chartOpen = true"
        />
      </section>

      <section class="panel">
        <UFormField
          label="Punches per call"
          size="xl"
        >
          <URadioGroup
            :model-value="mode"
            :items="modeItems"
            orientation="horizontal"
            variant="table"
            indicator="hidden"
            size="xl"
            :ui="{ fieldset: 'w-full', item: 'mode flex-1 justify-center text-center' }"
            @update:model-value="setMode($event as Mode)"
          />
        </UFormField>

        <UFormField
          label="Time between calls"
          size="xl"
        >
          <template #hint>
            <span class="panel__value">{{ delay }} s</span>
          </template>
          <USlider
            v-model="delay"
            :min="minDelay"
            :max="MAX_DELAY"
            :step="0.25"
            size="lg"
            class="py-3"
            :ui="{ track: 'bg-white/20' }"
            aria-label="Time between calls"
            :aria-valuetext="`${delay} seconds`"
            @change="applyPace"
          />
        </UFormField>

        <div class="panel__rounds">
          <UFormField
            label="Rounds"
            size="xl"
          >
            <USelect
              v-model="roundCount"
              :items="COUNT_ITEMS"
              :disabled="running"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Length"
            size="xl"
          >
            <USelect
              v-model="roundMinutes"
              :items="LENGTH_ITEMS"
              :disabled="running || !roundCount"
              size="xl"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Rest"
            size="xl"
          >
            <USelect
              v-model="restSeconds"
              :items="REST_ITEMS"
              :disabled="running || !roundCount"
              size="xl"
              class="w-full"
            />
          </UFormField>
        </div>

        <UAlert
          v-if="failed"
          color="error"
          variant="solid"
          title="The punch sounds didn't load. Check your connection and reload the page."
        />

        <UButton
          v-if="running"
          label="Stop"
          color="neutral"
          variant="outline"
          size="xl"
          block
          class="panel__action"
          @click="stop"
        />
        <UButton
          v-else
          label="Start"
          size="xl"
          block
          class="panel__action"
          :disabled="!ready"
          @click="start"
        />
      </section>
    </main>

    <UModal
      v-model:open="chartOpen"
      title="Punch numbers"
      description="The punch each number calls for."
    >
      <template #body>
        <PunchChart />
      </template>
    </UModal>
  </UApp>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PunchChart from './drill/PunchChart.vue'
import { MODES, useDrill } from './drill/useDrill'
import type { Mode } from './drill/useDrill'

const MAX_DELAY = 5.75

const chartOpen = ref(false)

const COUNT_ITEMS = [
  { label: 'Nonstop', value: 0 },
  ...[1, 2, 3, 4, 5, 6, 8, 10, 12].map(value => ({ label: String(value), value }))
]

const LENGTH_ITEMS = [
  { label: '1 min', value: 1 },
  { label: '2 min', value: 2 },
  { label: '3 min', value: 3 }
]

const REST_ITEMS = [
  { label: '30 s', value: 30 },
  { label: '1 min', value: 60 }
]

const modeItems = Object.entries(MODES).map(([value, { label }]) => ({ value, label }))

const {
  mode,
  delay,
  roundCount,
  roundMinutes,
  restSeconds,
  minDelay,
  running,
  resting,
  finished,
  closing,
  clock,
  round,
  ready,
  failed,
  call,
  start,
  stop,
  setMode,
  applyPace
} = useDrill()
</script>

<style scoped>
.drill {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-height: 100dvh;
}

.stage {
  position: relative;
  container-type: size;
  min-block-size: 35dvh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding-inline: 1rem;
  font-family: var(--font-poster);
  color: var(--bone);
}

.stage__punch {
  font-size: min(130cqw, 88cqh);
  line-height: 1;
  animation: call 140ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.stage__title {
  font-size: min(17cqw, 45cqh);
  line-height: 0.95;
  text-align: center;
}

.stage__round,
.stage__clock {
  position: absolute;
  inset-block-start: 0.75rem;
  font-family: var(--font-sans);
  font-weight: 600;
}

.stage__round {
  inset-inline-start: 1rem;
  font-size: clamp(1.25rem, 6cqmin, 2rem);
  line-height: 2.25rem;
}

.stage__clock {
  inset-inline-end: 1rem;
  font-size: clamp(1.75rem, 8cqmin, 3rem);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stage__clock--closing {
  color: var(--color-tape-400);
}

.stage__rest {
  font-size: min(32cqw, 60cqh);
  line-height: 1;
}

.stage__chart {
  position: absolute;
  inset-block-end: 0.75rem;
  font-family: var(--font-sans);
}

.stage__wait {
  font-size: min(13cqw, 40cqh);
  color: var(--bone-dim);
}

.panel {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom, 0px));
  background: var(--leather-deep);
}

:deep(.mode:has([data-state='checked'])) {
  border-color: var(--color-tape-400);
  background: var(--color-tape-400);
}

:deep(.mode:has([data-state='checked']) p) {
  font-weight: 600;
  color: var(--leather-deep);
}

.panel__rounds {
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr;
  gap: 0.5rem;
}

.panel__value {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--bone);
}

.panel__action {
  justify-content: center;
  padding-block: 1rem;
  font-size: 1.375rem;
  font-weight: 600;
}

@media (min-width: 900px), (orientation: landscape) {
  .drill {
    grid-template-columns: minmax(0, 1fr) min(24rem, 50vw);
    grid-template-rows: minmax(0, 1fr);
    height: 100dvh;
  }

  .stage {
    min-block-size: 0;
  }

  .panel {
    align-content: safe center;
    overflow-y: auto;
    padding: 1rem;
  }
}

@media (min-width: 900px) and (min-height: 500px) {
  .panel {
    padding: 2rem;
  }
}

@keyframes call {
  from {
    opacity: 0.4;
    transform: scale(0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage__punch {
    animation: none;
  }
}
</style>
