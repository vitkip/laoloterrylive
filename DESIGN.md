```markdown
# Design System Specification: Editorial Data Intelligence

## 1. Overview & Creative North Star
**Creative North Star: "The Financial Archive"**

This design system rejects the chaotic, high-stimulus aesthetic of traditional gambling platforms in favor of a sophisticated, authoritative "Data Intelligence" portal. Our goal is to position the Lao Lottery as a structured, analytical experience—more akin to a Bloomberg Terminal or a premium economic journal than a game of chance.

We achieve this through **Editorial Asymmetry**. By breaking the rigid, centered grid and using staggered layouts, layered surfaces, and high-contrast typography scales, we create a visual rhythm that feels curated and intentional. This system prioritizes the "Intelligence" of the data, treating historical results and 'ເລກນາມສັດ' (Animal Numbers) with the same reverence as stock market indices.

---

## 2. Colors & Surface Architecture

The palette balances the deep authority of `primary` (#003FB1) with the prosperous vitality of `secondary` (#006C49).

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established through:
1.  **Tonal Shifts:** Placing a `surface-container-low` section against a `surface` background.
2.  **Negative Space:** Using the spacing scale to create clear mental models of containment.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material surface tiers to define depth:
*   **Base:** `surface` (#F9F9FF) for the main canvas.
*   **Sectioning:** `surface-container-low` (#EFF3FF) for large structural blocks (e.g., the historical archive background).
*   **Elevated Content:** `surface-container-lowest` (#FFFFFF) for the actual data cards. This creates a "lift" through contrast rather than shadows.

### Glass & Gradient Rules
*   **Signature Textures:** Use a subtle linear gradient from `primary` (#003FB1) to `primary-container` (#1A56DB) for primary CTAs and header highlights.
*   **Glassmorphism:** For floating overlays or mobile navigation bars, use `surface-container-highest` at 80% opacity with a 16px backdrop blur to maintain a premium, integrated feel.

---

## 3. Typography: The Lao Editorial Voice

The typography system is designed to handle the unique verticality and curves of Lao script while maintaining the "Data Intelligence" persona.

*   **Primary Typeface:** `Be Vietnam Pro` (Lao/English)
*   **Secondary Typeface:** `Inter` (Numbers/Labels)

**Hierarchy Strategy:**
*   **Display (Display-LG/MD):** Used for winning numbers. The large scale conveys importance without needing aggressive colors.
*   **Headline (Headline-SM):** Used for 'ຫວຍນາມສັດ' (Animal Lottery) category headers. Bold, authoritative, and clean.
*   **Body (Body-LG/MD):** Optimized for readability in long-form historical archives.
*   **Label (Label-MD):** Set in `Inter` for tabular data, hot/cold statistics, and timestamps to ensure maximum legibility at small sizes.

---

## 4. Elevation & Depth: Tonal Layering

We move away from the "shadow-heavy" look of 2010s web design. 

*   **The Layering Principle:** Stack `surface-container-lowest` cards on `surface-container-high` backgrounds. This creates a "Paper-on-Stone" effect that feels tactile and professional.
*   **Ambient Shadows:** If a card must float (e.g., a winning result pop-up), use a `primary-fixed-dim` tinted shadow: `0px 20px 40px rgba(0, 63, 177, 0.06)`. This mimics soft, natural blue-tinted light.
*   **The "Ghost Border":** For internal dividers within a card, use `outline-variant` at 15% opacity. Never use 100% opaque lines.

---

## 5. Components & Specialized Modules

### Specialized Lottery Cards
*   **Result Cards:** Use `surface-container-lowest`. The animal icon (for 'ເລກນາມສັດ') should be a monochrome, high-fidelity vector, not a cartoon. The number should be in `display-sm` using the `primary` color.
*   **No Dividers:** Separate the animal name, number, and date using 1.5rem of vertical white space instead of lines.

### Data Visualization (Frequency Charts)
*   **Hot Numbers:** Use `secondary` (#006C49) with a 10% opacity fill for the chart area.
*   **Cold Numbers:** Use `outline-variant` with a dashed stroke.
*   **The Archive Table:** Use a "Zebra" striping method with `surface-container-low` and `surface-container-lowest` instead of grid lines. The header row should be `surface-dim` with `on-surface-variant` text in `label-md`.

### Buttons & Inputs
*   **Primary Button:** Gradient fill (`primary` to `primary-container`), `xl` (0.75rem) corner radius. No border.
*   **Secondary Button:** `surface-container-highest` background with `on-primary-fixed-variant` text.
*   **Input Fields:** Ghost borders only. Use `surface-container-low` as the field background. On focus, transition to a 2px `surface-tint` bottom-only stroke.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** treat 'ຫວຍນາມສັດ' (Animal Lottery) as a cultural heritage element; use elegant iconography.
*   **Do** use asymmetrical layouts where the main data column is 60% width and the stats sidebar is 30% to create an editorial feel.
*   **Do** use `secondary-container` (#6CF8BB) as a "Success" highlight for winnings.

### Don’t:
*   **Don’t** use "Gambling Red." Error states should use the `error` (#BA1A1A) token sparingly.
*   **Don’t** use drop shadows on buttons. Use tonal contrast.
*   **Don’t** use typical "Gold" or "Sparkle" effects. We are a financial archive, not a casino floor.
*   **Don’t** use 1px borders between table rows. Use 8px of white space or subtle tonal shifts.

---

## 7. Spacing & Rhythm
Use a strict 4px/8px baseline grid. 
*   **Card Padding:** Always `1.5rem` (24px) for internal content to allow the "Data Intelligence" to breathe.
*   **Section Gaps:** Use `3rem` (48px) to clearly separate the 'Result' section from the 'Historical Archive' section.