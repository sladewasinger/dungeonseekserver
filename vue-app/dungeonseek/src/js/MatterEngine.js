import * as Matter from 'matter-js';
var Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

export class MatterEngine {
    constructor() {
        // create an engine
        this.engine = Engine.create();
        this.engine.gravity.y = 0;
    }

    removeById(id) {
        const body = this.engine.world.bodies.find(x => x.id === id);
        if (!body) return;
        Composite.remove(this.engine.world, body);
    }

    onGameStateUpdated(gameState) {
        try {
            for (var box of gameState.boxes) {
                var body = this.engine.world.bodies.find(x => x.id === box.id);
                if (!body) {
                    const body = Bodies.rectangle(box.position.x, box.position.y, box.width, box.height, { ...box.options, id: box.id });
                    body.width = box.width;
                    body.height = box.height;
                    body.color = box.color;
                    Composite.add(this.engine.world, body);
                } else {
                    // ease body to box position
                    var lerpScale = 0.2;
                    const pos = { x: body.position.x + (box.position.x - body.position.x) * lerpScale, y: body.position.y + (box.position.y - body.position.y) * lerpScale };

                    Body.setPosition(body, pos);
                    Body.setAngle(body, box.angle);
                    Body.setVelocity(body, box.velocity);
                    Body.setAngularVelocity(body, box.angularVelocity);
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }

    update(delta, gameState, keys, playerId) {
        Engine.update(this.engine, delta);

        let player = this.engine.world.bodies.find(x => x.id === playerId);
        if (player) {
            const vel = { x: 0, y: 0 };

            if (keys['w']) vel.y -= 1;
            if (keys['s']) vel.y += 1;
            if (keys['a']) vel.x -= 1;
            if (keys['d']) vel.x += 1;

            vel.x *= 3;
            vel.y *= 3;

            Matter.Body.setVelocity(player, vel);
        }
    }
}