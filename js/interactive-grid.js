document.addEventListener("DOMContentLoaded", () => {
  initInteractiveGrid();
});

const GRID_BLOCK_SIZE = 60;
const GRID_HIGHLIGHT_DURATION = 300;
// extra rows below the screen, so the grid still covers the page when a phone's address bar hides
const GRID_EXTRA_ROWS = 3;

let gridBlocks = [];
let gridColumnCount = 0;
let gridRowCount = 0;
let gridOffsetX = 0;
let gridOffsetY = 0;
let gridBuiltWidth = 0;
let gridBuiltHeight = 0;
let gridMouse = { x: undefined, y: undefined };

// only the blocks that are currently lit are checked each frame
const activeGridBlocks = new Set();
let gridLoopRunning = false;

// interactive grid - creates grid and sets up mouse interactions
function initInteractiveGrid() {
  const container = document.querySelector(".interactive-grid");
  if (!container) return;

  resetInteractiveGrid(container);
  setupInteractiveGridEvents(container);
}

function resetInteractiveGrid(container) {
  activeGridBlocks.clear();
  gridBlocks = [];

  gridBuiltWidth = window.innerWidth;
  gridBuiltHeight = window.innerHeight;

  gridColumnCount = Math.ceil(gridBuiltWidth / GRID_BLOCK_SIZE);
  const visibleRows = Math.ceil(gridBuiltHeight / GRID_BLOCK_SIZE);
  gridRowCount = visibleRows + GRID_EXTRA_ROWS;

  gridOffsetX = (gridBuiltWidth - gridColumnCount * GRID_BLOCK_SIZE) / 2;
  gridOffsetY = (gridBuiltHeight - visibleRows * GRID_BLOCK_SIZE) / 2;

  // build all blocks off-DOM, then attach them in a single step
  const fragment = document.createDocumentFragment();

  for (let rowIndex = 0; rowIndex < gridRowCount; rowIndex++) {
    for (let colIndex = 0; colIndex < gridColumnCount; colIndex++) {
      const element = document.createElement("div");
      element.classList.add("block");
      element.style.width = `${GRID_BLOCK_SIZE}px`;
      element.style.height = `${GRID_BLOCK_SIZE}px`;
      element.style.left = `${colIndex * GRID_BLOCK_SIZE + gridOffsetX}px`;
      element.style.top = `${rowIndex * GRID_BLOCK_SIZE + gridOffsetY}px`;
      fragment.appendChild(element);

      // blocks are stored row by row, so a block's index is row * columns + column
      gridBlocks.push({ element, highlightEndTime: 0 });
    }
  }

  container.innerHTML = "";
  container.appendChild(fragment);
}

function setupInteractiveGridEvents(container) {
  // debounced, and ignores the small height changes a phone's address bar causes while scrolling
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const widthChanged = window.innerWidth !== gridBuiltWidth;
      const heightChanged =
        Math.abs(window.innerHeight - gridBuiltHeight) > GRID_BLOCK_SIZE * 3;
      if (widthChanged || heightChanged) resetInteractiveGrid(container);
    }, 200);
  });

  window.addEventListener("mousemove", handleGridMouseMove, { passive: true });
  window.addEventListener("mouseout", handleGridMouseOut);
}

function handleGridMouseMove(e) {
  gridMouse.x = e.clientX;
  gridMouse.y = e.clientY;
  addGridHighlights();
}

function handleGridMouseOut() {
  gridMouse.x = undefined;
  gridMouse.y = undefined;
}

function highlightGridBlock(block, endTime) {
  block.element.classList.add("highlight");
  block.highlightEndTime = endTime;
  activeGridBlocks.add(block);
}

function addGridHighlights() {
  if (gridMouse.x === undefined || gridMouse.y === undefined) return;

  // the block under the mouse, found by simple maths instead of checking every block
  const col = Math.floor((gridMouse.x - gridOffsetX) / GRID_BLOCK_SIZE);
  const row = Math.floor((gridMouse.y - gridOffsetY) / GRID_BLOCK_SIZE);
  if (col < 0 || row < 0 || col >= gridColumnCount || row >= gridRowCount) {
    return;
  }

  const now = Date.now();
  highlightGridBlock(
    gridBlocks[row * gridColumnCount + col],
    now + GRID_HIGHLIGHT_DURATION
  );

  // plus one random neighbour (same look as before)
  const neighbors = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nc = col + dx;
      const nr = row + dy;
      if (nc < 0 || nr < 0 || nc >= gridColumnCount || nr >= gridRowCount) {
        continue;
      }
      neighbors.push(gridBlocks[nr * gridColumnCount + nc]);
    }
  }

  if (neighbors.length) {
    const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    highlightGridBlock(neighbor, now + GRID_HIGHLIGHT_DURATION);
  }

  // start the frame loop only if it is not already running
  if (!gridLoopRunning) {
    gridLoopRunning = true;
    requestAnimationFrame(updateGridHighlights);
  }
}

// runs only while some block is lit, then stops by itself
function updateGridHighlights() {
  const now = Date.now();

  activeGridBlocks.forEach((block) => {
    if (now > block.highlightEndTime) {
      block.element.classList.remove("highlight");
      block.highlightEndTime = 0;
      activeGridBlocks.delete(block);
    }
  });

  if (activeGridBlocks.size > 0) {
    requestAnimationFrame(updateGridHighlights);
  } else {
    gridLoopRunning = false;
  }
}