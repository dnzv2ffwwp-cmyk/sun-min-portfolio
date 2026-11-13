  function initHeaderMenu() {
    const header = document.querySelector(".site-header");
    const mainNav = header?.querySelector(".main-nav");
    const headerTop = header?.querySelector(".header-top");
    if (!headerTop || !mainNav) return;

    const mainLinks = [...mainNav.querySelectorAll(":scope > ul > li > a")];
    const desktopMedia = window.matchMedia("(min-width: 1025px)");
    const getMenu = (link) => MENU_DATA[link.textContent.trim().replace(/\s+/g, " ")];
    const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
    const hrefFor = (link) => escapeHTML(link.getAttribute("href") || "#");

    const megaMenu = document.createElement("nav");
    megaMenu.id = "header-mega-menu";
    megaMenu.className = "mega-menu";
    megaMenu.setAttribute("aria-label", "하위 메뉴");
    megaMenu.hidden = true;
    const megaInner = document.createElement("div");
    megaInner.className = "mega-menu__inner";
    megaMenu.append(megaInner);
    header.append(megaMenu);
    let activeDesktopLink = null;

    function closeMegaMenu() {
      megaMenu.hidden = true;
      megaMenu.classList.remove("is-open");
      mainLinks.forEach((link) => {
        link.classList.remove("is-mega-active");
        link.setAttribute("aria-expanded", "false");
      });
      activeDesktopLink = null;
    }

    function openMegaMenu(link) {
      const menu = getMenu(link);
      if (!desktopMedia.matches || !menu) return;
      if (activeDesktopLink === link && !megaMenu.hidden) return;
      closeMegaMenu();
      activeDesktopLink = link;
      const href = hrefFor(link);
      megaInner.style.setProperty("--mega-column-count", menu.depth2.length + 1);
      megaInner.innerHTML = `
        <div class="mega-menu__root"><a class="mega-menu__root-title" href="${href}">${escapeHTML(menu.label)}</a></div>
        ${menu.depth2.map((depth2) => `
          <div class="mega-menu__column">
            <a class="mega-menu__depth2-title" href="${href}">${escapeHTML(depth2.title)}</a>
            <ul class="mega-menu__depth3">${depth2.depth3.map((title) => `<li><a href="${href}">${escapeHTML(title)}</a></li>`).join("")}</ul>
          </div>`).join("")}`;
      megaMenu.hidden = false;
      megaMenu.classList.add("is-open");
      link.classList.add("is-mega-active");
      link.setAttribute("aria-expanded", "true");
    }

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "menu-toggle";
    toggle.setAttribute("aria-label", "전체 메뉴 열기");
    toggle.setAttribute("aria-controls", "mobile-menu");
    toggle.setAttribute("aria-haspopup", "dialog");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
    headerTop.prepend(toggle);

    const overlay = document.createElement("dialog");
    overlay.id = "mobile-menu";
    overlay.className = "header-menu-overlay";
    overlay.setAttribute("aria-labelledby", "mobile-menu-title");
    overlay.innerHTML = `
      <div class="header-menu-overlay__panel">
        <div class="header-menu-overlay__header">
          <button type="button" class="header-menu-overlay__back" data-overlay-back aria-label="이전 메뉴로 돌아가기" hidden>←</button>
          <h2 id="mobile-menu-title" class="header-menu-overlay__title" data-overlay-title tabindex="-1">전체 메뉴</h2>
          <button type="button" class="header-menu-overlay__close" data-overlay-close aria-label="전체 메뉴 닫기" autofocus>×</button>
        </div>
        <nav class="header-menu-overlay__content" data-overlay-content aria-label="전체 메뉴"></nav>
        <div class="header-menu-overlay__account" aria-label="사용자 메뉴"></div>
        <p class="header-menu-overlay__signature">Little days, softly worn.</p>
      </div>`;
    header.querySelectorAll(".utility-menu a, .utility-menu button").forEach((item) => {
      overlay.querySelector(".header-menu-overlay__account").append(item.cloneNode(true));
    });
    document.body.append(overlay);
    header.classList.add("has-responsive-menu");

    const overlayTitle = overlay.querySelector("[data-overlay-title]");
    const overlayContent = overlay.querySelector("[data-overlay-content]");
    const overlayBack = overlay.querySelector("[data-overlay-back]");
    let activeMainIndex = null;
    let activeDepth2Index = null;
    let scrollState = null;
    let returnFocus = toggle;

    function finishRender(label, showBack) {
      overlayTitle.textContent = label;
      overlayBack.hidden = !showBack;
      overlayContent.scrollTop = 0;
      if (overlay.open) overlayTitle.focus({ preventScroll: true });
    }

    function renderOverlayRoot() {
      activeMainIndex = null;
      activeDepth2Index = null;
      overlayContent.innerHTML = `
        <p class="header-menu-overlay__intro">아이의 작은 하루를 함께해요.</p>
        <ul class="overlay-depth1">${mainLinks.map((link, index) => `
          <li>${getMenu(link) ? `<button type="button" class="overlay-depth1__item" data-overlay-depth1="${index}"><span>${escapeHTML(link.textContent.trim())}</span><span aria-hidden="true">›</span></button>` : `<a class="overlay-depth1__item" href="${hrefFor(link)}">${escapeHTML(link.textContent.trim())}</a>`}</li>`).join("")}</ul>`;
      finishRender("전체 메뉴", false);
    }

    function renderOverlayDepth2(index) {
      const link = mainLinks[index];
      const menu = link && getMenu(link);
      if (!menu) return;
      activeMainIndex = index;
      activeDepth2Index = null;
      overlayContent.innerHTML = `
        <ul class="overlay-depth2">${menu.depth2.map((depth2, depthIndex) => `
          <li><button type="button" class="overlay-depth2__item" data-overlay-depth2="${depthIndex}"><span>${escapeHTML(depth2.title)}</span><span class="overlay-depth2__arrow" aria-hidden="true">›</span></button></li>`).join("")}</ul>
        <a class="overlay-view-all" href="${hrefFor(link)}">${escapeHTML(menu.label)} 전체보기</a>`;
      finishRender(menu.label, true);
    }

    function renderOverlayDepth3(index) {
      const link = mainLinks[activeMainIndex];
      const depth2 = link && getMenu(link)?.depth2[index];
      if (!depth2) return;
      activeDepth2Index = index;
      overlayContent.innerHTML = `
        <ul class="overlay-depth3">${depth2.depth3.map((title) => `<li><a href="${hrefFor(link)}">${escapeHTML(title)}</a></li>`).join("")}</ul>
        <a class="overlay-view-all" href="${hrefFor(link)}">${escapeHTML(getMenu(link).label)} 전체보기</a>`;
      finishRender(depth2.title, true);
    }

    function restorePage() {
      if (!scrollState || overlay.open) return;
      const { x, y, styles } = scrollState;
      scrollState = null;
      styles.forEach(([name, value, priority]) => {
        if (value) document.body.style.setProperty(name, value, priority);
        else document.body.style.removeProperty(name);
      });
      document.body.classList.remove("header-overlay-open");
      toggle.setAttribute("aria-expanded", "false");
      window.scrollTo({ left: x, top: y, behavior: "instant" });
      const target = returnFocus.getClientRects().length ? returnFocus : header.querySelector(".brand-logo");
      target?.focus({ preventScroll: true });
    }

    function closeOverlay() {
      if (!overlay.open) return;
      overlay.close();
      restorePage();
    }

    function openOverlay(link = null) {
      if (desktopMedia.matches || overlay.open) return;
      closeMegaMenu();
      returnFocus = document.activeElement;
      if (link) renderOverlayDepth2(mainLinks.indexOf(link));
      else renderOverlayRoot();
      const styleNames = ["position", "top", "left", "width", "overflow", "padding-right"];
      scrollState = {
        x: window.scrollX,
        y: window.scrollY,
        styles: styleNames.map((name) => [name, document.body.style.getPropertyValue(name), document.body.style.getPropertyPriority(name)]),
      };
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      overlay.showModal();
      Object.assign(document.body.style, {
        position: "fixed", top: `-${scrollState.y}px`, left: `-${scrollState.x}px`,
        width: "100%", overflow: "hidden", paddingRight: `${padding + scrollbar}px`,
      });
      document.body.classList.add("header-overlay-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", () => openOverlay());
    overlayBack.addEventListener("click", () => {
      if (activeDepth2Index !== null) {
        const index = activeDepth2Index;
        renderOverlayDepth2(activeMainIndex);
        overlayContent.querySelector(`[data-overlay-depth2="${index}"]`)?.focus();
      } else {
        const index = activeMainIndex;
        renderOverlayRoot();
        overlayContent.querySelector(`[data-overlay-depth1="${index}"]`)?.focus();
      }
    });
    overlay.addEventListener("click", (event) => {
      const depth1 = event.target.closest("[data-overlay-depth1]");
      const depth2 = event.target.closest("[data-overlay-depth2]");
      if (depth1) renderOverlayDepth2(Number(depth1.dataset.overlayDepth1));
      else if (depth2) renderOverlayDepth3(Number(depth2.dataset.overlayDepth2));
      else if (event.target === overlay || event.target.closest("[data-overlay-close], a")) closeOverlay();
    });
    overlay.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeOverlay();
    });
    overlay.addEventListener("close", restorePage);

    mainLinks.forEach((link) => {
      if (!getMenu(link)) return;
      link.setAttribute("aria-controls", megaMenu.id);
      link.setAttribute("aria-expanded", "false");
      link.addEventListener("mouseenter", () => openMegaMenu(link));
      link.addEventListener("focus", () => openMegaMenu(link));
      link.addEventListener("click", (event) => {
        if (desktopMedia.matches) return;
        event.preventDefault();
        openOverlay(link);
      });
      link.addEventListener("keydown", (event) => {
        if (!desktopMedia.matches || event.key !== "ArrowDown") return;
        event.preventDefault();
        openMegaMenu(link);
        megaInner.querySelector("a")?.focus();
      });
    });
    header.addEventListener("mouseleave", () => {
      if (!megaMenu.contains(document.activeElement)) closeMegaMenu();
    });
    header.addEventListener("focusout", (event) => {
      if (!header.contains(event.relatedTarget)) closeMegaMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || megaMenu.hidden) return;
      activeDesktopLink?.focus({ preventScroll: true });
      closeMegaMenu();
    });
    document.addEventListener("click", (event) => {
      if (!header.contains(event.target)) closeMegaMenu();
    });
    desktopMedia.addEventListener("change", () => {
      closeMegaMenu();
      if (desktopMedia.matches) closeOverlay();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeaderMenu, { once: true });
  } else {
    initHeaderMenu();
  }
})();
