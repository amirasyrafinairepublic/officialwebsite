/* ==========================================================================
   INAI REPUBLIC — SHOP SMOKE TEST (node tools/smoke-test.js)
   Runs the real shop scripts inside a minimal DOM via node:vm and verifies
   catalogue, gallery, colour selection, combo/mix logic, validation and
   cart payload. Writes tools/smoke-log.txt.
   ========================================================================== */
const fs = require("fs");
const vm = require("vm");

/* ---------- Minimal DOM ------------------------------------------------- */
function matches(el, sel) {
  if (!el || !el.tagName) return false;
  sel = sel.trim();
  if (sel.charAt(0) === ".") return el.classList.contains(sel.slice(1));
  if (sel.charAt(0) === "#") return el.getAttribute("id") === sel.slice(1);
  return el.tagName === sel.toUpperCase();
}

function descendants(root) {
  const out = [];
  (function walk(n) {
    (n.childNodes || []).forEach((c) => { out.push(c); walk(c); });
  })(root);
  return out;
}

function query(root, sel) {
  const parts = sel.trim().split(/\s+/);
  let current = descendants(root).filter((e) => matches(e, parts[0]));
  for (let i = 1; i < parts.length; i++) {
    const next = [];
    current.forEach((e) => descendants(e).forEach((d) => {
      if (matches(d, parts[i]) && next.indexOf(d) === -1) next.push(d);
    }));
    current = next;
  }
  return current;
}

class El {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.childNodes = [];
    this.parentNode = null;
    this.attrs = {};
    this._text = "";
    this._raw = "";
    this.className = "";
    this.listeners = {};
  }
  setAttribute(k, v) {
    if (k === "class") this.className = String(v);
    else this.attrs[k] = String(v);
  }
  getAttribute(k) {
    if (k === "class") return this.className || null;
    return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null;
  }
  appendChild(c) {
    if (c.parentNode) c.parentNode.removeChild(c);
    c.parentNode = this;
    this.childNodes.push(c);
    return c;
  }
  removeChild(c) {
    this.childNodes = this.childNodes.filter((x) => x !== c);
    c.parentNode = null;
  }
  get classList() {
    const self = this;
    const list = () => self.className.split(/\s+/).filter(Boolean);
    return {
      add(c) { const l = list(); if (l.indexOf(c) === -1) l.push(c); self.className = l.join(" "); },
      remove(c) { self.className = list().filter((x) => x !== c).join(" "); },
      contains(c) { return list().indexOf(c) !== -1; },
      toggle(c, force) {
        const has = list().indexOf(c) !== -1;
        const want = force === undefined ? !has : !!force;
        if (want) this.add(c); else this.remove(c);
        return want;
      }
    };
  }
  set textContent(v) { this._text = String(v); this.childNodes = []; }
  get src() { return this.getAttribute("src") || ""; }
  set src(v) { this.setAttribute("src", v); }
  get alt() { return this.getAttribute("alt") || ""; }
  set alt(v) { this.setAttribute("alt", v); }
  get textContent() {
    if (this._text) return this._text;
    return this.childNodes.map((c) => c.textContent).join("");
  }
  set innerHTML(v) { this._text = ""; this._raw = String(v); this.childNodes = []; }
  get innerHTML() { return this._raw; }
  addEventListener(type, fn) {
    (this.listeners[type] || (this.listeners[type] = [])).push(fn);
  }
  dispatch(type, evt) {
    const e = evt && evt.target ? evt : { target: this };
    let n = this;
    while (n) {
      (n.listeners[type] || []).forEach((fn) => fn(e));
      n = n.parentNode;
    }
  }
  click() { this.dispatch("click"); }
  focus() { /* recorded no-op */ }
  closest(sel) {
    let n = this;
    while (n) { if (matches(n, sel)) return n; n = n.parentNode; }
    return null;
  }
  querySelector(sel) { return query(this, sel)[0] || null; }
  querySelectorAll(sel) { return query(this, sel); }
}

class Doc {
  constructor() {
    this.body = new El("body");
    this.title = "";
    this._listeners = {};
  }
  createElement(t) { return new El(t); }
  addEventListener(type, fn) {
    (this._listeners[type] || (this._listeners[type] = [])).push(fn);
  }
  fire(type) { (this._listeners[type] || []).forEach((fn) => fn()); }
  getElementById(id) { return this.querySelector("#" + id); }
  querySelector(sel) { return query(this.body, sel)[0] || null; }
  querySelectorAll(sel) { return query(this.body, sel); }
}

