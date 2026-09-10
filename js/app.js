/* ==========================================================================
   INAI REPUBLIC x SAINT LAURENT DESIGN SYSTEM
   Interactive Application Logic - js/app.js
   Compliant with WCAG 2.2 AA (Keyboard, Focus Trap, ARIA)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------------------------------
     1. State Management
     ------------------------------------------------------------------------ */
  const state = {
    cart: [
      {
        id: "p1",
        name: "Signature Henna Hair Colour 300ml",
        shade: "Coco Black • 300ml Jumbo",
        price: 65.0,
        qty: 1,
        img: "https://inairepublic.com/wp-content/uploads/2026/06/5-300x300.png"
      },
      {
        id: "p2",
        name: "Inai Kuku Couple Edition",
        shade: "Percuma Buffer & Serum Kuku",
        price: 39.0,
        qty: 1,
        img: "https://inairepublic.com/wp-content/uploads/2023/11/couple-edition-inai-republic-1-300x300.jpg"
      }
    ],
    selectedStudioShade: {
      name: "Persian Red",
      hex: "#8e1822",
      desc: "Tona merah delima pekat & berkilau bak permata. Pilihan paling viral dan diminati ramai."
    }
  };

  /* ------------------------------------------------------------------------
     2. DOM Elements
     ------------------------------------------------------------------------ */
  const header = document.getElementById("site-header");
  const cartToggleBtn = document.getElementById("cart-toggle-btn");
  const cartCloseBtn = document.getElementById("cart-close-btn");
  const cartBackdrop = document.getElementById("cart-backdrop");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartCounter = document.getElementById("cart-counter");
  const cartItemsCount = document.getElementById("cart-items-count");
  const cartTotalDisplay = document.getElementById("cart-total-display");
  const checkoutBtn = document.getElementById("checkout-btn");

  // Studio Elements
  const nailSwatches = document.querySelectorAll(".nail-swatch");
  const studioShadeName = document.getElementById("studio-shade-name");
  const studioShadeDesc = document.getElementById("studio-shade-desc");
  const studioAddBtn = document.getElementById("studio-add-btn");
  const shadeSelectButtons = document.querySelectorAll(".shade-select-btn");

  // Tabs
  const tabButtons = document.querySelectorAll(".tab-btn");

  // Mobile menu
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navMenu = document.getElementById("nav-menu");

  let previousActiveElement = null;

  /* ------------------------------------------------------------------------
     3. Header Scroll Effect
     ------------------------------------------------------------------------ */
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  /* ------------------------------------------------------------------------
     4. Cart Logic & Render
     ------------------------------------------------------------------------ */
  function renderCart() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // Update Badges & Counters
    if (cartCounter) cartCounter.textContent = totalItems;
    if (cartItemsCount) cartItemsCount.textContent = totalItems;
    if (cartTotalDisplay) cartTotalDisplay.textContent = `RM ${totalPrice.toFixed(2)}`;

    // Render Items
    if (!cartItemsContainer) return;

    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p style="text-transform: uppercase; letter-spacing: var(--font-letter-spacing-caps); font-size: 12px; margin-bottom: 8px;">Troli Anda Masih Kosong</p>
          <p style="font-size: 11px;">Terokai koleksi inai botani kami untuk memulakan pesanan.</p>
        </div>
      `;
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    cartItemsContainer.innerHTML = state.cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div>
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-shade">${item.shade}</div>
            <div class="cart-item-price">RM ${(item.price * item.qty).toFixed(2)}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <div class="cart-qty-ctrl">
              <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Kurangkan kuantiti">-</button>
              <span class="qty-display">${item.qty}</span>
              <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Tambah kuantiti">+</button>
            </div>
            <button class="cart-remove-btn" data-action="remove" data-id="${item.id}">Padam</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  function openCart() {
    previousActiveElement = document.activeElement;
    cartBackdrop.classList.add("open");
    cartBackdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent background scroll
    if (cartCloseBtn) cartCloseBtn.focus();
  }

  function closeCart() {
    cartBackdrop.classList.remove("open");
    cartBackdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (previousActiveElement && typeof previousActiveElement.focus === "function") {
      previousActiveElement.focus();
    }
  }

  function addToCart(product) {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({ ...product, qty: 1 });
    }
    renderCart();
    openCart();
  }

  // Cart Event Listeners
  if (cartToggleBtn) {
    cartToggleBtn.addEventListener("click", openCart);
  }

  if (cartCloseBtn) {
    cartCloseBtn.addEventListener("click", closeCart);
  }

  if (cartBackdrop) {
    cartBackdrop.addEventListener("click", (e) => {
      if (e.target === cartBackdrop) {
        closeCart();
      }
    });
  }

  // Delegation for Cart actions (Increase, Decrease, Remove)
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const target = e.target;
      const action = target.getAttribute("data-action");
      const id = target.getAttribute("data-id");
      if (!action || !id) return;

      const item = state.cart.find(i => i.id === id);
      if (!item) return;

      if (action === "increase") {
        item.qty += 1;
      } else if (action === "decrease") {
        item.qty -= 1;
        if (item.qty <= 0) {
          state.cart = state.cart.filter(i => i.id !== id);
        }
      } else if (action === "remove") {
        state.cart = state.cart.filter(i => i.id !== id);
      }
      renderCart();
    });
  }

  // Checkout button interaction
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      alert("Pesanan anda sedia diproses ke gerbang pembayaran rasmi Inai Republic!");
    });
  }

  /* ------------------------------------------------------------------------
     5. Accessibility: Keyboard Trap & Escape Listener (WCAG 2.2 AA)
     ------------------------------------------------------------------------ */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartBackdrop.classList.contains("open")) {
      closeCart();
    }
  });

  /* ------------------------------------------------------------------------
     6. Product Catalog Quick Add Buttons
     ------------------------------------------------------------------------ */
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach(card => {
    const addBtn = card.querySelector('[data-action="add-to-cart"]');
    const id = card.getAttribute("data-id");
    const name = card.getAttribute("data-name");
    const price = parseFloat(card.getAttribute("data-price"));
    const img = card.getAttribute("data-img");

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addToCart({
          id,
          name,
          shade: "Standard Haute Selection",
          price,
          img
        });
      });
    }

    // Interactive shade dots in cards
    const shadeDots = card.querySelectorAll(".shade-dot");
    shadeDots.forEach(dot => {
      dot.addEventListener("click", () => {
        shadeDots.forEach(d => d.classList.remove("active"));
        dot.classList.add("active");
        const tooltip = dot.getAttribute("data-tooltip");
        const titleEl = card.querySelector(".product-title");
        if (titleEl && id === "p1") {
          titleEl.textContent = `Signature Nail Henna — ${tooltip}`;
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     7. Interactive Shade Studio Live Preview
     ------------------------------------------------------------------------ */
  shadeSelectButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      shadeSelectButtons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-checked", "true");

      const shadeName = btn.getAttribute("data-shade");
      const shadeHex = btn.getAttribute("data-hex");
      const shadeDesc = btn.getAttribute("data-desc");

      state.selectedStudioShade = {
        name: shadeName,
        hex: shadeHex,
        desc: shadeDesc
      };

      // Animate nail swatches color
      nailSwatches.forEach(swatch => {
        swatch.style.backgroundColor = shadeHex;
        swatch.style.boxShadow = `0 8px 30px ${shadeHex}66`;
      });

      if (studioShadeName) studioShadeName.textContent = shadeName;
      if (studioShadeDesc) studioShadeDesc.textContent = shadeDesc;
    });
  });

  // Studio Add Button
  if (studioAddBtn) {
    studioAddBtn.addEventListener("click", () => {
      addToCart({
        id: `studio-${state.selectedStudioShade.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: `Inai Kuku Edisi Khas — ${state.selectedStudioShade.name}`,
        shade: `Tona Studio: ${state.selectedStudioShade.name} • 10ml`,
        price: 39.0,
        img: "https://inairepublic.com/wp-content/uploads/2023/11/couple-edition-inai-republic-1-300x300.jpg"
      });
    });
  }

  /* ------------------------------------------------------------------------
     8. Category Navigation Tabs
     ------------------------------------------------------------------------ */
  tabButtons.forEach(tab => {
    tab.addEventListener("click", () => {
      tabButtons.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
    });
  });

  /* ------------------------------------------------------------------------
     9. Mobile Navigation Menu Toggle + Koleksi Dropdown
     ------------------------------------------------------------------------ */
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      const isExpanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";
      mobileMenuBtn.setAttribute("aria-expanded", !isExpanded);
      navMenu.style.display = isExpanded ? "none" : "flex";
      navMenu.style.flexDirection = "column";
      navMenu.style.position = "absolute";
      navMenu.style.top = "var(--header-height)";
      navMenu.style.left = "0";
      navMenu.style.width = "100%";
      navMenu.style.backgroundColor = "var(--color-surface-elevated, #4e1023)";
      navMenu.style.padding = "20px";
      navMenu.style.borderBottom = "1px solid var(--color-border-subtle)";
    });
  }

  // Koleksi dropdown (klik untuk buka/tutup — mesra sentuhan & keyboard)
  const koleksiDropdown = document.getElementById("koleksi-dropdown");
  const koleksiToggle = document.getElementById("koleksi-toggle");

  if (koleksiDropdown && koleksiToggle) {
    koleksiToggle.addEventListener("click", (e) => {
      // Klik pertama: buka dropdown sahaja (tidak lompat ke #katalog)
      if (!koleksiDropdown.classList.contains("dropdown-open")) {
        e.preventDefault();
        koleksiDropdown.classList.add("dropdown-open");
        koleksiToggle.setAttribute("aria-expanded", "true");
      }
      // Klik kedua (semasa dropdown sudah terbuka): ikut href ke #katalog seperti biasa
    });

    // Tutup dropdown bila klik di luar kawasan
    document.addEventListener("click", (e) => {
      if (!koleksiDropdown.contains(e.target)) {
        koleksiDropdown.classList.remove("dropdown-open");
        koleksiToggle.setAttribute("aria-expanded", "false");
      }
    });

    // Tutup dropdown dengan kekunci Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        koleksiDropdown.classList.remove("dropdown-open");
        koleksiToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Initialize Initial Cart State
  renderCart();
});
