// ============================================
// Lumière — Cart & Customization
// ============================================

import { CONFIG } from './config.js';

// --- State ---
export const cart = {
    items: [],
    load() {
        try {
            const saved = sessionStorage.getItem('lumiere-cart');
            if (saved) this.items = JSON.parse(saved);
        } catch (e) { /* ignore */ }
    },
    save() {
        sessionStorage.setItem('lumiere-cart', JSON.stringify(this.items));
    },
    add(item) {
        this.items.push(item);
        this.save();
        updateCartBadge();
    },
    remove(index) {
        this.items.splice(index, 1);
        this.save();
        updateCartBadge();
    },
    clear() {
        this.items = [];
        this.save();
        updateCartBadge();
    },
    get total() {
        return this.items.reduce((sum, i) => sum + i.totalPrice, 0);
    }
};

// --- Init ---
export function initCartUI() {
    cart.load();
    injectCartElements();
    updateCartBadge();
}

function injectCartElements() {
    // Cart FAB
    const fab = document.createElement('button');
    fab.className = 'cart-fab';
    fab.id = 'cart-fab';
    fab.innerHTML = '🛒<span class="cart-badge" id="cart-badge" style="display:none">0</span>';
    fab.addEventListener('click', openCart);
    document.body.appendChild(fab);

    // Cart overlay + panel
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.id = 'cart-overlay';
    overlay.addEventListener('click', closeCart);
    document.body.appendChild(overlay);

    const panel = document.createElement('div');
    panel.className = 'cart-panel';
    panel.id = 'cart-panel';
    panel.innerHTML = `
        <div class="cart-header">
            <h3 class="cart-title">Your order</h3>
            <button id="cart-close" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--text-secondary)">✕</button>
        </div>
        <div class="cart-items" id="cart-items"></div>
        <div class="cart-footer" id="cart-footer"></div>
    `;
    document.body.appendChild(panel);

    document.getElementById('cart-close').addEventListener('click', closeCart);

    // Modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'modal-overlay';
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    modalOverlay.innerHTML = '<div class="modal" id="modal-content"></div>';
    document.body.appendChild(modalOverlay);

    // Toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'toast';
    document.body.appendChild(toast);
}

function openCart() {
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-panel').classList.add('open');
    renderCartItems();
}

function closeCart() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-panel').classList.remove('open');
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = cart.items.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const footer = document.getElementById('cart-footer');

    if (cart.items.length === 0) {
        container.innerHTML = '<div class="cart-empty">Your order is empty</div>';
        footer.innerHTML = '';
        return;
    }

    container.innerHTML = cart.items.map((item, i) => {
        const details = [];
        if (item.spice && item.spice !== 'medium') details.push(item.spice);
        if (item.portion === 'large') details.push('Large');
        if (item.addons?.length) details.push(item.addons.join(', '));

        return `
            <div class="cart-item">
                <div>
                    <div class="cart-item__name">${item.name}</div>
                    ${details.length ? `<div class="cart-item__details">${details.join(' · ')}</div>` : ''}
                </div>
                <div style="display:flex;align-items:center">
                    <span class="cart-item__price">${CONFIG.restaurant.currency}${item.totalPrice}</span>
                    <button class="cart-item__remove" data-index="${i}">✕</button>
                </div>
            </div>
        `;
    }).join('');

    footer.innerHTML = `
        <div class="cart-total">
            <span>Total</span>
            <span>${CONFIG.restaurant.currency}${cart.total}</span>
        </div>
        <button class="btn btn--primary btn--full" id="checkout-btn">Place order (demo)</button>
        <button class="btn btn--ghost btn--full" id="clear-cart-btn" style="margin-top:8px">Clear order</button>
    `;

    // Remove buttons
    container.querySelectorAll('.cart-item__remove').forEach(btn => {
        btn.addEventListener('click', () => {
            cart.remove(parseInt(btn.dataset.index));
            renderCartItems();
        });
    });

    // Checkout
    document.getElementById('checkout-btn')?.addEventListener('click', () => {
        showToast('Order placed (demo)');
        cart.clear();
        renderCartItems();
        setTimeout(closeCart, 1000);
    });

    // Clear
    document.getElementById('clear-cart-btn')?.addEventListener('click', () => {
        cart.clear();
        renderCartItems();
    });
}

