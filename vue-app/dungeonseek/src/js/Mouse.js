export class Mouse {
    constructor(container) {
        this.x = 0;
        this.y = 0;
        this.leftDown = false;
        this.rightDown = false;
        this.middleDown = false;
        container.on('mousemove', this.onMouseMove.bind(this), false);
        container.on('mousedown', this.onMouseDown.bind(this), false);
        container.on('mouseup', this.onMouseUp.bind(this), false);
    }

    onMouseMove(e) {
        console.log(e);
        this.x = e.data.global.x;
        this.y = e.data.global.y;
    }

    onMouseDown(e) {
        switch (e.button) {
            case 0:
                this.leftDown = true;
                break;
            case 1:
                this.middleDown = true;
                break;
            case 2:
                this.rightDown = true;
                break;
        }
    }

    onMouseUp(e) {
        switch (e.button) {
            case 0:
                this.leftDown = false;
                break;
            case 1:
                this.middleDown = false;
                break;
            case 2:
                this.rightDown = false;
                break;
        }
    }
}