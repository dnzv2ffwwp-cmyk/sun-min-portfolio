(() => {
  const quickMenu = document.querySelector('.quick-menu');
  if(!quickMenu) return;
  const quickMenuToggle = quickMenu.querySelector('.quick-menu__toggle');
  const aboutSection = document.querySelector('.about');
  let lastScrollY = window.scrollY;
  let hideTimer = 0;
  let pointerInside = false;

  function isMenuInUse(){
    return quickMenu.classList.contains('is-open') || pointerInside ||
      (quickMenu.contains(document.activeElement) && document.activeElement.matches(':focus-visible'));
  }

  function clearHideTimer(){
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }

  function scheduleHide(){
    clearHideTimer();
    if(window.scrollY < 16 || isMenuInUse()) return;
    hideTimer = window.setTimeout(() => {
      if(!isMenuInUse()) quickMenu.classList.remove('is-visible');
    }, 2200);
  }

  function setMenuOpen(open){
    quickMenu.classList.toggle('is-open', open);
    quickMenuToggle.setAttribute('aria-expanded', String(open));
    quickMenuToggle.querySelector('.sr-only').textContent = open ? '메뉴 닫기' : '메뉴 열기';
    if(open){
      clearHideTimer();
      quickMenu.classList.add('is-visible');
    }else scheduleHide();
  }

  function updateQuickMenu(){
    const currentY = Math.max(0, window.scrollY);
    const movingUp = currentY < lastScrollY;
    if(currentY < 16){
      clearHideTimer();
      quickMenu.classList.add('is-visible');
    }else if(movingUp){
      quickMenu.classList.add('is-visible');
      scheduleHide();
    }else if(currentY > lastScrollY && !quickMenu.classList.contains('is-open')){
      clearHideTimer();
      quickMenu.classList.remove('is-visible');
    }
    lastScrollY = currentY;
  }

  quickMenuToggle.addEventListener('click', () => setMenuOpen(!quickMenu.classList.contains('is-open')));
  quickMenu.addEventListener('pointerenter', event => {
    if(event.pointerType === 'mouse' || event.pointerType === 'pen'){
      pointerInside = true;
      clearHideTimer();
    }
  });
  quickMenu.addEventListener('pointerleave', () => {
    pointerInside = false;
    scheduleHide();
  });
  quickMenu.addEventListener('focusin', clearHideTimer);
  quickMenu.addEventListener('focusout', () => requestAnimationFrame(scheduleHide));
  document.querySelectorAll('.quick-menu a[href^="#"]:not([href="#about"]), .section-directory a[href^="#"]:not([href="#about"])').forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      const target = document.querySelector(hash);
      if(!target) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      setMenuOpen(false);
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
      if(window.location.hash !== hash) window.history.pushState(null, '', hash);
    });
  });
  document.addEventListener('pointerdown', event => {
    if(quickMenu.classList.contains('is-open') && !quickMenu.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape' && quickMenu.classList.contains('is-open')){
      setMenuOpen(false);
      quickMenuToggle.focus();
    }
  });

  if(aboutSection){
    function scrollToAbout(behavior){
      const resumeStart = aboutSection.getBoundingClientRect().top + window.scrollY;
      const desktopLead = window.innerWidth >= 1600 ? Math.min(110, window.innerHeight * 0.11) : 0;
      window.scrollTo({top: Math.max(0, resumeStart - desktopLead), behavior});
    }

    document.querySelectorAll('a[href="#about"]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        setMenuOpen(false);
        scrollToAbout(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
      });
    });
    if(window.location.hash === '#about'){
      window.addEventListener('load', () => requestAnimationFrame(() => scrollToAbout('auto')), {once:true});
    }
  }

  if(window.location.hash === '#contact'){
    const contactSection = document.querySelector('#contact');
    if(contactSection){
      window.addEventListener('load', () => requestAnimationFrame(() => {
        window.scrollTo({top: contactSection.getBoundingClientRect().top + window.scrollY, behavior: 'auto'});
      }), {once:true});
    }
  }

  window.addEventListener('scroll', updateQuickMenu, {passive:true});
  window.addEventListener('load', updateQuickMenu);
  updateQuickMenu();
})();
