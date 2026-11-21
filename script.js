(() => {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  const categoryBar = document.querySelector('[data-sticky-nav]');
  const aboutSection = document.querySelector('#about');

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
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (header?.classList.contains('is-compact') && !header.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  }, { passive: true });

  const updatePageChrome = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    if (header && aboutSection) {
      const compact = aboutSection.getBoundingClientRect().top <= 100;
      if (header.classList.contains('is-compact') !== compact) closeMenu();
      header.classList.toggle('is-compact', compact);
    }
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

  document.querySelectorAll('[data-device-slider]').forEach(slider => {
    const track = slider.querySelector('[data-device-track]');
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let touchStartX = 0;

    const slideTo = index => {
      const count = track.children.length;
      const target = Math.max(0, Math.min(count - 1, index));
      track.scrollTo({ left: target * track.clientWidth, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    };

    track.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    });
    track.addEventListener('pointermove', event => {
      if (!dragging) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 5) moved = true;
      track.scrollLeft = startScroll - distance;
    });
    const finishDrag = event => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      slideTo(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)));
      window.setTimeout(() => { moved = false; }, 80);
    };
    track.addEventListener('pointerup', finishDrag);
    track.addEventListener('pointercancel', finishDrag);
    track.addEventListener('touchstart', event => {
      touchStartX = event.touches[0]?.clientX || 0;
      moved = false;
    }, { passive: true });
    track.addEventListener('touchmove', event => {
      const currentX = event.touches[0]?.clientX || touchStartX;
      if (Math.abs(currentX - touchStartX) > 7) moved = true;
    }, { passive: true });
    track.addEventListener('touchend', () => {
      window.setTimeout(() => { moved = false; }, 120);
    }, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const current = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      slideTo(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    slider.addEventListener('click', event => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    window.addEventListener('resize', () => slideTo(Math.round(track.scrollLeft / Math.max(1, track.clientWidth))), { passive: true });
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

  // Advance only after five seconds without interaction, even if the pointer stays over a card.
  const workAutoplay = (root, advance) => {
    let timer = 0;
    let visible = !('IntersectionObserver' in window);
    const stop = () => window.clearTimeout(timer);
    const start = () => {
      stop();
      if (!visible || document.hidden || reducedMotion.matches) return;
      timer = window.setTimeout(() => {
        if (!document.querySelector('dialog[open]')) advance(1);
        start();
      }, 5000);
    };
    ['pointermove', 'pointerdown', 'wheel', 'keydown', 'focusin'].forEach(type => {
      root.addEventListener(type, start, { passive: true });
    });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', start);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        start();
      }, { threshold: .15 }).observe(root);
    }
    start();
    return { start, stop };
  };

  document.querySelectorAll('[data-visual-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-carousel-track]');
    const previous = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const cards = [...track.querySelectorAll('.asset-card')];
    let dragging = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;

    const count = cards.length;
    if (!count) return;
    const copies = () => cards.map(card => {
      const copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.tabIndex = -1;
      return copy;
    });
    track.prepend(...copies());
    track.append(...copies());
    const items = [...track.children];
    if (carousel.closest('#banner, #popup, #poster')) {
      track.classList.add('is-continuous');
      let offset = 0;
      let lastTime = 0;
      let inView = !('IntersectionObserver' in window);
      let held = false;
      let originX = 0;
      let originOffset = 0;
      let didDrag = false;
      let manual = 0;
      const step = () => items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
      const base = () => items[count].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
      const render = () => {
        const cycle = base();
        if (!cycle) return;
        while (offset < cycle) offset += cycle;
        while (offset >= cycle * 2) offset -= cycle;
        track.scrollLeft = offset;
      };
      const tick = now => {
        const elapsed = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
        lastTime = now;
        if (inView && !held && !track.querySelector('a:focus-visible') && !document.hidden && !document.querySelector('dialog[open]')) {
          if (!reducedMotion.matches && !track.querySelector('.asset-card--detail:hover')) offset += 24 * elapsed;
          if (manual) {
            const delta = Math.sign(manual) * Math.min(Math.abs(manual), Math.max(1, step() * 2.5 * elapsed));
            offset += delta;
            manual -= delta;
          }
          render();
        }
        requestAnimationFrame(tick);
      };
      const nudge = direction => {
        if (reducedMotion.matches) { offset += direction * step(); render(); }
        else manual += direction * step();
      };
      previous.addEventListener('click', () => nudge(-1));
      next.addEventListener('click', () => nudge(1));
      track.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        nudge(event.key === 'ArrowRight' ? 1 : -1);
      });
      track.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        held = true; didDrag = false; manual = 0;
        originX = event.clientX; originOffset = offset;
      });
      track.addEventListener('pointermove', event => {
        if (!held) return;
        const distance = event.clientX - originX;
        if (!didDrag) {
          if (Math.abs(distance) <= 4) return;
          didDrag = true;
          track.setPointerCapture(event.pointerId);
        }
        offset = originOffset - distance;
        // Wrap by a full repeated set without changing the pointer's reference position.
        const before = offset;
        render();
        originOffset += offset - before;
      });
      const release = event => {
        held = false;
        if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
        window.setTimeout(() => { didDrag = false; }, 0);
      };
      track.addEventListener('pointerup', release);
      track.addEventListener('pointercancel', release);
      track.addEventListener('dragstart', event => event.preventDefault());
      track.addEventListener('click', event => { if (didDrag) event.preventDefault(); }, true);
      track.addEventListener('wheel', event => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault(); offset += event.deltaX; render();
      }, { passive: false });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }, { threshold: .05 }).observe(carousel);
      }
      window.addEventListener('resize', () => { offset = base(); render(); }, { passive: true });
      offset = base();
      render();
      requestAnimationFrame(tick);
      return;
    }
    let current = 0;
    let moving = false;
    let settling = 0;
    const position = index => items[index].offsetLeft - items[0].offsetLeft;
    const jump = index => track.scrollTo({ left: position(index), behavior: 'instant' });
    const normalize = () => {
      if (dragging) return;
      const step = position(1);
      if (!step) return;
      const index = Math.round(track.scrollLeft / step);
      current = ((index - count) % count + count) % count;
      if (index < count || index >= count * 2) jump(count + current);
      moving = false;
    };
    const move = direction => {
      if (moving || dragging) return;
      moving = true;
      track.scrollTo({
        left: position(count + current + direction),
        behavior: reducedMotion.matches ? 'instant' : 'smooth'
      });
      window.clearTimeout(settling);
      settling = window.setTimeout(normalize, 700);
    };
    workAutoplay(carousel, move);
    track.addEventListener('scroll', () => {
      window.clearTimeout(settling);
      settling = window.setTimeout(normalize, 160);
    }, { passive: true });
    track.addEventListener('focusin', event => {
      const index = cards.indexOf(event.target.closest('.asset-card'));
      if (index >= 0) {
        current = index;
        jump(count + current);
      }
    });
    window.addEventListener('resize', () => {
      moving = false;
      jump(count + current);
    }, { passive: true });
    requestAnimationFrame(() => jump(count));

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
    });
    track.addEventListener('pointermove', event => {
      if (!dragging) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) {
        dragged = true;
        track.setPointerCapture(event.pointerId);
      }
      track.scrollLeft = startScroll - distance;
    });
    const endDrag = event => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      window.clearTimeout(settling);
      settling = window.setTimeout(normalize, 160);
      window.setTimeout(() => { dragged = false; }, 0);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('click', event => {
      if (dragged) event.preventDefault();
    }, true);

  });

  document.querySelectorAll('[data-detail-slider]').forEach(slider => {
    const track = slider.querySelector('[data-detail-track]');
    const cards = [...track.children];
    const count = cards.length;
    if (!count) return;

    // Keep enough trailing copies for a 3.5-card viewport to reach the loop boundary.
    const copyCards = () => cards.map(card => {
      const copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.tabIndex = -1;
      copy.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      return copy;
    });
    track.prepend(...copyCards());
    track.append(...copyCards(), ...copyCards());
    const items = [...track.children];
    let current = 0;
    let settling = 0;
    let moving = false;
    let touching = false;
    let dragging = false;
    let dragged = false;
    let dragX = 0;
    let dragScroll = 0;
    let animation = 0;
    let restoring = 0;
    const position = index => items[index].getBoundingClientRect().left - items[0].getBoundingClientRect().left;
    const lockScroll = () => {
      cancelAnimationFrame(restoring);
      track.style.scrollSnapType = 'none';
      track.style.scrollBehavior = 'auto';
    };
    const restoreScroll = () => {
      restoring = requestAnimationFrame(() => {
        restoring = requestAnimationFrame(() => {
          if (moving || dragging) return;
          track.style.removeProperty('scroll-snap-type');
          track.style.removeProperty('scroll-behavior');
        });
      });
    };
    const jump = index => {
      lockScroll();
      track.scrollLeft = position(index);
      restoreScroll();
    };
    const normalize = () => {
      if (dragging || touching || animation) return;
      const step = position(1);
      if (!step) return;
      const index = Math.round(track.scrollLeft / step);
      current = ((index - count) % count + count) % count;
      if (index < count || index >= count * 2) {
        // Preserve the exact visible offset when swapping identical copies.
        lockScroll();
        track.scrollLeft += position(count + current) - position(index);
      }
      moving = false;
      restoreScroll();
    };
    const move = direction => {
      if (moving || dragging || touching) return;
      moving = true;
      lockScroll();
      const from = track.scrollLeft;
      const to = position(count + current + direction);
      const duration = reducedMotion.matches ? 0 : 520;
      const started = performance.now();
      const tick = now => {
        const progress = duration ? Math.min(1, (now - started) / duration) : 1;
        const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        track.scrollLeft = from + (to - from) * eased;
        if (progress < 1) {
          animation = requestAnimationFrame(tick);
        } else {
          animation = 0;
          normalize();
        }
      };
      animation = requestAnimationFrame(tick);
    };
    const { start, stop } = workAutoplay(slider, move);
    slider.querySelector('[data-detail-prev]').addEventListener('click', () => move(-1));
    slider.querySelector('[data-detail-next]').addEventListener('click', () => move(1));
    track.addEventListener('scroll', () => {
      window.clearTimeout(settling);
      settling = window.setTimeout(normalize, 160);
    }, { passive: true });
    track.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    track.addEventListener('focusin', event => {
      const index = cards.indexOf(event.target.closest('.detail-feature'));
      if (index >= 0) { current = index; jump(count + current); }
    });
    track.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      cancelAnimationFrame(animation);
      animation = 0;
      moving = false;
      lockScroll();
      dragging = true;
      dragged = false;
      dragX = event.clientX;
      dragScroll = track.scrollLeft;
      stop();
      track.classList.add('is-dragging');
    });
    track.addEventListener('pointermove', event => {
      if (!dragging) return;
      const distance = event.clientX - dragX;
      if (Math.abs(distance) > 5) {
        dragged = true;
        track.setPointerCapture(event.pointerId);
      }
      track.scrollLeft = dragScroll - distance;
    });
    const endDrag = event => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      window.clearTimeout(settling);
      settling = window.setTimeout(normalize, 160);
      window.setTimeout(() => { dragged = false; }, 0);
      start();
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('dragstart', event => event.preventDefault());
    track.addEventListener('click', event => {
      if (dragged) event.preventDefault();
    }, true);
    track.addEventListener('touchstart', () => { cancelAnimationFrame(animation); animation = 0; moving = false; restoreScroll(); touching = true; stop(); }, { passive: true });
    const endTouch = () => {
      touching = false;
      window.clearTimeout(settling);
      settling = window.setTimeout(normalize, 160);
      start();
    };
    track.addEventListener('touchend', endTouch, { passive: true });
    track.addEventListener('touchcancel', endTouch, { passive: true });
    window.addEventListener('resize', () => { moving = false; jump(count + current); }, { passive: true });
    requestAnimationFrame(() => jump(count));
    start();
  });

  const projectsSection = document.getElementById('projects');
  const projectFigmaButton = document.querySelector('[data-project-figma-button]');
  const figmaProjects = [...document.querySelectorAll('.project[data-figma-url]')];
  if (projectsSection && projectFigmaButton && figmaProjects.length) {
    const figmaName = projectFigmaButton.querySelector('[data-figma-name]');
    const figmaLabel = projectFigmaButton.querySelector('[data-figma-label]');
    let figmaFrame = 0;

    const updateProjectFigmaButton = () => {
      figmaFrame = 0;
      const sectionRect = projectsSection.getBoundingClientRect();
      const inProjects = sectionRect.top <= window.innerHeight * .45 && sectionRect.bottom > 120;
      projectFigmaButton.classList.toggle('is-visible', inProjects);
      projectFigmaButton.setAttribute('aria-hidden', String(!inProjects));
      projectFigmaButton.tabIndex = inProjects ? 0 : -1;
      if (!inProjects) return;

      const viewportCenter = window.innerHeight * .5;
      const currentProject = figmaProjects.reduce((closest, project) => {
        const rect = project.getBoundingClientRect();
        const distance = Math.abs((rect.top + rect.bottom) * .5 - viewportCenter);
        return !closest || distance < closest.distance ? { project, distance } : closest;
      }, null)?.project;
      if (!currentProject) return;

      const name = currentProject.dataset.figmaName;
      const label = currentProject.dataset.figmaLabel;
      projectFigmaButton.href = currentProject.dataset.figmaUrl;
      figmaName.textContent = name;
      figmaLabel.textContent = label;
      projectFigmaButton.setAttribute('aria-label', `${name} ${label} 새 탭에서 보기`);
    };
    const requestProjectFigmaUpdate = () => {
      if (!figmaFrame) figmaFrame = window.requestAnimationFrame(updateProjectFigmaButton);
    };

    updateProjectFigmaButton();
    window.addEventListener('scroll', requestProjectFigmaUpdate, { passive: true });
    window.addEventListener('resize', requestProjectFigmaUpdate, { passive: true });
  }

  // Reveal project content in small blocks so long case studies unfold on scroll.
  const projectRevealSelectors = [
    '.project-detail__heading', '.project-process__intro', '.project-process__facts',
    '.mellowee-direction__hero > *', '.mellowee-direction__meta',
    '.mellowee-direction__section > :not(.mellowee-direction__screen-area)',
    '.mellowee-direction__screen-area > *', '.mellowee-direction__closing',
    '.mobbly-case__hero', '.mobbly-case__opening', '.mobbly-case__section > *',
    '.mobbly-case__closing', '.project-process__preview-head',
    '.project-process__stage', '.project-process__open', '.other-portfolio > *'
  ];
  document.querySelectorAll(projectRevealSelectors.map(selector => `#projects ${selector}`).join(', '))
    .forEach(item => item.classList.add('reveal'));
  document.querySelectorAll('#projects .project-process__facts, #projects .mellowee-direction__grid3, #projects .mellowee-direction__colors, #projects .mobbly-case__goal-grid, #projects .mobbly-case__screens').forEach(group => {
    // Animate cards individually rather than hiding their shared container.
    group.classList.remove('reveal');
    [...group.children].forEach((item, index) => {
      item.classList.add('reveal');
      item.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 100}ms`);
    });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      // Stagger visible skill rows without delaying rows still below the viewport.
      document.querySelectorAll('.skills-grid').forEach(grid => {
        const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
        const items = [...grid.children];
        const visible = entries.filter(entry => entry.isIntersecting && entry.target.parentElement === grid);
        const firstRow = Math.min(...visible.map(entry => Math.floor(items.indexOf(entry.target) / columns)));
        visible.forEach(entry => {
          const index = items.indexOf(entry.target);
          const row = Math.floor(index / columns) - firstRow;
          entry.target.style.setProperty('--reveal-delay', `${row * 360 + (index % columns) * 110}ms`);
        });
      });
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
