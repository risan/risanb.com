export type PresetId = 'chimes' | 'bit' | 'pad' | 'cosmic';
export type MoodId = 'bright' | 'moody' | 'mystic';

export interface Settings {
  sound: boolean;
  preset: PresetId;
  mood: MoodId;
  tempo: number;
  space: number;
}

interface Voice {
  wave: OscillatorType;
  /** Second oscillator: a detuned copy at the same pitch, or a quiet overtone. */
  wave2: OscillatorType;
  ratio2: number;
  gain2: number;
  detuneCents: number;
  /** Seconds. Time constants for decay and release, so tails never end with a click. */
  attack: number;
  decay: number;
  sustain: number;
  hold: number;
  release: number;
  cutoff: number;
  /** How far above its resting cutoff the filter starts, closing over the decay. */
  sweep: number;
  resonance: number;
  gain: number;
  /** Default reverb and echo amount. */
  space: number;
}

export const VOICES: Record<PresetId, Voice> = {
  // Glassy bell: pure sine plus a quiet octave-and-a-fifth shimmer, long soft tail.
  chimes: {
    wave: 'sine', wave2: 'sine', ratio2: 3, gain2: 0.16, detuneCents: 3,
    attack: 0.003, decay: 0.35, sustain: 0, hold: 0, release: 0.18,
    cutoff: 5000, sweep: 1.5, resonance: 0.5, gain: 1, space: 0.5,
  },
  // Rounded square pluck, dry, like a handheld console.
  bit: {
    wave: 'square', wave2: 'square', ratio2: 1, gain2: 0, detuneCents: 0,
    attack: 0.002, decay: 0.05, sustain: 0.3, hold: 0.07, release: 0.04,
    cutoff: 2600, sweep: 1.5, resonance: 0.7, gain: 0.5, space: 0.08,
  },
  // Two detuned saws behind a slow filter: warm, wide and swelling.
  pad: {
    wave: 'sawtooth', wave2: 'sawtooth', ratio2: 1, gain2: 1, detuneCents: 8,
    attack: 0.16, decay: 0.25, sustain: 0.7, hold: 0.22, release: 0.55,
    cutoff: 1200, sweep: 1.6, resonance: 0.8, gain: 0.5, space: 0.75,
  },
  // Resonant filter pluck that sweeps shut, thrown into a long echo.
  cosmic: {
    wave: 'triangle', wave2: 'sawtooth', ratio2: 1, gain2: 0.45, detuneCents: 6,
    attack: 0.004, decay: 0.28, sustain: 0, hold: 0, release: 0.2,
    cutoff: 700, sweep: 6, resonance: 5, gain: 0.65, space: 0.8,
  },
};

const SCALES: Record<MoodId, number[]> = {
  bright: [0, 2, 4, 7, 9],
  moody: [0, 3, 5, 7, 10],
  mystic: [0, 2, 3, 7, 8],
};

const STORAGE_KEY = 'heatmap-synth';
const ROOT_MIDI = 48;
// Start an octave above the root so the negative chord shift stays in range.
const FIRST_SCALE_STEP = 5;
// Scale steps the key centre moves per month, cycling every four months.
const CHORD_SHIFTS = [0, 2, -1, 1];
const VELOCITY_BY_LEVEL = [0, 0.4, 0.6, 0.8, 1];
const MAX_VOICES = 12;
const VOICE_GAIN = 0.2;
const BEEP_GAIN = 0.07;
const BEEP_ATTACK = 0.002;
const BEEP_RELEASE = 0.01;
const DEFAULT_SETTINGS: Settings = { sound: true, preset: 'chimes', mood: 'bright', tempo: 110, space: VOICES.chimes.space };

