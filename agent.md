# Agent Instructions & Project Guidelines

## Stack
- HTML, Tailwind CSS and Alpine JS. Do not use React etc.
- Bahasa: Semua teks menggunakan Bahasa Melayu.

---

## Color scheme
- Do not implement dark mode.

---

## Branding
- Use `BRANDING.md` for the branding guidelines.

---

## Image 
- Generate from gemini model 1.5 flash. Ask for it for special section only.

---

## Placeholder
- Do not generate image. Use placeholder from https://placehold.co/

Examples:
- Small thumbnail: https://placehold.co/400x300
- Hero image: https://placehold.co/1200x700
- Square avatar: https://placehold.co/200x200
- Logo placeholder: https://placehold.co/180x60
- Mobile screenshot: https://placehold.co/300x600

---

## Copywriting & Layout Rules
- **Rule of 3 Lines (Keterbacaan Maksimum)**: Never create a dense block of text. For any copywriting, especially within feature cards, informational sections, or descriptions, limit paragraphs to a maximum of **3 lines** per block. 
- Break long sentences into multiple small `<p>` tags with appropriate spacing (e.g., `margin-bottom: 12px;`) to provide breathing room and high scannability.
- **Grid & Alignment Consistency**: Elements stacked vertically within the same container must have perfectly matching widths to prevent jagged edges or pyramid shapes (atas kecil, bawah besar). Always use `width: 100%; box-sizing: border-box;` instead of hardcoded `max-width` when aligning multiple sibling boxes to ensure they stretch identically across all viewports.

---

## WordPress-Ready Image & Asset Hosting
- **Keep Online Hosted URLs**: Always use active, permanent direct online URLs (hosted on public CDNs like Catbox/Postimages) instead of local paths (like `generated_images/...` or `...png`) for all image elements in the HTML files.
- **WordPress Direct Copy-Paste**: Maintaining online URLs guarantees that the HTML pages are fully "WordPress-Ready" and can be instantly copied and pasted directly into WordPress Gutenberg/Custom HTML editors without breaking any image graphics.
- **Mapping Reference**: Refer to the `image_mapping.json` file in the root directory for the complete active manifest of uploaded assets. Never revert these online direct links back to local relative links.
