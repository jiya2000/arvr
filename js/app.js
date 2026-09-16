// ============================================
// Lumière — Main Application Controller (AR Overhaul)
// ============================================

import { CONFIG } from './config.js';
import { initCartUI, showToast, cart } from './cart.js';

let menuData = null;
let selectedDishId = null;

// --- Boot ---
async function boot() {
    try {
        const response = await fetch('./data/menu.json');
        menuData = await response.json();

        initCartUI();
        initSpatialMenu(menuData.items);
        initHUDInteractions();

        console.log('Lumière Spatial AR initialized');
    } catch (err) {
        console.error('Failed to initialize:', err);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}

function initSpatialMenu(items) {
    const carousel = document.getElementById('menu-carousel');
    if (!carousel) return;

    // Filter items that actually have 3D models to display in the carousel
    const arItems = items.filter(item => item.modelUrl);

    arItems.forEach((item, index) => {
        // Create an entity for the dish
        const dishEntity = document.createElement('a-entity');
        dishEntity.setAttribute('gltf-model', item.modelUrl);
        dishEntity.setAttribute('dish-interactable', `dishId: ${item.id}`);
        dishEntity.setAttribute('scale', '1 1 1');
        
        // We removed the particle system due to incompatibility, so no steam for now

        carousel.components['dish-carousel'].addDish(dishEntity);
    });
}

function initHUDInteractions() {
    const introScreen = document.getElementById('intro-screen');
    const enterArBtn = document.getElementById('enter-ar-btn');
    const explore3dBtn = document.getElementById('explore-3d-btn');
    const scene = document.querySelector('a-scene');

    // UI Buttons
    enterArBtn?.addEventListener('click', () => {
        if (scene.hasLoaded) {
            scene.enterVR();
        }
        introScreen.classList.remove('active');
    });

    explore3dBtn?.addEventListener('click', () => {
        console.log('Explore 3D button clicked');
        introScreen.classList.remove('active');
        // also set display none just to be safe
        setTimeout(() => {
            introScreen.style.display = 'none';
        }, 500);
    });

    // Carousel Controls
    const carousel = document.getElementById('menu-carousel');
    document.getElementById('prev-btn')?.addEventListener('click', () => {
        carousel.emit('rotate-carousel', { direction: -1 });
    });
    
    document.getElementById('next-btn')?.addEventListener('click', () => {
        carousel.emit('rotate-carousel', { direction: 1 });
    });

    // Dish Selection Event from A-Frame component
    window.addEventListener('dish-selected', (e) => {
        const dishId = e.detail.id;
        const dish = menuData.items.find(i => i.id === dishId);
        if (dish) {
            showDishInfo(dish);
        }
    });

    // Close Info Panel
    document.getElementById('close-info-btn')?.addEventListener('click', () => {
        document.getElementById('dish-info-panel').classList.remove('active');
        selectedDishId = null;
    });

    // Add to Order
    document.getElementById('add-to-order-btn')?.addEventListener('click', () => {
        if (selectedDishId) {
            const dish = menuData.items.find(i => i.id === selectedDishId);
            if (dish) {
                cart.add({
                    id: dish.id,
                    name: dish.name,
                    totalPrice: dish.price,
                    spice: dish.spiceLevel,
                    portion: 'regular',
                    modelUrl: dish.modelUrl
                });
                showToast(`${dish.name} materialized in your Cart Tray!`);
                document.getElementById('dish-info-panel').classList.remove('active');
            }
        }
    });

    // Portal Easter Egg
    window.addEventListener('portal-clicked', () => {
        showToast("You've unlocked the Chef's Secret Space!");
    });
}

function showDishInfo(dish) {
    selectedDishId = dish.id;
    const panel = document.getElementById('dish-info-panel');
    
    document.getElementById('info-title').textContent = dish.name;
    document.getElementById('info-price').textContent = `${CONFIG.restaurant.currency}${dish.price}`;
    document.getElementById('info-desc').textContent = dish.description;

    panel.classList.add('active');
}
