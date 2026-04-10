/**
 * drag-scroll-carousel — lightweight drag-scroll behavior for horizontal containers.
 * Zero dependencies. Works in Liquid, vanilla JS, or any stack without a bundler.
 */

const initialized = new WeakSet();

class DragCarousel {
  /**
   * @param {string | Element | null} selectorOrElement - CSS selector or DOM element
   * @param {{
   *   speed?: number,
   *   buttons?: { prev?: string, next?: string } | null,
   *   centerMode?: boolean,
   *   loop?: boolean,
   *   slideSelector?: string | null,
   *   minLoopSlides?: number
   * }} [options]
   */
  constructor(selectorOrElement, options = {}) {
    this.element =
      typeof selectorOrElement === 'string'
        ? document.querySelector(selectorOrElement)
        : selectorOrElement;

    this.options = {
      speed: 1.5,
      buttons: null,
      centerMode: false,
      loop: false,
      slideSelector: null,
      minLoopSlides: 3,
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
    /** @private */
    this._prevButtonEl = null;
    /** @private */
    this._nextButtonEl = null;
    /** @private */
    this._onPrevClick = null;
    /** @private */
    this._onNextClick = null;
    /** @private */
    this._onLoopScroll = null;
    /** @private */
    this._loopSpan = 0;
    /** @private */
    this._loopPrefix = 0;
    /** @private */
    this._isDestroying = false;

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
    this.setupLoop();
    this.bindEvents();
    if (this.options.buttons) {
      this.bindButtons();
    }
    if (this.options.centerMode) {
      this.snapToClosest();
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
    if (this.options.centerMode && !this._isDestroying) {
      this.snapToClosest();
    }
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
      this._prevButtonEl = document.querySelector(cfg.prev);
      if (this._prevButtonEl) {
        this._onPrevClick = () => {
          if (this.options.centerMode) {
            this.shiftSlide(-1, behavior);
            return;
          }
          el.scrollBy({ left: -step(), behavior });
        };
        this._prevButtonEl.addEventListener('click', this._onPrevClick);
      }
    }
    if (cfg.next) {
      this._nextButtonEl = document.querySelector(cfg.next);
      if (this._nextButtonEl) {
        this._onNextClick = () => {
          if (this.options.centerMode) {
            this.shiftSlide(1, behavior);
            return;
          }
          el.scrollBy({ left: step(), behavior });
        };
        this._nextButtonEl.addEventListener('click', this._onNextClick);
      }
    }
  }

  getSlides(includeClones = false) {
    if (!this.element) return [];
    const all = this.options.slideSelector
      ? Array.from(this.element.querySelectorAll(this.options.slideSelector))
      : Array.from(this.element.children);
    if (includeClones) return all;
    return all.filter((node) => node.dataset.dragCarouselClone !== '1');
  }

  static outerWidth(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    const marginLeft = Number.parseFloat(style.marginLeft) || 0;
    const marginRight = Number.parseFloat(style.marginRight) || 0;
    return rect.width + marginLeft + marginRight;
  }

  setupLoop() {
    if (!this.options.loop || !this.element || typeof window === 'undefined') return;
    const originals = this.getSlides(false);
    if (!originals.length) return;

    const minSlides = Math.max(1, Number(this.options.minLoopSlides) || 1);
    const seed = [...originals];
    const expanded = [...seed];
    while (expanded.length < minSlides) {
      expanded.push(...seed);
    }

    const buildClone = (node) => {
      const clone = node.cloneNode(true);
      clone.dataset.dragCarouselClone = '1';
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    };

    const prependClones = expanded.map(buildClone);
    const appendClones = expanded.map(buildClone);

    for (let i = prependClones.length - 1; i >= 0; i -= 1) {
      this.element.insertBefore(prependClones[i], this.element.firstChild);
    }
    appendClones.forEach((clone) => this.element.appendChild(clone));

    this._loopPrefix = prependClones.reduce((sum, node) => sum + DragCarousel.outerWidth(node), 0);
    this._loopSpan = this.getSlides(false).reduce((sum, node) => sum + DragCarousel.outerWidth(node), 0);
    this.element.scrollLeft += this._loopPrefix;

    this._onLoopScroll = () => {
      const left = this.element.scrollLeft;
      const start = this._loopPrefix;
      const end = this._loopPrefix + this._loopSpan;
      if (left < start - 1) {
        this.element.scrollLeft = left + this._loopSpan;
      } else if (left > end + 1) {
        this.element.scrollLeft = left - this._loopSpan;
      }
    };
    this.element.addEventListener('scroll', this._onLoopScroll, { passive: true });
  }

  getClosestSlideIndex(slides) {
    if (!slides.length) return -1;
    const center = this.element.scrollLeft + this.element.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    slides.forEach((slide, idx) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(slideCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }

  scrollSlideToCenter(slide, behavior = DragCarousel.scrollBehaviorOption()) {
    if (!slide) return;
    const left = slide.offsetLeft - (this.element.clientWidth - slide.offsetWidth) / 2;
    this.element.scrollTo({ left, behavior });
  }

  shiftSlide(delta, behavior = DragCarousel.scrollBehaviorOption()) {
    const slides = this.getSlides(false);
    if (!slides.length) return;
    const current = this.getClosestSlideIndex(slides);
    if (current < 0) return;
    let target = current + delta;
    if (this.options.loop) {
      const len = slides.length;
      target = ((target % len) + len) % len;
    } else {
      target = Math.max(0, Math.min(slides.length - 1, target));
    }
    this.scrollSlideToCenter(slides[target], behavior);
  }

  snapToClosest() {
    const slides = this.getSlides(false);
    const idx = this.getClosestSlideIndex(slides);
    if (idx >= 0) {
      this.scrollSlideToCenter(slides[idx], DragCarousel.scrollBehaviorOption());
    }
  }

  /**
   * Remove listeners and mark this element as uninitialized.
   * Useful in frameworks (e.g. React) when components unmount.
   */
  destroy() {
    if (!this.element) return;
    this._isDestroying = true;

    this.stopMouse();
    this.stopTouch();

    if (this._onMouseDown) {
      this.element.removeEventListener('mousedown', this._onMouseDown);
      this._onMouseDown = null;
    }
    if (this._onTouchStart) {
      this.element.removeEventListener('touchstart', this._onTouchStart);
      this._onTouchStart = null;
    }

    if (this._prevButtonEl && this._onPrevClick) {
      this._prevButtonEl.removeEventListener('click', this._onPrevClick);
    }
    if (this._nextButtonEl && this._onNextClick) {
      this._nextButtonEl.removeEventListener('click', this._onNextClick);
    }
    if (this._onLoopScroll) {
      this.element.removeEventListener('scroll', this._onLoopScroll);
      this._onLoopScroll = null;
    }
    this.getSlides(true)
      .filter((node) => node.dataset.dragCarouselClone === '1')
      .forEach((node) => node.remove());

    this._prevButtonEl = null;
    this._nextButtonEl = null;
    this._onPrevClick = null;
    this._onNextClick = null;
    this._loopPrefix = 0;
    this._loopSpan = 0;
    this._isDestroying = false;

    initialized.delete(this.element);
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
  module.exports.default = DragCarousel;
}
if (typeof window !== 'undefined') {
  window.DragCarousel = DragCarousel;
}
