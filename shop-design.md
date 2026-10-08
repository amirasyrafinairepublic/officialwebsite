# INAI REPUBLIC — SHOP DESIGN SYSTEM

> **Document purpose:** This file is the single source of truth for the visual, UX, product-selection, and product-data rules of the INAI REPUBLIC Shop / Product experience.
>
> **Relationship with `design.md`:** `design.md` remains the global website design system. This file only defines Shop-specific rules. Never override `design.md` unless explicitly instructed.

---

## 01. SHOP DESIGN PHILOSOPHY

The INAI REPUBLIC Shop must feel like a premium official beauty brand store.

### Core qualities

- Premium
- Minimal
- Modern
- Feminine
- Clean
- Confident
- Editorial
- Easy to shop

The experience should feel closer to a premium hair-care / beauty e-commerce website than a generic marketplace.

### Visual identity

Follow the global brand identity defined in `design.md`.

Shop-specific visual direction:

- Dark Maroon / Pantone 7421 C
- Off-white / warm neutral backgrounds
- Champagne / muted gold accents
- Montserrat typography
- Clean editorial spacing
- Premium product photography
- Restrained shadows
- Refined borders
- Minimal decoration

### Avoid

- Cheap marketplace aesthetic
- Bright red discount graphics
- Excessive gradients
- Excessive glassmorphism
- Excessive rounded cards
- Cartoon-style icons
- Generic stock photography
- Over-decoration
- Cluttered product cards
- Huge discount badges
- Brush-stroke colour labels
- Large colour-selection buttons

---

# 02. SHOP PAGE STRUCTURE

The Shop experience should support:

1. Product listing
2. Product cards
3. Product detail page
4. Product image gallery
5. Product pricing
6. Colour selection
7. Quantity selection
8. Add to Cart
9. Buy Now
10. Responsive mobile shopping

The architecture must be reusable so new products can be added without rebuilding the product page.

---

# 03. PRODUCT CARD

Each product card should contain:

- Product image
- Product name
- Optional short descriptor
- Sale price
- Original price
- Colour availability
- Primary action

### Price hierarchy

Example:

**RM49.00**  ~~RM69.00~~

Rules:

- Sale price is visually dominant.
- Original price is smaller and crossed out.
- Do not use oversized red discount badges.
- Keep the discount presentation premium and restrained.

### Product card aesthetic

Product cards should have:

- Clean spacing
- Strong product image
- Minimal border treatment
- Subtle interaction
- Clear typography
- No unnecessary decoration

---

# 04. PRODUCT DETAIL PAGE

Desktop layout:

```text
┌─────────────────────────────┬──────────────────────────────┐
│                             │ Product Name                 │
│                             │ Price                        │
│      PRODUCT GALLERY        │ Colour Selector              │
│                             │ Quantity                     │
│                             │ Add to Cart                  │
│                             │ Buy Now                      │
│                             │ Product Information          │
└─────────────────────────────┴──────────────────────────────┘
```

### Desktop

- Product gallery on the left.
- Product information on the right.
- Maintain generous whitespace.
- Product image remains the visual focus.

### Mobile

Use a single-column layout:

1. Product gallery
2. Product title
3. Price
4. Colour selection
5. Quantity
6. Add to Cart
7. Buy Now
8. Product information

The product page must not feel cramped.

---

# 05. PRODUCT IMAGE GALLERY

Use the exact product images provided in the product catalogue below.

Do not recreate or replace supplied product artwork.

### Gallery behaviour

- Large primary image.
- Clean thumbnail navigation.
- Minimal arrows.
- Smooth but restrained transitions.
- No unnecessary animation.
- Preserve the original image proportions.
- Do not crop important product information from supplied artwork.

---

# 06. COLOUR SELECTOR — CORE SYSTEM

The colour selector is one of the most important components of the Shop.

The design should be inspired by premium beauty e-commerce interfaces.

Example:

```text
Colour

○  ○  ○  ○  ○  ○  ○  ○  ○  ○  ○  ○

Selected:
Coco Black
```

### Swatch rules

Use small circular swatches.

Recommended size:

- Desktop: 42–48px
- Mobile: 40–44px

Each swatch must:

- Be perfectly circular.
- Show the actual hair-colour texture where an asset is available.
- Use the existing INAI REPUBLIC Colour Studio assets.
- Have clean edges.
- Have subtle spacing.
- Avoid flat generic colour circles when an actual hair visual exists.

### Selected state

When selected:

- Add a clear outer ring.
- Use INAI REPUBLIC maroon or muted champagne/gold.
- Slightly enlarge the selected swatch.
- Make the selection immediately obvious.
- Keep animation subtle.

