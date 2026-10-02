import { initBreakout } from './breakout';
import { createGameShell } from './game-shell';
import { initSnake } from './snake';
import { loadSettings, SoundEngine, type Settings } from './sound-engine';
import { initSynth } from './synth';

export interface HeatmapContext {
  card: HTMLElement;
  scroller: HTMLElement;
  columnStep: number;
  cellSize: number;
  xOffset: number;
  yOffset: number;
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
    cellSize: Number(card.dataset.cellSize),
    xOffset: Number(card.dataset.xOffset),
    yOffset: Number(card.dataset.yOffset),
    mobileQuery: matchMedia('(max-width: 680px)'),
    reducedMotionQuery: matchMedia('(prefers-reduced-motion: reduce)'),
    settings,
    engine: new SoundEngine(settings),
  };

  context.scroller.scrollLeft = context.scroller.scrollWidth;

  const shell = createGameShell(context, { closeSynth: () => synth.setOpen(false), toggleSound: () => synth.toggleSound() });
  const synth = initSynth(context, shell.close);

  initBreakout(context, shell);
  initSnake(context, shell);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (synth.isOpen()) {
      const focusWasInside = synth.panel.contains(document.activeElement);

      synth.setOpen(false);

      if (focusWasInside) {
        synth.toggle.focus();
      }
    }

    const game = shell.getActive();

    if (game) {
      const focusWasInside = card.contains(document.activeElement);

      shell.close();

      if (focusWasInside) {
        game.toggle.focus();
      }
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      synth.stop();
      shell.pause();
    }
  });
}
