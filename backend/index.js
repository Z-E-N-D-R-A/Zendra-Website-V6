const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const APP_PORT = process.env.PORT || 2000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*'; // set to your real frontend domain in Render env

const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));

// optional: serve static (not necessary if frontend is hosted elsewhere)
app.use('/', express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const DATA_FILE = path.join(__dirname, 'chats.txt');

let chats = [];
let socketList = {};
let guests = 0;
let colors = ['#ffae00', '#f700ff', '#00b7ff', '#00ffb3', '#fbff00'];

// load saved chats if any
function loadChats() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      if (data.length) {
        chats = data.split('\n\n').map(e => ({ message: e.split('\n')[0], time: Number(e.split('\n')[1] || Date.now()) }));
      }
    }
  } catch (err) {
    console.error('Failed to load chats:', err);
  }
}
loadChats();

function saveChats() {
  try {
    const chatsStr = chats.map(e => e.message + "\n" + e.time).join("\n\n");
    fs.writeFileSync(DATA_FILE, chatsStr, 'utf8');
  } catch (err) {
    console.error('Failed to save chats:', err);
  }
}

function encode(txt) {
  return txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function emitWho() {
  for (const j in socketList) {
    const pack = [];
    for (const i in socketList) {
      if (j === i) pack.push({ name: socketList[i].name + ' (You)', color: socketList[i].color });
      else pack.push({ name: socketList[i].name, color: socketList[i].color });
    }
    socketList[j].emit('who', pack);
  }
}

function emitChats() {
  for (const i in socketList) {
    const pack = chats.map(c => {
      if (c.socketId != i) return { message: c.message, time: c.time };
      else return c;
    });
    socketList[i].emit('chats', pack);
  }
}

let lastTime = Date.now();
function refreshTime() {
  lastTime = Date.now();
  io.sockets.emit('time', lastTime);
}


// socket handlers
io.on('connection', (socket) => {
  if (!chats.length) loadChats();
  emitChats();

  socket.color = colors[Math.floor(Math.random() * colors.length)];

  socket.on('name', (name) => {
    refreshTime();
    name = encode(name || 'Guest');
    socketList[socket.id] = socket;
    if (name === 'Guest') {
      socket.name = name + ' ' + guests;
      guests++;
    } else {
      socket.name = name;
    }
    chats.push({
      message: `<span class="name" style="color:${socket.color}">${socket.name}</span><span class="green"> joined.</span>`,
      time: Date.now()
    });
    emitChats();
    emitWho();
    saveChats();
  });

  socket.on('message', (message) => {
    refreshTime();
    if (typeof message !== 'string') return;
    if (message.length > 400) return; // safety
    message = encode(message);
    chats.push({
      message: `<span class="name" style="color:${socket.color}">${socket.name}</span> <span class="message-content">${message}</span>`,
      time: Date.now(),
      socketId: socket.id,
      id: Math.random().toString(36).slice(2)
    });
    emitChats();
    saveChats();
  });

  socket.on('delete', (id) => {
    for (let i = 0; i < chats.length; i++) {
      if (chats[i].id === id) {
        chats.splice(i, 1);
        break;
      }
    }
    emitChats();
    saveChats();
  });

  socket.on('disconnect', () => {
    refreshTime();
    if (socketList[socket.id]) {
      chats.push({
        message: `<span class="name" style="color:${socket.color}">${socket.name}</span> <span class="red"> left.</span>`,
        time: Date.now()
      });
      emitChats();
      delete socketList[socket.id];
    }
    saveChats();
    emitWho();
  });
});

// periodically refresh times for clients
setInterval(() => {
  refreshTime();
  emitChats();
}, 10000);

server.listen(APP_PORT, () => {
  console.log(`Server started on port ${APP_PORT}`);
});