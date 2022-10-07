import { Cell } from './Cell.js';
import { Point } from './Point.js';
import { Rectangle } from './Rectangle.js';

export class MazeGenerator {
    constructor(width, height, scale, wallThickness) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.wallThickness = wallThickness;
        this.maze = [];
        this.start = new Point(0, 0);
        this.end = new Point(0, 0);
        this.stack = [];

        // Initialize maze
        for (let i = 0; i < width; i++) {
            this.maze[i] = [];
            for (let j = 0; j < height; j++) {
                this.maze[i][j] = new Cell(i, j);
            }
        }

        // Create start and end
        this.start = new Point(0, 0);
        this.end = new Point(width - 1, height - 1);

        // Set current to start
        let current = this.maze[this.start.x][this.start.y];
        current.westWall = false;
        current.visited = true;
        this.stack.push(this.current);

        // Create maze
        while (this.stack.length > 0) {
            let next = this.getRandomNeighbor(current);
            if (next) {
                next.visited = true;
                this.removeWalls(current, next);
                current = next;
                this.stack.push(current);
            } else {
                current = this.stack.pop();
            }
        }

        this.removeRandomWalls();
        this.closeOuterWalls();
    }

    removeRandomWalls() {
        const threshold = 0.5;
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (Math.random() < threshold) {
                    this.maze[i][j].northWall = false;
                }
                if (Math.random() < threshold) {
                    this.maze[i][j].westWall = false;
                }
                if (Math.random() < threshold) {
                    this.maze[i][j].eastWall = false;
                }
                if (Math.random() < threshold) {
                    this.maze[i][j].southWall = false;
                }
            }
        }
    }

    wallsAsBoxes() {
        const boxes = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const cell = this.maze[i][j];
                const tempBoxes = cell.wallsAsBoxes(this.scale, this.wallThickness);
                boxes.push(...tempBoxes);
            }
        }
        return boxes;
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

    getArray() {
        var arry = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                arry.push(this.maze[i][j]);
            }
        }
        return arry;
    }

    removeWalls(current, next) {
        // remove walls
        if (current.x < next.x) {
            next.westWall = false;
            current.eastWall = false;
        }
        else if (current.x > next.x) {
            next.eastWall = false;
            current.westWall = false;
        }

        if (current.y < next.y) {
            next.northWall = false;
            current.southWall = false;
        } else if (current.y > next.y) {
            next.southWall = false;
            current.northWall = false;
        }
    }

    getRandomNeighbor(cell) {
        let neighbors = [];

        let top = new Point(cell.x, cell.y - 1);
        let right = new Point(cell.x + 1, cell.y);
        let bottom = new Point(cell.x, cell.y + 1);
        let left = new Point(cell.x - 1, cell.y);

        const isValid = (point) => {
            if (point.x < 0 || point.y < 0 || point.x >= this.width || point.y >= this.height) {
                return false;
            }

            if (this.maze[point.x][point.y].visited) {
                return false;
            }

            return true;
        }

        if (isValid(top)) {
            neighbors.push(this.maze[top.x][top.y]);
        }

        if (isValid(right)) {
            neighbors.push(this.maze[right.x][right.y]);
        }

        if (isValid(bottom)) {
            neighbors.push(this.maze[bottom.x][bottom.y]);
        }

        if (isValid(left)) {
            neighbors.push(this.maze[left.x][left.y]);
        }

        if (neighbors.length > 0) {
            let r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        } else {
            return undefined;
        }
    }
}