/* ---------- Page loader -------------------------------------------------- */
const ALL = ["js/shop-data.js", "js/shop.js", "js/shop-selectors.js", "js/shop-cart.js"];
const CATALOG_FILES = ALL.concat(["js/shop-catalog.js"]);
const DETAIL_FILES = ALL.concat(["js/shop-detail.js"]);

function makePage(search, files, withGrid) {
  const doc = new Doc();
  const win = { document: doc, location: { search: search || "" } };
  const cart = {
    state: { cart: [] },
    renderCalls: 0,
    openCalls: 0,
    renderCart: function () { this.renderCalls += 1; },
    openCart: function () { this.openCalls += 1; },
    /* Mirrors js/app.js addPersistentItem(): line identity is
       id + "::" + JSON.stringify(config), so a changed colour config is a
       NEW line while an identical re-add merges quantity. */
    addItem: function (item) {
      var next = Object.assign({}, item, { qty: Number(item.qty || 1) });
      if (!next.lineKey) next.lineKey = next.id + "::" + JSON.stringify(next.config || null);
      var existing = null;
      for (var i = 0; i < this.state.cart.length; i++) {
        if (this.state.cart[i].lineKey === next.lineKey) existing = this.state.cart[i];
      }
      if (existing) {
        var mergedQty = Number(existing.qty || 0) + next.qty;
        for (var key in next) {
          if (key !== "qty") existing[key] = next[key];
        }
        existing.qty = mergedQty;
      } else {
        this.state.cart.push(next);
      }
      this.renderCart();
      return true;
    }
  };
  win.__iniarepublicCart = cart;

  let sub = null;
  let grid = null;
  if (withGrid) {
    const katalog = doc.createElement("section");
    katalog.setAttribute("id", "katalog");
    sub = doc.createElement("span");
    sub.className = "section-sub";
    sub.textContent = "SEMUA PRODUK \u2022 6 ITEM";
    katalog.appendChild(sub);
    grid = doc.createElement("div");
    grid.className = "shop-grid";
    grid.setAttribute("id", "product-grid");
    katalog.appendChild(grid);
    doc.body.appendChild(katalog);
  } else {
    const shell = doc.createElement("div");
    shell.setAttribute("id", "product-detail");
    doc.body.appendChild(shell);
  }

  const ctx = vm.createContext({
    window: win,
    document: doc,
    URLSearchParams: URLSearchParams,
    encodeURIComponent: encodeURIComponent,
    console: console,
    alert: function () {}
  });
  files.forEach((f) => {
    vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  });
  doc.fire("DOMContentLoaded");
  return { doc: doc, win: win, cart: cart, sub: sub, grid: grid };
}

/* ---------- Assertions --------------------------------------------------- */
const lines = [];
let passed = 0;
let failed = 0;
function check(name, cond, extra) {
  if (cond) { passed += 1; lines.push("PASS: " + name); }
  else { failed += 1; lines.push("FAIL: " + name + (extra ? " | " + extra : "")); }
}
function buttons(root, label) {
  return root.querySelectorAll("button").filter((b) => b.textContent === label);
}
function swatchById(root, id) {
  return root.querySelectorAll(".sd-swatch")
    .filter((s) => s.getAttribute("data-colour") === id)[0] || null;
}

/* ---------- Expected catalogue ------------------------------------------ */
const EXPECT = [
  { id: "p1", title: "Henna Hair Colour 200ml", sale: 49, orig: 69, colours: 12 },
  { id: "p2", title: "Henna Hair Colour 300ml", sale: 65, orig: 120, colours: 6 },
  { id: "p3", title: "Henna Hair Colour 300ml (Tutup Uban)", sale: 65, orig: 120, colours: 2 },
  { id: "p4", title: "Combo 2x Henna Hair Colour 200ml", sale: 98, orig: 138, colours: 12 },
  { id: "p5", title: "Combo 3x Henna Hair Colour 200ml", sale: 135, orig: 207, colours: 12 },
  { id: "p6", title: "Combo Jumbo Henna Hair Colour 300ml", sale: 114, orig: 190, colours: 8 },
  { id: "p7", title: "Mix Jumbo Henna Hair Colour 200ml & 300ml", sale: 110, orig: 189, colours: 12 }
];

