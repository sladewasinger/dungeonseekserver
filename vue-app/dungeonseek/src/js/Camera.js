import * as PIXI from 'pixi.js';

export class Camera {
    constructor(x = 0, y = 0, scale = 4) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.container = new PIXI.Container();
        // set camera mask
        this.mask = new PIXI.Graphics();
        this.mask.beginFill(0x000000);
        this.mask.drawRect(0, 0, 800, 600);
        this.mask.endFill();
        this.container.addChild(this.mask);
        this.container.mask = this.mask;

    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.container.pivot = new PIXI.Point(this.x, this.y);
        this.container.mask.position = new PIXI.Point(this.x, this.y);
    }
}
