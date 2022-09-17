const createjs = window.createjs;

export class Camera {
    constructor(x = 0, y = 0, scale = 4) {
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.container = new createjs.Container();
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
