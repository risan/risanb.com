import { BEEP_SECONDS, cellIndex, LEVEL_BEEP_FREQUENCIES, ROWS, svgElement, type Board, type Game, type GameShell } from './game-shell';
import type { HeatmapContext } from './index';

interface Brick {
  cell: SVGElement;
  date: string;
  index: number;
  left: number;
  top: number;
  level: number;
}

type Phase = 'ready' | 'flying';

const BEST_KEY = 'heatmap-breakout-best';
const FIELD_ROWS = 8;
const LIVES = 3;
const BALL_RADIUS = 2.6;
const START_SPEED = 200;
const SPEED_PER_HIT = 3;
const MAX_SPEED = 340;
const MAX_FRAME_MS = 50;
const MAX_SUBSTEPS = 64;
const PADDLE_HEIGHT = 4;
const PADDLE_MARGIN = 6;
const PADDLE_WIDTH_DESKTOP = 54;
const PADDLE_WIDTH_MOBILE = 46;
const PADDLE_KEY_SPEED = 320;
const TOUCH_DRAG_GAIN = 1.4;
const LAUNCH_ANGLE = 60;
const CENTER_ANGLE = 75;
const EDGE_ANGLE = 20;
const CENTER_DEAD_ZONE = 0.1;
const FLASH_MS = 160;
const WALL_BEEP = 330;
const PADDLE_BEEP = 440;
const LIFE_LOST_BEEPS = [440, 330, 220];

