import { createServer } from 'http';
import express from 'express';
import { Server as IoServer } from 'socket.io';
import { Engine } from './Engine.js';
import path from 'path';
import { fileURLToPath } from 'url';
class Server {
    constructor() {
        this.engine = new Engine();
    }

    init() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const urlPath = __dirname + '/vue-app/dungeonseek/dist/';
        this.expressApp = express();
        // this.expressApp.use(cors({
        //     origin: ['http://localhost:8080', 'http://dungeonseek.azurewebsites.net'],
        // }))
        this.expressApp.use(express.static(urlPath));

        const port = process.env.PORT || 3000; // Use the port that AWS provides or default to 3000. Without this, the deployment will fail.
        this.server = createServer(this.expressApp);
        this.server.listen(port, () => {
            console.log('listening on *:' + port);
        });

        this.socketServer = new IoServer(this.server, {
            cors: {
                origin: ['http://dungeonseek.azurewebsites.net', 'http://localhost:8080'], // Allow all origins
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
            }
        });
        this.socketServer.on('connection', (socket) => {
            console.log('user connected', socket.id);
            this.engine.createPlayer(socket.id);

            socket.on('disconnect', () => {
                console.log('user disconnected');
                this.engine.removePlayer(socket.id);
            });

            socket.on('keydown', (key) => {
                this.engine.keyDown(socket.id, key);
            });

            socket.on("keyup", (key) => {
                this.engine.keyUp(socket.id, key);
            });

            socket.emit('gameState', this.engine.getGameState());
        });

        this.engine.init();
        setInterval(this.clientUpdateLoop.bind(this), 1000 / 30); // 30 updates per second
    }

    clientUpdateLoop() {
        this.socketServer.emit('gameState', this.engine.getGameState());
    }
}

var server = new Server();
server.init();
