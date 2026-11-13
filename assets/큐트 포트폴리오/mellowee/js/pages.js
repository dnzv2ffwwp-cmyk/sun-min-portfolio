const products = [
  ["01_softday_cotton_bodysuit.jpg", "소프트데이 코튼 바디수트", "42,000", "33,600", "newborn"],
  ["02_oatmeal_pocket_overall.jpg", "오트밀 포켓 오버롤", "49,000", "39,200", "baby"],
  ["03_little_morning_set.jpg", "리틀모닝 상하복 세트", "58,000", "46,400", "newborn"],
  ["04_mellow_stripe_tee.jpg", "멜로우 스트라이프 티", "36,000", "30,600", "baby"],
  ["05_cloud_knit_cardigan.jpg", "클라우드 니트 가디건", "54,000", "43,200", "kids"],
  ["06_butter_cotton_bloomer.jpg", "버터 코튼 블루머	Bottom", "32,000", "27,200", "kids"],
  ["07_pogeunbear_quilted_jumpsuit.jpg", "포근베어 퀼팅 점프수트", "68,000", "51,000", "baby"],
  ["08_daisy_cotton_dress.jpg", "데이지 코튼 원피스", "44,000", "35,200", "kids"],
  ["09_little_day_cotton_indoorwear.jpg", "리틀데이 코튼 실내복", "39,000", "35,100", "kids"],
  ["10_forest_bear_bodysuit.jpg", "포레스트 베어 바디수트", "43,000", "36,550", "kids"],
  ["11_natural_cotton_jogger_pants.jpg", "내추럴 코튼 조거팬츠", "34,000", "30,600", "junior"],
  ["12_sage_pocket_sweatshirt.jpg", "세이지 포켓 맨투맨", "39,000", "33,150", "kids"],
  ["13_round_cotton_leggings.jpg", "라운드 코튼 레깅스", "29,000", "26,100", "junior"],
  ["14_ivory_frill_bodysuit.jpg", "아이보리 프릴 바디수트", "45,000", "36,000", "junior"],
  ["15_soft_blue_denim_overall.jpg", "소프트 블루 데님 오버롤", "52,000", "44,200", "kids"],
  ["16_latte_ribbed_tshirt.jpg", "라떼 골지 티셔츠", "32,000", "28,800", "junior"],
  ["17_little_flower_bloomer_set.jpg", "리틀플라워 블루머 세트", "56,000", "44,800", "baby"],
  ["18_cream_terry_sleep_vest.jpg", "크림 테리 수면조끼", "38,000", "30,400", "junior"],
  ["19_butter_check_pajama_set.jpg", "버터 체크 파자마 세트", "47,000", "39,950", "junior"],
  ["20_oatmeal_corduroy_pants.jpg", "오트밀 코듀로이 팬츠", "42,000", "33,600", "junior"],
  ["21_breeze_cotton_shirt.jpg", "브리즈 코튼 셔츠", "43,000", "38,700", "junior"],
  ["22_little_pocket_hood_zipup.jpg", "리틀포켓 후드 집업", "59,000", "47,200", "junior"],
  ["23_warmday_fleece_vest.jpg", "웜데이 플리스 베스트", "48,000", "38,400", "junior"],
  ["24_cloud_hood_padded_jumpsuit.jpg", "클라우드 후드 패딩 점프수트", "79,000", "55,300", "junior"],
].map(([image, name, original, sale, category], index) => ({ image, name, original, sale, category, index }));

const productList = document.querySelector("[data-product-list]");
const bestList = document.querySelector("[data-best-list]");
const countLabel = document.querySelector("[data-product-count]");
const sortSelect = document.querySelector("[data-sort]");
const categoryButtons = [...document.querySelectorAll("[data-category]")];

function productCard(product, best = false, position = 0) {
  return `
    <article class="catalog-card${best ? " catalog-card--best" : ""}" data-product-category="${product.category}">
      <a class="catalog-card__image" href="./product-detail.html">
        ${best ? `<span class="catalog-card__rank">BEST${position + 1}</span>` : position < 2 ? '<span class="catalog-card__new">NEW</span>' : ""}
        <img src="./img/product-list/${product.image}" alt="${product.name}" />
      </a>
      <div class="catalog-card__body">
        ${best ? "" : '<p class="catalog-card__brand">MELLOWEE</p>'}
        <h3><a href="./product-detail.html">${best ? '<img class="catalog-card__best-star" src="./img/icon/icon_satr_yellow.svg" alt="" aria-hidden="true" />' : ""}${product.name}</a></h3>
        ${best ? "" : '<button class="catalog-card__wish" type="button" aria-label="찜하기">♡</button>'}
        <p class="catalog-card__price"><del>${product.original}원</del><strong>${product.sale}원</strong></p>
        ${best ? "" : '<p class="catalog-card__point"><img src="./img/icon/icon_clarity_won_solid.svg" alt="원 아이콘" class="icon-won" /><span>300원</span></p>'}
      </div>
    </article>`;
}

