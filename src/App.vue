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
      </section>

      <section class="panel">
        <div class="panel__controls">
          <div class="panel__calls">
            <UFormField
              label="Calls"
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
            <div class="panel__mix">
              <div class="panel__mix-label">
                <span id="number-mix">Number mix</span>
                <UPopover>
                  <UButton
                    icon="i-lucide-info"
                    aria-label="What Number mix does"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                  />
                  <template #content>
                    <div class="panel__help">
                      <p><strong>Equal:</strong> all 8 numbers get about the same work. Numbers called less come up more often. Combos and Two also use extra uppercut and body combinations, which aren't from Cus.</p>
                      <p><strong>Natural:</strong> a more realistic mix, so 1 and 2 come up most and 3 and 4 least. Combos and Two use the combinations from Cus's recording plus added jabs.</p>
                    </div>
                  </template>
                </UPopover>
              </div>
              <URadioGroup
                :model-value="equalNumbers ? 'equal' : 'natural'"
                :items="MIX_ITEMS"
                orientation="horizontal"
                variant="table"
                indicator="hidden"
                size="sm"
                aria-labelledby="number-mix"
                :ui="{ fieldset: 'w-full', item: 'mode flex-1 justify-center text-center' }"
                @update:model-value="equalNumbers = $event === 'equal'"
              />
            </div>
          </div>

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
        </div>

        <button
          type="button"
          class="panel__chart"
          @click="chartOpen = true"
        >
          <span class="panel__chart-numbers">1–8</span>
          Punch chart
        </button>
      </section>
    </main>

    <UModal
      v-model:open="chartOpen"
      title="Punch chart"
      description="The figure faces you, as an opponent would."
      :ui="{
        overlay: 'bg-[#1c0504]/80',
        content: 'sm:max-w-3xl divide-y-0 ring-0 rounded-xl bg-(--leather-deep)',
        header: 'items-start px-5 pt-5 pb-0 sm:px-8 sm:pt-7',
        body: 'px-5 pt-5 pb-6 sm:px-8 sm:pt-6 sm:pb-8',
        description: 'text-(--bone-dim) text-base',
        close: 'top-3 end-3 sm:top-5 sm:end-5'
      }"
    >
      <template #title>
        <span class="chart-title"><span class="chart-title__numbers">1–8</span> Punch chart</span>
      </template>
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

const MAX_DELAY = 8

const chartOpen = ref(false)

const MIX_ITEMS = [
  { label: 'Equal', value: 'equal' },
  { label: 'Natural', value: 'natural' }
]

const COUNT_ITEMS = [
  { label: 'Nonstop', value: 0 },
  ...[1, 2, 3, 4, 5, 6, 8, 10, 12].map(value => ({ label: String(value), value }))
]

const LENGTH_ITEMS = [
  { label: '1 min', value: 1 },
  { label: '2 min', value: 2 },
  { label: '3 min', value: 3 },
  { label: '4 min', value: 4 }
]

const REST_ITEMS = [
  { label: '30 s', value: 30 },
  { label: '1 min', value: 60 }
]

const modeItems = Object.entries(MODES).map(([value, { label }]) => ({ value, label }))

const {
  mode,
  delay,
  equalNumbers,
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
  min-block-size: 30dvh;
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

.panel__chart {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-block-size: 2.75rem;
  justify-self: center;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  color: var(--bone);
  cursor: pointer;
  transition: transform 160ms ease-out, background-color 150ms ease;
}

.panel__chart:active {
  transform: scale(0.97);
}

.panel__chart:focus-visible {
  outline: 2px solid var(--color-tape-400);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .panel__chart:hover {
    background: rgb(240 230 208 / 0.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel__chart {
    transition: background-color 150ms ease;
  }

  .panel__chart:active {
    transform: none;
  }
}

.chart-title {
  font-family: var(--font-poster);
  font-size: clamp(1.75rem, 6vw, 2.5rem);
  font-weight: 400;
  line-height: 1.1;
  color: var(--bone);
}

.chart-title__numbers {
  color: var(--color-tape-400);
}

.panel__chart-numbers {
  font-family: var(--font-poster);
  font-size: 1.125rem;
  color: var(--color-tape-400);
}

.stage__wait {
  font-size: min(13cqw, 40cqh);
  color: var(--bone-dim);
}

.panel {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 1rem;
  padding: 1.5rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
  background: var(--leather-deep);
}

.panel__controls {
  display: grid;
  align-content: safe center;
  gap: 1.75rem;
}

/* More room between each label and its control. */
.panel__controls :deep([data-slot='container']) {
  margin-block-start: 0.5rem;
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
  gap: 0.75rem;
}

.panel__calls {
  display: grid;
  gap: 1rem;
}

.panel__mix {
  display: grid;
  grid-template-columns: auto minmax(0, 11rem);
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.panel__mix :deep(.mode p) {
  font-size: 0.875rem;
}

.panel__mix-label {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 1rem;
  font-weight: 500;
}

.panel__help {
  display: grid;
  gap: 0.5rem;
  max-inline-size: min(20rem, calc(100vw - 2rem));
  padding: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.35;
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
    overflow-y: auto;
    padding: 1rem;
  }

  .panel__controls {
    gap: 1rem;
  }
}

@media (max-width: 899px) and (orientation: portrait) and (max-height: 700px) {
  .panel {
    gap: 0.25rem;
    padding-block-start: 1rem;
  }

  .panel__controls {
    gap: 1.125rem;
  }

  .panel__calls {
    gap: 0.75rem;
  }
}

@media (min-width: 900px) and (min-height: 600px) {
  .panel {
    padding: 2rem 2rem 1rem;
  }

  .panel__controls {
    gap: 2.25rem;
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
