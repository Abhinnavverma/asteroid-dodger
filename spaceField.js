// in spaceField.js

class SpaceField {
    constructor(x, width, laneCount = 7) {
        this.x = x; // The center x-coordinate of the field
        this.width = width;
        this.laneCount = laneCount;

        // Calculate the left and right boundaries
        this.left = x - width / 2;
        this.right = x + width / 2;

        // Define a very large height for the field to seem infinite
        const infinity = 100000000;
        this.top = -infinity;
        this.bottom = infinity;

        // Create the data for the two border lines
        const topLeft = { x: this.left, y: this.top };
        const topRight = { x: this.right, y: this.top };
        const bottomLeft = { x: this.left, y: this.bottom };
        const bottomRight = { x: this.right, y: this.bottom };
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    // This method calculates the center of a given lane
    getLaneCenter(laneIndex) {
        const laneWidth = this.width / this.laneCount;
        // Clamp the index to be safe
        const clampedIndex = Math.max(0, Math.min(laneIndex, this.laneCount - 1));
        return this.left + (laneWidth / 2) + (clampedIndex * laneWidth);
    }

    // This method draws the space boundaries and optional lane guides
    draw(ctx) {
        // Draw space boundaries (force fields or energy barriers)
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#00ffff"; // Cyan energy barriers
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10;
        
        // Draw glowing borders
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Optionally draw subtle lane guides (like navigation grid)
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(100, 100, 255, 0.2)"; // Very faint blue
        for (let i = 1; i <= this.laneCount - 1; i++) {
            const x = lerp(this.left, this.right, i / this.laneCount);
            ctx.setLineDash([10, 30]); // Very faint dashed lines
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }
        
        ctx.setLineDash([]); // Reset to solid lines
    }
}