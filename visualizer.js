// Asteroid Dodger Visualizer System
class AsteroidVisualizer {
    // Neural Network Visualizer
    static drawNetwork(ctx, network) {
        const margin = 50;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;

        const levelHeight = height / network.levels.length;

        for (let i = network.levels.length - 1; i >= 0; i--) {
            const levelTop = top +
                lerp(
                    height - levelHeight,
                    0,
                    network.levels.length == 1
                        ? 0.5
                        : i / (network.levels.length - 1)
                );

            ctx.setLineDash([7, 3]);
            AsteroidVisualizer.drawLevel(ctx, network.levels[i],
                left, levelTop,
                width, levelHeight,
                i == network.levels.length - 1
                    ? ['🚀', '◀', '▶', '🔙'] // Space-themed icons
                    : []
            );
        }
    }

    static drawLevel(ctx, level, left, top, width, height, outputLabels) {
        const right = left + width;
        const bottom = top + height;

        const { inputs, outputs, weights, biases } = level;

        // Draw connections with space-like colors
        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < outputs.length; j++) {
                ctx.beginPath();
                ctx.moveTo(
                    AsteroidVisualizer.#getNodeX(inputs, i, left, right),
                    bottom
                );
                ctx.lineTo(
                    AsteroidVisualizer.#getNodeX(outputs, j, left, right),
                    top
                );
                ctx.lineWidth = 2;
                ctx.strokeStyle = AsteroidVisualizer.#getRGBA(weights[i][j]);
                ctx.stroke();
            }
        }

        const nodeRadius = 18;
        
        // Draw input nodes
        for (let i = 0; i < inputs.length; i++) {
            const x = AsteroidVisualizer.#getNodeX(inputs, i, left, right);
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#001122";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = AsteroidVisualizer.#getRGBA(inputs[i]);
            ctx.fill();
        }

        // Draw output nodes
        for (let i = 0; i < outputs.length; i++) {
            const x = AsteroidVisualizer.#getNodeX(outputs, i, left, right);
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#001122";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = AsteroidVisualizer.#getRGBA(outputs[i]);
            ctx.fill();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = AsteroidVisualizer.#getRGBA(biases[i]);
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            if (outputLabels[i]) {
                ctx.beginPath();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#00ffff";
                ctx.strokeStyle = "#001122";
                ctx.font = (nodeRadius * 1.5) + "px Arial";
                ctx.fillText(outputLabels[i], x, top + nodeRadius * 0.1);
                ctx.lineWidth = 0.5;
                ctx.strokeText(outputLabels[i], x, top + nodeRadius * 0.1);
            }
        }
    }

    static #getNodeX(nodes, index, left, right) {
        return lerp(
            left,
            right,
            nodes.length == 1
                ? 0.5
                : index / (nodes.length - 1)
        );
    }

    static #getRGBA(value) {
        const alpha = Math.abs(value);
        const R = value < 0 ? 0 : 255;
        const G = R;
        const B = value > 0 ? 0 : 255;
        return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
    }
}

// Performance Tracker and Graph Drawer
class PerformanceTracker {
    constructor() {
        this.data = this.loadData();
        this.currentSession = {
            startTime: Date.now(),
            bestDistance: 0,
            attempts: 0,
            saves: 0
        };
    }

