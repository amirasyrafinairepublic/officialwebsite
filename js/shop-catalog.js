/* ==========================================================================
   INAI REPUBLIC — SHOP CATALOG RENDER (shop.html)
   Fills the product grid from js/shop-data.js — the 7-product catalogue.
   ========================================================================== */
(function () {
  "use strict";
  var SHOP = window.__iniarepublicShop;
  if (!SHOP) return;

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("product-grid");
    if (!grid || !SHOP.ui) return;
    var category = document.getElementById("shop-category-filter");
    var sort = document.getElementById("shop-sort-filter");
    var clear = document.getElementById("shop-clear-filters");
    var count = document.getElementById("shop-product-count");
    var empty = document.getElementById("shop-empty");
    var toggle = document.getElementById("shop-filter-toggle");
    var filters = document.getElementById("shop-filters");

    function render() {
      var items = SHOP.products.filter(function (product) {
        return !category || category.value === "all" || product.configType === category.value;
      });
      if (sort) {
        items.sort(function (a, b) {
          if (sort.value === "price-low") return a.price - b.price;
          if (sort.value === "price-high") return b.price - a.price;
          if (sort.value === "name") return a.title.localeCompare(b.title);
          return SHOP.products.indexOf(a) - SHOP.products.indexOf(b);
        });
      }
      grid.innerHTML = "";
      items.forEach(function (product) { grid.appendChild(SHOP.ui.buildCard(product)); });
      if (count) count.textContent = items.length + (items.length === 1 ? " product" : " products");
      if (empty) empty.hidden = items.length !== 0;
    }
    if (category) category.addEventListener("change", render);
    if (sort) sort.addEventListener("change", render);
    if (clear) clear.addEventListener("click", function () { category.value = "all"; sort.value = "featured"; render(); });
    if (toggle && filters) toggle.addEventListener("click", function () {
      var expanded = filters.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
    render();
  });
})();
