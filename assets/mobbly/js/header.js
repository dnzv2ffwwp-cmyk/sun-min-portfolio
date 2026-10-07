let _prevFocused = null;
let _headerInitialized = false;

function _getSmartMenuElements() {
    return {
        btnMenu: document.querySelector('.btn-menu'),
        smartOverlayMenu: document.querySelector('.smart-overlay-menu'),
        btnMenuClose: document.querySelector('.btn-menu-close')
    };
}

function _openOverlay() {
    const { btnMenu, smartOverlayMenu } = _getSmartMenuElements();
    if (!btnMenu || !smartOverlayMenu) return;

    _prevFocused = document.activeElement;
    smartOverlayMenu.classList.add('on');
    document.body.classList.add('overlay-open');
    btnMenu.setAttribute('aria-expanded', 'true');

    const firstFocusable = smartOverlayMenu.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();

    document.addEventListener('keydown', _overlayKeydown);
}

function _closeOverlay() {
    const { btnMenu, smartOverlayMenu } = _getSmartMenuElements();
    if (!smartOverlayMenu) return;

    smartOverlayMenu.classList.remove('on');
    document.body.classList.remove('overlay-open');

    if (btnMenu) btnMenu.setAttribute('aria-expanded', 'false');
    if (_prevFocused && typeof _prevFocused.focus === 'function') {
        _prevFocused.focus();
    }

    document.removeEventListener('keydown', _overlayKeydown);
}

function _overlayKeydown(e) {
    const { smartOverlayMenu } = _getSmartMenuElements();

    if (!smartOverlayMenu || !smartOverlayMenu.classList.contains('on')) return;

    if (e.key === 'Escape') {
        _closeOverlay();
        return;
    }

    if (e.key === 'Tab') {
        const focusable = Array.from(
            smartOverlayMenu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
}

function initHeaderUI() {
    if (_headerInitialized) return;
    _headerInitialized = true;

    document.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;

        if (event.target.closest('.btn-menu')) {
            event.preventDefault();
            _openOverlay();
            return;
        }

        if (event.target.closest('.btn-menu-close')) {
            event.preventDefault();
            _closeOverlay();
            return;
        }

        const { smartOverlayMenu } = _getSmartMenuElements();
        if (smartOverlayMenu && event.target === smartOverlayMenu) {
            _closeOverlay();
            return;
        }

        const smartList = event.target.closest('.gnb-smart > li');
        if (smartList) {
            const smartLists = Array.from(document.querySelectorAll('.gnb-smart > li'));
            const gnb2depthSmarts = Array.from(document.querySelectorAll('.gnb2depth-smart'));
            const itemIndex = smartLists.indexOf(smartList);

            if (itemIndex === 0) return;

            event.preventDefault();

            smartLists.forEach((li) => li.classList.remove('on'));
            smartList.classList.add('on');

            gnb2depthSmarts.forEach((div) => div.classList.remove('on'));
            if (gnb2depthSmarts[itemIndex - 1]) {
                gnb2depthSmarts[itemIndex - 1].classList.add('on');
            }
        }
    });
}

window.initHeaderUI = initHeaderUI;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.querySelector('.btn-menu') || document.querySelector('.smart-overlay-menu')) {
            initHeaderUI();
        }
    }, { once: true });
} else if (document.querySelector('.btn-menu') || document.querySelector('.smart-overlay-menu')) {
    initHeaderUI();
}