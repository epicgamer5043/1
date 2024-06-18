const socket = io('http://localhost:3000');
let recording = false;
let actions = [];
const startRecordingBtn = document.getElementById('startRecording');
const stopRecordingBtn = document.getElementById('stopRecording');
const startReplayBtn = document.getElementById('startReplay');
const repetitionInput = document.getElementById('repetition');
const intervalInput = document.getElementById('interval');
const variablesInput = document.getElementById('variables');

startRecordingBtn.addEventListener('click', () => {
    recording = true;
    actions = [];
    console.log('Recording started');
});

stopRecordingBtn.addEventListener('click', () => {
    recording = false;
    console.log('Recording stopped');
});

startReplayBtn.addEventListener('click', async () => {
    const repetition = parseInt(repetitionInput.value) || 1;
    const interval = parseInt(intervalInput.value) || 1000;
    const variables = JSON.parse(variablesInput.value || '{}');

    try {
        const response = await fetch('http://localhost:3000/api/saveActions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ actions, repetition, interval, variables })
        });
        const { id } = await response.json();
        socket.emit('startReplay', { id });
    } catch (error) {
        console.error('Error saving actions:', error);
    }
});

document.addEventListener('mousemove', event => {
    if (recording) {
        actions.push({ type: 'mousemove', x: event.clientX, y: event.clientY, timestamp: Date.now() });
    }
});

document.addEventListener('click', event => {
    if (recording) {
        actions.push({ type: 'click', x: event.clientX, y: event.clientY, timestamp: Date.now() });
    }
});

document.addEventListener('keydown', event => {
    if (recording) {
        actions.push({ type: 'keydown', key: event.key, timestamp: Date.now() });
    }
});

socket.on('replayActions', action => {
    if (action.type === 'mousemove') {
        simulateMousemove(action.x, action.y);
    } else if (action.type === 'click') {
        simulateClick(action.x, action.y);
    } else if (action.type === 'keydown') {
        simulateKeydown(action.key);
    }
});

function simulateMousemove(x, y) {
    const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: x,
        clientY: y,
        bubbles: true
    });
    document.dispatchEvent(mouseMoveEvent);
    console.log(`Mouse moved to (${x}, ${y})`);
}

function simulateClick(x, y) {
    const clickEvent = new MouseEvent('click', {
        clientX: x,
        clientY: y,
        bubbles: true
    });
    document.dispatchEvent(clickEvent);
    console.log(`Clicked at (${x}, ${y})`);
}

function simulateKeydown(key) {
    const keyEvent = new KeyboardEvent('keydown', {
        key: key,
        bubbles: true
    });
    document.dispatchEvent(keyEvent);
    console.log(`Key ${key} pressed`);
}
