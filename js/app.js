// ============================================
// Lumière — Main Application Controller
// ============================================

import { CONFIG } from './config.js';
import { initCartUI, showCustomizeModal, showToast } from './cart.js';
import { initDiscoveryUI, renderDiscoveryBar, triggerDiscovery } from './discovery.js';
import { renderRecommendationsUI } from './recommendations.js';
import { renderRestaurantTour } from './restaurant.js';
import { launchAR } from './ar.js';

let menuData = null;

// --- Boot ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./data/menu.json');
        menuData = await response.json();

        initCartUI();
        initNavigation();
        initDiscoveryUI(menuData.items);

        // AR add-to-cart from AR viewer
        window.addEventListener('ar-add-to-cart', (e) => {
            if (e.detail.dish) showCustomizeModal(e.detail.dish);
        });

        // Hero buttons
        document.getElementById('hero-menu-btn')?.addEventListener('click', () => navigateTo('all'));
        document.getElementById('hero-ar-btn')?.addEventListener('click', () => navigateTo('all'));
        document.getElementById('story-menu-btn')?.addEventListener('click', () => navigateTo('all'));

        // Featured dish buttons
        const featuredDish = menuData.items.find(i => i.id === 'chicken-biryani') || menuData.items.find(i => i.featured);
        if (featuredDish) {
            document.getElementById('featured-ar-btn')?.addEventListener('click', () => {
                launchAR(featuredDish);
                triggerDiscovery(featuredDish);
            });
            document.getElementById('featured-add-btn')?.addEventListener('click', () => {
                showCustomizeModal(featuredDish);
            });
        }

        // Footer links
        document.querySelectorAll('.site-footer__link[data-view]').forEach(link => {
            link.addEventListener('click', () => navigateTo(link.dataset.view));
        });

        console.log('Lumière initialized');
    } catch (err) {
        console.error('Failed to initialize:', err);
    }
});

// --- Navigation ---
function initNavigation() {
    // Nav links
    document.querySelectorAll('.site-nav__link, .site-nav__cta').forEach(link => {
        link.addEventListener('click', () => navigateTo(link.dataset.view));
    });

    // Mobile toggle
    document.getElementById('nav-toggle')?.addEventListener('click', () => {
        document.getElementById('nav-links').classList.toggle('open');
    });

    // Menu tabs (inside menu view)
    document.querySelectorAll('.menu-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderMenu(tab.dataset.filter);
        });
    });
}

