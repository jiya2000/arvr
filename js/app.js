// ============================================
// Lumière — Main Application Controller
// ============================================

import { CONFIG } from './config.js';
import { initCartUI, showCustomizeModal, showToast, cart } from './cart.js';
import { initDiscoveryUI, renderDiscoveryBar, triggerDiscovery } from './discovery.js';
import { renderRecommendationsUI } from './recommendations.js';
import { renderRestaurantTour } from './restaurant.js';
import { launchAR } from './ar.js';

let menuData = null;

// --- Boot ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load menu data
        const response = await fetch('./data/menu.json');
        menuData = await response.json();

        // Initialize modules
        initCartUI();
        initNavigation();
        filterMenu('all');
        initDiscoveryUI(menuData.items);

        // Handle AR add-to-cart events
        window.addEventListener('ar-add-to-cart', (e) => {
            const dish = e.detail.dish;
            if (dish) showCustomizeModal(dish);
        });

        console.log('🍽️ Lumière initialized successfully');
    } catch (err) {
        console.error('Failed to load menu data:', err);
        document.getElementById('menu-grid').innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-muted)">
                <p style="font-size:2rem;margin-bottom:12px">⚠️</p>
                <p>Failed to load menu. Please refresh the page.</p>
            </div>
        `;
    }
});

// --- Navigation ---
function initNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const view = tab.dataset.view;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            switchView(view);
        });
    });
}

function switchView(view) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

    if (view === 'all' || view.startsWith('cat-')) {
        // Menu view
        document.getElementById('view-menu').classList.add('active');
        filterMenu(view);
    } else if (view === 'recommend') {
        const section = document.getElementById('view-recommend');
        section.classList.add('active');
        renderRecommendationsUI(section, menuData.items, (dish) => {
            showCustomizeModal(dish);
        });
    } else if (view === 'restaurant') {
        const section = document.getElementById('view-restaurant');
        section.classList.add('active');
        renderRestaurantTour(section, () => {
            // Navigate back to menu
            document.querySelector('.tab-btn[data-view="all"]').click();
        });
    }
}

function filterMenu(view) {
    const grid = document.getElementById('menu-grid');
    const header = document.getElementById('menu-header');

    let filtered = menuData.items;
    let title = 'Full Menu';
    let subtitle = 'Our complete culinary collection';

    if (view.startsWith('cat-')) {
        const catId = view.replace('cat-', '');
        filtered = menuData.items.filter(item => item.category === catId);
        const cat = menuData.categories.find(c => c.id === catId);
        if (cat) {
            title = cat.name;
            subtitle = cat.description;
        }
    }

    // Update header
    header.innerHTML = `
        <h2 class="section-title">${title}</h2>
        <p class="section-subtitle">${subtitle}</p>
    `;

    // Render cards
    renderMenuCards(grid, filtered);
}

// --- Menu Cards ---
function renderMenuCards(container, items) {
    container.innerHTML = items.map((item, i) => {
        const categoryEmoji = getCategoryEmoji(item.category);
        const spiceIcons = getSpiceIcons(item.spiceLevel);
        const hasModel = !!item.modelUrl;

        return `
            <div class="menu-card ${item.featured ? 'featured' : ''}" style="animation-delay:${i * 0.05}s" data-id="${item.id}">
                <!-- Viewer -->
                <div class="card-viewer" id="viewer-${item.id}">
                    ${hasModel ? `
                        <model-viewer
                            src="${item.modelUrl}"
                            alt="${item.name}"
                            auto-rotate
                            camera-controls
                            ar
                            ar-modes="webxr scene-viewer quick-look"
                            shadow-intensity="1.5"
                            environment-image="neutral"
                            camera-orbit="${CONFIG.ar.cameraOrbit}"
                            loading="lazy"
                            reveal="auto"
                        ></model-viewer>
                    ` : `
                        <div class="card-viewer-fallback">
                            <span class="dish-emoji">${categoryEmoji}</span>
                            ${['starters', 'mains'].includes(item.category) ? `
                                <div class="steam-container">
                                    <div class="steam"></div>
                                    <div class="steam"></div>
                                    <div class="steam"></div>
                                    <div class="steam"></div>
                                </div>
                            ` : ''}
                        </div>
                    `}
                </div>

                <!-- Card Body -->
                <div class="card-body">
                    <div class="card-title-row">
                        <h3 class="card-name">${item.name}</h3>
                        <span class="card-price">${CONFIG.restaurant.currency}${item.price}</span>
                    </div>

                    <div class="card-badges">
                        <span class="badge badge-${item.dietary === 'veg' ? 'veg' : 'non-veg'}">
                            ${item.dietary === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                        </span>
                        <span class="badge badge-spice ${item.spiceLevel === 'hot' ? 'hot' : ''}">
                            ${spiceIcons}
                        </span>
                        <span class="badge badge-time">⏱ ${item.prepTime}m</span>
                        <span class="badge badge-cal">${item.calories} kcal</span>
                    </div>

                    <p class="card-desc">${item.description}</p>

                    <div class="card-actions">
                        <button class="btn-ar view-dish-btn" data-id="${item.id}">
                            ${hasModel ? '🔮 View 3D / AR' : '📋 Details'}
                        </button>
                        <button class="btn-cart add-cart-btn" data-id="${item.id}">
                            🛒 Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach event listeners
    container.querySelectorAll('.view-dish-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dish = menuData.items.find(i => i.id === btn.dataset.id);
            if (dish) {
                if (dish.modelUrl) {
                    launchAR(dish);
                    triggerDiscovery(dish);
                } else {
                    showCustomizeModal(dish);
                }
            }
        });
    });

    container.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dish = menuData.items.find(i => i.id === btn.dataset.id);
            if (dish) showCustomizeModal(dish);
        });
    });
}

// --- Utility Functions ---
function getCategoryEmoji(category) {
    const map = { starters: '🥘', mains: '🍛', desserts: '🍨', beverages: '🥤' };
    return map[category] || '🍽️';
}

function getSpiceIcons(level) {
    switch (level) {
        case 'mild': return '🌶️ Mild';
        case 'medium': return '🌶️🌶️ Medium';
        case 'hot': return '🌶️🌶️🌶️ Hot';
        default: return '🌶️ Medium';
    }
}
