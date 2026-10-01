---
title: Making the GitHub Heatmap Sing
date: 2026-10-02
description: Turning hover states on the GitHub heatmap into oscillators, envelopes, reverb, and a tiny sequencer that plays your year — with Web Audio, no library.
categories: [tutorial]
tags: [javascript, web-audio]
images: [/posts/making-the-github-heatmap-sing/og.png]
---
[Last time](/posts/building-a-github-activity-heatmap/), the heatmap just sat there — a grid of rectangles, a color per contribution level, nothing you could do but look at it. It bugged me. Every cell already carries a day, a weekday, a count. That's basically a note, a pitch, and a velocity. So I wired the grid up to the Web Audio API and turned a year of commits into something you can hover, tap, and play back like a sequencer.

This post is the synth half: how a day becomes a note, how a note gets its sound, and how the whole thing turns into a tiny instrument you play by moving your mouse across a calendar. Every section below has a small working version you can click — real oscillators, running in your browser right now.

{{<toc>}}

> **Heads up:** every demo below needs a click before it can make sound. Browsers won't let a page play audio until a user gesture unlocks it, so the first press of any button also creates the `AudioContext`.

## From a date to a note

Each contribution day already has what a note needs: `weekday` picks the row (so it picks the pitch), and `contributionLevel` picks how loud. The only new idea here is a scale — a short list of steps that keeps every note sounding like it belongs together, picked by mood:

```typescript
const SCALES: Record<MoodId, number[]> = {
  bright: [0, 2, 4, 7, 9],
  moody: [0, 3, 5, 7, 10],
  mystic: [0, 2, 3, 7, 8],
};

const ROOT_MIDI = 48;
const FIRST_SCALE_STEP = 5;
const CHORD_SHIFTS = [0, 2, -1, 1]; // nudges the key centre, cycling every 4 months

function noteFrequency(mood: MoodId, weekday: number, chord: number) {
  const scale = SCALES[mood];
  const step = FIRST_SCALE_STEP + (6 - weekday) + CHORD_SHIFTS[chord];
  const octave = Math.floor(step / scale.length);
  const midi = ROOT_MIDI + 12 * octave + scale[step - octave * scale.length];
  return 440 * 2 ** ((midi - 69) / 12);
}
```

Flip the weekday on purpose: Sunday at the top of the grid gets the highest step, Saturday at the bottom gets the lowest. Scrolling your eyes down a column reads top-to-bottom, high-to-low, the same direction you'd already scan a calendar. `chord` comes from the week's own month (`chordOf` below), so the key centre drifts every few months instead of every single day:

```typescript
const chordOf = (week: Week) =>
  Number((week.contributionDays[3] ?? week.contributionDays[0]).date.slice(5, 7)) % 4;
```

Press the buttons below and you'll hear the raw result: an oscillator, started and stopped with nothing in between.

<div class="synth-demo not-prose my-8 p-4 md:p-6 bg-[var(--paper)] border border-[var(--rule)] rounded">
  <style>
    .synth-demo-btn {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 7px 11px;
      border: 1px solid var(--rule);
      border-radius: 6px;
      background: var(--paper);
      color: var(--ink);
      cursor: pointer;
    }
    .synth-demo-btn:hover { border-color: var(--accent-soft); color: var(--accent); }
    .synth-demo-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 5px 10px;
      border: 1px solid var(--rule);
      border-radius: 999px;
      cursor: pointer;
      color: var(--ink-muted);
    }
    .synth-demo-chip input { accent-color: var(--accent); }
    .synth-demo-chip:has(input:checked) { border-color: var(--accent); color: var(--ink); background: var(--sunk); }
    .synth-demo input[type='range'] { accent-color: var(--accent); width: 140px; vertical-align: middle; }
    .synth-demo-grid { --gh-level-0: #ede8de; --gh-level-1: #f4dcd3; --gh-level-2: #e39c84; --gh-level-3: #c8502e; --gh-level-4: #872e15; }
    html.dark .synth-demo-grid { --gh-level-0: #222428; --gh-level-1: #3d231b; --gh-level-2: #733725; --gh-level-3: #c05435; --gh-level-4: #e06b47; }
    .synth-demo-grid .cell-0 { fill: var(--gh-level-0); }
    .synth-demo-grid .cell-1 { fill: var(--gh-level-1); }
    .synth-demo-grid .cell-2 { fill: var(--gh-level-2); }
    .synth-demo-grid .cell-3 { fill: var(--gh-level-3); }
    .synth-demo-grid .cell-4 { fill: var(--gh-level-4); }
    .synth-demo-grid .cell { cursor: pointer; transition: opacity 0.1s ease; }
    .synth-demo-grid .cell:hover { stroke: var(--ink); stroke-width: 1px; }
    .synth-demo-playhead { fill: none; stroke: var(--accent); stroke-width: 1.5; }
    .synth-demo-label { font-family: var(--font-mono); font-size: 10px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.04em; }
  </style>

  <p class="synth-demo-label mb-2">Step 1 &middot; a raw oscillator per weekday</p>
  <div class="flex flex-wrap gap-2" id="demo-1-buttons"></div>

  <script>
    (function () {
      const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const SCALES = { bright: [0, 2, 4, 7, 9] };
      const ROOT_MIDI = 48, FIRST_SCALE_STEP = 5;

      function noteFrequency(weekday) {
        const scale = SCALES.bright;
        const step = FIRST_SCALE_STEP + (6 - weekday);
        const octave = Math.floor(step / scale.length);
        const midi = ROOT_MIDI + 12 * octave + scale[step - octave * scale.length];
        return 440 * Math.pow(2, (midi - 69) / 12);
      }

      let ctx;
      const container = document.getElementById('demo-1-buttons');

      WEEKDAYS.forEach((label, weekday) => {
        const button = document.createElement('button');
        button.className = 'synth-demo-btn';
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', () => {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = noteFrequency(weekday);
          const gain = ctx.createGain();
          gain.gain.value = 0.2;
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        });
        container.appendChild(button);
      });
    })();
  </script>
