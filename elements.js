
class LiveViewportElement extends HTMLElement {
  constructor() {
    super();

    this.root = this.attachShadow({mode: 'open'});
    this.root.innerHTML = `
<style>
  #all {
    width: 100%;
    height: 100%;
  }
  #host {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: calc(var(--viewport-width, 1280px) / -2);
    margin-top: calc(var(--viewport-height, 720px) / -2);
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.33);
    width: var(--viewport-width, 1280px);
    height: var(--viewport-height, 720px);
    position: relative;
    display: block;
  }
  #host #content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
<div id="all">
  <div id="host">
    <div id="content">
      <slot></slot>
    </div>
  </div>
</div>
    `;

    this._host = this.root.getElementById('host');
    window.addEventListener('resize', () => this._resize());
    this._resize();
  }

  _resize() {
    // TODO: we just assume these targets for now
    const targetWidth = 1280;
    const targetHeight = 720;

    // give some leeway: this allows my MBP 13" to render the site without resize in Chrome
    const allowedPadding = 16;
    const ratioWidth = window.innerWidth / (targetWidth - allowedPadding * 2);
    const ratioHeight = window.innerHeight / (targetHeight - allowedPadding * 2);

    if (ratioWidth >= 1.0 && ratioHeight >= 1.0) {
      this._host.style.transform = null;
    } else {
      const min = Math.min(ratioWidth, ratioHeight);
      this._host.style.transform = `scale(${min})`;
    }
  }
}

class LiveTalkElement extends HTMLElement {
  static get observedAttributes() { return ['active', 'heading']; }

  constructor() {
    super();

    this.root = this.attachShadow({mode: 'open'});
    this.root.innerHTML = `
<style>
  :host {
    user-select: none;
  }
  ::slotted(article:not(.active)) {
    display: none;
  }
  #slides {
    height: 100%;
    display: flex;
    flex-flow: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  main {
    flex-grow: 1;
  }
  header {
    padding: 0.6em;
    border-bottom: 4px solid #ccc;
    margin: 0 1em 0;
    font-weight: 600;
    color: #666;
    display: flex;
  }
  h1 {
    font: inherit;
    margin: 0;
    flex-grow: 1;
  }

  #slides.feature .feature-hide {
    display: none;
  }
  #slides.feature main {
    flex-grow: 0;
  }

  small {
    font: inherit;
    transform: scale(0.66);
    display: inline-block;
  }
</style>
<div id="slides">
  <header class="feature-hide">
    <h1 id="heading">?</h1>
    <aside>
      <span id="current">?</span>
      <small>/</small>
      <span id="total">?</span>
    </aside>
  </header>
  <main>
    <slot name="slide">
    </slot>
  </main>
  <footer class="feature-hide"></footer>
</div>
    `;

    const mo = new MutationObserver(() => this._updateSlides());
    mo.observe(this, {childList: true});

    this._slidesEl = this.root.getElementById('slides');
    this._currentEl = this.root.getElementById('current');
    this._totalEl = this.root.getElementById('total');
    this._headingEl = this.root.getElementById('heading');
    this._total = 0;
    this._slideWasActive = undefined;

    this._updateSlides();
  }

  set active(v) {
    if (v && +v === v) {
      this.setAttribute('active', v);
    } else {
      this.removeAttribute('active');
    }
  }

  get active() {
    const v = +this.getAttribute('active');
    return isFinite(v) ? v : null;
  }

  get total() {
    return this._total;
  }

  next() {
    ++this.active;
  }

  _updateSlides() {
    const children = Array.from(this.children).filter((x) => x.localName === 'article');
    const active = this.active;
    let slide = null;
    children.forEach((child, i) => {
      if (i === active) {
        slide = child;
        child.classList.add('active');
      } else {
        child.classList.remove('active');
      }
    });

    this._total = children.length;
    this._currentEl.textContent = active + 1;
    this._totalEl.textContent = this._total;

    if (active >= this._total) {
      this._currentEl.textContent += '?';
    }

    const isFeature = slide && slide.hasAttribute('feature');
    this._slidesEl.classList.toggle('feature', isFeature);

    this._headingEl.textContent = this.getAttribute('heading');

    if (active === this._slideWasActive) {
      return;
    }
    this._slideWasActive = active;
    // TODO: could do reveal stuff here
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    this._updateSlides();
  }
}

customElements.define('live-viewport', LiveViewportElement);
customElements.define('live-talk', LiveTalkElement);