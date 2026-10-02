import { computeHeatmapStats, formatNumber } from '../../lib/heatmap-stats';
import type { HeatmapContext } from './index';

type Direction = 'up' | 'down' | 'left' | 'right';
type GameState = 'idle' | 'running' | 'paused' | 'over';
type OverlayState = Exclude<GameState, 'running'>;

interface Segment {
  col: number;
  row: number;
}

interface Lump extends Segment {
  elements: SVGCircleElement[];
}

interface Skin {
  outline: SVGPathElement;
  body: SVGPathElement;
  marks: SVGPathElement;
  tailOutline: SVGPathElement;
  tailBody: SVGPathElement;
  lumpOutlines: SVGGElement;
  lumpFills: SVGGElement;
  head: SVGGElement;
  jaw: SVGGElement;
}

interface Board {
  cols: number;
  /** Indexed by `col * ROWS + row`. Missing days of the first and last week are undefined. */
  cells: (SVGElement | undefined)[];
  svg: SVGSVGElement;
  layer: SVGGElement;
}

const SNAKE_BEST_KEY = 'heatmap-snake-best';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const ROWS = 7;
const START_LENGTH = 3;
const START_SPEED = 4.5;
const MAX_SPEED = 9.5;
const SPEED_PER_SEGMENT = 0.15;
const MAX_FRAME_MS = 250;
const MAX_QUEUED_TURNS = 2;
const METER_PER_SEGMENT = 4;
const SWIPE_DISTANCE = 24;
const BLINK_MS = 600;
const CHOMP_MS = 300;
const LUMP_RADIUS = 4.9;
const LUMP_MIN_LEVEL = 3;
const LUMP_OUTLINE = 0.9;
const EAT_BEEP_FREQUENCIES = [0, 880, 988, 1175, 1319];
const EAT_BEEP_SECONDS = 0.055;
const START_BEEPS = [660, 880];
const GAME_OVER_BEEPS = [660, 440, 330];
const GAME_OVER_BUZZ = 110;
const CELEBRATION_BEEPS = [523, 659, 784, 1047];
const OVERLAY_LABELS: Record<OverlayState, string> = { idle: 'Start', paused: 'Resume', over: 'Play again' };

const DIRECTIONS: Record<Direction, { dx: number; dy: number; angle: number; opposite: Direction }> = {
  up: { dx: 0, dy: -1, angle: -90, opposite: 'down' },
  down: { dx: 0, dy: 1, angle: 90, opposite: 'up' },
  left: { dx: -1, dy: 0, angle: 180, opposite: 'right' },
  right: { dx: 1, dy: 0, angle: 0, opposite: 'left' },
};

const KEY_DIRECTIONS: Record<string, Direction> = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
};