/* ---------- TEST 1: catalog grid ---------------------------------------- */
(function () {
  const page = makePage("", CATALOG_FILES, true);
  const cards = page.grid.querySelectorAll(".sd-card");
  check("catalog renders 7 product cards", cards.length === 7, "got " + cards.length);

  cards.forEach((card, i) => {
    const e = EXPECT[i];
    const title = card.querySelector(".sd-card-title");
    check("card " + (i + 1) + " title: " + e.title,
      !!title && title.textContent === e.title,
      title ? "got " + title.textContent : "missing");
    const sale = card.querySelector(".sd-price-sale");
    check("card " + (i + 1) + " sale RM " + e.sale.toFixed(2),
      !!sale && sale.textContent === "RM " + e.sale.toFixed(2),
      sale ? sale.textContent : "missing");
    const orig = card.querySelector(".sd-price-original");
    check("card " + (i + 1) + " original RM " + e.orig.toFixed(2),
      !!orig && orig.textContent === "RM " + e.orig.toFixed(2),
      orig ? orig.textContent : "missing");
    const col = card.querySelector(".sd-card-colours");
    check("card " + (i + 1) + " shows " + e.colours + " Colours",
      !!col && col.textContent === e.colours + " Colours",
      col ? col.textContent : "missing");
    const cta = card.querySelector(".sd-card-actions a");
    check("card " + (i + 1) + " links to product detail",
      !!cta && cta.getAttribute("href") === "product.html?product=" + e.id,
      cta ? cta.getAttribute("href") : "missing");
    const img = card.querySelector(".sd-card-img");
    check("card " + (i + 1) + " has product image",
      !!img && /^https:\/\/inairepublic\.com\//.test(img.getAttribute("src") || ""),
      img ? img.getAttribute("src") : "missing");
  });

  check("catalogue source contains 7 products", EXPECT.length === 7);
})();

/* ---------- TEST 2: single-product detail (p1) --------------------------- */
(function () {
  const page = makePage("?product=p1", DETAIL_FILES, false);
  const root = page.doc.getElementById("product-detail");
  check("detail renders content", root.childNodes.length > 0);
  const title = root.querySelector(".pd-title");
  check("p1 detail title", !!title && title.textContent === "Henna Hair Colour 200ml",
    title ? "got " + title.textContent : "missing");
  const sale = root.querySelector(".sd-price-sale");
  check("p1 detail sale price RM 49.00", !!sale && sale.textContent === "RM 49.00",
    sale ? sale.textContent : "missing");
  const orig = root.querySelector(".sd-price-original");
  check("p1 detail original price RM 69.00", !!orig && orig.textContent === "RM 69.00",
    orig ? orig.textContent : "missing");
  const swatches = root.querySelectorAll(".sd-swatch");
  check("p1 shows 12 colour swatches", swatches.length === 12, "got " + swatches.length);
  check("p1 uses single selector (no combo rows)",
    !!root.querySelector(".sd-selector") && !root.querySelector(".sd-selector--combo"));
  const selName = root.querySelector(".sd-selected-name");
  check("p1 selected colour empty initially", !!selName && selName.textContent === "");

  const add = buttons(root, "ADD TO CART")[0];
  const buy = buttons(root, "BUY NOW")[0];
  check("ADD TO CART button present", !!add);
  check("BUY NOW button present", !!buy);

  add.click();
  const val = root.querySelector(".sd-validation");
  check("single validation message text",
    !!val && val.textContent === "Please select your colour.",
    val ? val.textContent : "missing");
  check("validation visibly marked", !!val && val.classList.contains("is-visible"));
  check("incomplete selection blocked from cart", page.cart.state.cart.length === 0,
    "cart len " + page.cart.state.cart.length);

  const sw = swatchById(root, "coco-black");
  check("coco-black swatch exists", !!sw);
  sw.click();
  check("selected name shows Coco Black",
    root.querySelector(".sd-selected-name").textContent === "Coco Black");
  check("swatch gets selected state + aria",
    sw.classList.contains("is-selected") && sw.getAttribute("aria-pressed") === "true");
  const other = swatchById(root, "honey-brown");
  check("other swatch stays unselected", !!other && !other.classList.contains("is-selected"));
  check("validation clears on selection", root.querySelector(".sd-validation").textContent === "");

  add.click();
  check("item added to cart after selection", page.cart.state.cart.length === 1,
    "cart len " + page.cart.state.cart.length);
  const item = page.cart.state.cart[0] || {};
  check("cart item id", item.id === "p1");
  check("cart item name", item.name === "Henna Hair Colour 200ml");
  check("cart item shade shows colour", item.shade === "Colour: Coco Black", item.shade);
  check("cart item preserves selectedColour config",
    !!item.config && !!item.config.selectedColour && item.config.selectedColour.name === "Coco Black");
  check("cart item price", item.price === 49);
  check("cart item original price", item.originalPrice === 69);
  check("cart item size", item.size === "200ml");
  check("cart item qty", item.qty === 1);
  check("cart drawer re-rendered", page.cart.renderCalls > 0);
  const note = root.querySelector(".pd-cta-note");
  check("add-to-cart confirmation note",
    !!note && note.textContent.indexOf("Ditambah ke troli") === 0,
    note ? note.textContent : "missing");

  /* quantity selector */
  const inc = root.querySelectorAll("button")
    .filter((b) => b.getAttribute("aria-label") === "Tambah kuantiti")[0];
  check("quantity + button present", !!inc);
  inc.click();
  inc.click();
  check("quantity increments to 3",
    root.querySelector(".sd-qty-value").textContent === "3",
    root.querySelector(".sd-qty-value").textContent);
  add.click();
  check("re-add merges quantity into same cart item",
    page.cart.state.cart.length === 1 && page.cart.state.cart[0].qty === 4,
    "len " + page.cart.state.cart.length + " qty " + page.cart.state.cart[0].qty);
})();

