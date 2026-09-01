// ============================================
// Lumière — Discovery Game Module
// ============================================

import { CONFIG } from './config.js';
import { showToast } from './cart.js';

const STORAGE_KEY = 'lumiere-discovery';

class DiscoveryGame {
    constructor() {
        this.discovered = [];
        this.points = 0;
        this._load();
    }

    _load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                this.discovered = data.discovered || [];
                this.points = data.points || 0;
            }
        } catch (e) { /* ignore */ }
    }

    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                discovered: this.discovered,
                points: this.points,
            }));
        } catch (e) { /* ignore */ }
    }

    discover(dishId) {
        if (this.discovered.includes(dishId)) return null;
        this.discovered.push(dishId);
        this.points += CONFIG.discovery.pointsPerDiscovery;
        this._save();
        return {
            dishId,
            points: this.points,
            totalDiscovered: this.discovered.length,
        };
    }

    isDiscovered(dishId) {
        return this.discovered.includes(dishId);
    }

    getProgress() {
        return {
            discovered: this.discovered.length,
            total: CONFIG.discovery.totalHotspots,
            points: this.points,
            badge: this.getCurrentBadge(),
        };
    }

    getCurrentBadge() {
        let badge = null;
        for (const b of CONFIG.discovery.badges) {
            if (this.discovered.length >= b.threshold) badge = b;
        }
        return badge;
    }

    reset() {
        this.discovered = [];
        this.points = 0;
        this._save();
    }
}

export const discovery = new DiscoveryGame();

// --- Discovery UI ---

export function initDiscoveryUI(menuItems) {
    const featuredItems = menuItems.filter(item => item.featured);
    // Render the discovery bar
    renderDiscoveryBar();
    return featuredItems;
}

export function renderDiscoveryBar() {
    const existing = document.getElementById('discovery-bar');
    if (existing) existing.remove();

    const progress = discovery.getProgress();
    const bar = document.createElement('div');
    bar.className = 'discovery-bar';
    bar.id = 'discovery-bar';

    const pct = Math.round((progress.discovered / progress.total) * 100);
    const badge = progress.badge;

    bar.innerHTML = `
        <div class="discovery-info">
            <span class="discovery-icon">🔍</span>
            <div class="discovery-text">
                <strong>AR Dish Hunt</strong> — Discover featured dishes
                ${badge ? `<br><span style="font-size:0.75rem">${badge.icon} ${badge.name}</span>` : ''}
            </div>
        </div>
        <div class="discovery-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width:${pct}%"></div>
            </div>
            <span class="progress-count">${progress.discovered}/${progress.total}</span>
            <span style="font-size:0.8rem;color:var(--gold)">⭐ ${progress.points}</span>
        </div>
    `;

    // Insert after navigation tabs
    const tabs = document.querySelector('.nav-tabs');
    if (tabs && tabs.parentNode) {
        tabs.parentNode.insertBefore(bar, tabs.nextSibling);
    }
}

export function triggerDiscovery(dish) {
    const result = discovery.discover(dish.id);
    if (!result) return; // Already discovered

    // Show discovery toast
    showDiscoveryToast(dish, result);
    // Update progress bar
    renderDiscoveryBar();
}

function showDiscoveryToast(dish, result) {
    let toast = document.getElementById('discovery-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'discovery-toast';
        toast.id = 'discovery-toast';
        document.body.appendChild(toast);
    }

    const badge = discovery.getCurrentBadge();

    toast.innerHTML = `
        <div class="sparkle">✨</div>
        <div class="toast-title">DISH DISCOVERED!</div>
        <div class="toast-dish">${dish.name}</div>
        <div class="toast-subtitle">${dish.featured ? "Chef's Special" : dish.category}</div>
        <div class="toast-points">+${CONFIG.discovery.pointsPerDiscovery} points</div>
        ${badge ? `<div style="margin-top:8px;font-size:0.85rem">${badge.icon} ${badge.name}</div>` : ''}
        <button class="btn-secondary" style="margin-top:16px;width:100%" id="discovery-toast-close">
            Continue Exploring
        </button>
    `;

    toast.classList.add('active');

    const closeBtn = document.getElementById('discovery-toast-close');
    closeBtn?.addEventListener('click', () => {
        toast.classList.remove('active');
    });

    // Auto-hide after 5 seconds
    setTimeout(() => toast.classList.remove('active'), 5000);
}
