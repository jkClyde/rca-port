import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  const contact = document.querySelector(".contact");
  if (!contact) return;

  const start = () => {
    // one failing init can no longer block the others
    [
      initContactCopy,
      initContactCards,
      initContactButton,
      initContactGhost,
    ].forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error(`[cta] ${fn.name} failed:`, err);
      }
    });
    ScrollTrigger.refresh();
  };

  // never wait on fonts forever (slow phone connections)
  if (document.fonts && document.fonts.ready) {
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]).then(start);
  } else {
    start();
  }

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    setTimeout(() => ScrollTrigger.refresh(), 1000);
  });
});

// runs fn once, the first time the element is on screen.
// IntersectionObserver is the main check. A scroll / resize / timer check backs it up,
// because on real phones the observer can miss when the page height shifts after load.
function onVisible(target, fn, rootMargin = "0px 0px -5% 0px") {
  const el =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;

  let done = false;
  let io = null;
  let timer = null;

  const cleanup = () => {
    if (io) io.disconnect();
    window.removeEventListener("scroll", check);
    window.removeEventListener("resize", check);
    clearInterval(timer);
  };

  const run = () => {
    if (done) return;
    done = true;
    cleanup();
    fn();
  };

  function check() {
    if (done) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.97 && r.bottom > 0) run();
  }

  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) run();
      },
      { rootMargin, threshold: 0 }
    );
    io.observe(el);
  }

  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
  timer = setInterval(check, 500);

  check();
}

// failsafe: some time after a reveal, force the final state if an element is still hidden
function ensureShown(elements, finalProps, delay = 2500) {
  setTimeout(() => {
    const list = Array.isArray(elements) ? elements : [elements];
    list.forEach((el) => {
      if (!el) return;
      const hidden =
        parseFloat(getComputedStyle(el).opacity) < 0.05 ||
        (finalProps.yPercent === 0 &&
          (gsap.getProperty(el, "yPercent") || 0) !== 0);
      if (hidden) {
        gsap.to(el, { ...finalProps, duration: 0.4, overwrite: true });
      }
    });
  }, delay);
}

// copy text - line by line reveal
function initContactCopy() {
  const copy = document.querySelector(".contact-copy .bodyCopy");
  if (!copy) return;

  const split = SplitText.create(copy, {
    type: "lines",
    linesClass: "line",
  });

  split.lines.forEach((line) => {
    const mask = document.createElement("div");
    mask.className = "line-mask";
    line.parentNode.insertBefore(mask, line);
    mask.appendChild(line);
  });

  gsap.set(split.lines, { yPercent: 100 });

  onVisible(".contact-row", () => {
    gsap.to(split.lines, {
      yPercent: 0,
      duration: 0.5,
      ease: "power1.out",
      stagger: 0.1,
    });
    ensureShown(split.lines, { yPercent: 0 });
  });
}

// cards - fly in from the sides with a tilt, then settle
function initContactCards() {
  const cards = gsap.utils.toArray(".contact-card");
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0 });

  cards.forEach((card, i) => {
    onVisible(
      card,
      () => {
        // checked now, not at load, so resizing or rotating the phone is fine
        const wide = window.matchMedia("(min-width: 1001px)").matches;
        const fromX = wide ? [-160, 0, 160] : [0, 0, 0];
        const fromRotate = [-8, 0, 8];

        gsap.fromTo(
          card,
          {
            x: fromX[i % 3],
            y: 120,
            rotate: fromRotate[i % 3],
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            delay: wide ? i * 0.1 : 0,
          }
        );
        ensureShown(card, { opacity: 1, x: 0, y: 0, rotate: 0 });
      },
      "0px 0px -3% 0px"
    );
  });
}

// button - fade up (only exists if a button is added to .contact-row)
function initContactButton() {
  const btn = document.querySelector(".contact-row a.btn");
  if (!btn) return;

  gsap.set(btn, { opacity: 0, y: 25 });

  onVisible(".contact-row", () => {
    gsap.to(btn, {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power1.out",
      delay: 0.3,
    });
    ensureShown(btn, { opacity: 1, y: 0 });
  });
}

// big background initials - slow drift while the section scrolls by
function initContactGhost() {
  const ghost = document.querySelector(".contact-ghost");
  if (!ghost) return;

  gsap.fromTo(
    ghost,
    { yPercent: -12 },
    {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: ".contact",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );
}

// quick copy tile
document.querySelectorAll("[data-copy]").forEach((btn) => {
  const label = btn.querySelector(".contact-card-value");
  const original = label ? label.textContent : "";
  let timer;

  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
    } catch (err) {
      console.error("Copy failed:", err);
      return;
    }

    btn.classList.add("is-copied");
    if (label) label.textContent = "Copied!";
    clearTimeout(timer);
    timer = setTimeout(() => {
      btn.classList.remove("is-copied");
      if (label) label.textContent = original;
    }, 1800);
  });
});