// ============================================
// Lumière — AR Experience Module
// ============================================

import { DEVICE } from './config.js';

export function initAR() {
    // AR is primarily handled by model-viewer's built-in AR support.
    // This module provides AR-related UI helpers.
}

export function launchAR(dish) {
    if (!dish.modelUrl) {
        showARFallback(dish);
        return;
    }

    // Create a full-screen AR viewer modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'ar-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:100%;height:100vh;padding:0;border-radius:0;position:relative">
            <button class="modal-close" style="z-index:10;top:20px;right:20px" id="ar-close" aria-label="Close AR">✕</button>

            <model-viewer
                src="${dish.modelUrl}"
                alt="${dish.name}"
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1.5"
                environment-image="neutral"
                camera-orbit="0deg 75deg 105%"
                style="width:100%;height:100%;background:var(--bg-primary)"
                loading="eager"
                id="ar-model-viewer"
            >
                <!-- AR status messages -->
                <div slot="ar-button" style="display:none"></div>
            </model-viewer>

            <!-- AR Controls Overlay -->
            <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,0.9));z-index:5">
                <div style="text-align:center;margin-bottom:12px">
                    <h3 style="font-family:var(--font-display);font-size:1.2rem;margin-bottom:4px">${dish.name}</h3>
                    <p style="font-size:0.85rem;color:var(--text-secondary)">${dish.description}</p>
                </div>

                <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
                    <button class="btn-ar" id="ar-try-btn" style="font-size:0.9rem;padding:12px 24px">
                        📱 View in AR
                    </button>
                    <button class="btn-cart" id="ar-add-cart" style="font-size:0.9rem;padding:12px 24px">
                        🛒 Add to Cart
                    </button>
                </div>

                <p style="text-align:center;font-size:0.7rem;color:var(--text-muted);margin-top:12px">
                    ${getARSupportMessage()}
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close
    document.getElementById('ar-close').addEventListener('click', () => closeARModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeARModal(modal);
    });

    // AR button - trigger model-viewer's AR
    document.getElementById('ar-try-btn').addEventListener('click', () => {
        const viewer = document.getElementById('ar-model-viewer');
        if (viewer && viewer.canActivateAR) {
            viewer.activateAR();
        } else {
            // Show fallback message
            const btn = document.getElementById('ar-try-btn');
            btn.textContent = '📱 AR not available on this device';
            btn.style.opacity = '0.6';
            btn.disabled = true;
        }
    });

    // Add to cart button dispatches custom event
    document.getElementById('ar-add-cart').addEventListener('click', () => {
        closeARModal(modal);
        // Dispatch event for app.js to handle
        window.dispatchEvent(new CustomEvent('ar-add-to-cart', { detail: { dish } }));
    });
}

function closeARModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => modal.remove(), 350);
}

function showARFallback(dish) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.id = 'ar-fallback-modal';
    modal.innerHTML = `
        <div class="modal-content" style="text-align:center;position:relative">
            <button class="modal-close" aria-label="Close">✕</button>
            <div style="font-size:5rem;margin:24px 0">🍽️</div>
            <h3 style="font-family:var(--font-display);font-size:1.5rem;margin-bottom:12px">${dish.name}</h3>
            <p style="color:var(--text-secondary);margin-bottom:24px">${dish.description}</p>
            <div style="background:var(--bg-glass);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;margin-bottom:24px">
                <p style="font-size:0.85rem;color:var(--text-secondary)">
                    📸 3D model not available for this dish yet.<br>
                    AR preview is available for dishes marked with the 🔮 icon.
                </p>
            </div>
            <button class="btn-primary" id="ar-fallback-close">Got it</button>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.querySelector('.modal-close').addEventListener('click', () => closeARModal(modal));
    document.getElementById('ar-fallback-close').addEventListener('click', () => closeARModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeARModal(modal);
    });
}

function getARSupportMessage() {
    if (DEVICE.isMobile()) {
        if (DEVICE.isIOS()) {
            return 'iOS: AR uses Quick Look. Tap "View in AR" to place the dish on your table.';
        }
        return 'Android: AR uses WebXR/Scene Viewer. Point your camera at a flat surface.';
    }
    return 'Desktop: Use the 3D viewer to inspect the dish. Scan the QR code for mobile AR.';
}
