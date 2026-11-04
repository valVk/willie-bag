<template>
  <div
    class="chart"
    :class="{ 'chart--focused': active !== null }"
  >
    <svg
      class="figure"
      viewBox="26 10 268 374"
      aria-hidden="true"
    >
      <!-- An artist's mannequin cut like a stencil, facing you as an opponent would. -->
      <path
        v-for="part in MANNEQUIN"
        :key="part"
        class="figure__part"
        :d="part"
      />

      <!-- Where the punches around the head land: 1 and 2 on the jaw, 3 and 4 under the chin. -->
      <path
        class="figure__ticks"
        d="M78 78 L122 78 M115 71 L122 78 L115 85 M242 78 L198 78 M205 71 L198 78 L205 85 M124 115 L146 106 M136 103 L146 106 L142 116 M196 115 L174 106 M184 103 L174 106 L178 116"
      />

      <g
        v-for="{ number, x, y, onBody } in SPOTS"
        :key="number"
        class="spot"
        :class="{ 'spot--on-body': onBody, 'spot--active': active === number }"
        @mouseenter="active = number"
        @mouseleave="active = null"
        @click="active = number"
      >
        <circle
          class="spot__target"
          :cx="x"
          :cy="y"
          r="23"
        />
        <text
          class="spot__number"
          :x="x"
          :y="y"
        >{{ number }}</text>
      </g>
    </svg>

    <div class="legend">
      <section
        v-for="{ target, area, punches } in GROUPS"
        :key="target"
        class="group"
        :class="`group--${area}`"
      >
        <h3 class="group__target">
          {{ target }}
        </h3>
        <ul>
          <li
            v-for="{ number, name } in punches"
            :key="number"
          >
            <button
              type="button"
              class="punch"
              :class="{ 'punch--active': active === number }"
              @mouseenter="active = number"
              @mouseleave="active = null"
              @focus="active = number"
              @blur="active = null"
              @click="active = number"
            >
              <span class="punch__number">{{ number }}</span>
              <span>{{ name }}</span>
            </button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const MANNEQUIN = [
  // Head
  'M160 18 C186 18 197 42 194 66 C191 88 176 106 160 106 C144 106 129 88 126 66 C123 42 134 18 160 18 Z',
  // Neck
  'M148 111 L172 111 L175 134 L145 134 Z',
  // Ribcage
  'M112 142 Q160 128 208 142 C220 176 214 222 199 250 Q160 262 121 250 C106 222 100 176 112 142 Z',
  // Waist
  'M160 262 C192 262 212 270 212 290 C212 310 192 320 160 320 C128 320 108 310 108 290 C108 270 128 262 160 262 Z',
  // Pelvis, cropped like a poster
  'M116 326 Q160 336 204 326 L216 384 L104 384 Z',
  // Shoulders
  'M82 132 A21 21 0 1 0 82 174 A21 21 0 1 0 82 132 Z',
  'M238 132 A21 21 0 1 0 238 174 A21 21 0 1 0 238 132 Z',
  // Upper arms
  'M63 180 L101 180 L92 268 L62 268 Z',
  'M219 180 L257 180 L258 268 L228 268 Z',
  // Elbows
  'M77 273 A15 15 0 1 0 77 303 A15 15 0 1 0 77 273 Z',
  'M243 273 A15 15 0 1 0 243 303 A15 15 0 1 0 243 273 Z',
  // Forearms, cropped like a poster
  'M62 309 L92 309 L88 384 L64 384 Z',
  'M228 309 L258 309 L256 384 L232 384 Z'
]

// Numbers that land on the figure are printed dark, the ones around it light.
const SPOTS = [
  { number: 1, x: 54, y: 78, onBody: false },
  { number: 2, x: 266, y: 78, onBody: false },
  { number: 3, x: 102, y: 110, onBody: false },
  { number: 4, x: 218, y: 110, onBody: false },
  { number: 5, x: 130, y: 292, onBody: true },
  { number: 6, x: 190, y: 292, onBody: true },
  { number: 7, x: 160, y: 62, onBody: true },
  { number: 8, x: 160, y: 218, onBody: true }
]

