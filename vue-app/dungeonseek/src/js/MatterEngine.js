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
            for (var player of gameState.players) {
                const body = this.engine.world.bodies.find(x => x.id === player.id);
                if (!body) {
                    const body = Bodies.rectangle(player.position.x, player.position.y, player.width, player.height, { ...player.options, id: player.id });
                    body.width = player.width;
                    body.height = player.height;
                    body.color = player.color;
                    Composite.add(this.engine.world, body);
                } else {
                    const lerpScale = 0.2;
                    let pos = { x: body.position.x + (player.position.x - body.position.x) * lerpScale, y: body.position.y + (player.position.y - body.position.y) * lerpScale };

                    const dist = Math.sqrt(Math.pow(body.position.x - player.position.x, 2) + Math.pow(body.position.y - player.position.y, 2));
                    if (dist > player.width * 2) {
                        pos = { x: player.position.x, y: player.position.y };
                    }

                    body.color = player.color;

                    Body.setPosition(body, pos);
                    Body.setAngle(body, player.angle);
                    Body.setVelocity(body, player.velocity);
                    Body.setAngularVelocity(body, player.angularVelocity);
                }
            }
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
                    const lerpScale = 0.2;
                    // distance between body and box
                    const dist = Math.sqrt(Math.pow(body.position.x - box.position.x, 2) + Math.pow(body.position.y - box.position.y, 2));
                    let pos = { x: body.position.x + (box.position.x - body.position.x) * lerpScale, y: body.position.y + (box.position.y - body.position.y) * lerpScale };

                    if (dist > box.width * 2) {
                        pos = { x: box.position.x, y: box.position.y };
                    }

                    body.color = box.color;

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