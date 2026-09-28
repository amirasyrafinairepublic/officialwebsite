/* ==========================================================================
   INAI REPUBLIC — COLOUR STUDIO  (Homepage Section 4)
   Colour-first shade explorer with a TikTok hair colour filter CTA.

   What this file does:
   1. Holds all 12 official shades in one data object (order is FINAL).
   2. Renders the horizontal shade selector into the markup.
   3. Handles shade selection: active state, main preview image, shade name,
      label chip and accessible status messaging.

   Shade selection here drives the main preview only. The try-on step is a
   TikTok CTA link defined in the markup (index.html) and styled in
   styles/colour-studio.css; there is no try-on processing in this file.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. OFFICIAL SHADE DATA — single source of truth
        Order is FINAL: never alphabetize, never reorder by colour or by
        popularity. Honey Brown must stay first.
     ------------------------------------------------------------------------ */
  const SHADES = [
    { id: "honey-brown",     name: "Honey Brown",     label: "Best Selling",            image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-HONEY-BROWN.png" },
    { id: "chocolate-brown", name: "Chocolate Brown", label: "Tutup Uban / Grey Cover", image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-CHOCOLATE-BROWN.png" },
    { id: "coco-black",      name: "Coco Black",      label: "Tutup Uban / Grey Cover", image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-COCO-BLACK.png" },
    { id: "mocha-milk-tea",  name: "Mocha Milk Tea",  label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-MOCHA-MILK-TEA.png" },
    { id: "hazelnut",        name: "Hazelnut",        label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-HAZELNUT.png" },
    { id: "royal-chestnut",  name: "Royal Chestnut",  label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-ROYAL-CHESTNUT.png" },
    { id: "persian-red",     name: "Persian Red",     label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-PERSIAN-RED.png" },
    { id: "caramel-gold",    name: "Caramel Gold",    label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-CARAMEL-GOLD.png" },
    { id: "olive-jade",      name: "Olive Jade",      label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-OLIVE-JADE.png" },
    { id: "burgundy",        name: "Burgundy",        label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-BURGUNDY.png" },
    { id: "ash-brown",       name: "Ash Brown",       label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-ASH-BROWN.png" },
    { id: "ash-grey",        name: "Ash Grey",        label: "",                        image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-ASH-GREY.png" }
  ];

  /* Honey Brown (index 0) is the default selected shade. */
  const DEFAULT_SHADE_ID = SHADES[0].id;

  /* ------------------------------------------------------------------------
     2. State + small helpers
     ------------------------------------------------------------------------ */
  const state = {
    activeId: DEFAULT_SHADE_ID
  };

  let dom = null;             /* cached element references */

  function getShade(id) {
    for (let i = 0; i < SHADES.length; i++) {
      if (SHADES[i].id === id) return SHADES[i];
    }
    return SHADES[0];
  }

  function shadePosition(shade) {
    for (let i = 0; i < SHADES.length; i++) {
      if (SHADES[i].id === shade.id) return i + 1;
    }
    return 1;
  }

  function pad2(number) {
    return number < 10 ? "0" + number : String(number);
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (error) {
      return false;
    }
  }

  /* ------------------------------------------------------------------------
     3. DOM cache (single lookup pass, all access guarded)
     ------------------------------------------------------------------------ */
  function cacheDom() {
    const root = document.getElementById("colour-studio");
    if (!root) return null;
    return {
      root: root,
      media: root.querySelector("#colour-studio-preview-media"),
      img: root.querySelector("#colour-studio-preview-img"),
      indexPill: root.querySelector("#colour-studio-preview-index"),
      selector: root.querySelector("#colour-studio-selector"),
      selectedName: root.querySelector("#colour-studio-selected-name"),
      selectedChip: root.querySelector("#colour-studio-selected-chip"),
      status: root.querySelector("#colour-studio-status")
    };
  }

  /* ------------------------------------------------------------------------
     4. Bootstrap — safe on every page: no #colour-studio, no work done.
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    dom = cacheDom();
    if (!dom || !dom.selector || !dom.img) return;

    renderSelector();
    applyShade(DEFAULT_SHADE_ID, { announce: false, scroll: false });
    bindEvents();
  });

  /* ------------------------------------------------------------------------
     5. Selector rendering — built from SHADES, so the order can never drift.
        (Visual design, sizes, order and labels are intentionally unchanged.)
     ------------------------------------------------------------------------ */
  function renderSelector() {
    if (!dom || !dom.selector) return;
    if (dom.selector.children.length) return;      /* never render twice */

    const fragment = document.createDocumentFragment();

    SHADES.forEach(function (shade) {
      const item = document.createElement("li");
      item.className = "colour-studio-swatch-item";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "colour-studio-swatch";
      button.setAttribute("data-shade-id", shade.id);
      button.setAttribute("aria-pressed", "false");

      const media = document.createElement("span");
      media.className = "colour-studio-swatch-media";

      const image = document.createElement("img");
      image.src = shade.image;
      image.alt = "Tona rambut " + shade.name;
      image.loading = "lazy";
      image.decoding = "async";
      media.appendChild(image);

      if (shade.label) {
        const badge = document.createElement("span");
        badge.className = "colour-studio-swatch-badge";
        badge.textContent = shade.label;
        media.appendChild(badge);
      }

      const check = document.createElement("span");
      check.className = "colour-studio-swatch-check";
      check.setAttribute("aria-hidden", "true");
      check.textContent = "\u2713";
      media.appendChild(check);

      const name = document.createElement("span");
      name.className = "colour-studio-swatch-name";
      name.textContent = shade.name;

      button.appendChild(media);
      button.appendChild(name);
      item.appendChild(button);
      fragment.appendChild(item);
    });

    dom.selector.appendChild(fragment);
  }

  /* ------------------------------------------------------------------------
     6. Selection — updates state, active swatch, main preview and readout.
        The TikTok CTA link needs no JavaScript at all.
     ------------------------------------------------------------------------ */
  function applyShade(id, options) {
    const settings = options || {};
    const shade = getShade(id);
    state.activeId = shade.id;

    if (dom) {
      const buttons = dom.selector ? dom.selector.querySelectorAll(".colour-studio-swatch") : [];
      for (let i = 0; i < buttons.length; i++) {
        const isActive = buttons[i].getAttribute("data-shade-id") === shade.id;
        buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
      }

      if (dom.selectedName) dom.selectedName.textContent = shade.name;
      if (dom.indexPill) {
        dom.indexPill.textContent = "Tona " + pad2(shadePosition(shade)) + " / " + SHADES.length;
      }
      if (dom.selectedChip) {
        if (shade.label) {
          dom.selectedChip.textContent = shade.label;
          dom.selectedChip.hidden = false;
        } else {
          dom.selectedChip.textContent = "";
          dom.selectedChip.hidden = true;
        }
      }
    }

    renderMainPreview(shade);

    if (settings.announce) {
      setStatus("Tona dipilih: " + shade.name + ".");
    }
    if (settings.scroll !== false) keepSwatchVisible(shade.id);
  }

  /* Crossfade the main preview image (preloaded, so a failed request can
     never leave an empty frame). */
  function renderMainPreview(shade) {
    if (!dom || !dom.img) return;

    const show = function () {
      dom.img.src = shade.image;
      dom.img.alt = "Pratonton warna rambut tona " + shade.name;
      dom.img.setAttribute("data-shade-id", shade.id);
      if (dom.media) dom.media.classList.remove("is-swapping");
    };

    if (dom.media) dom.media.classList.add("is-swapping");

    const preloaded = new Image();
    preloaded.decoding = "async";
    preloaded.onload = show;
    preloaded.onerror = function () {
      if (dom.media) dom.media.classList.remove("is-swapping");
      setStatus("Imej tona ini tidak dapat dimuatkan. Sila cuba tona yang lain.");
    };
    preloaded.src = shade.image;
  }

  /* Keep the active swatch inside the horizontal strip without moving the
     page scroll position. */
  function keepSwatchVisible(id) {
    if (!dom || !dom.selector) return;
    const strip = dom.selector;
    if (strip.scrollWidth <= strip.clientWidth + 4) return;

    const button = strip.querySelector('[data-shade-id="' + id + '"]');
    if (!button) return;

    const left = button.offsetLeft;
    const right = left + button.offsetWidth;
    if (left >= strip.scrollLeft && right <= strip.scrollLeft + strip.clientWidth) return;

    const target = left - (strip.clientWidth - button.offsetWidth) / 2;
    try {
      strip.scrollTo({
        left: Math.max(0, target),
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    } catch (error) {
      strip.scrollLeft = Math.max(0, target);
    }
  }

  /* ------------------------------------------------------------------------
     7. Accessible status line (role="status"; hidden while empty)
     ------------------------------------------------------------------------ */
  function setStatus(message) {
    if (!dom || !dom.status) return;
    dom.status.textContent = message || "";
  }

  /* ------------------------------------------------------------------------
     8. Event wiring — shade selection only.
     ------------------------------------------------------------------------ */
  function bindEvents() {
    if (!dom || !dom.selector) return;

    dom.selector.addEventListener("click", function (event) {
      const target = event.target;
      const button = target && target.closest ? target.closest(".colour-studio-swatch") : null;
      if (!button || !dom.selector.contains(button)) return;

      const id = button.getAttribute("data-shade-id");
      if (!id || id === state.activeId) return;

      applyShade(id, { announce: true });
    });

    /* Arrow keys move focus along the strip; Enter/Space activate natively. */
    dom.selector.addEventListener("keydown", function (event) {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (keys.indexOf(event.key) === -1) return;

      const buttons = dom.selector.querySelectorAll(".colour-studio-swatch");
      const current = Array.prototype.indexOf.call(buttons, document.activeElement);
      if (current === -1) return;

      let next = current;
      if (event.key === "ArrowRight") next = Math.min(buttons.length - 1, current + 1);
      if (event.key === "ArrowLeft") next = Math.max(0, current - 1);
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = buttons.length - 1;
      if (next === current) return;

      event.preventDefault();
      buttons[next].focus();
    });
  }

  /* ------------------------------------------------------------------------
     9. Small public API — read-only helpers for other scripts
     ------------------------------------------------------------------------ */
  window.inaiColourStudio = {
    version: "2.0.0",
    shades: SHADES.map(function (shade) {
      return {
        id: shade.id,
        name: shade.name,
        label: shade.label,
        image: shade.image
      };
    }),
    getSelected: function () {
      return getShade(state.activeId);
    },
    select: function (id) {
      applyShade(id, { announce: true });
    },
    setStatus: setStatus
  };
})();
