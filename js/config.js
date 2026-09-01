// ============================================
// Lumière — Global Configuration
// ============================================

export const CONFIG = {
    // Restaurant Info
    restaurant: {
        name: 'Lumière',
        tagline: 'An Augmented Culinary Experience',
        cuisine: 'Modern Indian',
        currency: '₹',
        currencyCode: 'INR',
    },

    // QR Code — Change this single value to update the QR destination
    qrUrl: 'https://jiya2000.github.io/arvr/',

    // AR Settings
    ar: {
        defaultScale: '1 1 1',
        shadowIntensity: 1.5,
        environmentImage: 'neutral',
        cameraOrbit: '0deg 75deg 105%',
        minCameraOrbit: 'auto auto 5%',
        maxCameraOrbit: 'auto auto 200%',
    },

    // Discovery Game
    discovery: {
        totalHotspots: 8,
        pointsPerDiscovery: 50,
        badges: [
            { threshold: 2, name: 'Curious Diner', icon: '🍽️' },
            { threshold: 4, name: 'Food Explorer', icon: '🧭' },
            { threshold: 6, name: 'Culinary Adventurer', icon: '🌟' },
            { threshold: 8, name: 'AR Food Master', icon: '🏆' },
        ],
    },

    // Feature Flags
    features: {
        arEnabled: true,
        discoveryGame: true,
        aiRecommendations: true,
        tableReservation: true,
        chefExperience: true,
        demoMode: true,
    },

    // Table Options
    tables: [
        {
            id: 'window',
            name: 'Window Table',
            seats: '2-4',
            atmosphere: 'City View, Natural Light',
            icon: '🪟',
            available: true,
        },
        {
            id: 'family',
            name: 'Family Table',
            seats: '6-8',
            atmosphere: 'Central, Spacious',
            icon: '👨‍👩‍👧‍👦',
            available: true,
        },
        {
            id: 'private',
            name: 'Private Dining',
            seats: '2-4',
            atmosphere: 'Secluded, Intimate',
            icon: '🕯️',
            available: false,
        },
        {
            id: 'outdoor',
            name: 'Garden Terrace',
            seats: '4',
            atmosphere: 'Open Air, Greenery',
            icon: '🌿',
            available: true,
        },
    ],
};

// Device detection utilities
export const DEVICE = {
    isMobile: () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    isIOS: () => /iPhone|iPad|iPod/i.test(navigator.userAgent),
    isAndroid: () => /Android/i.test(navigator.userAgent),
    supportsWebXR: async () => {
        if (!navigator.xr) return false;
        try {
            return await navigator.xr.isSessionSupported('immersive-ar');
        } catch {
            return false;
        }
    },
    supportsQuickLook: () => {
        const a = document.createElement('a');
        return a.relList && a.relList.supports && a.relList.supports('ar');
    },
};