function renderProducts(category = "all") {
  if (!productList) return;
  const filtered = products.filter((product) => category === "all" || product.category === category);
  let sorted = [...filtered];
  if (sortSelect?.value === "low") sorted.sort((a, b) => Number(a.sale.replace(",", "")) - Number(b.sale.replace(",", "")));
  if (sortSelect?.value === "high") sorted.sort((a, b) => Number(b.sale.replace(",", "")) - Number(a.sale.replace(",", "")));
  productList.innerHTML = sorted.map((product, index) => productCard(product, false, index)).join("");
  if (countLabel) countLabel.textContent = `총 ${sorted.length}개의 상품이 있습니다.`;
  bindWishButtons();
}

function bindWishButtons() {
  document.querySelectorAll(".catalog-card__wish").forEach((button) => {
    button.addEventListener("click", () => {
      const active = button.classList.toggle("is-active");
      button.textContent = active ? "♥" : "♡";
      button.setAttribute("aria-label", active ? "찜 해제" : "찜하기");
    });
  });
}

if (bestList) bestList.innerHTML = products.slice(0, 8).map((product, index) => productCard(product, true, index)).join("");

let activeCategory = new URLSearchParams(window.location.search).get("category") || "all";
if (!["all", "newborn", "baby", "kids", "junior", "acc", "gift"].includes(activeCategory)) activeCategory = "all";
categoryButtons.forEach((button) => {
  button.classList.toggle("is-active", button.dataset.category === activeCategory);
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderProducts(activeCategory);
  });
});
sortSelect?.addEventListener("change", () => renderProducts(activeCategory));
renderProducts(activeCategory);

document.querySelectorAll("[data-product-thumb]").forEach((button) => {
  button.addEventListener("click", () => {
    const mainImage = document.querySelector("[data-product-main-image]");
    if (!mainImage) return;
    mainImage.src = button.dataset.productThumb;
    mainImage.style.objectPosition = button.dataset.position || "center";
    document.querySelectorAll("[data-product-thumb]").forEach((item) => item.classList.toggle("is-active", item === button));
  });
});

const quantityInput = document.querySelector("[data-quantity]");
const totalPrice = document.querySelector("[data-total-price]");
const basePrice = 37800;

function updateTotal() {
  const quantity = Math.max(1, Number(quantityInput?.value) || 1);
  if (quantityInput) quantityInput.value = quantity;
  if (totalPrice) totalPrice.textContent = `${(basePrice * quantity).toLocaleString("ko-KR")}원`;
}

document.querySelector("[data-quantity-minus]")?.addEventListener("click", () => {
  if (quantityInput) quantityInput.value = Math.max(1, Number(quantityInput.value) - 1);
  updateTotal();
});
document.querySelector("[data-quantity-plus]")?.addEventListener("click", () => {
  if (quantityInput) quantityInput.value = Number(quantityInput.value) + 1;
  updateTotal();
});
quantityInput?.addEventListener("change", updateTotal);

document.querySelectorAll("[data-detail-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.detailTab;
    document.querySelectorAll("[data-detail-tab]").forEach((item) => item.classList.toggle("is-active", item === button));
    document.querySelectorAll("[data-detail-panel]").forEach((panel) => { panel.hidden = panel.dataset.detailPanel !== target; });
  });
});

document.querySelector("[data-login-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector("[data-form-message]");
  const id = form.elements.userId.value.trim();
  const password = form.elements.password.value;
  message.textContent = id && password ? "포트폴리오용 화면으로 실제 로그인은 연결되지 않습니다." : "아이디와 비밀번호를 모두 입력해 주세요.";
});

document.querySelectorAll("[data-recent-delete]").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".recent-item")?.remove();
    const list = document.querySelector("[data-recent-list]");
    if (list && !list.querySelector(".recent-item")) list.insertAdjacentHTML("beforeend", '<p class="recent-empty">최근 본 상품이 없습니다.</p>');
  });
});

document.querySelectorAll("[data-demo-action]").forEach((button) => {
  button.addEventListener("click", () => alert("포트폴리오용 화면입니다. 실제 주문 기능은 연결되지 않았습니다."));
});
