export class Mouse {
    constructor(container) {
        this.x = 0;
        this.y = 0;
        this.leftDown = false;
        this.rightDown = false;
        this.middleDown = false;
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
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