export function initSnake({ card, scroller, columnStep, mobileQuery, reducedMotionQuery, engine }: HeatmapContext, { closeSynth, toggleSound }: { closeSynth: () => void; toggleSound: () => void }) {
  const snakeToggle = card.querySelector<HTMLButtonElement>('#snake-toggle')!;
  const overlay = card.querySelector<HTMLElement>('.snake-overlay')!;
  const overlayTitle = overlay.querySelector<HTMLElement>('[data-snake="title"]')!;
  const overlaySummary = overlay.querySelector<HTMLElement>('[data-snake="summary"]')!;
  const primaryButton = overlay.querySelector<HTMLButtonElement>('[data-action="snake-primary"]')!;
  const primaryLabel = overlay.querySelector<HTMLElement>('[data-snake="primary-label"]')!;
  const announcer = card.querySelector<HTMLElement>('[data-snake="announcer"]')!;
  const hudSoundButton = card.querySelector<HTMLButtonElement>('.snake-hud [data-action="sound"]')!;
  const pauseButton = card.querySelector<HTMLButtonElement>('[data-snake="pause"]')!;
  const scoreOutput = card.querySelector<HTMLElement>('[data-snake="score"]')!;
  const bestOutput = card.querySelector<HTMLElement>('[data-snake="best"]')!;

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
  const snakeLayers = [...card.querySelectorAll<SVGGElement>('.snake-layer')];
  const cellSize = Number(card.dataset.cellSize);
  const xOffset = Number(card.dataset.xOffset);
  const yOffset = Number(card.dataset.yOffset);

  const eatenDates = new Set<string>();
  let eatenCells: { cell: SVGElement; level: number }[] = [];
  let gameState: GameState = 'idle';
  let board: Board;
  let skin: Skin;
  let body: Segment[] = [];
  let lumps: Lump[] = [];
  let occupied: boolean[] = [];
  let direction: Direction = 'right';
  let queuedTurns: Direction[] = [];
  let pendingGrowth = 0;
  let meter = 0;
  let score = 0;
  let best = loadBest();
  let bestAtStart = best;
  let remainingLit = 0;
  let frameId = 0;
  let overTimer = 0;
  let lastFrameAt = 0;
  let accumulator = 0;
  let swipeOrigin: { x: number; y: number } | null = null;

  const isSnakeOn = () => card.classList.contains('is-snake-on');
  const cellIndex = (col: number, row: number) => col * ROWS + row;
  const centerX = (col: number) => xOffset + col * columnStep + cellSize / 2;
  const centerY = (row: number) => yOffset + row * columnStep + cellSize / 2;
  const moveIntervalMs = () => 1000 / Math.min(MAX_SPEED, START_SPEED + (body.length - START_LENGTH) * SPEED_PER_SEGMENT);

  function loadBest() {
    try {
      const saved = Number(localStorage.getItem(SNAKE_BEST_KEY));

      return Number.isFinite(saved) ? saved : 0;
    } catch {
      return 0;
    }
  }

  function saveBest() {
    try {
      localStorage.setItem(SNAKE_BEST_KEY, String(best));
    } catch {
      // Storage can be blocked; the best score then lasts for the page only.
    }
  }

  function setSnakeMode(on: boolean) {
    if (on === isSnakeOn()) {
      return;
    }

    card.classList.toggle('is-snake-on', on);
    snakeToggle.setAttribute('aria-pressed', String(on));

    if (on) {
      closeSynth();
      engine.unlock();
      renderScore();
      showOverlay('idle');
      primaryButton.focus();
    } else {
      restoreBoard();
    }
  }

  function setGameState(next: GameState) {
    gameState = next;
    card.classList.toggle('is-snake-running', next === 'running');
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

  function playGameOverSound() {
    playBeeps(GAME_OVER_BEEPS, 0.12, 0.14);
    engine.beep(GAME_OVER_BUZZ, 0.25, engine.time + GAME_OVER_BEEPS.length * 0.14);
  }

  function currentStats() {
    const { values, details } = computeHeatmapStats(
      yearDays.map((day) => (eatenDates.has(day.date) ? { ...day, count: 0 } : day)),
    );

    return { values: { ...values, all: allTimeBase - score }, details };
  }

  let shownValues = currentStats().values;

  // Bites land faster than a float fades, so each stat keeps one float and sums the drops it shows.
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

    remainingLit = 0;

    for (const cell of svg.querySelectorAll<SVGElement>('.gh-cell')) {
      const col = Number(cell.dataset.week) - firstWeek;
      cells[cellIndex(col, Number(cell.dataset.day))] = cell;
      cols = Math.max(cols, col + 1);

      if (Number(cell.dataset.level) > 0) {
        remainingLit++;
      }
    }

    return { cols, cells, svg, layer: svg.querySelector<SVGGElement>('.snake-layer')! };
  }

  function svgElement<Tag extends keyof SVGElementTagNameMap>(tag: Tag, className: string, parent: Element) {
    const element = document.createElementNS(SVG_NAMESPACE, tag);
    element.setAttribute('class', className);
    parent.append(element);

    return element;
  }

  function createSkin(layer: SVGGElement): Skin {
    // Every outline sits below every fill, so shapes join without a seam.
    const outline = svgElement('path', 'snake-outline', layer);
    const tailOutline = svgElement('path', 'snake-tail-outline', layer);
    const lumpOutlines = svgElement('g', 'snake-lump-outlines', layer);
    const bodyPath = svgElement('path', 'snake-body', layer);
    const tailBody = svgElement('path', 'snake-tail-body', layer);
    const lumpFills = svgElement('g', 'snake-lump-fills', layer);
    const marks = svgElement('path', 'snake-marks', layer);
    const head = svgElement('g', 'snake-head', layer);
    const tongue = svgElement('path', 'snake-tongue', head);
    const jaw = svgElement('g', 'snake-jaw', head);
    const headShape = svgElement('ellipse', 'snake-head-shape', jaw);

    tongue.setAttribute('d', 'M7 0H11.6M11.6 0l2.2-1.7M11.6 0l2.2 1.7');
    headShape.setAttribute('cx', '1.5');
    headShape.setAttribute('rx', '6.8');
    headShape.setAttribute('ry', '5.6');

    for (const side of [-1, 1]) {
      const eye = svgElement('circle', 'snake-eye', jaw);
      eye.setAttribute('cx', '3');
      eye.setAttribute('cy', String(side * 3.2));
      eye.setAttribute('r', '1.8');

      const pupil = svgElement('circle', 'snake-pupil', jaw);
      pupil.setAttribute('cx', '3.7');
      pupil.setAttribute('cy', String(side * 3.2));
      pupil.setAttribute('r', '0.9');
    }

    return { outline, body: bodyPath, marks, tailOutline, tailBody, lumpOutlines, lumpFills, head, jaw };
  }

  /** A wrap-around starts a new subpath, so no line crosses the board. The `h0` lets a lone point draw a round dot. */
  function pathThrough(segments: Segment[]) {
    return segments
      .map((segment, index) => {
        const previous = segments[index - 1];
        const isNeighbour = previous && Math.abs(segment.col - previous.col) + Math.abs(segment.row - previous.row) === 1;

        return `${isNeighbour ? 'L' : 'M'}${centerX(segment.col)} ${centerY(segment.row)}${isNeighbour ? '' : 'h0'}`;
      })
      .join('');
  }

  function renderSnake() {
    const headToTail = [...body].reverse();
    const head = headToTail[0]!;
    const bodyPathData = pathThrough(headToTail.slice(0, -2));
    const tailPathData = pathThrough(body.slice(0, 3).reverse());

    // The markings are dashes along this same path, which starts at the head,
    // so they stay on the body as it moves instead of sliding over it.
    for (const path of [skin.outline, skin.body, skin.marks]) {
      path.setAttribute('d', bodyPathData);
    }

    for (const path of [skin.tailOutline, skin.tailBody]) {
      path.setAttribute('d', tailPathData);
    }

    skin.head.setAttribute('transform', `translate(${centerX(head.col)} ${centerY(head.row)}) rotate(${DIRECTIONS[direction].angle})`);
  }

  function addLump(col: number, row: number) {
    const elements = [skin.lumpOutlines, skin.lumpFills].map((group, index) => {
      const circle = svgElement('circle', 'snake-lump', group);
      circle.setAttribute('cx', String(centerX(col)));
      circle.setAttribute('cy', String(centerY(row)));
      circle.setAttribute('r', String(index === 0 ? LUMP_RADIUS + LUMP_OUTLINE : LUMP_RADIUS));

      return circle;
    });

    lumps.push({ col, row, elements });
  }

  // The swallowed food stays at its cell while the body slides through it, until the tail has passed.
  function removePassedLumps() {
    lumps = lumps.filter((lump) => {
      if (occupied[cellIndex(lump.col, lump.row)]) {
        return true;
      }

      lump.elements.forEach((element) => element.remove());

      return false;
    });
  }

  function chomp() {
    if (reducedMotionQuery.matches) {
      return;
    }

    const squash = { transform: 'scale(1.2, 0.8)' };
    skin.jaw.animate([{ transform: 'scale(1)' }, squash, { transform: 'scale(1)' }, squash, { transform: 'scale(1)' }], { duration: CHOMP_MS });
  }

  function startGame() {
    restoreBoard();
    engine.unlock();
    board = readBoard();
    skin = createSkin(board.layer);
    body = [];
    occupied = [];
    direction = 'right';
    queuedTurns = [];
    pendingGrowth = 0;
    meter = 0;
    bestAtStart = best;

    const headCol = Math.floor(board.cols / 2);
    const startRow = Math.floor(ROWS / 2);

    for (let i = START_LENGTH - 1; i >= 0; i--) {
      body.push({ col: headCol - i, row: startRow });
      occupied[cellIndex(headCol - i, startRow)] = true;
    }

    renderSnake();
    keepHeadInView();
    eyebrow.textContent = 'Scoreboard';
    setGameState('running');
    scroller.focus({ preventScroll: true });
    hideOverlay();
    playBeeps(START_BEEPS, 0.06, 0.08);
    resumeLoop();
  }

  function resumeLoop() {
    accumulator = 0;
    lastFrameAt = performance.now();
    frameId = requestAnimationFrame(frame);
  }

  function pauseGame() {
    if (gameState !== 'running') {
      return;
    }

    cancelAnimationFrame(frameId);
    setGameState('paused');
    showOverlay('paused', 'Paused');

    // Focus on the heatmap keeps Space working as resume, without a focused button also clicking on key-up.
    scroller.focus({ preventScroll: true });
  }

  function resumeGame() {
    setGameState('running');
    scroller.focus({ preventScroll: true });
    hideOverlay();
    resumeLoop();
  }

  function togglePrimary() {
    if (gameState === 'running') {
      pauseGame();
    } else if (gameState === 'paused') {
      resumeGame();
    } else {
      startGame();
    }
  }

  function frame(now: number) {
    accumulator += Math.min(now - lastFrameAt, MAX_FRAME_MS);
    lastFrameAt = now;

    while (gameState === 'running' && accumulator >= moveIntervalMs()) {
      accumulator -= moveIntervalMs();
      advance();
    }

    if (gameState === 'running') {
      frameId = requestAnimationFrame(frame);
    }
  }

  function advance() {
    if (queuedTurns.length > 0) {
      direction = queuedTurns.shift()!;
    }

    const { dx, dy } = DIRECTIONS[direction];
    const head = body.at(-1)!;
    const tail = body[0]!;
    const col = (head.col + dx + board.cols) % board.cols;
    const row = (head.row + dy + ROWS) % ROWS;
    const isGrowing = pendingGrowth > 0;
    const entersTailCell = !isGrowing && col === tail.col && row === tail.row;

    if (occupied[cellIndex(col, row)] && !entersTailCell) {
      endGame(false);

      return;
    }

    if (isGrowing) {
      pendingGrowth--;
    } else {
      body.shift();
      occupied[cellIndex(tail.col, tail.row)] = false;
      removePassedLumps();
    }

    body.push({ col, row });
    occupied[cellIndex(col, row)] = true;
    renderSnake();
    keepHeadInView();
    eatCell(col, row);
  }

  function keepHeadInView() {
    if (scroller.scrollWidth <= scroller.clientWidth) {
      return;
    }

    const { svg } = board;
    const svgBox = svg.getBoundingClientRect();
    const pixelsPerUnit = svgBox.width / svg.viewBox.baseVal.width;
    const headX = svgBox.left + centerX(body.at(-1)!.col) * pixelsPerUnit;
    const view = scroller.getBoundingClientRect();
    const margin = 2 * columnStep * pixelsPerUnit;

    if (headX < view.left + margin || headX > view.right - margin) {
      scroller.scrollLeft += headX - (view.left + view.width / 2);
    }
  }

  function eatCell(col: number, row: number) {
    const cell = board.cells[cellIndex(col, row)];
    const level = cell ? Number(cell.dataset.level) : 0;

    if (!cell || level === 0) {
      return;
    }

    eatenCells.push({ cell, level });
    eatenDates.add(cell.dataset.date!);
    cell.classList.replace(`gh-cell-${level}`, 'gh-cell-0');
    cell.classList.add('is-eaten');
    cell.dataset.level = '0';

    score += Number(cell.dataset.count);
    meter += level;
    pendingGrowth += Math.floor(meter / METER_PER_SEGMENT);
    meter %= METER_PER_SEGMENT;
    remainingLit--;

    if (score > best) {
      best = score;
      saveBest();
    }

    // Nearly every day is lit, so only the big meals bulge; a lump on every bite reads as beads.
    if (level >= LUMP_MIN_LEVEL) {
      addLump(col, row);
    }

    chomp();
    renderScore();
    renderStats();
    engine.beep(EAT_BEEP_FREQUENCIES[level]!, EAT_BEEP_SECONDS);

    if (remainingLit === 0) {
      endGame(true);
    }
  }

  function endGame(won: boolean) {
    cancelAnimationFrame(frameId);
    setGameState('over');

    const isNewBest = score > bestAtStart;
    const noun = score === 1 ? 'contribution' : 'contributions';
    const summary = `You ate ${formatNumber(score)} ${noun}.${isNewBest ? ' New best!' : ''}`;

    if (won || isNewBest) {
      playBeeps(CELEBRATION_BEEPS, 0.07, 0.09);
    } else {
      playGameOverSound();
    }

    const showResult = () => {
      board.layer.classList.remove('is-dying');
      card.classList.add('is-snake-over');
      showOverlay('over', won ? 'YOU ATE THE YEAR' : 'GAME OVER', summary);
      primaryButton.focus();
    };

    if (won || reducedMotionQuery.matches) {
      showResult();
    } else {
      board.layer.classList.add('is-dying');
      overTimer = window.setTimeout(showResult, BLINK_MS);
    }
  }

  function restoreBoard() {
    cancelAnimationFrame(frameId);
    clearTimeout(overTimer);
    engine.stopAll();

    for (const { element, animation } of floats.values()) {
      animation.cancel();
      element.remove();
    }

    floats.clear();

    for (const { cell, level } of eatenCells) {
      cell.setAttribute('class', `gh-cell gh-cell-${level}`);
      cell.dataset.level = String(level);
    }

    for (const layer of snakeLayers) {
      layer.classList.remove('is-dying');
      layer.replaceChildren();
    }

    eatenCells = [];
    eatenDates.clear();
    lumps = [];
    score = 0;
    renderStats();
    renderScore();
    eyebrow.textContent = eyebrowText;
    card.classList.remove('is-snake-over');
    setGameState('idle');

    if (isSnakeOn()) {
      showOverlay('idle');
    } else {
      hideOverlay();
    }
  }

  function queueTurn(next: Direction) {
    const previous = queuedTurns.at(-1) ?? direction;

    if (queuedTurns.length < MAX_QUEUED_TURNS && next !== previous && next !== DIRECTIONS[previous].opposite) {
      queuedTurns.push(next);
    }
  }

  snakeToggle.addEventListener('click', () => setSnakeMode(!isSnakeOn()));
  primaryButton.addEventListener('click', togglePrimary);
  hudSoundButton.addEventListener('click', toggleSound);
  pauseButton.addEventListener('click', pauseGame);

  document.addEventListener('keydown', (event) => {
    const target = event.target instanceof Element ? event.target : document.body;
    const isTyping = target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

    if (!isSnakeOn() || event.defaultPrevented || isTyping || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const turn = KEY_DIRECTIONS[event.key.toLowerCase()];

    if (turn && gameState === 'running') {
      event.preventDefault();
      queueTurn(turn);

      return;
    }

    // A focused button or link handles Space and Enter itself, so it must not also toggle the game.
    // Outside a running game, Space keeps scrolling the page unless focus is on the heatmap.
    const isControl = (event.key === ' ' || event.key === 'Enter') && !target.closest('button, a');

    if (isControl && (gameState === 'running' || card.contains(target))) {
      event.preventDefault();
      togglePrimary();
    }
  });

  scroller.addEventListener('pointerdown', (event) => {
    if (gameState === 'running' && event.pointerType !== 'mouse') {
      swipeOrigin = { x: event.clientX, y: event.clientY };
    }
  });

  scroller.addEventListener('pointermove', (event) => {
    if (!swipeOrigin) {
      return;
    }

    const dx = event.clientX - swipeOrigin.x;
    const dy = event.clientY - swipeOrigin.y;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_DISTANCE) {
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      queueTurn(dx > 0 ? 'right' : 'left');
    } else {
      queueTurn(dy > 0 ? 'down' : 'up');
    }

    swipeOrigin = { x: event.clientX, y: event.clientY };
  });

  for (const type of ['pointerup', 'pointercancel']) {
    scroller.addEventListener(type, () => {
      swipeOrigin = null;
    });
  }

  mobileQuery.addEventListener('change', () => {
    if (gameState !== 'idle') {
      restoreBoard();
    }
  });

  return { toggle: snakeToggle, isOn: isSnakeOn, setMode: setSnakeMode, pause: pauseGame };
}