    loadData() {
        const saved = localStorage.getItem('asteroidDodgerPerformance');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            sessions: [],
            totalSaves: 0,
            bestAllTime: 0,
            avgPerformance: []
        };
    }

    saveData() {
        localStorage.setItem('asteroidDodgerPerformance', JSON.stringify(this.data));
    }

    recordSave(bestSpaceship) {
        const distance = Math.abs(bestSpaceship.y);
        this.data.totalSaves++;
        this.currentSession.saves++;
        
        if (distance > this.data.bestAllTime) {
            this.data.bestAllTime = distance;
        }

        if (distance > this.currentSession.bestDistance) {
            this.currentSession.bestDistance = distance;
        }

        // Record performance point
        this.data.avgPerformance.push({
            save: this.data.totalSaves,
            distance: distance,
            timestamp: Date.now()
        });

        // Keep only last 100 saves for performance
        if (this.data.avgPerformance.length > 100) {
            this.data.avgPerformance.shift();
        }

        this.saveData();
    }

    updateBestDistance(distance) {
        if (distance > this.currentSession.bestDistance) {
            this.currentSession.bestDistance = distance;
        }
    }

    drawPerformanceGraph(ctx) {
        if (this.data.avgPerformance.length === 0) return;

        const margin = 30;
        const graphArea = {
            left: margin,
            right: ctx.canvas.width - margin,
            top: margin,
            bottom: ctx.canvas.height - margin * 2
        };

        // Clear and setup
        ctx.fillStyle = "rgba(0, 20, 40, 0.8)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw grid
        ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = lerp(graphArea.left, graphArea.right, i / 10);
            ctx.beginPath();
            ctx.moveTo(x, graphArea.top);
            ctx.lineTo(x, graphArea.bottom);
            ctx.stroke();
        }
        for (let i = 0; i <= 8; i++) {
            const y = lerp(graphArea.bottom, graphArea.top, i / 8);
            ctx.beginPath();
            ctx.moveTo(graphArea.left, y);
            ctx.lineTo(graphArea.right, y);
            ctx.stroke();
        }

        // Find data range
        const maxDistance = Math.max(...this.data.avgPerformance.map(p => p.distance));
        const minSave = Math.min(...this.data.avgPerformance.map(p => p.save));
        const maxSave = Math.max(...this.data.avgPerformance.map(p => p.save));

        // Draw performance line
        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 3;
        ctx.beginPath();

        this.data.avgPerformance.forEach((point, index) => {
            const x = lerp(graphArea.left, graphArea.right, 
                (point.save - minSave) / Math.max(1, maxSave - minSave));
            const y = lerp(graphArea.bottom, graphArea.top, 
                point.distance / Math.max(1, maxDistance));

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw points
        ctx.fillStyle = "#ffaa00";
        this.data.avgPerformance.forEach(point => {
            const x = lerp(graphArea.left, graphArea.right, 
                (point.save - minSave) / Math.max(1, maxSave - minSave));
            const y = lerp(graphArea.bottom, graphArea.top, 
                point.distance / Math.max(1, maxDistance));
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Labels
        ctx.fillStyle = "#00ffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Save Number", ctx.canvas.width / 2, ctx.canvas.height - 5);
        
        ctx.save();
        ctx.translate(15, ctx.canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Distance Traveled", 0, 0);
        ctx.restore();

        // Title
        ctx.font = "18px Arial";
        ctx.fillText("Learning Progress: Distance vs Save Number", ctx.canvas.width / 2, 20);
    }
}

// Real-time Statistics Dashboard
class StatsDashboard {
    static draw(ctx, gameStats) {
        const { bestSpaceship, spaceships, generation, totalSaves } = gameStats;
        
        // Semi-transparent background
        ctx.fillStyle = "rgba(0, 0, 20, 0.7)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Current stats
        ctx.fillStyle = "#00ffff";
        ctx.font = "16px Arial";
        ctx.textAlign = "left";

        const stats = [
            `Best Distance: ${Math.abs(bestSpaceship.y).toFixed(0)}m`,
            `Speed: ${bestSpaceship.speed.toFixed(1)} units/frame`,
            `Population: ${spaceships.length}`,
            `Alive: ${spaceships.filter(s => !s.damaged).length}`,
            `Damaged: ${spaceships.filter(s => s.damaged).length}`,
            `Total Saves: ${totalSaves || 0}`,
            `Mutation Rate: 20%`
        ];

        stats.forEach((stat, index) => {
            ctx.fillText(stat, 10, 25 + index * 20);
        });

        // Performance indicators
        const aliveCount = spaceships.filter(s => !s.damaged).length;
        const survivalRate = aliveCount / spaceships.length;
        
        // Survival rate bar
        ctx.fillStyle = "#333";
        ctx.fillRect(10, 170, 200, 20);
        
        const barColor = survivalRate > 0.5 ? "#00ff00" : 
                        survivalRate > 0.2 ? "#ffaa00" : "#ff4444";
        ctx.fillStyle = barColor;
        ctx.fillRect(10, 170, 200 * survivalRate, 20);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.fillText(`Survival Rate: ${(survivalRate * 100).toFixed(1)}%`, 10, 205);

        // Neural network activity
        if (bestSpaceship.sensor && bestSpaceship.sensor.readings) {
            ctx.fillStyle = "#ffaa00";
            ctx.fillText("Sensor Activity:", 10, 230);
            
            bestSpaceship.sensor.readings.forEach((reading, index) => {
                const activity = reading ? (1 - reading.offset) : 0;
                const x = 10 + index * 25;
                const height = activity * 30;
                
                ctx.fillStyle = `rgba(255, ${255 * (1 - activity)}, 0, 0.8)`;
                ctx.fillRect(x, 250 - height, 20, height);
            });
        }
    }
}

// Mini-map for spatial awareness
class MiniMap {
    static draw(ctx, gameState) {
        const { bestSpaceship, asteroids, spaceField } = gameState;
        
        const mapWidth = 150;
        const mapHeight = 200;
        const mapX = ctx.canvas.width - mapWidth - 10;
        const mapY = 10;
        
        // Background
        ctx.fillStyle = "rgba(0, 20, 40, 0.8)";
        ctx.fillRect(mapX, mapY, mapWidth, mapHeight);
        
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);
        
        // Scale factor
        const viewRange = 1000; // How much distance to show
        const scaleX = mapWidth / spaceField.width;
        const scaleY = mapHeight / viewRange;
        
        // Draw asteroids
        ctx.fillStyle = "#8B4513";
        asteroids.forEach(asteroid => {
            if (Math.abs(asteroid.y - bestSpaceship.y) < viewRange / 2) {
                const x = mapX + (asteroid.x - spaceField.left) * scaleX;
                const y = mapY + mapHeight / 2 - (asteroid.y - bestSpaceship.y) * scaleY;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw best spaceship
        ctx.fillStyle = "#00ff00";
        const shipX = mapX + (bestSpaceship.x - spaceField.left) * scaleX;
        const shipY = mapY + mapHeight / 2;
        
        ctx.beginPath();
        ctx.arc(shipX, shipY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Direction indicator
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        const dirX = shipX + Math.sin(bestSpaceship.angle) * 10;
        const dirY = shipY - Math.cos(bestSpaceship.angle) * 10;
        ctx.beginPath();
        ctx.moveTo(shipX, shipY);
        ctx.lineTo(dirX, dirY);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = "#00ffff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Mini-Map", mapX + mapWidth / 2, mapY - 5);
    }
}
