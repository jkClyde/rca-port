import gsap from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  initExpeditionsList();
  initProjectPreview();
  initWorkCards();
  initExpeditionsInteractions();
});

// One entry per project.
//   name / type : the big row text
//   project     : SHORT text on the lime hover bar (keep it under ~25 characters)
//   tags        : optional full tag list for the mobile card (defaults to "project" split on "/")
//   label       : link text on the hover bar and the mobile card button
//   url         : optional. With a url the row becomes a link.
//   year        : shown on the preview card
//   summary     : one line shown on the preview card and the mobile card
//   desktop / mobile : screenshots (public/projects/...). If a file is missing, a
//                      clean placeholder with the project's initials is shown instead.
//
// TODO: Wagster and CalaTrace still need a real "type" and "summary", and Wagster
// needs a live url. Their text matches the placeholders in the homepage cards.
const EXPEDITIONS_DATA = [
  {
    name: "BDN Shop",
    type: "E-commerce",
    project: "Next.js / WooCommerce",
    tags: ["Next.js", "TypeScript", "WooCommerce", "WordPress", "GSAP"],
    label: "Visit Site",
    url: "https://bdn-shop.com",
    year: "2026",
    summary:
      "A headless online store with product management, cart, checkout and integrated payments.",
    desktop: "/img/featured/bdn-desktop.png",
    mobile: "/img/featured/bdn-mobile.png",
  },
  {
    name: "Ayoha Cafe",
    type: "Website",
    project: "Next.js / GSAP",
    tags: ["Next.js", "Tailwind CSS", "GSAP"],
    label: "View Project",
    url: "https://ayohacafe.com",
    year: "2026",
    summary:
      "A modern café website with smooth scroll animations and responsive layouts.",
    desktop: "/img/featured/ayoha-desktop.png",
    mobile: "/img/featured/ayoha-mobile.png",
  },
  {
    name: "Wagster",
    type: "Project",
    project: "WordPress / WooCommerce",
    tags: ["WordPress", "WooCommerce"],
    label: "View Project",
    year: "2026",
    summary: " Designed and developed an online store for an apparel brand, featuring product catalogs, a smooth shopping cart and checkout, and a responsive layout that showcases the collection on any device.",
    desktop: "/img/featured/wagster-desktop.png",
    mobile: "/img/featured/wagster-mobile.png",
  },
  {
    name: "Project Management System",
    type: "Web App",
    project: "Next.js / Supabase",
    tags: ["Next.js", "TypeScript", "Prisma", "Supabase"],
    label: "Visit Site",
    url: "https://cly-pms.vercel.app/",
    year: "2026",
    summary:
      "A dashboard for organizing projects, managing tasks and tracking progress, with user authentication.",
    desktop: "/img/featured/pms-desktop.png",
    mobile: "/img/featured/pms-mobile.png",
  },
  {
    name: "CalaTrace",
    type: "Project",
    project: "Next.js / TypeScript",
    tags: ["Next.js", "TypeScript"],
    label: "View Project",
    // TODO: add the live url when it is ready
    year: "2026",
    summary: "TODO: write a one line description of CalaTrace.",
    desktop: "/img/featured/calatrace-desktop.png",
    mobile: "/img/featured/calatrace-mobile.png",
  },
];

const POSITIONS = {
  BOTTOM: "0%",
  MIDDLE: "-33.333%",
  TOP: "-66.666%",
};

// expeditions section - creates and renders expedition list items
function initExpeditionsList() {
  const expeditionsListContainer = document.querySelector(".expeditions-list");
  if (!expeditionsListContainer) return;

  EXPEDITIONS_DATA.forEach((expedition) => {
    const expeditionElement = document.createElement(
      expedition.url ? "a" : "div"
    );
    expeditionElement.className = "expedition";

    if (expedition.url) {
      expeditionElement.href = expedition.url;
      expeditionElement.target = "_blank";
      expeditionElement.rel = "noopener noreferrer";
    }

    expeditionElement.innerHTML = `
      <div class="expedition-wrapper">
        <div class="expedition-name">
          <h2>${expedition.name}</h2>
          <h2>${expedition.type}</h2>
        </div>
        <div class="expedition-project">
          <h2>${expedition.project}</h2>
          <h2>${expedition.label}</h2>
        </div>
        <div class="expedition-name">
          <h2>${expedition.name}</h2>
          <h2>${expedition.type}</h2>
        </div>
      </div>
    `;

    expeditionsListContainer.appendChild(expeditionElement);
  });
}

