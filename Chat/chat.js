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
const recoveryRef = db.ref("recovery");

let user = null;
let authReady = false;
let pendingJoin = null;
let pendingSend = false;
let pendingRestore = null;

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

/* =============== DOM HOOKS =============== */
const promptEl = document.getElementById("prompt") || null;
const promptName = document.getElementById("promptName") || null;
const joinBtn = document.getElementById("joinBtn") || null;

let messageInput = document.getElementById("message") || document.getElementById("messageInput") || document.querySelector(".input-bar input") || null;

const inputEl = document.getElementById("messageInput");
const messagesEl = document.getElementById("messages");
const messagesViewport = messagesEl.parentElement;
const sendBtn = document.getElementById("sendBtn") || null;

const recoveryInput = document.getElementById("recoveryInput") || null;
const restoreBtn = document.getElementById("restoreBtn") || null;
const recoveryDisplay = document.getElementById("recoveryDisplay") || null;
const recoveryCodeText = document.getElementById("recoveryCodeText") || null;
const copyRecoveryBtn = document.getElementById("copyRecoveryBtn") || null;

const loadOlderBtn = document.getElementById("loadOlderBtn");
const spinner = document.getElementById("spinner") || document.getElementById("loadingOlder") || null;
const newMsgIndicator = document.getElementById("newMsgIndicator") || null;

const whoEl = document.getElementById("who") || null;
const onlineCountEl = document.getElementById("onlineCount") || null;

const isMobile = window.matchMedia("(max-width: 900px)").matches;
const sheet = document.getElementById("mobile-action-sheet");
const actionBackdrop = document.getElementById("sheet-backdrop");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");

const deletedMessages = new Set();
const picker = document.getElementById("reaction-picker");

let currentMobileMsg = null;
let longPressTimeout = null;
let currentLongPressMsg = null;

let sheetStartY = 0;
let sheetCurrentY = 0;
let suppressNextActionMenu = false;
// let sheetDragging = false;

let suppressNewIndicator = false;
let regroupTimer = null;
let userIsAtBottom = true;
let replyToId = null;
let pickerTarget = null;

const typingRef = firebase.database().ref("typing");
typingRef.on("value", snap => {
  const data = snap.val() || {};
  updateTypingIndicator(data);
});

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

function insertDateSeparatorPrepend(el, ts) {
  const label = formatDateLabel(ts);
  const prev = el.previousElementSibling;
  if (prev && prev.classList.contains("date-separator") && prev.dataset.label === label) return;
  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.dataset.label = label;
  sep.innerHTML = `<span class="date-line">${label}</span>`;
  messagesEl.insertBefore(sep, el);
}

function insertDateSeparatorAppend(ts) {
  const label = formatDateLabel(ts);

  const existing = messagesEl.querySelector(`.date-separator[data-label="${label}"]`);
  if (existing) return existing;

  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.dataset.label = label;
  sep.innerHTML = `<span class="date-line">${label}</span>`;

  const children = [...messagesEl.children];

  for (let child of children) {
    if (!child.dataset.id) continue;

    const msg = messages[child.dataset.id];
    if (!msg) continue;

    const childDayStart = new Date(msg.time);
    childDayStart.setHours(0, 0, 0, 0);

    const myDayStart = new Date(ts);
    myDayStart.setHours(0, 0, 0, 0);

    if (childDayStart > myDayStart) {
      messagesEl.insertBefore(sep, child);
      return sep;
    }
  }
  messagesEl.appendChild(sep);
  return sep;
}

