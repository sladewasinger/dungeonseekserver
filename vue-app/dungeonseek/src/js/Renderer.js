import * as PIXI from 'pixi.js';
import { Camera } from './Camera.js';

export class Renderer {
    constructor() {
        this.app = new PIXI.Application({
            antialias: false,
            width: 800,
            height: 600,
            forceCanvas: true,
            backgroundAlpha: 0
        });
        document.getElementById('gameContainer').appendChild(this.app.view);

        this.camera = new Camera(0, 0, 1);
        this.camera.container.position = new PIXI.Point(0, 0);
        this.app.stage.addChild(this.camera.container);
    }

    update(gameState) {
        for (var box of gameState.boxes) {
            const rect = this.camera.container.children.find(x => x.id === box.id);
            if (!rect) {
                const rect = new PIXI.Graphics();
                rect.beginFill("#FF0000");
                rect.drawRect(box.position.x, box.position.y, box.width, box.height);
                rect.endFill();
                rect.id = box.id;
                rect.pivot = new PIXI.Point(box.position.x + box.width / 2, box.position.y + box.height / 2);
                this.camera.container.addChild(rect);
            } else {
                rect.position.x = box.position.x;
                rect.position.y = box.position.y;
                rect.rotation = box.angle;
            }
        }
    }
}