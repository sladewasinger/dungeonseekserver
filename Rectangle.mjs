import Matter from 'matter-js';

// create two boxes and a ground
export class Rectangle {
    constructor(x, y, width, height, options = {}) {
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        this.width = width;
        this.height = height;
        this.options = options;
    }
}
