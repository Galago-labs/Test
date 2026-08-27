export class SynthAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init(): void {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3;
    }
  }

  playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.5
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playNoise(duration: number, volume: number = 0.3): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  sfxHit(): void {
    this.playTone(150, 0.1, 'sawtooth', 0.4);
    setTimeout(() => this.playTone(100, 0.15, 'sawtooth', 0.3), 50);
  }

  sfxAttack(): void {
    this.playNoise(0.1, 0.2);
  }

  sfxPickup(): void {
    this.playTone(800, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(1200, 0.15, 'sine', 0.3), 80);
  }

  sfxChestOpen(): void {
    this.playTone(400, 0.2, 'square', 0.3);
    setTimeout(() => this.playTone(600, 0.3, 'square', 0.3), 150);
  }

  sfxDeath(): void {
    this.playTone(300, 0.3, 'sawtooth', 0.4);
    setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.3), 200);
    setTimeout(() => this.playTone(100, 0.5, 'sawtooth', 0.2), 400);
  }

  sfxWaveStart(): void {
    this.playNoise(0.3, 0.4);
  }

  sfxBossSpawn(): void {
    this.playTone(80, 0.5, 'sawtooth', 0.5);
    setTimeout(() => this.playTone(60, 0.6, 'sawtooth', 0.5), 400);
  }

  stopAll(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

export const audio = new SynthAudio();
