/* ==========================================================================
   INAI REPUBLIC — SHOP PRODUCT CATALOGUE
   Data-driven product definitions derived from shop-design.md.
   --------------------------------------------------------------------------
   Each product is defined once and reused by:
     - shop.html      (product listing / cards)
     - product.html   (product detail page)
   No colour image is hardcoded twice: the Colour Studio assets live in
   js/colour-studio.js and are reused here by reference.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Colour Studio assets (master 12 shades, order per js/colour-studio.js).
     Image URLs are the existing INAI REPUBLIC Colour Studio hair assets.
     ------------------------------------------------------------------------ */
  var COLOUR_STUDIO_SHADES = [
    { id: "honey-brown",    name: "Honey Brown",    image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-HONEY-BROWN.png" },
    { id: "chocolate-brown", name: "Chocolate Brown", image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-CHOCOLATE-BROWN.png" },
    { id: "coco-black",     name: "Coco Black",     image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-COCO-BLACK.png" },
    { id: "mocha-milk-tea", name: "Mocha Milk Tea", image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-MOCHA-MILK-TEA.png" },
    { id: "hazelnut",       name: "Hazelnut",       image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-HAZELNUT.png" },
    { id: "royal-chestnut", name: "Royal Chestnut", image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-ROYAL-CHESTNUT.png" },
    { id: "persian-red",    name: "Persian Red",    image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-PERSIAN-RED.png" },
    { id: "caramel-gold",   name: "Caramel Gold",   image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-CARAMEL-GOLD.png" },
    { id: "olive-jade",     name: "Olive Jade",     image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-OLIVE-JADE.png" },
    { id: "burgundy",       name: "Burgundy",       image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-BURGUNDY.png" },
    { id: "ash-brown",      name: "Ash Brown",      image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-ASH-BROWN.png" },
    { id: "ash-grey",       name: "Ash Grey",       image: "https://inairepublic.com/wp-content/uploads/2026/09/NEW-ASH-GREY.png" }
  ];

  function colourById(id) {
    for (var i = 0; i < COLOUR_STUDIO_SHADES.length; i++) {
      if (COLOUR_STUDIO_SHADES[i].id === id) return COLOUR_STUDIO_SHADES[i];
    }
    return null;
  }

  /* Colour-variant posters (before/after) — every shade maps to exactly
     one poster. All selector rows share this data with the gallery, so a
     colour selection can jump the gallery to its own poster. */
  var COLOUR_VARIANTS = {
    "honey-brown": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-HONEY-BROWN-BEFORE-AFTER-ONLY.png",
    "chocolate-brown": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-CHOCOLATE-BROWN-BEFORE-AFTER-ONLY.png",
    "coco-black": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-COCO-BLACK-BEFORE-AFTER-ONLY.png",
    "mocha-milk-tea": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-MOCHA-MILK-TEA-BEFORE-AFTER-ONLY.png",
    "hazelnut": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-HAZELNUT-BEFORE-AFTER-ONLY.png",
    "royal-chestnut": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-ROYAL-CHESTNUT-BEFORE-AFTER-ONLY.png",
    "persian-red": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-PERSIAN-RED-BEFORE-AFTER-ONLY.png",
    "caramel-gold": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-CARAMEL-GOLD-BEFORE-AFTER-ONLY.png",
    "olive-jade": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-OLIVE-JADE-BEFORE-AFTER-ONLY.png",
    "burgundy": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-BURGUNDY-BEFORE-AFTER-ONLY.png",
    "ash-brown": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-ASH-BROWN-BEFORE-AFTER-ONLY.png",
    "ash-grey": "https://inairepublic.com/wp-content/uploads/2026/10/BM-COLOUR-VARIANT-ASH-GREY-BEFORE-AFTER-ONLY.png"
  };

  /* Full browsable gallery: cover + information slides + one poster per
     available colour (catalogue order). Info slides are never removed;
     selecting a colour only jumps the gallery to the poster's index. */
  function productGallery(product) {
    var out = [product.cover].concat(product.infoSlides || []);
    resolveColours(product).forEach(function (c) {
      out.push(COLOUR_VARIANTS[c.id]);
    });
    return out;
  }

  function colourSlideIndex(product, colourId) {
    var base = 1 + (product.infoSlides ? product.infoSlides.length : 0);
    var cols = resolveColours(product);
    for (var i = 0; i < cols.length; i++) {
      if (cols[i].id === colourId) return base + i;
    }
    return -1;
  }

  /* Per-row palettes. Mix Jumbo rows draw from different lists
     (200ml row: 12 colours / 300ml row: 8 colours). */
  function coloursForRow(product, rowKey) {
    if (product.configType === "mix" && product.sizeColours) {
      var list = rowKey === "b" ? product.sizeColours.b : product.sizeColours.a;
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c && c.id && c.name && c.image) out.push({ id: c.id, name: c.name, image: c.image });
      }
      return out;
    }
    return resolveColours(product);
  }

  var SHOP_PRODUCTS = [
    {
      id: "p1",
      title: "Henna Hair Colour 200ml",
      size: "200ml",
      description:
        "Inai pewarna rambut telus air. Tahan lama, beraroma strawberi segar dan mesra wudu.",
      price: 49.0,
      originalPrice: 69.0,
      cover: "https://inairepublic.com/wp-content/uploads/2026/10/hhc-200ml-scaled.png",
      infoSlides: [
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-WHATS-INSIDE-THE-BOX-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-BLEACH-LEVEL-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png"
      ],
      colours: COLOUR_STUDIO_SHADES,
      configType: "single",
      numberOfSelections: 1,
      meta: "PEWARNA RAMBUT HALAL • 200ML"
    },
    {
      id: "p2",
      title: "Henna Hair Colour 300ml",
      size: "300ml",
      description:
        "Formula telus air premium untuk rambut halus. Menjaga kadarasih, memberi ketebalan asli dan mesra wudu.",
      price: 65.0,
      originalPrice: 120.0,
      cover: "https://inairepublic.com/wp-content/uploads/2026/10/hhc-300ml-1.png",
      infoSlides: [
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-300ML.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png"
      ],
      colours: [
        colourById("hazelnut"),
        colourById("honey-brown"),
        colourById("caramel-gold"),
        colourById("royal-chestnut"),
        colourById("persian-red"),
        colourById("burgundy")
      ],
      configType: "single",
      numberOfSelections: 1,
      meta: "PEWARNA RAMBUT HALAL • 300ML JUMBO"
    },
    {
      id: "p3",
      title: "Henna Hair Colour 300ml (Tutup Uban)",
      size: "300ml",
      description:
        "Tono semulajadi yang menutupi uban dengan estetika tenang. Rumitkan kedua belas urat rambut tanpa kehilangan kealamian.",
      price: 65.0,
      originalPrice: 120.0,
      cover: "https://inairepublic.com/wp-content/uploads/2026/10/tutup-uban-hhc-300ml-malay-scaled.png",
      infoSlides: [
        "https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-300ML.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png"
      ],
      colours: [
        colourById("coco-black"),
        colourById("chocolate-brown")
      ],
      configType: "single",
      numberOfSelections: 1,
      meta: "PENUTUP UBAN • 300ML JUMBO"
    },
    {
      id: "p4",
      title: "Combo 2x Henna Hair Colour 200ml",
      size: "200ml (2 x)",
      description:
        "Dua botol formula yang sama dalam satu kombo. Boleh pilih dua tona berbeza atau dua tona yang sama.",
      price: 98.0,
      originalPrice: 138.0,
      cover: "https://inairepublic.com/wp-content/uploads/2026/10/kombo-2x-hhc-200ml.png",
      infoSlides: [
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-WHATS-INSIDE-THE-BOX-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-BLEACH-LEVEL-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png"
      ],
      colours: COLOUR_STUDIO_SHADES,
      configType: "combo",
      numberOfSelections: 2,
      meta: "COMBO 2X • 200ML"
    },
    {
      id: "p5",
      title: "Combo 3x Henna Hair Colour 200ml",
      size: "200ml (3 x)",
      description:
        "Tiga botol formula yang sama. Beri kebebasan memilih sekurang-kurangnya tiga tona dalam satu paket.",
      price: 135.0,
      originalPrice: 207.0,
      cover: "https://inairepublic.com/wp-content/uploads/2026/10/kombo-3x-hhc-200ml.png",
      infoSlides: [
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-WHATS-INSIDE-THE-BOX-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-BLEACH-LEVEL-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png"
      ],
      colours: COLOUR_STUDIO_SHADES,
      configType: "combo",
      numberOfSelections: 3,
      meta: "COMBO 3X • 200ML"
    },
    {
      id: "p6",
      title: "Combo Jumbo Henna Hair Colour 300ml",
      size: "300ml Jumbo (2 x)",
      description:
        "Dua botol jumbo dalam satu kombo. Pilih satu warna untuk setiap botol, termasuk pilihan warna yang sama.",
      price: 114.0,
      originalPrice: 190.0,
      cover: "https://inairepublic.com/wp-content/uploads/2026/10/kombo-jumbo.png",
      infoSlides: [
        "https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-300ML.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png"
      ],
      colours: [
        colourById("hazelnut"),
        colourById("honey-brown"),
        colourById("caramel-gold"),
        colourById("royal-chestnut"),
        colourById("persian-red"),
        colourById("burgundy"),
        colourById("coco-black"),
        colourById("chocolate-brown")
      ],
      configType: "combo",
      numberOfSelections: 2,
      meta: "COMBO JUMBO • 300ML"
    },
    {
      id: "p7",
      title: "Mix Jumbo Henna Hair Colour 200ml & 300ml",
      size: "200ml & 300ml",
      description:
        "Gabungan dua saiz dalam satu kemasangan. Pilih tanda 200ml dan tanda 300ml secara berasingan.",
      price: 110.0,
      originalPrice: 189.0,
      cover: "https://inairepublic.com/wp-content/uploads/2026/10/mix-jumbo.png",
      infoSlides: [
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-WHATS-INSIDE-THE-BOX-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-BLEACH-LEVEL-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-1.png",
        "https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png"
      ],
      colours: COLOUR_STUDIO_SHADES,
      configType: "mix",
      numberOfSelections: 2,
      sizeColours: {
        a: COLOUR_STUDIO_SHADES,
        b: [
          colourById("hazelnut"),
          colourById("honey-brown"),
          colourById("caramel-gold"),
          colourById("royal-chestnut"),
          colourById("persian-red"),
          colourById("burgundy"),
          colourById("coco-black"),
          colourById("chocolate-brown")
        ]
      },
      meta: "MIX JUMBO • 200ML & 300ML"
    },
  ];

  function looksLikeColour(obj) {
    return obj && typeof obj === "object" && obj.id && obj.name && obj.image;
  }

  function resolveColours(product) {
    var out = [];
    var raw = product.colours;
    if (Array.isArray(raw)) {
      for (var i = 0; i < raw.length; i++) {
        var c = raw[i];
        if (looksLikeColour(c)) out.push({ id: c.id, name: c.name, image: c.image });
        else if (typeof c === "string") {
          var found = colourById(c);
          if (found) out.push({ id: found.id, name: found.name, image: found.image });
        }
      }
    } else if (looksLikeColour(raw)) {
      out.push({ id: raw.id, name: raw.name, image: raw.image });
    }
    return out;
  }

  window.__iniarepublicShop = {
    colours: COLOUR_STUDIO_SHADES,
    colourById: colourById,
    colourVariants: COLOUR_VARIANTS,
    products: SHOP_PRODUCTS,
    resolveColours: resolveColours,
    coloursForRow: coloursForRow,
    productGallery: productGallery,
    colourSlideIndex: colourSlideIndex,
    getProduct: function (id) {
      for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
        if (SHOP_PRODUCTS[i].id === id) return SHOP_PRODUCTS[i];
      }
      return null;
    }
  };
})();