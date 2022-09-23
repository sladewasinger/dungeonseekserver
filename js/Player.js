export class Player {
    constructor(socket, id, box) {
        this.socket = socket;
        this.id = id;
        this.box = box;
        this.keys = {};
        this.winner = false;
    }
}

