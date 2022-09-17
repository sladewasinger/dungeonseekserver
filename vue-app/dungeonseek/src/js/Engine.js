import { Camera } from './Camera';
import { MatterEngine } from './MatterEngine';
import { io } from 'socket.io-client';
const createjs = window.createjs;

export class Engine {
    constructor() {
        this.camera = new Camera(0, 0, 2);
        this.matterEngine = new MatterEngine();
        this.socket = io(); // change this to localhost:3000 when testing locally
        this.gameState = { boxes: [] };
        this.elapsedTime = 0;
        this.fps = 1000 / 60;

        this.stage = new createjs.Stage('gameCanvas');
        this.stage.snapToPixel = true;
        this.stage.snapToPixelEnabled = true;
        this.stage.addChild(this.camera.container);

        const context = this.stage.canvas.getContext('2d');
        context.imageSmoothingEnabled = false;
        this.keys = {};

        window.addEventListener('resize', e => this.resizeCanvas());
        window.addEventListener('wheel', e => this.resizeCanvas());

        window.addEventListener('keydown', e => this.keyDown(e));
        window.addEventListener('keyup', e => this.keyUp(e));

        this.socket.on('ping', () => console.log('ping'));
        this.socket.on('gameState', (gs) => {
            try {
                this.gameState = gs;
                this.matterEngine.onGameStateUpdated(this.gameState);
            } catch (e) {
                console.log(e);
            }
        });

    }

    keyDown(e) {
        this.socket.emit('keydown', e.key);
        this.keys[e.key] = true;
    }

    keyUp(e) {
        this.socket.emit('keyup', e.key);
        this.keys[e.key] = false;
    }

    resizeCanvas() {
        this.stage.canvas.width = window.innerWidth / this.camera.scale;
        this.stage.canvas.height = window.innerHeight / this.camera.scale;
    }

    init() {
        this.resizeCanvas();
        setInterval(() => this.loop, this.fps);
    }

    loop(time) {
        let delta = time - this.elapsedTime;
        delta = Math.min(64, Math.max(this.fps, delta));
        this.matterEngine.update(delta, this.keys);
    }
}
