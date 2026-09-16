// ============================================
// Lumière — Volumetric AR Cart
// ============================================

import { CONFIG } from './config.js';

// --- State ---
export const cart = {
    items: [],
    load() {
        try {
            const saved = sessionStorage.getItem('lumiere-cart-ar');
            if (saved) this.items = JSON.parse(saved);
        } catch (e) { /* ignore */ }
    },
    save() {
        sessionStorage.setItem('lumiere-cart-ar', JSON.stringify(this.items));
    },
    add(item) {
        this.items.push(item);
        this.save();
        spawnItemOnTray(item);
        updateCartTotal3D();
    },
    clear() {
        this.items = [];
        this.save();
        clearTray();
        updateCartTotal3D();
    },
    get total() {
        return this.items.reduce((sum, i) => sum + i.totalPrice, 0);
    }
};

// --- Init ---
export function initCartUI() {
    cart.load();
    updateCartTotal3D();
    
    // Respawn existing items on reload
    cart.items.forEach(item => {
        spawnItemOnTray(item);
    });

    // Wire up 3D action buttons
    const checkoutBtn = document.getElementById('checkout-3d-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.items.length > 0) {
                showToast('Order Placed Successfully! (Demo)');
                cart.clear();
            } else {
                showToast('Your tray is empty!');
            }
        });
    }

    const clearBtn = document.getElementById('clear-3d-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (cart.items.length > 0) {
                cart.clear();
                showToast('Tray Cleared');
            }
        });
    }
}

function updateCartTotal3D() {
    const totalText = document.getElementById('cart-total-3d');
    if (totalText) {
        totalText.setAttribute('value', `Total: ${CONFIG.restaurant.currency}${cart.total}`);
    }
}

function spawnItemOnTray(item) {
    const tray = document.getElementById('ar-cart-tray');
    if (!tray) return;

    // Create a mini 3D object to represent the item
    const entity = document.createElement('a-entity');
    
    if (item.modelUrl) {
        entity.setAttribute('gltf-model', item.modelUrl);
        entity.setAttribute('scale', '0.1 0.1 0.1'); // Mini version
    } else {
        // Fallback placeholder
        entity.setAttribute('geometry', 'primitive: box; width: 0.1; height: 0.1; depth: 0.1');
        entity.setAttribute('material', 'color: #ffaa00');
    }

    // Randomize position on the tray
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    entity.setAttribute('position', `${x} 0.1 ${z}`);
    
    // Add a text label above the miniature item
    const label = document.createElement('a-text');
    label.setAttribute('value', item.name);
    label.setAttribute('scale', '0.2 0.2 0.2');
    label.setAttribute('position', '0 0.2 0');
    label.setAttribute('align', 'center');
    label.setAttribute('look-at', '[camera]'); // Face the user
    entity.appendChild(label);

    // Make it interactable to remove
    entity.setAttribute('class', 'interactable');
    entity.addEventListener('click', () => {
        // For simplicity, click removes this specific node and updates total
        const index = cart.items.findIndex(i => i.id === item.id);
        if (index > -1) {
            cart.items.splice(index, 1);
            cart.save();
            updateCartTotal3D();
            entity.parentNode.removeChild(entity);
            showToast(`Removed ${item.name}`);
        }
    });

    tray.appendChild(entity);
}

function clearTray() {
    const tray = document.getElementById('ar-cart-tray');
    if (!tray) return;
    
    // Remove all child nodes that are not the base cylinder or text
    const children = Array.from(tray.children);
    children.forEach(child => {
        if (!child.id || child.id !== 'cart-total-3d' && child.tagName.toLowerCase() !== 'a-cylinder' && child.tagName.toLowerCase() !== 'a-text') {
            tray.removeChild(child);
        }
    });
}

// --- Toast ---
// Keep a small DOM toast for simple text notifications, as it's less intrusive than blocking 3D text
let toastTimer;
export function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
}
