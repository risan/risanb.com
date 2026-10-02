import type { HeatmapContext } from './index';
import { noteFrequency, saveSettings, VOICES } from './sound-engine';

const MIN_RETRIGGER_MS = 120;
const STRUM_SECONDS = 0.022;

interface ColumnNote {
  weekday: number;
  level: number;
  chord: number;
}

export function initSynth({ card, scroller, columnStep, mobileQuery, reducedMotionQuery, engine, settings }: HeatmapContext, closeGame: () => void) {
  const synthPanel = card.querySelector<HTMLElement>('#synth-panel')!;
  const synthToggle = card.querySelector<HTMLButtonElement>('#synth-toggle')!;
  const playButton = synthPanel.querySelector<HTMLButtonElement>('[data-action="play"]')!;
  const soundButtons = [...card.querySelectorAll<HTMLButtonElement>('[data-action="sound"]')];
  const progress = synthPanel.querySelector<HTMLElement>('[data-progress]')!;
  const playheads = [...card.querySelectorAll<SVGElement>('.playhead')];
  const radios = [...synthPanel.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const sliders = [...synthPanel.querySelectorAll<HTMLInputElement>('input[type="range"]')];

  const mobileFirstWeek = Number(card.dataset.mobileFirstWeek);
  const lastHoverAt = new WeakMap<Element, number>();
  let columns: ColumnNote[][] = [];
  let playTimer = 0;
  let playingWeek = -1;

  const isSynthOpen = () => !synthPanel.hidden;
  const isPlaying = () => playingWeek >= 0;

  function renderSettings() {
    for (const radio of radios) {
      radio.checked = settings[radio.name as 'preset' | 'mood'] === radio.value;
    }

    for (const slider of sliders) {
      const name = slider.name as 'tempo' | 'space';
      const output = synthPanel.querySelector(`[data-output="${name}"]`)!;
      slider.value = String(settings[name]);
      output.textContent = name === 'tempo' ? `${settings.tempo} bpm` : `${Math.round(settings.space * 100)}%`;
    }

    for (const soundButton of soundButtons) {
      soundButton.setAttribute('aria-pressed', String(settings.sound));

      const label = soundButton.querySelector('[data-sound-label]');

      if (label) {
        label.textContent = settings.sound ? 'Sound on' : 'Sound off';
      }
    }
  }

  function setSynthOpen(open: boolean) {
    synthPanel.hidden = !open;
    card.classList.toggle('is-synth-open', open);
    synthToggle.setAttribute('aria-expanded', String(open));

    if (open) {
      closeGame();
      engine.unlock();
    } else {
      stop();
    }
  }

  function triggerCell(cell: SVGElement, timeStamp: number) {
    const level = Number(cell.dataset.level);
    const sinceLast = timeStamp - (lastHoverAt.get(cell) ?? -Infinity);

    if (!settings.sound || level === 0 || sinceLast < MIN_RETRIGGER_MS) {
      return;
    }

    lastHoverAt.set(cell, timeStamp);
    engine.play(noteFrequency(settings.mood, Number(cell.dataset.day), Number(cell.dataset.chord)), level);
  }

  function cellOf(event: Event) {
    const target = event.target;

    return target instanceof SVGElement && target.classList.contains('gh-cell') ? target : null;
  }

  function readColumns() {
    const grouped: ColumnNote[][] = [];

    for (const cell of card.querySelectorAll<SVGElement>('.heatmap-svg--desktop .gh-cell')) {
      const { week, day, level, chord } = cell.dataset;
      (grouped[Number(week)] ??= []).push({ weekday: Number(day), level: Number(level), chord: Number(chord) });
    }

    return grouped;
  }

  function playColumn(notes: ColumnNote[]) {
    if (!settings.sound) {
      return;
    }

    const lit = notes.filter((note) => note.level > 0).sort((a, b) => b.weekday - a.weekday);
    const loudness = 1 / Math.sqrt(lit.length);
    const now = engine.time;

    lit.forEach((note, index) => {
      const frequency = noteFrequency(settings.mood, note.weekday, note.chord);
      engine.play(frequency, note.level, loudness, now + index * STRUM_SECONDS);
    });
  }

  function showPlayhead(week: number) {
    for (const playhead of playheads) {
      const firstWeek = Number(playhead.parentElement!.dataset.firstWeek);
      playhead.style.transform = `translateX(${(week - firstWeek) * columnStep}px)`;
    }
  }

  function scrollToWeek(week: number) {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;

    if (maxScroll > 0) {
      scroller.scrollLeft = (week / (columns.length - 1)) * maxScroll;
    }
  }

  function step() {
    if (playingWeek >= columns.length) {
      stop(false);

      return;
    }

    playColumn(columns[playingWeek] ?? []);
    progress.textContent = `Week ${playingWeek + 1} of ${columns.length}`;

    if (!reducedMotionQuery.matches) {
      showPlayhead(playingWeek);
      scrollToWeek(playingWeek);
    }

    playingWeek++;
    playTimer = window.setTimeout(step, 30000 / settings.tempo);
  }

  function start() {
    engine.unlock();

    if (!settings.sound) {
      settings.sound = true;
      saveSettings(settings);
      renderSettings();
    }

    columns = columns.length > 0 ? columns : readColumns();
    playingWeek = mobileQuery.matches ? mobileFirstWeek : 0;
    card.classList.add('is-playing');
    playButton.querySelector('[data-play-label]')!.textContent = 'Stop';
    playButton.setAttribute('aria-label', 'Stop playing');
    step();
  }

  function stop(cutSound = true) {
    if (!isPlaying()) {
      return;
    }

    clearTimeout(playTimer);
    playingWeek = -1;

    if (cutSound) {
      engine.stopAll();
    }

    card.classList.remove('is-playing');
    progress.textContent = '';
    playButton.querySelector('[data-play-label]')!.textContent = 'Play';
    playButton.setAttribute('aria-label', 'Play the year');
  }

  function toggleSound() {
    settings.sound = !settings.sound;
    saveSettings(settings);
    renderSettings();

    if (!settings.sound) {
      engine.stopAll();
    }
  }

  synthToggle.addEventListener('click', () => setSynthOpen(!isSynthOpen()));

  synthPanel.addEventListener('click', (event) => {
    const action = (event.target as Element).closest<HTMLElement>('[data-action]')?.dataset.action;

    if (action === 'close') {
      setSynthOpen(false);
      synthToggle.focus();
    } else if (action === 'play') {
      isPlaying() ? stop() : start();
    } else if (action === 'sound') {
      toggleSound();
    }
  });

  synthPanel.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;

    if (input.type === 'radio') {
      Object.assign(settings, { [input.name]: input.value });

      if (input.name === 'preset') {
        settings.space = VOICES[settings.preset].space;
        engine.applySpace();
      }
    } else {
      Object.assign(settings, { [input.name]: Number(input.value) });
      engine.applySpace();
    }

    saveSettings(settings);
    renderSettings();
  });

  // Touch implicitly captures the pointer to the cell it started on. Releasing it lets
  // pointerover fire on every cell the finger crosses, so one handler serves mouse and touch.
  scroller.addEventListener('pointerdown', (event) => {
    if (!isSynthOpen()) {
      return;
    }

    engine.unlock();
    (event.target as Element).releasePointerCapture?.(event.pointerId);

    const cell = cellOf(event);

    if (cell) {
      triggerCell(cell, event.timeStamp);
    }
  });

  scroller.addEventListener('pointerover', (event) => {
    const cell = isSynthOpen() ? cellOf(event) : null;

    if (cell) {
      triggerCell(cell, event.timeStamp);
    }
  });

  renderSettings();

  return { panel: synthPanel, toggle: synthToggle, isOpen: isSynthOpen, setOpen: setSynthOpen, toggleSound, stop };
}
