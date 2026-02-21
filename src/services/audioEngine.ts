import type { ToneId } from './toneCatalog'

export type PlayOptions = {
  volume?: number // 0..1
  durationMs?: number // if omitted: play until stop() called
}

// Simple WebAudio tone synthesizer (no asset files needed)
export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private osc: OscillatorNode | null = null
  private lfo: OscillatorNode | null = null
  private stopTimer: number | null = null

  private ensure(): void {
    if (this.ctx) return
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) throw new Error('Web Audio API not supported')
    this.ctx = new Ctx()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.15
    this.master.connect(this.ctx.destination)
  }

  async play(toneId: ToneId, opts: PlayOptions = {}): Promise<void> {
    this.ensure()
    if (!this.ctx || !this.master) return

    await this.ctx.resume()
    this.stop()

    const volume = typeof opts.volume === 'number' ? Math.min(1, Math.max(0, opts.volume)) : 0.2
    this.master.gain.value = volume

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    // Envelope so it isn't harsh
    const now = this.ctx.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(1, now + 0.01)

    // LFO for tremolo / pulse
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()

    switch (toneId) {
      case 'beep':
        osc.type = 'sine'
        osc.frequency.value = 880
        lfo.frequency.value = 2.2
        lfoGain.gain.value = 0.7
        break
      case 'chime':
        osc.type = 'triangle'
        osc.frequency.value = 660
        lfo.frequency.value = 1.2
        lfoGain.gain.value = 0.45
        break
      case 'digital':
        osc.type = 'square'
        osc.frequency.value = 1100
        lfo.frequency.value = 3.5
        lfoGain.gain.value = 0.8
        break
      case 'bell':
        osc.type = 'sine'
        osc.frequency.value = 523.25 // C5
        lfo.frequency.value = 1.7
        lfoGain.gain.value = 0.55
        break
    }

    // tremolo: modulate gain
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)

    osc.connect(gain)
    gain.connect(this.master)

    osc.start()
    lfo.start()

    this.osc = osc
    this.lfo = lfo

    if (typeof opts.durationMs === 'number' && opts.durationMs > 0) {
      this.stopTimer = window.setTimeout(() => this.stop(), opts.durationMs)
    }
  }

  stop(): void {
    if (this.stopTimer) {
      window.clearTimeout(this.stopTimer)
      this.stopTimer = null
    }

    const ctx = this.ctx
    const osc = this.osc
    const lfo = this.lfo
    this.osc = null
    this.lfo = null

    try {
      osc?.stop()
      osc?.disconnect()
    } catch {
      // ignore
    }

    try {
      lfo?.stop()
      lfo?.disconnect()
    } catch {
      // ignore
    }

    // keep context alive; user gesture requirement is handled in play() via ctx.resume()
    if (ctx && ctx.state === 'closed') {
      this.ctx = null
      this.master = null
    }
  }
}

export const audioEngine = new AudioEngine()

