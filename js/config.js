// ============================================
// Lumière — Configuration
// ============================================

export const CONFIG = {
    restaurant: {
        name: 'Lumière',
        tagline: 'Modern Indian Dining',
        currency: '₹',
        siteUrl: 'https://jiya2000.github.io/arvr/',
    },

    ar: {
        cameraOrbit: '30deg 65deg 120%',
        arModes: 'webxr scene-viewer quick-look',
    },

    device: {
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        isMobile: /Android|iPhone|iPad|iPod/.test(navigator.userAgent),
        supportsAR: () => {
            return navigator.xr?.isSessionSupported?.('immersive-ar') ||
                   CONFIG.device.isIOS || CONFIG.device.isAndroid;
        }
    }
};
