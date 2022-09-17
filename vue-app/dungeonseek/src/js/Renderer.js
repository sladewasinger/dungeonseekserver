import * as PIXI from 'pixi.js';
import { ReactiveFlags } from 'vue';

export class Renderer {
    constructor() {
        this.app = new PIXI.Application({
            antialias: false,
            width: 800,
            height: 800,
            forceCanvas: true,
            backgroundAlpha: 0
        });
        document.body.appendChild(this.app.view);
    }

    update(gameState) {
        for (var box of gameState.boxes) {
            const rect = this.app.stage.children.find(x => x.id === box.id);
            if (!rect) {
                const rect = new PIXI.Graphics();
                rect.beginFill("#FF0000");
                rect.drawRect(box.position.x, box.position.y, box.width, box.height);
                rect.endFill();
                rect.id = box.id;
                rect.pivot = new PIXI.Point(box.position.x + box.width / 2, box.position.y + box.height / 2);
                this.app.stage.addChild(rect);
            } else {
                rect.position.x = box.position.x;
                rect.position.y = box.position.y;
                rect.rotation = box.angle;
            }
        }
    }
}