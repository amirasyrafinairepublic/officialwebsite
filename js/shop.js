/* ==========================================================================
   INAI REPUBLIC — SHOP CORE UI
   Shared helpers + ProductCard / ProductGallery / PriceDisplay /
   ColourSwatch primitives. Depends on js/shop-data.js.
   ========================================================================== */
(function () {
  "use strict";
  var SHOP = window.__iniarepublicShop;
  if (!SHOP) return;

  var state = {
    product: null,
    selected: null,
    combo: [],
    mix: { a: null, b: null },
    qty: 1,
    galleryIndex: 0
  };

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    return node;
  }

  function formatRM(value) {
    return "RM " + Number(value || 0).toFixed(2);
  }

  function findColour(colours, id) {
    for (var i = 0; i < colours.length; i++) {
      if (colours[i].id === id) return colours[i];
    }
    return null;
  }

  function colourName(colours, id) {
    var c = findColour(colours, id);
    return c ? c.name : "";
  }

  /* ColourSwatch — circular hair chip (Colour Studio asset). */
  function buildSwatch(colour, isSelected) {
    var btn = el("button", {
      className: "sd-swatch" + (isSelected ? " is-selected" : ""),
      type: "button",
      "aria-label": colour.name,
      "aria-pressed": isSelected ? "true" : "false"
    });
    btn.setAttribute("data-colour", colour.id);
    btn.appendChild(el("img", { className: "sd-swatch-img", src: colour.image, alt: "" }));
    return btn;
  }

  /* PriceDisplay — sale dominant, original crossed out. */
  function buildPrice(product) {
    var row = el("div", { className: "sd-price" });
    row.appendChild(el("span", { className: "sd-price-sale", text: formatRM(product.price) }));
    if (product.originalPrice && product.originalPrice > product.price) {
      row.appendChild(el("del", { className: "sd-price-original", text: formatRM(product.originalPrice) }));
    }
    return row;
  }

  /* ProductCard — grid card for shop.html. */
  function buildCard(product) {
    var colours = SHOP.resolveColours(product);
    var link = "product.html?product=" + encodeURIComponent(product.id);

    var card = el("article", { className: "sd-card" });

    var media = el("a", { className: "sd-card-media", href: link, "aria-label": product.title });
    media.appendChild(el("img", { className: "sd-card-img", src: product.cover, alt: product.title }));
    card.appendChild(media);

    var body = el("div", { className: "sd-card-body" });
    if (product.meta) body.appendChild(el("p", { className: "sd-card-meta", text: product.meta }));

    var title = el("h3", { className: "sd-card-title" });
    title.appendChild(el("a", { href: link, text: product.title }));
    body.appendChild(title);

    body.appendChild(buildPrice(product));

    if (colours.length) {
      body.appendChild(el("p", { className: "sd-card-colours", text: colours.length + " Colours" }));
    }

    var actions = el("div", { className: "sd-card-actions" });
    actions.appendChild(el("a", { className: "sd-btn sd-btn--ghost", href: link, text: "View Product" }));
    body.appendChild(actions);

    card.appendChild(body);
    return card;
  }

  /* ProductGallery — main image + thumbs + arrows. */
  function buildGallery(product) {
    var slides = SHOP.productGallery(product);
    var gallery = el("div", { className: "pd-gallery" });

    var stage = el("div", { className: "pd-gallery-stage" });
    stage.appendChild(el("img", { className: "pd-gallery-img", src: slides[0], alt: product.title }));
    gallery.appendChild(stage);

    if (slides.length > 1) {
      var thumbs = el("div", { className: "pd-gallery-thumbs" });
      slides.forEach(function (src, i) {
        var t = el("button", {
          className: "pd-gallery-thumb" + (i === 0 ? " is-active" : ""),
          type: "button",
          "data-index": String(i),
          "aria-label": "Gambar " + (i + 1),
          "aria-selected": i === 0 ? "true" : "false"
        });
        t.appendChild(el("img", { src: src, alt: "" }));
        thumbs.appendChild(t);
      });
      gallery.appendChild(thumbs);

      var nav = el("div", { className: "pd-gallery-nav" });
      nav.appendChild(el("button", { className: "pd-gallery-arrow", type: "button", "data-dir": "-1", "aria-label": "Gambar sebelumnya", text: "\u2039" }));
      nav.appendChild(el("button", { className: "pd-gallery-arrow", type: "button", "data-dir": "1", "aria-label": "Gambar seterusnya", text: "\u203A" }));
      stage.appendChild(nav);
    }

    state.galleryIndex = 0;
    function show(index) {
      var n = slides.length;
      var i = ((index % n) + n) % n;
      state.galleryIndex = i;
      var img = gallery.querySelector(".pd-gallery-img");
      img.src = slides[i];
      img.alt = product.title + " (" + (i + 1) + "/" + n + ")";
      var list = gallery.querySelectorAll(".pd-gallery-thumb");
      for (var k = 0; k < list.length; k++) {
        list[k].classList.toggle("is-active", k === i);
        list[k].setAttribute("aria-selected", k === i ? "true" : "false");
      }
    }

    gallery.addEventListener("click", function (event) {
      var t = event.target.closest ? event.target.closest("button") : null;
      if (!t) return;
      if (t.classList.contains("pd-gallery-thumb")) show(Number(t.getAttribute("data-index")));
      else if (t.getAttribute("data-dir")) show(state.galleryIndex + Number(t.getAttribute("data-dir")));
    });

    /* Exposed locally on the gallery element so selectors can jump directly
       to a shade poster without duplicating slide/image logic. */
    gallery.showColour = function (colourId) {
      var index = SHOP.colourSlideIndex(product, colourId);
      if (index >= 0) show(index);
    };

    return gallery;
  }

  window.__iniarepublicShop.ui = {
    el: el,
    formatRM: formatRM,
    findColour: findColour,
    colourName: colourName,
    state: state,
    buildSwatch: buildSwatch,
    buildPrice: buildPrice,
    buildCard: buildCard,
    buildGallery: buildGallery
  };
})();
