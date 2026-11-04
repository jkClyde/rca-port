import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  initFaqItemsAnimation();
  initFaqToggleInteractions();
});

// faq section - staggered fade in animation for items
function initFaqItemsAnimation() {
  const faqItems = document.querySelectorAll(".faq-item");
  if (!faqItems.length) return;

  const faqSection = document.querySelector(".faq-container");
  if (!faqSection) return;

  gsap.set(faqItems, {
    opacity: 0,
    y: 30,
  });

  gsap.to(faqItems, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out",
    stagger: 0.1,
    delay: 0.3,
    scrollTrigger: {
      trigger: faqSection,
      start: "top 70%",
      toggleActions: "play none none none",
    },
  });
}

// faq section - toggle open/close interactions
function initFaqToggleInteractions() {
  const faqQuestions = document.querySelectorAll(".faq-question");
  if (!faqQuestions.length) return;

  faqQuestions.forEach((question) => {
    const item = question.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const icon = question.querySelector(".faq-icon svg");
    let isOpen = false;

    question.addEventListener("click", () => {
      if (isOpen) {
        gsap.to(icon, {
          rotation: 0,
          duration: 0.3,
          ease: "power2.out",
        });

        gsap.to(answer, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });

        isOpen = false;
      } else {
        gsap.to(icon, {
          rotation: 90,
          duration: 0.3,
          ease: "power2.out",
        });

        answer.style.height = "auto";
        const contentHeight = answer.scrollHeight;
        answer.style.height = "0";

        gsap.to(answer, {
          height: contentHeight,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        });

        isOpen = true;
      }
    });
  });
}
