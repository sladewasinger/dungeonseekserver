const Matter = require('matter-js');

// create two boxes and a ground
class Rectangle {
    constructor(x, y, width, height, options = {}) {
        this.body = Matter.Bodies.rectangle(x, y, width, height, options);
        this.width = width;
        this.height = height;
        this.options = options;
    }
}
exports.Rectangle = Rectangle;