/* ---------- TEST 3: Buy Now ---------------------------------------------- */
(function () {
  const page = makePage("?product=p1", DETAIL_FILES, false);
  const root = page.doc.getElementById("product-detail");
  swatchById(root, "coco-black").click();
  buttons(root, "BUY NOW")[0].click();
  check("buy now adds configured item", page.cart.state.cart.length === 1,
    "cart len " + page.cart.state.cart.length);
  check("buy now opens the cart drawer", page.cart.openCalls === 1,
    "openCalls " + page.cart.openCalls);

  const page2 = makePage("?product=p1", DETAIL_FILES, false);
  const root2 = page2.doc.getElementById("product-detail");
  buttons(root2, "BUY NOW")[0].click();
  check("buy now blocked without colour", page2.cart.state.cart.length === 0);
  check("buy now shows validation",
    root2.querySelector(".sd-validation").textContent === "Please select your colour.");
})();

/* ---------- TEST 4: product gallery -------------------------------------- */
(function () {
  const page = makePage("?product=p1", DETAIL_FILES, false);
  const root = page.doc.getElementById("product-detail");
  const thumbs = root.querySelectorAll(".pd-gallery-thumb");
  check("p1 gallery includes cover, information and 12 colour posters", thumbs.length === 18, "got " + thumbs.length);
  const img = root.querySelector(".pd-gallery-img");
  const src0 = img.getAttribute("src");
  thumbs[1].click();
  check("thumbnail click swaps main image", img.getAttribute("src") !== src0);
  check("clicked thumbnail becomes active",
    thumbs[1].classList.contains("is-active") && !thumbs[0].classList.contains("is-active"));
  const next = root.querySelectorAll("button")
    .filter((b) => b.getAttribute("data-dir") === "1")[0];
  check("gallery next arrow present", !!next);
  const hazelnut = swatchById(root, "hazelnut");
  hazelnut.click();
  check("Hazelnut selection jumps gallery to Hazelnut poster",
    /BM-COLOUR-VARIANT-HAZELNUT-BEFORE-AFTER-ONLY\.png$/.test(img.getAttribute("src")));
  swatchById(root, "burgundy").click();
  check("Burgundy selection jumps gallery to Burgundy poster",
    /BM-COLOUR-VARIANT-BURGUNDY-BEFORE-AFTER-ONLY\.png$/.test(img.getAttribute("src")));
  swatchById(root, "ash-grey").click();
  check("Ash Grey selection jumps gallery to Ash Grey poster",
    /BM-COLOUR-VARIANT-ASH-GREY-BEFORE-AFTER-ONLY\.png$/.test(img.getAttribute("src")));
  const selectedPoster = img.getAttribute("src");
  for (let i = 0; i < 18; i++) next.click();
  check("gallery next arrow wraps through full poster gallery", img.getAttribute("src") === selectedPoster);
})();

