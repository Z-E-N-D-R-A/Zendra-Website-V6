/* --------------------
  chat.js - Firebase Realtime DB chat
  - Replace firebaseConfig with your project's config from Firebase console
  -------------------- */

/* ======= FIREBASE CONFIG: paste your project config here ======= */
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVXS5ASvpvfBv8t3zHMs1TS_Ha6FflGWo",
  authDomain: "zentral-chat.firebaseapp.com",
  databaseURL: "https://zentral-chat-default-rtdb.firebaseio.com",
  projectId: "zentral-chat",
  storageBucket: "zentral-chat.firebasestorage.app",
  messagingSenderId: "201435043294",
  appId: "1:201435043294:web:6e903938df45b9c877b94f",
  measurementId: "G-7CTDQZR84C"
};
/* =============================================================== */

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const messagesRef = db.ref('messages');
const presenceRef = db.ref('presence');

/* local client id and name */
let clientId = localStorage.getItem('z_clientId');
if (!clientId) {
  clientId = Math.random().toString(36).slice(2);
  localStorage.setItem('z_clientId', clientId);
}
let displayName = localStorage.getItem('z_name') || '';

/* DOM */
const promptEl = document.getElementById('prompt');
const promptName = document.getElementById('promptName');
const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendBtn');
const messagesEl = document.getElementById('messages');
const whoEl = document.getElementById('who');
const onlineCountEl = document.getElementById('onlineCount');

/* colors for name dot */
const colors = ['#ffae00','#f700ff','#00b7ff','#00ffb3','#fbff00'];

/* helper: format time */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60*1000) return Math.floor(diff/1000)+'s';
  if (diff < 60*60*1000) return Math.floor(diff/(60*1000))+'m';
  if (diff < 24*60*60*1000) return Math.floor(diff/(60*60*1000))+'h';
  return Math.floor(diff/(24*60*60*1000))+'d';
}

/* render a message */
function renderMessage(data) {
  const { name, text, time, clientId: cid, color } = data;
  const isMe = cid === clientId;
  const wrapper = document.createElement('div');
  wrapper.className = 'msg ' + (isMe ? 'me' : 'other');

  // meta
  const meta = document.createElement('div');
  meta.className = 'meta';
  const dot = document.createElement('span');
  dot.className = 'name-dot';
  dot.style.background = color || '#888';
  const nameSpan = document.createElement('strong');
  nameSpan.textContent = name || 'Guest';
  nameSpan.style.marginRight = '8px';

  meta.appendChild(dot);
  meta.appendChild(nameSpan);

  // message text
  const textEl = document.createElement('div');
  textEl.innerHTML = escapeHtml(text);

  // time
  const timeEl = document.createElement('div');
  timeEl.className = 'time';
  timeEl.textContent = timeAgo(time) + ' ago';

  wrapper.appendChild(meta);
  wrapper.appendChild(textEl);
  wrapper.appendChild(timeEl);

  // delete button if owner
  if (isMe && data.id) {
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.style.marginLeft = '8px';
    del.style.background = '#b71c1c';
    del.style.color = '#fff';
    del.style.border = 'none';
    del.style.padding = '4px 8px';
    del.style.borderRadius = '6px';
    del.style.cursor = 'pointer';
    del.onclick = () => {
      messagesRef.child(data.id).remove();
    };
    meta.appendChild(del);
  }

  messagesEl.appendChild(wrapper);
  // scroll to bottom
  messagesEl.parentElement.scrollTop = messagesEl.parentElement.scrollHeight;
}

/* escape simple html */
function escapeHtml(s) {
  if (!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

/* load historic messages once & then listen to new */
messagesRef.limitToLast(100).on('child_added', snap => {
  const data = snap.val();
  data.id = snap.key;
  renderMessage(data);
});

/* when a message removed, re-render list (simpler) */
messagesRef.on('child_removed', () => {
  messagesEl.innerHTML = '';
  messagesRef.limitToLast(100).once('value', snapshot => {
    snapshot.forEach(s => renderMessage({...s.val(), id: s.key}));
  });
});

/* presence: on connect set presence and remove on disconnect */
const myPresenceRef = presenceRef.push();
myPresenceRef.onDisconnect().remove();

/* join function */
function join(name) {
  displayName = name ? name.trim() : 'Guest';
  if (!displayName) displayName = 'Guest';
  localStorage.setItem('z_name', displayName);
  nameInput.value = displayName;
  promptEl.style.display = 'none';

  // set presence item
  myPresenceRef.set({ name: displayName, clientId, color: colors[Math.floor(Math.random()*colors.length)], ts: Date.now() });

  // listen to presence list
  presenceRef.on('value', snap => {
    const val = snap.val() || {};
    whoEl.innerHTML = '';
    const keys = Object.keys(val);
    onlineCountEl.textContent = keys.length + ' online';
    keys.forEach(k => {
      const p = val[k];
      const el = document.createElement('div');
      el.className = 'who-item';
      el.innerHTML = `<div class="who-color" style="background:${p.color||'#999'}"></div><div class="who-name">${escapeHtml(p.name)}</div>`;
      whoEl.appendChild(el);
    });
  });
}

/* send message */
function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  const payload = {
    name: displayName || 'Guest',
    text: text,
    time: Date.now(),
    clientId,
    color: colors[Math.floor(Math.random()*colors.length)]
  };
  // push message
  messagesRef.push(payload).then(() => {
    messageInput.value = '';
  }).catch(err => {
    console.error('Write failed', err);
  });
}

/* UI wiring */
joinBtn.addEventListener('click', () => {
  const name = promptName.value || 'Guest';
  join(name);
});
document.getElementById('joinBtn').addEventListener('keydown', e => e.key === 'Enter' && join(promptName.value));

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

/* If user reloaded and name exists, auto-join */
if (displayName) {
  promptEl.style.display = 'none';
  nameInput.value = displayName;
  join(displayName);
}

/* also set input name in controls when user joins via prompt */
nameInput.addEventListener('change', () => {
  displayName = nameInput.value || displayName;
  localStorage.setItem('z_name', displayName);
  myPresenceRef.set({ name: displayName, clientId, color: colors[Math.floor(Math.random()*colors.length)], ts: Date.now() });
});

/* remove prompt on outside click (optional) */
promptEl.addEventListener('click', (e) => {
  if (e.target === promptEl) promptEl.style.display = 'none';
});