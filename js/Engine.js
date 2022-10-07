import { Rectangle } from './Rectangle.js';
import { Point } from './Point.js';
import { Player } from './Player.js';
import Matter from 'matter-js';
import { MazeGenerator } from './MazeGenerator.js';
import { JailGenerator } from './JailGenerator.js';

export class Engine {
    constructor(socketServer) {
        this.socketServer = socketServer;
        this.devToolsEnabled = true;
    }

    init() {
        this.clearGameSettings();
        setInterval(this.update.bind(this), this.fps);
    }

    clearGameSettings() {
        this.matterEngine = Matter.Engine.create();
        this.matterEngine.gravity.y = 0;

        this.fps = 1000 / 60;
        this.debounce = false;

        if (this.gameState?.players) {
            this.gameState.players.forEach(x => {
                x.socket.disconnect();
            });
        }
        this.gameState = {
            gameText: "Waiting for players...",
            gameStarted: false,
            players: [],
            boxes: []
        }

        this.startTime = new Date();

        this.mazeGenerator = new MazeGenerator(25, 25, 100, 25);
        this.jailGenerator = new JailGenerator(2, 2, 300, 25);
        this.endGoal = new Rectangle(
            (this.mazeGenerator.width - 1) * this.mazeGenerator.scale,
            (this.mazeGenerator.height - 1) * this.mazeGenerator.scale,
            this.mazeGenerator.scale * 0.5, this.mazeGenerator.scale * 0.5, { isStatic: true });
        this.endGoal.color = '0xFF00FF';
        this.boxes = [
            this.endGoal
        ];
        const mazeBoxes = this.mazeGenerator.wallsAsBoxes();
        this.jailPos = new Point(-1000, 0);
        const jailBoxes = this.jailGenerator.wallsAsBoxes(this.jailPos);
        this.boxes.push(...mazeBoxes, ...jailBoxes);

        const startArea = new Rectangle(
            this.jailPos.x + 100,
            this.jailPos.y + 300,
            200,
            200,
            {
                isSensor: true
            }
        );
        startArea.color = '0xFF00FF';
        this.boxes.push(startArea);
        this.gameState.startArea = startArea;
        //socket.emit('initialGameState', this.getInitialGameState());


        // add all of the bodies to the world
        Matter.Composite.add(this.matterEngine.world, this.boxes.map(x => x.body));
    }

    createPlayer(socket, id) {
        const playerPos = new Point(
            this.jailPos.x + (this.jailGenerator.width - 1) * this.jailGenerator.scale * 0.5,
            this.jailPos.y + (this.jailGenerator.height - 1) * this.jailGenerator.scale * 0.5
        );
        const player = new Player(socket, id, new Rectangle(playerPos.x, 0, 25, 25, { frictionAir: 0.05 }));
        this.gameState.players.push(player);
        Matter.Composite.add(this.matterEngine.world, player.box.body);
    }

    removePlayer(id) {
        const player = this.gameState.players.find(x => x.id === id);
        if (!player) return;
        console.log("removing player", id);
        this.socketServer.emit('playerLeft', id);
        this.gameState.players = this.gameState.players.filter(x => x.id !== id); /* Remove player from list */
        Matter.Composite.remove(this.matterEngine.world, player.box.body); /* Remove player from world */
    }

    keyDown(id, key) {
        const player = this.gameState.players.find(x => x.id === id);
        if (!player) return;
        player.keys[key] = true;
    }

    keyUp(id, key) {
        const player = this.gameState.players.find(x => x.id === id);
        if (!player) return;
        player.keys[key] = false;
    }

    clearKeys(id) {
        const player = this.gameState.players.find(x => x.id === id);
        if (!player) return;
        player.keys = {};
    }

