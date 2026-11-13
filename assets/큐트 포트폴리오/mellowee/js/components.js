const headerRoot = document.querySelector("[data-site-header]");
const footerRoot = document.querySelector("[data-site-footer]");

const logoMarkup = `
  <span class="word-logo" aria-label="MELLOWEE">
    <span>M</span><span>E</span><span>L</span><span>L</span><span>O</span><span>W</span><span>E</span><span>E</span>
  </span>`;

const headerLogoMarkup = '<img src="./img/logo/logo-main.svg" alt="MELLOWEE" />';

const icon = (name) => {
  const icons = {
    signup: './img/icon/icon_signup.svg',
    login: './img/icon/icon_login.svg',
    search: './img/icon/icon_search.svg',
    cart: './img/icon/icon_cart.svg',
  };
  return `<img src="${icons[name]}" alt="icon" />`;
};

if (headerRoot) {
  headerRoot.outerHTML = `
    <header class="site-header subpage-header">
      <div class="header-top page-shell hwidth-shell">
        <a class="brand-logo" href="./index.html" aria-label="멜로위 홈">${headerLogoMarkup}</a>
        <ul class="utility-menu" aria-label="사용자 메뉴">
          <li><a href="./login.html#signup">${icon("signup")}<span>회원가입</span></a></li>
          <li><a href="./login.html">${icon("login")}<span>로그인</span></a></li>
          <li><a href="#">${icon("search")}<span>검색</span></a></li>
          <li><a href="./recently-viewed.html">${icon("cart")}<span>장바구니</span></a></li>
        </ul>
      </div>
      <nav class="main-nav" aria-label="주요 메뉴">
        <ul class="page-shell">
          <li><a href="./brand-story.html">BRAND STORY</a></li>
          <li><a href="./product-list.html">COLLECTION</a></li>
          <li><a href="./product-list.html?category=newborn">NEW BORN (0-3개월)</a></li>
          <li><a href="./product-list.html?category=baby">BABY (0-3세)</a></li>
          <li><a href="./product-list.html?category=kids">KIDS (3-8세)</a></li>
          <li><a href="./product-list.html?category=junior">JUNIOR (8-13세)</a></li>
          <li><a href="./product-list.html?category=acc">ACC</a></li>
          <li><a href="./product-list.html?category=gift">GIFT SETS</a></li>
          <li><a href="./index.html#instagram">EVENT</a></li>
        </ul>
      </nav>
    </header>`;
}

