import { computeHeatmapStats, formatNumber } from '../../lib/heatmap-stats';
import type { HeatmapContext } from './index';

export type Phase = 'idle' | 'running' | 'paused' | 'over';
type OverlayState = Exclude<Phase, 'running'>;

export interface TouchMove {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface Board {
  cols: number;
  /** Indexed by `col * ROWS + row`. Missing days of the first and last week are undefined. */
  cells: (SVGElement | undefined)[];
  svg: SVGSVGElement;
  layer: SVGGElement;
  litCount: number;
}

export interface Game {
  id: string;
  toggle: HTMLButtonElement;
  bestKey: () => string;
  winTitle: string;
  scoreVerb: string;
  instructions: { pointer: string; touch: string };
  /** Called while the game is switched on, before and after its runs. */
  enter?: () => void;
  leave?: () => void;
  /** Builds a fresh run from the board, which is already restored. */
  prepare: () => void;
  run: () => void;
  halt: () => void;
  /** Clears everything the game drew or kept. */
  reset: () => void;
  /** Space, Enter or a tap while running. */
  activate: () => void;
  /** Steering keys while running. Returns true when the key was used. */
  onKey: (event: KeyboardEvent) => boolean;
  touch: { start?: (x: number, y: number) => void; move: (move: TouchMove) => void };
}

export const ROWS = 7;
export const LEVEL_BEEP_FREQUENCIES = [0, 880, 988, 1175, 1319];
export const BEEP_SECONDS = 0.055;

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const START_BEEPS = [660, 880];
const GAME_OVER_BEEPS = [660, 440, 330];
const GAME_OVER_BUZZ = 110;
const CELEBRATION_BEEPS = [523, 659, 784, 1047];
const OVERLAY_LABELS: Record<OverlayState, string> = { idle: 'Start', paused: 'Resume', over: 'Play again' };
const TAP_SLOP = 10;
const TAP_MS = 300;

export const cellIndex = (col: number, row: number) => col * ROWS + row;

export function svgElement<Tag extends keyof SVGElementTagNameMap>(tag: Tag, className: string, parent: Element) {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  element.setAttribute('class', className);
  parent.append(element);

  return element;
}

export function createGameShell({ card, scroller, mobileQuery, reducedMotionQuery, engine }: HeatmapContext, { closeSynth, toggleSound }: { closeSynth: () => void; toggleSound: () => void }) {
  const overlay = card.querySelector<HTMLElement>('.game-overlay')!;
  const overlayTitle = overlay.querySelector<HTMLElement>('[data-game="title"]')!;
  const overlaySummary = overlay.querySelector<HTMLElement>('[data-game="summary"]')!;
  const primaryButton = overlay.querySelector<HTMLButtonElement>('[data-action="game-primary"]')!;
  const primaryLabel = overlay.querySelector<HTMLElement>('[data-game="primary-label"]')!;
  const pointerInstruction = overlay.querySelector<HTMLElement>('.game-instruction--pointer')!;
  const touchInstruction = overlay.querySelector<HTMLElement>('.game-instruction--touch')!;
  const announcer = card.querySelector<HTMLElement>('[data-game="announcer"]')!;
  const hudSoundButton = card.querySelector<HTMLButtonElement>('.game-hud [data-action="sound"]')!;
  const pauseButton = card.querySelector<HTMLButtonElement>('[data-game="pause"]')!;
  const scoreOutput = card.querySelector<HTMLElement>('[data-game="score"]')!;
  const bestOutput = card.querySelector<HTMLElement>('[data-game="best"]')!;

  const section = card.closest<HTMLElement>('.github-activity')!;
  const eyebrow = section.querySelector<HTMLElement>('.eyebrow')!;
  const eyebrowText = eyebrow.textContent!;
  const statValues = [...section.querySelectorAll<HTMLElement>('[data-stat]')];
  const statDetails = [...section.querySelectorAll<HTMLElement>('[data-stat-detail]')];
  const allTimeBase = Number(section.querySelector<HTMLElement>('.stats-grid')!.dataset.allTime);
  const yearDays = [...card.querySelectorAll<SVGElement>('.heatmap-svg--desktop .gh-cell')].map((cell) => ({
    date: cell.dataset.date!,
    count: Number(cell.dataset.count),
  }));

  const remaining = new Map<string, number>();
  const originals = new Map<SVGElement, { className: string; level: string }>();
  let active: Game | null = null;
  let phase: Phase = 'idle';
  let score = 0;
  let best = 0;
  let bestAtStart = 0;
  let overTimer = 0;
  let touchPad: HTMLElement | null = null;
  let activationInput = 'keyboard';

  resetRemaining();

  function resetRemaining() {
    for (const day of yearDays) {
      remaining.set(day.date, day.count);
    }
  }

  function loadBest() {
    try {
      const saved = Number(localStorage.getItem(active!.bestKey()));

      return Number.isFinite(saved) ? saved : 0;
    } catch {
      return 0;
    }
  }

  function saveBest() {
    try {
      localStorage.setItem(active!.bestKey(), String(best));
    } catch {
      // Storage can be blocked; the best score then lasts for the page only.
    }
  }

  function register(game: Game) {
    game.toggle.addEventListener('click', () => setActive(active === game ? null : game));
  }

  function setActive(next: Game | null) {
    if (next === active) {
      return;
    }

    if (active) {
      restoreBoard();
      active.leave?.();
      active.toggle.setAttribute('aria-pressed', 'false');
      active = null;
      card.classList.remove('is-game-on');
      delete card.dataset.activeGame;
      hideOverlay();
    }

    if (!next) {
      return;
    }

    closeSynth();
    engine.unlock();
    active = next;
    active.toggle.setAttribute('aria-pressed', 'true');
    card.classList.add('is-game-on');
    card.dataset.activeGame = next.id;
    pointerInstruction.textContent = next.instructions.pointer;
    touchInstruction.textContent = next.instructions.touch;
    active.enter?.();
    best = loadBest();
    renderScore();
    showOverlay('idle');
    primaryButton.focus();
  }

  function setPhase(next: Phase, inputType = 'keyboard') {
    phase = next;
    card.classList.toggle('is-game-running', next === 'running');
    touchPad?.remove();
    touchPad = null;

    if (next === 'running' && inputType !== 'mouse' && inputType !== 'keyboard') {
      touchPad = createTouchPad();
      document.body.append(touchPad);
    }
  }

  function showOverlay(state: OverlayState, title = '', summary = '') {
    overlay.dataset.state = state;
    overlayTitle.textContent = title;
    overlaySummary.textContent = summary;
    primaryLabel.textContent = OVERLAY_LABELS[state];
    overlay.hidden = false;
    announcer.textContent = [title, summary].filter(Boolean).join('. ');
  }

  function hideOverlay() {
    overlay.hidden = true;
    announcer.textContent = '';
  }

  function renderScore() {
    scoreOutput.textContent = formatNumber(score);
    bestOutput.textContent = formatNumber(best);
  }

  function playBeeps(frequencies: number[], seconds: number, intervalSeconds: number) {
    const now = engine.time;

    frequencies.forEach((frequency, index) => engine.beep(frequency, seconds, now + index * intervalSeconds));
  }

  function currentStats() {
    const { values, details } = computeHeatmapStats(yearDays.map((day) => ({ date: day.date, count: remaining.get(day.date)! })));

    return { values: { ...values, all: allTimeBase - score }, details };
  }

  let shownValues = currentStats().values;

  // Hits land faster than a float fades, so each stat keeps one float and sums the drops it shows.
  const floats = new Map<HTMLElement, { element: HTMLElement; total: number; animation: Animation }>();

  function flashDrop(stat: HTMLElement, drop: number) {
    if (reducedMotionQuery.matches) {
      return;
    }

    stat.animate([{ color: 'var(--accent)' }, {}], { duration: 500 });

    // The heading number has running text on its right, so it only flashes.
    if (stat.dataset.stat === 'total') {
      return;
    }

    const current = floats.get(stat);
    current?.animation.cancel();

    const element = current?.element ?? stat.appendChild(document.createElement('span'));
    const total = (current?.total ?? 0) + drop;
    element.className = 'stat-float';
    element.textContent = `−${formatNumber(total)}`;

    const animation = element.animate(
      [
        { opacity: 1, transform: 'translateY(0)', offset: 0 },
        { opacity: 1, transform: 'translateY(-4px)', offset: 0.5 },
        { opacity: 0, transform: 'translateY(-12px)' },
      ],
      { duration: 1100, easing: 'ease-out', fill: 'forwards' },
    );
    floats.set(stat, { element, total, animation });
    animation.finished
      .then(() => {
        element.remove();
        floats.delete(stat);
      })
      .catch(() => {});
  }

  function renderStats() {
    const { values, details } = currentStats();

    for (const stat of statValues) {
      const key = stat.dataset.stat as keyof typeof values;
      const drop = shownValues[key] - values[key];
      stat.querySelector('.stat-number')!.textContent = formatNumber(values[key]);

      if (drop > 0) {
        flashDrop(stat, drop);
      }
    }

    for (const detail of statDetails) {
      detail.textContent = details[detail.dataset.statDetail as keyof typeof details];
    }

    shownValues = values;
  }

  function readBoard(): Board {
    const svg = card.querySelector<SVGSVGElement>(mobileQuery.matches ? '.heatmap-svg--mobile' : '.heatmap-svg--desktop')!;
    const firstWeek = Number(svg.dataset.firstWeek);
    const cells: Board['cells'] = [];
    let cols = 0;
    let litCount = 0;

    for (const cell of svg.querySelectorAll<SVGElement>('.gh-cell')) {
      const col = Number(cell.dataset.week) - firstWeek;
      cells[cellIndex(col, Number(cell.dataset.day))] = cell;
      cols = Math.max(cols, col + 1);

      if (Number(cell.dataset.level) > 0) {
        litCount++;
      }
    }

    return { cols, cells, svg, layer: svg.querySelector<SVGGElement>('.game-layer')!, litCount };
  }

  /** The first change to a cell is remembered, so restoring never depends on what the game did in between. */
  function setCellLevel(cell: SVGElement, level: number) {
    if (!originals.has(cell)) {
      originals.set(cell, { className: cell.getAttribute('class')!, level: cell.dataset.level! });
    }

    cell.setAttribute('class', `gh-cell gh-cell-${level}`);
    cell.dataset.level = String(level);
  }

  function remainingCount(date: string) {
    return remaining.get(date)!;
  }

  function removeContributions(date: string, amount: number) {
    remaining.set(date, remaining.get(date)! - amount);
    score += amount;

    if (score > best) {
      best = score;
      saveBest();
    }

    renderScore();
    renderStats();
  }

  function start(inputType: string) {
    restoreBoard();
    engine.unlock();
    bestAtStart = best;
    active!.prepare();
    eyebrow.textContent = 'Scoreboard';

    if (inputType !== 'mouse' && inputType !== 'keyboard') {
      card.scrollIntoView({ block: 'center', behavior: reducedMotionQuery.matches ? 'instant' : 'smooth' });
    }

    setPhase('running', inputType);
    scroller.focus({ preventScroll: true });
    hideOverlay();
    playBeeps(START_BEEPS, 0.06, 0.08);
    active!.run();
  }

  function pause() {
    if (phase !== 'running') {
      return;
    }

    active!.halt();
    setPhase('paused');
    showOverlay('paused', 'Paused');

    // Focus on the heatmap keeps Space working as resume, without a focused button also clicking on key-up.
    scroller.focus({ preventScroll: true });
  }

  function resume(inputType: string) {
    setPhase('running', inputType);
    scroller.focus({ preventScroll: true });
    hideOverlay();
    active!.run();
  }

  function activate(inputType: string) {
    if (phase === 'running') {
      active!.activate();
    } else if (phase === 'paused') {
      resume(inputType);
    } else {
      start(inputType);
    }
  }

  function finish(won: boolean, delayMs = 0) {
    active!.halt();
    setPhase('over');

    const isNewBest = score > bestAtStart;
    const noun = score === 1 ? 'contribution' : 'contributions';
    const summary = `You ${active!.scoreVerb} ${formatNumber(score)} ${noun}.${isNewBest ? ' New best!' : ''}`;
    const title = won ? active!.winTitle : 'GAME OVER';

    if (won || isNewBest) {
      playBeeps(CELEBRATION_BEEPS, 0.07, 0.09);
    } else {
      playBeeps(GAME_OVER_BEEPS, 0.12, 0.14);
      engine.beep(GAME_OVER_BUZZ, 0.25, engine.time + GAME_OVER_BEEPS.length * 0.14);
    }

    const showResult = () => {
      card.classList.add('is-game-over');
      showOverlay('over', title, summary);
      primaryButton.focus();
    };

    if (delayMs > 0) {
      overTimer = window.setTimeout(showResult, delayMs);
    } else {
      showResult();
    }
  }

  function restoreBoard() {
    clearTimeout(overTimer);
    engine.stopAll();
    active?.halt();

    for (const { element, animation } of floats.values()) {
      animation.cancel();
      element.remove();
    }

    floats.clear();

    for (const [cell, { className, level }] of originals) {
      cell.setAttribute('class', className);
      cell.dataset.level = level;
    }

    originals.clear();
    active?.reset();
    resetRemaining();
    score = 0;
    renderStats();
    renderScore();
    eyebrow.textContent = eyebrowText;
    card.classList.remove('is-game-over');
    setPhase('idle');

    if (active) {
      showOverlay('idle');
    } else {
      hideOverlay();
    }
  }

  function createTouchPad() {
    const pad = document.createElement('div');
    let gesture: { pointerId: number; startX: number; startY: number; lastX: number; lastY: number; startedAt: number; isDrag: boolean } | null = null;
    let tapped = false;

    pad.className = 'game-touch-pad';
    pad.setAttribute('aria-hidden', 'true');

    pad.addEventListener('pointerdown', (event) => {
      if (gesture) {
        return;
      }

      gesture = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, startedAt: event.timeStamp, isDrag: false };
      tapped = false;
      active!.touch.start?.(event.clientX, event.clientY);
    });

    pad.addEventListener('pointermove', (event) => {
      if (!gesture || event.pointerId !== gesture.pointerId) {
        return;
      }

      const dx = event.clientX - gesture.lastX;
      const dy = event.clientY - gesture.lastY;

      gesture.isDrag ||= Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > TAP_SLOP;
      gesture.lastX = event.clientX;
      gesture.lastY = event.clientY;
      active!.touch.move({ x: event.clientX, y: event.clientY, dx, dy });
    });

    pad.addEventListener('pointerup', (event) => {
      if (!gesture || event.pointerId !== gesture.pointerId) {
        return;
      }

      tapped = !gesture.isDrag && event.timeStamp - gesture.startedAt < TAP_MS;
      gesture = null;
    });

    pad.addEventListener('pointercancel', (event) => {
      if (gesture && event.pointerId === gesture.pointerId) {
        gesture = null;
        tapped = false;
      }
    });

    // The pointer is released after a tap's pointerup too, so only the gesture is dropped, never the pending tap.
    pad.addEventListener('lostpointercapture', (event) => {
      if (gesture && event.pointerId === gesture.pointerId) {
        gesture = null;
      }
    });

    // The tap acts on the click that follows it, so the pad is still there to swallow that click.
    pad.addEventListener('click', () => {
      if (tapped) {
        tapped = false;
        active!.activate();
      }
    });

    pad.addEventListener('contextmenu', (event) => event.preventDefault());

    return pad;
  }

