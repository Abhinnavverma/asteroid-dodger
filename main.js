const gameCanvas = document.getElementById("gameCanvas");
const networkCanvas = document.getElementById("networkCanvas");
const performanceCanvas = document.getElementById("performanceCanvas");
const statsCanvas = document.getElementById("statsCanvas");

gameCanvas.width = window.innerWidth * 0.6;
gameCanvas.height = window.innerHeight;
networkCanvas.width = 300;
networkCanvas.height = 300;
performanceCanvas.width = 300;
performanceCanvas.height = 350;
statsCanvas.width = 300;
statsCanvas.height = 200;

const ctx = gameCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const performanceCtx = performanceCanvas.getContext("2d");
const statsCtx = statsCanvas.getContext("2d");

const spaceField = new SpaceField(gameCanvas.width / 2, gameCanvas.width * 0.99);

// Training data tracking
let generation = 1;
let trainingData = JSON.parse(localStorage.getItem("trainingData") || "[]");
let bestDistanceEver = Math.max(...trainingData.map(d => d.distance), 0);

const N = 100;
const spaceships = generateSpaceships(N);
let bestSpaceship = spaceships[0];
if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < spaceships.length; i++) {
        spaceships[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(spaceships[i].brain, 0.2);
        }
    }
}

const asteroids = [
    new Asteroid(spaceField.getLaneCenter(1), 600, 30, 50),
    new Asteroid(spaceField.getLaneCenter(5), 600, 50, 50),
    new Asteroid(spaceField.getLaneCenter(3), 400, 50, 50),
    new Asteroid(spaceField.getLaneCenter(0), 200, 50, 50),
    new Asteroid(spaceField.getLaneCenter(2), 200, 50, 50),
    new Asteroid(spaceField.getLaneCenter(4), 0, 50, 50),
    new Asteroid(spaceField.getLaneCenter(6), 0, 50, 50),
    new Asteroid(spaceField.getLaneCenter(1), -200, 50, 50),
    new Asteroid(spaceField.getLaneCenter(5), -200, 50, 50),
    new Asteroid(spaceField.getLaneCenter(3), -200, 50, 50),
    new Asteroid(spaceField.getLaneCenter(0), -400, 50, 50),
    new Asteroid(spaceField.getLaneCenter(2), -400, 50, 50),
    new Asteroid(spaceField.getLaneCenter(4), -400, 50, 50),
    new Asteroid(spaceField.getLaneCenter(6), -400, 50, 50),
    new Asteroid(spaceField.getLaneCenter(1), -600, 50, 50),
    new Asteroid(spaceField.getLaneCenter(3), -600, 50, 50),
    new Asteroid(spaceField.getLaneCenter(5), -600, 50, 50),
];

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestSpaceship.brain));
    
    // Track training progress
    const currentBestDistance = Math.abs(bestSpaceship.y - 800); // Distance from start
    if (currentBestDistance > bestDistanceEver) {
        bestDistanceEver = currentBestDistance;
    }
    
    trainingData.push({
        generation: generation,
        distance: currentBestDistance,
        timestamp: Date.now()
    });
    
    localStorage.setItem("trainingData", JSON.stringify(trainingData));
    generation++;
    
    console.log(`Saved generation ${generation - 1} with distance: ${Math.round(currentBestDistance)}`);
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("trainingData");
    trainingData = [];
    generation = 1;
}

function generateSpaceships(N) {
    const spaceships = [];
    for (let i = 1; i <= N; i++) {
        spaceships.push(new Spaceship(spaceField.getLaneCenter(3), 800, 30, 50, "AI"));
    }
    return spaceships;
}