if (footerRoot) {
  footerRoot.outerHTML = `
    <footer class="site-footer pc-pad">
    <div class="flogo">
      <a href="index.html">
        <!-- 로고 에셋 경로 수정 -->
        <img src="./assets/mellowee-logo.svg" alt="mellowee logo">
      </a>
    </div>
    <div class="footer-main page-shell fwidth-shell">
      <div class="footer-brand">
        <ul class="info1">
          <li><a href="#">이용약관</a></li>
          <li class="bold-line"><a href="#">개인정보처리방침</a></li>
          <li><a href="#">이용안내</a></li>
        </ul>
        <ul class="info2">
          <li>상호명 (주)멜로위 &nbsp; 대표 김윤정 &nbsp; 개인정보관리책임자 <span class="bold-line">김윤정</span></li>
          <li>통신판매업 신고 제2026-서울성동-0000호 <a href="#" class="bold-line">[사업자정보확인]</a></li>
          <li>주소 서울특별시 성동구 연무장길 00, 3층</li>
          <li>사업자등록번호 312-56-7890</li>
          <li>이메일 hello@mellowy.co.kr</li>
          <li>전화 070-1234-5678</li>
        </ul>

      </div>
      <div class="footer-links">
        <div>
          <strong>공지사항</strong>
          <a href="#faq">FAQ</a>
          <a href="#inquiry">상품문의</a>
          <a href="#vip">VIP 전용게시판</a>
        </div>
        <div>
          <strong>이벤트</strong>
          <a href="#review">포토리뷰</a>
          <a href="#attendance">출석체크</a>
          <a href="#benefit">회원혜택</a>
          <a href="#return">교환반품안내</a>
        </div>
        <div>
          <strong>고객지원</strong>
          <a href="#one-to-one">1:1 문의하기</a>
          <a href="#faq">FAQ 자주 묻는 질문</a>
          <a href="#safe">안전 거래 센터</a>
        </div>
        <div class="customer-center">
          <strong>1588-1588</strong>
          <p>평일 10:00 - 17:00 (주말 공휴일 휴무)</p>
          <p>상담이 지연되는 경우 1:1 문의 이용 부탁드립니다.</p>
        </div>
      </div>
    </div>
    <div class="payment page-shell fwidth-shell">
      <p>payments 구매안전서비스</p>
      <p>고객님께서는 안전거래를 위해 결제 시 구매안전 서비스를 이용하실 수 있습니다.</p>
      <a href="#payment-check" class="bold-line">가입 사실 확인하기</a>
    </div>
    <div class="copyright">© 2026 MELLOWY. ALL RIGHTS RESERVED.</div>
  </footer>
  <!--푸터 수정 끝 2026.09.02 -->
  <!-- 푸터 모바일 -->
  <footer class="site-footer mo">
    <div class="flogo">
      <a href="index.html">
        <!-- 로고 에셋 경로 수정 -->
        <img src="./assets/mellowee-logo.svg" alt="mellowee logo">
      </a>
    </div>
    <div class="footer-main page-shell">
      <div class="footer-brand">
        <ul class="info1">
          <li><a href="#">이용약관</a></li>
          <li class="bold-line"><a href="#">개인정보처리방침</a></li>
          <li><a href="#">이용안내</a></li>
        </ul>
        <ul class="info2">
          <li>상호명 (주)멜로위 &nbsp; 대표 김윤정 &nbsp; 개인정보관리책임자 <strong>김윤정</strong></li>
          <li>통신판매업 신고 제2026-서울성동-0000호 <a href="#" class="business-check">[사업자정보확인]</a></li>
          <li>주소 서울특별시 성동구 연무장길 00, 3층</li>
          <li>사업자등록번호 000-00-0000</li>
          <li>이메일 hello@mellowy.co.kr</li>
          <li>전화 070-0000-0000</li>
        </ul>
      </div>
    </div>

    <div class="footer-links">
      <div>
        <strong>공지사항</strong>
        <a href="#faq">FAQ</a>
        <a href="#inquiry">상품문의</a>
        <a href="#vip">VIP 전용게시판</a>
      </div>
      <div>
        <strong>이벤트</strong>
        <a href="#review">포토리뷰</a>
        <a href="#attendance">출석체크</a>
        <a href="#benefit">회원혜택</a>
        <a href="#return">교환반품안내</a>
      </div>
      <div>
        <strong>고객지원</strong>
        <a href="#one-to-one">1:1문의하기</a>
        <a href="#faq">FAQ 자주 묻는 질문</a>
        <a href="#safe">안전 거래 센터</a>
      </div>
    </div>

    <div class="customer-center">
      <strong>1588-1588</strong>
      <p>평일 10:00 - 17:00 (주말 공휴일 휴무)</p>
      <p>상담이 지연되는 경우 1:1 문의 이용 부탁드립니다.</p>
    </div>
    <div class="payment page-shell">
      <p>payments 구매안전서비스</p>
      <p>고객님께서는 안전거래를 위해 결제 시 저희 쇼핑몰에서 가입한 구매안전 서비스를 이용하실 수 있습니다.</p>
      <a href="#payment-check" class="bold-line">가입 사실 확인하기</a>
    </div>
    <div class="copyright">© 2026 MELLOWY. ALL RIGHTS RESERVED.</div>
  </footer>`;
}

const backToTopButton = document.createElement("button");
backToTopButton.type = "button";
backToTopButton.className = "back-to-top";
backToTopButton.setAttribute("aria-label", "맨 위로 이동");
backToTopButton.innerHTML = '<img src="./img/icon/icon-top.svg" alt="" width="48" height="48" />';
backToTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
});
document.body.append(backToTopButton);