/* ================= RENDER HELPERS ================= */
function createMessageElement(data) {
  const { id, name, text, time, clientId: cid, color, edited } = data;
  const isMe = cid === clientId;

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

  const lastReal = (() => {
    let el = messagesEl.lastElementChild;
    while (el && el.classList.contains("date-separator")) el = el.previousElementSibling;
    return el;
  })();

  if (!lastReal) {
    insertDateSeparatorAppend(data.time);
  } else {
    const lastId = lastReal.dataset?.id;
    if (lastId) {
      const lastData = messages[lastId];
      const lastLabel = formatDateLabel(lastData.time);
      const thisLabel = formatDateLabel(data.time);
      if (lastLabel !== thisLabel) insertDateSeparatorAppend(data.time);
    } else {
      insertDateSeparatorAppend(data.time);
    }
  }

  const el = createMessageElement(data);
  activateReplyJump(el);
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
  activateReplyJump(el);
  domCache[id] = el;
  attachActionHandlers(el, id, data);

  const isMe = data.clientId === clientId;
  if (suppressNewIndicator) { return el; }
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
        insertDateSeparatorPrepend(firstReal, data.time);
      }
    } else {
      insertDateSeparatorPrepend(firstReal, data.time);
    }
  } else {
    insertDateSeparatorAppend(data.time);
  }

  const el = createMessageElement(data);
  activateReplyJump(el);
  renderReactions(el, data);

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
    uid: user.uid,
    name: displayName,
    text,
    time: Date.now(),
    clientId,
    color: colors[Math.floor(Math.random() * colors.length)],
    replyToId: replyToId || null
  };

  const newRef = messagesRef.push();
  newMsg.id = newRef.key;
  
  replyToId = null;
  document.getElementById("reply-bar").classList.add("hidden");
  sendTypingStatus(false);

  newRef
    .set(newMsg)
    .catch(err => { console.error("[ERROR] Sending Message:", err); });
  messageInput.value = "";
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
  if (!original) return "";

  return `
  <div class="reply-bubble" data-reply-jump="${msg.replyToId}">
    <strong>${escapeHtml(original.name)}</strong>
    <div class="reply-snippet">${escapeHtml(original.text.slice(0, 80))}</div>
  </div>`;
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
  const ref = firebase.database().ref("typing/" + clientId);
  ref.set({
    name: displayName,
    typing: isTyping,
    ts: Date.now()
  });
}

function updateTypingIndicator(allTyping) {
  const el = document.getElementById("typingIndicator");
  const typingUsers = Object.values(allTyping)
    .filter(u => u.typing && u.ts > Date.now() - 4000)
    .filter(u => u.name !== displayName);

  if (typingUsers.length === 0) {
    el.classList.remove("show");
    return;
  }

  let text = "";
  if (typingUsers.length === 1) 
    text = `${typingUsers[0].name} is typing`;
  else 
    text = `${typingUsers.length} people are typing`;

  el.innerHTML = `<span>${text}</span><div class="typing-dots"><span></span><span></span><span></span></div>`;
  el.classList.add("show");
}

inputEl.addEventListener("input", () => {
  sendTypingStatus(true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendTypingStatus(false);
  }, 1500);
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      e.stopPropagation();
      return;
    }
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
messagesRef.orderByKey().limitToLast(150).on("child_added", snap => {
  const msg = snap.val();
  const id = snap.key;

  if (domCache[id]) return;
  if (deletedMessages.has(id)) return;

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
    positionIcons(domCache[id]);
  }
});

messagesRef.on("child_removed", snap => {
  const id = snap.key;
  deletedMessages.add(id);

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

function chatSideBar() {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.querySelector(".sidebar-toggle");

  function isMobile() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  toggleBtn.addEventListener("click", () => {
    if (isMobile()) {
      const isOpen = sidebar.classList.toggle("open");
      sidebarBackdrop.classList.toggle("show", isOpen);
    } else {
      sidebar.classList.toggle("collapsed");
    }
  });

  sidebarBackdrop.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarBackdrop.classList.remove("show");
  });
}

