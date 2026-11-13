const params = new URLSearchParams(window.location.search);
const requestedPid = Number(params.get('pid'));
const product = newProductArray.find(item => item.pid === requestedPid) || newProductArray[0];
const productImagePath = `./img/2026 New products/${product.pthumbFileName}`;
const formattedPrice = product.price.toLocaleString('ko-KR');
const formattedPoint = Math.round(product.price * 0.01).toLocaleString('ko-KR');

document.title = `${product.pname} | MOBBLY`;
document.querySelector('meta[name="description"]').content = product.pdesc;
document.querySelector('#breadcrumb-name').textContent = product.pname;
document.querySelector('#product-name').textContent = `[MOBBLY] ${product.pname}`;
document.querySelector('#product-description').textContent = product.pdesc;
document.querySelector('#product-price').textContent = formattedPrice;
document.querySelector('#product-point').textContent = formattedPoint;
document.querySelector('#total-price').textContent = formattedPrice;
document.querySelector('#detail-name').textContent = product.pname;
document.querySelector('#detail-description').textContent = product.pdesc;

[
    document.querySelector('#product-image'),
    document.querySelector('#product-thumbnail'),
    document.querySelector('#detail-image')
].forEach(image => {
    image.src = productImagePath;
    image.alt = product.pname;
});

let quantity = 1;
const quantityValue = document.querySelector('.quantity-value');
const totalPrice = document.querySelector('#total-price');

function updateQuantity(nextQuantity) {
    quantity = Math.max(1, nextQuantity);
    quantityValue.value = quantity;
    quantityValue.textContent = quantity;
    totalPrice.textContent = (product.price * quantity).toLocaleString('ko-KR');
}

document.querySelector('.quantity-minus').addEventListener('click', () => updateQuantity(quantity - 1));
document.querySelector('.quantity-plus').addEventListener('click', () => updateQuantity(quantity + 1));

if (window.includesReady) {
    window.includesReady.then(() => {
        const headerScript = document.createElement('script');
        headerScript.src = './js/header.js';
        document.body.appendChild(headerScript);
    });
}
