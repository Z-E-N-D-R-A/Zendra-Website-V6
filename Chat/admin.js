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

let authReady = false;
let user = null;
let allUsers = {};
let messages = {};
let timeoutTargetId = null;
let usersListener = null;
let accountId = localStorage.getItem("z_accountId") || null;

const usersRef = firebase.database().ref("users");
const messagesRef = firebase.database().ref("messages");
const moderationLogsRef = firebase.database().ref("moderationLogs");
const levelLogsRef = firebase.database().ref("levelLogs");
const recoveryCodeRef = firebase.database().ref("recoveryCodes");

usersRef.on("value", snap => { allUsers = snap.val() || {} });
function getUsername(uid) {
  return allUsers?.[uid]?.username || "Unknown User";
}

messagesRef.on("value", snap => { messages = snap.val() || {} });
function getMessageById(messageId) {
  return messages?.[messageId] || null;
}

firebase.auth().signInAnonymously();
firebase.auth().onAuthStateChanged(async u => {
  if (!u) return;
  user = u;
  authReady = true;

  const saved = localStorage.getItem("z_accountId");
  if (saved) {
    accountId = saved;
    console.log("[AUTH] accessed localStorage (accountId: " + accountId + ")");
  } else {
    document.getElementById("blocked").style.display = "block";
    return;
  }

  const userSnap = await usersRef.child(accountId).once("value");
  if (!userSnap.exists() || !userSnap.val().isAdmin) {
    document.getElementById("blocked").style.display = "block";
    return;
  }

  document.getElementById("admin-root").classList.remove("hidden");
  document.getElementById("blocked").style.display = "none";
  document.getElementById("admin-status").textContent = "Admin verified - " + accountId;

  fetchUsers();
  moderationLogsListener();
});

/* ================= USERS LIST ================= */
function fetchUsers() {
  const list = document.getElementById("user-list");

  if (usersListener) usersRef.off("value", usersListener);

  usersListener = snap => {
    list.innerHTML = "";

    const sortedUsers = Object.entries(allUsers)
      .filter(([id]) => id !== accountId)
      .sort(([, a], [, b]) => {
        const nameA = (a.username || "unknown").toLowerCase();
        const nameB = (b.username || "unknown").toLowerCase();
        return nameA.localeCompare(nameB);
      });

    for (const [id, data] of sortedUsers) {
      renderUserList(list, id, data);
    }
  };

  usersRef.on("value", usersListener);
}

function renderUserList(list, id, data) {
  const row = document.createElement("div");
  row.className = "user-row";

  const state = getTimeoutState(data);
  let statusText = "";

  if (state.type === "banned") {
    statusText = `<span class="status banned">BANNED</span>`;
  } else if (state.type === "timeout") {
    statusText = `
      <span class="status timeout">
        Timeout until ${new Date(state.until).toLocaleString()}
      </span>`;
  }

  row.innerHTML = `
    <div class="user-left">
      <div class="user-name">
        ${data.username || "Unknown"}
        ${statusText}
      </div>
      <span class="user-id">${id}</span>
    </div>

    <div class="user-actions">
      <button class="btn timeout">Timeout</button>
      <button class="btn ban">Ban</button>
      <button class="btn clear">Remove</button>
      <button class="btn logout">Logout</button>
    </div>`;

  row.querySelector(".timeout").onclick = () => openTimeoutModal(id);
  row.querySelector(".ban").onclick = () => banUser(id);
  row.querySelector(".clear").onclick = () => clearPunishment(id);
  row.querySelector(".logout").onclick = () => logoutUser(id);

  list.appendChild(row);
}

/* ================= MODERATION LOGS ================= */
function moderationLogsListener() {
  const container = document.getElementById("moderation-list");
  container.innerHTML = "";
  moderationLogsRef.orderByChild("time").limitToLast(200).on("child_added", snap => { renderModerationLogs(snap.key, snap.val()); });
  moderationLogsRef.on("child_removed", snap => { const el = document.getElementById("mod-" + snap.key); if (el) el.remove(); });
}

function renderModerationLogs(id, log) {
  const container = document.getElementById("moderation-list");

  const row = document.createElement("div");
  row.className = "moderation-row";
  row.id = "mod-" + id;

  let username = "Unknown User";
  let messageText = "";
  let extraDetails = "";

  if (log.moderation === "censor") {
    username = allUsers?.[log.accountId]?.username || "Unknown User";
    messageText = log.fullMessage;
  }

  if (log.moderation === "report") {
    const msg = messages?.[log.messageId];
    if (msg) {
      username = allUsers?.[msg.senderId]?.username || "Unknown User";
      messageText = msg.text;
    }

    extraDetails = `
      <div class="mod-extra">
        <div><strong>Reason:</strong> <span>${log.reason}</span></div>
        <div><strong>Reported By:</strong> <span>${allUsers?.[log.reporterId]?.username || log.reporterId}</span></div>
      </div>`;
  }

  row.innerHTML = `
    <div class="mod-left">
      <div class="mod-user">${username}</div>
      <div class="mod-message"><strong>Message:</strong> <span>${messageText || "(Message deleted)"}</span></div>
      ${extraDetails}
    </div>

    <div class="mod-right">
        <div class="mod-actions">
            <span class="mod-action ${log.moderation}">${log.moderation.toUpperCase()}</span>
            <button class="btn resolve">Resolve</button>
        </div>
        <div class="mod-time">${new Date(log.time).toLocaleString()}</div>
    </div>`;

  row.querySelector(".btn.resolve").onclick = () => {
    if (!confirm(`Resolve ${log.moderation} (${id}) by ${username}?`)) return;
    moderationLogsRef.child(id).remove();
  };

  container.prepend(row);
}

