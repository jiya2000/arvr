// ============================================
// Lumière — Dish Discovery (Sophisticated)
// ============================================

let discoveredDishes = new Set();
let allItems = [];

export function initDiscoveryUI(items) {
    allItems = items;
    try {
        const saved = localStorage.getItem('lumiere-discovered');
        if (saved) discoveredDishes = new Set(JSON.parse(saved));
    } catch (e) { /* ignore */ }
}

export function renderDiscoveryBar(container) {
    if (!container || !allItems.length) return;

    const featured = allItems.filter(i => i.featured);
    const discovered = featured.filter(i => discoveredDishes.has(i.id));
    const count = discovered.length;
    const total = featured.length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    if (total === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="discovery-bar">
            <span class="discovery-bar__text">
                <strong>Your discoveries</strong> — ${count} of ${total} featured dishes explored
            </span>
            <div class="discovery-bar__progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${pct}%"></div>
                </div>
                <span class="progress-count">${count}/${total}</span>
            </div>
        </div>
    `;
}

export function triggerDiscovery(dish) {
    if (!dish.featured || discoveredDishes.has(dish.id)) return;

    discoveredDishes.add(dish.id);
    localStorage.setItem('lumiere-discovered', JSON.stringify([...discoveredDishes]));

    // Show subtle toast
    showDiscoveryToast(dish);

    // Update bar if visible
    const container = document.getElementById('discovery-container');
    if (container) renderDiscoveryBar(container);
}

function showDiscoveryToast(dish) {
    // Remove existing
    document.querySelectorAll('.discovery-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'discovery-toast';
    toast.innerHTML = `
        <div class="discovery-toast__title">Dish discovered</div>
        <div class="discovery-toast__dish">${dish.name}</div>
        <button class="discovery-toast__close">Dismiss</button>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('active'));
    });

    toast.querySelector('.discovery-toast__close').addEventListener('click', () => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
