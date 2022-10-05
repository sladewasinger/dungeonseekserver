import * as PIXI from 'pixi.js';
import * as PIXIMath from '@pixi/math';
import '@pixi/math-extras';

import { Camera } from './Camera.js';
import { Mouse } from './Mouse.js';

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
        this.gunLine = undefined;
        this.startTime = Date.now();
        document.getElementById('gameContainer').appendChild(this.app.view);

        this.camera = new Camera(0, 0, 1);
        this.camera.container.position = new PIXI.Point(0, 0);
        this.app.stage.addChild(this.camera.container);

        this.mouse = new Mouse(this.camera.container);

        window.addEventListener('keydown', function (e) {
            if (e.key == ' ' && e.target == document.body) {
                e.preventDefault();
            }
        });
    }

    update(matterEngine, playerId) {
        // set mouse pos
        const mousePos = this.app.renderer.plugins.interaction.mouse.global;
        this.mouse.setPos(mousePos.x, mousePos.y);
        const lastUpdatedTime = Date.now();
        this.startTime = lastUpdatedTime;

        for (var rect of this.camera.container.children) {
            const body = matterEngine.engine.world.bodies.find(x => x.id === rect.id);
            if (body) {
                rect.position.x = body.position.x;
                rect.position.y = body.position.y;
                rect.rotation = body.angle;
                if (rect.id === playerId) {
                    this.drawGun(rect);
                }
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

    drawGun(playerRect) {
        if (!this.gunLine) {
            this.gunLine = new PIXI.Graphics();
            this.gunLine.position.x = 0;
            this.gunLine.position.y = 0;
            this.gunLine.id = 'gunLine';
            this.camera.container.addChild(this.gunLine);
        } else {
            //const mousePos = this.app.renderer.plugins.interaction.mouse.global;
            let mouseVector = new PIXIMath.Point(this.mouse.x - this.width / 2, this.mouse.y - this.height / 2);
            mouseVector = mouseVector.normalize();
            mouseVector = mouseVector.multiplyScalar(15);
            this.gunLine
                .clear()
                .lineStyle(5, 0x000000, 1)
                .moveTo(playerRect.position.x, playerRect.position.y)
                .lineTo(playerRect.position.x + mouseVector.x, playerRect.position.y + mouseVector.y);
        }
    }

    removeById(id) {
        const rect = this.camera.container.children.find(x => x.id === id);
        if (rect) {
            this.camera.container.removeChild(rect);
        }
    }
}