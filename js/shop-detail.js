/* ==========================================================================
   INAI REPUBLIC — PRODUCT DETAIL (product.html?product=<id>)
   Renders gallery | title · price · colour selector · quantity · CTAs ·
   product information from the shared catalogue — one page for all products.
   ========================================================================== */
(function () {
  "use strict";
  var SHOP = window.__iniarepublicShop;
  if (!SHOP) return;

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("product-detail");
    if (!root || !SHOP.ui || !SHOP.selectors || !SHOP.cart) return;

    var ui = SHOP.ui;
    var state = ui.state;
    var params = new URLSearchParams(window.location.search);
    var product = SHOP.getProduct(params.get("product")) || SHOP.products[0];

    /* Reset shared selection state for this product. */
    state.product = product;
    state.selected = null;
    state.combo = [];
    for (var i = 0; i < product.numberOfSelections; i++) state.combo.push(null);
    state.mix = { a: null, b: null };
    state.qty = 1;
    state.galleryIndex = 0;

    var colours = SHOP.resolveColours(product);
    root.innerHTML = "";

    /* Direct route back to the catalogue; intentionally not browser history. */
    root.appendChild(ui.el("a", { className: "pd-back-to-shop", href: "shop.html", text: "← Back to Shop" }));

    /* Breadcrumb */
    var crumb = ui.el("nav", { className: "pd-breadcrumb", "aria-label": "Laluan navigasi" });
    crumb.appendChild(ui.el("a", { href: "index.html", text: "Utama" }));
    crumb.appendChild(ui.el("span", { "aria-hidden": "true", text: "/" }));
    crumb.appendChild(ui.el("a", { href: "shop.html", text: "Shop" }));
    crumb.appendChild(ui.el("span", { "aria-hidden": "true", text: "/" }));
    crumb.appendChild(ui.el("span", { "aria-current": "page", text: product.title }));
    root.appendChild(crumb);

    var layout = ui.el("div", { className: "pd-layout" });
    root.appendChild(layout);

    /* LEFT — ProductGallery */
    var left = ui.el("div", { className: "pd-gallery-col" });
    var gallery = ui.buildGallery(product);
    left.appendChild(gallery);
    layout.appendChild(left);

    /* RIGHT — ProductInfo */
    var right = ui.el("div", { className: "pd-info-col" });
    layout.appendChild(right);

    if (product.meta) right.appendChild(ui.el("p", { className: "pd-meta", text: product.meta }));
    right.appendChild(ui.el("h1", { className: "pd-title", text: product.title }));
    right.appendChild(ui.buildPrice(product));

    /* Colour selector: single vs combo / mix rows. */
    function handleColourPick(colourId) {
      clearValidation();
      gallery.showColour(colourId);
    }
    var selector = product.configType === "single"
      ? SHOP.selectors.buildSingle(product, handleColourPick)
      : SHOP.selectors.buildCombo(product, handleColourPick);
    right.appendChild(selector);
    var validation = selector.querySelector(".sd-validation");

    function clearValidation() {
      if (validation) {
        validation.textContent = "";
        validation.classList.remove("is-visible");
      }
    }

    /* Quantity */
    right.appendChild(SHOP.selectors.buildQuantity());

    /* CTAs */
    var ctas = ui.el("div", { className: "pd-ctas" });
    var addBtn = ui.el("button", { className: "sd-btn sd-btn--primary", type: "button", text: "ADD TO CART" });
    var buyBtn = ui.el("button", { className: "sd-btn sd-btn--dark", type: "button", text: "BUY NOW" });
    ctas.appendChild(addBtn);
    ctas.appendChild(buyBtn);
    right.appendChild(ctas);
    var note = ui.el("p", { className: "pd-cta-note", role: "status" });
    right.appendChild(note);

    /* Product information */
    var info = ui.el("section", { className: "pd-info", "aria-label": "Maklumat produk" });
    info.appendChild(ui.el("h2", { className: "pd-info-title", text: "Product Information" }));
    info.appendChild(ui.el("p", { className: "pd-info-desc", text: product.description }));
    var specs = ui.el("dl", { className: "pd-specs" });
    function spec(term, value) {
      specs.appendChild(ui.el("dt", { text: term }));
      specs.appendChild(ui.el("dd", { text: value }));
    }
    spec("Saiz", product.size);
    if (product.configType === "mix") {
      spec("Konfigurasi", "2 botol bebas \u2014 200ml & 300ml");
    } else if (product.configType === "combo") {
      spec("Konfigurasi", product.numberOfSelections + " botol \u2014 pilihan warna bebas");
    } else {
      spec("Pilihan warna", colours.length + " warna");
    }
    spec("Penghantaran", "Percuma ke seluruh negara");
    info.appendChild(specs);
    right.appendChild(info);

    /* Selection + validation + cart wiring */
    function currentConfig() {
      if (product.configType === "mix") return { a: state.mix.a, b: state.mix.b };
      if (product.configType === "combo") return state.combo.slice();
      return state.selected;
    }

    function validate() {
      if (SHOP.cart.isComplete(product, currentConfig())) {
        clearValidation();
        return true;
      }
      validation.textContent = SHOP.cart.validationMessage(product);
      validation.classList.add("is-visible");
      return false;
    }

    addBtn.addEventListener("click", function () {
      if (!validate()) return;
      if (SHOP.cart.addItem(product, currentConfig(), state.qty)) {
        note.textContent = "Ditambah ke troli \u2713";
      }
    });

    buyBtn.addEventListener("click", function () {
      if (!validate()) return;
      if (SHOP.cart.addItem(product, currentConfig(), state.qty)) {
        note.textContent = "Menuju ke pembayaran\u2026";
        SHOP.cart.proceedToCheckout();
      }
    });

    document.title = product.title + " | INAI REPUBLIC";
  });
})();
