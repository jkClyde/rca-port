import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  document.fonts.ready.then(() => {
    initAnimatedCopy();
  });
});

function initAnimatedCopy() {
  const preloaderOverlay = document.querySelector(".preloader-overlay");
  const hasSeenPreloader = sessionStorage.getItem("preloaderSeen") === "true";
  const isPreloaderShowing = !!preloaderOverlay && !hasSeenPreloader;
  const heroContent = document.querySelector(".hero-content");

  const animatedElements = document.querySelectorAll("[data-animate-variant]");

  animatedElements.forEach((element) => {
    const variant = element.getAttribute("data-animate-variant");

    if (variant === "slide") {
      initSlideAnimation(element, isPreloaderShowing, heroContent);
    } else if (variant === "flicker") {
      initFlickerAnimation(element, isPreloaderShowing, heroContent);
    }
  });

  initHeroTimerAnimation();
}

// slide variant - line reveal animation with mask
function initSlideAnimation(element, isPreloaderShowing, heroContent) {
  const animateOnScroll =
    element.getAttribute("data-animate-on-scroll") === "true";
  let delay = parseFloat(element.getAttribute("data-animate-delay")) || 0;
  const stagger =
    parseFloat(element.getAttribute("data-animate-stagger")) || 0.1;

  if (isPreloaderShowing && heroContent && heroContent.contains(element)) {
    delay = delay + 2;
  }

  const split = SplitText.create(element, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    linesClass: "line",
    onSplit(self) {
      gsap.set(self.lines, {
        yPercent: 100,
      });

      const animation = gsap.to(self.lines, {
        yPercent: 0,
        duration: 0.75,
        ease: "power3.out",
        delay: delay,
        stagger: stagger,
        paused: animateOnScroll,
      });

      if (animateOnScroll) {
        ScrollTrigger.create({
          trigger: element,
          start: "top 70%",
          animation: animation,
          toggleActions: "play none none none",
        });
      }
    },
  });
}

// flicker variant - character flicker animation
function initFlickerAnimation(element, isPreloaderShowing, heroContent) {
  const animateOnScroll =
    element.getAttribute("data-animate-on-scroll") === "true";
  let delay = parseFloat(element.getAttribute("data-animate-delay")) || 0;

  if (isPreloaderShowing && heroContent && heroContent.contains(element)) {
    delay = delay + 2;
  }

  const split = SplitText.create(element, {
    type: "chars",
    autoSplit: true,
    onSplit(self) {
      const chars = self.chars;

      gsap.set(chars, { opacity: 0 });

      const animation = gsap.to(chars, {
        delay: delay,
        duration: 0.05,
        opacity: 1,
        ease: "power2.inOut",
        stagger: {
          amount: 0.5,
          each: 0.1,
          from: "random",
        },
        paused: animateOnScroll,
      });

      if (animateOnScroll) {
        ScrollTrigger.create({
          trigger: element,
          start: "top 85%",
          animation: animation,
          toggleActions: "play none none none",
        });
      }
    },
  });
}

// hero timer - flicker reveal animation
function initHeroTimerAnimation() {
  const heroTimer = document.querySelector(".hero-timer");
  if (!heroTimer) return;

  const preloaderOverlay = document.querySelector(".preloader-overlay");
  const hasSeenPreloader = sessionStorage.getItem("preloaderSeen") === "true";
  const isPreloaderShowing = !!preloaderOverlay && !hasSeenPreloader;
  const timerDelay = isPreloaderShowing ? 1 + 2 : 1;

  gsap.set(heroTimer, { opacity: 0 });

  gsap.to(heroTimer, {
    delay: timerDelay,
    duration: 0.1,
    opacity: 1,
    ease: "power2.inOut",
    repeat: 4,
  });
}
