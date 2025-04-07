//const { forEach } = require("lodash");

let cartanzaFormDesign;

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

function registerAddToCartButton(buttonID) {
    const addToCartButton = document.getElementById(buttonID);
    addToCartButton.addEventListener('click', addToCart);
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

async function initializeForm() {
    const cartanzaFormDiv = document.getElementById('cartanzaformdiv');
    if (!cartanzaFormDiv) return;

    const formCode = cartanzaFormDiv.getAttribute('data-contact');
    if (!formCode) {
        console.error('No form code provided');
        return;
    }

    try {
        const form = await getForm(formCode);

        if (!form || !form.design) {
            console.error('Invalid form data');
            return;
        }
        cartanzaFormDesign = form;

        renderForm(cartanzaFormDiv, form, formCode);
    } catch (error) {
        console.error('Failed to initialize form:', error);
        // Show user-friendly error message
        cartanzaFormDiv.textContent = 'Failed to load form. Please try again later.';
    }
}

async function getForm(formCode) {
    const response = await fetch('/form/get.js/?code=' + formCode, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
    }

    return await response.json();
}

function renderForm(container, form, formCode) {
    const { design } = form;
    const formElement = document.createElement('form');
    formElement.action = '/form/add.js/';
    formElement.method = 'post';
    formElement.style.cssText = "width:50%;margin:0 auto;text-align:left;";

    // Add hidden input for form code
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'code';
    hiddenInput.value = formCode;
    formElement.appendChild(hiddenInput);

    // Add title and description
    if (design.name) {
        const titleElement = document.createElement('h2');
        titleElement.textContent = design.name;
        formElement.appendChild(titleElement);
    }

    if (design.description) {
        const descriptionElement = document.createElement('h3');
        descriptionElement.textContent = design.description;
        formElement.appendChild(descriptionElement);
    }

    // Add form fields
    if (design.fields && design.fields.length) {
        design.fields.forEach(field => {
            const fieldWrapper = document.createElement('div');
            fieldWrapper.className = 'gh-portal-input-label';
            if (field.required) {
                fieldWrapper.setAttribute('data-required', 'true');
            }
            const label = document.createElement('label');
            label.textContent = field.title;
            label.className = 'gh-portal-input-label';
            fieldWrapper.appendChild(label);

            let input;
            
            if (field.type === 'dropdown') {
                // Create dropdown select element
                input = document.createElement('select');
                input.name = field.code;
                input.className = field.classes;
                input.style.cssText = field.styles;
                
                // Add default empty option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select an option';
                input.appendChild(defaultOption);
                
                // Add options from field.values
                if (field.values && field.values.length) {
                    field.values.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.value;
                        optionElement.textContent = option.display;
                        input.appendChild(optionElement);
                    });
                }
                
            } else if (field.type === 'radio') {
                // Create radio button group
                input = document.createElement('div');
                input.className = 'cartanza-radio-group';
                
                if (field.values && field.values.length) {
                    field.values.forEach((option, index) => {
                        const radioWrapper = document.createElement('div');
                        radioWrapper.className = 'cartanza-radio-option';
                        
                        const radioInput = document.createElement('input');
                        radioInput.type = 'radio';
                        radioInput.id = field.code + '-' + index;
                        radioInput.name = field.code;
                        radioInput.value = option.value;
                        radioInput.className = field.classes;
                        
                        const radioLabel = document.createElement('label');
                        radioLabel.htmlFor = field.code + '-' + index;
                        radioLabel.textContent = option.display;
                        radioLabel.style.cssText = 'margin-left: 10px;';
                        
                        radioWrapper.appendChild(radioInput);
                        radioWrapper.appendChild(radioLabel);
                        input.appendChild(radioWrapper);
                    });
                }
                
            } else if (field.type === 'text') {
                // Textarea for text fields
                input = document.createElement('textarea');
                input.placeholder = field.placeholder;
            } else {
                // Default input for other types
                input = document.createElement('input');
                input.type = field.type;
                input.placeholder = field.placeholder;
            }
            
            // Set common attributes
            if (field.type !== 'radio') {
                input.name = field.code;
                input.className = field.classes;
                input.style.cssText = field.styles;
            }
            
            fieldWrapper.appendChild(input);
            formElement.appendChild(fieldWrapper);
        });
    }

    // Add submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.className = 'gh-portal-btn gh-portal-btn-branded';
    submitButton.style.cssText = 'background: var(--ghost-accent-color);color: white;width: 25%;margin-top:30px;';
    submitButton.innerHTML = '<span>Submit</span>';
    submitButton.addEventListener('click', () => handleFormSubmit(formElement));
    formElement.appendChild(submitButton);

    container.appendChild(formElement);
}

