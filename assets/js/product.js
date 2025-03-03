//const { forEach } = require("lodash");

function imagePicker(event) {
    event.preventDefault();
}

function registerProductImagePicker(productImagePickerName, productImageTargetName) {
    const thumbnailList = document.getElementById(productImagePickerName);
    const targetImage = document.getElementById(productImageTargetName);

    thumbnailList.addEventListener('click', (event) => {
    if (event.target.tagName === 'IMG') {
        const selectedImageSrc = event.target.src;
        targetImage.src = selectedImageSrc;
    
        // Remove border from all li elements
        var liElements = thumbnailList.children;
        for (var i = 0; i < liElements.length; i++) {
            liElements[i].style.border = '';
        }
    
        // Set border on selected li element
        const selectedLi = event.target.parentNode;
        selectedLi.style.border = '3px solid #888888';
    }
    });
}

function registerQuantityButton(buttonMinus, buttonPlus, input) {
    const minusButton = document.getElementById(buttonMinus);
    const plusButton = document.getElementById(buttonPlus);
    const quantityInput = document.getElementById(input);
  
    minusButton.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
  
    plusButton.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      quantityInput.value = currentValue + 1;
    });
}

function registerRemoveButton(removeButtonId) {
    const removeButton = document.getElementById(removeButtonId);
  
    removeButton.addEventListener('click', () => {
        removeItem(removeButton.getAttribute('data-key'));
    });
}



async function getCart() {
    try {
        const response = await fetch('/cart/cart.js', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const cartData = await response.json();
        // Handle cartData here
        const cartContainer = document.querySelector('.header-cart-wrapitem');
        const cartTotal = document.querySelector('.cartanza-cart-total').innerHTML = cartData.items.length;
        cartContainer.innerHTML = '';
        cartData.items.forEach((item) => {
            const price = (item.unit_price / 100).toFixed(2);
            const itemHtml = 
            '<li class="header-cart-item" style="display: -webkit-box;display: -webkit-flex;display: -moz-box;display: -ms-flexbox;display: flex;flex-wrap: wrap;align-items: center;padding-bottom: 5px;padding-top: 5px;">' +
                '<div class="header-cart-item-img" style="width: 80px;position: relative;margin-right: 20px;">' +
                '<a href="/products/' + item.product.slug +'">' +
                    '<img src="/content/images/products/' + item.variant.image_src + '" alt="' + item.product.title + '" title="' + item.product.title + '">' +
                '</a>' +
                '</div>' +
                '<div class="header-cart-item-txt" style="width: calc(100% - 100px);text-align: left;">' +
                '<a href="/products/' + item.product.slug +'" class="header-cart-item-name">' +
                    item.product.title +
                '</a>' +
                '<span class="header-cart-item-info" style="display: block;font-size: 12px;color: #888888;line-height: 1.5;">' +
                    item.quantity + 'x $' + price
                '</span>' +
                '</div>' +
            '</li>';
            cartContainer.insertAdjacentHTML('beforeend', itemHtml);
        });
        const totalPrice = (cartData.total_price / 100).toFixed(2);
        const totalPriceContainer = document.querySelector('.header-cart-total');
        totalPriceContainer.innerHTML = 'Subtotal: $' + totalPrice;
                    
    } catch (error) {
        console.error(error);
    }
}

async function addToCart() {
    const variantId = document.querySelector('select[name="id"]').value;
    const variantQuantity = document.querySelector('input[name="quantity"]').value;
    const cartForm = document.querySelector('form');
    const params = new URLSearchParams();
    params.append('id', variantId);
    params.append('quantity', variantQuantity);

    try {
        const response = await fetch('/cart/add.js', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Set the correct Content-Type
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const itemData = await response.json();
        getCart();
    } catch (error) {
        console.error(error);
    }
}

async function updateCart() {
    const updates = document.querySelectorAll('input[name="updates[]"]');
    post_value = '';
    updates.forEach((item, index) => {
        post_value += 'updates['+ item.getAttribute('data-key') +']=' + item.value;
        if (index < updates.length - 1) {
            post_value += '&';
        }
    });
    // Send POST request
    try {
        const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: post_value,
        });

        const result = await response.json();
        window.location.reload();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

async function removeItem(variantId) {
    post_value = 'updates['+ variantId +']=0';
    // Send POST request
    try {
        const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: post_value,
        });

        const result = await response.json();
        window.location.reload();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

function registerAddToCartButton(buttonID) {
    const addToCartButton = document.getElementById(buttonID);
    addToCartButton.addEventListener('click', addToCart);
}
