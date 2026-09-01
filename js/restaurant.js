// ============================================
// Lumière — Restaurant Tour & Reservation
// ============================================

const HOTSPOTS = [
    { id: 'dining', icon: '🪑', name: 'Dining Room', desc: 'Warm wood, brass, and linen. 40 covers.' },
    { id: 'chef', icon: '👨‍🍳', name: "Chef's Counter", desc: 'Watch the kitchen at work. 6 seats.' },
    { id: 'private', icon: '🚪', name: 'Private Dining', desc: 'Intimate space for up to 12 guests.' },
    { id: 'bar', icon: '🍷', name: 'Bar', desc: 'Cocktails, wine, and small plates.' },
    { id: 'garden', icon: '🌿', name: 'Garden Terrace', desc: 'Open-air seating under the trees.' }
];

const TABLES = [
    { id: 'window', name: 'Window', seats: 2, vibe: 'Natural light, quiet', available: true },
    { id: 'centre', name: 'Centre', seats: 4, vibe: 'Heart of the room', available: true },
    { id: 'counter', name: "Chef's counter", seats: 2, vibe: 'Kitchen view', available: true },
    { id: 'private', name: 'Private room', seats: 8, vibe: 'Celebrations, groups', available: false }
];

export function renderRestaurantTour(container, onBackToMenu) {
    container.innerHTML = `
        <div class="container" style="padding-top:48px;padding-bottom:64px">
            <div class="section__header">
                <p class="section__eyebrow">Explore Lumière</p>
                <h2 class="section__title">The restaurant</h2>
                <p class="section__desc" style="margin-top:12px">
                    Take a look around our space before you visit.
                </p>
            </div>

            <!-- 360 Tour Viewer -->
            <div class="tour-viewer" style="width: 100%; height: 500px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); margin-bottom: 32px; position: relative;">
                <a-scene embedded style="width: 100%; height: 100%;" cursor="rayOrigin: mouse" raycaster="objects: .clickable">
                    <!-- Environment -->
                    <a-sky src="assets/restaurant_panorama.jpg" rotation="0 -90 0"></a-sky>
                    <a-camera look-controls="reverseMouseDrag: true"></a-camera>

                    <!-- Spatial Lure Tag -->
                    <a-entity 
                        geometry="primitive: plane; width: 1.5; height: 0.5" 
                        material="color: var(--primary); opacity: 0.8" 
                        position="-2.5 0.8 -2.5" 
                        look-at="[camera]" 
                        class="clickable"
                        id="tag-samosa">
                        <a-text value="Tap for Chef's Special" align="center" color="#fff" width="4"></a-text>
                    </a-entity>
                </a-scene>
                <div class="tour-viewer__hint" style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; pointer-events: none; z-index: 5;">Drag to explore</div>
                
                <!-- Overlay Lure Popup -->
                <div id="lure-popup" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; background: var(--bg-card); padding: 24px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); width: 280px; text-align: center; border: 1px solid var(--border);">
                    <h3 id="lure-title" style="color: var(--primary); font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 8px;">House Special Samosa</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">Crispy, golden pastry stuffed with spiced potatoes. Want to see it on your table?</p>
                    <button class="btn btn--primary" id="lure-ar-btn" style="width: 100%; margin-bottom: 12px;">View Dish in AR</button>
                    <button class="btn btn--secondary" id="lure-close-btn" style="width: 100%;">Close</button>
                </div>

                <!-- Overlay Model Viewer Modal -->
                <div id="lure-model-modal" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 20; background: rgba(250, 248, 245, 0.95); backdrop-filter: blur(10px);">
                    <button id="close-model-btn" style="position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.5); border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 1.5rem; cursor: pointer; color: white; z-index: 100; display: flex; align-items: center; justify-content: center;">✕</button>
                    <model-viewer
                        id="lure-model-viewer"
                        src=""
                        alt="3D dish"
                        auto-rotate
                        camera-controls
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        ar-scale="fixed"
                        ar-placement="floor"
                        shadow-intensity="1"
                        style="width: 100%; height: 100%;"
                    >
                        <button slot="ar-button" class="btn btn--primary" style="position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);">
                            View on your table
                        </button>
                    </model-viewer>
                </div>
            </div>

            <!-- Hotspots -->
            <div class="section__header" style="margin-bottom:24px">
                <p class="section__eyebrow">Areas</p>
            </div>
            <div class="hotspot-grid" style="margin-bottom:64px">
                ${HOTSPOTS.map(h => `
                    <div class="hotspot-card">
                        <div class="hotspot-card__icon">${h.icon}</div>
                        <div class="hotspot-card__name">${h.name}</div>
                        <div class="hotspot-card__desc">${h.desc}</div>
                    </div>
                `).join('')}
            </div>

            <!-- Table Selection -->
            <div class="section__header" style="margin-bottom:24px">
                <p class="section__eyebrow">Reservations</p>
                <h3 class="section__title">Choose your table</h3>
            </div>

            <div class="table-grid" id="table-grid">
                ${TABLES.map(t => `
                    <div class="table-card ${t.available ? '' : 'unavailable'}" data-table="${t.id}">
                        <div class="table-card__name">${t.name}</div>
                        <div class="table-card__info">${t.seats} seats · ${t.vibe}</div>
                        <div class="table-card__status ${t.available ? '' : 'table-card__status--reserved'}">
                            ${t.available ? 'Available' : 'Reserved'}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div id="reservation-area"></div>

            <div style="margin-top:48px;text-align:center">
                <button class="btn btn--secondary" id="tour-back-btn">← Back to menu</button>
            </div>

            <p style="font-size:0.7rem;color:var(--text-muted);margin-top:32px;text-align:center">
                3D scene is a representative model. The actual restaurant interior may differ.
                Reservation is a prototype demonstration.
            </p>
        </div>
    `;

    // Table selection
    container.querySelectorAll('.table-card:not(.unavailable)').forEach(card => {
        card.addEventListener('click', () => {
            container.querySelectorAll('.table-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const table = TABLES.find(t => t.id === card.dataset.table);
            if (table) showReservation(container, table);
        });
    });

    // Back button
    container.querySelector('#tour-back-btn')?.addEventListener('click', onBackToMenu);

    // Spatial Tag & Overlay Interactions
    const tagSamosa = container.querySelector('#tag-samosa');
    const lurePopup = container.querySelector('#lure-popup');
    const lureCloseBtn = container.querySelector('#lure-close-btn');
    const lureArBtn = container.querySelector('#lure-ar-btn');
    
    const lureModelModal = container.querySelector('#lure-model-modal');
    const lureModelViewer = container.querySelector('#lure-model-viewer');
    const closeModelBtn = container.querySelector('#close-model-btn');

    if (tagSamosa) {
        tagSamosa.addEventListener('click', () => {
            lurePopup.style.display = 'block';
        });
    }

    if (lureCloseBtn) {
        lureCloseBtn.addEventListener('click', () => {
            lurePopup.style.display = 'none';
        });
    }

    if (lureArBtn) {
        lureArBtn.addEventListener('click', () => {
            lurePopup.style.display = 'none';
            lureModelModal.style.display = 'block';
            // Feed the authentic Indian model we mapped earlier
            lureModelViewer.src = 'https://raw.githubusercontent.com/Kishore-s-19/MenuAR/main/menuar-backend/src/main/resources/static/models/appetizers/samosa/day_226_samosa.glb';
            // Note: iOS Quick Look requires .usdz, but we'll stick to .glb for the prototype here.
        });
    }

    if (closeModelBtn) {
        closeModelBtn.addEventListener('click', () => {
            lureModelModal.style.display = 'none';
        });
    }
}

function showReservation(container, table) {
    const area = container.querySelector('#reservation-area');
    area.innerHTML = `
        <div class="reservation-confirm">
            <p class="reservation-confirm__title">${table.name} — ${table.seats} seats</p>
            <p class="reservation-confirm__text">${table.vibe}</p>
            <button class="btn btn--primary btn--small" id="confirm-reservation-btn">Reserve this table</button>
            <p class="reservation-confirm__note" style="margin-top:12px">
                This is a prototype demonstration. No actual reservation will be made.
            </p>
        </div>
    `;

    document.getElementById('confirm-reservation-btn')?.addEventListener('click', () => {
        area.innerHTML = `
            <div class="reservation-confirm">
                <p class="reservation-confirm__title">Table reserved</p>
                <p class="reservation-confirm__text">
                    ${table.name} for ${table.seats} guests. We look forward to seeing you.
                </p>
                <p class="reservation-confirm__note">
                    This is a prototype — no real reservation was made.
                </p>
            </div>
        `;
    });
}
