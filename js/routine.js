import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector(".routine");

if (section) {
    const slider = section.querySelector(".routine-slider");
    const wrapper = section.querySelector(".routine-slider-wrapper");
    const progress = section.querySelector(".routine-progress");
    const total = wrapper.children.length;

    // ---------- mobile controls: counter + previous / next arrows (hidden on desktop by CSS) ----------
    const pad = (n) => String(n).padStart(2, "0");

    const controls = document.createElement("div");
    controls.className = "routine-controls";
    controls.innerHTML = `
    <p class="routine-count"><span class="routine-count-current">01</span> / ${pad(total)}</p>
    <div class="routine-arrows">
      <button type="button" class="routine-arrow routine-prev" aria-label="Previous service" disabled>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
      </button>
      <button type="button" class="routine-arrow routine-next" aria-label="Next service">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </button>
    </div>
  `;
    slider.after(controls);

    const prevBtn = controls.querySelector(".routine-prev");
    const nextBtn = controls.querySelector(".routine-next");
    const countEl = controls.querySelector(".routine-count-current");

    // distance from one card's left edge to the next one's
    const step = () =>
        wrapper.children.length > 1
            ? wrapper.children[1].offsetLeft - wrapper.children[0].offsetLeft
            : wrapper.children[0].offsetWidth;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const go = (direction) =>
        slider.scrollBy({
            left: direction * step(),
            behavior: reduceMotion.matches ? "auto" : "smooth",
        });

    prevBtn.addEventListener("click", () => go(-1));
    nextBtn.addEventListener("click", () => go(1));

    // keeps the progress bar, counter and arrow states in sync with the slider
    const sync = () => {
        const max = slider.scrollWidth - slider.clientWidth;
        const atStart = slider.scrollLeft <= 2;
        const atEnd = slider.scrollLeft >= max - 2;
        const value = max > 0 ? slider.scrollLeft / max : 0;

        gsap.set(progress, { scaleX: Math.min(1, Math.max(0, value)) });

        const index = atEnd
            ? total - 1
            : Math.min(total - 1, Math.round(slider.scrollLeft / step()));
        countEl.textContent = pad(index + 1);

        prevBtn.disabled = atStart;
        nextBtn.disabled = atEnd;
    };

    const mm = gsap.matchMedia();

    // ---------- desktop: the section pins and the cards slide sideways as you scroll ----------
    mm.add("(min-width: 1001px)", () => {
        // how far the cards have to travel so the last one ends flush with the slider
        const distance = () => Math.max(0, wrapper.scrollWidth - slider.clientWidth);

        const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
                trigger: section,
                start: "top top",
                end: () => `+=${distance()}`,
                pin: true,
                scrub: true,
                invalidateOnRefresh: true,
            },
        });

        tl.to(wrapper, { x: () => -distance() }, 0).fromTo(
            progress,
            { scaleX: 0 },
            { scaleX: 1 },
            0
        );
    });

    // ---------- mobile: a normal slider. Native swipe + snap, nothing is pinned ----------
    mm.add("(max-width: 1000px)", () => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                sync();
                ticking = false;
            });
        };

        slider.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", sync);
        sync();

        // runs when the screen grows past the breakpoint
        return () => {
            slider.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", sync);
            gsap.set(progress, { clearProps: "transform" });
        };
    });
}