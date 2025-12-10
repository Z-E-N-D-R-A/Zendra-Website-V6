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

firebase.initializeApp(firebaseConfig);
const domCache = {};
const messages = {};
const db = firebase.database();
const messagesRef = db.ref("messages");
const presenceRef = db.ref("presence");
const usersRef = db.ref("users");

let user = null;
let authReady = false;
let pendingJoin = null;
let pendingSend = false;
let pendingRestore = null;
let accountId = localStorage.getItem("z_accountId") || null;

function tryProcessQueue() {
  if (!authReady || !user) return;

  if (pendingRestore) {
    const code = pendingRestore;
    pendingRestore = null;
    restoreWithCode(code).catch(err => console.error("[QUEUE] restoreWithCode failed:", err));
  }

  if (pendingJoin && !pendingJoin.restoredInfo) {
    const { name, restoredInfo } = pendingJoin;
    pendingJoin = null;
    join(name, restoredInfo).catch(err => console.error("[QUEUE] join failed:", err));
  }

  if (pendingSend) {
    pendingSend = false;
    sendMessage();
  }
}

/* ================= START ANONYMOUS AUTH ================= */
firebase.auth().signInAnonymously().catch(err => {
  console.error("[AUTH] signInAnonymously error:", err);
});

firebase.auth().onAuthStateChanged(u => {
  console.log("[AUTH] onAuthStateChanged triggered (user param:", u && u.uid + ")");
  if (!u) {
    console.warn("[AUTH] onAuthStateChanged: no user");
    return;
  }

  user = u;
  authReady = true;

  const saved = localStorage.getItem("z_accountId");

  if (saved) {
    accountId = saved;
    console.log("[AUTH] accessed localStorage (accountId: " + accountId + ")");
  } else {
    accountId = user.uid;
    localStorage.setItem("z_accountId", accountId);
    console.log("[AUTH] no saved accountId (anonymous uid: " + accountId + ")");
  }

  if (displayName) {
    pendingJoin = { name: displayName, restoredInfo: null };
  }

  tryProcessQueue();
});

/* =============== LOCAL CLIENT DATA =============== */
let clientId = localStorage.getItem("z_clientId");
if (!clientId) {
  clientId = Math.random().toString(36).slice(2);
  localStorage.setItem("z_clientId", clientId);
}

let displayName = localStorage.getItem("z_name") || "";

/* =============== DOM HOOKS =============== */
const promptEl = document.getElementById("prompt") || null;
const promptName = document.getElementById("promptName") || null;
const joinBtn = document.getElementById("joinBtn") || null;

let messageInput = document.getElementById("message") || document.getElementById("messageInput") || document.querySelector(".input-bar input") || null;

const messagesEl = document.getElementById("messages");
const messagesViewport = messagesEl.parentElement;
const sendBtn = document.getElementById("sendBtn") || null;

const recoveryInput = document.getElementById("recoveryInput") || null;
const restoreBtn = document.getElementById("restoreBtn") || null;

const loadOlderBtn = document.getElementById("loadOlderBtn");
const spinner = document.getElementById("spinner") || document.getElementById("loadingOlder") || null;
const newMsgIndicator = document.getElementById("newMsgIndicator") || null;

const whoEl = document.getElementById("who") || null;
const onlineCountEl = document.getElementById("onlineCount") || null;


const sheet = document.getElementById("mobile-action-sheet");
const actionBackdrop = document.getElementById("sheet-backdrop");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");

const picker = document.getElementById("reaction-picker");
const tooltip = document.getElementById("reaction-tooltip");

let replyToId = null;
let pickerTarget = null;
let currentMobileMsg = null;

let pressTimer = null;
let resizeTimer = null;
let regroupTimer = null;
let tooltipTimer = null;
let tooltipPressTimer = null;

let userIsAtBottom = true;
let hasScrolledSinceTouch = false;
let suppressNextActionMenu = false;
let pressStartBadge = null;

let allUsers = {};
firebase.database().ref("users").on("value", snap => {
  allUsers = snap.val() || {};
});

const typingRef = firebase.database().ref("users");
typingRef.on("value", snap => {
  const typingStates = snap.val() || {};
  updateTypingIndicator(typingStates);
});

function isMobile() {
  return window.matchMedia("(max-width: 900px)").matches;
}

let badgePress = { timer: null, startedAt: 0, badge: null, long: false };
const colors = ["#ffae00", "#f700ff", "#00b7ff", "#00ffb3", "#fbff00"];

