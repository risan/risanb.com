import { BEEP_SECONDS, cellIndex, LEVEL_BEEP_FREQUENCIES, ROWS, svgElement, type Board, type GameShell } from './game-shell';
import type { HeatmapContext } from './index';

type Direction = 'up' | 'down' | 'left' | 'right';

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

const SNAKE_BEST_KEY = 'heatmap-snake-best';
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

export function initSnake({ card, scroller, columnStep, cellSize, xOffset, yOffset, reducedMotionQuery, engine }: HeatmapContext, shell: GameShell) {
  const snakeToggle = card.querySelector<HTMLButtonElement>('#snake-toggle')!;

  let board: Board;
  let skin: Skin;
  let body: Segment[] = [];
  let lumps: Lump[] = [];
  let occupied: boolean[] = [];
  let direction: Direction = 'right';
  let queuedTurns: Direction[] = [];
  let pendingGrowth = 0;
  let meter = 0;
  let remainingLit = 0;
  let frameId = 0;
  let lastFrameAt = 0;
  let accumulator = 0;
  let swipeOrigin: { x: number; y: number } | null = null;
  let swipePointerId: number | null = null;

  const centerX = (col: number) => xOffset + col * columnStep + cellSize / 2;
  const centerY = (row: number) => yOffset + row * columnStep + cellSize / 2;
  const moveIntervalMs = () => 1000 / Math.min(MAX_SPEED, START_SPEED + (body.length - START_LENGTH) * SPEED_PER_SEGMENT);

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

  function prepare() {
    board = shell.readBoard();
    remainingLit = board.litCount;
    skin = createSkin(board.layer);
    body = [];
    occupied = [];
    direction = 'right';
    queuedTurns = [];
    pendingGrowth = 0;
    meter = 0;

    const headCol = Math.floor(board.cols / 2);
    const startRow = Math.floor(ROWS / 2);

    for (let i = START_LENGTH - 1; i >= 0; i--) {
      body.push({ col: headCol - i, row: startRow });
      occupied[cellIndex(headCol - i, startRow)] = true;
    }

    renderSnake();
    keepHeadInView();
  }

  function run() {
    accumulator = 0;
    lastFrameAt = performance.now();
    frameId = requestAnimationFrame(frame);
  }

  function halt() {
    cancelAnimationFrame(frameId);
    clearSwipe();
  }

  function clearSwipe() {
    swipeOrigin = null;
    swipePointerId = null;
  }

  function frame(now: number) {
    accumulator += Math.min(now - lastFrameAt, MAX_FRAME_MS);
    lastFrameAt = now;

    while (shell.isRunning() && accumulator >= moveIntervalMs()) {
      accumulator -= moveIntervalMs();
      advance();
    }

    if (shell.isRunning()) {
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

    const count = shell.remainingCount(cell.dataset.date!);

    shell.setCellLevel(cell, 0);
    cell.classList.add('is-eaten');
    meter += level;
    pendingGrowth += Math.floor(meter / METER_PER_SEGMENT);
    meter %= METER_PER_SEGMENT;
    remainingLit--;

    // Nearly every day is lit, so only the big meals bulge; a lump on every bite reads as beads.
    if (level >= LUMP_MIN_LEVEL) {
      addLump(col, row);
    }

    chomp();
    shell.removeContributions(cell.dataset.date!, count);
    engine.beep(LEVEL_BEEP_FREQUENCIES[level]!, BEEP_SECONDS);

    if (remainingLit === 0) {
      endGame(true);
    }
  }

  function endGame(won: boolean) {
    const blinks = !won && !reducedMotionQuery.matches;

    if (blinks) {
      board.layer.classList.add('is-dying');
    }

    shell.finish(won, blinks ? BLINK_MS : 0);
  }

  function reset() {
    for (const layer of card.querySelectorAll<SVGGElement>('.game-layer')) {
      layer.classList.remove('is-dying');
      layer.replaceChildren();
    }

    lumps = [];
  }

  function queueTurn(next: Direction) {
    const previous = queuedTurns.at(-1) ?? direction;

    if (queuedTurns.length < MAX_QUEUED_TURNS && next !== previous && next !== DIRECTIONS[previous].opposite) {
      queuedTurns.push(next);
    }
  }

  function steerBySwipe(x: number, y: number) {
    if (!swipeOrigin) {
      return;
    }

    const dx = x - swipeOrigin.x;
    const dy = y - swipeOrigin.y;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_DISTANCE) {
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      queueTurn(dx > 0 ? 'right' : 'left');
    } else {
      queueTurn(dy > 0 ? 'down' : 'up');
    }

    swipeOrigin = { x, y };
  }

  shell.register({
    id: 'snake',
    toggle: snakeToggle,
    bestKey: () => SNAKE_BEST_KEY,
    winTitle: 'YOU ATE THE YEAR',
    scoreVerb: 'ate',
    instructions: {
      pointer: 'Arrow keys or WASD to steer. Darker days are worth more.',
      touch: 'Swipe anywhere to steer. Tap to pause.',
    },
    prepare,
    run,
    halt,
    reset,
    activate: shell.pause,
    onKey: (event) => {
      const turn = KEY_DIRECTIONS[event.key.toLowerCase()];

      if (turn) {
        queueTurn(turn);
      }

      return Boolean(turn);
    },
    touch: {
      start: (x, y) => {
        swipeOrigin = { x, y };
      },
      move: ({ x, y }) => steerBySwipe(x, y),
    },
  });

  // Without a touch pad (a run started by keyboard on a touch screen) a swipe on the map still steers.
  scroller.addEventListener('pointerdown', (event) => {
    if (shell.getActive()?.id === 'snake' && shell.isRunning() && event.pointerType !== 'mouse') {
      swipeOrigin = { x: event.clientX, y: event.clientY };
      swipePointerId = event.pointerId;
    }
  });

  scroller.addEventListener('pointermove', (event) => {
    if (event.pointerId === swipePointerId) {
      steerBySwipe(event.clientX, event.clientY);
    }
  });

  for (const type of ['pointerup', 'pointercancel']) {
    scroller.addEventListener(type, (event) => {
      if ((event as PointerEvent).pointerId === swipePointerId) {
        clearSwipe();
      }
    });
  }
}
