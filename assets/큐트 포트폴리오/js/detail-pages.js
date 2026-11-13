(() => {
  const closeButton = document.querySelector('.detail-presentation__close--top');
  if (!closeButton) return;

  const hideDelay = 2200;
  let lastScrollY = Math.max(0, window.scrollY);
  let hideTimer = 0;
  let scrollFrame = 0;

  function isButtonInUse() {
    return closeButton.matches(':hover') || closeButton.contains(document.activeElement);
  }

  function clearHideTimer() {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }

  function hideButton() {
    if (isButtonInUse()) return;
    closeButton.classList.add('is-hidden');
  }

  function showButtonTemporarily() {
    clearHideTimer();
    closeButton.classList.remove('is-hidden');
    hideTimer = window.setTimeout(hideButton, hideDelay);
  }

  function updateOnScroll() {
    scrollFrame = 0;
    const currentScrollY = Math.max(0, window.scrollY);
    if (currentScrollY < lastScrollY) showButtonTemporarily();
    else if (currentScrollY > lastScrollY) {
      clearHideTimer();
      hideButton();
    }
    lastScrollY = currentScrollY;
  }

  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateOnScroll);
  }, { passive: true });
  closeButton.addEventListener('pointerenter', () => {
    clearHideTimer();
    closeButton.classList.remove('is-hidden');
  });
  closeButton.addEventListener('pointerleave', showButtonTemporarily);
  closeButton.addEventListener('focusin', () => {
    clearHideTimer();
    closeButton.classList.remove('is-hidden');
  });
  closeButton.addEventListener('focusout', showButtonTemporarily);

  showButtonTemporarily();
})();
