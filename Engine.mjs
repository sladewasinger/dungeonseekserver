import { Rectangle } from './Rectangle.mjs';
import { Player } from './Player.mjs';
import Matter from 'matter-js';

class Engine {
    constructor() {
        this.players = [];
        this.fps = 1000 / 60;
    }

    init() {
        this.matterEngine = Matter.Engine.create();

        var boxA = new Rectangle(400, 200, 80, 80);
        var boxB = new Rectangle(450, 50, 80, 80);
        var ground = new Rectangle(400, 610, 500, 60, { isStatic: true });

        this.boxes = [
            boxA,
            boxB,
            ground
        ]

        // add all of the bodies to the world
        Matter.Composite.add(this.matterEngine.world, this.boxes.map(x => x.body));

        setInterval(this.update.bind(this), this.fps);
    }

    createPlayer(id) {
        const player = new Player(id, new Rectangle(300, 200, 50, 50));
        this.players.push(player);
        Matter.Composite.add(this.matterEngine.world, player.box.body);
    }

    removePlayer(id) {
        const player = this.players.find(x => x.id === id);
        this.players = this.players.filter(x => x.id !== id); /* Remove player from list */
        Matter.Composite.remove(this.matterEngine.world, player.box.body); /* Remove player from world */
    }

    keyDown(id, key) {
        const player = this.players.find(x => x.id === id);
        if (!player) return;
        player.keys[key] = true;
    }

    keyUp(id, key) {
        const player = this.players.find(x => x.id === id);
        if (!player) return;
        player.keys[key] = false;
    }

    getGameState() {
        return {
            boxes: [
                ...this.boxes.map(x => {
                    return {
                        position: x.body.position,
                        width: x.width,
                        height: x.height,
                        options: x.options,
                        angle: x.body.angle,
                        velocity: x.body.velocity,
                        angularVelocity: x.body.angularVelocity,
                        id: x.body.id,
                        label: x.body.label
                    };
                }),
                ...this.players.map(x => {
                    return {
                        position: x.box.body.position,
                        width: x.box.width,
                        height: x.box.height,
                        options: x.box.options,
                        angle: x.box.body.angle,
                        velocity: x.box.body.velocity,
                        angularVelocity: x.box.body.angularVelocity,
                        id: x.id
                    }
                })
            ]
        };
    }

    update() {
        Matter.Engine.update(this.matterEngine, this.fps);
        for (const player of this.players) {
            const keys = player.keys;
            const box = player.box;
            if (keys['d']) {
                Matter.Body.setVelocity(box.body, { x: 3, y: box.body.velocity.y });
            }
            if (keys['a']) {
                Matter.Body.setVelocity(box.body, { x: -3, y: box.body.velocity.y });
            }

            if (box.body.position.y > 700) {
                Matter.Body.setPosition(box.body, { x: 400, y: 0 });
            }
        }
    }
}

const _Engine = Engine;
export { _Engine as Engine };
