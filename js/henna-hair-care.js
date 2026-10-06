/* ==========================================================================
   INAI REPUBLIC x SAINT LAURENT DESIGN SYSTEM
   Henna Hair Care - js/henna-hair-care.js
   Page-scoped scroll-reveal for the Henna Hair Care sections (Collection, Hair Concerns and Hair Care Routine).
   Progressive enhancement only: if this file never runs, every section stays
   fully visible - it never hides content on its own. The motion itself is
   defined in styles/henna-hair-care.css and respects prefers-reduced-motion.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".haircare-collection, .haircare-concerns, .haircare-routine");
  if (!sections.length) {
    return;
  }

  const observerSupported = ("IntersectionObserver" in window);
  const observer = observerSupported
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-inview");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      )
    : null;

  sections.forEach((section) => {
    // Switches on the CSS entrance state - only ever added when scripting runs.
    section.classList.add("is-animated");
    if (observer) {
      observer.observe(section);
    } else {
      section.classList.add("is-inview");
    }
  });
});
