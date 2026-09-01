// ============================================
// Lumière — Cart & Customization Module
// ============================================

import { CONFIG } from './config.js';

class Cart {
    constructor() {
        this.items = [];
        this.listeners = [];
        this._load();
    }

    _load() {
        try {
            const saved = sessionStorage.getItem('lumiere-cart');
            if (saved) this.items = JSON.parse(saved);
        } catch (e) { /* ignore */ }
    }

    _save() {
        try {
            sessionStorage.setItem('lumiere-cart', JSON.stringify(this.items));
        } catch (e) { /* ignore */ }
        this._notify();
    }

    _notify() {
        this.listeners.forEach(fn => fn(this.items, this.getTotal()));
    }

    onChange(fn) {
        this.listeners.push(fn);
    }

    addItem(dish, options = {}) {
        const cartItem = {
            id: Date.now().toString(36),
            dishId: dish.id,
            name: dish.name,
            basePrice: dish.price,
            spiceLevel: options.spiceLevel || 'medium',
            portion: options.portion || 'regular',
            addons: options.addons || [],
            quantity: 1,
        };
        cartItem.totalPrice = this._calcItemPrice(cartItem, dish);
        this.items.push(cartItem);
        this._save();
        return cartItem;
    }

    removeItem(cartItemId) {
        this.items = this.items.filter(i => i.id !== cartItemId);
        this._save();
    }

    _calcItemPrice(cartItem, dish) {
        let price = cartItem.basePrice;
        if (cartItem.portion === 'large') price += Math.round(price * 0.4);
        if (dish && dish.addons) {
            cartItem.addons.forEach(addonName => {
                const addon = dish.addons.find(a => a.name === addonName);
                if (addon) price += addon.price;
            });
        }
        return price;
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }

    getCount() {
        return this.items.length;
    }

    getItems() {
        return [...this.items];
    }

    clear() {
        this.items = [];
        this._save();
    }
}

// Singleton
export const cart = new Cart();

// --- Cart UI ---
export function initCartUI() {
    // Create cart FAB
    const fab = document.createElement('button');
    fab.className = 'cart-fab';
    fab.id = 'cart-fab';
    fab.setAttribute('aria-label', 'Open cart');
    fab.innerHTML = `🛒<span class="cart-badge" id="cart-badge" style="display:none">0</span>`;
    document.body.appendChild(fab);

    // Create cart overlay
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.id = 'cart-overlay';
    document.body.appendChild(overlay);

    // Create cart panel
    const panel = document.createElement('div');
    panel.className = 'cart-panel';
    panel.id = 'cart-panel';
    panel.innerHTML = `
        <div class="cart-header">
            <h2 class="cart-title">Your Order</h2>
            <button class="modal-close" id="cart-close" aria-label="Close cart">✕</button>
        </div>
        <div class="cart-items" id="cart-items"></div>
        <div class="cart-footer" id="cart-footer">
            <div class="cart-total">
                <span>Total</span>
                <span class="cart-total-price" id="cart-total">${CONFIG.restaurant.currency}0</span>
            </div>
            <button class="btn-primary" style="width:100%" id="cart-checkout">
                Place Order (Demo)
            </button>
            <p style="font-size:0.7rem; color:var(--text-muted); text-align:center; margin-top:8px;">
                This is a prototype — no real order will be placed
            </p>
        </div>
    `;
    document.body.appendChild(panel);

    // Event listeners
    fab.addEventListener('click', () => toggleCart(true));
    overlay.addEventListener('click', () => toggleCart(false));
    document.getElementById('cart-close').addEventListener('click', () => toggleCart(false));
    document.getElementById('cart-checkout').addEventListener('click', () => {
        showToast('✅ Order placed successfully! (Demo)');
        cart.clear();
        toggleCart(false);
    });

    // Listen for cart changes
    cart.onChange((items, total) => {
        renderCartItems(items, total);
        updateBadge(items.length);
    });

    // Initial render
    renderCartItems(cart.getItems(), cart.getTotal());
    updateBadge(cart.getCount());
}

