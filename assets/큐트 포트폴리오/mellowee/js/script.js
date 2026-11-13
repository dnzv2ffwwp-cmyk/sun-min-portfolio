const slides = [...document.querySelectorAll("[data-slide]")];
const dots = [...document.querySelectorAll("[data-dot]")];
const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let currentSlide = 0;
let sliderTimer;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === currentSlide;
    slide.classList.toggle("is-active", active);
    slide.setAttribute("aria-hidden", String(!active));
  });

  dots.forEach((dot, dotIndex) => {
    const active = dotIndex === currentSlide;
    dot.classList.toggle("is-active", active);
    dot.setAttribute("aria-current", active ? "true" : "false");
  });
}

function stopSlider() {
  window.clearInterval(sliderTimer);
}

function startSlider() {
  if (reduceMotion || slides.length < 2) return;
  stopSlider();
  sliderTimer = window.setInterval(() => showSlide(currentSlide + 1), 5000);
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.dot));
    startSlider();
  });
});

hero?.addEventListener("mouseenter", stopSlider);
hero?.addEventListener("mouseleave", startSlider);

document.querySelectorAll("img[data-fallback-src]").forEach((image) => {
  image.addEventListener(
    "error",
    () => {
      image.src = image.dataset.fallbackSrc;
    },
    { once: true },
  );
});

document.querySelectorAll("img[data-hide-on-error]").forEach((image) => {
  image.addEventListener(
    "error",
    () => {
      image.hidden = true;
    },
    { once: true },
  );
});

showSlide(0);
startSlider();

if (window.Swiper) {
  new Swiper(".product-swiper", {
    slidesPerView: 4,
    spaceBetween: 16,
    loop: true,
    speed: 500,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 4,
      },
      1024: {
        slidesPerView: 4,
      },
    },
  });

  new Swiper(".instagram-swiper", {
    slidesPerView: 4,
    spaceBetween: 16,
    loop: true,
    speed: 500,
    grabCursor: true,
    autoplay: {
      delay: 2600,
      disableOnInteraction: false,
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 4,
      },
      1024: {
        slidesPerView: 4,
      },
    },
  });
}
