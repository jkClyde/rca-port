import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  initHeroTimer();
  initIntroCopyAnimation();
  initStickyWorkHeaderAnimation();
  initLayoutRefresh();
});

// re-measures every pin when the page height changes after load (late fonts, images,
// slow phone connections). Without this, pin positions stay stale and land in the wrong spot.
function initLayoutRefresh() {
  if (!("ResizeObserver" in window)) return;

  let lastHeight = document.body.offsetHeight;
  let timer;

  // remember the height ScrollTrigger last measured, so a refresh doesn't trigger itself
  ScrollTrigger.addEventListener("refresh", () => {
    lastHeight = document.body.offsetHeight;
  });

  const observer = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (Math.abs(document.body.offsetHeight - lastHeight) > 2) {
        ScrollTrigger.refresh();
      }
    }, 200);
  });

  observer.observe(document.body);
}

// hero section - updates timezone display every minute
function initHeroTimer() {
  const timeElement = document.querySelector(".hero-timer p");
  if (!timeElement) return;

  function updateTime() {
    const options = {
      timeZone: "America/Toronto",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    };

    const torontoTime = new Date().toLocaleString("en-US", options);
    const hour = parseInt(torontoTime.split(":")[0]);
    const sector = Math.floor(hour / 4) + 1;
    const sectorFormatted = String(sector).padStart(2, "0");

    timeElement.textContent = `Zone ${sectorFormatted} __ ${torontoTime}`;
  }

  updateTime();
  setInterval(updateTime, 60000);
}

// intro section - text fill animation on scroll
function initIntroCopyAnimation() {
  const introCopyH3 = document.querySelector(".intro-copy h3");
  if (!introCopyH3) return;

  const split = SplitText.create(introCopyH3, {
    type: "words, chars",
    charsClass: "char",
  });

  ScrollTrigger.create({
    trigger: ".intro-copy",
    start: "top 75%",
    end: "bottom 30%",
    onUpdate: (self) => {
      const progress = self.progress;
      const totalChars = split.chars.length;
      const charsToColor = Math.floor(progress * totalChars);

      split.chars.forEach((char, index) => {
        if (index < charsToColor) {
          char.style.color = "var(--base-100)";
        } else {
          char.style.color = "var(--base-300)";
        }
      });
    },
  });
}

// featured projects header - pins the big heading while the project cards scroll over it.
// The header stays at z-index 0 and the cards sit above it (z-index 1, see home.css),
// so nothing depends on a negative z-index.
function initStickyWorkHeaderAnimation() {
  const workHeaderSection = document.querySelector(".featured-missions-header");
  const homeWorkSection = document.querySelector(".featured-missions");

  if (!workHeaderSection || !homeWorkSection) return;

  // The header sticks with CSS (position: sticky in home.css) instead of a ScrollTrigger pin.
  // A pin has to measure where the header sits, and that measurement went stale on phones
  // because the zoom gallery above it adds pin spacing. Sticky needs no measuring.
  // Sticky only works inside a shared parent, so wrap the header and the project list.
  // (You can also put this wrapper in index.html and delete this block.)
  if (!workHeaderSection.parentElement.classList.contains("featured-missions-wrap")) {
    const wrap = document.createElement("div");
    wrap.className = "featured-missions-wrap";
    workHeaderSection.before(wrap);
    wrap.append(workHeaderSection, homeWorkSection);
  }

  // re-measure once everything (images, fonts) has loaded and when the phone rotates
  window.addEventListener("load", () => ScrollTrigger.refresh());
  window.addEventListener("orientationchange", () => {
    setTimeout(() => ScrollTrigger.refresh(), 300);
  });
}

export { initHeroTimer };