function toggleCart(open) {
    document.getElementById('cart-panel').classList.toggle('open', open);
    document.getElementById('cart-overlay').classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
}

function updateBadge(count) {
    const badge = document.getElementById('cart-badge');
    if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count;
    } else {
        badge.style.display = 'none';
    }
}

function renderCartItems(items, total) {
    const container = document.getElementById('cart-items');
    const footer = document.getElementById('cart-footer');

    if (items.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-top:8px;">
                    Browse the menu and add dishes to get started
                </p>
            </div>
        `;
        footer.style.display = 'none';
        return;
    }

    footer.style.display = 'block';
    container.innerHTML = items.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">
                    ${item.spiceLevel !== 'medium' ? `🌶️ ${item.spiceLevel}` : ''}
                    ${item.portion === 'large' ? '• Large' : ''}
                    ${item.addons.length > 0 ? `• +${item.addons.length} add-on${item.addons.length > 1 ? 's' : ''}` : ''}
                </div>
            </div>
            <span class="cart-item-price">${CONFIG.restaurant.currency}${item.totalPrice}</span>
            <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${item.name}">✕</button>
        </div>
    `).join('');

    document.getElementById('cart-total').textContent = `${CONFIG.restaurant.currency}${total}`;

    // Attach remove handlers
    container.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => cart.removeItem(btn.dataset.id));
    });
}