// --- Customize Modal ---
export function showCustomizeModal(dish) {
    const modal = document.getElementById('modal-content');
    const overlay = document.getElementById('modal-overlay');

    let selectedSpice = 'medium';
    let selectedPortion = 'regular';
    const selectedAddons = new Set();

    const hasModel = !!dish.modelUrl;

    modal.innerHTML = `
        ${hasModel ? `
            <div class="modal__viewer">
                <model-viewer
                    src="${dish.modelUrl}"
                    alt="${dish.name}"
                    auto-rotate camera-controls
                    shadow-intensity="0.8"
                    environment-image="neutral"
                    loading="lazy"
                ></model-viewer>
            </div>
        ` : ''}
        <button class="modal__close" id="modal-close-btn">✕</button>
        <div class="modal__body">
            <h2 class="modal__name">${dish.name}</h2>
            <p class="modal__price">${CONFIG.restaurant.currency}${dish.price}</p>
            <p class="modal__desc">${dish.description}</p>

            <div class="modal__badges">
                <span class="modal__badge">${dish.dietary === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}</span>
                <span class="modal__badge">${dish.calories} kcal</span>
                <span class="modal__badge">${dish.prepTime} min</span>
            </div>

            ${dish.chefNote ? `
                <div class="chef-note">
                    <div class="chef-note__label">Chef's note</div>
                    <p class="chef-note__text">${dish.chefNote}</p>
                </div>
            ` : ''}

            ${dish.ingredients?.length ? `
                <div class="ingredients">
                    <h4 class="ingredients__title">Ingredients</h4>
                    <div class="ingredients__list">
                        ${dish.ingredients.map(ing => `
                            <span class="ingredient" data-detail="${ing.detail || ''}">${ing.name}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="customize" style="margin-bottom:20px">
                <p class="customize__label">Spice level</p>
                <div class="customize__options" id="spice-options">
                    <button class="option-btn" data-val="mild">Mild</button>
                    <button class="option-btn selected" data-val="medium">Medium</button>
                    <button class="option-btn" data-val="hot">Hot</button>
                </div>
            </div>

            <div class="customize" style="margin-bottom:20px">
                <p class="customize__label">Portion</p>
                <div class="customize__options" id="portion-options">
                    <button class="option-btn selected" data-val="regular">Regular</button>
                    <button class="option-btn" data-val="large">Large (+40%)</button>
                </div>
            </div>

            ${dish.addons?.length ? `
                <div class="customize" style="margin-bottom:24px">
                    <p class="customize__label">Add-ons</p>
                    ${dish.addons.map(a => `
                        <div class="addon-row">
                            <span>${a.name}</span>
                            <div class="addon-row__right">
                                <span class="addon-row__price">+${CONFIG.restaurant.currency}${a.price}</span>
                                <button class="toggle" data-addon="${a.name}" data-price="${a.price}"></button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid var(--border);margin-top:8px">
                <div>
                    <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Total</div>
                    <div id="modal-total" style="font-size:1.2rem;font-weight:500">${CONFIG.restaurant.currency}${dish.price}</div>
                </div>
                <button class="btn btn--primary" id="add-to-cart-btn">Add to order</button>
            </div>
        </div>
    `;

    overlay.classList.add('active');

    // Close
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);

    // Ingredient expand
    modal.querySelectorAll('.ingredient').forEach(el => {
        el.addEventListener('click', () => el.classList.toggle('expanded'));
    });

    // Spice
    modal.querySelectorAll('#spice-options .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('#spice-options .option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSpice = btn.dataset.val;
        });
    });

    // Portion
    modal.querySelectorAll('#portion-options .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.querySelectorAll('#portion-options .option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedPortion = btn.dataset.val;
            updateTotal();
        });
    });

    // Addons
    modal.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const addon = toggle.dataset.addon;
            if (toggle.classList.contains('active')) {
                selectedAddons.add(addon);
            } else {
                selectedAddons.delete(addon);
            }
            updateTotal();
        });
    });

    function updateTotal() {
        let price = dish.price;
        if (selectedPortion === 'large') price = Math.round(price * 1.4);
        modal.querySelectorAll('.toggle.active').forEach(t => {
            price += parseInt(t.dataset.price);
        });
        document.getElementById('modal-total').textContent = `${CONFIG.restaurant.currency}${price}`;
    }

    // Add to cart
    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        let price = dish.price;
        if (selectedPortion === 'large') price = Math.round(price * 1.4);
        const addonNames = [];
        modal.querySelectorAll('.toggle.active').forEach(t => {
            price += parseInt(t.dataset.price);
            addonNames.push(t.dataset.addon);
        });

        cart.add({
            id: dish.id,
            name: dish.name,
            spice: selectedSpice,
            portion: selectedPortion,
            addons: addonNames,
            totalPrice: price
        });

        closeModal();
        showToast(`${dish.name} added to your order`);
    });
}

function closeModal() {
    document.getElementById('modal-overlay')?.classList.remove('active');
}

// --- Toast ---
let toastTimer;
export function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
}
