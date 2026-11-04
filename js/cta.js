import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener("DOMContentLoaded", () => {
  const contact = document.querySelector(".contact");
  if (!contact) return;

  document.fonts.ready.then(() => {
    initContactCopy();
    initContactCards();
    initContactButton();
    initContactGhost();
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
});

// same trigger style as the template: plays when you arrive, reverses when you leave
const reveal = (trigger, start = "top 75%") => ({
  trigger,
  start,
  toggleActions: "play reverse play reverse",
});

// copy text - line by line reveal (same effect as the template)
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

  gsap.to(split.lines, {
    yPercent: 0,
    duration: 0.5,
    ease: "power1.out",
    stagger: 0.1,
    scrollTrigger: reveal(".contact-row"),
  });
}

// cards - fly in from the sides with a tilt, then settle (the template's cards fly out, these fly in)
function initContactCards() {
  const cards = gsap.utils.toArray(".contact-card");
  if (!cards.length) return;

  const wide = window.matchMedia("(min-width: 1001px)").matches;
  const fromX = wide ? [-160, 0, 160] : [0, 0, 0];
  const fromRotate = [-8, 0, 8];

  cards.forEach((card, i) => {
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
        delay: i * 0.1,
        scrollTrigger: reveal(".contact-cards", "top 85%"),
      }
    );
  });
}

// button - fade up
function initContactButton() {
  const btn = document.querySelector(".contact-row a.btn");
  if (!btn) return;

  gsap.fromTo(
    btn,
    { y: 25, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power1.out",
      delay: 0.3,
      scrollTrigger: reveal(".contact-row"),
    }
  );
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
      },
    }
  );
}

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
        // fallback for http:// or older browsers
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