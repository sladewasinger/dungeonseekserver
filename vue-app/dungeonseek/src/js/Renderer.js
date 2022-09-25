import * as PIXI from 'pixi.js';
import { Camera } from './Camera.js';

export class Renderer {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.app = new PIXI.Application({
            antialias: false,
            width: this.width,
            height: this.height,
            // forceCanvas: true,
            backgroundAlpha: 0
        });
        this.startTime = Date.now();
        document.getElementById('gameContainer').appendChild(this.app.view);

        this.camera = new Camera(0, 0, 1);
        this.camera.container.position = new PIXI.Point(0, 0);
        this.app.stage.addChild(this.camera.container);

        window.addEventListener('keydown', function (e) {
            if (e.key == ' ' && e.target == document.body) {
                e.preventDefault();
            }
        });
    }

    update(matterEngine, playerId) {
        const lastUpdatedTime = Date.now();
        const deltaTime = lastUpdatedTime - this.startTime;
        this.startTime = lastUpdatedTime;

        for (var rect of this.camera.container.children) {
            const body = matterEngine.engine.world.bodies.find(x => x.id === rect.id);
            if (!body) {
                this.removeById(rect.id);
            } else {
                rect.position.x = body.position.x;
                rect.position.y = body.position.y;
                rect.rotation = body.angle;
            }
        }
        for (var body of matterEngine.engine.world.bodies) {
            const rect = this.camera.container.children.find(x => x.id === body.id);
            if (!rect) {
                const rect = new PIXI.Graphics();
                if (body.id == playerId) {
                    rect.beginFill('0xFF0000');
                } else if (body.color) {
                    rect.beginFill(body.color);
                } else {
                    rect.beginFill("0x000000");
                }
                rect.drawRect(body.position.x, body.position.y, body.width, body.height);
                rect.endFill();
                rect.position.x = body.position.x;
                rect.position.y = body.position.y;
                rect.rotation = body.angle;
                rect.id = body.id;
                //rect.isStatic = body.isStatic;
                rect.pivot = new PIXI.Point(body.position.x + body.width / 2, body.position.y + body.height / 2);
                this.camera.container.addChild(rect);
            }
        }
    }

    update_OLD(gameState, playerId) {
        const lastUpdatedTime = Date.now();
        const deltaTime = lastUpdatedTime - this.startTime;
        this.startTime = lastUpdatedTime;
        const fps = 1000 / deltaTime;

        for (var box of gameState.boxes) {
            const rect = this.camera.container.children.find(x => x.id === box.id);
            if (!rect) {
                const rect = new PIXI.Graphics();
                if (box.id == playerId) {
                    rect.beginFill('0xFF0000');
                } else if (box.color) {
                    rect.beginFill(box.color);
                } else {
                    rect.beginFill("0x000000");
                }
                rect.drawRect(box.position.x, box.position.y, box.width, box.height);
                rect.endFill();
                rect.position.x = box.position.x;
                rect.position.y = box.position.y;
                rect.rotation = box.angle;
                rect.id = box.id;
                rect.isStatic = box.isStatic;
                rect.pivot = new PIXI.Point(box.position.x + box.width / 2, box.position.y + box.height / 2);
                this.camera.container.addChild(rect);
            } else {
                rect.position.x = box.position.x;
                rect.position.y = box.position.y;
                rect.rotation = box.angle;
            }
        }
        // for (var rect of this.camera.container.children) {
        //     // if box is outside of camera view, set renderable to false
        //     if (box.position.x + box.width < this.camera.x ||
        //         box.position.x > this.camera.x + this.width ||
        //         box.position.y + box.height < this.camera.y ||
        //         box.position.y > this.camera.y + this.height) {
        //         rect.renderable = false;
        //     } else {
        //         rect.renderable = true;
        //     }
        // }
    }

    removeById(id) {
        const rect = this.camera.container.children.find(x => x.id === id);
        if (rect) {
            this.camera.container.removeChild(rect);
        }
    }
}