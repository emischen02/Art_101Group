const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));

const players = new Map();

function randColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

io.on('connection', (socket) => {
  const state = {
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 450) + 50,
    color: randColor(),
    name: 'Player ' + socket.id.slice(0, 4)
  };
  players.set(socket.id, state);

  socket.emit('init', { id: socket.id, players: Object.fromEntries(players) });
  socket.broadcast.emit('player:join', { id: socket.id, state });

  socket.on('move', ({ dx = 0, dy = 0 } = {}) => {
    const p = players.get(socket.id);
    if (!p) return;
    const speed = 6;
    p.x = Math.max(10, Math.min(790, p.x + Math.max(-1, Math.min(1, dx)) * speed));
    p.y = Math.max(10, Math.min(590, p.y + Math.max(-1, Math.min(1, dy)) * speed));
    io.emit('player:update', { id: socket.id, state: p });
  });

  socket.on('rename', (name) => {
    const p = players.get(socket.id);
    if (!p) return;
    p.name = String(name || '').slice(0, 20) || p.name;
    io.emit('player:update', { id: socket.id, state: p });
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    socket.broadcast.emit('player:leave', { id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Collaborator game running: http://localhost:${PORT}`);
});


