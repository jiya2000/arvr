// ============================================
// Lumière — Restaurant & Virtual Tour Module
// ============================================

import { CONFIG } from './config.js';

const HOTSPOTS = [
    { id: 'dining', icon: '🍽️', label: 'Dining Area', position: { top: '45%', left: '35%' }, description: 'Our main dining hall with ambient lighting and elegant table settings.' },
    { id: 'chef', icon: '👨‍🍳', label: "Chef's Counter", position: { top: '30%', left: '60%' }, description: 'Watch our chefs prepare your meal at the live cooking station.' },
    { id: 'dessert', icon: '🍨', label: 'Dessert Counter', position: { top: '55%', left: '70%' }, description: 'A tempting display of traditional Indian sweets and modern desserts.' },
    { id: 'bar', icon: '🍹', label: 'Beverage Bar', position: { top: '40%', left: '80%' }, description: 'Craft mocktails, lassis, and our signature chai station.' },
    { id: 'private', icon: '🕯️', label: 'Private Dining', position: { top: '65%', left: '25%' }, description: 'Intimate private rooms for special occasions and celebrations.' },
];

export function renderRestaurantTour(container, onNavigateToMenu) {
    container.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">Explore Lumière</h2>
            <p class="section-subtitle">Take a virtual walk through our restaurant</p>
        </div>

        <div class="container">
            <!-- 3D Restaurant Viewer -->
            <div class="restaurant-viewer" id="restaurant-viewer">
                <model-viewer
                    src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb"
                    skybox-image="https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k_HDR.hdr"
                    alt="3D view of the Lumière restaurant"
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    environment-image="neutral"
                    camera-orbit="30deg 70deg 3m"
                    min-camera-orbit="auto auto 1m"
                    max-camera-orbit="auto auto 8m"
                    style="width:100%;height:100%"
                    loading="lazy"
                ></model-viewer>

                <!-- Hotspot Overlay -->
                <div class="hotspot-overlay">
                    ${HOTSPOTS.map(h => `
                        <div class="hotspot" style="top:${h.position.top};left:${h.position.left}" data-id="${h.id}">
                            <div class="hotspot-marker">${h.icon}</div>
                            <div class="hotspot-label">${h.label}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="position:absolute;bottom:16px;left:16px;background:rgba(10,10,10,0.85);padding:10px 16px;border-radius:var(--radius-md);border:1px solid var(--border);backdrop-filter:blur(8px);font-size:0.75rem;color:var(--text-secondary)">
                    🎯 Click hotspots to explore different areas<br>
                    <span style="font-size:0.65rem;color:var(--text-muted)">
                        Note: Showing a furniture model as a representative scene element. Full restaurant scene requires a custom 3D scan.
                    </span>
                </div>
            </div>

            <!-- Hotspot Details -->
            <div id="hotspot-detail" style="display:none" class="chef-note" style="margin-bottom:24px">
                <div class="chef-note-header" id="hotspot-detail-title"></div>
                <p class="chef-note-text" id="hotspot-detail-desc"></p>
                <button class="btn-secondary" style="margin-top:12px" id="hotspot-detail-close">Close</button>
            </div>

            <!-- Table Selection -->
            <div style="margin-top:var(--space-xl)">
                <div class="section-header">
                    <h3 class="section-title" style="font-size:1.5rem">Choose Your Table</h3>
                    <p class="section-subtitle">Select your preferred seating</p>
                </div>

                <div class="table-grid" id="table-grid">
                    ${CONFIG.tables.map(table => `
                        <div class="table-card ${table.available ? '' : 'unavailable'}" data-table="${table.id}">
                            <div class="table-icon">${table.icon}</div>
                            <div class="table-name">${table.name}</div>
                            <div class="table-seats">${table.seats} seats</div>
                            <div class="table-atmosphere">${table.atmosphere}</div>
                            <div class="table-status ${table.available ? 'available' : 'reserved'}">
                                ${table.available ? '● Available' : '● Reserved'}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Reservation Form -->
                <div id="reservation-form" style="display:none;max-width:500px;margin:0 auto">
                    <div class="chef-note" style="border-color:var(--gold)">
                        <div class="chef-note-header">📍 Table Reserved (Demo)</div>
                        <p class="chef-note-text" id="reservation-details"></p>
                        <p style="font-size:0.7rem;color:var(--text-muted);margin-top:8px;font-style:normal">
                            This is a prototype demonstration. No actual reservation has been made.
                        </p>
                        <button class="btn-secondary" style="margin-top:12px" id="reservation-browse">
                            Browse Menu →
                        </button>
                    </div>
                </div>
            </div>

            <!-- Navigation Guide -->
            <div style="margin-top:var(--space-xl)">
                <div class="section-header">
                    <h3 class="section-title" style="font-size:1.5rem">Restaurant Navigation</h3>
                    <p class="section-subtitle">Find your way around (Demo Preview)</p>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-md)">
                    ${HOTSPOTS.map(h => `
                        <div class="table-card" style="cursor:pointer" data-nav="${h.id}">
                            <div class="table-icon">${h.icon}</div>
                            <div class="table-name">${h.label}</div>
                            <div class="table-atmosphere" style="font-size:0.75rem">${h.description}</div>
                        </div>
                    `).join('')}
                </div>

                <p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:16px">
                    📍 In-restaurant AR navigation requires real-world spatial mapping and is available as a future feature.
                </p>
            </div>
        </div>
    `;

    // Hotspot click handlers
    container.querySelectorAll('.hotspot').forEach(hotspot => {
        hotspot.addEventListener('click', () => {
            const id = hotspot.dataset.id;
            const h = HOTSPOTS.find(h => h.id === id);
            if (!h) return;

            const detail = document.getElementById('hotspot-detail');
            document.getElementById('hotspot-detail-title').innerHTML = `${h.icon} ${h.label}`;
            document.getElementById('hotspot-detail-desc').textContent = h.description;
            detail.style.display = 'block';
            detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    document.getElementById('hotspot-detail-close')?.addEventListener('click', () => {
        document.getElementById('hotspot-detail').style.display = 'none';
    });

    // Table selection
    container.querySelectorAll('.table-card[data-table]').forEach(card => {
        card.addEventListener('click', () => {
            const tableId = card.dataset.table;
            const table = CONFIG.tables.find(t => t.id === tableId);
            if (!table || !table.available) return;

            // Select visual
            container.querySelectorAll('.table-card[data-table]').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            // Show reservation
            const form = document.getElementById('reservation-form');
            document.getElementById('reservation-details').innerHTML =
                `"You've selected the <strong>${table.name}</strong> (${table.seats} seats, ${table.atmosphere}). Your table is being prepared!"`;
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    document.getElementById('reservation-browse')?.addEventListener('click', () => {
        if (onNavigateToMenu) onNavigateToMenu();
    });
}
