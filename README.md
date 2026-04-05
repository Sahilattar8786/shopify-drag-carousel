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

```js
const DragCarousel = require("shopify-drag-carousel");
```

---

## Quick start (browser)

1. Add a horizontal row of children (your own layout: flex, grid, etc.).
2. Put the library on the page, then add class **`drag-carousel`** to the scroll container.

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/shopify-drag-carousel@1/style.css"
/>
<div class="drag-carousel">
  <div>Slide A</div>
  <div>Slide B</div>
  <div>Slide C</div>
</div>
<script src="https://cdn.jsdelivr.net/npm/shopify-drag-carousel@1/index.js"></script>
```

After load, `window.DragCarousel` is available. Auto-init runs on `DOMContentLoaded` for every `.drag-carousel`.

**Manual init** (e.g. custom speed or arrows):

```html
<div id="strip"></div>
<button type="button" id="prev" aria-label="Previous">←</button>
<button type="button" id="next" aria-label="Next">→</button>
<script src="https://cdn.jsdelivr.net/npm/shopify-drag-carousel@1/index.js"></script>
<script>
  new DragCarousel("#strip", {
    speed: 1.5,
    buttons: { prev: "#prev", next: "#next" },
  });
</script>
```

Do **not** put `class="drag-carousel"` on the same node if you also call `new DragCarousel` on it with options (avoid double init).

---

## CDN URLs

Use a **major** tag (`@1`) or pin an exact version (`@1.0.0`) in production.

| Asset | jsDelivr | unpkg |
| ----- | -------- | ----- |
| Script | [cdn.jsdelivr.net/npm/shopify-drag-carousel@1/index.js](https://cdn.jsdelivr.net/npm/shopify-drag-carousel@1/index.js) | [unpkg.com/shopify-drag-carousel@1/index.js](https://unpkg.com/shopify-drag-carousel@1/index.js) |
| Styles (optional) | [cdn.jsdelivr.net/npm/shopify-drag-carousel@1/style.css](https://cdn.jsdelivr.net/npm/shopify-drag-carousel@1/style.css) | [unpkg.com/shopify-drag-carousel@1/style.css](https://unpkg.com/shopify-drag-carousel@1/style.css) |

---

## Live example (bundled demo)

The package includes HTML examples under **`examples/`**:

| Demo | What it is |
| ---- | ----------- |
| **[examples/demo-cdn.html](https://unpkg.com/shopify-drag-carousel@1/examples/demo-cdn.html)** | Full page on **unpkg** — loads the library from the CDN, fetches sample products from [api.escuelajs.co](https://api.escuelajs.co/docs), drag + prev/next. Requires the version to exist on [npm](https://www.npmjs.com/package/shopify-drag-carousel). |
| **`examples/demo.html`** | Same UI with **relative** script paths — run a static server from the repo root (see below). |

**Run the local demo** (clone or `npm install shopify-drag-carousel`, then serve the **package root** over `http://`, not `file://`):

```bash
npm run demo
```

Open [http://localhost:5173/examples/demo.html](http://localhost:5173/examples/demo.html) — or [http://localhost:5173/demo.html](http://localhost:5173/demo.html), which redirects to the example folder.

---

## Shopify (Liquid)

Load the script and optional CSS in your theme (e.g. `theme.liquid` or section assets).

```liquid
<div class="drag-carousel">
  {% for product in collections.frontpage.products %}
    <div>{{ product.title }}</div>
  {% endfor %}
</div>
```

Style the row/cards yourself (flex, grid, etc.). After **dynamic** HTML (e.g. section AJAX), call:

```js
DragCarousel.initAll();
```

---

## API

### `new DragCarousel(selectorOrElement, options?)`

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `speed` | `number` | `1.5` | Multiplier for pointer movement vs. scroll |
| `buttons` | `object` | `null` | `{ prev: string, next: string }` — any valid `querySelector` string |

Selectors resolve with `document.querySelector` (first match).

### `DragCarousel.initAll()`

Initializes every `.drag-carousel` in the document that is not already initialized. Use after injecting new markup.

### `DragCarousel.isInitialized(element)`

Returns whether the element already has carousel behavior.

---

## Constraints

- No React required; no bundler required for browser usage
- Intended for direct use via `<script>` or small bundles

## License

MIT