// --- Customization Modal ---
export function showCustomizeModal(dish) {
    // Remove existing modal if any
    const existing = document.getElementById('customize-modal');
    if (existing) existing.remove();

    let selectedSpice = dish.spiceLevel || 'medium';
    let selectedPortion = 'regular';
    let selectedAddons = [];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = 'customize-modal';
    overlay.innerHTML = `
        <div class="modal-content dish-detail" style="position:relative">
            <button class="modal-close" aria-label="Close">✕</button>

            ${dish.modelUrl ? `
                <div class="dish-detail-viewer">
                    <model-viewer
                        src="${dish.modelUrl}"
                        alt="${dish.name}"
                        auto-rotate
                        camera-controls
                        ar
                        shadow-intensity="1.5"
                        environment-image="neutral"
                        loading="lazy"
                        style="width:100%;height:100%;background:transparent;"
                    ></model-viewer>
                </div>
            ` : `
                <div class="dish-detail-viewer" style="display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:5rem">${getCategoryEmoji(dish.category)}</span>
                </div>
            `}

            <h2 class="dish-detail-name">${dish.name}</h2>
            <div class="dish-detail-price" id="customize-price">${CONFIG.restaurant.currency}${dish.price}</div>

            <div class="card-badges" style="margin-bottom:16px">
                <span class="badge badge-${dish.dietary === 'veg' ? 'veg' : 'non-veg'}">
                    ${dish.dietary === 'veg' ? '🟢 Vegetarian' : '🔴 Non-Veg'}
                </span>
                <span class="badge badge-spice ${dish.spiceLevel === 'hot' ? 'hot' : ''}">
                    🌶️ ${dish.spiceLevel.charAt(0).toUpperCase() + dish.spiceLevel.slice(1)}
                </span>
                <span class="badge badge-time">⏱ ${dish.prepTime} min</span>
                <span class="badge badge-cal">🔥 ${dish.calories} kcal</span>
            </div>

            <p class="dish-detail-desc">${dish.description}</p>

            ${dish.chefNote ? `
                <div class="chef-note">
                    <div class="chef-note-header">👨‍🍳 Chef's Note</div>
                    <p class="chef-note-text">"${dish.chefNote}"</p>
                </div>
            ` : ''}

            ${dish.allergens && dish.allergens.length > 0 ? `
                <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px">
                    ⚠️ Allergens: ${dish.allergens.join(', ')}
                </p>
            ` : ''}

            <h3 class="ingredients-title">Explore Ingredients</h3>
            <div class="ingredients-grid">
                ${dish.ingredients.map(ing => `
                    <div class="ingredient-chip" onclick="this.classList.toggle('expanded')">
                        <span class="icon">${ing.icon}</span>
                        <div>
                            <div>${ing.name}</div>
                            <div class="ingredient-detail">${ing.detail}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="customize-section">
                <div class="customize-title">Spice Level</div>
                <div class="option-group" id="spice-options">
                    <button class="option-btn ${selectedSpice === 'mild' ? 'selected' : ''}" data-value="mild">🌶️ Mild</button>
                    <button class="option-btn ${selectedSpice === 'medium' ? 'selected' : ''}" data-value="medium">🌶️🌶️ Medium</button>
                    <button class="option-btn ${selectedSpice === 'hot' ? 'selected' : ''}" data-value="hot">🌶️🌶️🌶️ Hot</button>
                </div>
            </div>

            <div class="customize-section">
                <div class="customize-title">Portion Size</div>
                <div class="option-group" id="portion-options">
                    <button class="option-btn selected" data-value="regular">Regular</button>
                    <button class="option-btn" data-value="large">Large (+40%)</button>
                </div>
            </div>

            ${dish.addons && dish.addons.length > 0 ? `
                <div class="customize-section">
                    <div class="customize-title">Add-ons</div>
                    ${dish.addons.map(addon => `
                        <div class="addon-item">
                            <span class="addon-name">${addon.name}</span>
                            <div class="addon-right">
                                <span class="addon-price">+${CONFIG.restaurant.currency}${addon.price}</span>
                                <div class="addon-toggle" data-addon="${addon.name}" data-price="${addon.price}"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div style="display:flex;gap:8px;margin-top:24px">
                <button class="btn-primary" style="flex:1" id="add-to-cart-btn">
                    🛒 Add to Cart — <span id="final-price">${CONFIG.restaurant.currency}${dish.price}</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Close button
    overlay.querySelector('.modal-close').addEventListener('click', () => closeCustomizeModal(overlay));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCustomizeModal(overlay);
    });

    // Spice level
    overlay.querySelectorAll('#spice-options .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.querySelectorAll('#spice-options .option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSpice = btn.dataset.value;
        });
    });

    // Portion
    overlay.querySelectorAll('#portion-options .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            overlay.querySelectorAll('#portion-options .option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPortion = btn.dataset.value;
            updatePrice();
        });
    });

    // Addons
    overlay.querySelectorAll('.addon-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const name = toggle.dataset.addon;
            if (toggle.classList.contains('active')) {
                selectedAddons.push(name);
            } else {
                selectedAddons = selectedAddons.filter(a => a !== name);
            }
            updatePrice();
        });
    });

    // Update price display
    function updatePrice() {
        let price = dish.price;
        if (selectedPortion === 'large') price += Math.round(price * 0.4);
        selectedAddons.forEach(name => {
            const addon = dish.addons?.find(a => a.name === name);
            if (addon) price += addon.price;
        });
        const priceStr = `${CONFIG.restaurant.currency}${price}`;
        document.getElementById('customize-price').textContent = priceStr;
        document.getElementById('final-price').textContent = priceStr;
    }

    // Add to cart
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        cart.addItem(dish, {
            spiceLevel: selectedSpice,
            portion: selectedPortion,
            addons: [...selectedAddons],
        });
        closeCustomizeModal(overlay);
        showToast(`✅ ${dish.name} added to cart!`);
    });
}

function closeCustomizeModal(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => overlay.remove(), 350);
}

function getCategoryEmoji(category) {
    const emojis = { starters: '🥘', mains: '🍛', desserts: '🍨', beverages: '🥤' };
    return emojis[category] || '🍽️';
}

// --- Toast ---
export function showToast(message, duration = 3000) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.id = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('visible'), duration);
}
