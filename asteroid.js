// in asteroid.js
class Asteroid {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = Math.random() * Math.PI * 2; // Random initial rotation
        this.rotationSpeed = (Math.random() - 0.5) * 0.005; // Very slow rotation
        this.speed = 1; // Speed of the asteroid
        this.polygon = this.#createPolygon();
    }
    
    #createPolygon(){
        const points = [];
        const sides = 10; // 10-sided polygon for more circular appearance
        const radius = Math.max(this.width, this.height) / 2;
        
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + this.angle;
            // Add slight randomness to make each asteroid unique but keep it circular
            const variation = 0.8 + Math.sin(i * 2.3) * 0.2; // Slight irregular shape
            const currentRadius = radius * variation;
            
            points.push({
                x: this.x + Math.cos(angle) * currentRadius,
                y: this.y + Math.sin(angle) * currentRadius
            });
        }
        return points;
    }

    update(){
        this.#move();
        this.angle += this.rotationSpeed; // Very slow, subtle rotation
        this.polygon = this.#createPolygon();
    }
    #move(){
        // Move the asteroid downwards
        this.y += this.speed;
    }
    draw(ctx) {
        ctx.save();
        
        // Create a more realistic asteroid gradient
        const radius = Math.max(this.width, this.height) / 2;
        const gradient = ctx.createRadialGradient(
            this.x - radius * 0.3, this.y - radius * 0.3, 0, 
            this.x, this.y, radius
        );
        gradient.addColorStop(0, "#B8860B"); // Lighter gold center
        gradient.addColorStop(0.3, "#8B4513"); // Brown
        gradient.addColorStop(0.7, "#654321"); // Darker brown
        gradient.addColorStop(1, "#2F1B14"); // Very dark edge
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = "#0f0f0f";
        ctx.lineWidth = 1.5;
        
        // Draw the main asteroid shape with smooth curves
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            const currentPoint = this.polygon[i];
            const nextPoint = this.polygon[(i + 1) % this.polygon.length];
            const midX = (currentPoint.x + nextPoint.x) / 2;
            const midY = (currentPoint.y + nextPoint.y) / 2;
            
            ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add surface texture with consistent craters
        const seed = this.x + this.y; // Use position as seed for consistent craters
        ctx.fillStyle = "rgba(101, 67, 33, 0.6)";
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + seed;
            const distance = (radius * 0.3) * Math.sin(angle * 1.7);
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            const size = 1.5 + Math.sin(seed + i) * 1.5;
            
            ctx.beginPath();
            ctx.arc(this.x + offsetX, this.y + offsetY, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add a subtle highlight
        ctx.fillStyle = "rgba(184, 134, 11, 0.3)";
        ctx.beginPath();
        ctx.arc(this.x - radius * 0.3, this.y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}