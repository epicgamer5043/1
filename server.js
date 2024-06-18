const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));

let actionStorage = [];

app.post('/api/saveActions', (req, res) => {
    const { actions, repetition, interval, variables } = req.body;
    const id = actionStorage.length;
    actionStorage.push({ id, actions, repetition, interval, variables });
    res.status(200).json({ id });
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('startReplay', (data) => {
        const action = actionStorage.find(a => a.id === data.id);
        if (action) {
            const replay = async () => {
                for (let i = 0; i < action.repetition; i++) {
                    for (const act of action.actions) {
                        const updatedAction = { ...act };
                        if (action.variables) {
                            if (act.type === 'mousemove') {
                                updatedAction.x += action.variables.xIncrement || 0;
                                updatedAction.y += action.variables.yIncrement || 0;
                            }
                        }
                        socket.emit('replayActions', updatedAction);
                        await new Promise(resolve => setTimeout(resolve, action.interval));
                    }
                }
            };
            replay();
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