const GROUPS = [
  {
    target: 'To the head',
    area: 'head',
    punches: [
      { number: 1, name: 'Left hook' },
      { number: 2, name: 'Cross or right hook' },
      { number: 7, name: 'Jab' }
    ]
  },
  {
    target: 'Under the chin',
    area: 'chin',
    punches: [
      { number: 3, name: 'Left uppercut' },
      { number: 4, name: 'Right uppercut' }
    ]
  },
  {
    target: 'To the body',
    area: 'body',
    punches: [
      { number: 5, name: 'Left hook' },
      { number: 6, name: 'Right hook' },
      { number: 8, name: 'Jab' }
    ]
  }
]

const active = ref<number | null>(null)
</script>

<style scoped>
.chart {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 2.5rem;
}

.figure {
  display: block;
  inline-size: 100%;
  block-size: auto;
  max-block-size: 70dvh;
}

.figure__part {
  fill: var(--bone);
  transition: opacity 150ms ease;
}

.chart--focused .figure__part {
  opacity: 0.55;
}

.figure__ticks {
  fill: none;
  stroke: var(--color-tape-400);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: opacity 150ms ease;
}

.chart--focused .figure__ticks {
  opacity: 0.3;
}

.spot {
  cursor: pointer;
  transition: opacity 150ms ease;
}

.chart--focused .spot:not(.spot--active) {
  opacity: 0.3;
}

.spot__target {
  fill: var(--color-tape-400);
  opacity: 0;
  transform: scale(0.8);
  transform-box: fill-box;
  transform-origin: center;
  transition: opacity 150ms ease, transform 150ms cubic-bezier(0.23, 1, 0.32, 1);
}

.spot--active .spot__target {
  opacity: 1;
  transform: scale(1);
}

.spot__number {
  font-family: var(--font-poster);
  font-size: 38px;
  fill: var(--bone);
  text-anchor: middle;
  dominant-baseline: central;
  transition: fill 150ms ease;
}

.spot--on-body .spot__number,
.spot--active .spot__number {
  fill: var(--leather-deep);
}

.legend {
  display: grid;
  gap: 1.5rem;
}

.group__target {
  margin-block-end: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--bone-dim);
}

.punch {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  align-items: center;
  inline-size: 100%;
  min-block-size: 2.5rem;
  padding-inline: 0.5rem;
  margin-inline-start: -0.5rem;
  border-radius: 0.375rem;
  font-size: 1.0625rem;
  line-height: 1.2;
  text-align: start;
  color: var(--bone);
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}

.punch:focus-visible {
  outline: 2px solid var(--color-tape-400);
  outline-offset: -2px;
}

.punch--active {
  background: var(--color-tape-400);
  color: var(--leather-deep);
}

.punch__number {
  font-family: var(--font-poster);
  font-size: 1.375rem;
}

/* On small screens the list goes compact, so the figure and every punch fit together. */
@media (max-width: 639px), (max-height: 520px) {
  .legend {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      'head body'
      'chin chin';
    gap: 0.75rem 1rem;
  }

  .group--head {
    grid-area: head;
  }

  .group--body {
    grid-area: body;
  }

  .group--chin {
    grid-area: chin;
  }

  .group--chin ul {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    column-gap: 1rem;
  }

  .punch {
    grid-template-columns: 1.625rem minmax(0, 1fr);
    font-size: 1rem;
  }

  .figure {
    max-block-size: 60dvh;
  }
}

@media (max-width: 639px) {
  .chart {
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
  }

  .figure {
    inline-size: min(68vw, 16rem);
    max-block-size: 36dvh;
    justify-self: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spot__target {
    transform: none;
  }
}
</style>
