// ============================================
// Lumière — Custom A-Frame Components for Spatial UI
// ============================================

// (hide-on-enter-ar is built into A-Frame, so we don't need to register it here)

// Component to show elements only in VR/AR (like a gaze reticle)
AFRAME.registerComponent('show-in-vr', {
    init: function () {
        const el = this.el;
        // Initially hide
        el.setAttribute('visible', false);

        this.el.sceneEl.addEventListener('enter-vr', function () {
            // Show only if we need a reticle (often useful in VR, less in AR on mobile, but keep it for consistency)
            el.setAttribute('visible', true);
            // If in AR mode and we have DOM overlay, maybe we don't need it, but let's keep it simple
        });
        this.el.sceneEl.addEventListener('exit-vr', function () {
            el.setAttribute('visible', false);
        });
    }
});

// Carousel Component
AFRAME.registerComponent('dish-carousel', {
    schema: {
        radius: {type: 'number', default: 2.2}
    },
    init: function () {
        this.dishes = [];
        this.el.sceneEl.addEventListener('rotate-carousel', (e) => {
            this.rotate(e.detail.direction);
        });
    },
    addDish: function (dishEntity) {
        this.dishes.push(dishEntity);
        this.el.appendChild(dishEntity);
        this.layout();
    },
    layout: function () {
        const count = this.dishes.length;
        if (count === 0) return;
        const angleStep = (Math.PI * 2) / count;
        
        this.dishes.forEach((dish, i) => {
            const angle = i * angleStep;
            const x = Math.cos(angle) * this.data.radius;
            const z = Math.sin(angle) * this.data.radius;
            
            dish.setAttribute('position', {x: x, y: 0, z: z});
            // Rotate to face center (which is 0,0,0 local to the carousel)
            // atan2(x, z) gives rotation around Y axis
            dish.setAttribute('rotation', {x: 0, y: (Math.atan2(x, z) * 180 / Math.PI), z: 0});
        });
    },
    rotate: function (direction) {
        if (this.dishes.length === 0) return;
        const angleStep = 360 / this.dishes.length;
        const currentRot = this.el.getAttribute('rotation');
        
        // Add rotation (direction is 1 or -1)
        const targetY = currentRot.y + (direction * angleStep);
        
        this.el.setAttribute('animation', {
            property: 'rotation',
            to: `0 ${targetY} 0`,
            dur: 600,
            easing: 'easeOutElastic'
        });
    }
});

// Interactable Dish Component
AFRAME.registerComponent('dish-interactable', {
    schema: {
        dishId: {type: 'string'}
    },
    init: function () {
        const el = this.el;
        el.classList.add('interactable');
        
        // Interaction logic
        el.addEventListener('click', () => {
            // Dispatch event to global window to update DOM HUD
            window.dispatchEvent(new CustomEvent('dish-selected', { detail: { id: this.data.dishId } }));
            
            // Pop animation
            const currentScale = el.getAttribute('scale') || {x:1, y:1, z:1};
            el.setAttribute('animation__pop', {
                property: 'scale',
                from: `${currentScale.x*1.1} ${currentScale.y*1.1} ${currentScale.z*1.1}`,
                to: `${currentScale.x} ${currentScale.y} ${currentScale.z}`,
                dur: 400,
                easing: 'easeOutElastic'
            });
            
            // Add a little rotation spin
            const currentRot = el.getAttribute('rotation') || {x:0, y:0, z:0};
            el.setAttribute('animation__spin', {
                property: 'rotation',
                to: `${currentRot.x} ${currentRot.y + 360} ${currentRot.z}`,
                dur: 1500,
                easing: 'easeOutElastic'
            });
        });

        // Hover effects (desktop)
        el.addEventListener('mouseenter', () => {
            const scale = el.getAttribute('scale') || {x:1, y:1, z:1};
            el.setAttribute('scale', `${scale.x*1.1} ${scale.y*1.1} ${scale.z*1.1}`);
        });
        
        el.addEventListener('mouseleave', () => {
            // Need original scale, assume 1 for now unless we store it
            el.setAttribute('scale', '1 1 1');
        });
    }
});

// Spice Portal Component (Triggers Mini-Game)
AFRAME.registerComponent('spice-portal', {
    init: function () {
        const el = this.el;
        
        el.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('portal-clicked'));
            
            el.setAttribute('animation__scale', {
                property: 'scale',
                to: '1.5 1.5 1.5',
                dur: 1000,
                easing: 'easeOutQuad'
            });
            
            // Trigger the AR game
            const gameRig = document.getElementById('ar-game-rig');
            if(gameRig) {
                gameRig.emit('start-ingredient-rain');
            }
        });
    }
});

// Dynamic Environment Morphing Component
AFRAME.registerComponent('dynamic-environment', {
    init: function () {
        const presets = ['default', 'contact', 'egypt', 'checkerboard', 'forest', 'goaland', 'yavapai', 'goldmine', 'threetowers', 'poison', 'arches', 'tron', 'japan', 'dream', 'volcano', 'starry', 'osiris'];
        
        window.addEventListener('dish-selected', (e) => {
            // Pick a random environment or one based on ID
            const hash = e.detail.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            const preset = presets[hash % presets.length];
            
            this.el.setAttribute('environment', `preset: ${preset}; active: true; skyType: atmosphere; lighting: point`);
        });
    }
});
