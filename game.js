const GRID_SIZE = 30;
const SPEEDS = {
  slow: { label: "Slow", fps: 4 },
  normal: { label: "Normal", fps: 8 },
  fast: { label: "Fast", fps: 10 },
};
const MIN_CELL_SIZE = 8;
const MAX_CELL_SIZE = 80;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const header = document.querySelector(".app-header");
const appMain = document.querySelector(".app-main");
const canvasWrapper = document.querySelector(".canvas-wrapper");
const sidebar = document.querySelector(".sidebar");
const startHint = document.getElementById("start-hint");

const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const speedSelect = document.getElementById("speed-select");
const currentScoreEl = document.getElementById("current-score");
const highScoreEl = document.getElementById("high-score");
const currentSpeedEl = document.getElementById("current-speed");

let cellWidth = 16;
let cellHeight = 16;
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let directionQueue = [];
let food = { x: 0, y: 0 };
let running = false;
let paused = false;
let gameOver = false;
let speedKey = "normal";
let score = 0;
let highScore = 0;
let lastTime = 0;
let accumulator = 0;
let frameInterval = 1000 / SPEEDS[speedKey].fps;
let resizeQueued = false;

function init() {
  setupEventListeners();
  resetGameState();
  performResize();
  draw();
}

function setupEventListeners() {
  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", restartGame);
  speedSelect.addEventListener("change", handleSpeedChange);

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);
}

function handleResize() {
  if (resizeQueued) return;
  resizeQueued = true;
  window.requestAnimationFrame(() => {
    resizeQueued = false;
    performResize();
  });
}

function performResize() {
  resizeLayout();
  draw();
}

function resizeLayout() {
  if (!appMain || !canvasWrapper) return;

  const viewportHeight = window.innerHeight;
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const availableHeight = Math.max(0, viewportHeight - headerHeight);
  appMain.style.height = `${availableHeight}px`;

  const mainStyles = window.getComputedStyle(appMain);
  const paddingY = parseFloat(mainStyles.paddingTop) + parseFloat(mainStyles.paddingBottom);
  const paddingX = parseFloat(mainStyles.paddingLeft) + parseFloat(mainStyles.paddingRight);
  const gap = parseFloat(mainStyles.columnGap) || 0;
  const columnDefinition = (mainStyles.gridTemplateColumns || "").trim();
  const isSingleColumn = columnDefinition.length === 0 || columnDefinition.split(/\s+/).length === 1;

  const mainRect = appMain.getBoundingClientRect();
  const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
  const widthAdjustment = !isSingleColumn && sidebarWidth > 0 ? sidebarWidth + gap : 0;

  const availableWidthForCanvas = Math.max(
    MIN_CELL_SIZE * GRID_SIZE,
    mainRect.width - paddingX - widthAdjustment
  );

  const availableHeightForCanvas = Math.max(
    MIN_CELL_SIZE * GRID_SIZE,
    availableHeight - paddingY
  );

  const clampedWidth = Math.min(availableWidthForCanvas, MAX_CELL_SIZE * GRID_SIZE);
  const clampedHeight = Math.min(availableHeightForCanvas, MAX_CELL_SIZE * GRID_SIZE);

  const finalWidth = Math.floor(clampedWidth);
  const finalHeight = Math.floor(clampedHeight);

  canvasWrapper.style.height = `${finalHeight}px`;
  canvasWrapper.style.width = `${finalWidth}px`; 

  canvas.width = finalWidth;
  canvas.height = finalHeight;
  canvas.style.width = `${finalWidth}px`;
  canvas.style.height = `${finalHeight}px`;

  cellWidth = canvas.width / GRID_SIZE;
  cellHeight = canvas.height / GRID_SIZE;
}

function handleSpeedChange(event) {
  speedKey = event.target.value;
  frameInterval = 1000 / SPEEDS[speedKey].fps;
  updateScoreboard();
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();

  if (key === " " || key === "spacebar") {
    event.preventDefault();
    togglePause();
    return;
  }

  switch (key) {
    case "arrowup":
    case "w":
      attemptStartFromInput();
      queueDirection("up");
      break;
    case "arrowdown":
    case "s":
      attemptStartFromInput();
      queueDirection("down");
      break;
    case "arrowleft":
    case "a":
      attemptStartFromInput();
      queueDirection("left");
      break;
    case "arrowright":
    case "d":
      attemptStartFromInput();
      queueDirection("right");
      break;
    default:
      break;
  }
}

function attemptStartFromInput() {
  if (!running) {
    startGame();
  }
}

function queueDirection(dir) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const newDir = directions[dir];
  if (!newDir) return;

  const lastQueuedDirection =
    directionQueue.length > 0
      ? directionQueue[directionQueue.length - 1]
      : nextDirection;

  if (
    (newDir.x === lastQueuedDirection.x && newDir.y === lastQueuedDirection.y) ||
    (newDir.x === -lastQueuedDirection.x && newDir.y === -lastQueuedDirection.y)
  ) {
    return;
  }

  directionQueue.push(newDir);

  if (directionQueue.length === 1) {
    nextDirection = newDir;
  }
}