</div>

It works, but it sounds like a doorbell with a stuck finger — the gain jumps straight to full volume and straight back to zero, which is an audible click at both ends. That's the next problem to fix.

## Shaping a voice so it doesn't click

A real sound has a shape: it fades in, settles, and fades out. That shape is an envelope, and Web Audio gives you `setTargetAtTime` for it — an exponential approach to a target instead of a hard jump, so there's no edge for your speakers to click on:

```typescript
const envelope = ctx.createGain();
envelope.gain.setValueAtTime(0, start);
envelope.gain.linearRampToValueAtTime(peak, start + Math.max(0.003, voice.attack));
envelope.gain.setTargetAtTime(peak * voice.sustain, start + voice.attack, voice.decay);
envelope.gain.setTargetAtTime(0, releaseStart, voice.release);
```

The filter gets the same treatment, sweeping from a brighter cutoff down to a resting one as the note decays — which is most of why a plucked note sounds plucked:

```typescript
const restingCutoff = Math.min(12000, voice.cutoff * (0.6 + 0.6 * velocity));
filter.frequency.setValueAtTime(Math.min(12000, restingCutoff * voice.sweep), start);
filter.frequency.setTargetAtTime(restingCutoff, start + voice.attack, voice.decay * 0.8);
```

`velocity` comes straight from the contribution level (1 to 4), and it doesn't just control volume — it brightens the filter too. A quiet day doesn't just play softer, it plays a little darker, closer to how a real instrument responds to a gentle touch.

