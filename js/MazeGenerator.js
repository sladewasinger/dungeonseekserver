import { Point } from './Point.js';

export class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.northWall = true;
        this.westWall = true
        this.southWall = true;
        this.eastWall = true;
        this.visited = false;
    }
}

export class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.start = new Point(0, 0);
        this.end = new Point(0, 0);
        this.current = null;
        this.next = null;
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
        this.current = this.maze[this.start.x][this.start.y];
        this.current.visited = true;
        this.stack.push(this.current);

        // Create maze
        while (this.stack.length > 0) {
            let next = this.getRandomNeighbor(this.current);
            if (next) {
                next.visited = true;
                this.removeWalls(this.current, next);
                this.current = next;
                this.stack.push(this.current);
            } else {
                this.current = this.stack.pop();
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
        let x = current.x - next.x;
        if (x === 1) {
            current.westWall = false;
            next.eastWall = false;
        } else if (x === -1) {
            current.eastWall = false;
            next.westWall = false;
        }

        let y = current.y - next.y;
        if (y === 1) {
            current.northWall = false;
            next.southWall = false;
        } else if (y === -1) {
            current.southWall = false;
            next.northWall = false;
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