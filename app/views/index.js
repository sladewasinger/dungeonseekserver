var socket = io();

var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
});

// run the renderer
Render.run(render);


var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chatMessage', function (msg) {
    console.log(msg);
});

const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true
    socket.emit("keydown", e.key);
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false
    socket.emit("keyup", e.key);
});

let gameState = { boxes: [] };
socket.on('gameState', function (gs) {
    try {
        gameState = gs;
        console.log(gameState.boxes.length);
        for (var box of gameState.boxes) {
            if (!engine.world.bodies.find(x => x.id === box.id)) {
                var body = Bodies.rectangle(box.position.x, box.position.y, box.width, box.height, { ...box.options, id: box.id });
                Composite.add(engine.world, body);
            } else {
                var body = engine.world.bodies.find(x => x.id === box.id);
                Body.setPosition(body, box.position);
                Body.setAngle(body, box.angle);
                Body.setVelocity(body, box.velocity);
                Body.setAngularVelocity(body, box.angularVelocity);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
});


var elapsedTime = 0;
var fps = 1000 / 60;
function loop(time) {
    var delta = time - elapsedTime;
    delta = Math.min(64, Math.max(fps, delta));
    Engine.update(engine, delta);

    var boxA = engine.world.bodies.find(x => x.id == gameState.boxes[0].id);
    if (keys["ArrowRight"] || keys["d"]) {
        Body.setVelocity(boxA, { x: 3, y: 0 });
    }
    if (keys["a"]) {
        Body.setVelocity(boxA, { x: -3, y: 0 });
    }

    elapsedTime = time;
}

setInterval(loop, fps);

