import { MatterEngine } from './MatterEngine';
import { io } from 'socket.io-client';
import { Renderer } from './Renderer';

export class Engine {
    constructor(winnerCallbac) {
        this.matterEngine = new MatterEngine();
        this.socketUrl = undefined;
        if (process.env.NODE_ENV == 'local') {
            console.log("Connecting to localhost");
            this.socketUrl = 'http://localhost:3000';
        }
        this.socket = io(this.socketUrl);
        this.gameState = { boxes: [] };
        this.fps = 1000 / 60;
        this.keys = {};
        this.canvas = document.getElementById('gameCanvas');

        window.addEventListener('keydown', e => this.keyDown(e));
        window.addEventListener('keyup', e => this.keyUp(e));

        this.socket.on("connect", () => {
            console.log(this.socket.id);
        });
        this.socket.on('ping', () => console.log('ping'));
        this.socket.on('gameState', (gs) => {
            try {
                this.gameState = gs;
                this.matterEngine.onGameStateUpdated(this.gameState);
            } catch (e) {
                console.log(e);
            }
        });
        this.socket.on('initialGameState', (gs) => {
            try {
                console.log('initialGameState');
                this.gameState = gs;
                this.matterEngine.onGameStateUpdated(this.gameState);
                this.renderer.update(this.matterEngine, this.socket.id);
            } catch (e) {
                console.log(e);
            }
        });
        this.socket.on('playerLeft', (id) => {
            console.log("playerLeft", id);
            // hacky, but this should work:
            setTimeout(() => this.renderer.removeById(id), 1000);
        });
        this.socket.on('winner', () => {
            winnerCallbac();
        });

        this.renderer = new Renderer(800, 600);
    }

    keyDown(e) {
        this.socket.emit('keydown', e.key);
        this.keys[e.key] = true;
    }

    keyUp(e) {
        this.socket.emit('keyup', e.key);
        this.keys[e.key] = false;
    }

    init() {
        this.startTime = new Date();
        setInterval(this.loop.bind(this), this.fps);
    }

    loop() {
        const endTime = new Date();
        let delta = endTime - this.startTime;
        delta = Math.min(64, Math.max(this.fps, delta));
        this.matterEngine.update(delta, this.gameState, this.keys, this.socket.id);
        this.renderer.update(this.matterEngine, this.socket.id);

        let player = this.matterEngine.engine.world.bodies.find(x => x.id === this.socket.id);
        if (player) {
            // slowly move camera to player position

            this.renderer.camera.setPosition(
                this.renderer.camera.x + (player.position.x - this.renderer.width / 2 - this.renderer.camera.x) * 0.1,
                this.renderer.camera.y + (player.position.y - this.renderer.height / 2 - this.renderer.camera.y) * 0.1
            );
        }

        // if (this.keys['ArrowUp']) {
        //     this.renderer.camera.setPosition(this.renderer.camera.x, this.renderer.camera.y + 1);
        // }
        // if (this.keys['ArrowDown']) {
        //     this.renderer.camera.setPosition(this.renderer.camera.x, this.renderer.camera.y - 1);
        // }
        // if (this.keys['ArrowLeft']) {
        //     this.renderer.camera.setPosition(this.renderer.camera.x + 1, this.renderer.camera.y);
        // }
        // if (this.keys['ArrowRight']) {
        //     this.renderer.camera.setPosition(this.renderer.camera.x - 1, this.renderer.camera.y);
        // }
    }
}
