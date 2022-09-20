import { Point } from './Point.js';

export class MazeGenerator {
    constructor() {
        this.maze = [];
        this.visited = [];
        this.start = new Point(0, 0);
        this.end = new Point(0, 0);
        this.current = new Point(0, 0);

        this.stack = [];

        // Create maze
        for (let i = 0; i < 25; i++) {
            this.maze[i] = [];
            this.visited[i] = [];
            for (let j = 0; j < 25; j++) {
                this.maze[i][j] = 1;
                this.visited[i][j] = false;
            }
        }

        // Create start and end
        this.start.x = Math.floor(Math.random() * 25);
        this.start.y = Math.floor(Math.random() * 25);
        this.end.x = Math.floor(Math.random() * 25);
        this.end.y = Math.floor(Math.random() * 25);

        // Set current to start
        this.current = this.start;
        this.visited[this.current.x][this.current.y] = true;

        // Create maze
        this.stack.push(this.current);
        while (this.stack.length > 0) {
            let next = this.getRandomNeighbor(this.current);
            if (next) {
                this.visited[next.x][next.y] = true;
                this.stack.push(this.current);
                this.removeWalls(this.current, next);
                this.current = next;
            } else {
                this.current = this.stack.pop();
            }
        }

        // Set start and end
        this.maze[this.start.x][this.start.y] = 2;
        this.maze[this.end.x][this.end.y] = 3;
    }

    removeWalls(current, next) {
        let x = current.x - next.x;
        if (x === 1) {
            this.maze[current.x - 1][current.y] = 0;
        } else if (x === -1) {
            this.maze[current.x + 1][current.y] = 0;
        }

        let y = current.y - next.y;
        if (y === 1) {
            this.maze[current.x][current.y - 1] = 0;
        } else if (y === -1) {
            this.maze[current.x][current.y + 1] = 0;
        }
    }

    getRandomNeighbor(point) {
        let neighbors = [];

        let top = new Point(point.x, point.y - 1);
        let right = new Point(point.x + 1, point.y);
        let bottom = new Point(point.x, point.y + 1);
        let left = new Point(point.x - 1, point.y);

        if (top.y > -1 && !this.visited[top.x][top.y]) {
            neighbors.push(top);
        }

        if (right.x < 25 && !this.visited[right.x][right.y]) {
            neighbors.push(right);
        }

        if (bottom.y < 25 && !this.visited[bottom.x][bottom.y]) {
            neighbors.push(bottom);
        }

        if (left.x > -1 && !this.visited[left.x][left.y]) {
            neighbors.push(left);
        }

        if (neighbors.length > 0) {
            let r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        } else {
            return undefined;
        }
    }
}