async function handleFormSubmit(formElement) {
    const submitButton = formElement.querySelector('button[type="button"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span>Submitting...</span>';

    try {
        // Reset previous error states
        clearFieldErrors(formElement);

        // Validate required fields
        const isValid = validateRequiredFields(formElement);
        if (!isValid) {
            throw new Error('Please fill in all required fields');
        }

        let formValues = new FormData(formElement);

        if(cartanzaFormDesign.type != 'form') {
            let score = 0;
            let index = 0;
            formValues.entries().forEach((entry) => {
                // skip the first one
                if(index != 0) {
                    const field = cartanzaFormDesign.design.fields[index - 1];
                    const value = field.values.find((value) => value.value === entry[1]);
                    score += parseInt(value.points);
                }
                index++;
            });

            if(cartanzaFormDesign.type === 'outcomequiz') {
                const sortedOutcomes = [...cartanzaFormDesign.design.outcomes].sort((a, b) => parseInt(a.points) - parseInt(b.points));
                let foundOutcome = sortedOutcomes.find((outcome) => score <= parseInt(outcome.points));
                const outcomeElement = document.createElement('h3');
                outcomeElement.textContent = foundOutcome.value;
                submitButton.remove();
                formElement.appendChild(outcomeElement);
            } else if(cartanzaFormDesign.type === 'scorequiz')  {
                let maximumPoints = 0;
                if(cartanzaFormDesign.design.fields) {
                    cartanzaFormDesign.design.fields.forEach((field) => {
                        if(field.values) {
                            const maxValue = Math.max(...field.values.map((value) => parseInt(value.points, 10)));
                            maximumPoints += maxValue;
                        }
                    });
                }
                const outcomeElement = document.createElement('h3');
                outcomeElement.textContent = 'You scored ' + parseInt(100.0 * score/maximumPoints) + '%';
                submitButton.remove();
                formElement.appendChild(outcomeElement);
            }
        }

        const formData = new URLSearchParams(new FormData(formElement));
        
        const response = await fetch(formElement.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        if (response.ok) {
            if(cartanzaFormDesign.type === 'form') {
                formElement.innerHTML = '<h3>Thank you for your feedback!</h3>';
            } else {
                const inputElements = formElement.querySelectorAll('input, select, textarea');
                inputElements.forEach((element) => {
                    element.disabled = true;
                });
                const subscribeElement = document.createElement('div');
                subscribeElement.style.cssText = 'font-size:2.4rem;font-weight:600;';
                subscribeElement.innerHTML = '<a href="#/portal/signup">Subscribe</a> for free to see how everyone did on this quiz.';
                formElement.appendChild(subscribeElement);
            }
        } else {
            throw new Error('Submission failed with status: ' + response.status);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        
        // Only show alert for server errors, not validation errors
        if (!error.message.includes('required fields')) {
            alert('Submission failed. Please check your inputs and try again.');
        }
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<span>Submit</span>';
    }
}

// function validateRequiredFields(formElement) {
//     let isValid = true;
//     const requiredFields = formElement.querySelectorAll('[data-required="true"]');
    
//     requiredFields.forEach(field => {
//         const input = field.querySelector('input, select, textarea');
//         const value = input.type === 'checkbox' ? input.checked : input.value.trim();
        
//         if (!value) {
//             markFieldAsInvalid(field, input);
//             isValid = false;
//         }
//     });
    
//     return isValid;
// }
function validateRequiredFields(formElement) {
    let isValid = true;
    const requiredFields = formElement.querySelectorAll('[data-required="true"]');
    
    requiredFields.forEach(field => {
        const inputs = field.querySelectorAll('input, select, textarea');
        let isRadioGroupValid = true;
        let hasValue = false;

        // Handle radio groups differently
        if (inputs.length > 1 && inputs[0].type === 'radio') {
            // Check if at least one radio is selected
            hasValue = Array.from(inputs).some(radio => radio.checked);
            if (!hasValue) {
                markFieldAsInvalid(field, inputs[0]); // Pass first radio as reference
                isValid = false;
            }
        } 
        // Handle other input types
        else {
            const input = inputs[0]; // Single input
            const value = input.type === 'checkbox' ? input.checked : input.value.trim();
            
            if (!value) {
                markFieldAsInvalid(field, input);
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Helper function to mark a field as invalid
function markFieldAsInvalid(fieldWrapper, inputElement) {
    // Add error class to field wrapper
    fieldWrapper.classList.add('cartanza-field-error');
    
    // Add or update error message
    let errorMessage = fieldWrapper.querySelector('.cartanza-error-message');
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'cartanza-error-message';
        errorMessage.textContent = 'This field is required';
        fieldWrapper.appendChild(errorMessage);
    }
    
    // Highlight the input
    inputElement.style.borderColor = 'red';
}

// Helper function to clear error states
function clearFieldErrors(formElement) {
    const errorFields = formElement.querySelectorAll('.cartanza-field-error');
    
    errorFields.forEach(field => {
        field.classList.remove('cartanza-field-error');
        const input = field.querySelector('input, select, textarea');
        if (input) {
            input.style.borderColor = '';
        }
        
        const errorMessage = field.querySelector('.cartanza-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
}

// Initialize the form when the page loads
window.addEventListener('load', initializeForm);
