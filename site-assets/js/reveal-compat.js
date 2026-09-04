/* 5041 documentation-mode compatibility layer for legacy Reveal.js modules. */
(function () {
  const handlers = new Map();
  let currentSlide = null;
  let observerStarted = false;

  function leafSlides() {
    return Array.from(document.querySelectorAll('.reveal .slides section')).filter(
      (section) => !section.querySelector(':scope > section')
    );
  }

  function emit(name, detail) {
    (handlers.get(name) || []).forEach((fn) => {
      try { fn(detail); } catch (err) { console.error(err); }
    });
  }

  function activate(section, scroll) {
    if (!section) return;
    const previousSlide = currentSlide;
    currentSlide = section;
    if (scroll) section.scrollIntoView({behavior: 'smooth', block: 'start'});
    if (previousSlide !== section) emit('slidechanged', {previousSlide, currentSlide: section});
  }

  function startObserver() {
    if (observerStarted) return;
    observerStarted = true;
    const start = () => {
      const slides = leafSlides();
      if (!slides.length) return;
      currentSlide = currentSlide || slides[0];
      if (!('IntersectionObserver' in window)) return;
      const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if (visible && visible.intersectionRatio >= 0.35) activate(visible.target, false);
      }, {rootMargin: '-15% 0px -45% 0px', threshold: [0.35, 0.55, 0.75]});
      slides.forEach(s => observer.observe(s));
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
  }

  window.RevealMarkdown = window.RevealMarkdown || {};
  window.RevealNotes = window.RevealNotes || {};
  window.Reveal = {
    initialize(options) {
      window.__legacyRevealOptions = options || {};
      startObserver();
      const ready = () => emit('ready', {currentSlide: currentSlide || leafSlides()[0] || null});
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true}); else setTimeout(ready,0);
      return Promise.resolve();
    },
    on(name, fn) {
      if (!handlers.has(name)) handlers.set(name, []);
      handlers.get(name).push(fn);
      startObserver();
      return this;
    },
    off(name, fn) {
      const list = handlers.get(name) || [];
      handlers.set(name, list.filter(item => item !== fn));
      return this;
    },
    getIndices(element) {
      const slides = leafSlides();
      const exact = slides.indexOf(element);
      if (exact >= 0) return {h: exact, v: 0};
      const contained = slides.findIndex(s => element && (s.contains(element) || element.contains(s)));
      return {h: Math.max(0, contained), v: 0};
    },
    slide(h, v) {
      const slides = leafSlides();
      activate(slides[Math.max(0, Math.min(slides.length - 1, Number(h) || 0))], true);
    },
    getCurrentSlide() { return currentSlide || leafSlides()[0] || null; },
    isReady() { return true; },
    configure() { return this; }
  };
})();
