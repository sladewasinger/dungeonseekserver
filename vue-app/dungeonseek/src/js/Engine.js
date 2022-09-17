import { Camera } from './Camera';

const createjs = window.createjs;

export class Engine {
    constructor() {
        this.camera = new Camera(0, 0, 2);

        this.stage = new createjs.Stage('gameCanvas');
        this.stage.snapToPixel = true;
        this.stage.snapToPixelEnabled = true;
        this.stage.addChild(this.camera.container);

        const context = this.stage.canvas.getContext('2d');
        context.imageSmoothingEnabled = false;
        this.keyMap = {};

        window.addEventListener('resize', e => this.resizeCanvas());
        window.addEventListener('wheel', e => this.resizeCanvas());

        window.addEventListener('keydown', e => {
            this.keyMap[e.key] = true;
        });
        window.addEventListener('keyup', e => {
            this.keyMap[e.key] = false;
        });
    }

    resizeCanvas() {
        this.stage.canvas.width = window.innerWidth / this.camera.scale;
        this.stage.canvas.height = window.innerHeight / this.camera.scale;
    }

    init() {
        this.resizeCanvas();
    }
}