### Selected colour name

Always display the currently selected colour underneath or adjacent to the selector.

Example:

```text
Colour

[swatches]

Selected: Coco Black
```

### Important

DO NOT use:

- Brush-stroke labels
- Large colour cards
- Huge text labels
- Marketplace-style colour buttons
- Decorative colour blocks

The selector should feel premium, simple, and effortless.

---

# 07. COLOUR STUDIO — MASTER 12 COLOURS

The master INAI REPUBLIC Colour Studio consists of:

1. COCO BLACK
2. CHOCOLATE BROWN
3. ROYAL CHESTNUT
4. HAZELNUT
5. HONEY BROWN
6. CARAMEL GOLD
7. PERSIAN RED
8. BURGUNDY
9. OLIVE JADE
10. MOCHA MILK TEA
11. ASH BROWN
12. ASH GREY

Use the existing Colour Studio hair images/assets.

Do not create a separate colour visual system.

All colour swatches across the Shop must remain visually consistent.

---

# 08. SINGLE PRODUCT COLOUR SELECTION

For products containing one bottle:

Use one colour selector.

Example:

```text
Colour

○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○

Selected: Coco Black
```

A colour must be selected before Add to Cart / Buy Now.

If no colour is selected:

```text
Please select your colour.
```

Use subtle validation styling.

---

# 09. COMBO COLOUR SELECTION

Combo products must support independent colour selection for every bottle.

## Combo 2x

Display:

```text
Colour 1
○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○

Selected: Coco Black


Colour 2
○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○

Selected: Chocolate Brown
```

The customer may select:

- Coco Black + Coco Black
- Coco Black + Chocolate Brown
- Chocolate Brown + Burgundy
- Any other valid combination

Do not force colours to be unique.

---

## Combo 3x

Display:

```text
Colour 1
○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○

Colour 2
○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○

Colour 3
○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○
```

The same colour may be selected multiple times.

Example:

- Coco Black
- Coco Black
- Chocolate Brown

---

## Combo Jumbo 300ml

Support independent colour selection for every bottle included in the combo.

Available colour set:

- Hazelnut
- Honey Brown
- Caramel Gold
- Royal Chestnut
- Persian Red
- Burgundy
- Coco Black
- Chocolate Brown

---

## Mix Jumbo 200ml + 300ml

The two product sizes must have separate selectors.

Display:

```text
200ml Colour
○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○

300ml Colour
○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○
```

Example:

```text
200ml: Coco Black
300ml: Chocolate Brown
```

The selected configuration must be preserved when added to cart.

---

# 10. PRODUCT SELECTION VALIDATION

Before Add to Cart:

### Single product

Require one colour.

### Combo 2x

Require Colour 1 + Colour 2.

### Combo 3x

Require Colour 1 + Colour 2 + Colour 3.

### Combo Jumbo

Require all required bottle colour selections.

### Mix Jumbo

Require 200ml colour + 300ml colour.

Validation messages:

```text
Please select your colour.
```

For combos:

```text
Please select a colour for each product.
```

Do not allow an incomplete configuration into the cart.

---

# 11. QUANTITY

Quantity selector should be:

- Minimal
- Easy to understand
- Touch-friendly
- Consistent with the existing global UI

Use:

```text
−   1   +
```

Do not over-style the quantity selector.

---

# 12. PRODUCT CTA

Primary CTA:

**ADD TO CART**

Secondary CTA:

**BUY NOW**

Primary CTA should have the strongest visual emphasis.

Maintain the existing INAI REPUBLIC brand styling from `design.md`.

Do not introduce unrelated button colours.

---

# 13. PRODUCT GALLERY + PRODUCT INFORMATION

Recommended hierarchy:

```text
PRODUCT TITLE

Price
Original price

Colour
Colour swatches
Selected colour

Quantity

ADD TO CART
BUY NOW

Product information
```

Keep the most important purchasing information above the fold where practical.

---

# 14. PRODUCT CATALOGUE

## PRODUCT 01 — HENNA HAIR COLOUR 200ML

### Title

Henna Hair Colour 200ml

### Gallery

Slide 1:
https://inairepublic.com/wp-content/uploads/2026/10/hhc-200ml-scaled.png

Slide 2:
https://inairepublic.com/wp-content/uploads/2026/10/BM-WHATS-INSIDE-THE-BOX-1.png

Slide 3:
https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png

Slide 4:
https://inairepublic.com/wp-content/uploads/2026/10/BM-BLEACH-LEVEL-1.png

Slide 5:
https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-1.png

Slide 6:
https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png

### Colours

12 colours:

