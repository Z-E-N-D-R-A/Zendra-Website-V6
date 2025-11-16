/* ----------------------------------------------------------
   chat.js — Firebase Global Chat (Realtime DB + Anonymous Auth)
   Cleaned + fixes: defensive DOM lookups, header spacing, grouping fixes
---------------------------------------------------------- */

/* ===== FIREBASE CONFIG ===== */
const firebaseConfig = {
  apiKey: "AIzaSyAmI86EcG9Zvln4n4s39tcPNlCYfPjO16s",
  authDomain: "zentral-chat-b7ca0.firebaseapp.com",
  projectId: "zentral-chat-b7ca0",
  storageBucket: "zentral-chat-b7ca0.firebasestorage.app",
  messagingSenderId: "808973774382",
  appId: "1:808973774382:web:0320afd63bb326ebd839bf",
  measurementId: "G-F663TF4T6K",
  databaseURL: "https://zentral-chat-b7ca0-default-rtdb.firebaseio.com"
};
/* =============================================================== */

firebase.initializeApp(firebaseConfig);

/* ===== state + refs ===== */
const domCache = {}; // messageId → DOM element
const messages = {}; // id → data (cached)
const db = firebase.database();
const messagesRef = db.ref("messages");
const presenceRef = db.ref("presence");
const recoveryRef = db.ref("recovery");

let user = null;
let authReady = false;

/* ===================================================================
   QUEUE — prevent join/send from running BEFORE firebase auth is ready
==================================================================== */
let pendingJoin = null;      // { name, restoredInfo }
let pendingSend = false;     // boolean
let pendingRestore = null;   // code string

function tryProcessQueue() {
  if (!authReady || !user) return;

  if (pendingRestore) {
    const code = pendingRestore;
    pendingRestore = null;
    restoreWithCode(code);
  }

  if (pendingJoin) {
    const { name, restoredInfo } = pendingJoin;
    pendingJoin = null;
    join(name, restoredInfo);
  }

  if (pendingSend) {
    pendingSend = false;
    sendMessage();
  }
}

/* ================= START ANONYMOUS AUTH ================= */
firebase.auth().signInAnonymously().catch(console.error);

firebase.auth().onAuthStateChanged(u => {
  if (!u) return;
  user = u;
  authReady = true;
  console.log("Auth READY:", user.uid);

  if (displayName) pendingJoin = { name: displayName, restoredInfo: null };

  tryProcessQueue();
});

/* =============== LOCAL CLIENT DATA =============== */
let clientId = localStorage.getItem("z_clientId");
if (!clientId) {
  clientId = Math.random().toString(36).slice(2);
  localStorage.setItem("z_clientId", clientId);
}

let displayName = localStorage.getItem("z_name") || "";

/* =============== DOM HOOKS (defensive) =============== */
const promptEl = document.getElementById("prompt") || null;
const promptName = document.getElementById("promptName") || null;

const joinBtn = document.getElementById("joinBtn") || null;

let messageInput =
  document.getElementById("message") ||
  document.getElementById("messageInput") ||
  document.querySelector(".input-bar input") ||
  null;

const sendBtn = document.getElementById("sendBtn") || null;

const messagesEl = document.getElementById("messages");
const messagesViewport = messagesEl.parentElement;
const whoEl = document.getElementById("who") || null;
const onlineCountEl = document.getElementById("onlineCount") || null;

const recoveryInput = document.getElementById("recoveryInput") || null;
const restoreBtn = document.getElementById("restoreBtn") || null;

const recoveryDisplay = document.getElementById("recoveryDisplay") || null;
const recoveryCodeText = document.getElementById("recoveryCodeText") || null;
const copyRecoveryBtn = document.getElementById("copyRecoveryBtn") || null;

const loadOlderBtn = document.getElementById("loadOlderBtn");
const spinner = document.getElementById("spinner") || document.getElementById("loadingOlder") || null;
const newMsgIndicator = document.getElementById("newMsgIndicator") || null;

const isMobile = window.matchMedia("(max-width: 900px)").matches;
const sheet = document.getElementById("mobile-action-sheet");
const backdrop = document.getElementById("sheet-backdrop");

let currentMobileMsg = null;
let longPressTimeout = null;
let currentLongPressMsg = null;

