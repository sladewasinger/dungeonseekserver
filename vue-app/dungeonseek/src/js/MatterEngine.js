import * as Matter from 'matter-js';
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

export class MatterEngine {
    constructor() {
        // create an engine
        this.engine = Engine.create();
    }

    onGameStateUpdated(gameState) {
        try {
            for (var box of gameState.boxes) {
                if (!this.engine.world.bodies.find(x => x.id === box.id)) {
                    const body = Bodies.rectangle(box.position.x, box.position.y, box.width, box.height, { ...box.options, id: box.id });
                    Composite.add(this.engine.world, body);
                } else {
                    const body = this.engine.world.bodies.find(x => x.id === box.id);
                    Body.setPosition(body, box.position);
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

        var boxA = this.engine.world.bodies.find(x => x.id == gameState.boxes[0].id);
        if (keys["ArrowRight"] || keys["d"]) {
            Body.setVelocity(boxA, { x: 3, y: 0 });
        }
        if (keys["a"]) {
            Body.setVelocity(boxA, { x: -3, y: 0 });
        }

        let player = this.engine.world.bodies.find(x => x.id === playerId);
        if (player) {
            if (keys['d']) {
                Matter.Body.setVelocity(player, { x: 3, y: player.velocity.y });
            }
            if (keys['a']) {
                Matter.Body.setVelocity(player, { x: -3, y: player.velocity.y });
            }
            if (keys['w']) {
                Matter.Body.setVelocity(player, { x: player.velocity.x, y: -3 });
            }
            if (keys['s']) {
                Matter.Body.setVelocity(player, { x: player.velocity.x, y: 3 });
            }
        }
    }
}