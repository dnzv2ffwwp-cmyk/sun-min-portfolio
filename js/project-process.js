document.querySelectorAll('[data-preview]').forEach(preview => {
  const stage = preview.querySelector('[data-preview-stage]');
  const canvas = preview.querySelector('[data-preview-canvas]');
  const frame = preview.querySelector('[data-preview-frame]');
  const buttons = [...preview.querySelectorAll('[data-width]')];
  const canObserveStage = 'ResizeObserver' in window;
  let selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0];
  let viewportDevice = '';

  function getViewportDevice() {
    if (window.innerWidth <= 600) return 'mobile';
    if (window.innerWidth <= 900) return 'tablet';
    return 'pc';
  }

  function updatePreview() {
    const width = Number(selected.dataset.width);
    const height = Number(selected.dataset.height);
    const device = selected.dataset.device;
    const availableWidth = stage.clientWidth - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
    const scale = Math.min(1, availableWidth / width);
    preview.dataset.device = device;
    stage.setAttribute('aria-label', `${selected.textContent.trim()} ${width}×${height} 화면 미리보기`);
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.style.transform = `scale(${scale})`;
    requestAnimationFrame(() => {
      try {
        frame.contentWindow?.dispatchEvent(new Event('resize'));
      } catch (_) {
        // The iframe still responds through its changed viewport size when direct events are restricted.
      }
    });
  }

  function selectPreview(button) {
    if (!button) return;
    selected = button;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === selected)));
    updatePreview();
  }

  function syncPreviewToViewport(force = false) {
    const nextDevice = getViewportDevice();
    if (!force && nextDevice === viewportDevice) {
      if (!canObserveStage) updatePreview();
      return;
    }
    viewportDevice = nextDevice;
    selectPreview(buttons.find(button => button.dataset.device === nextDevice) || selected);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => selectPreview(button));
  });

  if (canObserveStage) new ResizeObserver(updatePreview).observe(stage);
  window.addEventListener('resize', () => syncPreviewToViewport(), { passive: true });
  syncPreviewToViewport(true);
});

document.querySelectorAll('[data-device-showcase]').forEach(showcase => {
  const screens = [...showcase.querySelectorAll('.mellowee-case__screen')];
  const mobileQuery = window.matchMedia('(max-width: 600px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let intervalId = 0;
  let isVisible = false;
  let pointerId = null;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let isDragging = false;

  function stopRotation() {
    if (!intervalId) return;
    window.clearInterval(intervalId);
    intervalId = 0;
  }

  function showScreen(index, restart = false) {
    activeIndex = (index + screens.length) % screens.length;
    screens.forEach((screen, screenIndex) => {
      const isActive = screenIndex === activeIndex;
      screen.classList.toggle('is-active', isActive);
      screen.setAttribute('aria-hidden', String(mobileQuery.matches && !isActive));
    });

    if (restart) {
      const activeScreen = screens[activeIndex];
      activeScreen.classList.remove('is-active');
      void activeScreen.offsetWidth;
      activeScreen.classList.add('is-active');
    }
  }

  function startRotation() {
    stopRotation();
    if (!mobileQuery.matches || reducedMotionQuery.matches || !isVisible) return;
    intervalId = window.setInterval(() => showScreen(activeIndex + 1), 18000);
  }

  function syncShowcase(restart = false) {
    if (mobileQuery.matches) {
      showScreen(activeIndex, restart);
    } else {
      screens.forEach(screen => screen.setAttribute('aria-hidden', 'false'));
    }
    startRotation();
  }

  function finishDrag(event, cancelled = false) {
    if (event.pointerId !== pointerId) return;
    const distanceX = event.clientX - pointerStartX;
    const distanceY = event.clientY - pointerStartY;
    const shouldMove = !cancelled && isDragging && Math.abs(distanceX) >= 45 && Math.abs(distanceX) > Math.abs(distanceY);

    if (shouldMove) showScreen(activeIndex + (distanceX < 0 ? 1 : -1));
    showcase.classList.remove('is-dragging');
    pointerId = null;
    isDragging = false;
    startRotation();
  }

  showcase.addEventListener('pointerdown', event => {
    if (!mobileQuery.matches || event.button !== 0) return;
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    isDragging = false;
    stopRotation();
    showcase.setPointerCapture?.(event.pointerId);
  });

  showcase.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    const distanceX = event.clientX - pointerStartX;
    const distanceY = event.clientY - pointerStartY;
    if (Math.abs(distanceX) > 10 && Math.abs(distanceX) > Math.abs(distanceY)) {
      isDragging = true;
      showcase.classList.add('is-dragging');
    }
  });

  showcase.addEventListener('pointerup', event => finishDrag(event));
  showcase.addEventListener('pointercancel', event => finishDrag(event, true));

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      isVisible = entries[0].isIntersecting;
      showcase.classList.toggle('is-in-view', isVisible);
      if (isVisible && mobileQuery.matches) showScreen(activeIndex, true);
      startRotation();
    }, { threshold: 0.2 }).observe(showcase);
  } else {
    isVisible = true;
    showcase.classList.add('is-in-view');
  }

  mobileQuery.addEventListener('change', () => syncShowcase(true));
  reducedMotionQuery.addEventListener('change', () => syncShowcase(true));
  syncShowcase(true);
});

document.querySelectorAll('.mellowee-case').forEach(caseStudy => {
  const sections = [...caseStudy.querySelectorAll('[data-mellowee-reveal]')];
  if (!sections.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach(section => section.classList.add('is-visible'));
    return;
  }

  caseStudy.classList.add('is-reveal-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  sections.forEach(section => observer.observe(section));
});
