const fallbackMarkup = {
    '#header-wrap': `
        <header class="pc fallback-header">
            <div class="header-top">
                <div class="common-frame">
                    <div class="logo">
                        <a href="./index.html">
                            <img src="./img/logo/rogo-white.svg" alt="MOBBLY 로고">
                        </a>
                    </div>
                    <div class="lnb">
                        <ul class="user-menu">
                            <li><a href="#"><img src="./img/icon/login.svg" alt="로그인"><span>로그인</span></a></li>
                            <li><a href="#"><img src="./img/icon/join.svg" alt="회원가입"><span>회원가입</span></a></li>
                            <li><a href="#"><img src="./img/icon/search-rounded.svg" alt="검색"><span>검색</span></a></li>
                            <li><a href="#"><img src="./img/icon/bag.svg" alt="장바구니"><span>장바구니</span></a></li>
                            <li><a href="#"><img src="./img/icon/bpeople-circle.svg" alt="마이페이지"><span>마이페이지</span></a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="header-bottom">
                <div class="common-frame">
                    <ul class="gnb">
                        <li><a href="./index.html">HOME</a></li>
                        <li><a href="./new-product.html">NEW</a></li>
                        <li><a href="./list.html">SHOP</a></li>
                        <li><a href="#">COLLECTION</a></li>
                        <li><a href="#">COMMUNITY</a></li>
                        <li><a href="#">SALE</a></li>
                    </ul>
                </div>
            </div>
        </header>

        <header class="smart-header fallback-smart-header">
            <div class="common-frame">
                <div class="logo">
                    <a href="./index.html">
                        <img src="./img/logo/rogo-white.svg" alt="MOBBLY 로고">
                    </a>
                </div>
                <div class="btn-menu" aria-expanded="false">
                    <a href="#" aria-label="전체메뉴 열기">
                        <img src="./img/icon/hamburger_1.svg" alt="전체메뉴 열기">
                    </a>
                </div>
            </div>

            <nav class="smart-overlay-menu" aria-label="모바일 메뉴">
                <div class="smart-overlay-menu-1">
                    <div class="common-frame">
                        <div class="logo">
                            <a href="./index.html">
                                <img src="./img/logo/rogo-white.svg" alt="MOBBLY 로고">
                            </a>
                        </div>
                        <div class="btn-menu-close">
                            <a href="#" aria-label="전체메뉴 닫기">
                                <img src="./img/icon/close.svg" alt="전체메뉴 닫기">
                            </a>
                        </div>
                    </div>
                </div>

                <div class="smart-overlay-menu-2">
                    <div class="common-frame">
                        <ul class="gnb-smart">
                            <li><a href="./index.html">HOME</a></li>
                            <li><a href="./new-product.html">NEW</a></li>
                            <li><a href="./list.html">SHOP</a></li>
                            <li><a href="#">SALE</a></li>
                        </ul>
                    </div>
                </div>

                <div class="smart-overlay-menu-bottom">
                    <div class="gnb2depth-smart on">
                        <div class="common-frame">
                            <section>
                                <h4><a href="./index.html">HOME</a></h4>
                            </section>
                            <section>
                                <h4><a href="./new-product.html">신상품</a></h4>
                            </section>
                            <section>
                                <h4><a href="./list.html">SHOP</a></h4>
                            </section>
                            <section>
                                <h4><a href="#">SALE</a></h4>
                            </section>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    `,
    '#footer-wrap': `
        <footer class="site-footer">
            <div class="common-frame footer-frame">
                <div class="footer-top">
                    <ul class="footer-links">
                        <li><a href="#">이용약관</a></li>
                        <li><a href="#">개인정보처리방침</a></li>
                        <li><a href="#">이메일무단수집거부</a></li>
                        <li><a href="#">사업자정보확인</a></li>
                        <li><a href="#">제휴 입점 문의</a></li>
                    </ul>
                </div>
                <div class="footer-grid">
                    <div class="footer-company">
                        <dl class="company-info">
                            <div class="info-row"><dt>상호명</dt><dd>주식회사 모블리</dd></div>
                            <div class="info-row"><dt>대표</dt><dd>정선민</dd></div>
                            <div class="info-row"><dt>사업자등록번호</dt><dd>123-45-67890</dd></div>
                            <div class="info-row"><dt>통신판매업신고</dt><dd>제2026-서울성동-01234호</dd></div>
                            <div class="info-row"><dt>개인정보관리책임자</dt><dd>MOBBLY CX TEAM</dd></div>
                            <div class="info-row"><dt>고객문의</dt><dd>help@mobbly.co.kr</dd></div>
                            <div class="info-row full-width"><dt>주소</dt><dd>서울특별시 성동구 성수이로 88, MOBBLY STUDIO</dd></div>
                        </dl>
                    </div>
                    <div class="footer-brand">
                        <ul class="social-list">
                            <li><a href="#" aria-label="인스타그램"><img src="./img/icon/lets-icons_insta-light.svg" alt="인스타그램"></a></li>
                            <li><a href="#" aria-label="유튜브"><img src="./img/icon/uit_youtube.svg" alt="유튜브"></a></li>
                        </ul>
                        <div class="brand-logo" aria-label="모블리 로고">
                            <img src="./img/logo/rogo-black.svg" alt="모블리 로고">
                        </div>
                        <p class="brand-slogan">Make your space, more lovely.</p>
                        <p class="brand-sub">일상에 작은 즐거움을 더하는 가구 브랜드 모블리</p>
                    </div>
                </div>
                <div class="footer-contact">
                    <h2>고객센터 <span>1588-2026</span></h2>
                    <dl class="contact-time">
                        <div class="time-row"><dt>평일</dt><dd>09:30 - 17:30</dd></div>
                        <div class="time-row"><dt>점심시간</dt><dd>12:30 - 13:30</dd></div>
                        <div class="time-row"><dt>토·일·공휴일</dt><dd>휴무</dd></div>
                    </dl>
                </div>
                <div class="footer-copy">© 2026 MOBBLY. All rights reserved. 취업 용도의 포트폴리오 페이지입니다.</div>
            </div>
        </footer>
    `
};

