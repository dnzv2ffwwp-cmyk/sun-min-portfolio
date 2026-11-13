(() => {
  function enableAutoplay(root, advance, delay = 4500){
    let timer = 0;
    let hovering = false;
    let focused = false;
    let pressed = false;

    function stop(){
      window.clearInterval(timer);
      timer = 0;
    }

    function start(){
      stop();
      if(!document.hidden && !hovering && !focused && !pressed){
        timer = window.setInterval(advance, delay);
      }
    }

    root.addEventListener('mouseenter', () => { hovering = true; stop(); });
    root.addEventListener('mouseleave', () => { hovering = false; start(); });
    root.addEventListener('focusin', () => { focused = true; stop(); });
    root.addEventListener('focusout', event => {
      if(!root.contains(event.relatedTarget)){
        focused = false;
        start();
      }
    });
    root.addEventListener('pointerdown', () => { pressed = true; stop(); });
    window.addEventListener('pointerup', () => { pressed = false; start(); });
    window.addEventListener('pointercancel', () => { pressed = false; start(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  }

  const carousel = document.querySelector('[data-banner-carousel]');
  if(carousel){
    const track = carousel.querySelector('[data-banner-track]');
    const slides = [...track.querySelectorAll('figure')];
    const count = document.querySelector('[data-banner-count]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;

    function updateCurrent(){
      current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
      count.textContent = `${String(current + 1).padStart(2, '0')} — ${String(slides.length).padStart(2, '0')}`;
    }

    function showSlide(index){
      const next = (index + slides.length) % slides.length;
      track.scrollTo({
        left: slides[next].offsetLeft - slides[0].offsetLeft,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
      current = next;
      count.textContent = `${String(next + 1).padStart(2, '0')} — ${String(slides.length).padStart(2, '0')}`;
    }

    carousel.querySelector('[data-banner-prev]').addEventListener('click', () => showSlide(current - 1));
    carousel.querySelector('[data-banner-next]').addEventListener('click', () => showSlide(current + 1));
    track.addEventListener('scroll', updateCurrent, {passive: true});
    track.addEventListener('keydown', event => {
      if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
        event.preventDefault();
        showSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    window.addEventListener('resize', () => showSlide(current), {passive: true});
    enableAutoplay(carousel, () => showSlide(current + 1));
  }

  document.querySelectorAll('[data-work-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-work-track], [data-detail-track]');
    const slides = [...track.children];
    const previous = carousel.querySelector('[data-work-prev], [data-detail-prev]');
    const next = carousel.querySelector('[data-work-next], [data-detail-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let scrollTimer = 0;

    const before = document.createDocumentFragment();
    const after = document.createDocumentFragment();
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      if(clone.matches('a')) clone.tabIndex = -1;
      before.appendChild(clone);
    });
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      if(clone.matches('a')) clone.tabIndex = -1;
      after.appendChild(clone);
    });
    track.insertBefore(before, track.firstChild);
    track.appendChild(after);

    const items = [...track.children];
    const origin = slides.length;

    function itemLeft(index){
      return items[index].offsetLeft - items[0].offsetLeft;
    }

    function showOriginal(index, instant = false){
      track.scrollTo({
        left: itemLeft(origin + index),
        behavior: instant || reducedMotion.matches ? 'auto' : 'smooth'
      });
    }

    function move(direction){
      const target = origin + current + direction;
      current = (current + direction + slides.length) % slides.length;
      track.scrollTo({
        left: itemLeft(target),
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    }

    function normalizePosition(){
      const step = items[1] ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
      const rawIndex = Math.round(track.scrollLeft / step);
      current = ((rawIndex - origin) % slides.length + slides.length) % slides.length;
      if(rawIndex < origin || rawIndex >= origin + slides.length) showOriginal(current, true);
    }

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(normalizePosition, 140);
    }, {passive: true});
    track.addEventListener('keydown', event => {
      if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    window.addEventListener('resize', () => showOriginal(current, true), {passive: true});
    requestAnimationFrame(() => showOriginal(0, true));
    enableAutoplay(carousel, () => move(1));
  });

  document.querySelectorAll('[data-detail-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-work-track], [data-detail-track]');
    const slides = [...track.children];
    if (!slides.length) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const count = carousel.closest('section').querySelector('[data-banner-count]');
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.setAttribute('aria-label', carousel.getAttribute('aria-label') || track.getAttribute('aria-label'));
    for (const position of ['before', 'after']) {
      const fragment = document.createDocumentFragment();
      slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('inert', '');
        // Keep the adjoining copy ready before it enters the viewport.
        clone.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
        fragment.appendChild(clone);
      });
      if (position === 'before') track.prepend(fragment);
      else track.append(fragment);
    }
    const items = [...track.children];
    const origin = slides.length;
    let index = origin;
    let frame = 0;
    let settling = 0;
    let dragging = null;
    let suppressClick = false;
    let pendingMoves = [];
    const left = i => items[i].offsetLeft - items[0].offsetLeft;
    const step = () => left(1) - left(0);
    const logical = i => ((i - origin) % slides.length + slides.length) % slides.length;
    function updateCount() {
      if (count) count.textContent = `${String(logical(index) + 1).padStart(2, '0')} — ${String(slides.length).padStart(2, '0')}`;
    }
    function normalize() {
      const original = origin + logical(index);
      // Copies have the same visible order: rebase without animating backwards.
      index = original;
      track.scrollTo({ left: left(index), behavior: 'instant' });
      updateCount();
    }
    function animate(target) {
      cancelAnimationFrame(frame);
      clearTimeout(settling);
      index = Math.max(0, Math.min(items.length - 1, target));
      const from = track.scrollLeft;
      const distance = left(index) - from;
      const start = performance.now();
      const duration = reducedMotion.matches ? 0 : 420;
      function tick(now) {
        const progress = duration ? Math.min(1, (now - start) / duration) : 1;
        track.scrollLeft = from + distance * (1 - Math.pow(1 - progress, 3));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else {
          frame = 0;
          normalize();
          if (pendingMoves.length) move(pendingMoves.shift());
        }
      }
      frame = requestAnimationFrame(tick);
    }
    function move(direction) {
      if (dragging) return;
      if (frame) { pendingMoves.push(direction); return; }
      // Advance to the adjacent copy, including last → first and first → last.
      // Rebase only after the forward/backward transition has finished.
      animate(index + direction);
    }
    carousel.querySelector('[data-work-prev], [data-detail-prev]').addEventListener('click', () => move(-1));
    carousel.querySelector('[data-work-next], [data-detail-next]').addEventListener('click', () => move(1));
    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    track.addEventListener('dragstart', event => event.preventDefault());
    track.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      cancelAnimationFrame(frame); frame = 0;
      pendingMoves = [];
      clearTimeout(settling);
      suppressClick = false;
      dragging = { id: event.pointerId, x: event.clientX, scroll: track.scrollLeft, moved: false };
    });
    window.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== dragging.id) return;
      const delta = event.clientX - dragging.x;
      if (Math.abs(delta) > 6 && !dragging.moved) {
        dragging.moved = true;
        track.setPointerCapture(event.pointerId);
        track.classList.add('is-dragging');
      }
      if (dragging.moved) { event.preventDefault(); track.scrollLeft = dragging.scroll - delta; }
    }, { passive: false });
    function finishDrag(event) {
      if (!dragging || event.pointerId !== dragging.id) return;
      const moved = dragging.moved;
      dragging = null;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      if (moved) { suppressClick = true; animate(Math.round(track.scrollLeft / step())); }
    }
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    track.addEventListener('click', event => {
      if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    }, true);
    track.addEventListener('scroll', () => {
      clearTimeout(settling);
      if (!frame && !dragging) settling = window.setTimeout(() => animate(Math.round(track.scrollLeft / step())), 160);
    }, { passive: true });
    new ResizeObserver(() => {
      cancelAnimationFrame(frame); frame = 0;
      clearTimeout(settling);
      pendingMoves = [];
      normalize();
    }).observe(track);
    normalize();
    enableAutoplay(carousel, () => move(1), 4000);
  });

  if (window.location.hash === '#detail-page-title') {
    const detailSection = document.getElementById('detail-page-title');
    const alignDetailSection = () => {
      if (!detailSection) return;
      requestAnimationFrame(() => {
        const offset = window.matchMedia('(max-width: 760px)').matches ? 76 : 100;
        window.scrollTo({
          top: detailSection.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'instant'
        });
      });
    };
    window.addEventListener('load', alignDetailSection, { once: true });
    window.addEventListener('pageshow', alignDetailSection);
  }

})();