<div class="synth-demo not-prose my-8 p-4 md:p-6 bg-[var(--paper)] border border-[var(--rule)] rounded">
  <p class="synth-demo-label mb-2">Step 2 &middot; the same weekdays, shaped</p>
  <div class="flex flex-wrap gap-2" id="demo-2-buttons"></div>

  <script>
    window.__hmSynth = (function () {
      let ctx, master, reverbSend, echoSend;

      function impulse(ctx, seconds) {
        const length = Math.floor(ctx.sampleRate * seconds);
        const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const data = buffer.getChannelData(channel);
          let smoothed = 0;
          for (let i = 0; i < length; i++) {
            const progress = i / length;
            smoothed += (Math.random() * 2 - 1 - smoothed) * (0.9 - 0.75 * progress);
            data[i] = smoothed * Math.pow(1 - progress, 3);
          }
        }
        return buffer;
      }

      function ensureGraph() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();

        const compressor = ctx.createDynamicsCompressor();
        compressor.connect(ctx.destination);

        master = ctx.createGain();
        master.gain.value = 0.8;
        master.connect(compressor);

        const reverb = ctx.createConvolver();
        reverb.buffer = impulse(ctx, 2.2);
        reverb.connect(master);
        reverbSend = ctx.createGain();
        reverbSend.gain.value = 0;
        reverbSend.connect(reverb);

        const echo = ctx.createDelay(1);
        echo.delayTime.value = 0.3;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.35;
        const damping = ctx.createBiquadFilter();
        damping.type = 'lowpass';
        damping.frequency.value = 2500;
        echo.connect(damping);
        damping.connect(feedback);
        feedback.connect(echo);
        damping.connect(master);
        echoSend = ctx.createGain();
        echoSend.gain.value = 0;
        echoSend.connect(echo);
      }

      function unlock() {
        ensureGraph();
        if (ctx.state === 'suspended') ctx.resume();
      }

      function setSpace(amount) {
        ensureGraph();
        const now = ctx.currentTime;
        reverbSend.gain.setTargetAtTime(amount * 0.8, now, 0.05);
        echoSend.gain.setTargetAtTime(amount * 0.45, now, 0.05);
      }

      function play(freq, opts) {
        opts = opts || {};
        unlock();
        const now = ctx.currentTime;
        const shaped = opts.shaped !== false;
        const velocity = opts.velocity != null ? opts.velocity : 1;
        const cutoff = opts.cutoff || 5000;
        const decay = opts.decay || 0.35;
        const sustain = opts.sustain != null ? opts.sustain : 0;
        const duration = opts.duration || 1.4;
        const peak = (opts.gain != null ? opts.gain : 0.22) * velocity;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = opts.resonance || 0.5;

        const envelope = ctx.createGain();

        if (shaped) {
          const resting = Math.min(12000, cutoff * (0.6 + 0.6 * velocity));
          filter.frequency.setValueAtTime(Math.min(12000, resting * 1.5), now);
          filter.frequency.setTargetAtTime(resting, now + 0.003, decay * 0.8);
          envelope.gain.setValueAtTime(0, now);
          envelope.gain.linearRampToValueAtTime(peak, now + 0.01);
          envelope.gain.setTargetAtTime(peak * sustain, now + 0.01, decay);
          envelope.gain.setTargetAtTime(0, now + decay * 2, 0.2);
        } else {
          filter.frequency.value = 20000;
          envelope.gain.setValueAtTime(peak, now);
          envelope.gain.setValueAtTime(0, now + 0.3);
        }

        filter.connect(envelope);
        envelope.connect(master);
        if (reverbSend) envelope.connect(reverbSend);
        if (echoSend) envelope.connect(echoSend);

        const osc = ctx.createOscillator();
        osc.type = opts.wave || 'sine';
        osc.frequency.value = freq;
        osc.detune.value = opts.detune ? -opts.detune : 0;
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + duration);

        if (opts.gain2) {
          const osc2 = ctx.createOscillator();
          osc2.type = opts.wave2 || osc.type;
          osc2.frequency.value = freq * (opts.ratio2 || 1);
          osc2.detune.value = opts.detune || 0;
          const g2 = ctx.createGain();
          g2.gain.value = opts.gain2;
          osc2.connect(g2);
          g2.connect(filter);
          osc2.start(now);
          osc2.stop(now + duration);
        }
      }

      return { unlock, play, setSpace };
    })();

    (function () {
      const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const SCALES = { bright: [0, 2, 4, 7, 9] };
      const ROOT_MIDI = 48, FIRST_SCALE_STEP = 5;

      function noteFrequency(weekday) {
        const scale = SCALES.bright;
        const step = FIRST_SCALE_STEP + (6 - weekday);
        const octave = Math.floor(step / scale.length);
        const midi = ROOT_MIDI + 12 * octave + scale[step - octave * scale.length];
        return 440 * Math.pow(2, (midi - 69) / 12);
      }

      const container = document.getElementById('demo-2-buttons');

      WEEKDAYS.forEach((label, weekday) => {
        const button = document.createElement('button');
        button.className = 'synth-demo-btn';
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', () => {
          window.__hmSynth.play(noteFrequency(weekday), {
            wave: 'sine', wave2: 'sine', ratio2: 3, gain2: 0.16, detune: 3,
            cutoff: 5000, decay: 0.35, sustain: 0, velocity: 1, duration: 1.6,
          });
        });
        container.appendChild(button);
      });
    })();
  </script>
</div>

That demo is already playing two oscillators per note, not one: a quiet copy pitched a twelfth up (`ratio2: 3`) for shimmer, each one detuned a few cents in opposite directions (`-voice.detuneCents` and `+voice.detuneCents`) so the pair beats very slightly against itself instead of landing on one dead-flat pitch. That's the whole trick behind "chimes" versus "8-bit" versus "pad" — same envelope code, different numbers.

## Picking a preset and a mood

Four presets, three moods, each just a plain object:

```typescript
const VOICES: Record<PresetId, Voice> = {
  chimes: { wave: 'sine', wave2: 'sine', ratio2: 3, gain2: 0.16, detuneCents: 3,
    attack: 0.003, decay: 0.35, sustain: 0, cutoff: 5000, sweep: 1.5, gain: 1, space: 0.5 },
  bit: { wave: 'square', wave2: 'square', ratio2: 1, gain2: 0, detuneCents: 0,
    attack: 0.002, decay: 0.05, sustain: 0.3, cutoff: 2600, sweep: 1.5, gain: 0.5, space: 0.08 },
  pad: { wave: 'sawtooth', wave2: 'sawtooth', ratio2: 1, gain2: 1, detuneCents: 8,
    attack: 0.16, decay: 0.25, sustain: 0.7, cutoff: 1200, sweep: 1.6, gain: 0.5, space: 0.75 },
  cosmic: { wave: 'triangle', wave2: 'sawtooth', ratio2: 1, gain2: 0.45, detuneCents: 6,
    attack: 0.004, decay: 0.28, sustain: 0, cutoff: 700, sweep: 6, gain: 0.65, space: 0.8 },
};
```

Switching preset also resets the room (`settings.space = VOICES[preset].space`), so jumping from a dry 8-bit pluck to a wide cosmic pad doesn't leave you stuck in a reverb amount tuned for the wrong voice:

```typescript
if (input.name === 'preset') {
  settings.space = VOICES[settings.preset].space;
  engine.applySpace();
}
```