- Coco Black
- Chocolate Brown
- Royal Chestnut
- Hazelnut
- Honey Brown
- Caramel Gold
- Persian Red
- Burgundy
- Olive Jade
- Mocha Milk Tea
- Ash Brown
- Ash Grey

### Pricing

Sale price: RM49.00
Original price: RM69.00

---

# PRODUCT 02 — HENNA HAIR COLOUR 300ML

### Title

Henna Hair Colour 300ml

### Gallery

Slide 1:
https://inairepublic.com/wp-content/uploads/2026/10/hhc-300ml-1.png

Slide 2:
https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-300ML.png

Slide 3:
https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png

### Colours

- Hazelnut
- Honey Brown
- Caramel Gold
- Royal Chestnut
- Persian Red
- Burgundy

### Pricing

Sale price: RM65.00
Original price: RM120.00

---

# PRODUCT 03 — HENNA HAIR COLOUR 300ML TUTUP UBAN

### Title

Henna Hair Colour 300ml — Tutup Uban

### Gallery

Slide 1:
https://inairepublic.com/wp-content/uploads/2026/10/tutup-uban-hhc-300ml-malay-scaled.png

Slide 2:
https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png

Slide 3:
https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-300ML.png

Slide 4:
https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png

### Colours

- Coco Black
- Chocolate Brown

### Pricing

Sale price: RM65.00
Original price: RM120.00

### Positioning

This product should visually communicate its grey-hair coverage purpose without looking like a discount/low-end product.

---

# PRODUCT 04 — COMBO 2X HENNA HAIR COLOUR 200ML

### Title

Combo 2x Henna Hair Colour 200ml

### Gallery

Slide 1:
https://inairepublic.com/wp-content/uploads/2026/10/kombo-2x-hhc-200ml.png

Slide 2:
https://inairepublic.com/wp-content/uploads/2026/10/BM-WHATS-INSIDE-THE-BOX-1.png

Slide 3:
https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png

Slide 4:
https://inairepublic.com/wp-content/uploads/2026/10/BM-BLEACH-LEVEL-1.png

Slide 5:
https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-1.png

Slide 6:
https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png

### Colours

12 colours.

### Selection

Two independent colour selectors.

### Pricing

Sale price: RM98.00
Original price: RM138.00

---

# PRODUCT 05 — COMBO 3X HENNA HAIR COLOUR 200ML

### Title

Combo 3x Henna Hair Colour 200ml

### Gallery

Slide 1:
https://inairepublic.com/wp-content/uploads/2026/10/kombo-3x-hhc-200ml.png

Slide 2:
https://inairepublic.com/wp-content/uploads/2026/10/BM-WHATS-INSIDE-THE-BOX-1.png

Slide 3:
https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png

Slide 4:
https://inairepublic.com/wp-content/uploads/2026/10/BM-BLEACH-LEVEL-1.png

Slide 5:
https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-1.png

Slide 6:
https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png

### Colours

12 colours.

### Selection

Three independent colour selectors.

### Pricing

Sale price: RM135.00
Original price: RM207.00

---

# PRODUCT 06 — COMBO JUMBO HENNA HAIR COLOUR 300ML

### Title

Combo Jumbo Henna Hair Colour 300ml

### Gallery

Slide 1:
https://inairepublic.com/wp-content/uploads/2026/10/kombo-jumbo.png

Slide 2:
https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png

Slide 3:
https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-300ML.png

Slide 4:
https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png

### Colours

- Hazelnut
- Honey Brown
- Caramel Gold
- Royal Chestnut
- Persian Red
- Burgundy
- Coco Black
- Chocolate Brown

### Selection

Independent colour selection for every bottle in the combo.

### Pricing

Sale price: RM114.00
Original price: RM190.00

---

# PRODUCT 07 — MIX JUMBO HENNA HAIR COLOUR 200ML & 300ML

### Title

Mix Jumbo Henna Hair Colour 200ml & 300ml

### Gallery

Slide 1:
https://inairepublic.com/wp-content/uploads/2026/10/mix-jumbo.png

Slide 2:
https://inairepublic.com/wp-content/uploads/2026/10/BM-WHATS-INSIDE-THE-BOX-1.png

Slide 3:
https://inairepublic.com/wp-content/uploads/2026/10/TUTUP-UBAN.png

Slide 4:
https://inairepublic.com/wp-content/uploads/2026/10/BM-BLEACH-LEVEL-1.png

Slide 5:
https://inairepublic.com/wp-content/uploads/2026/10/BM-HOW-TO-USE-1.png

Slide 6:
https://inairepublic.com/wp-content/uploads/2026/10/SHOWCASE-RETAIL-NEW-COLOUR-MOCHA-MILK-TEA-INGREDIENTS-2.png

