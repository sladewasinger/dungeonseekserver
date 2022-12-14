import { MatterEngine } from './MatterEngine';
import { io } from 'socket.io-client';
import { Renderer } from './Renderer';
import * as PIXIMath from '@pixi/math';

export class Engine {
    constructor(winnerCallbac) {
        this.devToolsEnabled = true;
        this.matterEngine = new MatterEngine();
        this.socketUrl = undefined;
        if (process.env.NODE_ENV == 'local') {
            console.log("Connecting to localhost");
            this.socketUrl = 'http://localhost:3000';
        }
        this.socket = io(this.socketUrl);
        this.gameState = { boxes: [] };
        this.fps = 1000 / 60;
        this.keys = {};
        this.canvas = document.getElementById('gameCanvas');
        this.canShoot = true;

        window.addEventListener('keydown', e => this.keyDown(e));
        window.addEventListener('keyup', e => this.keyUp(e));
        window.addEventListener('blur', e => this.clearKeys(e));
        window.oncontextmenu = this.clearKeys.bind(this);

        this.socket.on("connect", () => {
            console.log(this.socket.id);
        });
        this.socket.on("disconnect", () => {
            console.log("Disconnect!");
            window.location.reload();
        });
        this.socket.on('ping', () => console.log('ping'));
        this.socket.on('gameState', (gs) => {
            try {
                this.gameState = gs;
                this.renderer.setText(gs.text);
                this.matterEngine.onGameStateUpdated(this.gameState);
            } catch (e) {
                console.log(e);
            }
        });
        this.socket.on('initialGameState', (gs) => {
            try {
                console.log('initialGameState');
                this.gameState = gs;
                this.matterEngine.onGameStateUpdated(this.gameState);
                this.renderer.update(this.matterEngine, this.socket.id);
            } catch (e) {
                console.log(e);
            }
        });
        this.socket.on('playerLeft', (id) => {
            console.log("playerLeft", id);
            // hacky, but this should work:
            setTimeout(() => {
                this.renderer.removeById(id);
                this.matterEngine.removeById(id);
            }, 1000);
        });
        this.socket.on('winner', () => {
            winnerCallbac();
        });
        this.socket.on('removeEntity', (id) => {
            this.renderer.removeById(id);
            this.matterEngine.removeById(id);
        });
        this.socket.on('setText', (text) => {
            this.renderer.setText(text);
        });

        this.renderer = new Renderer(800, 800);
    }

    clearKeys(e) {
        this.keys = {};
        this.socket.emit('clearKeys');
    }

    keyDown(e) {
        const key = e.key.toLowerCase();
        this.socket.emit('keydown', key);
        this.keys[key] = true;
    }

    keyUp(e) {
        const key = e.key.toLowerCase();
        this.socket.emit('keyup', key);
        this.keys[key] = false;
    }

    init() {
        this.startTime = new Date();
        setInterval(this.loop.bind(this), this.fps);
    }

    loop() {
        const endTime = new Date();
        let delta = endTime - this.startTime;
        delta = Math.min(64, Math.max(this.fps, delta));
        this.matterEngine.update(delta, this.gameState, this.keys, this.socket.id);
        this.renderer.update(this.matterEngine, this.socket.id);

        let player = this.gameState.players.find(p => p.id == this.socket.id);
        let playerBody = this.matterEngine.engine.world.bodies.find(x => x.id === this.socket.id);
        if (playerBody && player) {
            if (player?.team == 'red') {
                this.renderer.camera.setMaskRadius(175);
            }
            // slowly move camera to player position
            this.renderer.camera.setPosition(
                this.renderer.camera.x + (playerBody.position.x - this.renderer.width / 2 - this.renderer.camera.x) * 0.1,
                this.renderer.camera.y + (playerBody.position.y - this.renderer.height / 2 - this.renderer.camera.y) * 0.1
            );

            if (this.renderer.mouse.leftDown && this.canShoot) {
                this.canShoot = false;
                // shoot pellet from player
                // get angle from player to mouse

                let mouseVector = new PIXIMath.Point(this.renderer.mouse.x - this.renderer.width / 2, this.renderer.mouse.y - this.renderer.height / 2);
                mouseVector = mouseVector.normalize();
                mouseVector = mouseVector.multiplyScalar(15);
                let angle = Math.atan2(mouseVector.y, mouseVector.x);
                this.socket.emit('shoot', angle);
            }

            if (!this.renderer.mouse.leftDown) {
                this.canShoot = true;
            }
        }

        if (this.devToolsEnabled) {
            if (this.keys['2']) {
                this.renderer.camera.setMaskRadius(this.renderer.camera.maskRadius + 5);
            }
            if (this.keys['1']) {
                this.renderer.camera.setMaskRadius(this.renderer.camera.maskRadius - 5);
            }
        }
    }
}
