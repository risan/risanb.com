import { initSnake } from './snake';
import { loadSettings, SoundEngine, type Settings } from './sound-engine';
import { initSynth } from './synth';

export interface HeatmapContext {
  card: HTMLElement;
  scroller: HTMLElement;
  columnStep: number;
  mobileQuery: MediaQueryList;
  reducedMotionQuery: MediaQueryList;
  settings: Settings;
  engine: SoundEngine;
}

export function initHeatmap(card: HTMLElement) {
  const settings = loadSettings();
  const context: HeatmapContext = {
    card,
    scroller: card.querySelector<HTMLElement>('.heatmap-scroll')!,
    columnStep: Number(card.dataset.step),
    mobileQuery: matchMedia('(max-width: 680px)'),
    reducedMotionQuery: matchMedia('(prefers-reduced-motion: reduce)'),
    settings,
    engine: new SoundEngine(settings),
  };

  context.scroller.scrollLeft = context.scroller.scrollWidth;

  const synth = initSynth(context, () => snake.setMode(false));
  const snake = initSnake(context, { closeSynth: () => synth.setOpen(false), toggleSound: synth.toggleSound });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    for (const { scope, toggle, isOpen, setOpen } of [
      { scope: synth.panel, toggle: synth.toggle, isOpen: synth.isOpen, setOpen: synth.setOpen },
      { scope: card, toggle: snake.toggle, isOpen: snake.isOn, setOpen: snake.setMode },
    ]) {
      if (isOpen()) {
        const focusWasInside = scope.contains(document.activeElement);

        setOpen(false);

        if (focusWasInside) {
          toggle.focus();
        }
      }
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      synth.stop();
      snake.pause();
    }
  });
}
