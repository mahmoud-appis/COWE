// Banner Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.banner-slide');
if (slides.length > 0) {
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 3000);
}

// Update Time
function updateTime() {
    const now = new Date();
    const timeDisplay = document.querySelectorAll('#current-time');
    if (timeDisplay) {
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
        timeDisplay.forEach(element => {
            element.textContent = `الوقت: ${formattedHours}:${minutes} ${ampm} EEST, ${now.getDate()} ${getMonthName(now.getMonth())} ${now.getFullYear()}`;
        });
    }
}

function getMonthName(monthIndex) {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return months[monthIndex];
}

setInterval(updateTime, 1000);
updateTime();

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch('settings.json');
        const settings = await response.json();
        document.querySelectorAll('.phone-number').forEach(el => el.textContent = settings.phone);
        const banner = document.querySelector('.banner');
        if (banner) {
            banner.innerHTML = '';
            settings.banner_images.forEach(img => {
                const slide = document.createElement('div');
                slide.className = 'banner-slide';
                slide.innerHTML = `<img src="${img}" alt="Banner">`;
                banner.appendChild(slide);
            });
            const slides = document.querySelectorAll('.banner-slide');
            if (slides.length > 0) {
                slides[0].classList.add('active');
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Load Products
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        const productsContainer = document.getElementById('products-container');
        if (productsContainer) {
            productsContainer.innerHTML = '';
            products.forEach((product, index) => {
                const isFavorite = localStorage.getItem(`favorite_${index}`) === 'true';
                const card = document.createElement('div');
                card.className = 'product-card' + (product.isFeatured ? ' featured' : '');
                card.dataset.category = product.category;
                card.dataset.title = product.name.toLowerCase();
                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description || ''}</p>
                    <p class="price">${product.price} جنيه</p>
                    <button class="favorite ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${index}); event.stopPropagation();" aria-label="أضف/أزل من المفضلة">❤️</button>
                    <a href="product.html?id=${index}" aria-label="عرض تفاصيل ${product.name}" onclick="event.stopPropagation();">عرض التفاصيل</a>
                `;
                card.addEventListener('click', () => {
                    window.location.href = `product.html?id=${index}`;
                });
                productsContainer.appendChild(card);
            });
        }
        const offersContainer = document.getElementById('offers-container');
        if (offersContainer) {
            offersContainer.innerHTML = '';
            const offers = products.filter(product => product.isFeatured);
            offers.forEach((product, index) => {
                const isFavorite = localStorage.getItem(`favorite_${index}`) === 'true';
                const card = document.createElement('div');
                card.className = 'product-card featured';
                card.dataset.category = product.category;
                card.dataset.title = product.name.toLowerCase();
                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description || ''}</p>
                    <p class="price">${product.price} جنيه</p>
                    <button class="favorite ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${index}); event.stopPropagation();" aria-label="أضف/أزل من المفضلة">❤️</button>
                    <a href="product.html?id=${index}" aria-label="عرض تفاصيل ${product.name}" onclick="event.stopPropagation();">عرض التفاصيل</a>
                `;
                card.addEventListener('click', () => {
                    window.location.href = `product.html?id=${index}`;
                });
                offersContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load Categories for Filter
async function loadCategories() {
    try {
        const response = await fetch('categories.json');
        const categories = await response.json();
        const filterButtons = document.querySelector('.filter-buttons');
        if (filterButtons) {
            filterButtons.innerHTML = '<button onclick="filterProducts(\'all\')">الكل</button>';
            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.textContent = cat;
                btn.onclick = () => filterProducts(cat);
                filterButtons.appendChild(btn);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Filter Products
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }
    });
}

// Search Products
function searchProducts() {
    const input = document.querySelector('.search-bar').value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        const title = product.dataset.title;
        if (title.includes(input)) {
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }
    });
}

// Get Product ID from URL
function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

// Toggle Favorite
function toggleFavorite(index) {
    const isFavorite = localStorage.getItem(`favorite_${index}`) === 'true';
    localStorage.setItem(`favorite_${index}`, !isFavorite);
    loadProducts();
    loadFavorites();
    updateFavoritesCount();
    if (window.location.pathname.endsWith('product.html')) {
        loadProductDetails();
    }
}

// Load Favorites
async function loadFavorites() {
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        const favoritesContainer = document.getElementById('favorites-container');
        if (favoritesContainer) {
            favoritesContainer.innerHTML = '';
            products.forEach((product, index) => {
                if (localStorage.getItem(`favorite_${index}`) === 'true') {
                    const card = document.createElement('div');
                    card.className = 'product-card' + (product.isFeatured ? ' featured' : '');
                    card.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.description || ''}</p>
                        <p class="price">${product.price} جنيه</p>
                        <button class="favorite active" onclick="toggleFavorite(${index});" aria-label="أزل من المفضلة">❤️</button>
                        <a href="product.html?id=${index}" aria-label="عرض تفاصيل ${product.name}">عرض التفاصيل</a>
                    `;
                    favoritesContainer.appendChild(card);
                }
            });
        }
        updateFavoritesCount();
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
}

// Add to Cart from Product
async function addToCartFromProduct() {
    try {
        const productId = getProductId();
        const size = document.querySelector('input[name="size"]:checked').value;
        const delivery = document.querySelector('input[name="delivery"]:checked').value;
        const payment = document.querySelector('input[name="payment"]:checked').value;

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === productId && item.size === size);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id: productId, quantity: 1, size, delivery, payment });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert('تم إضافة المنتج إلى السلة!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('حدث خطأ أثناء إضافة المنتج إلى السلة.');
    }
}

// Load Cart
async function loadCart() {
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        const cartContainer = document.getElementById('cart-container');
        const totalElement = document.getElementById('cart-total');
        if (cartContainer) {
            cartContainer.innerHTML = '';
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            let total = 0;
            cart.forEach(item => {
                const product = products[item.id];
                if (product) {
                    total += product.price * item.quantity;
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <h3>${product.name}</h3>
                        <p>السعر: ${product.price} جنيه</p>
                        <p>الكمية: ${item.quantity}</p>
                        <p>الحجم: ${item.size}</p>
                        <p>التوصيل: ${item.delivery}</p>
                        <p>الدفع: ${item.payment}</p>
                        <button onclick="confirmRemoveFromCart(${item.id})">حذف</button>
                    `;
                    cartContainer.appendChild(cartItem);
                }
            });
            if (totalElement) {
                totalElement.textContent = `الإجمالي: ${total} جنيه`;
            }
        }
        updateCartCount();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Confirm Remove from Cart
function confirmRemoveFromCart(productId) {
    if (confirm('هل أنت متأكد أنك تريد حذف هذا المنتج من السلة؟')) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        loadCart();
    }
}

