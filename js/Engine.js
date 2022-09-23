import { Rectangle } from './Rectangle.js';
import { Player } from './Player.js';
import Matter from 'matter-js';
import { MazeGenerator } from './MazeGenerator.js';

export class Engine {
    constructor(socketServer) {
        this.players = [];
        this.fps = 1000 / 60;
        this.socketServer = socketServer;
    }

    init() {
        this.matterEngine = Matter.Engine.create();
        this.matterEngine.gravity.y = 0;
        this.mazeGenerator = new MazeGenerator(100, 100, 75, 5);

        var boxA = new Rectangle(400, 200, 80, 80);
        var boxB = new Rectangle(450, 50, 80, 80);
        var ground = new Rectangle(400, 610, 500, 60, { isStatic: true });
        this.endGoal = new Rectangle(
            (this.mazeGenerator.width - 1) * this.mazeGenerator.scale,
            (this.mazeGenerator.height - 1) * this.mazeGenerator.scale,
            this.mazeGenerator.scale, this.mazeGenerator.scale, { isStatic: true });
        this.endGoal.color = '0xFF00FF';
        this.boxes = [
            this.endGoal
        ];
        const mazeBoxes = this.mazeGenerator.wallsAsBoxes(100, 5);// .getArray().flatMap(cell => cell.wallsAsBoxes(100, 5));
        this.boxes.push(...mazeBoxes);

        // add all of the bodies to the world
        Matter.Composite.add(this.matterEngine.world, this.boxes.map(x => x.body));

        setInterval(this.update.bind(this), this.fps);
    }

    createPlayer(socket, id) {
        const player = new Player(socket, id, new Rectangle(0, 0, 25, 25, { frictionAir: 0.05 }));
        this.players.push(player);
        Matter.Composite.add(this.matterEngine.world, player.box.body);
    }

    removePlayer(id) {
        const player = this.players.find(x => x.id === id);
        if (!player) return;
        console.log("removing player", id);
        this.socketServer.emit('playerLeft', id);
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

    getInitialGameState() {
        return {
            boxes: [
                ...this.boxes
                    .map(x => {
                        return {
                            position: x.body.position,
                            width: x.width,
                            height: x.height,
                            options: x.options,
                            angle: x.body.angle,
                            velocity: x.body.velocity,
                            angularVelocity: x.body.angularVelocity,
                            id: x.body.id,
                            label: x.body.label,
                            color: x.color
                        };
                    })
            ]
        };
    }

    getGameState() {
        try {
            return {
                boxes: [
                    // ...this.boxes
                    //     .filter(x => !x.isStatic)
                    //     .map(x => {
                    //         return {
                    //             position: x.body.position,
                    //             width: x.width,
                    //             height: x.height,
                    //             options: x.options,
                    //             angle: x.body.angle,
                    //             velocity: x.body.velocity,
                    //             angularVelocity: x.body.angularVelocity,
                    //             id: x.body.id,
                    //             label: x.body.label,
                    //             color: x.color
                    //         };
                    //     }),
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
        } catch (e) {
            console.log(e);
        }
    }

    update() {
        Matter.Engine.update(this.matterEngine, this.fps);
        for (const player of this.players) {
            const keys = player.keys;
            const box = player.box;
            const vel = { x: 0, y: 0 };

            if (keys['w']) vel.y -= 1;
            if (keys['s']) vel.y += 1;
            if (keys['a']) vel.x -= 1;
            if (keys['d']) vel.x += 1;

            vel.x *= 3;
            vel.y *= 3;

            Matter.Body.setVelocity(box.body, vel);

            if (Matter.Collision.collides(box.body, this.endGoal.body) && !player.winner) {
                player.winner = true;
                player.socket.emit('winner');
            }
            // if (box.body.position.y > 700) {
            //     Matter.Body.setPosition(box.body, { x: 400, y: 0 });
            // }
        }
    }
}
