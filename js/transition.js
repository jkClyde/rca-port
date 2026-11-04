import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GRID_BLOCK_SIZE = 60;
let transitionBlocks = [];

document.addEventListener("DOMContentLoaded", () => {
  initTransition();
});

// transition - main initialization function
function initTransition() {
  const transitionGrid = document.querySelector(".transition-grid");
  if (!transitionGrid) return;

  const isPageNavigation = sessionStorage.getItem("pageTransition") === "true";

  createTransitionGrid(transitionGrid);
  const blocks = transitionBlocks.map((b) => b.element);

  if (isPageNavigation) {
    sessionStorage.removeItem("pageTransition");
    const style = document.querySelector("style[data-transition]");
    if (style) style.remove();
    transitionGrid.style.backgroundColor = "";

    gsap.set(blocks, { opacity: 1 });
    setTimeout(() => {
      revealTransition();
    }, 300);
  } else {
    gsap.set(blocks, { opacity: 0 });
  }

  setupLinkHandlers();
}

// transition - creates grid of transition blocks
function createTransitionGrid(container) {
  container.innerHTML = "";
  transitionBlocks = [];

  const gridWidth = container.offsetWidth || window.innerWidth;
  const gridHeight = container.offsetHeight || window.innerHeight;
  const gridColumnCount = Math.ceil(gridWidth / GRID_BLOCK_SIZE);
  const gridRowCount = Math.ceil(gridHeight / GRID_BLOCK_SIZE) + 1;
  const gridOffsetX = (gridWidth - gridColumnCount * GRID_BLOCK_SIZE) / 2;
  const gridOffsetY = (gridHeight - gridRowCount * GRID_BLOCK_SIZE) / 2;

  for (let rowIndex = 0; rowIndex < gridRowCount; rowIndex++) {
    for (let colIndex = 0; colIndex < gridColumnCount; colIndex++) {
      const blockPosX = colIndex * GRID_BLOCK_SIZE + gridOffsetX;
      const blockPosY = rowIndex * GRID_BLOCK_SIZE + gridOffsetY;
      createTransitionBlock(container, blockPosX, blockPosY);
    }
  }
}

// transition - creates individual transition block
function createTransitionBlock(container, posX, posY) {
  const block = document.createElement("div");
  block.classList.add("transition-block");
  block.style.width = `${GRID_BLOCK_SIZE}px`;
  block.style.height = `${GRID_BLOCK_SIZE}px`;
  block.style.left = `${posX}px`;
  block.style.top = `${posY}px`;
  container.appendChild(block);
  transitionBlocks.push({ element: block });
}

// transition - animates blocks to cover screen before navigation
function animateTransition() {
  return new Promise((resolve) => {
    const blocks = transitionBlocks.map((b) => b.element);
    const transitionGrid = document.querySelector(".transition-grid");

    if (!blocks.length || !transitionGrid) {
      setTimeout(() => resolve(), 100);
      return;
    }

    transitionGrid.style.pointerEvents = "auto";
    transitionGrid.style.zIndex = "1000";

    gsap.set(blocks, { opacity: 0 });

    gsap.to(blocks, {
      opacity: 1,
      duration: 0.05,
      ease: "power2.inOut",
      stagger: {
        amount: 0.5,
        each: 0.01,
        from: "random",
      },
      onComplete: () => {
        setTimeout(() => resolve(), 300);
      },
    });
  });
}

// transition - reveals page by animating blocks away
function revealTransition() {
  const blocks = transitionBlocks.map((b) => b.element);
  if (blocks.length === 0) return;

  const transitionGrid = document.querySelector(".transition-grid");

  gsap.to(blocks, {
    opacity: 0,
    duration: 0.05,
    ease: "power2.inOut",
    stagger: {
      amount: 0.5,
      each: 0.01,
      from: "random",
    },
    onComplete: () => {
      if (transitionGrid) {
        transitionGrid.style.pointerEvents = "none";
      }
      ScrollTrigger.refresh();
    },
  });
}

// transition - checks if link is external
function isExternalLink(href) {
  if (!href) return false;
  return (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  );
}

// transition - checks if link points to current page
function isSamePage(href) {
  if (!href) return true;

  let current = window.location.pathname;
  current = current.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  if (current === "/index") current = "/";

  let target = href.trim();
  if (
    target === "/" ||
    target === "/index" ||
    target === "/index.html" ||
    target === "index.html" ||
    !target
  ) {
    target = "/";
  } else {
    if (!target.startsWith("/")) {
      target = "/" + target;
    }
    target = target.replace(/\.html$/, "").replace(/\/$/, "");
  }

  return current === target;
}

// transition - sets up click handlers for internal links
function setupLinkHandlers() {
  let isTransitioning = false;

  const handleLinkClick = (event) => {
    if (isTransitioning) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const link = event.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || isExternalLink(href)) return;

    if (isSamePage(href)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    isTransitioning = true;

    const transitionGrid = document.querySelector(".transition-grid");
    if (transitionGrid) {
      transitionGrid.style.pointerEvents = "auto";
    }

    sessionStorage.setItem("pageTransition", "true");

    animateTransition()
      .then(() => {
        window.location.href = href;
      })
      .catch((error) => {
        window.location.href = href;
      });
  };

  document.addEventListener("click", handleLinkClick, {
    capture: true,
    passive: false,
  });
}
