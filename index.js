/**
 * shopify-drag-carousel — lightweight drag-scroll behavior for horizontal containers.
 * Zero dependencies. Works in Liquid, vanilla JS, or any stack without a bundler.
 */

const initialized = new WeakSet();

class DragCarousel {
  /**
   * @param {string | Element | null} selectorOrElement - CSS selector or DOM element
   * @param {{ speed?: number, buttons?: { prev?: string, next?: string } | null }} [options]
   */
  constructor(selectorOrElement, options = {}) {
    this.element =
      typeof selectorOrElement === 'string'
        ? document.querySelector(selectorOrElement)
        : selectorOrElement;

    this.options = {
      speed: 1.5,
      buttons: null,
      ...options,
    };

    /** @private */
    this._dragging = false;
    /** @private */
    this._startX = 0;
    /** @private */
    this._startScroll = 0;
    /** @private */
    this._onMouseDown = null;
    /** @private */
    this._onTouchStart = null;
    /** @private */
    this._boundMove = null;
    /** @private */
    this._boundStop = null;
    /** @private */
    this._boundTouchMove = null;
    /** @private */
    this._boundTouchEnd = null;

    if (!this.element || initialized.has(this.element)) {
      return;
    }

    this.init();
  }

  init() {
    if (!this.element || initialized.has(this.element)) {
      return;
    }
    initialized.add(this.element);
    this.applyStyles();
    this.bindEvents();
    if (this.options.buttons) {
      this.bindButtons();
    }
  }

  applyStyles() {
    const el = this.element;
    el.style.overflowX = 'auto';
    el.style.cursor = 'grab';
    el.style.scrollBehavior = DragCarousel.scrollBehaviorOption();
  }

  /**
   * Use smooth scrolling unless the user prefers reduced motion.
   * @returns {'smooth' | 'auto'}
   */
  static scrollBehaviorOption() {
    if (typeof matchMedia === 'undefined') return 'smooth';
    return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  bindEvents() {
    this._onMouseDown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      this.stopMouse();
      this.start(e.clientX);
      this._boundMove = (ev) => this.move(ev.clientX);
      this._boundStop = () => this.stopMouse();
      window.addEventListener('mousemove', this._boundMove, { passive: true });
      window.addEventListener('mouseup', this._boundStop, { passive: true });
    };

    this._onTouchStart = (e) => {
      if (!e.touches.length) return;
      this.stopTouch();
      this.start(e.touches[0].clientX);
      this._boundTouchMove = (ev) => {
        if (!this._dragging) return;
        if (!ev.touches.length) return;
        ev.preventDefault();
        this.move(ev.touches[0].clientX);
      };
      this._boundTouchEnd = () => this.stopTouch();
      window.addEventListener('touchmove', this._boundTouchMove, { passive: false });
      window.addEventListener('touchend', this._boundTouchEnd, { passive: true });
      window.addEventListener('touchcancel', this._boundTouchEnd, { passive: true });
    };

    this.element.addEventListener('mousedown', this._onMouseDown);
    this.element.addEventListener('touchstart', this._onTouchStart, { passive: true });
  }

  /**
   * @param {number} clientX
   */
  start(clientX) {
    this._dragging = true;
    this.element.classList.add('dragging');
    // Pointer-driven drag must be instant; CSS smooth would fight 1:1 tracking.
    this.element.style.scrollBehavior = 'auto';
    this._startX = clientX;
    this._startScroll = this.element.scrollLeft;
  }

  /**
   * @param {number} clientX
   */
  move(clientX) {
    if (!this._dragging) return;
    const delta = clientX - this._startX;
    const left = this._startScroll - delta * this.options.speed;
    this.element.scrollTo({ left, behavior: 'auto' });
  }

  stop() {
    this._dragging = false;
    this.element.classList.remove('dragging');
    this.element.style.scrollBehavior = DragCarousel.scrollBehaviorOption();
  }

  stopMouse() {
    if (this._boundMove) {
      window.removeEventListener('mousemove', this._boundMove);
    }
    if (this._boundStop) {
      window.removeEventListener('mouseup', this._boundStop);
    }
    this._boundMove = null;
    this._boundStop = null;
    this.stop();
  }

  stopTouch() {
    if (this._boundTouchMove) {
      window.removeEventListener('touchmove', this._boundTouchMove);
    }
    if (this._boundTouchEnd) {
      window.removeEventListener('touchend', this._boundTouchEnd);
      window.removeEventListener('touchcancel', this._boundTouchEnd);
    }
    this._boundTouchMove = null;
    this._boundTouchEnd = null;
    this.stop();
  }

  bindButtons() {
    const cfg = this.options.buttons;
    if (!cfg) return;

    const el = this.element;
    const step = () => el.clientWidth;

    const behavior = DragCarousel.scrollBehaviorOption();

    if (cfg.prev) {
      const prevEl = document.querySelector(cfg.prev);
      if (prevEl) {
        prevEl.addEventListener('click', () => {
          el.scrollBy({ left: -step(), behavior });
        });
      }
    }
    if (cfg.next) {
      const nextEl = document.querySelector(cfg.next);
      if (nextEl) {
        nextEl.addEventListener('click', () => {
          el.scrollBy({ left: step(), behavior });
        });
      }
    }
  }

  /**
   * Whether this element was already enhanced.
   * @param {Element} el
   * @returns {boolean}
   */
  static isInitialized(el) {
    return initialized.has(el);
  }

  /**
   * Scan the document for `.drag-carousel` and initialize any not yet handled.
   * Useful after dynamic content (e.g. Shopify section reloads).
   */
  static initAll() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.drag-carousel').forEach((el) => {
      if (!initialized.has(el)) {
        void new DragCarousel(el);
      }
    });
  }
}

function autoInit() {
  DragCarousel.initAll();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DragCarousel;
}
if (typeof window !== 'undefined') {
  window.DragCarousel = DragCarousel;
}
