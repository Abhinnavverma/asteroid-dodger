class Sensor{
    constructor(spaceship){
        this.spaceship=spaceship;
        this.rayCount=5;
        this.rayLength=150;
        this.raySpread=Math.PI/2;

        this.rays=[];
        this.readings=[];
    }

    update(spaceFieldBorders,asteroids){
        this.#castRays();
        this.readings=[];
        for(let i=0;i<this.rays.length;i++){
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    spaceFieldBorders,
                    asteroids
                )
            );
        }
    }

    #getReading(ray,spaceFieldBorders,asteroids){
        let touches=[];

        for(let i=0;i<spaceFieldBorders.length;i++){
            const touch=getIntersection(
                ray[0],
                ray[1],
                spaceFieldBorders[i][0],
                spaceFieldBorders[i][1]
            );
            if(touch){
                touches.push(touch);
            }
        }

        for(let i=0;i<asteroids.length;i++){
            const poly=asteroids[i].polygon;
            for(let j=0;j<poly.length;j++){
                const value=getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }

        if(touches.length==0){
            return null;
        }else{
            const offsets=touches.map(e=>e.offset);
            const minOffset=Math.min(...offsets);
            return touches.find(e=>e.offset==minOffset);
        }
    }

    #castRays(){
        this.rays=[];
        for(let i=0;i<this.rayCount;i++){
            const rayAngle=lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1?0.5:i/(this.rayCount-1)
            )+this.spaceship.angle;

            const start={x:this.spaceship.x, y:this.spaceship.y};
            const end={
                x:this.spaceship.x-
                    Math.sin(rayAngle)*this.rayLength,
                y:this.spaceship.y-
                    Math.cos(rayAngle)*this.rayLength
            };
            this.rays.push([start,end]);
        }
    }

    draw(ctx){
        for(let i=0;i<this.rayCount;i++){
            let end=this.rays[i][1];
            if(this.readings[i]){
                end=this.readings[i];
            }

            // Draw scanning beams with a sci-fi look
            ctx.beginPath();
            ctx.lineWidth=1;
            ctx.strokeStyle="rgba(0, 255, 255, 0.5)"; // Cyan scanning beam
            ctx.shadowColor = "#00ffff";
            ctx.shadowBlur = 3;
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            // Draw detection points
            if(this.readings[i]){
                ctx.beginPath();
                ctx.fillStyle = "#ff4444"; // Red for detected obstacles
                ctx.shadowColor = "#ff0000";
                ctx.shadowBlur = 5;
                ctx.arc(end.x, end.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.shadowBlur = 0; // Reset shadow
        }
    }        
}