/* ---------- TEST 5: combo 2x (p4) + duplicate colours -------------------- */
(function () {
  const page = makePage("?product=p4", DETAIL_FILES, false);
  const root = page.doc.getElementById("product-detail");
  const rows = root.querySelectorAll(".sd-combo-row");
  check("p4 has 2 combo rows", rows.length === 2, "got " + rows.length);
  const legends = root.querySelectorAll(".sd-combo-legend");
  check("p4 legends are Colour 1 / Colour 2",
    legends.length === 2 && legends[0].textContent === "Colour 1" &&
    legends[1].textContent === "Colour 2",
    legends.map((l) => l.textContent).join(","));

  buttons(root, "ADD TO CART")[0].click();
  check("combo validation message text",
    root.querySelector(".sd-validation").textContent ===
      "Please select a colour for each product.",
    root.querySelector(".sd-validation").textContent);
  check("incomplete combo blocked", page.cart.state.cart.length === 0);

  const strips = root.querySelectorAll(".sd-strip");
  check("p4 has 2 independent swatch strips", strips.length === 2, "got " + strips.length);
  swatchById(strips[0], "coco-black").click();
  swatchById(strips[1], "coco-black").click();
  check("row 1 selected", rows[0].querySelector(".sd-selected-name").textContent === "Coco Black");
  check("row 2 allows duplicate colour",
    rows[1].querySelector(".sd-selected-name").textContent === "Coco Black");
  buttons(root, "ADD TO CART")[0].click();
  let item = page.cart.state.cart[0] || {};
  check("combo item added with duplicates",
    item.shade === "Colour 1: Coco Black \u2022 Colour 2: Coco Black", item.shade);
  check("combo config preserves Bottle 1 and Bottle 2",
    !!item.config && item.config.bottle1Colour.name === "Coco Black" &&
    item.config.bottle2Colour.name === "Coco Black");

  swatchById(strips[1], "chocolate-brown").click();
  check("row 2 independent change",
    rows[1].querySelector(".sd-selected-name").textContent === "Chocolate Brown");
  check("row 1 unchanged", rows[0].querySelector(".sd-selected-name").textContent === "Coco Black");
  buttons(root, "ADD TO CART")[0].click();
  check("changed combo config creates a second variant line",
    page.cart.state.cart.length === 2, "cart len " + page.cart.state.cart.length);
  item = page.cart.state.cart[0];
  check("original variant line keeps its colour and qty",
    item.shade === "Colour 1: Coco Black \u2022 Colour 2: Coco Black" && item.qty === 1,
    item.shade + " qty " + item.qty);
  const variant2 = page.cart.state.cart[1] || {};
  check("second variant line stores the changed colour",
    variant2.shade === "Colour 1: Coco Black \u2022 Colour 2: Chocolate Brown", variant2.shade);
  check("variant lines carry distinct line keys",
    !!item.lineKey && !!variant2.lineKey && item.lineKey !== variant2.lineKey);
})();

/* ---------- TEST 6: combo 3x (p5) + Combo Jumbo (p6) --------------------- */
(function () {
  const page = makePage("?product=p5", DETAIL_FILES, false);
  const root = page.doc.getElementById("product-detail");
  const rows = root.querySelectorAll(".sd-combo-row");
  check("p5 has 3 combo rows", rows.length === 3, "got " + rows.length);
  const legends = root.querySelectorAll(".sd-combo-legend");
  check("p5 legends Colour 1..3",
    legends.length === 3 && legends[0].textContent === "Colour 1" &&
    legends[2].textContent === "Colour 3",
    legends.map((l) => l.textContent).join(","));
  const strips = root.querySelectorAll(".sd-strip");
  swatchById(strips[0], "coco-black").click();
  swatchById(strips[1], "coco-black").click();
  swatchById(strips[2], "chocolate-brown").click();
  buttons(root, "ADD TO CART")[0].click();
  const item = page.cart.state.cart[0] || {};
  check("p5 shade lists 3 colours (with duplicate)",
    item.shade === "Colour 1: Coco Black \u2022 Colour 2: Coco Black \u2022 Colour 3: Chocolate Brown",
    item.shade);
  check("p5 config preserves all three bottles", !!item.config &&
    item.config.bottle1Colour.name === "Coco Black" && item.config.bottle3Colour.name === "Chocolate Brown");

  const page2 = makePage("?product=p6", DETAIL_FILES, false);
  const root2 = page2.doc.getElementById("product-detail");
  check("p6 has exactly 2 combo rows", root2.querySelectorAll(".sd-combo-row").length === 2);
  const strips2 = root2.querySelectorAll(".sd-strip");
  check("p6 each row shows 8 colours",
    strips2.length === 2 && strips2[0].querySelectorAll(".sd-swatch").length === 8 &&
    strips2[1].querySelectorAll(".sd-swatch").length === 8,
    strips2[0] ? strips2[0].querySelectorAll(".sd-swatch").length + "" : "no strips");
  swatchById(strips2[0], "hazelnut").click();
  swatchById(strips2[1], "burgundy").click();
  buttons(root2, "ADD TO CART")[0].click();
  const item2 = page2.cart.state.cart[0] || {};
  check("p6 cart shade",
    item2.shade === "Colour 1: Hazelnut \u2022 Colour 2: Burgundy",
    item2.shade);
})();