function attachLongPress(msgEl) {
  if (!msgEl) return;
  let pressTimer;

  const start = (e) => {
    if (!(window.innerWidth <= 900)) return;
    e.preventDefault();
    pressTimer = setTimeout(() => {
      openMobileSheet(msgEl);
    }, 420);
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

/* function enableSheetDrag() {
  const sheet = document.getElementById("mobile-action-sheet");

  sheet.addEventListener("touchstart", e => {
    sheetDragging = true;
    sheetStartY = e.touches[0].clientY;
    sheet.style.transition = "none";
  });

  sheet.addEventListener("touchmove", e => {
    if (!sheetDragging) return;
    sheetCurrentY = e.touches[0].clientY - sheetStartY;

    if (sheetCurrentY > 0) {
      sheet.style.transform = `translateY(${sheetCurrentY}px)`;
      actionBackdrop.style.opacity = Math.max(0, 1 - sheetCurrentY / 250);
    }
  });

  sheet.addEventListener("touchend", () => {
    sheetDragging = false;
    sheet.style.transition = "";

    if (sheetCurrentY > 120) {
      closeMobileSheet();
    } else {
      sheet.style.transform = "translateY(0)";
      actionBackdrop.style.opacity = 1;
    }
  });
} */

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
    if (deltaX > 40) {
      swiping = false;
      startReply(msgEl);
    }
  });

  msgEl.addEventListener("touchend", () => { swiping = false; });
}

// document.addEventListener("DOMContentLoaded", enableSheetDrag);
document.addEventListener("DOMContentLoaded", chatSideBar);

/* document.addEventListener("touchstart", e => {
  if (e.target.closest(".msg")) {
    e.preventDefault();
  }
}, { passive: false }); */

window.addEventListener("resize", updateAllActionPositions);
function updateAllActionPositions() {
  requestAnimationFrame(updateAllBubbleAlignments);
  document.querySelectorAll(".msg").forEach(positionActions);
  document.querySelectorAll(".msg").forEach(positionIcons);
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
    const isOpen = menu.classList.contains("open");
    closeAllMenus({ except: menu });

    if (!isOpen) {
      menu.classList.add("open");
      positionMenu();
    } else {
      menu.classList.remove("open");
    }
  }

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

function closeAllMenus(options = {}) {
  const except = options.except || null;
  document.querySelectorAll(".action-menu.open").forEach((m) => {
    if (m !== except) m.classList.remove("open");
  });
}

document.addEventListener("click", (e) => {
  const clickedMenuBtn = e.target.closest(".menu-btn");
  const clickedMenu = e.target.closest(".action-menu");
  if (clickedMenuBtn || clickedMenu) return;
  closeAllMenus();
});

function handleMobileAction(action, msgEl) {
  const id = msgEl.dataset.id;
  const msgData = messages[id];
  const isMe = msgData.clientId === clientId;

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
  const isMe = msgData.clientId === clientId;

  document.querySelector('[data-action="edit"]').style.display = isMe ? "block" : "none";
  document.querySelector('[data-action="delete"]').style.display = isMe ? "block" : "none";

  const sheet = document.getElementById("mobile-action-sheet");
  sheet.classList.add("open");
  sheet.style.transform = "translateY(0)";
  actionBackdrop.classList.add("show");
}

