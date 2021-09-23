<template>
  <fvMain>
    <fvContent>
      <fvHeader>
        <div class="fv-margin-end">
          <FramevuerkLogo />
        </div>
        <div class="fv-grow">
          <h2 class="fv-hidden-xs">
            Cus D'Amato
          </h2>
          <small class="fv-hidden-sm fv-hidden-xs"> Willie bag </small>
        </div>
      </fvHeader>
      <div class="content fv-padding">
        <div class="content__body fv-border fv-radius fv-shadow">
          <div class="fv-padding container">
            <fvForm class="fv-row">
              <fvFormElement class="fv-col-12" label="Sounds" inline>
                <fvButton
                  :disabled="disableStart"
                  @click="start"
                >
                  Start!
                </fvButton>
                <fvButton
                  :disabled="disableStop"
                  @click="stop"
                >
                  Stop!
                </fvButton>
              </fvFormElement>
              <fvFormElement class="fv-col-12" label="Number of punches" inline>
                <fvCheck v-model="punch" content="One">
                  One
                </fvCheck>
                <fvCheck v-model="punch" content="Two">
                  Two
                </fvCheck>
                <fvCheck v-model="punch" content="Series">
                  Series
                </fvCheck>
              </fvFormElement>
              <fvFormElement class="fv-col-12" label="Delay">
                <template slot="label" slot-scope="scope">
                  {{ scope.label }}
                  <span class="fv-margin-start-sm fv-text-primary">
                    <span v-if="delay">{{ delay }} s</span>
                  </span>
                </template>
                <fvRange v-model="delay" :data="delaySteps" />
              </fvFormElement>
            </fvForm>
          </div>
        </div>
      </div>
    </fvContent>
  </fvMain>
</template>

<script>
import debounce from 'lodash.debounce'
import FramevuerkLogo from '~/components/FramevuerkLogo.vue'

export default {
  components: {
    FramevuerkLogo
  },
  data () {
    return {
      audio: null,
      willieBagOnePunch: null,
      willieBagTwoPunches: null,
      willieBagSeriesPunches: null,
      disableStop: true,
      disableStart: false,
      delaySteps: [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5, 5.25, 5.5, 5.75],
      delay: 1.5,
      punch: 'One'
    }
  },
  watch: {
    punch (_) {
      switch (this.punch) {
        case 'One':
          this.delay = 1.5
          break
        case 'Two':
          this.delay = 2.5
          break
        case 'Series':
          this.delay = 3.5
          break
      }
      this.stop()
    },
    delay (_) {
      const that = this
      if (that.disableStart) {
        debounce(function () {
          that.stop()
          that.start()
        }, 350)()
      }
    }
  },
  methods: {
    stop () {
      this.disableStart = false
      this.disableStop = true
      clearInterval(this.willieBagSeriesPunches)
      clearInterval(this.willieBagTwoPunches)
      clearInterval(this.willieBagOnePunch)
    },
    stopOnePunch () {
      clearInterval(this.willieBagOnePunch)
    },
    start () {
      this.disableStart = true
      this.disableStop = false
      switch (this.punch) {
        case 'One':
          this.onePunch()
          break
        case 'Two':
          this.willieBagTwoPunches = setInterval(async () => {
            this.onePunch(500)
            await this.delayPromise(750)
            this.stopOnePunch()
            this.onePunch(350)
            await this.delayPromise(500)
            this.stopOnePunch()
          }, this.delay * 1000)
          break
        case 'Series':
          this.willieBagSeriesPunches = setInterval(async () => {
            this.onePunch(500)
            await this.delayPromise(750)
            this.stopOnePunch()
            this.onePunch(500)
            await this.delayPromise(750)
            this.stopOnePunch()
            this.onePunch(500)
            await this.delayPromise(750)
            this.stopOnePunch()
          }, this.delay * 1000)
          break
      }
    },
    onePunch (customDelay) {
      const delay = customDelay || this.delay * 1000
      this.willieBagOnePunch = setInterval(() => {
        const punchNumber = this.randomPunch()
        this.playSound(punchNumber)
      }, delay)
    },
    playSound (punchNumber) {
      const file = require(`@/assets/sounds/0${punchNumber}.mp3`)
      this.audio = new Audio(file.default)
      this.audio.play()
    },
    randomPunch () {
      let punchNumber = 0
      while (punchNumber === 0 || punchNumber === 9) {
        punchNumber = this.random()
      }

      return punchNumber
    },
    random () {
      const uint8Array = new Uint8Array(1)
      window.crypto.getRandomValues(uint8Array)
      let sum = 0
      let value = uint8Array[0]

      while (value) {
        sum += value % 10
        value = Math.floor(value / 10)
        if (sum > 8) {
          sum = value % 10
        }
      }

      return sum
    },
    delayPromise (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.content {
  margin: 0 auto;
  max-width: 768px;
}

.sidebar {
  min-width: 300px;
}
</style>