let regroupTimer = null;
let userIsAtBottom = true;

const colors = ["#ffae00", "#f700ff", "#00b7ff", "#00ffb3", "#fbff00"];

/* ================= BEHAVIORS: scroll handling & indicator ================= */
messagesViewport.addEventListener("scroll", () => {
  const nearBottom = messagesViewport.scrollTop + messagesViewport.clientHeight >= messagesViewport.scrollHeight - 30;
  userIsAtBottom = nearBottom;
  if (nearBottom) hideNewMsgIndicator();
});

function showNewMsgIndicator() {
  if (newMsgIndicator) {
    newMsgIndicator.style.display = "block";
    newMsgIndicator.classList.remove("hidden");
  }
}

function hideNewMsgIndicator() {
  if (newMsgIndicator) {
    newMsgIndicator.classList.add("hidden");
    setTimeout(() => {
      if (newMsgIndicator.classList.contains("hidden"))
        newMsgIndicator.style.display = "none";
    }, 200);
  }
}

/* ================= UTILITIES: escape, timeAgo, date label ================= */
function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function timeAgo(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Now";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  return Math.floor(seconds / 86400) + "d ago";
}

function formatDateLabel(ts) {
  const d = new Date(ts);
  const now = new Date();

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const y = new Date();
  y.setDate(now.getDate() - 1);

  const isYesterday =
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/* Insert date separator BEFORE a given DOM element (for prepend) */
function insertDateSeparatorBefore(el, ts) {
  const label = formatDateLabel(ts);
  const prev = el.previousElementSibling;
  if (prev && prev.classList.contains("date-separator") && prev.dataset.label === label) return;
  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.dataset.label = label;
  sep.innerHTML = `<span class="date-line">${label}</span>`;
  messagesEl.insertBefore(sep, el);
}

/* Insert date separator AT THE END (for append) */
function insertDateSeparatorAtEnd(ts) {
  const label = formatDateLabel(ts);
  const last = messagesEl.lastElementChild;
  if (last && last.classList && last.classList.contains("date-separator") && last.dataset.label === label) return;
  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.dataset.label = label;
  sep.innerHTML = `<span class="date-line">${label}</span>`;
  messagesEl.appendChild(sep);
}

/* ================= GROUP LOGIC ================= */
function isSameGroup(a, b) {
  if (!a || !b) return false;
  return a.clientId === b.clientId && Math.abs(a.time - b.time) <= 120000;
}

function hideMeta(el) {
  const meta = el.querySelector(".meta");
  if (meta) meta.classList.add("hidden");
}
function showMeta(el) {
  const meta = el.querySelector(".meta");
  if (meta) meta.classList.remove("hidden");
}
function hideTime(el) {
  if (!el) return;
  const t = el.querySelector(".time");
  if (t) t.classList.add("hidden");
}
function showTime(el) {
  if (!el) return;
  const t = el.querySelector(".time");
  if (t) t.classList.remove("hidden");
}

/* ================= RENDER HELPERS ================= */
function createMessageElement(data) {
  const { id, name, text, time, clientId: cid, color, edited } = data;
  const isMe = cid === clientId;

  const el = document.createElement("div");
  el.className = `msg ${isMe ? "me" : "other"}`;
  el.dataset.id = id;

  el.innerHTML = `
    <div class="meta">
      <span class="name-dot" style="background:${color || "#888"}"></span>
      <strong style="margin-left:8px">${escapeHtml(name || "Guest")}</strong>
    </div>

    <div class="bubble">
      ${escapeHtml(text)}
      ${edited ? "<span class='edited'>(edited)</span>" : ""}
    </div>

    <div class="time">${timeAgo(time)}</div>

    <div class="actions">
      <div class="action-btn reply-btn" title="Reply">
        <div class="fa-solid fas fa-reply"></div>
      </div>
      <div class="action-btn menu-btn" title="More">
        <div class="fa-solid fa fa-ellipsis-h"></div>
      </div>
    </div>
    
    <div class="action-menu">
      <button class="edit-option">
        <span class="fa-solid fas fa-edit"></span> Edit
      </button>
      
      <button class="react-option">
        <span class="fa-solid far fa-grin-squint"></span> React
      </button>

      <button class="delete-option danger">
        <span class="fa-solid far fa-trash-alt"></span> Delete
      </button>

      <button class="report-option danger">
        <span class="fa-solid fas fa-exclamation-triangle"></span> Report
      </button>
    </div>`;

  attachLongPress(el);
  enableSwipeToReply(el);
  attachActionHandlers(el, id, data);
  requestAnimationFrame(() => positionActions(el));
  return el;
}

/* appendMessage: add to end of list, handle grouping and date separators */
function appendMessage(data) {
  if (!messagesEl) return null;
  const id = data.id;
  messages[id] = data;

  if (domCache[id]) {
    updateMessageElement(data);
    return domCache[id];
  }

  const lastReal = (() => {
    let el = messagesEl.lastElementChild;
    while (el && el.classList.contains("date-separator")) el = el.previousElementSibling;
    return el;
  })();

  if (!lastReal) {
    insertDateSeparatorAtEnd(data.time);
  } else {
    const lastId = lastReal.dataset?.id;
    if (lastId) {
      const lastData = messages[lastId];
      const lastLabel = formatDateLabel(lastData.time);
      const thisLabel = formatDateLabel(data.time);
      if (lastLabel !== thisLabel) insertDateSeparatorAtEnd(data.time);
    } else {
      insertDateSeparatorAtEnd(data.time);
    }
  }

  const el = createMessageElement(data);
  const prev = (() => {
    let x = messagesEl.lastElementChild;
    while (x && x.classList.contains("date-separator")) x = x.previousElementSibling;
    return x;
  })();

  if (prev && prev.dataset && prev.dataset.id) {
    const prevId = prev.dataset.id;
    const prevData = messages[prevId];

    if (isSameGroup(prevData, data)) {
      hideMeta(prev);
      hideTime(prev);
      hideMeta(el);
      showTime(el);
      el.classList.add("grouped");
    } else {
      showMeta(el);
      const nextIsSameGroup = prev && isSameGroup(prevData, data);

      if (nextIsSameGroup) {
        hideTime(el);
      } else {
        showTime(el);
      }
      el.classList.add("first-in-group");
    }
  } else {
    showMeta(el);
    showTime(el);
    el.classList.add("first-in-group");
  }

  messagesEl.appendChild(el);
  domCache[id] = el;
  attachActionHandlers(el, id, data);

  const isMe = data.clientId === clientId;
  if (isMe && messagesViewport) {
    hideNewMsgIndicator();
    messagesViewport.scrollTop = messagesViewport.scrollHeight;
  } else if (messagesViewport) {
    if (userIsAtBottom) {
      messagesViewport.scrollTop = messagesViewport.scrollHeight;
    } else {
      showNewMsgIndicator();
    }
  }
  return el;
}

/* update DOM element for existing msg */
function updateMessageElement(data) {
  const id = data.id;
  messages[id] = data;
  const el = domCache[id];
  if (!el) return;

  const bubble = el.querySelector(".bubble");
  if (bubble) {
    let html = escapeHtml(data.text);
    if (data.edited) {
      html += " <span class='edited'>(edited)</span>";
    }
    bubble.innerHTML = html;
  }

  const timeEl = el.querySelector(".time");
  if (timeEl) {
    timeEl.dataset.timestamp = data.time;
    if (!timeEl.classList.contains("hidden")) {
      timeEl.textContent = timeAgo(data.time);
    }
  }

  positionActions(el);
}

/* prependMessage — insert older messages at top (used by load older) */
function prependMessage(data) {
  if (!messagesEl) return null;
  const id = data.id;
  messages[id] = data;
  if (domCache[id]) return domCache[id];

  const firstReal = (() => {
    let el = messagesEl.firstElementChild;
    while (el && el.classList.contains("date-separator")) el = el.nextElementSibling;
    return el;
  })();

  if (firstReal) {
    const firstId = firstReal.dataset?.id;
    if (firstId) {
      const firstData = messages[firstId];
      if (formatDateLabel(firstData.time) !== formatDateLabel(data.time)) {
        insertDateSeparatorBefore(firstReal, data.time);
      }
    } else {
      insertDateSeparatorBefore(firstReal, data.time);
    }
  } else {
    insertDateSeparatorAtEnd(data.time);
  }

  const el = createMessageElement(data);
  messagesEl.insertBefore(el, messagesEl.firstChild);
  domCache[id] = el;
  attachActionHandlers(el, id, data);

  let next = el.nextElementSibling;
  while (next && next.classList.contains("date-separator")) next = next.nextElementSibling;

  if (next && next.dataset && next.dataset.id) {
    const nextId = next.dataset.id;
    const nextData = messages[nextId];

    if (isSameGroup(data, nextData)) {
      showMeta(el);
      hideTime(el);
      hideMeta(next);
      hideTime(next);
      el.classList.add("first-in-group");
      next.classList.add("grouped");
    } else {
      el.classList.add("first-in-group");
      showMeta(el);
      const sameGroup = isSameGroup(data, nextData);
      if (sameGroup) {
        hideTime(el);
      } else {
        showTime(el);
      }
    }
  }
  else {
    el.classList.add("first-in-group");
    showMeta(el);
    showTime(el);
  }
  return el;
}

function attachActionHandlers(el, id, data) {
  const menuBtn = el.querySelector(".menu-btn");
  const menu = el.querySelector(".action-menu");
  const replyBtn = el.querySelector(".reply-btn");

  const editBtn = menu.querySelector(".edit-option");
  const reactBtn = menu.querySelector(".react-option");
  const deleteBtn = menu.querySelector(".delete-option");
  const reportBtn = menu.querySelector(".report-option");

  const isMe = data.clientId === clientId;

  function positionMenu() {
    menu.style.top = "";
    menu.style.bottom = "";
    menu.style.left = "";
    menu.style.right = "";

    const btnRect = menuBtn.getBoundingClientRect();
    const msgRect = el.getBoundingClientRect();

    const chatArea = document.querySelector(".chat-area");
    const chatRect = chatArea.getBoundingClientRect();

    const visibleMidY = chatRect.top + chatRect.height / 2;
    const visibleMidX = chatRect.left + chatRect.width / 2;

    const openAbove = btnRect.top > visibleMidY;
    const openOnLeft = btnRect.left > visibleMidX;

    const offsetTop = btnRect.top - msgRect.top;
    const offsetBottom = msgRect.bottom - btnRect.bottom;
    const offsetRight = msgRect.right - btnRect.right;
    const offsetLeft = btnRect.left - msgRect.left;

    if (openAbove) {
      menu.style.bottom = (offsetBottom + btnRect.height + 6) + "px";
    } else {
      menu.style.top = (offsetTop + btnRect.height + 6) + "px";
    }

    if (openOnLeft) {
      menu.style.right = offsetRight + "px";
    } else {
      menu.style.left = offsetLeft + "px";
    }
  }

  menuBtn.onclick = (e) => {
    e.stopPropagation();

    // 🔥 CLOSE ALL OTHER MENUS FIRST
    closeAllMenus();

    // Toggle this one
    menu.classList.toggle("open");

    if (menu.classList.contains("open")) {
      positionMenu();
    }
  };

  replyBtn.onclick = () => {
    closeMenu(menu);
  };

  if (isMe) {
    editBtn.onclick = () => {
      beginEditMessage(id);
      closeMenu(menu);
    };
  } else {
    editBtn.style.display = "none";
  }

  reactBtn.onclick = () => {
    console.log("React clicked for ID:", id);
    closeMenu(menu);
  };

  if (isMe) {
    deleteBtn.onclick = () => {
      messagesRef.child(id).remove().catch(console.error);
      closeMenu(menu);
    };
  } else {
    deleteBtn.style.display = "none";
  }

  reportBtn.onclick = () => {
    console.log("Reported:", id);
    closeMenu(menu);
  };
}

function closeMenu(menu) {
  if (menu) menu.classList.remove("open");
}

function closeAllMenus() {
  document.querySelectorAll(".action-menu.open")
    .forEach(m => m.classList.remove("open"));
}

document.addEventListener("click", (e) => {
  const clickedMenuBtn = e.target.closest(".menu-btn");
  const clickedMenu = e.target.closest(".action-menu");
  if (clickedMenuBtn || clickedMenu) return;
  closeAllMenus();
});

/* ================= LOAD MESSAGES / INFINITE SCROLL ================= */
let oldestLoadedKey = null;
let isLoadingMore = false;

if (messagesViewport) {
  messagesViewport.addEventListener("scroll", async () => {
    const box = messagesViewport;
    if (box.scrollTop > 100) return;
    if (isLoadingMore) return;
    if (!oldestLoadedKey) return;

    isLoadingMore = true;
    if (spinner) spinner.style.display = "block";

    try {
      const snap = await messagesRef.orderByKey().endBefore(oldestLoadedKey).limitToLast(50).once("value");
      if (!snap.exists()) {
        if (loadOlderBtn) loadOlderBtn.style.display = "none";
        if (spinner) spinner.style.display = "none";
        isLoadingMore = false;
        return;
      }

      const arr = [];
      snap.forEach(s => arr.push({ ...s.val(), id: s.key }));

      const oldHeight = messagesViewport.scrollHeight;

      for (let i = 0; i < arr.length; i++) {
        const m = arr[i];
        prependMessage(m);
      }

      oldestLoadedKey = arr[0].id;
      const newHeight = messagesViewport.scrollHeight;
      messagesViewport.scrollTop = newHeight - oldHeight;
    } catch (err) {
      console.error("Load older messages failed:", err);
    } finally {
      if (spinner) spinner.style.display = "none";
      updateLoadOlderVisibility();
      isLoadingMore = false;
    }
  });
}

async function loadOlderMessages() {
  if (isLoadingMore || !oldestLoadedKey) return;
  if (messagesViewport) messagesViewport.scrollTop = 0;
  isLoadingMore = true;
  if (loadOlderBtn) loadOlderBtn.style.display = "none";
  if (spinner) spinner.style.display = "block";

  try {
    const snap = await messagesRef.orderByKey().endBefore(oldestLoadedKey).limitToLast(50).once("value");
    if (!snap.exists()) {
      if (loadOlderBtn) loadOlderBtn.style.display = "none";
      if (spinner) spinner.style.display = "none";
      isLoadingMore = false;
      return;
    }

    const arr = [];
    snap.forEach(s => arr.push({ ...s.val(), id: s.key }));

    const filtered = arr.filter(x => x.id !== oldestLoadedKey);
    if (filtered.length === 0) {
      if (loadOlderBtn) loadOlderBtn.style.display = "none";
      if (spinner) spinner.style.display = "none";
      isLoadingMore = false;
      return;
    }

    filtered.forEach(m => prependMessage(m));
    oldestLoadedKey = filtered[0].id;
  } catch (err) {
    console.error("loadOlderMessages error:", err);
  } finally {
    if (spinner) spinner.style.display = "none";
    updateLoadOlderVisibility();
    isLoadingMore = false;
  }
}

function updateLoadOlderVisibility() {
  if (!oldestLoadedKey) return;

  messagesRef.limitToFirst(1).once("value", snap => {
    if (!snap.exists()) return;

    const veryFirstKey = Object.keys(snap.val())[0];

    if (oldestLoadedKey <= veryFirstKey) {
      loadOlderBtn.style.display = "none";
    } 
    else {
      loadOlderBtn.style.display = "block";
    }
  });
}

/* ================= SEND / EDIT MESSAGE ================= */
let editingId = null;
let originalText = "";

function beginEditMessage(id) {
  editingId = id;
  originalText = messages[id]?.text || "";

  if (!messageInput) {
    messageInput =
      document.getElementById("message") ||
      document.getElementById("messageInput") ||
      document.querySelector(".input-bar input");
  }

  messageInput.value = originalText;
  messageInput.focus();

  sendBtn.textContent = "Save Edit";

  if (!document.getElementById("cancelEditBtn")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelEditBtn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "cancel-edit-btn";
    cancelBtn.style.marginLeft = "8px";
    cancelBtn.onclick = cancelEdit;

    sendBtn.insertAdjacentElement("afterend", cancelBtn);
  }
}

function finishEditMessage() {
  if (!messageInput) return cancelEdit();

  const newText = messageInput.value.trim();
  if (!newText || !editingId) return cancelEdit();

  if (newText === originalText) {
    cancelEdit();
    return;
  }

  messagesRef.child(editingId).update({
    text: newText,
    edited: true
  }).catch(console.error);

  cancelEdit();
}

function cancelEdit() {
  editingId = null;
  originalText = "";

  if (messageInput) messageInput.value = "";
  if (sendBtn) sendBtn.textContent = "Send";

  const cancelBtn = document.getElementById("cancelEditBtn");
  if (cancelBtn) cancelBtn.remove();
}

function sendMessage() {
  if (!authReady || !user) {
    pendingSend = true;
    return;
  }

  if (!messageInput) {
    messageInput =
      document.getElementById("message") ||
      document.getElementById("messageInput") ||
      document.querySelector(".input-bar input") ||
      null;
    if (!messageInput) {
      return alert("Message input not available.");
    }
  }

  const text = messageInput.value.trim();
  if (!text) return;


  if (editingId) {
    finishEditMessage();
    return;
  }

  const newMsg = {
    uid: user.uid,
    name: displayName,
    text,
    time: Date.now(),
    clientId,
    color: colors[Math.floor(Math.random() * colors.length)]
  };

  const newRef = messagesRef.push();
  newMsg.id = newRef.key;

  newRef
    .set(newMsg)
    .catch(err => {
      console.error("Failed to send message:", err);
      alert("Failed to send — check console.");
    });

  messageInput.value = "";
}

/* ================= FIREBASE LISTENERS: initial load + live updates ================= */
messagesRef.orderByKey().limitToLast(150).on("child_added", snap => {
  const msg = snap.val();
  const id = snap.key;
  if (!oldestLoadedKey) oldestLoadedKey = id;
  messages[id] = { ...msg, id };
  appendMessage(messages[id]);
  const isMe = msg.clientId === clientId;
  updateLoadOlderVisibility();
  if (!userIsAtBottom && !isMe) showNewMsgIndicator();
});

messagesRef.on("child_changed", snap => {
  const msg = snap.val();
  const id = snap.key;
  messages[id] = { ...msg, id };

  if (domCache[id]) {
    updateMessageElement(messages[id]);
    positionActions(domCache[id]);
  }
});

messagesRef.on("child_removed", snap => {
  const id = snap.key;
  const el = domCache[id];
  if (!el) return;

  el.remove();
  delete domCache[id];
  delete messages[id];

  scheduleRegroup();
});

function scheduleRegroup() {
  if (regroupTimer) clearTimeout(regroupTimer);
  regroupTimer = setTimeout(() => {
    regroupMessages();
    regroupTimer = null;
  }, 50);
}

function regroupMessages() {
  const all = [...messagesViewport.querySelectorAll(".msg")];
  for (let i = 0; i < all.length; i++) {
    const cur = all[i];
    const prev = all[i - 1] || null;
    const next = all[i + 1] || null;

    const curMsg = messages[cur.dataset.id];
    const prevMsg = prev ? messages[prev.dataset.id] : null;
    const nextMsg = next ? messages[next.dataset.id] : null;

    cur.classList.remove("first-in-group", "grouped", "last-in-group");
    const sameAsPrev = prevMsg && isSameGroup(prevMsg, curMsg);
    const sameAsNext = nextMsg && isSameGroup(curMsg, nextMsg);

    if (!sameAsPrev) {
      cur.classList.add("first-in-group");
      showMeta(cur);
      hideTime(cur);
    } else {
      cur.classList.add("grouped");
      hideMeta(cur);
    }

    if (!sameAsNext) {
      cur.classList.add("last-in-group");
      showTime(cur);
    } else {
      hideTime(cur);
    }
  }
}

/* ================= PRESENCE / RECOVERY ================= */
let myPresenceRef = null;
function initPresence(color, name) {
  try {
    myPresenceRef = presenceRef.push();
    myPresenceRef.onDisconnect().remove();

    return myPresenceRef
      .set({
        uid: user.uid,
        name: name || "Guest",
        clientId,
        color,
        ts: Date.now()
      })
      .catch(err => console.warn("Presence failed:", err));
  } catch (err) {
    console.warn("initPresence failed:", err);
  }
}

function generateRecoveryCode(len = 8) {
  const CH = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += CH[Math.floor(Math.random() * CH.length)];
  return out;
}

async function saveRecoveryRecord(code, payload) {
  try {
    await recoveryRef.child(code).set(payload);
    localStorage.setItem("z_recovery", JSON.stringify({ code, payload }));
  } catch (err) {
    console.error("Recovery save failed:", err);
  }
}

function showRecoveryCodeUI(code) {
  if (recoveryCodeText) recoveryCodeText.textContent = code;
  if (recoveryDisplay) recoveryDisplay.style.display = "flex";
}

function join(name, restoredInfo = null) {
  if (!authReady || !user) {
    pendingJoin = { name, restoredInfo };
    return;
  }

  displayName = (name || "").trim() || "Guest";
  localStorage.setItem("z_name", displayName);
  if (promptEl) promptEl.style.display = "none";

  const myColor = restoredInfo?.color || colors[Math.floor(Math.random() * colors.length)];
  initPresence(myColor, displayName);

  let lastPresenceUpdate = 0;
  presenceRef.on("value", snap => {
    const now = Date.now();
    if (now - lastPresenceUpdate < 1000) return;
    lastPresenceUpdate = now;

    const list = snap.val() || {};
    if (whoEl) whoEl.innerHTML = "";
    if (onlineCountEl) onlineCountEl.textContent = Object.keys(list).length + " online";

    Object.values(list).forEach(p => {
      if (!whoEl) return;
      const el = document.createElement("div");
      el.className = "who-item";
      el.innerHTML = `<div class="who-color" style="background:${p.color}"></div><div class="who-name">${escapeHtml(p.name)}</div>`;
      whoEl.appendChild(el);
    });
  });

  const existing = localStorage.getItem("z_recovery");
  if (existing) {
    const obj = JSON.parse(existing);
    if (obj.payload.clientId === clientId) {
      showRecoveryCodeUI(obj.code);
      return;
    }
  }

  const code = generateRecoveryCode(8);
  const payload = { clientId, name: displayName, color: myColor, ts: Date.now() };
  saveRecoveryRecord(code, payload);
  showRecoveryCodeUI(code);
}

firebase.auth().onAuthStateChanged(u => {
  console.log("Auth state changed:", u);
});

async function restoreWithCode(code) {
  code = (code || "").trim().toUpperCase();
  if (!code) return alert("Enter recovery code.");
  if (!authReady) {
    pendingRestore = code;
    return;
  }

  const snap = await recoveryRef.child(code).once("value");
  if (!snap.exists()) return alert("Invalid recovery code.");

  const data = snap.val();
  clientId = data.clientId;
  displayName = data.name;

  localStorage.setItem("z_clientId", clientId);
  localStorage.setItem("z_name", displayName);
  localStorage.setItem("z_recovery", JSON.stringify({ code, payload: data }));

  join(displayName, data);

  if (messagesEl) messagesEl.innerHTML = "";
  Object.keys(domCache).forEach(k => delete domCache[k]);
  Object.keys(messages).forEach(k => delete messages[k]);

  messagesRef.limitToLast(100).once("value", s => {
    s.forEach(p => {
      const d = { ...p.val(), id: p.key };
      appendMessage(d);
      if (!oldestLoadedKey) oldestLoadedKey = p.key;
    });
  });
}

/* UI events (defensive) */
joinBtn && (joinBtn.onclick = () => {
  const n = promptName.value || displayName || "Guest";
  join(n);
});

if (restoreBtn) {
  restoreBtn.onclick = () => {
    const c = recoveryInput ? recoveryInput.value : "";
    restoreWithCode(c);
  };
}
if (recoveryInput) {
  recoveryInput.onkeydown = e => {
    if (e.key === "Enter") restoreWithCode(recoveryInput.value);
  };
}
if (copyRecoveryBtn) {
  copyRecoveryBtn.onclick = () => {
    if (recoveryCodeText) navigator.clipboard.writeText(recoveryCodeText.textContent || "");
  };
}

if (sendBtn) sendBtn.onclick = () => sendMessage();
if (messageInput) {
  messageInput.onkeydown = e => {
    if (e.key === "Enter") sendMessage();
  };
}
if (newMsgIndicator) {
  newMsgIndicator.onclick = () => {
    hideNewMsgIndicator();
    if (messagesViewport) messagesViewport.scrollTop = messagesViewport.scrollHeight;
  };
}

function attachLongPress(msgEl) {
  if (!msgEl) return;

  let pressTimer;

  const start = (e) => {
    pressTimer = setTimeout(() => {
      openMobileSheet(msgEl);
    }, 500);
  };

  const cancel = () => clearTimeout(pressTimer);

  msgEl.addEventListener("touchstart", start);
  msgEl.addEventListener("touchend", cancel);
  msgEl.addEventListener("touchmove", cancel);
  msgEl.addEventListener("touchcancel", cancel);

  msgEl.addEventListener("mousedown", start);
  msgEl.addEventListener("mouseup", cancel);
  msgEl.addEventListener("mouseleave", cancel);
}

function openMobileSheet(msgEl) {
  currentMobileMsg = msgEl;

  const sheet = document.getElementById("mobile-action-sheet");
  const backdrop = document.getElementById("sheet-backdrop");

  sheet.classList.add("open");
  backdrop.classList.add("show");
}

function closeMobileSheet() {
  const sheet = document.getElementById("mobile-action-sheet");
  const backdrop = document.getElementById("sheet-backdrop");

  sheet.classList.remove("open");
  backdrop.classList.remove("show");

  currentMobileMsg = null;
}

backdrop.addEventListener("click", closeMobileSheet);

document.getElementById("sheet-backdrop").addEventListener("click", () => {
  closeMobileSheet();
});

document.querySelectorAll(".sheet-option").forEach(opt => {
  opt.addEventListener("click", () => {
    const action = opt.dataset.action;
    if (currentMobileMsg) {
      handleMobileAction(action, currentMobileMsg);
    }
  });
});

document.querySelector(".sheet-cancel").addEventListener("click", () => {
  closeMobileSheet();
});

function handleMobileAction(action, msgEl) {
  const id = msgEl.dataset.id;
  const msgData = messages[id];
  const isMe = msgData.clientId === clientId;

  switch (action) {
    case "reply":
      console.log("Reply clicked for", id);
      startReply(msgEl);
      closeMobileSheet();
      break;

    case "edit":
      if (isMe) {
        beginEditMessage(id);
      }
      closeMobileSheet();
      break;

    case "react":
      startReact(msgEl);
      closeMobileSheet();
      break;

    case "delete":
      if (isMe) {
        messagesRef.child(id).remove().catch(console.error);
      }
      closeMobileSheet();
      break;

    case "report":
      console.log("Reported:", id);
      closeMobileSheet();
      break;
  }
}

function enableSwipeToReply(msgEl) {
  let startX = 0;
  let swiping = false;

  msgEl.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    swiping = true;
  });

  msgEl.addEventListener("touchmove", e => {
    if (!swiping) return;
    const deltaX = e.touches[0].clientX - startX;

    // user swiped right >35px
    if (deltaX > 35) {
      swiping = false;
      startReply(msgEl);
    }
  });

  msgEl.addEventListener("touchend", () => {
    swiping = false;
  });
}