function closeMobileSheet() {
  const sheet = document.getElementById("mobile-action-sheet");

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
  container.innerHTML = "";
  if (!data.reactions) return;

  Object.keys(data.reactions).forEach(emoji => {
    const users = Object.keys(data.reactions[emoji]);
    const isMine = data.reactions[emoji][user.uid];

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
  const ref = messagesRef.child(msgId).child("reactions").child(emoji).child(user.uid);

  ref.once("value").then(snap => {
    if (snap.exists()) ref.remove();
    else ref.set(true);
  });
}

const tooltip = document.getElementById("reaction-tooltip");
let tooltipTimer = null;
let tooltipPressTimer = null;
let allUsers = {};

function showReactionTooltip(badge, msgData, emoji) {
  const usersObj = msgData.reactions?.[emoji];
  if (!usersObj) return;

  const usernames = Object.keys(usersObj).map(uid =>
    (typeof allUsers === "object" && allUsers?.[uid]?.name) || "Unknown User"
  );

  tooltip.textContent = usernames.join(", ");

  const rect = badge.getBoundingClientRect();
  tooltip.classList.remove("hidden");

  const tipRect = tooltip.getBoundingClientRect();
  let top = rect.top - tipRect.height - 6;
  let left = rect.left + rect.width / 2 - tipRect.width / 2;

  left = Math.max(6, Math.min(left, window.innerWidth - tipRect.width - 6));
  top = Math.max(6, top);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;

  requestAnimationFrame(() => tooltip.classList.add("show"));
}

function hideReactionTooltip() {
  tooltip.classList.remove("show");
  setTimeout(() => {
    if (!tooltip.classList.contains("show")) {
      tooltip.classList.add("hidden");
    }
  }, 150);
}

document.addEventListener("mouseover", (e) => {
  if (window.innerWidth <= 900) return; // desktop only

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
  tooltipTimer = setTimeout(() => {
    showReactionTooltip(badge, msgData, emoji);
  }, 250); // small delay feels nicer
});

document.addEventListener("mouseout", (e) => {
  if (!e.relatedTarget || !tooltip.contains(e.relatedTarget)) {
    hideReactionTooltip();
  }
});

document.addEventListener("touchstart", (e) => {
  if (window.innerWidth > 900) return; // mobile only

  const badge = e.target.closest(".reaction-badge");
  if (!badge) return;

  const msgEl = findMsgElForBadge(badge);
  if (!msgEl) return;

  const emoji = badge.dataset.emoji;
  const msgData = messages[msgEl.dataset.id];

  tooltipPressTimer = setTimeout(() => {
    showReactionTooltip(badge, msgData, emoji);
  }, 450); // long press duration
}, { passive: true });

document.addEventListener("touchend", () => {
  clearTimeout(tooltipPressTimer);
  hideReactionTooltip();
});
document.addEventListener("touchcancel", () => {
  clearTimeout(tooltipPressTimer);
  hideReactionTooltip();
});

document.addEventListener("click", (e) => {
  if (!picker) return;
  if (picker.contains(e.target)) return;
  if (e.target.closest(".action-menu, .menu-btn, .action-btn, .reply-btn")) return;
  if (picker.classList.contains("just-opened")) {
    picker.classList.remove("just-opened");
    return;
  }
  hideReactionPicker();
});

function findMsgElForBadge(badge) {
  return (
    badge.closest(".msg") ||
    badge.parentNode?.closest?.(".msg") ||
    badge.parentElement?.closest?.(".msg") ||
    null
  );
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

document.addEventListener("touchstart", (e) => {
  const badge = e.target.closest(".reaction-badge");
  if (!badge) return;

  e.stopPropagation();
  e.preventDefault();
  suppressNextActionMenu = true;

  const msgEl = findMsgElForBadge(badge);
  if (!msgEl) return;

  toggleReaction(msgEl, badge.dataset.emoji);
}, { passive: false });

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

/* ================= PRESENCE / RECOVERY ================= */
let myPresenceRef = null;

joinBtn && (joinBtn.onclick = () => {
  const n = promptName.value || displayName || "Guest";
  join(n);
});

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

  const code = generateRecoveryCode(8);
  const payload = { clientId, name: displayName, color: myColor, ts: Date.now() };
  saveRecoveryRecord(code, payload);
}

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
      .catch(err => console.error("[ERROR] Presence:", err));
  } catch (err) {
    console.error("[ERROR] initPresence:", err);
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
    console.error("[ERROR] Save Recovery:", err);
  }
}

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

setInterval(() => {
  const timeEls = Array.from(document.querySelectorAll(".time"));
  const last = timeEls.slice(-120);
  for (const el of last) {
    const ts = Number(el.dataset.timestamp);
    if (!ts) continue;
    if (!el.classList.contains("hidden")) el.textContent = timeAgo(ts);
  }
}, 30000);
