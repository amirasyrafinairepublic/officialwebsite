/* ==========================================================================
   INAI REPUBLIC — SHOP SELECTORS
   ColourSelector (single) / ComboColourSelector / QuantitySelector.
   Depends on js/shop-data.js + js/shop.js (ui namespace).
   ========================================================================== */
(function () {
  "use strict";
  var SHOP = window.__iniarepublicShop;
  if (!SHOP || !SHOP.ui) return;
  var el = SHOP.ui.el;
  var state = SHOP.ui.state;

  function markSelection(strip, colourId) {
    var list = strip.querySelectorAll(".sd-swatch");
    for (var i = 0; i < list.length; i++) {
      var on = list[i].getAttribute("data-colour") === colourId;
      list[i].classList.toggle("is-selected", on);
      list[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function buildStrip(colours, selectedId, onPick) {
    var strip = el("div", { className: "sd-strip", role: "radiogroup", "aria-label": "Pilihan warna" });
    colours.forEach(function (c) {
      var sw = SHOP.ui.buildSwatch(c, c.id === selectedId);
      sw.addEventListener("click", function () { onPick(c.id, strip); });
      strip.appendChild(sw);
    });
    return strip;
  }

  /* ColourSelector — single product: one independent selection. */
  function buildSingle(product, onPick) {
    var colours = SHOP.resolveColours(product);
    var box = el("div", { className: "sd-selector" });

    var head = el("div", { className: "sd-selector-head" });
    head.appendChild(el("span", { className: "sd-selector-label", text: "Colour" }));
    head.appendChild(el("span", { className: "sd-selector-hint", text: colours.length + " warna tersedia" }));
    box.appendChild(head);

    var message, nameOut;
    var strip = buildStrip(colours, state.selected, function (id, s) {
      state.selected = id;
      markSelection(s, id);
      nameOut.textContent = SHOP.ui.colourName(colours, id);
      message.textContent = "";
      message.classList.remove("is-visible");
      if (onPick) onPick(id, "selected");
    });
    box.appendChild(strip);

    var row = el("p", { className: "sd-selected" });
    row.appendChild(el("span", { className: "sd-selected-label", text: "Selected:" }));
    nameOut = el("strong", { className: "sd-selected-name", text: SHOP.ui.colourName(colours, state.selected) });
    row.appendChild(nameOut);
    box.appendChild(row);

    message = el("p", { className: "sd-validation", role: "status" });
    box.appendChild(message);

    return box;
  }

  /* ComboColourSelector — one independent row per bottle.
     Combo N×: "Colour 1..N" — mix: "200ml Colour" / "300ml Colour".
     Repeated colours are allowed (no uniqueness enforced). */
  function buildCombo(product, onPick) {
    var box = el("div", { className: "sd-selector sd-selector--combo" });
    var isMix = product.configType === "mix";
    var count = product.numberOfSelections;
    var labels = [];
    if (isMix) {
      labels = ["200ml Colour", "300ml Colour"];
    } else {
      for (var i = 1; i <= count; i++) labels.push("Colour " + i);
    }

    var head = el("div", { className: "sd-selector-head" });
    head.appendChild(el("span", { className: "sd-selector-label", text: "Colour" }));
    head.appendChild(el("span", { className: "sd-selector-hint", text: "Setiap botol dipilih secara bebas" }));
    box.appendChild(head);

    function getSel(index) {
      return isMix ? (index === 0 ? state.mix.a : state.mix.b) : state.combo[index];
    }
    function setSel(index, id) {
      if (isMix) {
        if (index === 0) state.mix.a = id;
        else state.mix.b = id;
      } else {
        state.combo[index] = id;
      }
    }

    var message = el("p", { className: "sd-validation", role: "status" });

    labels.forEach(function (labelText, index) {
      var row = el("fieldset", { className: "sd-combo-row" });
      row.appendChild(el("legend", { className: "sd-combo-legend", text: labelText }));

      var rowColours = SHOP.coloursForRow(product, isMix && index === 1 ? "b" : "a");
      var nameOut;
      var strip = buildStrip(rowColours, getSel(index), function (id, s) {
        setSel(index, id);
        markSelection(s, id);
        nameOut.textContent = SHOP.ui.colourName(rowColours, id);
        message.textContent = "";
        message.classList.remove("is-visible");
        if (onPick) onPick(id, isMix ? (index === 0 ? "a" : "b") : String(index));
      });
      row.appendChild(strip);

      var sel = el("p", { className: "sd-selected sd-selected--row" });
      sel.appendChild(el("span", { className: "sd-selected-label", text: "Selected:" }));
      nameOut = el("strong", { className: "sd-selected-name", text: SHOP.ui.colourName(rowColours, getSel(index)) });
      sel.appendChild(nameOut);
      row.appendChild(sel);

      box.appendChild(row);
    });

    box.appendChild(message);
    return box;
  }

  /* QuantitySelector — − / value / +, max 20. */
  function buildQuantity(onChange) {
    var wrap = el("div", { className: "sd-qty" });
    var dec = el("button", { className: "sd-qty-btn", type: "button", text: "\u2212", "aria-label": "Kurangkan kuantiti" });
    var out = el("output", { className: "sd-qty-value", text: String(state.qty) });
    var inc = el("button", { className: "sd-qty-btn", type: "button", text: "+", "aria-label": "Tambah kuantiti" });

    dec.addEventListener("click", function () {
      if (state.qty > 1) {
        state.qty -= 1;
        out.textContent = String(state.qty);
        if (onChange) onChange(state.qty);
      }
    });
    inc.addEventListener("click", function () {
      if (state.qty < 20) {
        state.qty += 1;
        out.textContent = String(state.qty);
        if (onChange) onChange(state.qty);
      }
    });

    wrap.appendChild(el("span", { className: "sd-qty-label", text: "Quantity" }));
    wrap.appendChild(dec);
    wrap.appendChild(out);
    wrap.appendChild(inc);
    return wrap;
  }

  window.__iniarepublicShop.selectors = {
    buildSingle: buildSingle,
    buildCombo: buildCombo,
    buildQuantity: buildQuantity
  };
})();
