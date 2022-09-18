const Matter = require('matter-js');
const http = require('http');
const express = require('express');
const { Server } = require("socket.io");
const cors = require('cors');

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create two boxes and a ground

class Rectangle {
    constructor(x, y, width, height, options = {}) {
        this.body = Bodies.rectangle(x, y, width, height, options);
        this.width = width;
        this.height = height;
        this.options = options;
    }
}

var boxA = new Rectangle(400, 200, 80, 80);
var boxB = new Rectangle(450, 50, 80, 80);
var ground = new Rectangle(400, 610, 500, 60, { isStatic: true });

var boxes = [
    boxA,
    boxB,
    ground
]

// add all of the bodies to the world
Composite.add(engine.world, boxes.map(x => x.body));

const fps = 1000 / 60;

// run the engine
function loop() {
    Engine.update(engine, fps);
    for (const player of players) {
        const keys = player.keys;
        const box = player.box;
        if (keys['d']) {
            Matter.Body.setVelocity(box.body, { x: 3, y: box.body.velocity.y });
        }
        if (keys['a']) {
            Matter.Body.setVelocity(box.body, { x: -3, y: box.body.velocity.y });
        }

        if (box.body.position.y > 700) {
            Matter.Body.setPosition(box.body, { x: 400, y: 0 });
        }
    }
}
setInterval(loop, fps);

const app = express();
const path = __dirname + '/vue-app/dungeonseek/dist/';
app.use(cors({
    origin: ['*:*', 'http://dungeonseek.azurewebsites.net'],
}))

app.use(express.static(path));

const server = http.createServer(app);

const port = process.env.PORT || 3000; // Use the port that AWS provides or default to 3000. Without this, the deployment will fail.
server.listen(port, () => {
    console.log('listening on *:' + port);
});


const socketServer = new Server(server, {
    cors: {
        origin: '*', // Allow all origins
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
});

class Player {
    constructor(id, box) {
        this.id = id;
        this.box = box;
        this.keys = {};
    }
}
let players = [];

socketServer.on('connection', (socket) => {
    console.log('user connected', socket.id);

    const player = new Player(socket.id, new Rectangle(300, 200, 50, 50));
    players.push(player);
    Composite.add(engine.world, player.box.body);

    socket.on('disconnect', () => {
        console.log('user disconnected');
        players = players.filter(x => x.id !== socket.id); /* Remove player from list */
        Composite.remove(engine.world, player.box.body); /* Remove player from world */
    });

    socket.on('chat message', (msg) => {
        socket.emit('chatMessage', msg);
        console.log('-- message: ' + msg);
    });

    socket.on('keydown', (key) => {
        player.keys[key] = true;
        // keys[key] = true;
    });

    socket.on("keyup", (key) => {
        player.keys[key] = false;
        // keys[key] = false;
    });

    socket.emit('gameState', getGameState());
});

try {
    setInterval(() => {

        socketServer.emit('gameState', getGameState());

    }, 1000 / 30); // 20 updates per second
} catch (error) {
    console.log(error);
}


function getGameState() {
    return {
        boxes: [
            ...boxes.map(x => {
                return {
                    position: x.body.position,
                    width: x.width,
                    height: x.height,
                    options: x.options,
                    angle: x.body.angle,
                    velocity: x.body.velocity,
                    angularVelocity: x.body.angularVelocity,
                    id: x.body.id,
                    label: x.body.label
                };
            }),
            ...players.map(x => {
                return {
                    position: x.box.body.position,
                    width: x.box.width,
                    height: x.box.height,
                    options: x.box.options,
                    angle: x.box.body.angle,
                    velocity: x.box.body.velocity,
                    angularVelocity: x.box.body.angularVelocity,
                    id: x.id
                }
            })
        ]
    };
}