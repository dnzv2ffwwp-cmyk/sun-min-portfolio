(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  const categoryBar = document.querySelector('[data-sticky-nav]');

  const closeMenu = () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    navigation?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    navigation?.classList.toggle('is-open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
  });

  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  }, { passive: true });

  const updatePageChrome = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    if (!categoryBar) return;
    const stickyTop = Number.parseFloat(getComputedStyle(categoryBar).top) || 0;
    const isSticky = categoryBar.getBoundingClientRect().top <= stickyTop + 1 && window.scrollY > 24;
    categoryBar.classList.toggle('is-sticky', isSticky);
    header?.classList.toggle('is-hidden', isSticky);
  };
  updatePageChrome();
  window.addEventListener('scroll', updatePageChrome, { passive: true });
  window.addEventListener('resize', updatePageChrome, { passive: true });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollProgress = document.querySelector('.scroll-progress i');
  let scrollFrame = 0;

  const updateScrollEffects = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
    scrollProgress?.style.setProperty('transform', `scaleX(${progress})`);
    scrollFrame = 0;
  };
  const requestScrollEffects = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollEffects);
  };
  updateScrollEffects();
  window.addEventListener('scroll', requestScrollEffects, { passive: true });
  window.addEventListener('resize', requestScrollEffects, { passive: true });

  document.querySelectorAll('.capability-grid, .works-grid, .project__info, .profile__facts').forEach(group => {
    [...group.children].forEach((item, index) => item.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 90}ms`));
  });

  if (!reducedMotion.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.work-card').forEach(card => {
      const surface = card.querySelector('figure');
      if (!surface) return;
      card.addEventListener('pointermove', event => {
        const rect = surface.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        surface.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`);
        surface.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
        surface.style.setProperty('--shine-x', `${x * 100}%`);
        surface.style.setProperty('--shine-y', `${y * 100}%`);
        card.classList.add('is-interacting');
      });
      card.addEventListener('pointerleave', () => {
        surface.style.setProperty('--tilt-x', '0deg');
        surface.style.setProperty('--tilt-y', '0deg');
        card.classList.remove('is-interacting');
      });
    });
  }

  document.querySelectorAll('[data-visual-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const previous = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const cards = [...track.querySelectorAll('.asset-card')];
    let dragging = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;

    const cardStep = () => {
      const firstCard = cards[0];
      if (!firstCard) return track.clientWidth;
      const styles = getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const move = direction => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      if (direction > 0 && track.scrollLeft >= maxScroll - 2) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      if (direction < 0 && track.scrollLeft <= 2) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
        return;
      }
      track.scrollBy({ left: direction * cardStep(), behavior: 'smooth' });
    };

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    track.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      dragging = true;
      dragged = false;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener('pointermove', event => {
      if (!dragging) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) dragged = true;
      track.scrollLeft = startScroll - distance;
    });
    const endDrag = event => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      window.setTimeout(() => { dragged = false; }, 0);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    cards.forEach(card => card.addEventListener('click', event => {
      if (dragged) event.preventDefault();
    }));

  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }
})();
