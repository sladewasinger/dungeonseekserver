const Matter = require('matter-js');
const { Server } = require("socket.io");
const http = require('http');
const express = require('express');

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
var ground = new Rectangle(400, 610, 810, 60, { isStatic: true });

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
    if (keys['d']) {
        Matter.Body.setVelocity(boxA.body, { x: 3, y: boxA.body.velocity.y });
    }
    if (keys['a']) {
        Matter.Body.setVelocity(boxA.body, { x: -3, y: boxA.body.velocity.y });
    }
}
setInterval(loop, fps);

const app = express();
const path = __dirname + '/vue-app/dungeonseek/dist/';
app.use(express.static(path));

const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000; // Use the port that AWS provides or default to 3000. Without this, the deployment will fail.
server.listen(port, () => {
    console.log('listening on *:' + port);
});

let keys = {};

io.on('connection', (socket) => {
    console.log('user connected');

    var box = new Rectangle(300, 200, 60, 60);
    boxes.push(box);
    Composite.add(engine.world, box.body);
    console.log("BOX ADDED");

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        socket.emit('chatMessage', msg);
        console.log('-- message: ' + msg);
    });

    socket.on('keydown', (key) => {
        keys[key] = true;
    });

    socket.on("keyup", (key) => {
        keys[key] = false;
    });

    socket.emit('gameState', getGameState());
});

try {
    setInterval(() => {

        io.emit('gameState', getGameState());

    }, 1000 / 30); // 20 updates per second
} catch (error) {
    console.log(error);
}


function getGameState() {
    return {
        boxes: boxes.map(x => {
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
        })
    };
}