### Colours

All 12 colours:

- Coco Black
- Chocolate Brown
- Royal Chestnut
- Hazelnut
- Honey Brown
- Caramel Gold
- Persian Red
- Burgundy
- Olive Jade
- Mocha Milk Tea
- Ash Brown
- Ash Grey

### Selection

Two independent selectors:

200ml Colour

300ml Colour

### Pricing

Sale price: RM110.00
Original price: RM189.00

---

# 15. RESPONSIVE DESIGN

## Desktop

- Product gallery and product information side-by-side.
- Swatches should have enough space to breathe.
- 12 colours may wrap into two clean rows.
- Avoid overly long horizontal swatch rows.

## Tablet

- Maintain balanced proportions.
- Reduce spacing only when necessary.
- Keep swatches easy to tap.

## Mobile

- Single-column product layout.
- Product gallery remains prominent.
- Swatches should use a compact grid.
- Minimum comfortable tap target.
- Combo selectors should remain visually separated.
- CTA buttons should remain prominent.

---

# 16. INTERACTION STATES

Colour swatch states:

### Default

- Clean circular image
- Subtle border

### Hover

- Very subtle scale
- Subtle ring

### Selected

- Strong outer ring
- Slight scale increase
- Selected colour name updates

### Disabled

Only use disabled state if a colour becomes genuinely unavailable.

Do not use greyed-out states unnecessarily.

---

# 17. ACCESSIBILITY

Colour selection must not depend on colour alone.

Each swatch should have:

- Accessible label
- Colour name
- Keyboard focus state
- Clear selected state

Example accessible label:

`Select Coco Black`

The selected state must also be visually identifiable through a ring/border.

---

# 18. CART DATA

When a product is added to cart, preserve:

- Product name
- Product size
- Quantity
- Sale price
- Original price if applicable
- Selected colour(s)
- Combo configuration

Examples:

```text
Henna Hair Colour 200ml
Colour: Coco Black
Qty: 1
```

```text
Combo 2x Henna Hair Colour 200ml
Colour 1: Coco Black
Colour 2: Chocolate Brown
Qty: 1
```

```text
Mix Jumbo Henna Hair Colour 200ml & 300ml
200ml: Coco Black
300ml: Chocolate Brown
Qty: 1
```

The customer must be able to understand exactly what they selected from the cart.

---

# 19. REUSABLE COMPONENT ARCHITECTURE

Build reusable components/data structures for:

- ProductCard
- ProductGallery
- ProductInfo
- PriceDisplay
- ColourSwatch
- ColourSelector
- ComboColourSelector
- QuantitySelector
- AddToCartButton
- BuyNowButton

Products should be data-driven.

Do not duplicate the same product-page code seven times.

---

# 20. PRODUCT CONFIGURATION MODEL

Each product should conceptually contain:

```text
product
├── id
├── title
├── size
├── gallery
├── salePrice
├── originalPrice
├── colours
├── selectionType
├── numberOfSelections
└── productType
```

Examples:

```text
selectionType:
single
combo
mix
```

Examples:

```text
numberOfSelections:
1
2
3
```

This makes future product additions easier.

---

# 21. DO NOT CHANGE GLOBAL WEBSITE DESIGN

Do not modify:

- `design.md`
- Global typography
- Global colour tokens
- Header
- Footer
- Navigation
- Homepage
- Our Story
- Panel Syariah page planning
- Other unrelated sections

Unless explicitly requested.

This document only governs the Shop/Product experience.

---

# 22. IMPLEMENTATION PRINCIPLE

Before coding:

1. Inspect the current codebase.
2. Read `design.md`.
3. Read this `shop-design.md`.
4. Understand the current component architecture.
5. Reuse existing components where possible.
6. Do not rebuild unrelated components.
7. Implement the Shop system using reusable data-driven components.
8. Test desktop and mobile behaviour.
9. Test every product configuration.
10. Test colour selection and cart data.

---

# 23. FINAL SHOP EXPERIENCE

The finished experience should allow a customer to:

1. Browse INAI REPUBLIC products.
2. Open a product.
3. View its product gallery.
4. Understand the price.
5. Select a hair colour through a premium circular hair-texture swatch.
6. See the selected colour clearly.
7. Select multiple colours independently for combo products.
8. Select the same colour more than once when desired.
9. Add the exact configuration to cart.
10. Proceed to checkout without confusion.

The overall feeling should be:

**Premium beauty.**
**Clean shopping.**
**Simple colour selection.**
**Confident brand experience.**

Never sacrifice premium visual quality for unnecessary UI decoration.