<div class="synth-demo not-prose my-8 p-4 md:p-6 bg-[var(--paper)] border border-[var(--rule)] rounded">
  <p class="synth-demo-label mb-2">Step 3 &middot; preset + mood, one chord</p>
  <div class="flex flex-wrap items-center gap-4">
    <fieldset class="flex flex-wrap gap-2" id="demo-3-preset">
      <label class="synth-demo-chip"><input type="radio" name="demo3-preset" value="chimes" checked /><span>Chimes</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo3-preset" value="bit" /><span>8-Bit</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo3-preset" value="pad" /><span>Pad</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo3-preset" value="cosmic" /><span>Cosmic</span></label>
    </fieldset>
    <fieldset class="flex flex-wrap gap-2" id="demo-3-mood">
      <label class="synth-demo-chip"><input type="radio" name="demo3-mood" value="bright" checked /><span>Bright</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo3-mood" value="moody" /><span>Moody</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo3-mood" value="mystic" /><span>Mystic</span></label>
    </fieldset>
    <button type="button" class="synth-demo-btn" id="demo-3-play">Play chord</button>
  </div>

  <script>
    (function () {
      const VOICES = {
        chimes: { wave: 'sine', wave2: 'sine', ratio2: 3, gain2: 0.16, detune: 3, cutoff: 5000, decay: 0.35, sustain: 0, space: 0.5 },
        bit: { wave: 'square', wave2: 'square', ratio2: 1, gain2: 0, detune: 0, cutoff: 2600, decay: 0.05, sustain: 0.3, space: 0.08 },
        pad: { wave: 'sawtooth', wave2: 'sawtooth', ratio2: 1, gain2: 1, detune: 8, cutoff: 1200, decay: 0.25, sustain: 0.7, space: 0.75 },
        cosmic: { wave: 'triangle', wave2: 'sawtooth', ratio2: 1, gain2: 0.45, detune: 6, cutoff: 700, decay: 0.28, sustain: 0, space: 0.8 },
      };
      const SCALES = { bright: [0, 2, 4, 7, 9], moody: [0, 3, 5, 7, 10], mystic: [0, 2, 3, 7, 8] };
      const ROOT_MIDI = 48, FIRST_SCALE_STEP = 5;

      function noteFrequency(mood, weekday) {
        const scale = SCALES[mood];
        const step = FIRST_SCALE_STEP + (6 - weekday);
        const octave = Math.floor(step / scale.length);
        const midi = ROOT_MIDI + 12 * octave + scale[step - octave * scale.length];
        return 440 * Math.pow(2, (midi - 69) / 12);
      }

      const presetFields = document.getElementById('demo-3-preset');
      const moodFields = document.getElementById('demo-3-mood');
      const playButton = document.getElementById('demo-3-play');
      const checkedValue = (fieldset) => fieldset.querySelector('input:checked').value;

      playButton.addEventListener('click', () => {
        const voice = VOICES[checkedValue(presetFields)];
        const mood = checkedValue(moodFields);

        window.__hmSynth.setSpace(voice.space);
        [6, 3, 0].forEach((weekday, index) => {
          window.__hmSynth.play(noteFrequency(mood, weekday), {
            ...voice, velocity: 0.9, duration: 1.8, gain: index === 0 ? 0.22 : 0.16,
          });
        });
      });
    })();
  </script>
</div>

## Giving it a room to live in

A convolution reverb needs an impulse response — a recording of how some space (real or imagined) reacts to a single click. There's no room to record, so the real code fakes one: filtered noise that darkens and fades over a couple of seconds.

```typescript
function createReverbImpulse(ctx: BaseAudioContext, seconds = 2.2) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    let smoothed = 0;

    for (let i = 0; i < length; i++) {
      const progress = i / length;
      smoothed += (Math.random() * 2 - 1 - smoothed) * (0.9 - 0.75 * progress);
      data[i] = smoothed * (1 - progress) ** 3;
    }
  }

  return impulse;
}
```

That one-pole smoothing is doing the real work: white noise on its own sounds like static, but nudging each sample toward the last one — a little less each step — makes the tail close like a real room absorbing high frequencies as the sound dies away. A short delay line with feedback sits alongside it for echo, feeding back into itself and into the reverb:

```typescript
const echo = ctx.createDelay(1);
echo.delayTime.value = 0.3;
const echoFeedback = ctx.createGain();
echoFeedback.gain.value = 0.38;
echo.connect(echoDamping);
echoDamping.connect(echoFeedback);
echoFeedback.connect(echo);
```

Both sends are just gain nodes between the dry signal and these two effects, so "space" is one number that scales both at once:

<div class="synth-demo not-prose my-8 p-4 md:p-6 bg-[var(--paper)] border border-[var(--rule)] rounded">
  <p class="synth-demo-label mb-2">Step 4 &middot; dry &rarr; wet</p>
  <div class="flex flex-wrap items-center gap-4">
    <label class="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
      <span>Dry</span>
      <input type="range" id="demo-4-space" min="0" max="1" step="0.05" value="0" />
      <span>Wet</span>
    </label>
    <button type="button" class="synth-demo-btn" id="demo-4-play">Play phrase</button>
  </div>

  <script>
    (function () {
      const slider = document.getElementById('demo-4-space');
      const playButton = document.getElementById('demo-4-play');
      const notes = [392, 440, 523.25];

      playButton.addEventListener('click', () => {
        window.__hmSynth.setSpace(Number(slider.value));
        notes.forEach((freq, index) => {
          setTimeout(() => {
            window.__hmSynth.play(freq, {
              wave: 'triangle', wave2: 'sawtooth', ratio2: 1, gain2: 0.45, detune: 6,
              cutoff: 700, decay: 0.3, sustain: 0, velocity: 1, duration: 1.6,
            });
          }, index * 260);
        });
      });
    })();
  </script>
</div>

## Turning hover into an instrument

The grid already has every cell's weekday, level, and chord sitting in `data-*` attributes from the drawing step. Playing it is one `pointerover` listener, plus a throttle so dragging across the same cell twice doesn't retrigger it:

```typescript
const lastHoverAt = new WeakMap<Element, number>();

function triggerCell(cell: SVGElement, timeStamp: number) {
  const level = Number(cell.dataset.level);
  const sinceLast = timeStamp - (lastHoverAt.get(cell) ?? -Infinity);

  if (!settings.sound || level === 0 || sinceLast < MIN_RETRIGGER_MS) return;

  lastHoverAt.set(cell, timeStamp);
  engine.play(noteFrequency(settings.mood, Number(cell.dataset.day), Number(cell.dataset.chord)), level);
}
```

> **Non-obvious bit:** on a touchscreen, the element under your finger when you press down captures the pointer, so `pointerover` never fires for the cells your finger slides across afterward. One line fixes it for mouse and touch alike: `event.target.releasePointerCapture?.(event.pointerId)` on `pointerdown`, right before reading the first cell.

<div class="synth-demo not-prose my-8 p-4 md:p-6 bg-[var(--paper)] border border-[var(--rule)] rounded">
  <p class="synth-demo-label mb-2">Step 5 &middot; hover or drag to play</p>
  <div class="synth-demo-grid overflow-x-auto">
    <svg id="demo-5-grid" viewBox="0 0 220 80" width="100%" style="max-width: 420px; height: auto;"></svg>
  </div>

  <script>
    (function () {
      const LEVELS = [
        [0,1,0,0,1,0,0],[1,2,1,0,1,1,0],[0,1,2,1,0,2,1],[2,3,2,1,2,1,0],
        [1,2,3,2,1,0,1],[0,1,2,4,2,1,0],[1,0,1,2,3,2,1],[2,1,0,1,2,3,2],
        [3,2,1,0,1,2,1],[1,3,2,1,0,1,2],[0,2,4,3,1,0,1],[1,1,2,2,3,2,1],
        [2,2,1,1,2,4,2],[1,0,1,2,1,3,1],[0,1,1,0,2,2,1],[1,2,1,1,1,1,0],
      ];
      const SCALES = { bright: [0, 2, 4, 7, 9] };
      const ROOT_MIDI = 48, FIRST_SCALE_STEP = 5, CHORD_SHIFTS = [0, 2, -1, 1];
      const STEP = 13, SIZE = 10;
      const SVG_NS = 'http://www.w3.org/2000/svg';
      const MIN_RETRIGGER_MS = 120;

      function noteFrequency(weekday, chord) {
        const scale = SCALES.bright;
        const step = FIRST_SCALE_STEP + (6 - weekday) + CHORD_SHIFTS[chord];
        const octave = Math.floor(step / scale.length);
        const midi = ROOT_MIDI + 12 * octave + scale[step - octave * scale.length];
        return 440 * Math.pow(2, (midi - 69) / 12);
      }

      const svg = document.getElementById('demo-5-grid');
      const lastHoverAt = new WeakMap();

      LEVELS.forEach((column, col) => {
        column.forEach((level, row) => {
          const rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('x', String(4 + col * STEP));
          rect.setAttribute('y', String(4 + row * STEP));
          rect.setAttribute('width', String(SIZE));
          rect.setAttribute('height', String(SIZE));
          rect.setAttribute('rx', '2');
          rect.setAttribute('class', `cell cell-${level}`);
          rect.dataset.weekday = String(row);
          rect.dataset.chord = String(col % 4);
          rect.dataset.level = String(level);
          svg.appendChild(rect);
        });
      });

      function trigger(target, timeStamp) {
        if (!(target instanceof Element) || !target.classList.contains('cell')) return;
        const level = Number(target.dataset.level);
        const sinceLast = timeStamp - (lastHoverAt.get(target) ?? -Infinity);
        if (level === 0 || sinceLast < MIN_RETRIGGER_MS) return;

        lastHoverAt.set(target, timeStamp);
        window.__hmSynth.play(noteFrequency(Number(target.dataset.weekday), Number(target.dataset.chord)), {
          wave: 'sine', wave2: 'sine', ratio2: 3, gain2: 0.16, detune: 3,
          cutoff: 5000, decay: 0.35, sustain: 0, velocity: level / 4, duration: 1.2,
        });
      }

      svg.addEventListener('pointerdown', (event) => {
        event.target.releasePointerCapture?.(event.pointerId);
        trigger(event.target, event.timeStamp);
      });
      svg.addEventListener('pointerover', (event) => trigger(event.target, event.timeStamp));
    })();
  </script>
