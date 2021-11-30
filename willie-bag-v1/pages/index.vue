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
import { interval, EMPTY } from 'rxjs'
import { takeWhile, exhaustMap } from 'rxjs/operators'
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
      punch: 'One',
      timer$: undefined,
      twoRandsEachSecond$: undefined
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
    },
    stopOnePunch () {
      // clearInterval(this.willieBagOnePunch)
    },
    start () {
      this.disableStart = true
      this.disableStop = false
      const counter$ = interval(this.delay * 1000)
      counter$
        .pipe(
          exhaustMap((value) => {
            console.log(value)
            // this.onePunch()
            return EMPTY
          }),
          takeWhile(() => this.disableStop)
        )
        .subscribe()
      // const stopTimer$ = timer(1 * 60 * 1000)
      // this.timer$ = timer(this.delay * 1000, 1000)
      //   .pipe(
      //     // map(() => this.onePunch()),
      //     concatMap(() =>
      //       from([of(this.onePunch(1)), delay(10000), of(this.onePunch(2))])
      //     ),
      //     takeUntil(stopTimer$)
      //   )
      //   .subscribe(n => console.log('timer', n))

      // const myArray = [1, 2, 3, 4]

      // from(myArray).pipe(
      //   concatMap(item => of(item).pipe(delay(1000)))
      // ).subscribe((timedItem) => {
      //   console.log(timedItem)
      // })
      // this.twoRandsEachSecond$ = interval(1000).pipe(
      //   concatMap(() =>
      //     from([this.onePunch(), this.onePunch()])
      //   )
      // )
      //   .subscribe()
      // this.twoRandsEachSecond$ = timer(this.delay * 1000, 1000).pipe(
      //   mergeWith(this.onePunch().pipe(mapTo(delay(1000))), this.onePunch().pipe(mapTo(delay(1000))))
      // ).subscribe()
      // const example = of(null)
      // // delay output of each by an extra second
      // const message = of(null)
      //   .pipe(
      //     mergeWith(
      //       example.pipe(mapTo('Hello')),
      //       example.pipe(mapTo('World!'), delay(1000)),
      //       example.pipe(mapTo('Goodbye'), delay(5000)),
      //       example.pipe(mapTo('World!'), delay(3000))
      //     )
      //   )
      // // output: 'Hello'...'World!'...'Goodbye'...'World!'
      // const subscribe = message.subscribe(val => console.log(val))
      // timer$.unsubscribe()
      // switch (this.punch) {
      //   case 'One':
      //     this.onePunch()
      //     break
      //   case 'Two':
      //     this.willieBagTwoPunches = setInterval(async () => {
      //       this.onePunch(500)
      //       await this.delayPromise(750)
      //       this.stopOnePunch()
      //       this.onePunch(350)
      //       await this.delayPromise(500)
      //       this.stopOnePunch()
      //     }, this.delay * 1000)
      //     break
      //   case 'Series':
      //     this.willieBagSeriesPunches = setInterval(async () => {
      //       this.onePunch(500)
      //       await this.delayPromise(750)
      //       this.stopOnePunch()
      //       this.onePunch(500)
      //       await this.delayPromise(750)
      //       this.stopOnePunch()
      //       this.onePunch(500)
      //       await this.delayPromise(750)
      //       this.stopOnePunch()
      //     }, this.delay * 1000)
      //     break
      // }
    },
    onePunch (order) {
      const punchNumber = this.randomPunch()
      this.playSound(punchNumber)
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