const KEY_SIDES: Record<string, -1 | 1> = { arrowleft: -1, a: -1, arrowright: 1, d: 1 };
const radians = (degrees: number) => (degrees * Math.PI) / 180;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function initBreakout({ card, scroller, columnStep, cellSize, xOffset, yOffset, mobileQuery, reducedMotionQuery, engine }: HeatmapContext, shell: GameShell) {
  const toggle = card.querySelector<HTMLButtonElement>('#breakout-toggle')!;
  const livesOutput = card.querySelector<HTMLElement>('[data-game="lives"]')!;
  const originalViewBoxes = new Map<SVGSVGElement, string>();
  const heldSides = new Set<-1 | 1>();
  const halfGap = (columnStep - cellSize) / 2;

  let board: Board;
  let bricks: (Brick | undefined)[] = [];
  let bricksLeft = 0;
  let field = { left: 0, right: 0, top: 0, bottom: 0 };
  let paddle: SVGRectElement;
  let ball: SVGCircleElement;
  let paddleWidth = 0;
  let paddleLeft = 0;
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let speed = START_SPEED;
  let lives = LIVES;
  let phase: Phase = 'ready';
  let frameId = 0;
  let lastFrameAt = 0;

  const paddleTop = () => field.bottom - PADDLE_MARGIN - PADDLE_HEIGHT;
  const isRunning = () => shell.getActive() === game && shell.isRunning();
  const unitsPerPixel = () => board.svg.viewBox.baseVal.width / board.svg.getBoundingClientRect().width;

  function enter() {
    for (const svg of card.querySelectorAll<SVGSVGElement>('.heatmap-svg')) {
      const { x: left, y: top, width, height } = svg.viewBox.baseVal;
      originalViewBoxes.set(svg, svg.getAttribute('viewBox')!);
      svg.setAttribute('viewBox', `${left} ${top} ${width} ${height + FIELD_ROWS * columnStep}`);
    }

    renderLives();
  }

  function leave() {
    for (const [svg, viewBox] of originalViewBoxes) {
      svg.setAttribute('viewBox', viewBox);
    }

    originalViewBoxes.clear();
  }

  function renderLives() {
    livesOutput.textContent = '●'.repeat(lives) + '○'.repeat(LIVES - lives);
    livesOutput.setAttribute('aria-label', `${lives} ${lives === 1 ? 'life' : 'lives'} left`);
  }

  function prepare() {
    board = shell.readBoard();
    field = {
      left: xOffset - halfGap,
      right: xOffset + board.cols * columnStep - halfGap,
      top: yOffset - halfGap,
      bottom: board.svg.viewBox.baseVal.height,
    };
    bricks = [];
    bricksLeft = 0;

    board.cells.forEach((cell, index) => {
      const level = cell ? Number(cell.dataset.level) : 0;

      if (!cell || level === 0) {
        return;
      }

      const col = Math.floor(index / ROWS);
      const row = index % ROWS;
      bricks[index] = { cell, date: cell.dataset.date!, index, left: xOffset + col * columnStep, top: yOffset + row * columnStep, level };
      bricksLeft++;
    });

    paddleWidth = mobileQuery.matches ? PADDLE_WIDTH_MOBILE : PADDLE_WIDTH_DESKTOP;
    paddleLeft = (field.left + field.right - paddleWidth) / 2;
    paddle = svgElement('rect', 'breakout-paddle', board.layer);
    paddle.setAttribute('y', String(paddleTop()));
    paddle.setAttribute('width', String(paddleWidth));
    paddle.setAttribute('height', String(PADDLE_HEIGHT));
    paddle.setAttribute('rx', String(PADDLE_HEIGHT / 2));
    ball = svgElement('circle', 'breakout-ball', board.layer);
    ball.setAttribute('r', String(BALL_RADIUS));
    lives = LIVES;
    renderLives();
    park();
    render();
  }

  function park() {
    phase = 'ready';
    speed = START_SPEED;
    x = paddleLeft + paddleWidth / 2;
    y = paddleTop() - BALL_RADIUS;
  }

  function run() {
    lastFrameAt = performance.now();
    frameId = requestAnimationFrame(frame);

    if (bricksLeft === 0) {
      shell.finish(true);
    }
  }

  function halt() {
    cancelAnimationFrame(frameId);
    heldSides.clear();
  }

  function reset() {
    for (const layer of card.querySelectorAll<SVGGElement>('.game-layer')) {
      layer.replaceChildren();
    }

    bricks = [];
    lives = LIVES;
    renderLives();
  }

  function frame(now: number) {
    const seconds = Math.min(now - lastFrameAt, MAX_FRAME_MS) / 1000;
    lastFrameAt = now;

    const direction = [...heldSides].reduce((sum, side) => sum + side, 0);
    movePaddle(direction * PADDLE_KEY_SPEED * seconds);

    if (phase === 'flying') {
      fly(seconds);
    } else {
      x = paddleLeft + paddleWidth / 2;
    }

    render();

    if (shell.isRunning()) {
      frameId = requestAnimationFrame(frame);
    }
  }

  function render() {
    paddle.setAttribute('x', String(paddleLeft));
    ball.setAttribute('cx', String(x));
    ball.setAttribute('cy', String(y));
  }

  function movePaddle(delta: number) {
    paddleLeft = clamp(paddleLeft + delta, field.left, field.right - paddleWidth);
  }

  // Each substep moves the ball less than half its radius per axis, so it cannot cross a brick or the paddle.
  function fly(seconds: number) {
    const substeps = clamp(Math.ceil((speed * seconds) / (BALL_RADIUS / 2)), 1, MAX_SUBSTEPS);
    const step = seconds / substeps;

    for (let i = 0; i < substeps; i++) {
      x += vx * step;
      bounceHorizontally();
      y += vy * step;
      bounceVertically();

      if (bricksLeft === 0) {
        shell.finish(true);

        return;
      }

      if (y - BALL_RADIUS > field.bottom) {
        loseLife();

        return;
      }
    }
  }

  function bounceHorizontally() {
    if (x - BALL_RADIUS < field.left) {
      x = field.left + BALL_RADIUS;
      vx = Math.abs(vx);
      engine.beep(WALL_BEEP, BEEP_SECONDS);

      return;
    }

    if (x + BALL_RADIUS > field.right) {
      x = field.right - BALL_RADIUS;
      vx = -Math.abs(vx);
      engine.beep(WALL_BEEP, BEEP_SECONDS);

      return;
    }

    const brick = brickUnderBall();

    if (brick) {
      const isLeftOfBrick = x < brick.left + cellSize / 2;
      x = isLeftOfBrick ? brick.left - BALL_RADIUS : brick.left + cellSize + BALL_RADIUS;
      vx = isLeftOfBrick ? -Math.abs(vx) : Math.abs(vx);
      hit(brick);
    }
  }

  function bounceVertically() {
    if (y - BALL_RADIUS < field.top) {
      y = field.top + BALL_RADIUS;
      vy = Math.abs(vy);
      engine.beep(WALL_BEEP, BEEP_SECONDS);

      return;
    }

    if (vy > 0 && isOnPaddle()) {
      bounceOffPaddle();

      return;
    }

    const brick = brickUnderBall();

    if (brick) {
      const isAboveBrick = y < brick.top + cellSize / 2;
      y = isAboveBrick ? brick.top - BALL_RADIUS : brick.top + cellSize + BALL_RADIUS;
      vy = isAboveBrick ? -Math.abs(vy) : Math.abs(vy);
      hit(brick);
    }
  }

  /** Of the bricks the ball overlaps, the one it overlaps most, so a corner graze damages one brick only. */
  function brickUnderBall() {
    const firstCol = Math.floor((x - BALL_RADIUS - xOffset) / columnStep);
    const lastCol = Math.floor((x + BALL_RADIUS - xOffset) / columnStep);
    const firstRow = Math.floor((y - BALL_RADIUS - yOffset) / columnStep);
    const lastRow = Math.floor((y + BALL_RADIUS - yOffset) / columnStep);
    let found: Brick | undefined;
    let foundOverlap = 0;

    for (let col = firstCol; col <= lastCol; col++) {
      for (let row = firstRow; row <= lastRow; row++) {
        const brick = bricks[cellIndex(col, row)];

        if (!brick || brick.level === 0) {
          continue;
        }

        const overlapX = Math.min(x + BALL_RADIUS, brick.left + cellSize) - Math.max(x - BALL_RADIUS, brick.left);
        const overlapY = Math.min(y + BALL_RADIUS, brick.top + cellSize) - Math.max(y - BALL_RADIUS, brick.top);

        if (overlapX > 0 && overlapY > 0 && overlapX * overlapY > foundOverlap) {
          found = brick;
          foundOverlap = overlapX * overlapY;
        }
      }
    }

    return found;
  }

  function hit(brick: Brick) {
    const hitsLeft = brick.level;
    const removed = Math.ceil(shell.remainingCount(brick.date) / hitsLeft);

    brick.level--;
    shell.setCellLevel(brick.cell, brick.level);
    shell.removeContributions(brick.date, removed);
    flash(brick.cell);
    engine.beep(LEVEL_BEEP_FREQUENCIES[hitsLeft]!, BEEP_SECONDS);

    if (brick.level === 0) {
      bricksLeft--;
    }

    speed = Math.min(MAX_SPEED, speed + SPEED_PER_HIT);
    setHeading(vx, vy);
  }

  function flash(cell: SVGElement) {
    if (!reducedMotionQuery.matches) {
      cell.animate([{ transform: 'scale(1.35)', opacity: 0.5 }, { transform: 'scale(1)', opacity: 1 }], { duration: FLASH_MS });
    }
  }

  /** Points the ball along (dx, dy) at the current speed. */
  function setHeading(dx: number, dy: number) {
    const length = Math.hypot(dx, dy);
    vx = (dx / length) * speed;
    vy = (dy / length) * speed;
  }

  function isOnPaddle() {
    return y <= paddleTop() && y + BALL_RADIUS >= paddleTop() && x + BALL_RADIUS >= paddleLeft && x - BALL_RADIUS <= paddleLeft + paddleWidth;
  }

  function bounceOffPaddle() {
    const offset = clamp((x - (paddleLeft + paddleWidth / 2)) / (paddleWidth / 2), -1, 1);
    const side = Math.abs(offset) < CENTER_DEAD_ZONE ? Math.sign(vx) || 1 : Math.sign(offset);
    const angle = radians(CENTER_ANGLE + (EDGE_ANGLE - CENTER_ANGLE) * Math.abs(offset));

    y = paddleTop() - BALL_RADIUS;
    setHeading(side * Math.cos(angle), -Math.sin(angle));
    engine.beep(PADDLE_BEEP, BEEP_SECONDS);
  }

  function loseLife() {
    lives--;
    renderLives();

    if (lives === 0) {
      shell.finish(false);

      return;
    }

    shell.playBeeps(LIFE_LOST_BEEPS, 0.09, 0.11);
    park();
  }

  function launch() {
    const side = Math.random() < 0.5 ? -1 : 1;

    phase = 'flying';
    setHeading(side * Math.cos(radians(LAUNCH_ANGLE)), -Math.sin(radians(LAUNCH_ANGLE)));
  }

  function activate() {
    if (phase === 'ready') {
      launch();
    } else {
      shell.pause();
    }
  }

  function centerPaddleAtClientX(clientX: number) {
    const left = board.svg.getBoundingClientRect().left;

    paddleLeft = clamp((clientX - left) * unitsPerPixel() - paddleWidth / 2, field.left, field.right - paddleWidth);
  }

  const game: Game = {
    id: 'breakout',
    toggle,
    bestKey: () => `${BEST_KEY}-${mobileQuery.matches ? 'mobile' : 'desktop'}`,
    winTitle: 'ALL CLEAR',
    scoreVerb: 'cleared',
    instructions: {
      pointer: 'Move with the mouse, ←/→ or A/D. Space to launch. Darker days take more hits.',
      touch: 'Drag anywhere to move. Tap to launch.',
    },
    enter,
    leave,
    prepare,
    run,
    halt,
    reset,
    activate,
    onKey: (event) => {
      const side = KEY_SIDES[event.key.toLowerCase()];

      if (side) {
        heldSides.add(side);
      }

      return Boolean(side);
    },
    touch: {
      move: ({ dx }) => movePaddle(dx * unitsPerPixel() * TOUCH_DRAG_GAIN),
    },
  };

  shell.register(game);

  document.addEventListener('keyup', (event) => {
    const side = KEY_SIDES[event.key.toLowerCase()];

    if (side) {
      heldSides.delete(side);
    }
  });

  card.addEventListener('pointermove', (event) => {
    if (isRunning() && event.pointerType === 'mouse') {
      centerPaddleAtClientX(event.clientX);
    }
  });

  scroller.addEventListener('click', () => {
    if (isRunning() && phase === 'ready') {
      launch();
    }
  });
}