/* ---------- TEST 7: Mix Jumbo (p7) --------------------------------------- */
(function () {
  const page = makePage("?product=p7", DETAIL_FILES, false);
  const root = page.doc.getElementById("product-detail");
  const rows = root.querySelectorAll(".sd-combo-row");
  check("p7 has 2 rows", rows.length === 2, "got " + rows.length);
  const legends = root.querySelectorAll(".sd-combo-legend");
  check("p7 legends 200ml / 300ml",
    legends.length === 2 && legends[0].textContent === "200ml Colour" &&
    legends[1].textContent === "300ml Colour",
    legends.map((l) => l.textContent).join(","));

  buttons(root, "ADD TO CART")[0].click();
  check("mix validation message text",
    root.querySelector(".sd-validation").textContent ===
      "Please select a colour for each product.",
    root.querySelector(".sd-validation").textContent);
  check("incomplete mix blocked", page.cart.state.cart.length === 0);

  const strips = root.querySelectorAll(".sd-strip");
  check("p7 has separate 200ml/300ml strips", strips.length === 2);
  swatchById(strips[0], "coco-black").click();
  buttons(root, "ADD TO CART")[0].click();
  check("one-row-only mix still blocked", page.cart.state.cart.length === 0);
  swatchById(strips[1], "chocolate-brown").click();
  buttons(root, "ADD TO CART")[0].click();
  const item = page.cart.state.cart[0] || {};
  check("mix shade shows both sizes",
    item.shade === "200ml: Coco Black \u2022 300ml: Chocolate Brown", item.shade);
  check("mix config preserves separate selected200mlColour / selected300mlColour",
    !!item.config && item.config.selected200mlColour.name === "Coco Black" &&
    item.config.selected300mlColour.name === "Chocolate Brown");
  check("300ml mix palette excludes unavailable 200ml-only shades",
    !swatchById(strips[1], "mocha-milk-tea") && !swatchById(strips[1], "olive-jade") &&
    !swatchById(strips[1], "ash-brown") && !swatchById(strips[1], "ash-grey"));
})();

/* ---------- TEST 8: every detail page — title, price, palette ------------ */
(function () {
  EXPECT.forEach((e) => {
    const page = makePage("?product=" + e.id, DETAIL_FILES, false);
    const root = page.doc.getElementById("product-detail");
    const title = root.querySelector(".pd-title");
    check(e.id + " detail title", !!title && title.textContent === e.title,
      title ? title.textContent : "missing");
    const sale = root.querySelector(".sd-price-sale");
    const orig = root.querySelector(".sd-price-original");
    check(e.id + " detail prices " + e.sale + "/" + e.orig,
      !!sale && sale.textContent === "RM " + e.sale.toFixed(2) &&
      !!orig && orig.textContent === "RM " + e.orig.toFixed(2),
      (sale ? sale.textContent : "-") + " / " + (orig ? orig.textContent : "-"));
    const strip = root.querySelectorAll(".sd-strip")[0];
    const count = strip ? strip.querySelectorAll(".sd-swatch").length : 0;
    check(e.id + " palette size " + e.colours, count === e.colours, "got " + count);
    check(e.id + " document title updated",
      page.doc.title === e.title + " | INAI REPUBLIC", page.doc.title);
  });

  /* Colour availability per spec */
  const p2 = makePage("?product=p2", DETAIL_FILES, false);
  const p2strip = p2.doc.getElementById("product-detail").querySelectorAll(".sd-strip")[0];
  check("p2 (300ml) excludes coco-black",
    !swatchById(p2strip, "coco-black") && !!swatchById(p2strip, "honey-brown"));

  const p3 = makePage("?product=p3", DETAIL_FILES, false);
  const p3root = p3.doc.getElementById("product-detail");
  check("p3 (Tutup Uban) shows exactly Coco Black + Chocolate Brown",
    !!swatchById(p3root, "coco-black") && !!swatchById(p3root, "chocolate-brown") &&
    p3root.querySelectorAll(".sd-swatch").length === 2);

  /* Fallback when product id is unknown */
  const fb = makePage("?product=nope", DETAIL_FILES, false);
  const fbTitle = fb.doc.getElementById("product-detail").querySelector(".pd-title");
  check("unknown id falls back to first product",
    !!fbTitle && fbTitle.textContent === EXPECT[0].title,
    fbTitle ? fbTitle.textContent : "missing");
})();