function applyFallbackMarkup(selector) {
    const target = document.querySelector(selector);
    if (!target) return;

    const fallback = fallbackMarkup[selector];
    if (fallback) {
        target.innerHTML = fallback;
    }
}

function loadFragment(selector, url) {
    const target = document.querySelector(selector);
    if (!target) return Promise.resolve();

    return fetch(url, { cache: 'no-store' })
        .then((response) => {
            if (!response.ok) throw new Error(`${url} 파일을 불러오지 못했습니다.`);
            return response.text();
        })
        .then((data) => {
            target.innerHTML = data;
        })
        .catch((error) => {
            console.warn(`${url} 로드 실패. fallback 헤더/푸터를 적용합니다.`, error);
            applyFallbackMarkup(selector);
        });
}

function initializeIncludes() {
    return Promise.all([
        loadFragment('#header-wrap', './header.html'),
        loadFragment('#footer-wrap', './footer.html')
    ]).then(() => {
        if (typeof window.initHeaderUI === 'function') {
            window.initHeaderUI();
        }
    });
}

window.initializeIncludes = initializeIncludes;

// 이동할 주소가 없는 링크는 URL 변경이나 페이지 상단 이동이 발생하지 않게 한다.
document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;

    const href = (link.getAttribute('href') || '').trim();
    const pointsToMissingSection = href.startsWith('#')
        && href.length > 1
        && !document.getElementById(href.slice(1));
    const hasNoDestination = href === ''
        || href === '#'
        || pointsToMissingSection
        || /^javascript:\s*void\s*\(\s*0\s*\)$/i.test(href);

    if (hasNoDestination) {
        event.preventDefault();
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIncludes, { once: true });
} else {
    initializeIncludes();
}
