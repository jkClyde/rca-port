import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenis = null;

document.addEventListener("DOMContentLoaded", () => {
  initLenisScroll();
});

// lenis scroll - smooth scroll initialization
function initLenisScroll() {
  lenis = new Lenis({
    // one smoothing setting only (lerp). Mixing lerp and duration is confusing.
    lerp: 0.1,
    smoothWheel: true,
    // syncTouch is left off on purpose: phones and tablets keep their own native touch
    // scrolling, which is smoother than a JavaScript copy of it
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.lenis = lenis;
}

export { lenis };