/* ================= UTILITIES: escape, timeAgo, date label ================= */
function formatMessageText(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

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

function createDateSeparator(label) {
  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.dataset.label = label;
  sep.innerHTML = `<span class="date-line">${label}</span>`;
  return sep;
}

function ensureDateSeparatorBefore(msgEl, timestamp) {
  if (!messagesEl || !msgEl) return;
  const label = formatDateLabel(timestamp);
  const existing = messagesEl.querySelector(`.date-separator[data-label="${label}"]`);

  const children = [...messagesEl.children];
  let firstOfLabel = null;
  for (let child of children) {
    if (child.classList.contains("date-separator")) continue;
    const cid = child.dataset.id;
    if (!cid) continue;
    const m = messages[cid];
    if (!m) continue;
    if (formatDateLabel(m.time) === label) { firstOfLabel = child; break; }
  }

  if (firstOfLabel) {
    if (existing) {
      if (existing.nextElementSibling !== firstOfLabel) {
        messagesEl.insertBefore(existing, firstOfLabel);
      }
      return;
    } else {
      const sep = createDateSeparator(label);
      messagesEl.insertBefore(sep, firstOfLabel);
      return;
    }
  } else {
    if (existing) {
      messagesEl.insertBefore(existing, msgEl);
      return;
    } else {
      const sep = createDateSeparator(label);
      messagesEl.insertBefore(sep, msgEl);
      return;
    }
  }
}

/* ================= RENDER HELPERS ================= */
function createMessageElement(data) {
  const { id, name, text, time, senderId, color, edited } = data;
  const isMe = senderId === accountId;

  const el = document.createElement("div");
  el.className = `msg ${isMe ? "me" : "other"}`;
  el.dataset.id = id;
  el.id = "msg-" + id;

  el.innerHTML = `
    <div class="meta">
      <strong>${escapeHtml(name || "Guest")}</strong>
    </div>

    <div class="side-dot" style="background:${color || "#888"}"></div>

    <div class="bubble">
      ${renderReplyPreview(data)}
      ${formatMessageText(text)}
      ${edited ? "<span class='edited'>(edited)</span>" : ""}
    </div>

    <div class="reaction-badges"></div>
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

  requestAnimationFrame(() => {
    const bubble = el.querySelector(".bubble");
    adjustBubbleAlignment(bubble);
  });

  renderReactions(el, data);
  attachActionHandlers(el, id, data);

  attachLongPress(el);
  enableSwipeToReply(el);

  requestAnimationFrame(() => positionActions(el));
  requestAnimationFrame(() => positionIcons(el));
  return el;
}

function updateMessageElement(data) {
  const id = data.id;
  messages[id] = data;
  const el = domCache[id];
  if (!el) return;

  const bubble = el.querySelector(".bubble");
  if (bubble) {
    const replyHtml = renderReplyPreview(data);

    let textHtml = escapeHtml(data.text);
    if (data.edited) {
      textHtml += " <span class='edited'>(edited)</span>";
    }
    bubble.innerHTML = replyHtml + textHtml;

    activateReplyJump(el);
    renderReactions(el, data);
  }

  const timeEl = el.querySelector(".time");
  if (timeEl) {
    timeEl.dataset.timestamp = data.time;
    if (!timeEl.classList.contains("hidden")) {
      timeEl.textContent = timeAgo(data.time);
    }
  }

  adjustBubbleAlignment(bubble);

  positionActions(el);
  positionIcons(el);
}

function appendMessage(data) {
  if (!messagesEl) return null;
  const id = data.id;
  messages[id] = data;

  if (domCache[id]) {
    updateMessageElement(data);
    return domCache[id];
  }

  const el = createMessageElement(data);
  activateReplyJump(el);
  refreshAllReplyPreviews();
  renderReactions(el, data);
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
      hideSideDot(prev);

      hideMeta(el);
      showTime(el);
      showSideDot(el);
      el.classList.add("grouped");
    } else {
      showMeta(el);
      const nextIsSameGroup = prev && isSameGroup(prevData, data);

      if (nextIsSameGroup) {
        hideTime(el);
        hideSideDot(el);
      } else {
        showTime(el);
        showSideDot(el);
      }
      el.classList.add("first-in-group");
    }
  } else {
    showMeta(el);
    showTime(el);
    showSideDot(el);
    el.classList.add("first-in-group");
  }

  insertMessage(el, data.time);
  ensureDateSeparatorBefore(el, data.time);

  activateReplyJump(el);
  refreshAllReplyPreviews();
  domCache[id] = el;
  attachActionHandlers(el, id, data);

  const isMe = data.senderId === accountId;
  // if (suppressNewIndicator) { return el; }
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
}

function prependMessage(data) {
  if (!messagesEl) return null;
  const id = data.id;
  messages[id] = data;
  if (domCache[id]) return domCache[id];

  const el = createMessageElement(data);
  activateReplyJump(el);
  renderReactions(el, data);

  messagesEl.insertBefore(el, messagesEl.firstChild);
  ensureDateSeparatorBefore(el, data.time);

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
      hideSideDot(el);

      hideMeta(next);
      hideTime(next);
      hideSideDot(next);
      el.classList.add("first-in-group");
      next.classList.add("grouped");
    } else {
      el.classList.add("first-in-group");
      showMeta(el);
      const sameGroup = isSameGroup(data, nextData);
      if (sameGroup) {
        hideTime(el);
        hideSideDot(el);
      } else {
        showTime(el);
        showSideDot(el);
      }
    }
  }
  else {
    el.classList.add("first-in-group");
    showMeta(el);
    showTime(el);
    showSideDot(el);
  }
  return el;
}

function insertMessage(msgEl, timestamp) {
  const children = [...messagesEl.children];
  for (let child of children) {
    if (child.classList.contains("date-separator")) continue;

    const childId = child.dataset.id;
    if (!childId) continue;

    const childData = messages[childId];
    if (!childData) continue;

    if (childData.time > timestamp) {
      messagesEl.insertBefore(msgEl, child);
      return;
    }
  }
  messagesEl.appendChild(msgEl);
}

/* ================= SEND / EDIT MESSAGE ================= */
let editingId = null;
let originalText = "";
let typingTimeout = null;

if (sendBtn) sendBtn.onclick = () => sendMessage();
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
      console.error("[ERROR] Message Input:", err);
      return;
    }
  }

  const text = messageInput.value.trim();
  if (!text) return;
  if (editingId) {
    finishEditMessage();
    return;
  }

  const newMsg = {
    senderId: accountId,
    text,
    time: Date.now(),
    edited: false,
    replyToId: replyToId || null
  };

  const newRef = messagesRef.push();
  newMsg.id = newRef.key;
  
  replyToId = null;
  document.getElementById("reply-bar").classList.add("hidden");
  sendTypingStatus(false);

  newRef.set(newMsg).catch(err => console.error("[ERROR] Sending Message:", err));
  messageInput.value = "";

  const u = usersRef.child(accountId);
  u.transaction(data => {
    if (!data) return data;

    if (!data.level) data.level = { exp: 0, messageCount: 0 };

    data.level.messageCount = (data.level.messageCount || 0) + 1;
    data.level.exp = (data.level.exp || 0) + 5;

    if (data.level.exp >= 100) {
      data.level.exp = 0;
      data.level.level = (data.level.level || 1) + 1;
    }

    return data;
  });
}

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

function triggerReplySwipe(msgEl, deltaX) {
  msgEl.style.transition = "transform 0.25s ease";
  msgEl.style.transform = `translateX(${deltaX > 0 ? 35 : -35}px)`;

  setTimeout(() => {
    msgEl.style.transform = "";
    msgEl.style.transition = "";
  }, 250);

  startReply(msgEl);
}

function startReply(msgEl) {
  const id = msgEl.dataset.id;
  const msg = messages[id];
  if (!msg) return;
  replyToId = id;

  document.getElementById("reply-name").textContent = msg.name;
  document.getElementById("reply-text").textContent = msg.text;
  document.getElementById("reply-bar").classList.remove("hidden");

  messageInput.focus();
}

function renderReplyPreview(msg) {
  if (!msg.replyToId) return "";
  const original = messages[msg.replyToId];
  if (!original || !original.text || !original.name) {
    return `<div class="reply-bubble loading"></div>`;
  }

  return `
  <div class="reply-bubble" data-reply-jump="${msg.replyToId}">
    <strong>${escapeHtml(original.name)}</strong>
    <div class="reply-snippet">
      ${escapeHtml(original.text.slice(0, 80))}${original.edited ? " (edited)" : ""}
    </div>
  </div>`;
}

function refreshAllReplyPreviews() {
  document.querySelectorAll(".msg").forEach(msgEl => {
    const id = msgEl.dataset.id;
    const msg = messages[id];
    if (!msg || !msg.replyToId) return;

    const original = messages[msg.replyToId];
    const bubble = msgEl.querySelector(".reply-bubble");
    if (bubble && original) {
      bubble.innerHTML = `
        <strong>${escapeHtml(original.name)}</strong>
        <div class="reply-snippet">
          ${escapeHtml(original.text.slice(0, 80))}${original.edited ? " (edited)" : ""}
        </div>
      `;
    }
  });
}

function activateReplyJump(msgEl) {
  const bubble = msgEl.querySelector(".reply-bubble");
  if (!bubble) return;

  bubble.onclick = () => {
    const targetId = bubble.dataset.replyJump;
    if (!targetId) return;

    const targetEl = document.getElementById("msg-" + targetId);
    if (!targetEl) return;

    targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };
}

function sendTypingStatus(isTyping) {
  const ref = firebase.database().ref("users/" + accountId + "/typing");
  ref.set({
    typing: isTyping,
    ts: Date.now()
  });
}

function updateTypingIndicator(typingStates) {
  const el = document.getElementById("typingIndicator");

  const typingUsers = Object.values(typingStates)
    .filter(u => u.typing && u.typing.typing)
    .filter(u => u.typing.ts > Date.now() - 4000)
    .filter(u => u.username !== displayName);
  
  if (typingUsers.length === 0) {
    el.classList.remove("show");
    return;
  }

  let text = "";
  if (typingUsers.length === 1)
    text = `${typingUsers[0].username} is typing`;
  else
    text = `${typingUsers.length} people are typing`;

  el.innerHTML = `
    <span>${text}</span>
    <div class="typing-dots"><span></span><span></span><span></span></div>
  `;
  el.classList.add("show");
}

messageInput.addEventListener("input", () => {
  sendTypingStatus(true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendTypingStatus(false);
  }, 1500);
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

if (newMsgIndicator) {
  newMsgIndicator.onclick = () => {
    hideNewMsgIndicator();
    if (messagesViewport) messagesViewport.scrollTop = messagesViewport.scrollHeight;
  };
}

document.getElementById("cancel-reply").onclick = () => {
  replyToId = null;
  document.getElementById("reply-bar").classList.add("hidden");
};

/* ================= FIREBASE LISTENERS: initial load + live updates ================= */
(async function initMessageLoading() {
  await new Promise(res => setTimeout(res, 80));
  console.log("Cached user profiles:", Object.keys(allUsers).length);

  const snapshot = await messagesRef.orderByKey().limitToLast(150).once("value");
  const items = [];
  snapshot.forEach(child => {
    items.push({ id: child.key, ...child.val() });
  });

  items.sort((a, b) => a.time - b.time);

  for (const msg of items) {
    const info = allUsers[msg.senderId] || {};
    messages[msg.id] = msg;

    appendMessage({
      ...msg,
      name: info.username || "Unknown",
      icon: info.profileIcon || "default.png"
    });
  }

  if (items.length > 0) {
    oldestLoadedKey = items[0].id;
  }

  updateLoadOlderVisibility();
  console.log("Initial load complete:", items.length, "messages");

  messagesRef.limitToLast(1).on("child_added", snap => {
    const msg = snap.val();
    const id = snap.key;

    if (messages[id]) return;
    messages[id] = { id, ...msg };

    const info = allUsers[msg.senderId] || {};

    appendMessage({
      ...msg,
      id,
      name: info.username || "Unknown",
      icon: info.profileIcon || "default.png"
    });

    const box = messagesViewport;
    const isNearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 200;
    if (isNearBottom) box.scrollTop = box.scrollHeight;

    const isMe = msg.senderId === accountId;
    updateLoadOlderVisibility();
    if (!isNearBottom && !isMe) showNewMsgIndicator();
  });
})();

/* messagesRef.orderByKey().limitToLast(150).on("child_added", async snap => {
  const msg = snap.val();
  const id = snap.key;
  
  const userSnap = await firebase.database().ref("users/" + msg.senderId).once("value");
  const userInfo = userSnap.val() || {};

  if (domCache[id]) return;
  if (deletedMessages.has(id)) return;
  if (!oldestLoadedKey) oldestLoadedKey = id;

  const fullMsg = {
    ...msg,
    id,
    senderId: msg.senderId,
    name: userInfo.username || "Unknown",
    icon: userInfo.profileIcon || "default.png"
  };

  messages[id] = fullMsg;
  appendMessage(fullMsg);

  const isMe = msg.senderId === accountId;
  updateLoadOlderVisibility();
  if (!userIsAtBottom && !isMe) showNewMsgIndicator();

  let initialLoadDone = false;
  messagesRef.limitToLast(150).once("value", () => {
    initialLoadDone = true;
    setTimeout(refreshAllReplyPreviews, 50);
  });
}); */

messagesRef.on("child_changed", snap => {
  const msg = snap.val();
  const id = snap.key;
  messages[id] = { ...msg, id };

  if (domCache[id]) {
    updateMessageElement(messages[id]);
    refreshAllReplyPreviews();
    positionActions(domCache[id]);
    positionIcons(domCache[id]);
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
      console.error("[ERROR] Loading older messages:", err);
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
    console.error("[ERROR] Loading older messages:", err);
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

/* ================= GROUPING & ALIGNMENTS ================= */
function updateAllBubbleAlignments() {
  document.querySelectorAll(".bubble").forEach(b => adjustBubbleAlignment(b));
}

function adjustBubbleAlignment(bubbleEl) {
  if (!bubbleEl) return;
  try {
    const range = document.createRange();
    range.selectNodeContents(bubbleEl);
    const rects = range.getClientRects();
    const lines = rects.length || 1;

    bubbleEl.style.textAlign = lines === 1 ? "center" : "left";
    if (typeof range.detach === "function") range.detach();
  } catch (err) {
    bubbleEl.style.textAlign = "left";
  }
}

function positionIcons(msgEl) {
  const bubble = msgEl.querySelector(".bubble");
  const sideDot = msgEl.querySelector(".side-dot");
  if (!bubble || !sideDot) return;

  const bubbleRect = bubble.getBoundingClientRect();
  const msgRect = msgEl.getBoundingClientRect();
  const centerY = bubbleRect.top + bubbleRect.height / 2 - msgRect.top;

  sideDot.style.top = centerY + "px";
  sideDot.style.transform = "translateY(-50%)";
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

function isSameGroup(a, b) {
  if (!a || !b) return false;
  return a.senderId === b.senderId && Math.abs(a.time - b.time) <= 120000;
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
  const t = el.querySelector(".time");
  if (t) t.classList.remove("hidden");
}
function hideSideDot(el) {
  const d = el.querySelector(".side-dot");
  if (d) d.classList.add("hidden");
}
function showSideDot(el) {
  const d = el.querySelector(".side-dot");
  if (d) d.classList.remove("hidden");
}

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
      hideSideDot(cur);
      hideTime(cur);
    } else {
      cur.classList.add("grouped");
      hideMeta(cur);
    }

    if (!sameAsNext) {
      cur.classList.add("last-in-group");
      showTime(cur);
      showSideDot(cur);
    } else {
      hideTime(cur);
      hideSideDot(cur);
    }
  }

  requestAnimationFrame(() => {
    for (let msg of all) {
      positionActions(msg);
      positionIcons(msg);
    }
  });
}

/* ================= ACTION MENU HANDLER ================= */
function attachActionHandlers(el, id, data) {
  const menuBtn = el.querySelector(".menu-btn");
  const menu = el.querySelector(".action-menu");
  const replyBtn = el.querySelector(".reply-btn");

  const editBtn = menu.querySelector(".edit-option");
  const reactBtn = menu.querySelector(".react-option");
  const deleteBtn = menu.querySelector(".delete-option");
  const reportBtn = menu.querySelector(".report-option");

  const isMe = data.senderId === accountId;

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
    const isOpen = menu.classList.contains("open");
    closeAllMenus({ except: isOpen ? null : menu });
    menu.classList.toggle("open");
    if (menu.classList.contains("open")) positionMenu();
  };

  replyBtn.onclick = () => {
    startReply(el);
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
    openReactionPicker(el)
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

function closeAllMenus({ except = null } = {}) {
  document.querySelectorAll(".action-menu.open").forEach(m => {
    if (m === except) return;
    m.classList.remove("open");
  });
}

/* document.addEventListener("click", (e) => {
  const clickedMenuBtn = e.target.closest(".menu-btn");
  const clickedMenu = e.target.closest(".action-menu");
  if (clickedMenuBtn || clickedMenu) return;
  closeAllMenus();
}); */

function handleMobileAction(action, msgEl) {
  const id = msgEl.dataset.id;
  const msgData = messages[id];
  if (!msgData) return;
  const isMe = msgData.senderId === accountId;

  switch (action) {
    case "reply":
      startReply(msgEl);
      break;
    case "edit":
      if (isMe) beginEditMessage(id);
      break;
    case "react":
      openReactionPicker(msgEl)
      break;
    case "delete":
      if (isMe) messagesRef.child(id).remove().catch(console.error);
      break;
    case "report":
      console.log("Reported:", id);
      break;
  }
  closeMobileSheet();
}

function openMobileSheet(msgEl) {
  if (suppressNextActionMenu) {
    suppressNextActionMenu = false;
    return;
  }
  currentMobileMsg = msgEl;
  const id = msgEl.dataset.id;
  const msgData = messages[id];
  if (!msgData) return;
  const isMe = msgData.senderId === accountId;

  document.querySelector('[data-action="edit"]').style.display = isMe ? "block" : "none";
  document.querySelector('[data-action="delete"]').style.display = isMe ? "block" : "none";

  sheet.classList.add("open");
  sheet.style.transform = "translateY(0)";
  actionBackdrop.classList.add("show");
}

function closeMobileSheet() {
  sheet.classList.remove("open");
  sheet.style.transform = "";
  actionBackdrop.classList.remove("show");
  actionBackdrop.style.pointerEvents = "none";

  currentMobileMsg = null;
  
  setTimeout(() => {
    actionBackdrop.style.pointerEvents = "";
  }, 300);
}

document.querySelectorAll(".sheet-option").forEach(opt => {
  opt.addEventListener("click", () => {
    const action = opt.dataset.action;
    if (currentMobileMsg) {
      handleMobileAction(action, currentMobileMsg);
    }
  });
});

document.querySelector(".sheet-cancel").addEventListener("click", closeMobileSheet);
document.getElementById("sheet-backdrop").addEventListener("click",  closeMobileSheet);

/* ================= REACTION MENU HANDLER ================= */
if (picker && picker.parentNode !== document.body) {
  document.body.appendChild(picker);
  picker.classList.remove("hidden");
  picker.style.display = "none";
}

function hideReactionPicker() {
  if (!picker) return;
  picker.classList.remove("show");
  picker.style.pointerEvents = "none";
  setTimeout(() => {
    if (!picker.classList.contains("show")) picker.style.display = "none";
  }, 150);
  pickerTarget = null;
}

function openReactionPicker(msgEl) {
  if (!picker || !msgEl) return;
  pickerTarget = msgEl;

  const bubble = msgEl.querySelector(".bubble");
  if (!bubble) return;

  const rect = bubble.getBoundingClientRect();

  picker.style.display = "flex";
  picker.style.visibility = "hidden";
  picker.style.pointerEvents = "none";

  const pickerRect = picker.getBoundingClientRect();
  const margin = 8;
  let top = rect.top - pickerRect.height - 10;
  let left;

  if (top < margin) {
    top = rect.bottom + 10;
  }
  if (msgEl.classList.contains("me")) {
    left = rect.right - pickerRect.width;
  } else {
    left = rect.left;
  }

  left = Math.max(margin, Math.min(left, window.innerWidth - pickerRect.width - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - pickerRect.height - margin));

  picker.style.left = `${Math.round(left)}px`;
  picker.style.top = `${Math.round(top)}px`;

  picker.classList.add("just-opened");
  setTimeout(() => picker.classList.remove("just-opened"), 50);

  requestAnimationFrame(() => {
    picker.style.visibility = "visible";
    picker.style.pointerEvents = "auto";
    picker.classList.add("show");
  });
}

function renderReactions(msgEl, data) {
  const container = msgEl.querySelector(".reaction-badges");
  if (!container) return;
  
  container.innerHTML = "";
  if (!data?.reactions) return;

  Object.keys(data.reactions).forEach(emoji => {
    const users = Object.keys(data.reactions[emoji]);
    const isMine = data.reactions[emoji][accountId];

    const badge = document.createElement("div");
    badge.className = "reaction-badge" + (isMine ? " mine" : "");
    badge.dataset.emoji = emoji;
    badge.innerHTML = `${emoji} <span>${users.length}</span>`;

    badge.onclick = () => toggleReaction(msgEl, emoji);
    container.appendChild(badge);
  });
}

function toggleReaction(msgEl, emoji) {
  const msgId = msgEl.dataset.id;
  const ref = messagesRef.child(msgId).child("reactions").child(emoji).child(accountId);

  ref.once("value").then(snap => {
    if (snap.exists()) ref.remove();
    else ref.set(true);
  });
}

function showReactionTooltip(badge, msgData, emoji) {
  const usersObj = msgData.reactions?.[emoji];
  if (!usersObj) return;

  const usernames = Object.keys(usersObj)
    .map(uid => allUsers?.[uid]?.name || "Unknown User");
  tooltip.textContent = usernames.join(", ");

  const msgEl = findMsgElForBadge(badge);
  const rect = msgEl.getBoundingClientRect();
  tooltip.classList.remove("hidden");
  tooltip.style.maxWidth = "200px";

  const tipRect = tooltip.getBoundingClientRect();
  const top = rect.top - tipRect.height - 8;
  const left = rect.left + (rect.width / 2) - (tipRect.width / 2);
  tooltip.style.top = Math.max(6, top) + "px";
  tooltip.style.left = Math.max(6, Math.min(left, window.innerWidth - tipRect.width - 6)) + "px";

  requestAnimationFrame(() => tooltip.classList.add("show"));
}

function hideReactionTooltip() {
  if (!tooltip) return;
  tooltip.classList.remove("show");
  setTimeout(() => {
    if (!tooltip.classList.contains("show")) {
      tooltip.classList.add("hidden");
    }
  }, 150);
}

function findMsgElForBadge(badge) {
  return ( badge.closest(".msg") || badge.parentNode?.closest?.(".msg") || badge.parentElement?.closest?.(".msg") || null );
}

document.addEventListener("click", (e) => {
  const badge = e.target.closest(".reaction-badge");
  if (!badge) return;
  e.stopPropagation();
  suppressNextActionMenu = true;

  const msgEl = findMsgElForBadge(badge);
  if (!msgEl) return;
  toggleReaction(msgEl, badge.dataset.emoji);
});

document.addEventListener("mouseover", (e) => {
  if (window.innerWidth <= 900) return;

  const badge = e.target.closest(".reaction-badge");
  if (!badge) {
    hideReactionTooltip();
    return;
  }

  const emoji = badge.dataset.emoji;
  const msgEl = findMsgElForBadge(badge);
  if (!msgEl) return;

  const msgData = messages[msgEl.dataset.id];
  if (!msgData) return;

  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => { showReactionTooltip(badge, msgData, emoji); }, 250);
});

document.addEventListener("mouseout", (e) => {
  if (!e.relatedTarget || !tooltip.contains(e.relatedTarget)) {
    hideReactionTooltip();
  }
});

document.addEventListener('pointerdown', (ev) => {
  const badge = ev.target.closest('.reaction-badge');
  if (!badge || window.innerWidth > 900) return;
  badgePress.badge = badge;
  badgePress.long = false;
  badgePress.startedAt = Date.now();
  badgePress.timer = setTimeout(() => {
    badgePress.long = true;
    showReactionTooltip(badge, messages[findMsgElForBadge(badge).dataset.id], badge.dataset.emoji);
  }, 450);
}, {passive:true});

document.addEventListener('pointerup', (ev) => {
  const badge = ev.target.closest('.reaction-badge');
  clearTimeout(badgePress.timer);
  if (!badge || badge !== badgePress.badge) return;
  if (!badgePress.long) {
    const msgEl = findMsgElForBadge(badge);
    if (msgEl) toggleReaction(msgEl, badge.dataset.emoji);
  }
  badgePress.badge = null;
});

/* document.addEventListener("click", (e) => {
  if (!picker) return;
  if (picker.contains(e.target)) return;
  if (e.target.closest(".action-menu, .menu-btn, .action-btn, .reply-btn")) return;
  if (picker.classList.contains("just-opened")) {
    picker.classList.remove("just-opened");
    return;
  }
  hideReactionPicker();
}); */

window.addEventListener('scroll', () => {
  // lastScrollTime = Date.now();
  hideReactionTooltip();
}, { passive: true });

if (picker) {
  picker.querySelectorAll(".react").forEach(el => {
    el.onclick = (ev) => {
      ev.stopPropagation();
      if (!pickerTarget) return hideReactionPicker();
      toggleReaction(pickerTarget, el.textContent);
      hideReactionPicker();
    };
  });
}

/* ================= EVENT HANDLERS ================= */
let GLOBAL_LAST_POINTER_TARGET = null;

if (messagesViewport) {
  messagesViewport.addEventListener("scroll", () => {
    const nearBottom = messagesViewport.scrollTop + messagesViewport.clientHeight >= messagesViewport.scrollHeight - 30;
    userIsAtBottom = nearBottom;
    if (nearBottom) hideNewMsgIndicator();
    hasScrolledSinceTouch = true;

    if (typeof pressTimer !== "undefined" && pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    if (typeof tooltipPressTimer !== "undefined" && tooltipPressTimer) {
      clearTimeout(tooltipPressTimer);
      tooltipPressTimer = null;
    }

    pressStartBadge = null;

    try { hideReactionTooltip(); } catch (e) {}
    try { hideReactionPicker(); } catch (e) {}
  }, { passive: true });
}

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

function updateAllActionPositions() {
  requestAnimationFrame(updateAllBubbleAlignments);
  document.querySelectorAll(".msg").forEach(positionActions);
  document.querySelectorAll(".msg").forEach(positionIcons);
}

function chatSideBar() {
  const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("toggleSidebar") || document.querySelector(".sidebar-toggle");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");

  if (!sidebar || !toggleBtn) {
    console.warn("chatSideBar: sidebar or toggle button not found");
    return;
  }

  toggleBtn.addEventListener("click", () => {
    if (isMobile()) {
      const isOpen = sidebar.classList.toggle("open");
      if (sidebarBackdrop) sidebarBackdrop.classList.toggle("show", isOpen);
    } else {
      sidebar.classList.toggle("collapsed");
      sidebar.classList.remove("open");
      if (sidebarBackdrop) sidebarBackdrop.classList.remove("show");
    }
  });

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener("click", () => {
      sidebar.classList.remove("open");
      sidebarBackdrop.classList.remove("show");
    });
  }

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      sidebar.classList.remove("open");
      if (sidebarBackdrop) sidebarBackdrop.classList.remove("show");
    }

    if (isMobile()) {
      sidebar.classList.remove("collapsed");
    }
  });
}

function attachLongPress(msgEl) {
  if (!msgEl) return;
  let pressTimer;

  const start = (e) => {
    hasScrolledSinceTouch = false;

    if (e.target.closest(".reaction-badge")) return;
    if (!(window.innerWidth <= 900)) return;
    if (hasScrolledSinceTouch) return;

    try { e.preventDefault(); } catch (err) { }

    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    pressTimer = setTimeout(() => { openMobileSheet(msgEl); }, 420);
  };

  const cancel = () => clearTimeout(pressTimer);

  msgEl.addEventListener("touchstart", start, { passive: false });
  msgEl.addEventListener("touchend", cancel);
  msgEl.addEventListener("touchmove", cancel);
  msgEl.addEventListener("touchcancel", cancel);

  msgEl.addEventListener("mousedown", start);
  msgEl.addEventListener("mouseup", cancel);
  msgEl.addEventListener("mouseleave", cancel);
}

function enableSwipeToReply(msgEl) {
  let startX = 0;
  let swiping = false;
  const isMine = msgEl.classList.contains("me");

  msgEl.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    swiping = true;
  });

  msgEl.addEventListener("touchmove", e => {
    if (!swiping) return;
    const deltaX = e.touches[0].clientX - startX;
    if (Math.abs(deltaX) < 80) {
      msgEl.style.transform = `translateX(${deltaX}px)`;
    }

    if (!isMine && deltaX > 60) {
      swiping = false;
      triggerReplySwipe(msgEl, deltaX);
      return;
    }

    if (isMine && deltaX < -60) {
      swiping = false;
      triggerReplySwipe(msgEl, deltaX);
      return;
    }
  });

  msgEl.addEventListener("touchend", () => {
    msgEl.style.transform = "";
    msgEl.style.transition = "transform 0.15s ease";
    setTimeout(() => msgEl.style.transition = "", 150);
    swiping = false;
  });
}

document.addEventListener("DOMContentLoaded", chatSideBar);
document.addEventListener("pointerdown", (ev) => { GLOBAL_LAST_POINTER_TARGET = ev.target; }, true);
document.addEventListener("click", (ev) => {
    const target = ev.target;

    if (target.closest("#reaction-picker")) return;
    if (target.closest(".action-menu")) return;

    if (typeof hideReactionPicker === "function") hideReactionPicker();
    if (typeof closeAllMenus === "function") closeAllMenus();
}, true);

document.addEventListener("DOMContentLoaded", () => {
  const settingsModal = document.getElementById("settingsModal");
  const settingsBtn = document.getElementById("sidebarSettingsBtn");
  const closeSettings = document.getElementById("closeSettings");

  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });

  closeSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.classList.add("hidden");
  });

});

window.addEventListener('resize', () => {
  if (resizeTimer) cancelAnimationFrame(resizeTimer);
  resizeTimer = requestAnimationFrame(() => updateAllActionPositions());
});

/* ================= PRESENCE / RECOVERY ================= */
let myPresenceRef = null;

async function join(name, restoredInfo = null) {
  if (!authReady || !user) {
    pendingJoin = { name, restoredInfo };
    return;
  }

  if (restoredInfo && !accountId) {
    console.error("[JOIN] ERROR: restoredInfo provided but accountId missing");
    return;
  }

  if (!accountId) {
    accountId = "u_" + Math.random().toString(36).slice(2);
    localStorage.setItem("z_accountId", accountId);
    console.log("[JOIN] generated new accountId:", accountId + " (display name: " + displayName + ")");
  } else {
    console.log("[JOIN] using accountId:", accountId + " (display name: " + displayName + ")");
  }

  displayName = (name || "").trim() || "Guest";
  localStorage.setItem("z_name", displayName);
  if (promptEl) promptEl.style.display = "none";

  try {
    await initPresence();
  } catch (err) {
    console.error("[JOIN] initPresence failed:", err);
  }

  let lastPresenceUpdate = 0;
  presenceRef.on("value", async snap => {
    const now = Date.now();
    if (now - lastPresenceUpdate < 800) return;
    lastPresenceUpdate = now;

    const list = snap.val() || {};
    const entries = Object.values(list);
    const count = entries.length;

    if (whoEl) whoEl.innerHTML = "";
    if (onlineCountEl) onlineCountEl.textContent = count + " online";

    for (const p of entries) {
      if (!p.accountId) continue;

      const user = allUsers[p.accountId] || {};

      const name = user.username || "Unknown";
      const icon = user.profileIcon || "default";

      const el = document.createElement("div");
      el.className = "presence-item";

      el.innerHTML = `
      <div class="presence-left">
        <img class="presence-icon" src="../Assets/${icon}.png" />
        <div class="presence-name">${escapeHtml(name)}</div>
      </div>`;

      whoEl.appendChild(el);
    }
  });

  const userRef = usersRef.child(accountId);
  const snap = await userRef.once("value");

  if (!snap.exists()) {
    if (!restoredInfo) {
      const code = generateRecoveryCode(8);
      const payload = {
        accountId,
        username: displayName,
        chatTheme: "light",
        profileIcon: "default",

        level: {
          exp: 0,
          messageCount: 0
        },

        badges: {
          starter: true
        },

        typing: {
          typing: false,
          ts: 0
        },

        created: Date.now(),
        lastActive: Date.now(),
        timeout: 0
      };
      console.log("[JOIN] creating new user package:", payload);
      await userRef.set(payload);
      await firebase.database().ref("recoveryIndex").child(code).set(accountId);
      localStorage.setItem("z_recovery", JSON.stringify({ code, payload }));
    } else {
      console.warn("[JOIN] expected restoredInfo but user package is missing; restoredInfo:", restoredInfo);
    }
  } else {
    console.log("[JOIN] user package:", snap.val());
  }

  await usersRef.child(accountId).update({ lastActive: Date.now() });
  console.log("[JOIN] complete — accountId active:", accountId);
}

async function restoreWithCode(code) {
  if (!code || typeof code !== "string") {
    alert("Enter a recovery code.");
    return;
  }

  code = code.trim().toUpperCase();

  try {
    const idxRef = firebase.database().ref("recoveryIndex").child(code);
    const snap = await idxRef.once("value");

    if (!snap.exists()) {
      alert("Invalid recovery code.");
      return;
    }

    const restoredId = snap.val();
    console.log("[RESTORE] found accountId:", restoredId);

    const userSnap = await usersRef.child(restoredId).once("value");
    console.log("[RESTORE] usersRef lookup exists:", userSnap.exists());

    if (!userSnap.exists()) {
      alert("This account no longer exists.");
      return;
    }

    const data = userSnap.val();
    accountId = restoredId;
    localStorage.setItem("z_accountId", restoredId);
    console.log("[RESTORE] accountId set locally to:", accountId);

    displayName = data.username || "Guest";
    localStorage.setItem("z_name", displayName);

    const restoredInfo = {
      color: data.color || colors[Math.floor(Math.random() * colors.length)],
      username: data.username
    };

    if (promptEl) promptEl.style.display = "none";
    await join(displayName, restoredInfo);

    alert("Account restored — now using accountId: " + accountId);
    location.reload();
  } catch (err) {
    console.error("[RESTORE] restoreWithCode ERROR:", err);
  }
}

function initPresence() {
  try {
    myPresenceRef = presenceRef.push();
    myPresenceRef.onDisconnect().remove();

    return myPresenceRef
      .set({ accountId, ts: Date.now() })
      .then(() => { startPeriodicPresence(); })
      .catch(err => { console.error("[PRESENCE] presence set error:", err);
        throw err;
      });
  } catch (err) {
    console.error("[PRESENCE] initPresence exception:", err);
    throw err;
  }
}

function startPeriodicPresence() {
  if (!myPresenceRef) return;

  setInterval(() => {
    myPresenceRef.update({ ts: Date.now() }).catch(err => {
      console.error("[PRESENCE] Periodic update failed:", err);
    });
  }, 30000);
}

function generateRecoveryCode(len = 8) {
  const CH = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += CH[Math.floor(Math.random() * CH.length)];
  return out;
}

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

setInterval(() => {
  const timeEls = Array.from(document.querySelectorAll(".time"));
  const last = timeEls.slice(-120);
  for (const el of last) {
    const ts = Number(el.dataset.timestamp);
    if (!ts) continue;
    if (!el.classList.contains("hidden")) el.textContent = timeAgo(ts);
  }
}, 30000);
