const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3001;

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory player store
/** @type {Map<string, {x:number,y:number,color:string,name:string}>} */
const players = new Map();

function randomHexColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

io.on('connection', (socket) => {
  const spawn = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 450) + 50,
    color: randomHexColor(),
    name: 'Player ' + socket.id.slice(0, 4)
  };

  players.set(socket.id, spawn);

  // Send initial state to the new player
  socket.emit('init', { id: socket.id, players: Object.fromEntries(players) });

  // Notify others of the new player
  socket.broadcast.emit('player:join', { id: socket.id, state: spawn });

  // Handle movement from client
  socket.on('move', (dir) => {
    const p = players.get(socket.id);
    if (!p) return;
    const speed = 6;
    const dx = Math.max(-1, Math.min(1, Number(dir?.dx || 0)));
    const dy = Math.max(-1, Math.min(1, Number(dir?.dy || 0)));
    p.x = Math.max(10, Math.min(790, p.x + dx * speed));
    p.y = Math.max(10, Math.min(590, p.y + dy * speed));
    io.emit('player:update', { id: socket.id, state: p });
  });

  // Rename player
  socket.on('rename', (name) => {
    const p = players.get(socket.id);
    if (!p) return;
    const clean = String(name || '').slice(0, 20);
    p.name = clean || p.name;
    io.emit('player:update', { id: socket.id, state: p });
  });

  // Disconnect
  socket.on('disconnect', () => {
    players.delete(socket.id);
    socket.broadcast.emit('player:leave', { id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