function navigateTo(view) {
    // Close mobile nav
    document.getElementById('nav-links')?.classList.remove('open');

    // Update active nav
    document.querySelectorAll('.site-nav__link').forEach(l => l.classList.remove('active'));
    const navLink = document.querySelector(`.site-nav__link[data-view="${view}"]`);
    if (navLink) navLink.classList.add('active');

    // Hide all views
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));

    if (view === 'home') {
        document.getElementById('view-home').classList.add('active');
    } else if (view === 'all') {
        document.getElementById('view-menu').classList.add('active');
        renderMenu('all');
    } else if (view === 'recommend') {
        const section = document.getElementById('view-recommend');
        section.classList.add('active');
        renderRecommendationsUI(section, menuData.items, (dish) => showCustomizeModal(dish));
    } else if (view === 'restaurant') {
        const section = document.getElementById('view-restaurant');
        section.classList.add('active');
        renderRestaurantTour(section, () => navigateTo('all'));
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Menu Rendering (Editorial) ---
function renderMenu(filter) {
    const container = document.getElementById('menu-list');
    if (!container) return;

    let items = menuData.items;
    if (filter && filter !== 'all') {
        items = items.filter(i => i.category === filter);
    }

    // Group by category
    const groups = {};
    items.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
    });

    // Build discovery bar + menu
    const discoveryHtml = `<div id="discovery-container"></div>`;

    let html = discoveryHtml;

    const categoryOrder = ['starters', 'mains', 'desserts', 'beverages'];
    const categoryNames = { starters: 'Starters', mains: 'Main courses', desserts: 'Desserts', beverages: 'Beverages' };

    categoryOrder.forEach(catId => {
        if (!groups[catId]) return;
        html += `<h3 class="menu-category-header">${categoryNames[catId]}</h3>`;

        groups[catId].forEach(item => {
            const dietary = item.dietary === 'veg'
                ? '<span class="menu-item__dietary menu-item__dietary--veg">Veg</span>'
                : '<span class="menu-item__dietary menu-item__dietary--nonveg">Non-veg</span>';

            const spiceDots = getSpiceDots(item.spiceLevel);
            const arLink = '';
            
            const arPreview = item.modelUrl
                ? `
                <div class="menu-item__ar-preview">
                    <model-viewer
                        src="${item.modelUrl}"
                        ${item.iosSrc ? `ios-src="${item.iosSrc}"` : ''}
                        alt="${item.name}"
                        auto-rotate camera-controls
                        shadow-intensity="0.8"
                        environment-image="neutral"
                        ar-placement="floor"
                        loading="lazy"
                    >
                        <div class="skeleton-shimmer" slot="poster"></div>
                        ${(item.category === 'mains' || item.category === 'starters') ? '<div class="hot-dish-steam"></div><div class="hot-dish-steam"></div><div class="hot-dish-steam"></div>' : ''}
                    </model-viewer>
                    <div style="display:flex; justify-content:center; margin-top:8px;">
                        <span class="microcopy" style="font-size:0.7rem; color:var(--text-muted);">No app needed — works directly in your browser</span>
                    </div>
                    <button class="btn btn--secondary btn--small menu-item__ar-link" data-id="${item.id}" style="width:100%;margin-top:4px;">Experience in AR →</button>
                    <button class="btn btn--ghost btn--small menu-item__compare-link" data-id="${item.id}" style="width:100%;margin-top:4px; font-size: 0.75rem;">Compare with another dish</button>
                </div>
                `
                : '';

            html += `
                <div class="menu-item" data-id="${item.id}">
                    <div class="menu-item__main">
                        <div class="menu-item__title-row">
                            <span class="menu-item__name">${item.name}</span>
                            ${dietary}
                        </div>
                        <p class="menu-item__desc">${item.description}</p>
                        <div class="menu-item__meta">
                            <span class="menu-item__tag">${spiceDots}</span>
                            <span class="menu-item__tag">${item.prepTime} min</span>
                            <span class="menu-item__tag">${item.calories} kcal</span>
                        </div>
                        ${arPreview}
                    </div>
                    <div class="menu-item__right">
                        <span class="menu-item__price">${CONFIG.restaurant.currency}${item.price}</span>
                        <button class="menu-item__add" data-id="${item.id}">Add</button>
                    </div>
                </div>
            `;
        });
    });

    container.innerHTML = html;

    // Trigger sequential 3D unfold animation
    const menuItems = container.querySelectorAll('.menu-item');
    menuItems.forEach((row, index) => {
        setTimeout(() => {
            row.classList.add('unfold-active');
        }, index * 60); // 60ms stagger
    });

    // Render discovery bar inside menu
    renderDiscoveryBar(document.getElementById('discovery-container'));

    // Event: click row to open detail
    container.querySelectorAll('.menu-item').forEach(row => {
        row.addEventListener('click', (e) => {
            // Don't trigger if they clicked the add or AR button
            if (e.target.closest('.menu-item__add') || e.target.closest('.menu-item__ar-link')) return;
            const dish = menuData.items.find(i => i.id === row.dataset.id);
            if (dish) showCustomizeModal(dish);
        });
    });

    // Event: AR link
    container.querySelectorAll('.menu-item__ar-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dish = menuData.items.find(i => i.id === btn.dataset.id);
            if (dish) {
                console.log(`[Analytics] Track Event: AR Button Clicked (from Menu list) | Dish: ${dish.name}`);
                launchAR(dish);
                triggerDiscovery(dish);
            }
        });
    });

    // Event: Compare link
    container.querySelectorAll('.menu-item__compare-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dish = menuData.items.find(i => i.id === btn.dataset.id);
            if (dish) {
                console.log(`[Analytics] Track Event: Compare Mode Started | Dish: ${dish.name}`);
                startCompareMode(dish);
            }
        });
    });

    // Event: Add button
    container.querySelectorAll('.menu-item__add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dish = menuData.items.find(i => i.id === btn.dataset.id);
            if (dish) {
                console.log(`[Analytics] Track Event: Add to Order Clicked (from Menu list) | Dish: ${dish.name}`);
                showCustomizeModal(dish);
            }
        });
    });
}

