import * as PIXI from 'pixi.js';

export class Camera {
    constructor(x = 0, y = 0, width, height, scale = 4) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.container = new PIXI.Container();
        this.maskRadius = this.width / 3;

        // draw white square behind everything
        const whiteBox = new PIXI.Graphics();
        whiteBox.beginFill('0xffffff');
        whiteBox.drawRect(0, 0, this.width, this.height);
        whiteBox.endFill();
        whiteBox.alpha = 1;
        this.container.addChild(whiteBox);
        this.whiteBox = whiteBox;

        // create circle mask
        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);
        mask.drawCircle(width / 2, height / 2, this.maskRadius);
        mask.endFill();
        mask.pivot = new PIXI.Point(this.x, this.y);
        mask.position = new PIXI.Point(this.x, this.y);

        this.container.mask = mask;
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.container.pivot = new PIXI.Point(this.x, this.y);
        this.container.mask.position = new PIXI.Point(this.x, this.y);
        this.whiteBox.position = new PIXI.Point(this.x, this.y);
    }

    setMaskRadius(radius) {
        if (radius < 0) {
            radius = 0;
        }
        this.maskRadius = radius;
        this.container.mask.clear();
        this.container.mask.beginFill(0xffffff);
        this.container.mask.drawCircle(this.width / 2, this.height / 2, this.maskRadius);
        this.container.mask.endFill();
    }
}
