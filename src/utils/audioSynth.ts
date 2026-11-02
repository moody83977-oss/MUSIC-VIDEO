// Web Audio synthesizer and audio analyzer engine for Melomotion AI

class MelomotionAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private startTime = 0;
  private pauseOffset = 0;
  private isPaused = false;
  private isPlaying = false;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private activeSongId: string | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.85;

      this.destinationNode = this.ctx.createMediaStreamDestination();

      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      this.analyser.connect(this.destinationNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.init();
    return this.analyser;
  }

  public getMediaStream(): MediaStream | null {
    this.init();
    return this.destinationNode?.stream || null;
  }

  // Get real-time audio metrics for Lip-Sync and Camera Beats
  public getAudioMetrics(): {
    vocalEnergy: number; // 0 - 1 (drives mouth open height)
    bassEnergy: number;  // 0 - 1 (drives beat-sync camera punch)
    highEnergy: number;  // 0 - 1 (drives particle flash & strobe)
    average: number;
  } {
    if (!this.analyser) {
      return { vocalEnergy: 0, bassEnergy: 0, highEnergy: 0, average: 0 };
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    let bassSum = 0;
    let vocalSum = 0;
    let highSum = 0;
    let totalSum = 0;

    // Bass: bins 0 to 8 (~20 - 250 Hz)
    for (let i = 0; i < 8 && i < bufferLength; i++) {
      bassSum += dataArray[i];
    }
    // Vocals: bins 8 to 36 (~250 - 3000 Hz)
    for (let i = 8; i < 36 && i < bufferLength; i++) {
      vocalSum += dataArray[i];
    }
    // Highs: bins 36 to 90 (~3000 - 8000 Hz)
    for (let i = 36; i < 90 && i < bufferLength; i++) {
      highSum += dataArray[i];
    }
    for (let i = 0; i < bufferLength; i++) {
      totalSum += dataArray[i];
    }

    const bassEnergy = Math.min(1, (bassSum / (8 * 255)) * 1.3);
    const vocalEnergy = Math.min(1, (vocalSum / (28 * 255)) * 1.5);
    const highEnergy = Math.min(1, (highSum / (54 * 255)) * 1.4);
    const average = totalSum / (bufferLength * 255);

    return { vocalEnergy, bassEnergy, highEnergy, average };
  }

  // Decode uploaded audio file
  public async loadAudioFile(file: File): Promise<AudioBuffer> {
    this.init();
    const arrayBuffer = await file.arrayBuffer();
    const decoded = await this.ctx!.decodeAudioData(arrayBuffer);
    return decoded;
  }

  // Play decoded audio buffer
  public playBuffer(buffer: AudioBuffer, offsetSec = 0, onEnded?: () => void) {
    this.stop();
    this.init();

    this.sourceNode = this.ctx!.createBufferSource();
    this.sourceNode.buffer = buffer;
    this.sourceNode.connect(this.gainNode!);

    this.startTime = this.ctx!.currentTime - offsetSec;
    this.sourceNode.start(0, offsetSec);
    this.isPlaying = true;
    this.isPaused = false;
    this.isSynthesizing = false;

    this.sourceNode.onended = () => {
      this.isPlaying = false;
      if (onEnded) onEnded();
    };
  }

  // Synthesize musical backing track for preset songs
  public playPresetSynth(songId: string, bpm = 115, offsetSec = 0, onEnded?: () => void) {
    this.stop();
    this.init();
    this.activeSongId = songId;
    this.isPlaying = true;
    this.isPaused = false;
    this.isSynthesizing = true;
    this.startTime = this.ctx!.currentTime - offsetSec;

    const intervalMs = (60 / bpm) * 500; // eighth notes
    let step = Math.floor((offsetSec * 1000) / intervalMs);

    const scheduleBeat = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Kick drum on beats 1, 3 (steps 0, 4)
      if (step % 4 === 0) {
        this.triggerDrum(now, 130, 45, 0.28, 'sine');
      }

      // Snare on beats 2, 4 (steps 2, 6)
      if (step % 4 === 2) {
        this.triggerNoise(now, 0.16);
      }

      // Hi-hat on every step
      this.triggerHat(now, 0.05);

      // Bass line chord
      const rootNotes = [55, 65.41, 48.99, 58.27]; // A, C, G, D
      const chordIndex = Math.floor(step / 8) % rootNotes.length;
      const freq = rootNotes[chordIndex];
      this.triggerBass(now, freq, intervalMs / 1000);

      // Melodic vocal synth lead (simulating human vocal cadence)
      if (step % 2 === 0) {
        const vocalPitches = [220, 261.63, 293.66, 329.63, 392.0, 440];
        const pitch = vocalPitches[(step * 3) % vocalPitches.length];
        this.triggerVocalSynth(now, pitch, (intervalMs / 1000) * 0.9);
      }

      step++;
    };

    // Run first step immediately
    scheduleBeat();
    this.synthInterval = window.setInterval(scheduleBeat, intervalMs);
  }

  private triggerDrum(time: number, startFreq: number, endFreq: number, duration: number, type: OscillatorType) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerHat(time: number, duration: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'highpass' as any;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(8000, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerNoise(time: number, duration: number) {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noise.start(time);
  }

  private triggerBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, time);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.linearRampToValueAtTime(0.2, time + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerVocalSynth(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.gainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    // Subtle vibrato
    osc.frequency.linearRampToValueAtTime(freq * 1.015, time + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(freq, time + duration);

    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.gainNode);

    osc.start(time);
    osc.stop(time + duration);
  }

  public getCurrentTime(): number {
    if (!this.ctx) return 0;
    if (this.isPaused) return this.pauseOffset;
    if (!this.isPlaying) return 0;
    return Math.max(0, this.ctx.currentTime - this.startTime);
  }

  public setVolume(val: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, val));
    }
  }

  public stop() {
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
        this.sourceNode.disconnect();
      } catch (e) {
        // ignore already stopped
      }
      this.sourceNode = null;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.pauseOffset = 0;
  }
}

export const melomotionAudio = new MelomotionAudioEngine();