function positionActions(msgEl) {
  const bubble = msgEl.querySelector(".bubble");
  const actions = msgEl.querySelector(".actions");
  if (!bubble || !actions) return;

  const bubbleRect = bubble.getBoundingClientRect();
  const msgRect = msgEl.getBoundingClientRect();
  const centerY = bubbleRect.top + bubbleRect.height / 2 - msgRect.top;

  actions.style.top = centerY + "px";
  actions.style.transform = "translateY(-50%)";

  const bubbleWidth = bubble.offsetWidth;
  if (msgEl.classList.contains("me")) {
    actions.style.right = (bubbleWidth + 10) + "px";
    actions.style.left = "auto";
  } else {
    actions.style.left = (bubbleWidth + 10) + "px";
    actions.style.right = "auto";
  }
}

window.addEventListener("resize", updateAllActionPositions);
function updateAllActionPositions() {
  document.querySelectorAll(".msg").forEach(positionActions);
}

setInterval(() => {
  const timeEls = Array.from(document.querySelectorAll(".time"));
  const last = timeEls.slice(-120);
  for (const el of last) {
    const ts = Number(el.dataset.timestamp);
    if (!ts) continue;
    if (!el.classList.contains("hidden")) el.textContent = timeAgo(ts);
  }
}, 30000);