/* ---------- TEST 9: cart line identity + persistence (bug regression) ---- */
(function () {
  const page = makePage("?product=p1", DETAIL_FILES, false);
  const root = page.doc.getElementById("product-detail");

  /* Same product + same colour must merge into ONE line. */
  swatchById(root, "coco-black").click();
  buttons(root, "ADD TO CART")[0].click();
  const firstKey = page.cart.state.cart[0].lineKey;
  swatchById(root, "coco-black").click();
  buttons(root, "ADD TO CART")[0].click();
  check("identical variant re-add stays on one line",
    page.cart.state.cart.length === 1 && page.cart.state.cart[0].qty === 2,
    "len " + page.cart.state.cart.length + " qty " + (page.cart.state.cart[0] || {}).qty);
  check("line key is stable across an identical re-add",
    page.cart.state.cart[0].lineKey === firstKey, page.cart.state.cart[0].lineKey);

  /* Same product + different colour must NOT overwrite the first line. */
  swatchById(root, "honey-brown").click();
  buttons(root, "ADD TO CART")[0].click();
  check("different colour adds a second line (no overwrite)",
    page.cart.state.cart.length === 2, "cart len " + page.cart.state.cart.length);
  check("first line still keeps Coco Black",
    page.cart.state.cart[0].shade === "Colour: Coco Black", page.cart.state.cart[0].shade);
  check("second line holds Honey Brown",
    (page.cart.state.cart[1] || {}).shade === "Colour: Honey Brown",
    (page.cart.state.cart[1] || {}).shade);
  check("every cart line carries a line key",
    page.cart.state.cart.every((i) => typeof i.lineKey === "string" && i.lineKey.length > 0));
  check("cart re-rendered once per mutation", page.cart.renderCalls === 3,
    "renderCalls " + page.cart.renderCalls);

  /* String quantities (the reported corrupt-payload case) must not break math. */
  page.win.__iniarepublicCart.addItem({
    id: "p1",
    name: "Henna Hair Colour 200ml",
    shade: "Colour: Coco Black",
    price: 49,
    qty: "3",
    config: { selectedColour: { id: "coco-black", name: "Coco Black" } }
  });
  const merged = page.cart.state.cart[0];
  check("string qty payload merges numerically",
    merged.qty === 5, "qty " + merged.qty + " (" + typeof merged.qty + ")");
})();

