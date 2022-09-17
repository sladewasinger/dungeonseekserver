import { Camera } from './Camera';
import { MatterEngine } from './MatterEngine';
import { io } from 'socket.io-client';
const createjs = window.createjs;

export class Engine {
    constructor() {
        this.camera = new Camera(0, 0, 2);
        this.matterEngine = new MatterEngine();
        this.socket = io();

        this.stage = new createjs.Stage('gameCanvas');
        this.stage.snapToPixel = true;
        this.stage.snapToPixelEnabled = true;
        this.stage.addChild(this.camera.container);

        const context = this.stage.canvas.getContext('2d');
        context.imageSmoothingEnabled = false;
        this.keyMap = {};

        window.addEventListener('resize', e => this.resizeCanvas());
        window.addEventListener('wheel', e => this.resizeCanvas());

        window.addEventListener('keydown', e => this.keyDown(e));
        window.addEventListener('keyup', e => this.keyUp(e));
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
    }
}
