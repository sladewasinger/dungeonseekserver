import { Cell } from "./Cell.js";
import { Point } from "./Point.js";

export class JailGenerator {
    constructor(width, height, scale, wallThickness) {
        // create square grid of cells
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.wallThickness = wallThickness;
        this.maze = [];

        for (let x = 0; x < width; x++) {
            this.maze[x] = [];
            for (let y = 0; y < height; y++) {
                const cell = new Cell(x, y);
                cell.northWall = false;
                cell.westWall = false;
                cell.southWall = false;
                cell.eastWall = false;
                this.maze[x][y] = cell;
            }
        }

        this.closeOuterWalls();
    }

    closeOuterWalls() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (i === 0) {
                    this.maze[i][j].westWall = true;
                }
                if (i === this.width - 1) {
                    this.maze[i][j].eastWall = true;
                }
                if (j === 0) {
                    this.maze[i][j].northWall = true;
                }
                if (j === this.height - 1) {
                    this.maze[i][j].southWall = true;
                }
            }
        }
    }

    wallsAsBoxes(offset) {
        const boxes = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const cell = this.maze[i][j];
                let tempBoxes = cell.wallsAsBoxes(this.scale, this.wallThickness, offset);
                tempBoxes = tempBoxes.map(box => {
                    return { ...box, color: "0xff0000" }
                });
                boxes.push(...tempBoxes);
            }
        }
        return boxes;
    }
}