/* ==========================================================================
   INAI REPUBLIC — SHOP CART BRIDGE
   Validates the colour configuration, builds the cart payload (including
   the full colour configuration) and writes it into the site cart drawer
   exposed by js/app.js (window.__iniarepublicCart).
   ========================================================================== */
(function () {
  "use strict";
  var SHOP = window.__iniarepublicShop;
  if (!SHOP) return;

  function isComplete(product, cfg) {
    if (!cfg) return false;
    if (product.configType === "mix") return !!(cfg.a && cfg.b);
    if (product.configType === "combo") {
      for (var i = 0; i < product.numberOfSelections; i++) {
        if (!cfg[i]) return false;
      }
      return true;
    }
    return typeof cfg === "string" && cfg.length > 0;
  }

  function validationMessage(product) {
    if (product.configType === "single") return "Please select your colour.";
    return "Please select a colour for each product.";
  }

  /* Shade line shown in the cart drawer (matches drawer's split on " • "). */
  function configShade(product, cfg) {
    var colours = SHOP.resolveColours(product);
    function n(id, row) { return SHOP.ui.colourName(row ? SHOP.coloursForRow(product, row) : colours, id); }
    if (product.configType === "mix") {
      return "200ml: " + n(cfg.a, "a") + " • 300ml: " + n(cfg.b, "b");
    }
    if (product.configType === "combo") {
      var parts = [];
      for (var i = 0; i < product.numberOfSelections; i++) {
        parts.push("Colour " + (i + 1) + ": " + n(cfg[i]));
      }
      return parts.join(" • ");
    }
    return "Colour: " + n(cfg);
  }

  /* Structured configuration stored with the cart item. */
  function configPayload(product, cfg) {
    var colours = SHOP.resolveColours(product);
    function pick(id, row) {
      var c = SHOP.ui.findColour(row ? SHOP.coloursForRow(product, row) : colours, id);
      return c ? { id: c.id, name: c.name } : null;
    }
    if (product.configType === "mix") {
      return {
        selected200mlColour: pick(cfg.a, "a"),
        selected300mlColour: pick(cfg.b, "b")
      };
    }
    if (product.configType === "combo") {
      var out = {};
      for (var i = 0; i < product.numberOfSelections; i++) out["bottle" + (i + 1) + "Colour"] = pick(cfg[i]);
      return out;
    }
    return { selectedColour: pick(cfg) };
  }

  function addItem(product, cfg, qty) {
    if (!isComplete(product, cfg)) return false;
    var api = window.__iniarepublicCart;
    if (!api || !api.state || !api.state.cart || !api.addItem) return false;

    var item = {
      id: product.id,
      name: product.title,
      shade: configShade(product, cfg),
      price: product.price,
      qty: qty || 1,
      img: product.cover,
      size: product.size,
      configType: product.configType,
      config: configPayload(product, cfg),
      salePrice: product.price,
      originalPrice: product.originalPrice
    };

    return api.addItem(item);
  }

  function proceedToCheckout() {
    var api = window.__iniarepublicCart;
    if (api && api.openCart) api.openCart();
    else {
      var btn = document.getElementById("cart-toggle-btn");
      if (btn) btn.click();
    }
  }

  window.__iniarepublicShop.cart = {
    isComplete: isComplete,
    validationMessage: validationMessage,
    configShade: configShade,
    configPayload: configPayload,
    addItem: addItem,
    proceedToCheckout: proceedToCheckout
  };
})();