/* ---------- TEST 10: js/app.js persistent store (survives a refresh) ----- */
(function () {
  const storage = { data: {} };
  const fakeStorage = {
    getItem: function (k) {
      return Object.prototype.hasOwnProperty.call(storage.data, k) ? storage.data[k] : null;
    },
    setItem: function (k, v) { storage.data[k] = String(v); },
    removeItem: function (k) { delete storage.data[k]; }
  };

  function bootApp() {
    const doc = new Doc();
    ["cart-items-container", "cart-counter", "cart-items-count", "cart-total-display",
      "checkout-btn", "cart-backdrop", "cart-toggle-btn", "cart-close-btn", "koleksi-dropdown"]
      .forEach((id) => {
        const node = doc.createElement("div");
        node.setAttribute("id", id);
        doc.body.appendChild(node);
      });
    const win = {
      document: doc,
      location: { search: "" },
      localStorage: fakeStorage,
      scrollY: 0,
      addEventListener: function () { /* scroll listener recorded no-op */ }
    };
    const ctx = vm.createContext({
      window: win,
      document: doc,
      URLSearchParams: URLSearchParams,
      encodeURIComponent: encodeURIComponent,
      console: console,
      alert: function () {}
    });
    vm.runInContext(fs.readFileSync("js/app.js", "utf8"), ctx, { filename: "js/app.js" });
    doc.fire("DOMContentLoaded");
    return { doc: doc, win: win, api: win.__iniarepublicCart };
  }

  const total = (page) => page.doc.getElementById("cart-total-display").textContent;

  const page1 = bootApp();
  check("app.js exposes the persistent cart store",
    !!(page1.api && page1.api.state && page1.api.addItem && page1.api.lineKey));
  check("fresh cart starts empty", page1.api.state.cart.length === 0);
  check("empty cart disables checkout",
    page1.doc.getElementById("checkout-btn").disabled === true);

  page1.api.addItem({ id: "p1", name: "Henna Hair Colour 200ml", shade: "Colour: Coco Black", price: 49, qty: 2 });
  check("quick add writes exactly one line", page1.api.state.cart.length === 1);
  check("line receives a deterministic key",
    page1.api.state.cart[0].lineKey === "p1::null", page1.api.state.cart[0].lineKey);
  check("badge and drawer count show 2 items",
    page1.doc.getElementById("cart-counter").textContent === "2" &&
    page1.doc.getElementById("cart-items-count").textContent === "2",
    page1.doc.getElementById("cart-counter").textContent);
  check("subtotal renders guarded maths", total(page1) === "RM 98.00", total(page1));
  check("filled cart enables checkout",
    page1.doc.getElementById("checkout-btn").disabled === false);
  check("cart is persisted to localStorage",
    JSON.parse(storage.data.inaiRepublicCart || "[]").length === 1);

  page1.api.addItem({ id: "p1", name: "Henna Hair Colour 200ml", shade: "Colour: Coco Black", price: 49, qty: "3" });
  check("string qty merges into the same line",
    page1.api.state.cart.length === 1 && page1.api.state.cart[0].qty === 5,
    "len " + page1.api.state.cart.length + " qty " + (page1.api.state.cart[0] || {}).qty);
  check("string qty cannot corrupt the subtotal", total(page1) === "RM 245.00", total(page1));

  page1.api.addItem({
    id: "p1",
    name: "Henna Hair Colour 200ml",
    shade: "Colour: Honey Brown",
    price: 49,
    config: { selectedColour: { id: "honey-brown", name: "Honey Brown" } }
  });
  check("a different variant stays a separate line", page1.api.state.cart.length === 2,
    "len " + page1.api.state.cart.length);

  /* Simulated refresh — a brand-new page load sharing the same localStorage. */
  const page2 = bootApp();
  check("cart survives a page refresh", page2.api.state.cart.length === 2,
    "len " + page2.api.state.cart.length);
  check("rehydrated lines keep keys and quantities",
    page2.api.state.cart[0].lineKey === "p1::null" && page2.api.state.cart[0].qty === 5 &&
    typeof page2.api.state.cart[1].lineKey === "string",
    page2.api.state.cart.map((i) => i.lineKey + " x" + i.qty).join(" | "));
  check("badge is repainted from storage on load",
    page2.doc.getElementById("cart-counter").textContent === "6",
    page2.doc.getElementById("cart-counter").textContent);
  check("subtotal is repainted from storage on load", total(page2) === "RM 294.00", total(page2));

  /* Legacy payloads: parked demo lines are purged and string quantities are
     coerced so the drawer can never render NaN. */
  storage.data.inaiRepublicCart = JSON.stringify([
    { id: "demo-signature-hhc", name: "Signature Henna Hair Colour 300ml", price: 89, qty: 1 },
    { id: "p1", name: "Henna Hair Colour 200ml", shade: "Colour: Coco Black", price: 49, qty: "2" }
  ]);
  const page3 = bootApp();
  check("parked demo cart lines are purged on load",
    page3.api.state.cart.length === 1 && page3.api.state.cart[0].id === "p1",
    "len " + page3.api.state.cart.length);
  check("legacy line without config still receives a key",
    page3.api.state.cart[0].lineKey === "p1::null", page3.api.state.cart[0].lineKey);
  check("legacy string qty still totals correctly", total(page3) === "RM 98.00", total(page3));
})();

/* ---------- Summary ------------------------------------------------------ */
lines.push("");
lines.push("TOTAL: " + passed + " passed, " + failed + " failed");
fs.writeFileSync("tools/smoke-log.txt", lines.join("\n") + "\n", "utf8");
console.log(lines.join("\n"));
if (failed > 0) process.exit(1);