const isPreset = (value: unknown): value is PresetId => typeof value === 'string' && value in VOICES;
const isMood = (value: unknown): value is MoodId => typeof value === 'string' && value in SCALES;
const clamp = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');

    return {
      sound: typeof saved.sound === 'boolean' ? saved.sound : DEFAULT_SETTINGS.sound,
      preset: isPreset(saved.preset) ? saved.preset : DEFAULT_SETTINGS.preset,
      mood: isMood(saved.mood) ? saved.mood : DEFAULT_SETTINGS.mood,
      tempo: clamp(saved.tempo, 60, 180, DEFAULT_SETTINGS.tempo),
      space: clamp(saved.space, 0, 1, DEFAULT_SETTINGS.space),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be blocked; settings then last for the page only.
  }
}

export function noteFrequency(mood: MoodId, weekday: number, chord: number) {
  const scale = SCALES[mood];
  const step = FIRST_SCALE_STEP + (6 - weekday) + CHORD_SHIFTS[chord]!;
  const octave = Math.floor(step / scale.length);
  const midi = ROOT_MIDI + 12 * octave + scale[step - octave * scale.length]!;

  return 440 * 2 ** ((midi - 69) / 12);
}

function createReverbImpulse(ctx: BaseAudioContext, seconds = 2.2) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    let smoothed = 0;

    for (let i = 0; i < length; i++) {
      const progress = i / length;
      // A one-pole low-pass that closes over time makes the tail darker as it fades, like a real room.
      smoothed += (Math.random() * 2 - 1 - smoothed) * (0.9 - 0.75 * progress);
      data[i] = smoothed * (1 - progress) ** 3;
    }
  }

  return impulse;
}

interface ActiveVoice {
  envelope: GainNode;
  oscillators: OscillatorNode[];
  startsAt: number;
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private input!: GainNode;
  private reverbSend!: GainNode;
  private echoSend!: GainNode;
  private output!: AudioNode;
  private voices: ActiveVoice[] = [];
  private beeps = new Set<ActiveVoice>();

  constructor(private settings: Settings) {}

  /** Creates the audio graph on the first call. Must run inside a user gesture. */
  public unlock() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.buildGraph(this.ctx);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // voices -> dry + reverb send + echo send -> master -> gentle low-pass -> compressor -> speakers
  // beeps skip everything before the compressor, so they stay dry like a phone speaker.
  private buildGraph(ctx: AudioContext) {
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 20;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.25;
    compressor.connect(ctx.destination);
    this.output = compressor;

    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 9000;
    tone.Q.value = 0.5;
    tone.connect(compressor);

    const master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(tone);

    this.input = ctx.createGain();
    this.input.connect(master);

    const reverb = ctx.createConvolver();
    reverb.buffer = createReverbImpulse(ctx);
    reverb.connect(master);
    this.reverbSend = ctx.createGain();
    this.reverbSend.connect(reverb);

    const echo = ctx.createDelay(1);
    echo.delayTime.value = 0.3;
    const echoFeedback = ctx.createGain();
    echoFeedback.gain.value = 0.38;
    const echoDamping = ctx.createBiquadFilter();
    echoDamping.type = 'lowpass';
    echoDamping.frequency.value = 2500;
    echo.connect(echoDamping);
    echoDamping.connect(echoFeedback);
    echoFeedback.connect(echo);
    echoDamping.connect(master);
    echoDamping.connect(reverb);
    this.echoSend = ctx.createGain();
    this.echoSend.connect(echo);

    this.input.connect(this.reverbSend);
    this.input.connect(this.echoSend);
    this.applySpace();
  }

  public applySpace() {
    if (!this.ctx) {
      return;
    }

    const now = this.ctx.currentTime;
    this.reverbSend.gain.setTargetAtTime(this.settings.space * 0.8, now, 0.05);
    this.echoSend.gain.setTargetAtTime(this.settings.space * 0.45, now, 0.05);
  }

