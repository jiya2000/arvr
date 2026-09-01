// ============================================
// Lumière — Chef's Recommendations
// ============================================

import { CONFIG } from './config.js';

export function renderRecommendationsUI(container, items, onAddToCart) {
    container.innerHTML = `
        <div class="container" style="padding-top:48px;padding-bottom:64px">
            <div class="section__header">
                <p class="section__eyebrow">Let us recommend</p>
                <h2 class="section__title">What are you looking for tonight?</h2>
                <p class="section__desc" style="margin-top:12px">
                    Tell us your preferences and we'll suggest something from our kitchen.
                </p>
            </div>

            <div id="reco-form" style="margin-bottom:48px">
                <div class="customize" style="margin-bottom:20px">
                    <p class="customize__label">Dietary preference</p>
                    <div class="customize__options" id="reco-dietary">
                        <button class="option-btn selected" data-val="any">No preference</button>
                        <button class="option-btn" data-val="veg">Vegetarian</button>
                        <button class="option-btn" data-val="non-veg">Non-vegetarian</button>
                    </div>
                </div>

                <div class="customize" style="margin-bottom:20px">
                    <p class="customize__label">What sounds good?</p>
                    <div class="customize__options" id="reco-mood">
                        <button class="option-btn selected" data-val="any">Surprise me</button>
                        <button class="option-btn" data-val="light">Light</button>
                        <button class="option-btn" data-val="rich">Rich & comforting</button>
                        <button class="option-btn" data-val="spicy">Something spicy</button>
                    </div>
                </div>

                <div class="customize" style="margin-bottom:20px">
                    <p class="customize__label">Budget</p>
                    <div class="customize__options" id="reco-budget">
                        <button class="option-btn selected" data-val="any">Any</button>
                        <button class="option-btn" data-val="under300">Under ₹300</button>
                        <button class="option-btn" data-val="300-500">₹300 – ₹500</button>
                        <button class="option-btn" data-val="above500">₹500+</button>
                    </div>
                </div>

                <button class="btn btn--primary" id="reco-submit" style="margin-top:16px">Show recommendations</button>
            </div>

            <div id="reco-results"></div>

            <p style="font-size:0.72rem;color:var(--text-muted);margin-top:32px;border-top:1px solid var(--border);padding-top:16px">
                Recommendations are based on simple preference matching — not AI-generated.
            </p>
        </div>
    `;

    // Wire up option groups
    ['reco-dietary', 'reco-mood', 'reco-budget'].forEach(groupId => {
        container.querySelectorAll(`#${groupId} .option-btn`).forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll(`#${groupId} .option-btn`).forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    });

    // Submit
    container.querySelector('#reco-submit').addEventListener('click', () => {
        const dietary = container.querySelector('#reco-dietary .option-btn.selected')?.dataset.val || 'any';
        const mood = container.querySelector('#reco-mood .option-btn.selected')?.dataset.val || 'any';
        const budget = container.querySelector('#reco-budget .option-btn.selected')?.dataset.val || 'any';

        const results = scoreItems(items, { dietary, mood, budget });
        renderResults(container.querySelector('#reco-results'), results, onAddToCart);
    });
}

function scoreItems(items, prefs) {
    return items.map(item => {
        let score = 0;
        const matches = [];

        // Dietary
        if (prefs.dietary !== 'any') {
            if (item.dietary === prefs.dietary) {
                score += 3;
                matches.push(prefs.dietary === 'veg' ? 'Vegetarian' : 'Non-vegetarian');
            } else {
                score -= 5;
            }
        }

        // Mood
        if (prefs.mood !== 'any') {
            if (prefs.mood === 'light' && item.calories < 350) { score += 2; matches.push('Light'); }
            if (prefs.mood === 'rich' && item.calories >= 400) { score += 2; matches.push('Rich'); }
            if (prefs.mood === 'spicy' && item.spiceLevel === 'hot') { score += 2; matches.push('Spicy'); }
        }

        // Budget
        if (prefs.budget !== 'any') {
            if (prefs.budget === 'under300' && item.price < 300) { score += 2; matches.push('Under ₹300'); }
            if (prefs.budget === '300-500' && item.price >= 300 && item.price <= 500) { score += 2; matches.push('₹300–500'); }
            if (prefs.budget === 'above500' && item.price > 500) { score += 2; matches.push('₹500+'); }
        }

        // Featured bonus
        if (item.featured) score += 1;

        return { ...item, score, matches };
    })
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

function renderResults(container, results, onAddToCart) {
    if (results.length === 0) {
        container.innerHTML = `
            <p style="color:var(--text-muted);font-size:0.92rem">
                No dishes matched your preferences. Try adjusting the filters.
            </p>
        `;
        return;
    }

    container.innerHTML = `
        <p class="section__eyebrow" style="margin-bottom:16px">Chef's recommendation</p>
        ${results.map(item => `
            <div class="reco-card">
                <div class="reco-card__title-row">
                    <span class="reco-card__name">${item.name}</span>
                    <span class="menu-item__price">${CONFIG.restaurant.currency}${item.price}</span>
                </div>
                <p class="reco-card__desc">${item.description}</p>
                ${item.matches.length ? `
                    <div class="reco-card__matches">
                        ${item.matches.map(m => `<span class="reco-card__match">✓ ${m}</span>`).join('')}
                    </div>
                ` : ''}
                <div style="display:flex;gap:12px">
                    ${item.modelUrl ? `<button class="btn btn--secondary btn--small reco-ar-btn" data-id="${item.id}">View in AR →</button>` : ''}
                    <button class="btn btn--primary btn--small reco-add-btn" data-id="${item.id}">Add to order</button>
                </div>
            </div>
        `).join('')}
    `;

    // Wire add buttons
    container.querySelectorAll('.reco-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dish = results.find(i => i.id === btn.dataset.id);
            if (dish) onAddToCart(dish);
        });
    });

    // Wire AR buttons
    container.querySelectorAll('.reco-ar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dish = results.find(i => i.id === btn.dataset.id);
            if (dish) {
                import('./ar.js').then(m => m.launchAR(dish));
            }
        });
    });
}
