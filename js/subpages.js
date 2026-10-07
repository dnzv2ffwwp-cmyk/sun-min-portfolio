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
    root.addEventListener('pointerup', () => { pressed = false; start(); });
    root.addEventListener('pointercancel', () => { pressed = false; start(); });
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
    const track = carousel.querySelector('[data-work-track]');
    const slides = [...track.querySelectorAll('figure')];
    const previous = carousel.querySelector('[data-work-prev]');
    const next = carousel.querySelector('[data-work-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let scrollTimer = 0;

    const before = document.createDocumentFragment();
    const after = document.createDocumentFragment();
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      before.appendChild(clone);
    });
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      after.appendChild(clone);
    });
    track.insertBefore(before, track.firstChild);
    track.appendChild(after);

    const items = [...track.querySelectorAll('figure')];
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

  const detailCarousel = document.querySelector('[data-detail-carousel]');
  if(detailCarousel){
    const track = detailCarousel.querySelector('[data-detail-track]');
    const cards = [...track.querySelectorAll('.detail-card')];
    const shouldSlide = cards.length >= 4;
    detailCarousel.classList.toggle('is-static', !shouldSlide);

    if(!shouldSlide){
      track.removeAttribute('tabindex');
      track.setAttribute('aria-label', '상세페이지 카드 목록');
    }

    if(shouldSlide){
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = Math.min(1, cards.length - 1);
    let scrollTimer = 0;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let dragging = false;
    let moved = false;
    let suppressClick = false;

    function nearestCard(){
      const center = track.scrollLeft + track.clientWidth / 2;
      return cards.reduce((best, card, index) =>
        Math.abs(card.offsetLeft + card.clientWidth / 2 - center)
          < Math.abs(cards[best].offsetLeft + cards[best].clientWidth / 2 - center)
          ? index : best, 0);
    }

    function showCard(index, instant = false){
      current = (index + cards.length) % cards.length;
      const card = cards[current];
      const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
      track.scrollTo({left, behavior: instant || reducedMotion.matches ? 'auto' : 'smooth'});
    }

    detailCarousel.querySelector('[data-detail-prev]').addEventListener('click', () => showCard(current - 1));
    detailCarousel.querySelector('[data-detail-next]').addEventListener('click', () => showCard(current + 1));
    track.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => { current = nearestCard(); }, 120);
    }, {passive: true});
    track.addEventListener('keydown', event => {
      if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
        event.preventDefault();
        showCard(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    track.addEventListener('pointerdown', event => {
      if(event.pointerType !== 'mouse' || event.button !== 0) return;
      dragging = true;
      moved = false;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
    });
    track.addEventListener('pointermove', event => {
      if(!dragging) return;
      if(!moved && Math.abs(event.clientX - dragStartX) > 5){
        moved = true;
        track.setPointerCapture(event.pointerId);
      }
      if(moved){
        track.classList.add('is-dragging');
        track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
      }
    });
    function endDrag(event){
      if(!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if(track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      if(moved){
        suppressClick = true;
        showCard(nearestCard());
        window.setTimeout(() => { suppressClick = false; }, 200);
      }
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', event => {
      if(suppressClick){
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }
    }, true);
    window.addEventListener('resize', () => showCard(current, true), {passive: true});
    requestAnimationFrame(() => showCard(current, true));
    enableAutoplay(detailCarousel, () => showCard(current + 1));
    }
  }

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