function animate() {
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].update();
        // If an asteroid goes off the bottom of the view, recycle it to the top.
        if (asteroids[i].y > bestSpaceship.y + gameCanvas.height * 0.5) {
            asteroids[i].y = bestSpaceship.y - gameCanvas.height * 1.5;
            asteroids[i].x = spaceField.getLaneCenter(
                Math.floor(Math.random() * spaceField.laneCount)
            );
        }
    }
    for (let i = 0; i < spaceships.length; i++) {
        spaceships[i].update(spaceField.borders, asteroids);
    }
    bestSpaceship = spaceships.find(
        s => s.y == Math.min(
            ...spaceships.map(s => s.y)
        ));

    gameCanvas.height = window.innerHeight * 0.9;
    ctx.save();
    ctx.translate(0, -bestSpaceship.y + gameCanvas.height * 0.7);

    // Draw stars in the background
    drawStars(ctx, bestSpaceship.y);
    
    spaceField.draw(ctx);
    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].draw(ctx);
    }
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < spaceships.length; i++) {
        spaceships[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    bestSpaceship.draw(ctx, true);

    ctx.restore();
    
    // Update all visualizers
    updateVisualizers();
    
    requestAnimationFrame(animate);
}

function updateVisualizers() {
    // Neural Network Visualizer - Clean Implementation
    if (bestSpaceship.brain) {
        drawCleanNeuralNetwork(networkCtx, bestSpaceship.brain);
    }

    // Performance Progress Chart
    if (trainingData.length > 0) {
        drawProgressChart(performanceCtx, trainingData);
    }

    // Stats Dashboard
    const aliveShips = spaceships.filter(s => !s.damaged).length;
    const stats = {
        generation: generation,
        population: N,
        bestDistance: Math.abs(bestSpaceship.y - 800),
        aliveShips: aliveShips,
        mutationRate: 0.2
    };
    drawStats(statsCtx, stats);
}

function drawProgressChart(ctx, data) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (data.length < 2) return;
    
    const margin = 20;
    const width = ctx.canvas.width - 2 * margin;
    const height = ctx.canvas.height - 2 * margin;
    
    const maxDistance = Math.max(...data.map(d => d.distance));
    const minDistance = Math.min(...data.map(d => d.distance));
    
    // Background
    ctx.fillStyle = "rgba(0,40,80,0.3)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Grid
    ctx.strokeStyle = "rgba(0,255,255,0.2)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = margin + (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(margin + width, y);
        ctx.stroke();
    }
    
    // Progress line
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = margin + (i / Math.max(data.length - 1, 1)) * width;
        const y = margin + height - ((data[i].distance - minDistance) / Math.max(maxDistance - minDistance, 1)) * height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Data points
    ctx.fillStyle = "#00ff88";
    for (let i = 0; i < data.length; i++) {
        const x = margin + (i / Math.max(data.length - 1, 1)) * width;
        const y = margin + height - ((data[i].distance - minDistance) / Math.max(maxDistance - minDistance, 1)) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Title and labels
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Training Progress", ctx.canvas.width / 2, 15);
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Best: ${Math.round(maxDistance)}m`, margin, margin - 5);
    ctx.textAlign = "right";
    ctx.fillText(`Gen: ${data.length}`, ctx.canvas.width - margin, margin - 5);
}

function drawStats(ctx, stats) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Background
    ctx.fillStyle = "rgba(100,50,0,0.3)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Title
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Live Statistics", ctx.canvas.width / 2, 18);
    
    // Stats
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    
    const lines = [
        `Generation: ${stats.generation}`,
        `Population: ${stats.population}`,
        `Best Distance: ${Math.round(stats.bestDistance)}m`,
        `Alive Ships: ${stats.aliveShips}`,
        `Survival Rate: ${((stats.aliveShips/stats.population)*100).toFixed(1)}%`
    ];
    
    lines.forEach((line, index) => {
        ctx.fillText(line, 10, 35 + index * 16);
    });
    
    // Survival bar
    const barY = ctx.canvas.height - 25;
    const barWidth = ctx.canvas.width - 20;
    const barHeight = 8;
    
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(10, barY, barWidth, barHeight);
    
    const survivalRatio = stats.aliveShips / stats.population;
    ctx.fillStyle = survivalRatio > 0.5 ? "#00ff88" : "#ff4444";
    ctx.fillRect(10, barY, barWidth * survivalRatio, barHeight);
    
    // Bar label
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Population Health", ctx.canvas.width / 2, barY - 5);
}

function drawStars(ctx, cameraY) {
    // Multiple layers of stars for depth
    const layers = [
        { count: 150, speed: 0.1, size: 0.5, alpha: 0.6 }, // Far stars
        { count: 100, speed: 0.3, size: 1, alpha: 0.8 },   // Mid stars  
        { count: 50, speed: 0.5, size: 1.5, alpha: 1 }     // Near stars
    ];
    
    layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
            const x = (i * 67 + layerIndex * 23) % gameCanvas.width;
            const yOffset = Math.floor(cameraY * layer.speed / 1000) * 2000;
            const y = ((i * 97 + layerIndex * 43) % 2000) + yOffset - 1000;
            
            // Different star colors for variety
            const colors = ["#ffffff", "#ffffaa", "#aaaaff", "#ffaaaa"];
            const colorIndex = (i + layerIndex) % colors.length;
            
            ctx.fillStyle = colors[colorIndex];
            ctx.globalAlpha = layer.alpha;
            
            // Add twinkling effect
            const twinkle = Math.sin(Date.now() * 0.003 + i * 0.1) * 0.3 + 0.7;
            ctx.globalAlpha *= twinkle;
            
            ctx.beginPath();
            ctx.arc(x, y, layer.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add occasional bright stars
            if (i % 20 === 0) {
                ctx.shadowColor = colors[colorIndex];
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(x, y, layer.size + 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    });
    
    ctx.globalAlpha = 1; // Reset alpha
}

function drawCleanNeuralNetwork(ctx, network) {
    // Clear and set background
    ctx.fillStyle = "#0a1520";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Title
    ctx.fillStyle = "#00ffff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🧠 Neural Network", ctx.canvas.width / 2, 20);
    
    if (!network || !network.levels || network.levels.length === 0) {
        ctx.fillStyle = "#666666";
        ctx.font = "12px Arial";
        ctx.fillText("No neural data", ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    const margin = 30;
    const availableWidth = ctx.canvas.width - 2 * margin;
    const availableHeight = ctx.canvas.height - 60;
    
    // Get layer information
    const layers = [network.levels[0].inputs, ...network.levels.map(l => l.outputs)];
    const layerCount = layers.length;
    
    // Calculate spacing - much more space between layers
    const layerSpacing = availableWidth / (layerCount + 1);
    
    // Draw connections first (behind nodes)
    for (let i = 1; i < layerCount; i++) {
        const prevLayer = layers[i - 1];
        const currentLayer = layers[i];
        const level = network.levels[i - 1];
        
        const prevX = margin + i * layerSpacing;
        const currentX = margin + (i + 1) * layerSpacing;
        
        drawNetworkConnections(ctx, prevLayer, currentLayer, level, prevX, currentX, availableHeight, 30);
    }
    
    // Draw nodes on top
    for (let i = 0; i < layerCount; i++) {
        const layer = layers[i];
        const x = margin + (i + 1) * layerSpacing;
        const isInput = i === 0;
        const isOutput = i === layerCount - 1;
        
        drawNetworkNodes(ctx, layer, x, availableHeight, 30, isInput, isOutput);
    }
    
    // Labels
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    
    // Input label
    const inputX = margin + layerSpacing;
    ctx.fillText("Sensors", inputX, ctx.canvas.height - 5);
    
    // Output label
    const outputX = margin + layerCount * layerSpacing;
    ctx.fillText("Controls", outputX, ctx.canvas.height - 5);
}

function drawNetworkConnections(ctx, prevLayer, currentLayer, level, prevX, currentX, height, startY) {
    const prevNodeSpacing = height / (prevLayer.length + 1);
    const currentNodeSpacing = height / (currentLayer.length + 1);
    
    for (let i = 0; i < prevLayer.length; i++) {
        for (let j = 0; j < currentLayer.length; j++) {
            const weight = level.weights[i][j];
            const strength = Math.abs(weight);
            
            // Only show strong connections for cleaner look
            if (strength < 0.3) continue;
            
            const prevY = startY + (i + 1) * prevNodeSpacing;
            const currentY = startY + (j + 1) * currentNodeSpacing;
            
            // Clean yellow dashed lines
            ctx.strokeStyle = `rgba(255, 255, 0, ${Math.min(strength, 0.8)})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            ctx.setLineDash([]);
        }
    }
}

function drawNetworkNodes(ctx, nodes, x, height, startY, isInput, isOutput) {
    const nodeSpacing = height / (nodes.length + 1);
    const radius = Math.min(10, height / (nodes.length * 2.5));
    
    for (let i = 0; i < nodes.length; i++) {
        const y = startY + (i + 1) * nodeSpacing;
        const activation = typeof nodes[i] === 'number' ? nodes[i] : 0;
        const intensity = Math.abs(activation);
        
        // Node background
        ctx.fillStyle = "#1a2a3a";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Activation center - bright yellow when active
        if (intensity > 0.1) {
            ctx.fillStyle = intensity > 0.5 ? "#ffff00" : "#666600";
            ctx.beginPath();
            ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Clean white border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Output labels - using text symbols instead of emojis to avoid stretching
        if (isOutput) {
            const labels = ['↑', '←', '→', '↓']; // Clean arrow symbols instead of emojis
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 12px Arial"; // Slightly larger for clarity
            ctx.textAlign = "center";
            ctx.fillText(labels[i] || '?', x, y + 4);
        }
    }
}

animate();
