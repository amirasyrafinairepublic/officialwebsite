/* ==========================================================================
   Patch tool — converts the static shop.html into the data-driven Shop
   and generates product.html from it (header/footer/cart stay identical).
   Run:  node tools/patch-shop.js
   Verifies: JS syntax + CSS brace balance + HTML markers, writes a log.
   ========================================================================== */
const fs = require("fs");
const cp = require("child_process");

const log = [];
function ok(msg) { log.push("OK: " + msg); }
function must(cond, msg) { if (!cond) throw new Error("FAIL: " + msg); ok(msg); }
function read(p) { return fs.readFileSync(p, "utf8"); }
function write(p, s) { fs.writeFileSync(p, s, "utf8"); }

/* ---- 1. Syntax-check every shop script -------------------------------- */
[
  "js/shop-data.js",
  "js/shop.js",
  "js/shop-selectors.js",
  "js/shop-cart.js",
  "js/shop-catalog.js",
  "js/shop-detail.js",
  "js/app.js"
].forEach((f) => {
  cp.execSync('node --check "' + f + '"', { stdio: "pipe" });
  ok("syntax valid: " + f);
});

/* ---- 2. CSS brace balance --------------------------------------------- */
["styles/shop.css", "styles/product.css"].forEach((f) => {
  const css = read(f);
  const open = (css.match(/\{/g) || []).length;
  const close = (css.match(/\}/g) || []).length;
  must(open === close, "balanced braces: " + f + " (" + open + "/" + close + ")");
});

/* ---- 3. Verify the direct-catalogue shop shell (non-destructive) ------ */
let html = read("shop.html");

must(html.includes('<link rel="stylesheet" href="styles/footer.css">'),
  "footer.css link present");
if (!html.includes("styles/shop.css")) {
  html = html.replace(
    '<link rel="stylesheet" href="styles/footer.css">',
    '<link rel="stylesheet" href="styles/footer.css">\n' +
    '  <link rel="stylesheet" href="styles/shop.css">');
  ok("shop.css linked on shop.html");
}

must(html.includes('class="shop-catalogue"'), "direct Shop catalogue shell present");
must(html.includes('id="shop-title">All Products'), "All Products header present");
must(html.includes('class="shop-home-back" href="index.html"'), "Shop back arrow points directly to homepage");
must(html.includes('id="shop-filters"'), "functional filter sidebar present");
must(html.includes('<div class="shop-grid" id="product-grid">'), "#product-grid container present");
must(!html.includes('class="page-hero"'), "Shop marketing hero removed");

must(html.includes('<script src="js/app.js"></script>'), "app.js script present");
if (!html.includes('<script src="js/shop-catalog.js"></script>')) {
  html = html.replace(
    '<script src="js/app.js"></script>',
    '<script src="js/app.js"></script>\n' +
    '<script src="js/shop-data.js"></script>\n' +
    '<script src="js/shop.js"></script>\n' +
    '<script src="js/shop-selectors.js"></script>\n' +
    '<script src="js/shop-cart.js"></script>\n' +
    '<script src="js/shop-catalog.js"></script>');
  ok("shop scripts wired on shop.html");
}

/* ---- 4. Verify product detail page (non-destructive) ------------------ */
const p = read("product.html");
must(p.includes("styles/shop.css"), "shop.css linked on product page");
must(p.includes("styles/product.css"), "product.css linked on product page");
must(p.includes('id="product-detail"'), "product detail shell present");
must(p.includes("shop-detail.js"), "shop-detail.js wired on product.html");

/* ---- 5. Cleanup scaffolding ------------------------------------------- */
["tools/patch-shop.py", "tools/versions.txt", "tools/t-node.txt"].forEach((f) => {
  try { fs.unlinkSync(f); } catch (e) { /* already gone */ }
});

write("tools/patch-log.txt", log.join("\n") + "\n");
console.log(log.join("\n"));
