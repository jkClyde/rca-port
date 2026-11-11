import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// phone address bars showing/hiding resize the window; ignore that so the pin doesn't recalculate mid-scroll
ScrollTrigger.config({ ignoreMobileResize: true });

// Scroll distance (px) the pinned zoom animation plays over.
// Longer = slower, smoother zoom.
const SCROLL_DISTANCE = 2400;

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
    const layers = Array.from(gallery.querySelectorAll(".zoom-layer"));

    // decode every zoom image up front, so no image gets decoded in the middle of the scroll
    gallery.querySelectorAll("img").forEach((img) => {
        img.decoding = "async";
        if (img.decode) img.decode().catch(() => { });
    });

    // white backdrop, added as the FIRST child so the images draw on top of it
    const bg = document.createElement("div");
    bg.className = "zoom-bg";
    gallery.prepend(bg);

    // decorative "scroll down" hint. It keeps animating for the whole zoom
    // and is only paused once the zoom has finished.
    const wheelDot = gallery.querySelector(".scroll-wheel-dot");
    const hintAnims = [];

    if (wheelDot) {
        const hint = gsap.timeline({ repeat: -1 });
        hint
            .to(wheelDot, {
                y: 10,
                opacity: 0,
                duration: 1,
                ease: "power1.in",
            })
            .set(wheelDot, { y: 0, opacity: 1 });
        hintAnims.push(hint);
    }

    hintAnims.push(
        gsap.to(gallery.querySelectorAll(".scroll-chevron"), {
            y: 6,
            opacity: 0.15,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            stagger: 0.15,
            ease: "power1.inOut",
        })
    );

    const scrollLabel = gallery.querySelector(".scroll-label");
    if (scrollLabel) {
        hintAnims.push(
            gsap.to(scrollLabel, {
                opacity: 0.4,
                duration: 1.4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            })
        );
    }

    // The zoom animates the real width / height / position of each box instead of
    // scaling it with a transform. A scaled box is a bitmap that gets stretched
    // (blurry); a resized box is redrawn at its real size every frame (sharp).
    let tl = null;
    let lastWidth = window.innerWidth;

    function build() {
        const items = layers.map((layer) => ({
            box: layer.firstElementChild,
            scale: Number(layer.dataset.zoomScale) || 1,
        }));
        const boxes = items.map((i) => i.box);

        // back to the plain CSS layout, so we can measure each box where it normally sits
        gsap.set(boxes, {
            clearProps: "width,height,left,top,position,transform",
        });

        const g = gallery.getBoundingClientRect();
        const cx = g.left + g.width / 2;
        const cy = g.top + g.height / 2;

        const sizes = boxes.map((box) => {
            const r = box.getBoundingClientRect();
            return {
                w: r.width,
                h: r.height,
                dx: r.left + r.width / 2 - cx,
                dy: r.top + r.height / 2 - cy,
            };
        });

        // the scroll hint (mouse + chevrons) grows together with its box
        const hintEl = gallery.querySelector(".zoom-hint");
        if (hintEl) gsap.set(hintEl, { clearProps: "transform" });

        // each box is centered in the gallery, then moved by its offset (x / y)
        gsap.set(boxes, {
            position: "absolute",
            left: "50%",
            top: "50%",
            xPercent: -50,
            yPercent: -50,
        });

        tl = gsap.timeline({
            scrollTrigger: {
                trigger: gallery,
                start: "top top",
                end: `+=${SCROLL_DISTANCE}`,
                scrub: true,
                pin: true,
                // no anticipatePin: it is made for native scrolling and can cause jitter with Lenis
                // the gallery is fully white by now, so the color swap is invisible
                onLeave: () => {
                    root.classList.add("is-light");
                    hintAnims.forEach((a) => a.pause());
                },
                onEnterBack: () => {
                    root.classList.remove("is-light");
                    hintAnims.forEach((a) => a.play());
                },
                onRefresh: (self) =>
                    root.classList.toggle("is-light", self.progress === 1),
            },
        });

        // every box grows to the factor set in its data-zoom-scale attribute
        items.forEach(({ box, scale }, i) => {
            const { w, h, dx, dy } = sizes[i];
            tl.fromTo(
                box,
                { width: w, height: h, x: dx, y: dy },
                {
                    width: w * scale,
                    height: h * scale,
                    x: dx * scale,
                    y: dy * scale,
                    ease: "none",
                    force3D: false,
                },
                0
            );

            // if this box holds the scroll hint, scale the hint by the same factor
            if (hintEl && box.contains(hintEl)) {
                tl.fromTo(
                    hintEl,
                    { scale: 1 },
                    {
                        scale,
                        ease: "none",
                        force3D: false,
                        transformOrigin: "50% 50%",
                    },
                    0
                );
            }
        });

        // fade the white backdrop in during the last part of the zoom
        // (the zoom tweens last 0.5s in total; this runs from 0.3s to 0.48s)
        tl.fromTo(
            bg,
            { opacity: 0 },
            { opacity: 1, ease: "none", duration: 0.18 },
            0.3
        );
    }

    build();

    // the layout depends on the screen size, so rebuild when the width changes
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth === lastWidth) return;
            lastWidth = window.innerWidth;
            if (tl) {
                if (tl.scrollTrigger) tl.scrollTrigger.kill(true);
                tl.kill();
            }
            build();
            ScrollTrigger.refresh();
        }, 250);
    });

    // the pin adds scroll space, so recalculate other scroll animations once everything has loaded
    window.addEventListener("load", () => ScrollTrigger.refresh());

    // fonts (Anton etc.) change heading sizes when they arrive, which moves the pin start
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
}