function resetGameState() {
  const mid = Math.floor(GRID_SIZE / 2);
  snake = [
    { x: mid + 1, y: mid },
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  directionQueue = [];
  score = 0;
  gameOver = false;
  paused = false;
  running = false;
  accumulator = 0;
  lastTime = 0;
  frameInterval = 1000 / SPEEDS[speedKey].fps;
  speedSelect.value = speedKey;
  spawnFood();
  updateScoreboard();
  pauseBtn.textContent = "Pause";
  pauseBtn.classList.remove("is-paused");
  showHint("Press any arrow key to start");
}

function spawnFood() {
  const available = [];
  const snakeSet = new Set(snake.map((segment) => `${segment.x},${segment.y}`));

  for (let x = 0; x < GRID_SIZE; x += 1) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      const key = `${x},${y}`;
      if (!snakeSet.has(key)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    food = { x: 0, y: 0 };
    return;
  }

  food = available[Math.floor(Math.random() * available.length)];
}

function startGame() {
  if (running) return;

  if (gameOver) {
    resetGameState();
  }

  running = true;
  paused = false;
  hideHint();
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (gameOver) return;

  if (!running) {
    startGame();
    return;
  }

  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  pauseBtn.classList.toggle("is-paused", paused);

  if (paused) {
    showHint("Paused");
  } else {
    hideHint();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
  }
}

function restartGame() {
  resetGameState();
  draw();
}

function gameLoop(timestamp) {
  if (!running || paused) return;

  const delta = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += delta;

  while (accumulator >= frameInterval) {
    update();
    accumulator -= frameInterval;
  }

  draw();
  if (running && !paused) {
    requestAnimationFrame(gameLoop);
  }
}

function update() {
  if (directionQueue.length > 0) {
    nextDirection = directionQueue.shift();
  }

  direction = nextDirection;

  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const willGrow = newHead.x === food.x && newHead.y === food.y;

  if (isCollision(newHead, !willGrow)) {
    handleGameOver();
    return;
  }

  snake.unshift(newHead);

  if (willGrow) {
    score += 10;
    if (score > highScore) {
      highScore = score;
    }
    spawnFood();
  } else {
    snake.pop();
  }

  if (directionQueue.length > 0) {
    nextDirection = directionQueue[0];
  } else {
    nextDirection = direction;
  }

  updateScoreboard();
}

function isCollision(position, ignoreTail = false) {
  if (position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE) {
    return true;
  }

  return snake.some((segment, index) => {
    if (ignoreTail && index === snake.length - 1) {
      return false;
    }
    return segment.x === position.x && segment.y === position.y;
  });
}

function handleGameOver() {
  running = false;
  gameOver = true;
  paused = false;
  pauseBtn.textContent = "Pause";
  pauseBtn.classList.remove("is-paused");
  showHint("Game over � Press arrow to retry");
}

function updateScoreboard() {
  currentScoreEl.textContent = score;
  highScoreEl.textContent = highScore;
  currentSpeedEl.textContent = SPEEDS[speedKey].label;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(18, 16, 43, 0.92)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();
  drawFood();
  drawSnake();

  if (paused) {
    drawMessage("Paused");
  }

  if (gameOver) {
    drawMessage("Game Over");
  }
}

function drawGrid() {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = Math.max(1, Math.min(cellWidth, cellHeight) * 0.08);

  for (let x = 1; x < GRID_SIZE; x += 1) {
    const posX = x * cellWidth;
    ctx.beginPath();
    ctx.moveTo(posX, 0);
    ctx.lineTo(posX, canvas.height);
    ctx.stroke();
  }

  for (let y = 1; y < GRID_SIZE; y += 1) {
    const posY = y * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, posY);
    ctx.lineTo(canvas.width, posY);
    ctx.stroke();
  }
}

function drawSnake() {
  const lineWidth = Math.max(1, Math.min(cellWidth, cellHeight) * 0.12);
  ctx.lineWidth = lineWidth;

  snake.forEach((segment, index) => {
    const baseX = segment.x * cellWidth;
    const baseY = segment.y * cellHeight;
    const insetX = Math.min(cellWidth * 0.25, 8);
    const insetY = Math.min(cellHeight * 0.25, 8);
    const rectWidth = Math.max(2, cellWidth - insetX);
    const rectHeight = Math.max(2, cellHeight - insetY);
    const offsetX = (cellWidth - rectWidth) / 2;
    const offsetY = (cellHeight - rectHeight) / 2;
    const radius = Math.min(rectWidth, rectHeight) * 0.35;

    ctx.fillStyle = index === 0 ? "#62d2a2" : "#3fb58b";
    ctx.strokeStyle = index === 0 ? "#1c7660" : "#1b7b5f";

    drawRoundedRect(baseX + offsetX, baseY + offsetY, rectWidth, rectHeight, radius);
    ctx.fill();
    ctx.stroke();
  });
}

function drawRoundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawFood() {
  const centerX = food.x * cellWidth + cellWidth / 2;
  const centerY = food.y * cellHeight + cellHeight / 2;
  const radius = Math.max(3, Math.min(cellWidth, cellHeight) * 0.4);

  const gradient = ctx.createRadialGradient(
    centerX - radius * 0.35,
    centerY - radius * 0.35,
    radius * 0.2,
    centerX,
    centerY,
    radius
  );
  gradient.addColorStop(0, "#fff4b3");
  gradient.addColorStop(1, "#f6d365");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius, radius * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawMessage(text) {
  const bannerHeight = Math.max(60, Math.min(canvas.height, canvas.width) * 0.15);
  ctx.fillStyle = "rgba(18, 16, 43, 0.65)";
  ctx.fillRect(0, canvas.height / 2 - bannerHeight / 2, canvas.width, bannerHeight);
  ctx.fillStyle = "#ffd9e5";
  const fontSize = Math.max(20, Math.min(canvas.height, canvas.width) * 0.08);
  ctx.font = `${fontSize}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function showHint(text) {
  if (!startHint) return;
  startHint.textContent = text;
  startHint.classList.remove("hidden");
}

function hideHint() {
  if (!startHint) return;
  startHint.classList.add("hidden");
}

init();
