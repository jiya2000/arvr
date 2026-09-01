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
            const arLink = item.modelUrl
                ? `<button class="menu-item__ar-link" data-id="${item.id}">View in AR →</button>`
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
                            ${arLink}
                        </div>
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
                launchAR(dish);
                triggerDiscovery(dish);
            }
        });
    });

    // Event: Add button
    container.querySelectorAll('.menu-item__add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dish = menuData.items.find(i => i.id === btn.dataset.id);
            if (dish) showCustomizeModal(dish);
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
