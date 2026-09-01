// ============================================
// Lumière — Smart Recommendations Module
// ============================================
// Rule-based recommendation engine.
// NOT labeled as "AI" — this is pattern matching.
// Structured so a real AI API can be plugged in later.

import { CONFIG } from './config.js';

const PREFERENCES = {
    dietary: [
        { id: 'veg', label: '🟢 Vegetarian', filter: item => item.dietary === 'veg' },
        { id: 'non-veg', label: '🔴 Non-Veg', filter: item => item.dietary === 'non-veg' },
        { id: 'any', label: '🍽️ Any', filter: () => true },
    ],
    mood: [
        { id: 'spicy', label: '🌶️ Spicy', filter: item => item.spiceLevel === 'hot' || item.spiceLevel === 'medium' },
        { id: 'mild', label: '☺️ Mild', filter: item => item.spiceLevel === 'mild' },
        { id: 'comfort', label: '🧈 Comfort Food', filter: item => ['butter-chicken', 'paneer-butter-masala', 'dal-makhani', 'gulab-jamun', 'masala-chai', 'naan-basket'].includes(item.id) },
        { id: 'light', label: '🥗 Light', filter: item => item.calories < 300 },
    ],
    budget: [
        { id: 'under200', label: 'Under ₹200', filter: item => item.price < 200 },
        { id: 'under300', label: 'Under ₹300', filter: item => item.price < 300 },
        { id: 'under500', label: 'Under ₹500', filter: item => item.price < 500 },
        { id: 'any', label: 'Any Budget', filter: () => true },
    ],
    protein: [
        { id: 'high', label: '💪 High Protein', filter: item => item.dietary === 'non-veg' || ['paneer-tikka', 'paneer-butter-masala', 'kadai-paneer', 'dal-makhani', 'palak-paneer'].includes(item.id) },
        { id: 'standard', label: '🍽️ Standard', filter: () => true },
    ],
};

export function getRecommendations(menuItems, selectedPrefs) {
    // Score each item based on how many preferences it matches
    const scored = menuItems.map(item => {
        let score = 0;
        const matches = [];

        for (const [category, prefId] of Object.entries(selectedPrefs)) {
            const prefGroup = PREFERENCES[category];
            if (!prefGroup) continue;
            const pref = prefGroup.find(p => p.id === prefId);
            if (!pref) continue;
            if (pref.filter(item)) {
                score++;
                matches.push(pref.label);
            }
        }

        // Boost featured items
        if (item.featured) score += 0.5;

        return { item, score, matches };
    });

    // Filter items that match at least half the criteria
    const minScore = Math.max(1, Object.keys(selectedPrefs).length * 0.5);
    const results = scored
        .filter(s => s.score >= minScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return results;
}

export function renderRecommendationsUI(container, menuItems, onViewDish) {
    const selectedPrefs = {};

    container.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">Smart Recommendations</h2>
            <p class="section-subtitle">Tell us your preferences and we'll suggest the perfect dishes</p>
            <p style="font-size:0.7rem;color:var(--text-muted);margin-top:8px">
                Rule-based matching — not AI-generated
            </p>
        </div>

        <div class="reco-section">
            <div style="max-width:600px;margin:0 auto">
                ${Object.entries(PREFERENCES).map(([category, options]) => `
                    <div class="customize-section">
                        <div class="customize-title">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                        <div class="option-group reco-option-group" data-category="${category}">
                            ${options.map((opt, i) => `
                                <button class="option-btn ${i === 0 ? 'selected' : ''}" data-value="${opt.id}">
                                    ${opt.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}

                <button class="btn-primary" style="width:100%;margin-top:16px" id="reco-find-btn">
                    ✨ Find My Dishes
                </button>
            </div>

            <div id="reco-results" class="reco-results" style="margin-top:32px"></div>
        </div>
    `;

    // Initialize default selections
    container.querySelectorAll('.reco-option-group').forEach(group => {
        const category = group.dataset.category;
        const firstBtn = group.querySelector('.option-btn.selected');
        if (firstBtn) selectedPrefs[category] = firstBtn.dataset.value;

        group.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedPrefs[category] = btn.dataset.value;
            });
        });
    });

    // Find button
    container.querySelector('#reco-find-btn').addEventListener('click', () => {
        const results = getRecommendations(menuItems, selectedPrefs);
        renderResults(container.querySelector('#reco-results'), results, onViewDish);
    });
}

function renderResults(container, results, onViewDish) {
    if (results.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:32px;color:var(--text-muted)">
                <p style="font-size:2rem;margin-bottom:8px">🤔</p>
                <p>No perfect matches found. Try adjusting your preferences!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h3 style="font-family:var(--font-display);font-size:1.3rem;text-align:center;margin-bottom:24px">
            Recommended for You
        </h3>
        ${results.map((r, i) => `
            <div class="reco-card" style="animation-delay:${i * 0.1}s">
                <div class="card-title-row">
                    <h4 class="card-name">${r.item.name}</h4>
                    <span class="card-price">${CONFIG.restaurant.currency}${r.item.price}</span>
                </div>
                <p class="card-desc">${r.item.description}</p>
                <div class="reco-match">
                    ${r.matches.map(m => `<span class="match-tag">✓ ${m}</span>`).join('')}
                </div>
                <div style="margin-top:12px;display:flex;gap:8px">
                    ${r.item.modelUrl ? `<button class="btn-ar reco-view-btn" data-id="${r.item.id}">🔮 View in 3D</button>` : ''}
                    <button class="btn-cart reco-add-btn" data-id="${r.item.id}">🛒 Add to Cart</button>
                </div>
            </div>
        `).join('')}
    `;

    container.querySelectorAll('.reco-view-btn, .reco-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dish = results.find(r => r.item.id === btn.dataset.id)?.item;
            if (dish && onViewDish) onViewDish(dish);
        });
    });
}