// --- Utility ---
function getSpiceDots(level) {
    switch (level) {
        case 'mild': return '● ○ ○ Mild';
        case 'medium': return '● ● ○ Medium';
        case 'hot': return '● ● ● Hot';
        default: return '● ● ○ Medium';
    }
}

// --- Compare Mode ---
function startCompareMode(dish1) {
    // Show a modal to select second dish
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal" style="padding:24px; text-align:center;">
            <button class="modal__close">✕</button>
            <h3 style="font-family:var(--font-serif); font-size:1.8rem; margin-bottom:16px;">Compare Portions</h3>
            <p style="color:var(--text-secondary); margin-bottom:24px;">Select another dish to compare side-by-side with <strong>${dish1.name}</strong>.</p>
            <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; max-height: 400px; overflow-y:auto;">
                ${menuData.items.filter(d => d.modelUrl && d.id !== dish1.id).map(d => `
                    <button class="btn btn--secondary btn--small compare-select-btn" data-id="${d.id}" style="width:45%; text-align:left; padding:8px;">
                        ${d.name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.modal__close').addEventListener('click', () => overlay.remove());

    overlay.querySelectorAll('.compare-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dish2 = menuData.items.find(i => i.id === btn.dataset.id);
            if (dish2) {
                overlay.remove();
                showCompareView(dish1, dish2);
            }
        });
    });
}

function showCompareView(dish1, dish2) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 2500;
        background: #F5F1E8; display: flex; flex-direction: column;
    `;
    overlay.innerHTML = `
        <div style="padding:16px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border);">
            <h2 style="font-family:var(--font-serif); font-size:1.5rem;">Compare</h2>
            <button class="modal__close" style="position:static;" id="compare-close">✕</button>
        </div>
        <div style="display:flex; flex:1; overflow:hidden;">
            <div style="flex:1; border-right:1px solid var(--border); display:flex; flex-direction:column;">
                <model-viewer
                    src="${dish1.modelUrl}"
                    ${dish1.iosSrc ? `ios-src="${dish1.iosSrc}"` : ''}
                    auto-rotate camera-controls
                    style="flex:1; width:100%;"
                ></model-viewer>
                <div style="padding:16px; text-align:center; background:var(--bg-alt);">
                    <h3 style="font-family:var(--font-serif);">${dish1.name}</h3>
                    <p style="color:var(--text-secondary);">${CONFIG.restaurant.currency}${dish1.price}</p>
                </div>
            </div>
            <div style="flex:1; display:flex; flex-direction:column;">
                <model-viewer
                    src="${dish2.modelUrl}"
                    ${dish2.iosSrc ? `ios-src="${dish2.iosSrc}"` : ''}
                    auto-rotate camera-controls
                    style="flex:1; width:100%;"
                ></model-viewer>
                <div style="padding:16px; text-align:center; background:var(--bg-alt);">
                    <h3 style="font-family:var(--font-serif);">${dish2.name}</h3>
                    <p style="color:var(--text-secondary);">${CONFIG.restaurant.currency}${dish2.price}</p>
                </div>
            </div>
        </div>
        <div style="padding:16px; text-align:center; background:var(--bg-warm); color:var(--text-on-dark);">
            <p style="font-size:0.85rem; opacity:0.8;">Note: You can view one dish at a time in full AR.</p>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#compare-close').addEventListener('click', () => overlay.remove());
}
