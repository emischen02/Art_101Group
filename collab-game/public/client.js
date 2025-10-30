const socket = io();
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let clientId = null;
let players = {};
const keys = new Set();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#e1e5e9';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  Object.entries(players).forEach(([id, p]) => {
    const r = id === clientId ? 16 : 12;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.closePath();
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillText(p.name || 'Player', p.x, p.y - r - 8);
  });
}

function tick() {
  const dir = { dx: 0, dy: 0 };
  if (keys.has('ArrowLeft') || keys.has('a')) dir.dx -= 1;
  if (keys.has('ArrowRight') || keys.has('d')) dir.dx += 1;
  if (keys.has('ArrowUp') || keys.has('w')) dir.dy -= 1;
  if (keys.has('ArrowDown') || keys.has('s')) dir.dy += 1;
  if (dir.dx || dir.dy) socket.emit('move', dir);
  draw();
  requestAnimationFrame(tick);
}

socket.on('init', (payload) => { clientId = payload.id; players = payload.players || {}; });
socket.on('player:join', ({ id, state }) => { players[id] = state; });
socket.on('player:update', ({ id, state }) => { players[id] = state; });
socket.on('player:leave', ({ id }) => { delete players[id]; });

window.addEventListener('keydown', (e) => { keys.add(e.key); });
window.addEventListener('keyup', (e) => { keys.delete(e.key); });

const nameInput = document.getElementById('nameInput');
const setNameBtn = document.getElementById('setNameBtn');
setNameBtn.addEventListener('click', () => {
  const v = nameInput.value.trim();
  if (v) socket.emit('rename', v);
});
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') setNameBtn.click(); });

tick();


