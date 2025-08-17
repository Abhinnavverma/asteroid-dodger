// in spaceship.js
class Spaceship {
    constructor(x, y, width, height, controlType, maxSpeed = 4) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxAngle = Math.PI/4;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if (this.useBrain) {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }
        this.controls = new Controls();
    }
    #assessDamage(spaceFieldBorders, asteroids) {
        // Check if the spaceship collides with the space field borders
        for (let i = 0; i < spaceFieldBorders.length; i++) {
            if (polysIntersect(this.polygon, spaceFieldBorders[i])) {
                return true; // Damaged by space field border
            }
        }

        // Check for collisions with asteroids
        for (let i = 0; i < asteroids.length; i++) {
            if (polysIntersect(this.polygon, asteroids[i].polygon)) {
                return true; // Damaged by asteroid
            }
        }

        return false; // No damage detected
    }

    update(spaceFieldBorders, asteroids) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(spaceFieldBorders, asteroids);
        }
        if (this.sensor) {
            this.sensor.update(spaceFieldBorders, asteroids);
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }
    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    #move() {
        // Handle acceleration and deceleration
        if(this.controls.forward){
            this.speed+=this.acceleration;
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        }

        if(this.speed>this.maxSpeed){
            this.speed=this.maxSpeed;
        }
        if(this.speed<-this.maxSpeed/2){
            this.speed=-this.maxSpeed/2;
        }

        if(this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }

        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
            if(this.controls.left){
                this.angle+=0.03*flip;
            }
            if(this.controls.right){
                this.angle-=0.03*flip;
            }
        }
        // restrict the angle to a maximum and minimum
        if(this.angle > this.maxAngle) {
            this.angle = this.maxAngle;
        }
        if(this.angle < -this.maxAngle) {
            this.angle = -this.maxAngle;
        }


        this.x-=Math.sin(this.angle)*this.speed;
        this.y-=Math.cos(this.angle)*this.speed;
    }

    draw(ctx, drawSensor = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        if (this.damaged) {
            // Damaged spaceship - draw explosion effect
            ctx.fillStyle = "#ff4444";
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = 15;
            
            // Draw explosion particles
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const distance = 15 + Math.random() * 10;
                ctx.beginPath();
                ctx.arc(
                    Math.cos(angle) * distance, 
                    Math.sin(angle) * distance, 
                    2 + Math.random() * 3, 
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        } else {
            // Healthy spaceship - draw as a sleek spaceship
            ctx.shadowColor = "#00aaff";
            ctx.shadowBlur = 6;
            
            // Main body gradient
            const gradient = ctx.createLinearGradient(0, -this.height/2, 0, this.height/2);
            gradient.addColorStop(0, "#e0e0e0");
            gradient.addColorStop(0.3, "#c0c0c0");
            gradient.addColorStop(0.7, "#a0a0a0");
            gradient.addColorStop(1, "#808080");
            
            // Main body (sleek triangle)
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2); // Nose
            ctx.lineTo(-this.width / 3, this.height / 2); // Left wing
            ctx.lineTo(this.width / 3, this.height / 2); // Right wing
            ctx.closePath();
            ctx.fill();
            
            // Add body outline
            ctx.strokeStyle = "#555";
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Cockpit with glow
            const cockpitGradient = ctx.createRadialGradient(0, -this.height/4, 0, 0, -this.height/4, this.width/3);
            cockpitGradient.addColorStop(0, "#88ccff");
            cockpitGradient.addColorStop(0.7, "#4488ff");
            cockpitGradient.addColorStop(1, "#2266dd");
            
            ctx.fillStyle = cockpitGradient;
            ctx.shadowColor = "#4488ff";
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2 + 5);
            ctx.lineTo(-this.width / 6, -this.height / 6);
            ctx.lineTo(this.width / 6, -this.height / 6);
            ctx.closePath();
            ctx.fill();
            
            // Wing details
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#666";
            ctx.fillRect(-this.width/4, this.height/4, 3, this.height/4);
            ctx.fillRect(this.width/4 - 3, this.height/4, 3, this.height/4);
            
            // Engine thrusters (if moving forward)
            if (this.controls.forward && this.speed > 0) {
                const thrusterIntensity = Math.min(this.speed / this.maxSpeed, 1);
                
                ctx.shadowColor = "#ff6600";
                ctx.shadowBlur = 8 * thrusterIntensity;
                
                // Dynamic flame colors
                const flameColors = ["#ff4400", "#ff6600", "#ffaa00", "#ffffff"];
                
                for (let flame = 0; flame < 3; flame++) {
                    ctx.fillStyle = flameColors[flame % flameColors.length];
                    const flameLength = (8 + Math.random() * 6) * thrusterIntensity;
                    const flameWidth = (2 - flame) * 2;
                    
                    // Left thruster
                    ctx.beginPath();
                    ctx.moveTo(-this.width / 5, this.height / 2);
                    ctx.lineTo(-this.width / 5 - flameWidth, this.height / 2 + flameLength);
                    ctx.lineTo(-this.width / 5 + flameWidth, this.height / 2 + flameLength);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Right thruster
                    ctx.beginPath();
                    ctx.moveTo(this.width / 5, this.height / 2);
                    ctx.lineTo(this.width / 5 - flameWidth, this.height / 2 + flameLength);
                    ctx.lineTo(this.width / 5 + flameWidth, this.height / 2 + flameLength);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
        
        ctx.restore();
        ctx.shadowBlur = 0; // Reset shadow

        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}