  // The primary button can be pressed by a finger, a mouse or the keyboard; only a finger or pen earns a touch pad.
  primaryButton.addEventListener('pointerdown', (event) => {
    activationInput = event.pointerType;
  });

  primaryButton.addEventListener('click', () => {
    const inputType = activationInput;
    activationInput = 'keyboard';
    activate(inputType);
  });

  hudSoundButton.addEventListener('click', toggleSound);
  pauseButton.addEventListener('click', pause);

  document.addEventListener('keydown', (event) => {
    const target = event.target instanceof Element ? event.target : document.body;
    const isTyping = target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

    if (!active || event.defaultPrevented || isTyping || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (phase === 'running' && active.onKey(event)) {
      event.preventDefault();

      return;
    }

    // A focused button or link handles Space and Enter itself, so it must not also toggle the game.
    // Outside a running game, Space keeps scrolling the page unless focus is on the heatmap.
    const isControl = (event.key === ' ' || event.key === 'Enter') && !target.closest('button, a');

    if (isControl && (phase === 'running' || card.contains(target))) {
      event.preventDefault();

      if (!event.repeat) {
        activate('keyboard');
      }
    }
  });

  mobileQuery.addEventListener('change', () => {
    if (active) {
      restoreBoard();
      best = loadBest();
      renderScore();
    }
  });

  return {
    register,
    close: () => setActive(null),
    pause,
    getActive: () => active,
    isRunning: () => phase === 'running',
    readBoard,
    setCellLevel,
    remainingCount,
    removeContributions,
    finish,
    playBeeps,
  };
}

export type GameShell = ReturnType<typeof createGameShell>;
