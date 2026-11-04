// The clapper is synthesized, so it needs no sound file.

const CLAP_SECONDS = 0.08

export const playClap = (context: BaseAudioContext, at = context.currentTime) => {
  const noise = context.createBuffer(1, Math.ceil(context.sampleRate * CLAP_SECONDS), context.sampleRate)
  const samples = noise.getChannelData(0)
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.random() * 2 - 1
  }

  const source = context.createBufferSource()
  source.buffer = noise

  const band = context.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1800
  band.Q.value = 1.2

  const envelope = context.createGain()
  envelope.gain.setValueAtTime(1.8, at)
  envelope.gain.exponentialRampToValueAtTime(0.001, at + CLAP_SECONDS)

  source.connect(band).connect(envelope).connect(context.destination)
  source.start(at)
}
