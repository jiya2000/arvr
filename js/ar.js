// ============================================
// Lumière — AR Experience (Camera-first)
// ============================================

import { CONFIG } from './config.js';

export function launchAR(dish) {
    if (!dish.modelUrl) {
        // No model — show info modal instead
        window.dispatchEvent(new CustomEvent('ar-add-to-cart', { detail: { dish } }));
        return;
    }

    // Create full-screen AR viewer
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 2000;
        background: #F5F1E8; display: flex; flex-direction: column;
    `;

    overlay.innerHTML = `
        <div style="flex:1;position:relative;background:var(--bg-alt,#EDE8DC)">
            <model-viewer
                src="${dish.modelUrl}"
                ${dish.iosSrc ? `ios-src="${dish.iosSrc}"` : ''}
                alt="${dish.name}"
                auto-rotate
                camera-controls
                ar
                ar-modes="webxr scene-viewer quick-look"
                ar-placement="floor"
                ar-scale="auto"
                shadow-intensity="0.8"
                environment-image="neutral"
                camera-orbit="${CONFIG.ar.cameraOrbit}"
                style="width:100%;height:100%;background:transparent;--poster-color:transparent"
            ></model-viewer>

            <!-- Close -->
            <button id="ar-close" style="
                position:absolute;top:16px;right:16px;z-index:10;
                width:36px;height:36px;border-radius:50%;
                background:rgba(32,32,29,0.8);color:#F5F1E8;
                border:none;font-size:1rem;cursor:pointer;
                display:flex;align-items:center;justify-content:center;
            ">✕</button>
        </div>

        <!-- Bottom info bar -->
        <div style="
            padding:20px 24px;background:#29231F;color:#F5F1E8;
            display:flex;justify-content:space-between;align-items:center;
        ">
            <div>
                <div style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.15rem">${dish.name}</div>
                <div style="font-size:0.85rem;color:#B5AFA5">${CONFIG.restaurant.currency}${dish.price}</div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
                <!-- Scale toggle -->
                <label style="display:flex;align-items:center;gap:6px;font-size:0.75rem;cursor:pointer;margin-right:8px;">
                    <input type="checkbox" id="ar-scale-toggle" style="cursor:pointer"> True Size
                </label>
                <!-- Scale reference hint -->
                <span style="font-size:1.2rem;opacity:0.8;margin-right:4px;" title="Scale reference (coin)">🪙</span>
                
                <button id="ar-place-btn" class="btn btn--accent btn--small" style="
                    background:#A45A3A;color:white;border:none;
                    padding:10px 20px;border-radius:4px;font-size:0.82rem;cursor:pointer;
                ">Place on table →</button>
                <button id="ar-add-btn" style="
                    background:transparent;color:#F5F1E8;
                    border:1px solid rgba(245,241,232,0.2);
                    padding:10px 20px;border-radius:4px;font-size:0.82rem;cursor:pointer;
                ">Add to order</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Close
    overlay.querySelector('#ar-close').addEventListener('click', () => {
        document.body.style.overflow = '';
        overlay.remove();
    });

    // Scale toggle
    const scaleToggle = overlay.querySelector('#ar-scale-toggle');
    const modelViewer = overlay.querySelector('model-viewer');
    scaleToggle.addEventListener('change', (e) => {
        modelViewer.setAttribute('ar-scale', e.target.checked ? 'fixed' : 'auto');
    });

    // Place on table — activate AR
    overlay.querySelector('#ar-place-btn').addEventListener('click', () => {
        console.log(`[Analytics] Track Event: AR View Started | Dish: ${dish.name} | Scale: ${scaleToggle.checked ? 'fixed' : 'auto'}`);
        if (modelViewer) {
            modelViewer.activateAR();
        }
    });

    // Add to order
    overlay.querySelector('#ar-add-btn').addEventListener('click', () => {
        console.log(`[Analytics] Track Event: Add to Order (from AR view) | Dish: ${dish.name}`);
        document.body.style.overflow = '';
        overlay.remove();
        window.dispatchEvent(new CustomEvent('ar-add-to-cart', { detail: { dish } }));
    });
}