  public play(frequency: number, level: number, loudness = 1, when = 0) {
    const ctx = this.ctx;

    if (!ctx || level === 0) {
      return;
    }

    const voice = VOICES[this.settings.preset];
    const velocity = VELOCITY_BY_LEVEL[level]!;
    const start = Math.max(when, ctx.currentTime);
    const peak = VOICE_GAIN * voice.gain * velocity * loudness;

    while (this.voices.length >= MAX_VOICES) {
      this.stealOldest(start);
    }

    const restingCutoff = Math.min(12000, voice.cutoff * (0.6 + 0.6 * velocity));
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = voice.resonance;
    filter.frequency.setValueAtTime(Math.min(12000, restingCutoff * voice.sweep), start);
    filter.frequency.setTargetAtTime(restingCutoff, start + voice.attack, voice.decay * 0.8);

    const decayEnd = start + voice.attack + voice.decay * 3;
    const releaseStart = decayEnd + voice.hold;
    const stopAt = releaseStart + voice.release * 7;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(peak, start + Math.max(0.003, voice.attack));
    envelope.gain.setTargetAtTime(peak * voice.sustain, start + voice.attack, voice.decay);
    envelope.gain.setTargetAtTime(0, releaseStart, voice.release);

    filter.connect(envelope);
    envelope.connect(this.input);

    const oscillators = [this.oscillator(ctx, voice.wave, frequency, -voice.detuneCents, 1, filter)];

    if (voice.gain2 > 0) {
      oscillators.push(this.oscillator(ctx, voice.wave2, frequency * voice.ratio2, voice.detuneCents, voice.gain2, filter));
    }

    const active = { envelope, oscillators, startsAt: start };
    this.voices.push(active);
    oscillators[0]!.onended = () => {
      const index = this.voices.indexOf(active);

      // A stolen voice was already removed from the list.
      if (index !== -1) {
        this.voices.splice(index, 1);
      }

      envelope.disconnect();
      filter.disconnect();
    };

    for (const oscillator of oscillators) {
      oscillator.start(start);
      oscillator.stop(stopAt);
    }
  }

  private oscillator(ctx: AudioContext, type: OscillatorType, frequency: number, cents: number, level: number, destination: AudioNode) {
    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = cents;

    if (level === 1) {
      oscillator.connect(destination);
    } else {
      const gain = ctx.createGain();
      gain.gain.value = level;
      oscillator.connect(gain);
      gain.connect(destination);
    }

    return oscillator;
  }

  private stealOldest(now: number) {
    const oldest = this.voices.shift();

    if (oldest) {
      this.silence(oldest, now);
    }
  }

  private silence(voice: ActiveVoice, now: number) {
    // Cancelling a voice that has not started also drops its opening zero, leaving gain at 1; never let it start.
    if (voice.startsAt >= now) {
      voice.oscillators.forEach((oscillator) => oscillator.stop(now));

      return;
    }

    voice.envelope.gain.cancelScheduledValues(now);
    voice.envelope.gain.setTargetAtTime(0, now, 0.01);
    voice.oscillators.forEach((oscillator) => oscillator.stop(now + 0.08));
  }

  /** A dry monophonic square-wave beep, like an old phone. */
  public beep(frequency: number, duration: number, when = 0, gain = BEEP_GAIN) {
    const ctx = this.ctx;

    if (!ctx || !this.settings.sound) {
      return;
    }

    const start = Math.max(when, ctx.currentTime);
    const end = start + duration;
    const oscillator = ctx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(gain, start + BEEP_ATTACK);
    envelope.gain.setValueAtTime(gain, end - BEEP_RELEASE);
    envelope.gain.linearRampToValueAtTime(0, end);

    oscillator.connect(envelope);
    envelope.connect(this.output);

    const active = { envelope, oscillators: [oscillator], startsAt: start };
    this.beeps.add(active);
    oscillator.onended = () => {
      this.beeps.delete(active);
      oscillator.disconnect();
      envelope.disconnect();
    };
    oscillator.start(start);
    oscillator.stop(end);
  }

  public get time() {
    return this.ctx?.currentTime ?? 0;
  }

  public stopAll() {
    while (this.voices.length > 0) {
      this.stealOldest(this.time);
    }

    for (const beep of this.beeps) {
      this.silence(beep, this.time);
    }

    this.beeps.clear();
  }
}
