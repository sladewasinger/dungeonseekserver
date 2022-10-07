import { Point } from "./Point.js";
import { Rectangle } from "./Rectangle.js";

export class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.northWall = true;
        this.westWall = true;
        this.southWall = true;
        this.eastWall = true;
        this.visited = false;
    }

    wallsAsBoxes(scale, wallThickness, offset = new Point(0, 0)) {
        const boxes = [];

        if (this.northWall) {
            boxes.push(new Rectangle(this.x * scale + offset.x, this.y * scale - scale / 2 + offset.y, scale + wallThickness, wallThickness, { isStatic: true }));
        }
        if (this.westWall) {
            boxes.push(new Rectangle(this.x * scale - scale / 2 + offset.x, this.y * scale + offset.y, wallThickness, scale + wallThickness, { isStatic: true }));
        }
        if (this.southWall) {
            boxes.push(new Rectangle(this.x * scale + offset.x, this.y * scale + scale - scale / 2 + offset.y, scale + wallThickness, wallThickness, { isStatic: true }));
        }
        if (this.eastWall) {
            boxes.push(new Rectangle(this.x * scale + scale - scale / 2 + offset.x, this.y * scale + offset.y, wallThickness, scale + wallThickness, { isStatic: true }));
        }

        return boxes;
    }
}