// ---------- shared helpers for the preview card and mobile cards ----------
function getInitials(name) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// laptop + phone mockup (same look as the homepage project cards).
// A missing screenshot is removed, which reveals the initials placeholder underneath.
function buildDevices(project) {
  const wrap = document.createElement("div");
  wrap.className = "project-devices";
  const initials = getInitials(project.name);

  wrap.innerHTML = `
    <div class="device-laptop">
      <div class="laptop-screen screen-fallback" data-initials="${initials}">
        <img src="${project.desktop}" alt="${project.name} on desktop" loading="lazy" />
      </div>
      <div class="laptop-base"></div>
    </div>
    <div class="device-phone">
      <div class="phone-screen screen-fallback" data-initials="${initials}">
        <img src="${project.mobile}" alt="${project.name} on mobile" loading="lazy" />
      </div>
    </div>
  `;

  wrap.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => img.remove());
  });

  return wrap;
}

const pad = (n) => String(n).padStart(2, "0");

// desktop: a preview card follows the cursor while you hover a row
function initProjectPreview() {
  const list = document.querySelector(".expeditions-list");
  if (!list) return;

  const preview = document.createElement("div");
  preview.className = "work-preview";
  preview.setAttribute("aria-hidden", "true");

  const inner = document.createElement("div");
  inner.className = "work-preview-inner";
  preview.appendChild(inner);

  const items = EXPEDITIONS_DATA.map((project, i) => {
    const item = document.createElement("div");
    item.className = "preview-item";
    item.appendChild(buildDevices(project));

    const caption = document.createElement("div");
    caption.className = "preview-caption";
    caption.innerHTML = `
      <p class="preview-index">${pad(i + 1)} / ${pad(EXPEDITIONS_DATA.length)}</p>
      <p>${project.type} / ${project.year}</p>
    `;
    item.appendChild(caption);

    const summary = document.createElement("p");
    summary.className = "bodyCopy preview-summary";
    summary.textContent = project.summary;
    item.appendChild(summary);

    inner.appendChild(item);
    return item;
  });

  document.body.appendChild(preview);

  gsap.set(items, { opacity: 0 });
  gsap.set(inner, { opacity: 0, scale: 0.9 });

  const xTo = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3" });
  const yTo = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3" });

  let visible = false;
  let activeIndex = -1;
  let mouse = { x: 0, y: 0 };

  const canShow = () => window.innerWidth >= 1000;

  function target() {
    const gap = 48;
    const margin = 16;
    const w = preview.offsetWidth;
    const h = preview.offsetHeight;

    let x = mouse.x + gap;
    if (x + w > window.innerWidth - margin) x = mouse.x - w - gap;

    let y = mouse.y - h / 2;
    y = Math.max(margin, Math.min(y, window.innerHeight - h - margin));

    return { x, y };
  }

  function show(index) {
    if (!canShow()) return;

    if (!visible) {
      // appear at the cursor instead of flying in from the corner
      const t = target();
      gsap.set(preview, { x: t.x, y: t.y });
      gsap.to(inner, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
        overwrite: true,
      });
      visible = true;
    }

    if (index === activeIndex) return;
    activeIndex = index;

    items.forEach((item, i) => {
      gsap.to(item, {
        opacity: i === index ? 1 : 0,
        y: i === index ? 0 : 12,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }

  function hide() {
    if (!visible) return;
    visible = false;
    activeIndex = -1;
    gsap.to(inner, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
      overwrite: true,
    });
  }

  list.querySelectorAll(".expedition").forEach((row, i) => {
    row.addEventListener("mouseenter", () => show(i));
  });

  list.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!visible) return;
    const t = target();
    xTo(t.x);
    yTo(t.y);
  });

  list.addEventListener("mouseleave", hide);
  window.addEventListener("resize", () => {
    if (!canShow()) hide();
  });
}

// mobile: every project becomes a card (same look as the homepage cards)
function initWorkCards() {
  const section = document.querySelector(".expeditions");
  if (!section) return;

  const cards = document.createElement("div");
  cards.className = "work-cards";

  EXPEDITIONS_DATA.forEach((project, i) => {
    const article = document.createElement("article");
    article.className = "project";

    const info = document.createElement("div");
    info.className = "project-info";

    const tagList =
      project.tags || project.project.split("/").map((tag) => tag.trim());
    const tags = tagList.map((tag) => `<p>${tag}</p>`).join("");

    info.innerHTML = `
      <p class="project-index">${pad(i + 1)} / ${pad(EXPEDITIONS_DATA.length)}</p>
      <h3>${project.name}</h3>
      <p class="bodyCopy project-desc">${project.summary}</p>
      <div class="project-meta">${tags}<p>${project.year}</p></div>
      ${project.url
        ? `<a href="${project.url}" class="btn" target="_blank" rel="noopener noreferrer"><span class="btn-line"></span>${project.label}</a>`
        : ""
      }
    `;

    article.appendChild(info);
    article.appendChild(buildDevices(project));
    cards.appendChild(article);
  });

  section.appendChild(cards);
}

