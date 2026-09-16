// ============================================
// Lumière — AR Ingredient Catching Game
// ============================================

AFRAME.registerComponent('ingredient-rain', {
    init: function () {
        this.score = 0;
        this.isPlaying = false;
        this.spawnInterval = null;
        
        // Create Scoreboard
        this.scoreboard = document.createElement('a-text');
        this.scoreboard.setAttribute('value', 'Catch the Ingredients!\nScore: 0');
        this.scoreboard.setAttribute('position', '0 3 -4');
        this.scoreboard.setAttribute('align', 'center');
        this.scoreboard.setAttribute('color', '#ffaa00');
        this.scoreboard.setAttribute('scale', '2 2 2');
        this.scoreboard.setAttribute('visible', 'false');
        this.el.appendChild(this.scoreboard);
        
        // Listen for start event
        this.el.addEventListener('start-ingredient-rain', () => {
            this.startGame();
        });
    },
    
    startGame: function () {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.score = 0;
        this.updateScoreboard();
        this.scoreboard.setAttribute('visible', 'true');
        
        // Spawn an ingredient every 800ms
        let spawns = 0;
        this.spawnInterval = setInterval(() => {
            if (spawns >= 20) {
                this.endGame();
                return;
            }
            this.spawnIngredient();
            spawns++;
        }, 800);
    },
    
    endGame: function () {
        this.isPlaying = false;
        clearInterval(this.spawnInterval);
        
        this.scoreboard.setAttribute('value', `Game Over!\nFinal Score: ${this.score}`);
        
        setTimeout(() => {
            this.scoreboard.setAttribute('visible', 'false');
        }, 5000);
    },
    
    updateScoreboard: function () {
        this.scoreboard.setAttribute('value', `Catch the Ingredients!\nScore: ${this.score}`);
    },
    
    spawnIngredient: function () {
        const entity = document.createElement('a-entity');
        
        // Randomize shape and color to represent different ingredients (chili, lemon, mint)
        const types = [
            { geo: 'primitive: cone; radiusBottom: 0.1; height: 0.4', color: '#ff0000' }, // Chili
            { geo: 'primitive: sphere; radius: 0.15', color: '#ffff00' }, // Lemon
            { geo: 'primitive: box; width: 0.2; height: 0.05; depth: 0.2', color: '#00ff00' } // Mint leaf
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        
        entity.setAttribute('geometry', type.geo);
        entity.setAttribute('material', `color: ${type.color}`);
        
        // Random position high up
        const x = (Math.random() - 0.5) * 8;
        const z = -2 - (Math.random() * 4);
        entity.setAttribute('position', `${x} 8 ${z}`);
        
        // Add physics / animation to fall
        entity.setAttribute('animation__fall', {
            property: 'position',
            to: `${x} -1 ${z}`,
            dur: 3000 + Math.random() * 2000,
            easing: 'linear'
        });
        
        // Add spin animation
        entity.setAttribute('animation__spin', {
            property: 'rotation',
            to: `360 360 360`,
            dur: 2000,
            loop: true,
            easing: 'linear'
        });
        
        entity.setAttribute('class', 'interactable');
        
        // Handle catch
        entity.addEventListener('click', () => {
            this.score += 10;
            this.updateScoreboard();
            
            // Pop animation (scale to 0) instead of particles
            entity.setAttribute('animation__pop', {
                property: 'scale',
                to: '0 0 0',
                dur: 150,
                easing: 'easeInQuad'
            });
            
            // Remove after animation ends
            setTimeout(() => {
                if (entity.parentNode) entity.parentNode.removeChild(entity);
            }, 150);
        });
        
        // Cleanup if missed
        setTimeout(() => {
            if (entity.parentNode) entity.parentNode.removeChild(entity);
        }, 5000);
        
        this.el.appendChild(entity);
    }
});
