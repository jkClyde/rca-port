import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Scroll distance (px) the pinned zoom animation plays over.
const SCROLL_DISTANCE = 1200;

const gallery = document.querySelector("#gallery");

// the hero (video + scanline animation) is far off screen while the zoom plays,
// so stop it from doing any work until it is visible again
const hero = document.querySelector(".hero");
const heroVideo = hero ? hero.querySelector("video") : null;

if (hero) {
    ScrollTrigger.create({
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
            hero.classList.toggle("is-offscreen", !self.isActive);
            if (heroVideo) {
                if (self.isActive) heroVideo.play().catch(() => { });
                else heroVideo.pause();
            }
        },
    });
}

if (gallery) {
    const root = document.documentElement;
    const layers = gallery.querySelectorAll(".zoom-layer");

    // decode every zoom image up front, so no image gets decoded in the middle of the scroll
    gallery.querySelectorAll("img").forEach((img) => {
        img.decoding = "async";
        if (img.decode) img.decode().catch(() => { });
    });

    // white backdrop, added as the FIRST child so the images draw on top of it
    const bg = document.createElement("div");
    bg.className = "zoom-bg";
    gallery.prepend(bg);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: gallery,
            start: "top top",
            end: `+=${SCROLL_DISTANCE}`,
            scrub: true,
            pin: true,
            // no anticipatePin: it is made for native scrolling and can cause jitter with Lenis
            // the gallery is fully white by now, so the color swap is invisible
            onLeave: () => root.classList.add("is-light"),
            onEnterBack: () => root.classList.remove("is-light"),
            onRefresh: (self) =>
                root.classList.toggle("is-light", self.progress === 1),
        },
    });

    // each layer zooms to the scale set in its data-zoom-scale attribute
    layers.forEach((layer) => {
        const scale = Number(layer.dataset.zoomScale) || 1;
        tl.fromTo(
            layer,
            { scale: 1 },
            { scale, ease: "none", force3D: true },
            0
        );
    });

    // fade the white backdrop in during the last part of the zoom
    // (the zoom tweens last 0.5s in total; this runs from 0.3s to 0.48s)
    tl.fromTo(bg, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.18 }, 0.3);

    // decorative "scroll down" hint, stopped as soon as you start scrolling
    const hint = gsap.timeline({ repeat: -1 });
    hint
        .to(gallery.querySelector(".scroll-wheel-dot"), {
            y: 10,
            opacity: 0,
            duration: 1,
            ease: "power1.in",
        })
        .set(gallery.querySelector(".scroll-wheel-dot"), { y: 0, opacity: 1 });

    const chevrons = gsap.to(gallery.querySelectorAll(".scroll-chevron"), {
        y: 6,
        opacity: 0.15,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        stagger: 0.15,
        ease: "power1.inOut",
    });

    const label = gsap.to(gallery.querySelector(".scroll-label"), {
        opacity: 0.4,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
    });

    ScrollTrigger.create({
        trigger: gallery,
        start: "top top",
        end: "+=150",
        onLeave: () => [hint, chevrons, label].forEach((a) => a.pause()),
        onEnterBack: () => [hint, chevrons, label].forEach((a) => a.play()),
    });

    // the pin adds scroll space, so recalculate other scroll animations once everything has loaded
    window.addEventListener("load", () => ScrollTrigger.refresh());
}