// expeditions section - mouse and scroll interaction handlers
function initExpeditionsInteractions() {
  const expeditionsList = document.querySelector(".expeditions-list");
  if (!expeditionsList) return;

  const expeditionsElements = document.querySelectorAll(".expedition");
  let lastMousePosition = { x: 0, y: 0 };
  let activeExpedition = null;
  let ticking = false;
  let hoverHandlers = new Map();
  let expeditionPositions = new Map();
  let mousemoveHandler = null;
  let scrollHandler = null;

  function updateExpeditions() {
    if (activeExpedition) {
      const rect = activeExpedition.getBoundingClientRect();
      const isStillOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (!isStillOver) {
        const wrapper = activeExpedition.querySelector(".expedition-wrapper");
        const leavingFromTop = lastMousePosition.y < rect.top + rect.height / 2;

        gsap.to(wrapper, {
          y: leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM,
          duration: 0.4,
          ease: "power2.out",
        });
        activeExpedition = null;
      }
    }

    expeditionsElements.forEach((expedition) => {
      if (expedition === activeExpedition) return;

      const rect = expedition.getBoundingClientRect();
      const isMouseOver =
        lastMousePosition.x >= rect.left &&
        lastMousePosition.x <= rect.right &&
        lastMousePosition.y >= rect.top &&
        lastMousePosition.y <= rect.bottom;

      if (isMouseOver) {
        const wrapper = expedition.querySelector(".expedition-wrapper");
        gsap.to(wrapper, {
          y: POSITIONS.MIDDLE,
          duration: 0.4,
          ease: "power2.out",
        });
        activeExpedition = expedition;
      }
    });

    ticking = false;
  }

  function setupMouseListeners() {
    const isMobile = window.innerWidth < 1000;

    if (mousemoveHandler) {
      document.removeEventListener("mousemove", mousemoveHandler);
      mousemoveHandler = null;
    }
    if (scrollHandler) {
      document.removeEventListener("scroll", scrollHandler);
      scrollHandler = null;
    }

    if (!isMobile) {
      mousemoveHandler = (e) => {
        lastMousePosition.x = e.clientX;
        lastMousePosition.y = e.clientY;
      };
      document.addEventListener("mousemove", mousemoveHandler);

      scrollHandler = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            updateExpeditions();
          });
          ticking = true;
        }
      };
      document.addEventListener("scroll", scrollHandler, { passive: true });
    }
  }

  function setupHoverListeners() {
    const isMobile = window.innerWidth < 1000;

    expeditionsElements.forEach((expedition) => {
      const wrapper = expedition.querySelector(".expedition-wrapper");

      if (hoverHandlers.has(expedition)) {
        const handlers = hoverHandlers.get(expedition);
        expedition.removeEventListener("mouseenter", handlers.enter);
        expedition.removeEventListener("mouseleave", handlers.leave);
        hoverHandlers.delete(expedition);
      }

      if (!isMobile) {
        if (!expeditionPositions.has(expedition)) {
          expeditionPositions.set(expedition, POSITIONS.TOP);
        }

        const enterHandler = (e) => {
          activeExpedition = expedition;
          const rect = expedition.getBoundingClientRect();
          const enterFromTop = e.clientY < rect.top + rect.height / 2;
          const currentPosition = expeditionPositions.get(expedition);

          if (enterFromTop || currentPosition === POSITIONS.BOTTOM) {
            expeditionPositions.set(expedition, POSITIONS.MIDDLE);
            gsap.to(wrapper, {
              y: POSITIONS.MIDDLE,
              duration: 0.4,
              ease: "power2.out",
            });
          }
        };

        const leaveHandler = (e) => {
          activeExpedition = null;
          const rect = expedition.getBoundingClientRect();
          const leavingFromTop = e.clientY < rect.top + rect.height / 2;
          const newPosition = leavingFromTop ? POSITIONS.TOP : POSITIONS.BOTTOM;
          expeditionPositions.set(expedition, newPosition);
          gsap.to(wrapper, {
            y: newPosition,
            duration: 0.4,
            ease: "power2.out",
          });
        };

        expedition.addEventListener("mouseenter", enterHandler);
        expedition.addEventListener("mouseleave", leaveHandler);

        hoverHandlers.set(expedition, {
          enter: enterHandler,
          leave: leaveHandler,
        });
      } else {
        expeditionPositions.set(expedition, POSITIONS.TOP);
        gsap.set(wrapper, { y: POSITIONS.TOP });
      }
    });
  }

  setupMouseListeners();
  setupHoverListeners();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setupHoverListeners();
      setupMouseListeners();
    }, 100);
  });
}