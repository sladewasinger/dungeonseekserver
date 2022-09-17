import { Camera } from './Camera';
import { MatterEngine } from './MatterEngine';
import { io } from 'socket.io-client';
import { Renderer } from './Renderer';
const createjs = window.createjs;

export class Engine {
    constructor() {
        this.camera = new Camera(0, 0, 2);
        this.matterEngine = new MatterEngine();
        this.socketUrl = undefined;
        console.log(process.env);
        if (process.env.NODE_ENV == 'local') {
            console.log("Connecting to localhost");
            this.socketUrl = 'http://localhost:3000';
        }
        this.socket = io(this.socketUrl); // change this to localhost:3000 when testing locally
        this.gameState = { boxes: [] };
        this.fps = 1000 / 60;

        this.keys = {};
        this.canvas = document.getElementById('gameCanvas');

        // window.addEventListener('resize', e => this.resizeCanvas());
        // window.addEventListener('wheel', e => this.resizeCanvas());

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

        this.renderer = new Renderer();
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
        this.matterEngine.update(delta, this.gameState, this.keys);
        this.renderer.update(this.gameState);
    }
}
