// ==============================================
//   CONFIGURATION
// ==============================================

const USE_IMAGE = true;
const IMAGE_SRC = "images/IMG_0037.AVIF";
const GRID_SIZE = 3;
const TILE_PX = 100;
const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// ==============================================
//   GAME STATE
// ==============================================

let board = [];
let moveCount = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let bestTime = null;

// ==============================================
//   INITIALISATION
// ==============================================

function initGame() {
    stopTimer();
    board = shuffleBoard();
    moveCount = 0;
    elapsedSeconds = 0;

    document.getElementById("move-count").textContent = 0;
    document.getElementById("timer-display").textContent = "0:00";
    document.getElementById("win-msg").textContent = "";

    renderBoard();
    startTimer();
}

// ==============================================
//   SHUFFLE
//   Randomly reorders the goal state until we get a layout that is both solvable (even number of inversions) and not already solved
// ==============================================

function shuffleBoard() {
  let arr;
  do {
    arr = [...GOAL_STATE].sort(() => Math.random() - 0.5);
  } while (!isSolvable(arr) || isSolved(arr));
  return arr;
}
 
function isSolvable(arr) {
  const tiles = arr.filter(v => v !== 0);
  let inversions = 0;
  for (let i = 0; i < tiles.length; i++)
    for (let j = i + 1; j < tiles.length; j++)
      if (tiles[i] > tiles[j]) inversions++;
  return inversions % 2 === 0;
}
 
function isSolved(arr) {
  return arr.every((v, i) => v === GOAL_STATE[i]);
}

// ==============================================
//   MOVE LOGIC
//   Swaps a clicked tile with an empty space, increments the move counter, re-renders, and checks for a win
// ==============================================

function moveTile(idx) {
  const emptyIdx = board.indexOf(0);
  board[emptyIdx] = board[idx];
  board[idx] = 0;
  moveCount++;
 
  document.getElementById("move-count").textContent = moveCount;
  renderBoard();
 
  if (isSolved(board)) {
    stopTimer();
    document.getElementById("win-msg").textContent =
      `Solved in ${moveCount} moves and ${formatTime(elapsedSeconds)}!`;
    if (bestTime === null || elapsedSeconds < bestTime) bestTime = elapsedSeconds;
    document.getElementById("best-display").textContent = formatTime(bestTime);
  }
}

// ==============================================
//   RENDER
//   Rebuilds the board DOM from the state array. Each tile is either an image crop, a numbered label, or an empty space. Tiles adjacent to the empty space get a click handler to trigger a move. 
// ==============================================

function renderBoard() {
  const container = document.getElementById("board");
  container.innerHTML = "";
 
  const emptyIdx = board.indexOf(0);
  const emptyRow = Math.floor(emptyIdx / GRID_SIZE);
  const emptyCol = emptyIdx % GRID_SIZE;
 
  board.forEach((value, idx) => {
    const tile = document.createElement("div");
    tile.classList.add("tile");
 
    if (value === 0) {
      tile.classList.add("empty");
    } else {
      if (USE_IMAGE) {
        const col = (value - 1) % GRID_SIZE;
        const row = Math.floor((value - 1) / GRID_SIZE);
        tile.style.backgroundImage = `url(${IMAGE_SRC})`;
        tile.style.backgroundSize = `${TILE_PX * GRID_SIZE}px ${TILE_PX * GRID_SIZE}px`;
        tile.style.backgroundPosition = `-${col * TILE_PX}px -${row * TILE_PX}px`;
      } else {
        tile.textContent = value;
      }
 
      // Check adjacency to empty tile
      const tileRow = Math.floor(idx / GRID_SIZE);
      const tileCol = idx % GRID_SIZE;
      const adjacent =
        (tileRow === emptyRow && Math.abs(tileCol - emptyCol) === 1) ||
        (tileCol === emptyCol && Math.abs(tileRow - emptyRow) === 1);
 
      if (adjacent) {
        tile.classList.add("movable");
        tile.addEventListener("click", () => moveTile(idx));
      }
    }
 
    container.appendChild(tile);
  });
}

// ==============================================
//   TIMER
// ==============================================

function startTimer() {
  elapsedSeconds = 0;
  timerInterval = setInterval(() => {
    elapsedSeconds++;
    document.getElementById("timer-display").textContent = formatTime(elapsedSeconds);
  }, 1000);
}
 
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}
 
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ==============================================
//   START
// ==============================================

initGame();