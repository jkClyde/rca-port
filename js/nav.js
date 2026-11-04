document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initNavLinks();
  initNavResize();
});

// nav - mobile menu toggle
function initNavToggle() {
  const nav = document.querySelector("nav");
  const navHeader = document.querySelector(".nav-mobile-header");
  if (!nav || !navHeader) return;

  function toggleMenu(e) {
    if (window.innerWidth <= 1000) {
      e.stopPropagation();
      nav.classList.toggle("nav-open");
    }
  }

  navHeader.addEventListener("click", toggleMenu);
}

// nav - close menu on link click
function initNavLinks() {
  const nav = document.querySelector("nav");
  const navLinks = document.querySelectorAll(".nav-item a");
  if (!nav || !navLinks.length) return;

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 1000) {
        e.stopPropagation();
        setTimeout(() => {
          nav.classList.remove("nav-open");
        }, 300);
      }
    });
  });
}

// nav - close menu on resize
function initNavResize() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1000) {
      nav.classList.remove("nav-open");
    }
  });
}