</div>

## Playing the whole year

Press play, and the grid turns into a sequencer: one column at a time, left to right, every lit cell in that column strummed together.

```typescript
function playColumn(notes: ColumnNote[]) {
  const lit = notes.filter((note) => note.level > 0).sort((a, b) => b.weekday - a.weekday);
  const loudness = 1 / Math.sqrt(lit.length);
  const now = engine.time;

  lit.forEach((note, index) => {
    const frequency = noteFrequency(settings.mood, note.weekday, note.chord);
    engine.play(frequency, note.level, loudness, now + index * STRUM_SECONDS);
  });
}
```

`1 / Math.sqrt(lit.length)` is a standard trick for mixing several roughly-independent voices: without it, a five-note column would hit five times harder than a one-note column, and busy weeks would just distort. `STRUM_SECONDS` offsets each note by 22 milliseconds so a loaded column arrives as a quick strum instead of one flat chord. The playhead is a `<rect>` nudged with `translateX`, and the whole thing reschedules itself every `30000 / tempo` milliseconds — two columns per beat, so it still feels like it's moving at the tempo you picked instead of crawling one week at a time.

<div class="synth-demo not-prose my-8 p-4 md:p-6 bg-[var(--paper)] border border-[var(--rule)] rounded">
  <p class="synth-demo-label mb-2">Step 6 &middot; press play</p>
  <div class="synth-demo-grid overflow-x-auto relative">
    <svg id="demo-6-grid" viewBox="0 0 220 80" width="100%" style="max-width: 420px; height: auto;">
      <rect id="demo-6-playhead" class="synth-demo-playhead" x="4" y="2" width="10" height="76" rx="3"></rect>
    </svg>
  </div>
  <div class="flex flex-wrap items-center gap-4 mt-3">
    <button type="button" class="synth-demo-btn" id="demo-6-play">Play</button>
    <label class="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
      <span>Tempo</span>
      <input type="range" id="demo-6-tempo" min="60" max="180" step="5" value="110" />
      <output id="demo-6-tempo-value">110 bpm</output>
    </label>
  </div>

  <script>
    (function () {
      const LEVELS = [
        [0,1,0,0,1,0,0],[1,2,1,0,1,1,0],[0,1,2,1,0,2,1],[2,3,2,1,2,1,0],
        [1,2,3,2,1,0,1],[0,1,2,4,2,1,0],[1,0,1,2,3,2,1],[2,1,0,1,2,3,2],
        [3,2,1,0,1,2,1],[1,3,2,1,0,1,2],[0,2,4,3,1,0,1],[1,1,2,2,3,2,1],
        [2,2,1,1,2,4,2],[1,0,1,2,1,3,1],[0,1,1,0,2,2,1],[1,2,1,1,1,1,0],
      ];
      const SCALES = { bright: [0, 2, 4, 7, 9] };
      const ROOT_MIDI = 48, FIRST_SCALE_STEP = 5, CHORD_SHIFTS = [0, 2, -1, 1];
      const STEP = 13, SIZE = 10, STRUM_SECONDS = 0.022;
      const SVG_NS = 'http://www.w3.org/2000/svg';

      function noteFrequency(weekday, chord) {
        const scale = SCALES.bright;
        const step = FIRST_SCALE_STEP + (6 - weekday) + CHORD_SHIFTS[chord];
        const octave = Math.floor(step / scale.length);
        const midi = ROOT_MIDI + 12 * octave + scale[step - octave * scale.length];
        return 440 * Math.pow(2, (midi - 69) / 12);
      }

      const svg = document.getElementById('demo-6-grid');
      const playhead = document.getElementById('demo-6-playhead');
      const playButton = document.getElementById('demo-6-play');
      const tempoSlider = document.getElementById('demo-6-tempo');
      const tempoOutput = document.getElementById('demo-6-tempo-value');

      LEVELS.forEach((column, col) => {
        column.forEach((level, row) => {
          const rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('x', String(4 + col * STEP));
          rect.setAttribute('y', String(4 + row * STEP));
          rect.setAttribute('width', String(SIZE));
          rect.setAttribute('height', String(SIZE));
          rect.setAttribute('rx', '2');
          rect.setAttribute('class', `cell cell-${level}`);
          svg.appendChild(rect);
        });
      });
      svg.appendChild(playhead);

      let playingCol = -1;
      let timer = 0;

      function playColumn(col) {
        const lit = LEVELS[col]
          .map((level, row) => ({ row, level }))
          .filter((note) => note.level > 0)
          .sort((a, b) => b.row - a.row);
        const loudness = 1 / Math.sqrt(lit.length || 1);

        lit.forEach((note, index) => {
          setTimeout(() => {
            window.__hmSynth.play(noteFrequency(note.row, col % 4), {
              wave: 'sine', wave2: 'sine', ratio2: 3, gain2: 0.16, detune: 3,
              cutoff: 5000, decay: 0.35, sustain: 0, velocity: (note.level / 4) * loudness, duration: 1.2,
            });
          }, index * STRUM_SECONDS * 1000);
        });
      }

      function step() {
        if (playingCol >= LEVELS.length) {
          stop();
          return;
        }
        playColumn(playingCol);
        playhead.setAttribute('x', String(4 + playingCol * STEP));
        playingCol++;
        timer = setTimeout(step, 30000 / Number(tempoSlider.value));
      }

      function stop() {
        clearTimeout(timer);
        playingCol = -1;
        playButton.textContent = 'Play';
      }

      playButton.addEventListener('click', () => {
        if (playingCol >= 0) {
          stop();
          return;
        }
        window.__hmSynth.unlock();
        playingCol = 0;
        playButton.textContent = 'Stop';
        step();
      });

      tempoSlider.addEventListener('input', () => {
        tempoOutput.textContent = `${tempoSlider.value} bpm`;
      });
    })();
  </script>
