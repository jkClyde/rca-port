import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// runs right away if the page is already loaded, otherwise waits for it
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRoutineSlider);
} else {
    initRoutineSlider();
}

// process section - pins the section and slides the cards sideways while you scroll
function initRoutineSlider() {
    const section = document.querySelector(".routine");
    const wrapper = document.querySelector(".routine-slider-wrapper");
    const progress = document.querySelector(".routine-progress");

    if (!section || !wrapper || !progress) {
        console.warn("[routine] section, slider or progress bar not found in the HTML");
        return;
    }

    const slider = wrapper.parentElement;

    // how far the cards must move so the last card is fully visible
    // (never positive: if all cards already fit on screen there is nothing to slide)
    const getTravel = () => Math.min(0, -(wrapper.offsetWidth - slider.offsetWidth));

    if (getTravel() === 0) {
        console.warn(
            "[routine] the cards have no room to slide. The .routine rules are probably missing from home.css (the slider wrapper should be 350% wide)."
        );
    }

    // one timeline moves the cards and fills the progress bar together.
    // scrub is true (not a number) because Lenis already smooths the scroll.
    const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.max(300, Math.round(Math.abs(getTravel()) * 1.25))}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
        },
    });

    tl.fromTo(wrapper, { x: 0 }, { x: () => getTravel(), duration: 1, force3D: true }, 0);
    tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);

    // make sure positions are right once fonts and images are in
    window.addEventListener("load", () => ScrollTrigger.refresh());
}