    getInitialGameState() {
        const gameState = {
            text: this.gameState.gameText,
            players: [],
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
        return gameState;
    }

    getClientGameState() {
        try {
            const gameState = {
                text: this.gameState.gameText,
                players: this.gameState.players.map(x => ({
                    position: x.box.body.position,
                    width: x.box.width,
                    height: x.box.height,
                    options: x.box.options,
                    angle: x.box.body.angle,
                    velocity: x.box.body.velocity,
                    angularVelocity: x.box.body.angularVelocity,
                    id: x.id,
                    color: x.color,
                    team: x.team
                }))
            };

            return gameState;
        } catch (e) {
            console.log(e);
        }
    }

    allPlayersWithinStartArea() {
        if (this.gameState.players.length > 1) {
            this.gameState.gameText = 'Get in the pink box to start!';
        }
        const body = this.gameState.startArea.body;
        return this.gameState.players.every(x => Matter.Bounds.overlaps(body.bounds, x.box.body.bounds));
    }

    startGame() {
        this.gameState.gameStarted = true;
        this.gameState.gameText = "Game Started";
        // randomly sort players into two teams
        this.gameState.players = this.gameState.players.sort(() => Math.random() - 0.5);
        this.gameState.players.forEach((x, i) => {
            const t = i % 2;
            if (t === 0) {
                x.team = 'red';
                x.color = '0xFF0000';
            } else {
                x.team = 'blue';
                x.color = '0x0000FF';
                Matter.Body.setPosition(x.box.body, { x: 0, y: 0 });
            }
        });

        const gameFunc = (timerSeconds) => {
            timerSeconds--;
            if (timerSeconds <= 0 || this.gameState.players.filter(x => x.team === 'red').length === 0 || this.gameState.players.filter(x => x.team === 'blue').length === 0) {
                this.gameState.gameText = "Blue Team Wins!";
                setTimeout(() => this.clearGameSettings(), 5000);
            } else {
                this.gameState.gameText = `${timerSeconds}s - Blue team: hide from the red team!\nRed team: tag the blue team!`;
                setTimeout(() => gameFunc(timerSeconds), 1000);
            }
        }

        const preGameFunc = (timerSeconds) => {
            this.gameState.gameText = `Red team joins in ${timerSeconds} seconds`;
            timerSeconds--;
            if (timerSeconds >= 0) {
                setTimeout(preGameFunc, 1000, timerSeconds);
            } else {
                this.gameState.players.forEach(x => {
                    if (x.team === 'red') {
                        Matter.Body.setPosition(x.box.body, { x: 0, y: 0 });
                    }
                });
                gameFunc(120);
            }
        }

        const timer = 30;
        setTimeout(preGameFunc, 1000, 20);
    }

    update() {
        const endTime = new Date();
        let delta = endTime - this.startTime;
        delta = Math.min(180, Math.max(5, delta));
        Matter.Engine.update(this.matterEngine, delta);

        if (this.gameState.players.length > 1 && !this.gameState.gameStarted && this.allPlayersWithinStartArea()) {
            this.startGame();
        }

        if (this.gameState.players.length < 1 && this.gameState.gameStarted) {
            this.clearGameSettings();
        }

        if (this.gameState.gameStarted) {
            const redPlayers = this.gameState.players.filter(x => x.team === 'red');
            const bluePlayers = this.gameState.players.filter(x => x.team === 'blue');

            bluePlayers.forEach(x => {
                if (Matter.Query.collides(x.box.body, redPlayers.map(x => x.box.body)).length > 0) {
                    console.log('blue player tagged');
                    x.color = '0xFF0055';
                    x.team = 'red';
                }
            });

            if (bluePlayers.length < 1) {
                this.gameState.gameText = 'Red team wins!';
                setTimeout(() => this.clearGameSettings(), 5000);
            }
        }

        for (const player of this.gameState.players) {
            const keys = player.keys;
            const box = player.box;
            const vel = { x: 0, y: 0 };

            if (keys['w']) vel.y -= 1;
            if (keys['s']) vel.y += 1;
            if (keys['a']) vel.x -= 1;
            if (keys['d']) vel.x += 1;

            let speed = 3;

            if (player.team == 'blue') {
                speed = 2;
            }

            vel.x *= speed;
            vel.y *= speed;

            Matter.Body.setVelocity(box.body, vel);

            if (Matter.Collision.collides(box.body, this.endGoal.body) && !player.winner) {
                player.winner = true;
                player.socket.emit('winner');
            }

            if (this.devToolsEnabled) {
                if (keys['3'] && !this.debounce) {
                    this.debounce = true;
                    // pick random cell from mazeGenerator.maze
                    const randX = Math.floor(Math.random() * this.mazeGenerator.width);
                    const randY = Math.floor(Math.random() * this.mazeGenerator.height);
                    const cell = this.mazeGenerator.maze[randX][randY];
                    let playerPos = new Point(cell.x * this.mazeGenerator.scale, cell.y * this.mazeGenerator.scale);
                    Matter.Body.setPosition(player.box.body, playerPos);
                } else if (!keys['3']) {
                    this.debounce = false;
                }

                if (keys['r']) {
                    this.clearGameSettings();
                }
            }
        }
    }
}