</div>

## Keeping it polite

A few small things keep the instrument from being annoying rather than fun:

- **Voice stealing.** At most 12 notes ring at once (`MAX_VOICES`); past that, the oldest one fades out early instead of a 13th note piling on top and distorting the mix.
- **Fade, don't cut.** Stopping a voice early still runs it through `setTargetAtTime(0, now, 0.01)` first — a fast fade, not an instant stop, so stealing a voice never clicks either.
- **Tab away, sound off.** A `visibilitychange` listener stops playback the moment the tab isn't visible, so a forgotten background tab doesn't keep playing a year of chimes at whoever's in the room.
- **Settings stick.** Preset, mood, tempo, and the sound toggle are saved to `localStorage` under one key, read back with fallbacks for anything missing or out of range, so a corrupted or half-written value can't crash the page on the next visit.

> **Why this matters more than it looks:** every one of these is cheap to add and easy to skip under deadline. None of them show up in a screenshot. All four are the difference between "neat toy" and "thing I'd actually leave on while I work."

## The result

Here's all of it together: the grid from the real heatmap, hover-to-play, the sequencer, presets, moods, and the reverb send — wired to the same small engine as every demo above.

<div class="synth-demo not-prose my-8 p-4 md:p-6 bg-[var(--paper)] border border-[var(--rule)] rounded">
  <div class="flex items-center justify-between flex-wrap gap-3 mb-3">
    <span class="synth-demo-label">Full demo &middot; hover, drag, or press play</span>
    <a href="https://risanb.com/" target="_blank" rel="noopener noreferrer" class="synth-demo-btn">See it on the homepage ↗</a>
  </div>

  <div class="synth-demo-grid overflow-x-auto relative mb-3">
    <svg id="demo-final-grid" viewBox="0 0 220 80" width="100%" style="max-width: 480px; height: auto;">
      <rect id="demo-final-playhead" class="synth-demo-playhead" x="4" y="2" width="10" height="76" rx="3"></rect>
    </svg>
  </div>

  <div class="flex flex-wrap items-center gap-4">
    <button type="button" class="synth-demo-btn" id="demo-final-play">Play</button>
    <fieldset class="flex flex-wrap gap-2" id="demo-final-preset">
      <label class="synth-demo-chip"><input type="radio" name="demo-final-preset" value="chimes" checked /><span>Chimes</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo-final-preset" value="bit" /><span>8-Bit</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo-final-preset" value="pad" /><span>Pad</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo-final-preset" value="cosmic" /><span>Cosmic</span></label>
    </fieldset>
    <fieldset class="flex flex-wrap gap-2" id="demo-final-mood">
      <label class="synth-demo-chip"><input type="radio" name="demo-final-mood" value="bright" checked /><span>Bright</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo-final-mood" value="moody" /><span>Moody</span></label>
      <label class="synth-demo-chip"><input type="radio" name="demo-final-mood" value="mystic" /><span>Mystic</span></label>
    </fieldset>
  </div>

  <script>
    (function () {
      const LEVELS = [
        [0,1,0,0,1,0,0],[1,2,1,0,1,1,0],[0,1,2,1,0,2,1],[2,3,2,1,2,1,0],
        [1,2,3,2,1,0,1],[0,1,2,4,2,1,0],[1,0,1,2,3,2,1],[2,1,0,1,2,3,2],
        [3,2,1,0,1,2,1],[1,3,2,1,0,1,2],[0,2,4,3,1,0,1],[1,1,2,2,3,2,1],
        [2,2,1,1,2,4,2],[1,0,1,2,1,3,1],[0,1,1,0,2,2,1],[1,2,1,1,1,1,0],
      ];
      const VOICES = {
        chimes: { wave: 'sine', wave2: 'sine', ratio2: 3, gain2: 0.16, detune: 3, cutoff: 5000, decay: 0.35, sustain: 0, space: 0.5 },
        bit: { wave: 'square', wave2: 'square', ratio2: 1, gain2: 0, detune: 0, cutoff: 2600, decay: 0.05, sustain: 0.3, space: 0.08 },
        pad: { wave: 'sawtooth', wave2: 'sawtooth', ratio2: 1, gain2: 1, detune: 8, cutoff: 1200, decay: 0.25, sustain: 0.7, space: 0.75 },
        cosmic: { wave: 'triangle', wave2: 'sawtooth', ratio2: 1, gain2: 0.45, detune: 6, cutoff: 700, decay: 0.28, sustain: 0, space: 0.8 },
      };
      const SCALES = { bright: [0, 2, 4, 7, 9], moody: [0, 3, 5, 7, 10], mystic: [0, 2, 3, 7, 8] };
      const ROOT_MIDI = 48, FIRST_SCALE_STEP = 5, CHORD_SHIFTS = [0, 2, -1, 1];
      const STEP = 13, SIZE = 10, STRUM_SECONDS = 0.022, MIN_RETRIGGER_MS = 120;
      const SVG_NS = 'http://www.w3.org/2000/svg';

      function noteFrequency(mood, weekday, chord) {
        const scale = SCALES[mood];
        const step = FIRST_SCALE_STEP + (6 - weekday) + CHORD_SHIFTS[chord];
        const octave = Math.floor(step / scale.length);
        const midi = ROOT_MIDI + 12 * octave + scale[step - octave * scale.length];
        return 440 * Math.pow(2, (midi - 69) / 12);
      }

      const svg = document.getElementById('demo-final-grid');
      const playhead = document.getElementById('demo-final-playhead');
      const playButton = document.getElementById('demo-final-play');
      const presetFields = document.getElementById('demo-final-preset');
      const moodFields = document.getElementById('demo-final-mood');
      const checkedValue = (fieldset) => fieldset.querySelector('input:checked').value;
      const lastHoverAt = new WeakMap();

      LEVELS.forEach((column, col) => {
        column.forEach((level, row) => {
          const rect = document.createElementNS(SVG_NS, 'rect');
          rect.setAttribute('x', String(4 + col * STEP));
          rect.setAttribute('y', String(4 + row * STEP));
          rect.setAttribute('width', String(SIZE));
          rect.setAttribute('height', String(SIZE));
          rect.setAttribute('rx', '2');
          rect.setAttribute('class', `cell cell-${level}`);
          rect.dataset.weekday = String(row);
          rect.dataset.chord = String(col % 4);
          rect.dataset.level = String(level);
          svg.appendChild(rect);
        });
      });
      svg.appendChild(playhead);

      function currentVoice() {
        return VOICES[checkedValue(presetFields)];
      }

      function playNote(weekday, chord, level) {
        const voice = currentVoice();
        const mood = checkedValue(moodFields);
        window.__hmSynth.setSpace(voice.space);
        window.__hmSynth.play(noteFrequency(mood, weekday, chord), {
          ...voice, velocity: level / 4, duration: 1.2,
        });
      }

      function trigger(target, timeStamp) {
        if (!(target instanceof Element) || !target.classList.contains('cell')) return;
        const level = Number(target.dataset.level);
        const sinceLast = timeStamp - (lastHoverAt.get(target) ?? -Infinity);
        if (level === 0 || sinceLast < MIN_RETRIGGER_MS) return;

        lastHoverAt.set(target, timeStamp);
        playNote(Number(target.dataset.weekday), Number(target.dataset.chord), level);
      }

      svg.addEventListener('pointerdown', (event) => {
        event.target.releasePointerCapture?.(event.pointerId);
        trigger(event.target, event.timeStamp);
      });
      svg.addEventListener('pointerover', (event) => trigger(event.target, event.timeStamp));

      let playingCol = -1;
      let timer = 0;

      function playColumn(col) {
        const lit = LEVELS[col]
          .map((level, row) => ({ row, level }))
          .filter((note) => note.level > 0)
          .sort((a, b) => b.row - a.row);

        lit.forEach((note, index) => {
          setTimeout(() => playNote(note.row, col % 4, note.level), index * STRUM_SECONDS * 1000);
        });
      }

      function step() {
        if (playingCol >= LEVELS.length) {
          stop();
          return;
        }
        playColumn(playingCol);
        playhead.setAttribute('x', String(4 + playingCol * STEP));
        playingCol++;
        timer = setTimeout(step, 30000 / 110);
      }

      function stop() {
        clearTimeout(timer);
        playingCol = -1;
        playButton.textContent = 'Play';
      }

      playButton.addEventListener('click', () => {
        if (playingCol >= 0) {
          stop();
          return;
        }
        window.__hmSynth.unlock();
        playingCol = 0;
        playButton.textContent = 'Stop';
        step();
      });
    })();
  </script>
</div>

Same idea as the heatmap itself: none of this needed a framework or an audio library. A dozen Web Audio nodes, a scale, and a few `data-*` attributes already sitting on the grid were enough to turn a wall of green squares into something you'd actually want to poke at.
