import * as PIXI from 'pixi.js';

export class Camera {
    constructor(x = 0, y = 0, scale = 4) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.container = new PIXI.Container();
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.container.pivot = new PIXI.Point(this.x, this.y);
    }
}
