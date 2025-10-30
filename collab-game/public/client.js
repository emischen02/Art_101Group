const socket = io();

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let clientId = null;
let players = {}; // id -> {x,y,color,name}

const keys = new Set();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw boundary
  ctx.strokeStyle = '#e1e5e9';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // draw players
  Object.entries(players).forEach(([id, p]) => {
    const radius = id === clientId ? 16 : 12;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.closePath();

    // name label
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillText(p.name || 'Player', p.x, p.y - radius - 8);
  });
}

function loop() {
  const dir = { dx: 0, dy: 0 };
  if (keys.has('ArrowLeft') || keys.has('a')) dir.dx -= 1;
  if (keys.has('ArrowRight') || keys.has('d')) dir.dx += 1;
  if (keys.has('ArrowUp') || keys.has('w')) dir.dy -= 1;
  if (keys.has('ArrowDown') || keys.has('s')) dir.dy += 1;

  if (dir.dx !== 0 || dir.dy !== 0) {
    socket.emit('move', dir);
  }

  draw();
  requestAnimationFrame(loop);
}

// socket events
socket.on('init', (payload) => {
  clientId = payload.id;
  players = payload.players || {};
});

socket.on('player:join', ({ id, state }) => {
  players[id] = state;
});

socket.on('player:update', ({ id, state }) => {
  players[id] = state;
});

socket.on('player:leave', ({ id }) => {
  delete players[id];
});

// input handling
window.addEventListener('keydown', (e) => {
  keys.add(e.key);
});
window.addEventListener('keyup', (e) => {
  keys.delete(e.key);
});

// name control
const nameInput = document.getElementById('nameInput');
const setNameBtn = document.getElementById('setNameBtn');
setNameBtn.addEventListener('click', () => {
  const value = nameInput.value.trim();
  if (value) socket.emit('rename', value);
});
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') setNameBtn.click();
});

// start
loop();


