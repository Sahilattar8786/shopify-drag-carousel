# shopify-drag-carousel

**Add drag-scroll to any horizontal container with one class.**

A tiny, zero-dependency behavior layer for smooth mouse and touch drag scrolling. It is **not** a UI kit: it does not dictate layout, spacing, or markup—only scroll behavior.

## Features

- **Auto-init** — Elements with class `drag-carousel` are ready on `DOMContentLoaded`; no duplicate setup per element
- **Mouse + touch** — Desktop drag and mobile touch drag using native `scrollLeft`
- **Configurable speed** — Default multiplier `1.5`
- **Optional prev/next** — Wire buttons with CSS selectors; each click scrolls by one viewport width with smooth behavior
- **Minimal inline styles** — `overflow-x: auto`, `cursor: grab`, `scroll-behavior: smooth` (plus optional `style.css` for `grabbing`)

## Install

```bash
npm install shopify-drag-carousel
```

## CDN (no build step)

Script (global `DragCarousel` on `window`):

```html
<script src="https://cdn.jsdelivr.net/npm/shopify-drag-carousel@1/index.js"></script>
```

Optional CSS for the dragging cursor:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/shopify-drag-carousel@1/style.css"
/>
```

Pin a major version (`@1`) or an exact version in production.

## Shopify (Liquid)

Drop the script (and optional stylesheet) in your theme—**theme.liquid** asset tags, or a section’s `{% schema %}` and `{% javascript %}` / `{% stylesheet %}` as you prefer.

```liquid
<div class="drag-carousel">
  {% for product in collections.frontpage.products %}
    <div>{{ product.title }}</div>
  {% endfor %}
</div>
```

Give children whatever layout you use (flex row, grid, inline blocks, etc.). The library only enables horizontal scrolling and drag behavior.

After **dynamic** updates (e.g. section AJAX), call:

```js
DragCarousel.initAll();
```

## Vanilla JavaScript

**Automatic:** Add class `drag-carousel` to your container; initialization runs when the DOM is ready.

**Manual:**

```js
const carousel = new DragCarousel('#my-row', {
  speed: 1.5,
  buttons: {
    prev: '.prev-btn',
    next: '.next-btn',
  },
});
```

**Node / CommonJS:**

```js
const DragCarousel = require('shopify-drag-carousel');
new DragCarousel('.drag-carousel');
```

## API

### `new DragCarousel(selectorOrElement, options?)`

| Option    | Type     | Default | Description                                      |
| --------- | -------- | ------- | ------------------------------------------------ |
| `speed`   | `number` | `1.5`   | Multiplier applied to pointer movement vs scroll |
| `buttons` | `object` | `null`  | `{ prev: string, next: string }` CSS selectors   |

String selectors use `document.querySelector` (first match). For multiple carousels, create one instance per element or rely on **auto-init** + class `drag-carousel`.

### `DragCarousel.initAll()`

Finds all `.drag-carousel` elements that are not yet initialized and attaches behavior. Use after injecting new HTML.

### `DragCarousel.isInitialized(element)`

Returns whether the given element already has carousel behavior.

## Constraints

- No React or other UI framework required
- No bundler required for browser usage
- Intended to run directly in the browser via script tag or small bundles

## License

MIT
