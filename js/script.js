// ========== GLOBAL FUNCTIONS FOR ALL PAGES ==========

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Main initialization function
function initializeWebsite() {
    // Update cart count from localStorage
    updateCartCount();

    // Set current year in footer
    setCurrentYear();

    // Add active class to current page in navigation
    highlightCurrentPage();

    // Initialize tooltips
    initTooltips();
}

// Update cart count badge
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

        // Update all cart badges
        document.querySelectorAll('.cart-count, #cartBadge').forEach(badge => {
            if (badge) {
                badge.textContent = totalItems;
                badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
            }
        });
    } catch (error) {
        console.log('Cart is empty or error loading cart');
    }
}

// Set current year in footer
function setCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(element => {
        if (element) {
            element.textContent = currentYear;
        }
    });
}

// Highlight current page in navigation
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage ||
            (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Initialize Bootstrap tooltips
function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0 && typeof bootstrap !== 'undefined') {
        const tooltipList = [...tooltipTriggerList].map(
            tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl)
        );
    }
}

// ========== SHOPPING CART FUNCTIONS ==========

// Add product to cart
function addToCart(productId, productName, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            image: image,
            quantity: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show success message
    showNotification(`${productName} added to cart!`, 'success');

    return false; // Prevent default link behavior
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Reload cart page if on cart page
    if (window.location.pathname.includes('cart.html')) {
        window.location.reload();
    }
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('cart');
        updateCartCount();

        if (window.location.pathname.includes('cart.html')) {
            window.location.reload();
        }
    }
}

// ========== NOTIFICATION SYSTEM ==========

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-left: 4px solid #3498db;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            
            .notification-success {
                border-left-color: #27ae60;
            }
            
            .notification-error {
                border-left-color: #e74c3c;
            }
            
            .notification-warning {
                border-left-color: #f39c12;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ========== FORM VALIDATION ==========

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone (Pakistan)
function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone.replace(/\D/g, ''));
}

// Validate form
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const inputs = form.querySelectorAll('[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        } else if (input.type === 'email' && !validateEmail(input.value)) {
            markInvalid(input, 'Please enter a valid email');
            isValid = false;
        } else if (input.type === 'tel' && !validatePhone(input.value)) {
            markInvalid(input, 'Please enter a valid phone number');
            isValid = false;
        } else {
            markValid(input);
        }
    });

    return isValid;
}

// Mark input as invalid
function markInvalid(input, message) {
    input.style.borderColor = '#e74c3c';

    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();

    // Add error message
    const error = document.createElement('div');
    error.className = 'error-message';
    error.style.color = '#e74c3c';
    error.style.fontSize = '12px';
    error.style.marginTop = '5px';
    error.textContent = message;

    input.parentElement.appendChild(error);
}

// Mark input as valid
function markValid(input) {
    input.style.borderColor = '#27ae60';

    // Remove error message
    const error = input.parentElement.querySelector('.error-message');
    if (error) error.remove();
}

// ========== BUSINESS FUNCTIONS ==========

// Open WhatsApp with pre-filled message
function contactViaWhatsApp(message = '') {
    const defaultMessage = "Hello RC Technologies, I'm interested in your security products.";
    const finalMessage = message || defaultMessage;
    const url = `https://wa.me/923001234567?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, '_blank');
}

// Call business number
function callBusiness() {
    window.location.href = 'tel:0211234567';
}

// Email business
function emailBusiness() {
    window.location.href = 'mailto:info@rctechnologies.pk?subject=Inquiry%20from%20Website';
}

// ========== UI ENHANCEMENTS ==========

// Toggle mobile menu
function toggleMobileMenu() {
    const navbar = document.querySelector('.navbar-collapse');
    if (navbar) {
        navbar.classList.toggle('show');
    }
}

// Smooth scroll to element
function smoothScroll(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        window.scrollTo({
            top: element.offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

// Back to top button
function setupBackToTop() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-chevron-up"></i>';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        transition: all 0.3s;
    `;

    button.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        button.style.display = window.scrollY > 500 ? 'flex' : 'none';
    });
}

// Initialize back to top button
if (!document.querySelector('.back-to-top')) {
    setupBackToTop();
}

// ========== TEST DATA FOR DEMO ==========

// Load demo products (for testing)
function loadDemoProducts() {
    if (window.location.pathname.includes('products.html')) {
        // This would normally come from a database
        const demoProducts = [{
                id: 1,
                name: "Dahua 4MP Dome Camera",
                price: 8500,
                image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                category: "cctv",
                brand: "Dahua"
            },
            // Add more demo products as needed
        ];

        // Save to localStorage for demo
        if (!localStorage.getItem('demoProducts')) {
            localStorage.setItem('demoProducts', JSON.stringify(demoProducts));
        }
    }
}

// ========== EXPORT FUNCTIONS FOR GLOBAL USE ==========

// Make functions available globally
window.RC_Tech = {
    addToCart,
    removeFromCart,
    clearCart,
    updateCartCount,
    showNotification,
    validateForm,
    contactViaWhatsApp,
    callBusiness,
    emailBusiness,
    smoothScroll
};

console.log('RC Technologies JavaScript loaded successfully!');