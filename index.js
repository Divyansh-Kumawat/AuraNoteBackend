const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

connectToMongo();
const app = express();
const port = 5000;

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

// Allow all origins (CORS)
app.use(cors({
  origin: '*'
}));

app.use(express.json()); 

// Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/collab', require('./routes/collab'));

io.on('connection', (socket) => {
    socket.on('join-collab-note', (noteId) => {
        socket.join(noteId);
    });
    socket.on('edit-collab-note', ({ noteId, content }) => {
        socket.to(noteId).emit('collab-note-updated', content);
        // Optionally, update DB here
    });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