async function logoutUser(targetId) {
  if (!confirm("Logout this user on all devices?")) return;
  const ref = usersRef.child(targetId);

  await ref.transaction(data => {
    if (!data) return data;
    data.sessionVersion = (data.sessionVersion || 1) + 1;
    return data;
  });

  const newCode = generateRecoveryCode();
  await recoveryCodeRef.child(targetId).set(newCode);
  localStorage.setItem("z_recovery", JSON.stringify({ code: newCode }) );

  alert("Successfully logged out " +  targetId);
}

function generateRecoveryCode(len = 8) {
  const CH = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += CH[Math.floor(Math.random() * CH.length)];
  return out;
}

/* ================= MODERATIONS ================= */
function openTimeoutModal(targetId) {
  timeoutTargetId = targetId;
  document.getElementById("timeout-modal").classList.remove("hidden");
}

async function timeoutUser(targetId, durationMs) {
  const until = Date.now() + durationMs;
  console.log()
  await usersRef.child(targetId).update({ timeout: until });
  alert("Successfully timed out " + targetId);
}

function getTimeoutState(user) {
  const t = user.timeout || 0;
  if (t === 1) return { type: "banned" };
  if (t > Date.now()) return { type: "timeout", until: t };
  return { type: "ok" };
}

async function banUser(targetId) {
  if (!confirm("Permanently ban this user?")) return;
  await usersRef.child(targetId).update({ timeout: 1 });
  alert("Successfully banned " + targetId);
}

async function clearPunishment(targetId) {
  if (!confirm("Remove all punishments for this user?")) return;
  await usersRef.child(targetId).update({ timeout: 0 });
  alert("Successfully removed all punishments for " + targetId);
}

document.getElementById("timeout-confirm").onclick = async () => {
  const days = Number(document.getElementById("tdays").value || 0);
  const hours = Number(document.getElementById("thours").value || 0);
  const mins = Number(document.getElementById("tmins").value || 0);
  const duration = (((days * 24 + hours) * 60) + mins) * 60 * 1000;

  if (duration <= 0) return;
  await timeoutUser(timeoutTargetId, duration);
  document.getElementById("timeout-modal").classList.add("hidden");
};

document.getElementById("timeout-cancel").onclick = () => {
  document.getElementById("timeout-modal").classList.add("hidden");
};

/* ================= DATABASE CLEANUP ================= */
const cleanupResult = document.getElementById("cleanup-result");

function isAdminUser() {
  return !!allUsers?.[accountId]?.isAdmin;
}

async function exportOldMessages(days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const snap = await messagesRef.orderByChild("time").endAt(cutoff).once("value");
  const data = snap.val() || {};

  if (!Object.keys(data).length) return [];

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `messages_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return Object.keys(data);
}

async function cleanupOldMessages(days = 30) {
  if (!isAdminUser()) return alert("Admins only.");

  cleanupResult.textContent = "Exporting old messages...";
  const ids = await exportOldMessages(days);

  if (!ids.length) {
    cleanupResult.textContent = "No old messages found.";
    return;
  }

  if (!confirm(`Delete ${ids.length} messages older than ${days} days?`)) return;

  const updates = {};
  ids.forEach(id => updates[id] = null);
  await messagesRef.update(updates);

  const logCount = await cleanupOldLevelLogs(days);
  cleanupResult.textContent = `Deleted ${ids.length} messages and ${logCount} level logs.`
}

async function cleanupOldLevelLogs(days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const snap = await levelLogsRef.orderByChild("time").endAt(cutoff).once("value");

  const logs = snap.val() || {};
  const ids = Object.keys(logs);

  if (!ids.length) {
    cleanupResult.textContent = "No old level logs found.";
    return 0;
  }

  const updates = {};
  ids.forEach(id => updates[id] = null);

  await levelLogsRef.update(updates);
  return ids.length;
}

async function exportInactiveAccounts(days = 90) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const snap = await usersRef.once("value");
  const users = snap.val() || {};

  const inactive = {};
  Object.entries(users).forEach(([id, u]) => {
    if (!u.lastActive || u.lastActive < cutoff) inactive[id] = u;
  });

  if (!Object.keys(inactive).length) return [];

  const blob = new Blob([JSON.stringify(inactive, null, 2)], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inactive_accounts_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return Object.keys(inactive);
}

async function cleanupInactiveAccounts(days = 90) {
  if (!isAdminUser()) return alert("Admins only.");

  cleanupResult.textContent = "Exporting inactive accounts...";
  const ids = await exportInactiveAccounts(days);

  if (!ids.length) {
    cleanupResult.textContent = "No inactive accounts found.";
    return;
  }

  if (!confirm(`Delete ${ids.length} inactive accounts?`)) return;

  const userUpdates = {};
  const recoveryUpdates = {};

  ids.forEach(id => {
    userUpdates[id] = null;
    recoveryUpdates[id] = null;
  });

  await usersRef.update(userUpdates);
  await recoveryCodeRef.update(recoveryUpdates);

  cleanupResult.textContent = `Deleted ${ids.length} accounts and ${ids.length} recovery codes.`;
}

document.getElementById("cleanup-messages").onclick = () => {
  cleanupOldMessages(30).catch(console.error);
};

document.getElementById("cleanup-accounts").onclick = () => {
  cleanupInactiveAccounts(90).catch(console.error);
};