// Update Favorites Count
function updateFavoritesCount() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('favorite_') && localStorage.getItem(key) === 'true') {
            count++;
        }
    }
    const favoritesCountElements = document.querySelectorAll('#favorites-count');
    favoritesCountElements.forEach(element => {
        element.textContent = count;
    });
}

// Update Cart Count
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count, #cart-count-floating');
    cartCountElements.forEach(element => {
        element.textContent = count > 0 ? count : '0';
    });
    const floatingCartCount = document.querySelector('.floating-cart span');
    if (floatingCartCount) {
        floatingCartCount.textContent = count > 0 ? count : '';
    }
}

// Checkout from Product
async function checkout() {
    try {
        const productId = getProductId();
        const size = document.querySelector('input[name="size"]:checked').value;
        const delivery = document.querySelector('input[name="delivery"]:checked').value;
        const payment = document.querySelector('input[name="payment"]:checked').value;

        const response = await fetch('settings.json');
        const settings = await response.json();
        const phone = settings.phone;

        const productsResponse = await fetch('products.json');
        const products = await productsResponse.json();
        const product = products[productId];
        if (product) {
            const message = `طلب جديد من Cowboy Dairy Milk - ${new Date().toLocaleString('ar-EG')}:\nالمنتج: ${product.name}\nالسعر: ${product.price} جنيه\nالحجم: ${size}\nالتوصيل: ${delivery}\nالدفع: ${payment}`;
            window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('حدث خطأ أثناء إتمام الطلب.');
    }
}

// Checkout from Cart
async function checkoutFromCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            alert('السلة فارغة!');
            return;
        }
        const response = await fetch('settings.json');
        const settings = await response.json();
        const phone = settings.phone;

        const productsResponse = await fetch('products.json');
        const products = await productsResponse.json();
        let message = `طلب جديد من Cowboy Dairy Milk - ${new Date().toLocaleString('ar-EG')}:\n`;
        let total = 0;
        cart.forEach(item => {
            const product = products[item.id];
            if (product) {
                total += product.price * item.quantity;
                message += `المنتج: ${product.name}, الكمية: ${item.quantity}, السعر: ${product.price * item.quantity} جنيه, الحجم: ${item.size}, التوصيل: ${item.delivery}, الدفع: ${item.payment}\n`;
            }
        });
        message += `الإجمالي: ${total} جنيه`;
        window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    } catch (error) {
        console.error('Error during cart checkout:', error);
        alert('حدث خطأ أثناء إتمام الطلب.');
    }
}

// Load Product Details
async function loadProductDetails() {
    try {
        const productId = getProductId();
        if (!isNaN(productId)) {
            const response = await fetch('products.json');
            const products = await response.json();
            const product = products[productId];
            if (product) {
                document.getElementById('product-image').src = product.image;
                document.getElementById('product-name').textContent = product.name;
                document.getElementById('product-price').textContent = `${product.price} جنيه`;
                document.getElementById('product-description').textContent = product.description || 'لا يوجد وصف متاح';
                if (product.isFeatured) {
                    document.querySelector('.product-info').innerHTML += '<span class="featured-badge">مميز!</span>';
                }
                const isFavorite = localStorage.getItem(`favorite_${productId}`) === 'true';
                const favoriteButton = document.querySelector('.product-info button[onclick*="toggleFavorite"]');
                favoriteButton.textContent = isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة';
                favoriteButton.classList.toggle('active', isFavorite);
            }
        }
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

// Initialize
window.addEventListener('load', () => {
    document.getElementById('loading-screen').style.display = 'none';
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    loadSettings();
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        loadProducts(); // Load only offers for homepage
    } else if (window.location.pathname.endsWith('products.html')) {
        loadProducts();
        loadCategories();
    } else if (window.location.pathname.endsWith('product.html')) {
        loadProductDetails();
    } else if (window.location.pathname.endsWith('favorites.html')) {
        loadFavorites();
    } else if (window.location.pathname.endsWith('cart.html')) {
        loadCart();
    }
    updateFavoritesCount();
    updateCartCount();
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.animation = 'pulse 2s infinite';
    }
    const navUl = document.querySelector('nav ul');
    if (navUl) {
        navUl.classList.add('show');
    }
});