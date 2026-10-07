document.addEventListener('DOMContentLoaded', () => {
    const mainImage = document.querySelector('.thumbnail-big img');
    const thumbnails = document.querySelectorAll('.train-horizontal figure');
    const quantityValue = document.querySelector('.quantity-value');
    const totalPrice = document.querySelector('.pay-info b');
    const option = document.querySelector('#bed-option');
    const toast = document.querySelector('.toast');
    let quantity = 1;
    let toastTimer;

    const showToast = (message) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
    };

    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener('click', () => {
            const image = thumbnail.querySelector('img');
            if (!image || !mainImage) return;
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.src = image.src;
                mainImage.alt = image.alt;
                mainImage.style.opacity = '1';
            }, 140);
            thumbnails.forEach((item) => item.classList.remove('is-active'));
            thumbnail.classList.add('is-active');
        });
    });

    const updateTotal = () => {
        if (!quantityValue || !totalPrice) return;
        const unitPrice = Number(totalPrice.dataset.unitPrice);
        quantityValue.textContent = quantity;
        totalPrice.textContent = (unitPrice * quantity).toLocaleString('ko-KR');
    };

    document.querySelector('.quantity-minus')?.addEventListener('click', () => {
        quantity = Math.max(1, quantity - 1);
        updateTotal();
    });

    document.querySelector('.quantity-plus')?.addEventListener('click', () => {
        quantity = Math.min(10, quantity + 1);
        updateTotal();
    });

    document.querySelectorAll('.btn-wish, .mobile-wish').forEach((button) => {
        button.addEventListener('click', () => {
            const active = !button.classList.contains('is-active');
            document.querySelectorAll('.btn-wish, .mobile-wish').forEach((item) => {
                item.classList.toggle('is-active', active);
                item.textContent = active ? '♥' : '♡';
            });
            showToast(active ? '관심 상품에 담았습니다.' : '관심 상품에서 제외했습니다.');
        });
    });

    const requireOption = (successMessage) => {
        if (option && !option.value) {
            option.focus();
            showToast('필수 옵션을 먼저 선택해 주세요.');
            return;
        }
        showToast(successMessage);
    };

    document.querySelector('.btn-cart')?.addEventListener('click', () => requireOption('장바구니에 상품을 담았습니다.'));
    document.querySelectorAll('.btn-buy, .mobile-buy').forEach((button) => button.addEventListener('click', () => requireOption('구매 페이지로 이동합니다.')));

    const menuLinks = document.querySelectorAll('.sticky-product-menu a');
    menuLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    const detailSections = [...document.querySelectorAll('[id^="product-detail-"]')];
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            menuLinks.forEach((link) => link.classList.toggle('on', link.getAttribute('href') === `#${entry.target.id}`));
        });
    }, { rootMargin: '-25% 0px -65% 0px' });
    detailSections.forEach((section) => observer.observe(section));

    const reviews = typeof reviewArray !== 'undefined' ? reviewArray : [];

    document.querySelectorAll('.review > li').forEach((reviewItem, index) => {
        const reviewData = reviews[index];
        const review = reviewItem.querySelector('.review-txt');
        if (!review) return;

        review.classList.add('fold');
        const button = review.querySelector('button');
        if (button) {
            button.classList.add('btn-rvtxt');
            button.innerHTML = '더보기';
            button.addEventListener('click', () => {
                review.classList.toggle('fold');
                button.textContent = review.classList.contains('fold') ? '더보기' : '접기';
            });
        }
        const paragraph = review.querySelector('p');
        if (paragraph && reviewData) {
            paragraph.innerHTML = `<strong>${reviewData.title}</strong><br>${reviewData.reviewTxt}`;
        }

        const name = reviewItem.querySelector('.rev-name');
        const date = reviewItem.querySelector('.rev-date');
        if (name && reviewData) name.textContent = reviewData.userName;
        if (date && reviewData) date.textContent = reviewData.date;

        const stars = reviewItem.querySelector('.stars');
        if (stars && reviewData) {
            stars.textContent = '★'.repeat(reviewData.rating) + '☆'.repeat(5 - reviewData.rating);
            stars.setAttribute('aria-label', `별점 ${reviewData.rating}점`);
        }

        const gallery = reviewItem.querySelector('.review-gallery');
        if (gallery && reviewData) {
            gallery.innerHTML = reviewData.reviewImgs.map((src, imageIndex) =>
                `<li><img src="${src}" alt="${reviewData.title} 후기 사진 ${imageIndex + 1}"></li>`
            ).join('');
        }
    });

    document.querySelectorAll('.qna-list > li > button').forEach((button) => {
        button.addEventListener('click', () => button.closest('li').classList.toggle('is-open'));
    });
    document.querySelector('.btn-question')?.addEventListener('click', () => showToast('로그인 후 상품 문의를 작성할 수 있습니다.'));
});
