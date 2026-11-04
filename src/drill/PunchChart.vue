<template>
  <div class="chart">
    <svg
      class="bag"
      viewBox="0 -28 200 444"
      aria-hidden="true"
    >
      <path
        class="bag__hanger"
        d="M100 -24 L66 18 M100 -24 L134 18"
      />
      <path
        class="bag__canvas"
        d="M40 20 Q100 6 160 20 Q192 40 192 90 L192 380 Q192 410 160 412 L40 412 Q8 410 8 380 L8 90 Q8 40 40 20 Z"
      />
      <path
        class="bag__outline"
        d="M100 44 C130 44 146 66 146 88 L118 146 L82 146 L54 88 C54 66 70 44 100 44 Z"
      />
      <path
        class="bag__outline"
        d="M92 146 L92 190 L24 212 L24 268 L52 254 L52 346 L148 346 L148 254 L176 268 L176 212 L108 190 L108 146"
      />
      <path
        class="bag__arrow"
        d="M76 162 L88 150 M88 158 L88 150 L80 150 M124 162 L112 150 M112 158 L112 150 L120 150"
      />
      <text
        v-for="{ number, x, y } in PUNCHES"
        :key="number"
        class="bag__number"
        :x="x"
        :y="y"
      >{{ number }}</text>
    </svg>

    <ol class="legend">
      <li
        v-for="{ number, name } in PUNCHES"
        :key="number"
        class="legend__item"
      >
        <span class="legend__number">{{ number }}</span>
        <span>{{ name }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
// x and y place each number on the bag, matching the outline Cus drew on his.
const PUNCHES = [
  { number: 1, name: 'Left hook to the head', x: 40, y: 112 },
  { number: 2, name: 'Cross or right hook to the head', x: 160, y: 112 },
  { number: 3, name: 'Left uppercut', x: 62, y: 178 },
  { number: 4, name: 'Right uppercut', x: 138, y: 178 },
  { number: 5, name: 'Left hook to the body', x: 72, y: 306 },
  { number: 6, name: 'Right hook to the body', x: 128, y: 306 },
  { number: 7, name: 'Jab to the head', x: 100, y: 100 },
  { number: 8, name: 'Jab to the body', x: 100, y: 276 }
]
</script>

<style scoped>
.chart {
  display: grid;
  grid-template-columns: minmax(7rem, 2fr) minmax(0, 3fr);
  align-items: center;
  gap: 1rem;
}

.bag {
  display: block;
  inline-size: 100%;
  block-size: auto;
}

.bag__hanger {
  fill: none;
  stroke: var(--bone-dim);
  stroke-width: 5;
}

.bag__canvas {
  fill: var(--bone);
}

.bag__outline,
.bag__arrow {
  fill: none;
  stroke: var(--leather-deep);
  stroke-linejoin: round;
}

.bag__outline {
  stroke-width: 3;
}

.bag__arrow {
  stroke-width: 2;
}

.bag__number {
  font-family: var(--font-poster);
  font-size: 32px;
  fill: var(--leather-deep);
  text-anchor: middle;
  dominant-baseline: central;
}

.legend {
  display: grid;
  gap: 0.625rem;
}

.legend__item {
  display: grid;
  grid-template-columns: 1.5rem minmax(0, 1fr);
  align-items: baseline;
  gap: 0.25rem;
  font-size: 1rem;
  line-height: 1.25;
  color: var(--bone);
}

.legend__number {
  font-family: var(--font-poster);
  font-size: 1.25rem;
}
</style>
