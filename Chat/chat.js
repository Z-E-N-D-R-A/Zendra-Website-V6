const LEVEL_BADGES = { 5:  "Rookie", 10: "Expert", 25: "Veteran", 50: "Elite", 100: "Champion" };
const THEME_LIST = [
  { id: "light", label: "Light", img: "Light.png" },
  { id: "dark", label: "Dark", img: "Dark.png" },
  { id: "ocean", label: "Ocean", img: "Ocean.png" },
  { id: "futuristic", label: "Futuristic", img: "Futuristic.png" },
  { id: "space", label: "Space", img: "Space.png" },
  { id: "cyberpunk", label: "Cyberpunk", img: "Cyberpunk.png" },
  { id: "vintage", label: "Vintage", img: "Vintage.png" },
  { id: "forest", label: "Forest", img: "Forest.png" },
  { id: "earth", label: "Earth", img: "Earth.png" }
];

const THEMES = {
  light: {
    bg: "linear-gradient(135deg, #ececec, #d5d5d5)",
    text1: "#202020",
    text2: "#2d2d2d",
    text3: "#9d9d9d",
    sidebar: "#c9c9c9",
    input: "#bababa",
    inputArea: "#cecece",
    sendButton: "#e9e9e9",
    sendButtonHover: "#ffffff",
    sendButtonShadow: "rgba(203, 203, 203, 0.45)",
    actionMenu: "#ffffff",
    bubbleMe: "linear-gradient(135deg, #ffffff, #adadad)",
    bubbleOther: "rgba(255,255,255,0.06)"
  },

  dark: {
    bg: "linear-gradient(135deg, #0d0d0e, #0a0a0a)",
    text1: "#e6e6e6",
    text2: "#aaa",
    text3: "#333",
    sidebar: "#1e1e1e",
    input: "#1c1c1c",
    inputArea: "#333",
    sendButton: "#585757",
    sendButtonHover: "#666666",
    sendButtonShadow: "rgba(112, 116, 123, 0.45)",
    actionMenu: "#1c1c1c",
    bubbleMe: "linear-gradient(135deg, #494949, #1a1a1a)",
    bubbleOther: "rgba(255,255,255,0.06)"
  },

  ocean: {
    bg: "linear-gradient(135deg, #000428, #004e92)",
    text1: "#abe0ff",
    text2: "#8ad6ff",
    text3: "#3a6a9e",
    sidebar: "#0e1555",
    input: "#0d1860",
    inputArea: "#2f2e73",
    sendButton: "#155ecc",
    sendButtonHover: "#1f70ee",
    sendButtonShadow: "rgba(21, 94, 204, 0.45)",
    actionMenu: "#112264",
    bubbleMe: "linear-gradient(135deg, #1cb5e0, #0c6cf2)",
    bubbleOther: "rgba(43, 43, 214, 0.38)"
  },

  futuristic: {
    bg: "linear-gradient(135deg, #1f2833, #0b0c10)",
    text1: "#66fcf1",
    text2: "#81e8cb",
    text3: "#5d8277",
    sidebar: "#1e1e1e",
    input: "#243836",
    inputArea: "#081918",
    sendButton: "#007d75",
    sendButtonHover: "#3ab6ae",
    sendButtonShadow: "rgba(25, 181, 192, 0.45)",
    actionMenu: "#001e26",
    bubbleMe: "linear-gradient(135deg, #3bbfbb, #004844)",
    bubbleOther: "rgba(255,255,255,0.06)"
  },

  space: {
    bg: "linear-gradient(135deg, #47118e, #0c2792)",
    text1: "#e3b9ff",
    text2: "#e89dff",
    text3: "#a784ae",
    sidebar: "#2e1e3f",
    input: "#311e4b",
    inputArea: "#3e2855",
    sendButton: "#8900f2",
    sendButtonHover: "#b100e8",
    sendButtonShadow: "rgba(215, 84, 255, 0.45)",
    actionMenu: "#352068",
    bubbleMe: "linear-gradient(135deg, #310964, #772eca)",
    bubbleOther: "rgba(100, 77, 255, 0.5)"
  },

  cyberpunk: {
    bg: "linear-gradient(135deg, #ea00d9, #0abdc6)",
    text1: "#00ffd0",
    text2: "#ffff00",
    text3: "#ff00c3",
    sidebar: "#2e325b",
    input: "#1e1964",
    inputArea: "#3e2e5b",
    sendButton: "#7724cb",
    sendButtonHover: "#9900ff",
    sendButtonShadow: "rgba(242, 57, 255, 0.5)",
    actionMenu: "#3e2e5bff",
    bubbleMe: "linear-gradient(135deg, #6300ff, #ff008d)",
    bubbleOther: "rgba(255, 0, 195, 0.8)"
  },

  vintage: {
    bg: "linear-gradient(135deg, #90aead, #874f41)",
    text1: "#ffd392",
    text2: "#fbe9d0",
    text3: "#c3ac89",
    sidebar: "#437283",
    input: "#4e7b89",
    inputArea: "#364554",
    sendButton: "#e64833",
    sendButtonHover: "#fd5039",
    sendButtonShadow: "rgba(255, 85, 0, 0.5)",
    actionMenu: "#437283",
    bubbleMe: "linear-gradient(135deg, #874f41, #db983b)",
    bubbleOther: "rgba(228, 162, 70, 0.5)"
  },

  forest: {
    bg: "linear-gradient(135deg, #022708, #0a381f)",
    text1: "#ffe6d4",
    text2: "#fdbd8e",
    text3: "#b96c35",
    sidebar: "#071d0b",
    input: "#103f15",
    inputArea: "#28553a",
    sendButton: "#25b561",
    sendButtonHover: "#15ea6e",
    sendButtonShadow: "#2ecc71",
    actionMenu: "#3a180a",
    bubbleMe: "linear-gradient(135deg, #2ecc71, #27ae60)",
    bubbleOther: "rgba(128, 170, 88, 0.5)"
  },

  earth: {
    bg: "linear-gradient(135deg, #5f9053, #217da7)",
    text1: "#9ad6ff",
    text2: "#e6e6e6",
    text3: "#f7f9fb",
    sidebar: "#2c5a76",
    input: "#013c19",
    inputArea: "#285532",
    sendButton: "#1e73a1",
    sendButtonHover: "#0099ff",
    sendButtonShadow: "rgba(45, 197, 239, 0.45)",
    actionMenu: "#2d5168",
    bubbleMe: "linear-gradient(135deg, #206341, #00823a)",
    bubbleOther: "rgba(20, 136, 61, 0.2)"
  }
};

const PROFILE_ICONS = [
  "zendra_blue", "zendra_gray", "zendra_green", "zendra_orange", "zendra_pink", "zendra_purple", "zendra_red", "zendra_turquoise",
  "city_home", "city_hongkong", "city_toronto", "city_london", "city_shanghai", "city_paris", "city_seoul", "city_washington",
  "ai_cyberpunk", "ai_urban", "ai_rain", "ai_town", "ai_droid", "ai_robot", "ai_fox", "ai_firework",
  "others_zendra1", "others_zendra2", "others_zen", "others_cat", "others_lasers", "others_snow", "others_spark", "others_spiral"
];

const PROFANITY_WORDS = [
  "motherfucker", "fucking", "fucker", "fuck", "shitty", "bullshit", "shit", "bitches", "bitch", "assholes", "asshole", "bastard", "cunt", "douche", "douchebag", "slut", // whore
  "sexy", "sex", "porno", "pornhub", "porn", "nudes", "nude", "nudity", "boobs", "pussy", "dick", "cock", "penis", "vagina", "blowjob", "handjob", "cumming", "orgasm", "masturbate", "masturbation", "rape", "rapist", // tits, tit, anal, cum
  "nigger", "nigga", "faggot", "fag", "retarded", "retard", "chink", "kike", "wetback", "tranny", "cripple", // spic
  "kill yourself", "kys", "kill myself", "kms", "go die", "hang yourself", "shoot yourself"
];

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
const pendingReplies = {};
const levelEventCache = {};
const reactionListeners = new Set();
const googleProvider = new firebase.auth.GoogleAuthProvider();

const usersRef = firebase.database().ref("users");
const messagesRef = firebase.database().ref("messages");
const levelLogsRef = firebase.database().ref("levelLogs");
const presenceRef = firebase.database().ref("presence");
const moderationLogsRef = firebase.database().ref("moderationLogs");

let authReady = false;
let isBanned = false;
let banReady = false;

let user = null;
let accountId = null;
let allUsers = {};
let pendingJoin = {};
let pendingSend = false;
let displayName = "";

/* ================= START ANONYMOUS AUTH ================= */
firebase.auth().onAuthStateChanged(async (u) => {
  if (!u) {
    try {
      await firebase.auth().signInAnonymously();
      return;
    } catch (err) {
      console.error("[AUTH] Anonymous sign-in failed:", err);
      return;
    }
  }

  user = u;
  accountId = u.uid;
  authReady = true;
  console.log("[AUTH] Logged in:", accountId, "Anonymous:", u.isAnonymous);

  if (!await userHasAccount(accountId)) {
    document.getElementById("prompt").style.display = "flex";
    return;
  }
  document.getElementById("prompt").style.display = "none";

  setupPresence(accountId);

  if (u.isAnonymous) upgradeGoogleBtn.style.display = "flex";
  else upgradeGoogleBtn.style.display = "none";

  usersRef.child(accountId).on("value", snap => {
      const data = snap.val();
      if (!data) return;
      const state = getCurrentState(data);
      banReady = true;

      if (state.type === "banned") {
        isBanned = true;
        enableBannedUI();
      } else {
        isBanned = false;
        disableBannedUI();
        if (state.type === "timeout") enableTimeoutUI(state.until);
        else disableTimeoutUI();
      }

      tryProcessQueue();
  });

  if (user) updateGoogleUI(user);
});

function getCurrentState(user) {
  const t = user.timeout || 0;
  if (t === 1) return { type: "banned" };
  if (t > Date.now()) return { type: "timeout", until: t };
  return { type: "ok" };
}

function tryProcessQueue() {
  if (!authReady || !user || !banReady) return;

  if (isBanned) {
    console.warn("[AUTH] User is banned — blocking app startup");
    return;
  }

  attachUsersListener();

  usersRef.once("value").then(snap => {
    allUsers = snap.val() || {};
    initMessageLoading();
  });

  if (pendingJoin) {
    pendingJoin = null;
    join().catch(console.error);
  }

  if (pendingSend) {
    pendingSend = false;
    sendMessage();
  }
}

function attachUsersListener() {
  usersRef.on("child_added", snap => {
    const uid = snap.key;
    const data = snap.val();
    allUsers[uid] = data;
    refreshPresenceUI();
  });

  usersRef.on("child_changed", snap => {
    const uid = snap.key;
    const data = snap.val();
    allUsers[uid] = data;
    refreshPresenceUI();
  });
}

document.getElementById("upgradeGoogleBtn").addEventListener("click", async () => {
  if (!user || !user.isAnonymous) return;
  const oldUid = user.uid;

  try {
    console.log("[LINK] Attempting Google link...");
    const result = await user.linkWithPopup(googleProvider);
    const googleData = user.providerData.find(p => p.providerId === "google.com");

    await usersRef.child(user.uid).update({
      google: {
        IconURL: googleData.photoURL || null,
        email: googleData.email,
        emailVerified: googleData.emailVerified || true
      },
      authProvider: "google"
    });

    console.log("[LINK] Success. UID remains:", result.user.uid);

    alert("Account secured with Google!");
    location.reload();
  } catch (err) {
    if (err.code === "auth/credential-already-in-use") {
      console.warn("[LINK] Google already linked to another account.");
      const credential = err.credential;

      try {
        if (sessionListenerRef) {
          sessionListenerRef.off();
          sessionListenerRef = null;
        }
        
        await firebase.database().ref("presence").child(oldUid).remove();
        const result = await firebase.auth().signInWithCredential(credential);

        console.log("[MERGE] Signed into existing Google account:", result.user.uid);
        alert("Signed into your existing Google account.");
        location.reload();
      } catch (signInErr) {
        console.error("[MERGE ERROR]", signInErr);
      }
    } else {
      console.error("[LINK ERROR]", err);
      alert("Google linking failed.");
    }
  }
});

/* =============== DOM HOOKS =============== */
let messageInput = document.getElementById("message") || document.getElementById("messageInput") || document.querySelector(".input-bar input") || null;

const promptEl = document.getElementById("prompt") || null;
const promptName = document.getElementById("prompt-name") || null;
const joinBtn = document.getElementById("prompt-join") || null;
const promptErrorEl = document.getElementById("prompt-error");

const messagesEl = document.getElementById("messages");
const messagesScroll = document.querySelector(".messages-scroll");
const messagesViewport = messagesEl.parentElement;
const sendBtn = document.getElementById("sendBtn") || null;
const newMsgIndicator = document.getElementById("newMsgIndicator") || null;
const charLimitEl = document.getElementById("charLimitIndicator");
const jumpBtn = document.getElementById("jumpToLatestBtn");

const inputBar = document.getElementById("input-bar");
const timeoutBar = document.getElementById("timeoutBar");
const timeoutEndEl = document.getElementById("timeoutEnd");

const presenceEl = document.getElementById("presence") || null;
const onlineCountEl = document.getElementById("onlineCount") || null;

const sheet = document.getElementById("mobile-action-sheet");
const backdrop = document.getElementById("backdrop");

const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggleSidebar") || document.querySelector(".sidebar-toggle");

const picker = document.getElementById("reaction-picker");
const tooltip = document.getElementById("reaction-tooltip");
const badgeTooltip = document.getElementById("badge-tooltip");

const settingsModal = document.getElementById("settingsModal");
const settingsBtn = document.getElementById("sidebarSettingsBtn");
const equippedBadgeEl = document.getElementById("equippedBadge");
const iconGrid = document.getElementById("iconGrid");
const closeSettings = document.getElementById("closeSettings");

const themeSelect = document.getElementById("theme-carousel");
const themeTrack = document.getElementById("themeTrack");
const themePrev = document.getElementById("themePrev");
const themeNext = document.getElementById("themeNext");

const reportModal = document.getElementById("report-modal");
const reportSubmit = document.getElementById("report-submit");
const reportCancel = document.getElementById("report-cancel");
const customReasonInput = document.getElementById("report-custom-reason");
const reportStatusEl = document.getElementById("report-status");

const googleStatusEl = document.getElementById("googleStatus");
const googleActionBtn = document.getElementById("googleActionBtn");
const googleBtnText = document.getElementById("googleBtnText");

const googleBtn = document.getElementById("prompt-google");
const googlePrompt = document.getElementById("google-username-prompt");
const googleInput = document.getElementById("google-username-input");
const googleError = document.getElementById("google-username-error");
const googleConfirm = document.getElementById("google-username-confirm");

const EDIT_DELETE_LIMIT = 48 * 60 * 60 * 1000; // 48 hours
const MESSAGE_RATE_LIMIT = 1000;
const MESSAGE_CHAR_LIMIT = 300;
const CHAR_WARNING_AT = 50;
const REPORT_LIMIT = 3;
const REPORT_WINDOW = 24 * 60 * 60 * 1000;

const ZXP_PER_MESSAGE = 5;
const HEAT_MAX = 100;
const HEAT_PER_MESSAGE = 25;
const HEAT_DECAY_PER_SECOND = 15;

const PAGE_SIZE = 50;
const LOAD_THRESHOLD = 300;
const ICONS_PER_PAGE = 8;
const THEMES_PER_PAGE = 2;

let unreadCount = 0;
let originalText = "";
let editingId = null;
let replyToId = null;
let myPresenceRef = null;

let equippedIcon = null;
let pickerTarget = null;
let currentMobileMsg = null;
let sessionListenerRef = null;

let timeoutTimer = null;
let typingTimeout = null;
let pressTimer = null;
let resizeTimer = null;
let tooltipTimer = null;
let emojiReactionTarget = null;
let badgeTooltipTimer = null;
let tooltipPressTimer = null;

let lastTarget = null;
let activeReport = null;
let selectedReason = null;

let oldestLoadedMessageTime = null;
let newestLoadedMessageTime = null;
let isLoadingOlder = false;

let iconIndex = 0;
let themeIndex = 0;
let lastTyping = 0;
let lastSendAt = 0;
let messageHeat = 0;
let localTimeoutUntil = 0;

let isInitialLoading = true;
let settingsUpdate = false;
let isLoggingOut = false;
let isTimedOut = false;
let presenceListenerAttached = false;

let userIsAtBottom = true;
let hasScrolledSinceTouch = false;
let suppressNextActionMenu = false;

let badgePress = { timer: null, startedAt: 0, badge: null, long: false };
const heatSystem = { heat: 0, lastAction: 0, decayRate: 1.2, maxHeat: 300, lockedUntil: 0 };

usersRef.on("value", snap => { updateTypingIndicator(snap.val() || {}); });
usersRef.child(`${accountId}/profileIcon`).on("value", snap => { equippedIcon = snap.val() || PROFILE_ICONS[0]; renderIconPage(); });

/* ================= UTILITIES & FORMATTING ================= */
function formatMessageText(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function formatBadgeName(name) {
  return name.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") + " Badge";
}

function formatProfanity(text) {
  const map = [];
  let collapsed = "";

  for (let i = 0; i < text.length; i++) {
    const c = text[i].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/[a-z0-9]/.test(c)) {
      collapsed += c;
      map.push(i);
    }
  }

  return { collapsed, map };
}

function escapeHtml(s) {
  return String(s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function zxpLevel(level) {
  if (level <= 0) return Infinity;
  const y = 0.5 * level * level + 8.5 * level - 4;
  return (Math.max(1, Math.ceil(y))) * ZXP_PER_MESSAGE;
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

function getEquippedBadge(badges) {
  if (!badges) return null;

  for (const [name, value] of Object.entries(badges)) {
    if (value === true) return name;
  }
  return null;
}

function createLevelSeparator({ accountId, level, time }) {
  const el = document.createElement("div");
  el.className = "level-separator";
  el.dataset.timestamp = time;

  const username = allUsers[accountId]?.username || "Unknown User";
  const badgeName = LEVEL_BADGES[level] || null;

  const main = document.createElement("div");
  main.className = "level-text";
  main.textContent = `Congratulations! ${username} reached Level ${level} 🎉`;
  el.appendChild(main);

  if (badgeName) {
    const badge = document.createElement("div");
    badge.className = "level-badge-text";
    badge.textContent = `🏅 New Badge Unlocked: ${badgeName} Badge`;
    el.appendChild(badge);
  }

  return el;
}

function createDateSeparator(label) {
  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.dataset.label = label;
  sep.innerHTML = `<span class="date-line">${label}</span>`;
  return sep;
}

function checkDateSeparator(msgEl, timestamp) {
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

function profanityFilter(text, userId) {
  let result = text;
  const { collapsed, map } = formatProfanity(text);
  const censoredRanges = [];
  const PROFANITY_WORDS_SORTED = [...PROFANITY_WORDS].map(w => w.toLowerCase()).sort((a, b) => b.length - a.length);

  function overlaps(start, end) {
    return censoredRanges.some(r => Math.max(r.start, start) <= Math.min(r.end, end));
  }

  PROFANITY_WORDS_SORTED.forEach(word => {
    let index = collapsed.indexOf(word);

    while (index !== -1) {
      const startOriginal = map[index];
      const endOriginal = map[index + word.length - 1];

      if (!overlaps(startOriginal, endOriginal)) {
        const length = endOriginal - startOriginal + 1;
        const censored = "*".repeat(length);

        result = result.slice(0, startOriginal) + censored + result.slice(endOriginal + 1);

        censoredRanges.push({ start: startOriginal, end: endOriginal });
        moderationLogsRef.push({
          accountId: userId,
          moderation: "censor",
          fullMessage: text,
          time: Date.now()
        });
      }

      index = collapsed.indexOf(word, index + 1);
    }
  });

  return result;
}

/* ================= CHAT RENDERING HELPERS ================= */
function createMessageElement(data) {
  const { id, name, text, time, senderId, edited } = data;
  const isMe = senderId === accountId;
  const icon = (data.icon === "google" && data.googlePhotoURL)  ? data.googlePhotoURL  : `../Assets/Icons/${data.icon}.png`;

  const el = document.createElement("div");
  el.className = `msg ${isMe ? "me" : "other"}`;
  el.dataset.id = id;
  el.id = "msg-" + id;

  el.innerHTML = `
    <div class="meta">
      <strong>${escapeHtml(name || "Guest")}</strong>
      <div class="badges"></div>
    </div>
    
    <img src="${icon}" class="profile-icon" />

    <div class="bubble">
      <div class="bubble-content">
        ${data.replyToId ? `<div class="reply-bubble loading"></div>` : ""}
        ${formatMessageText(text)}
        </div>
      </div>
    </div>

    <div class="reaction-badges"></div>
    <div class="info-row">
      <div class="time" data-timestamp="${time}">${timeAgo(time)}</div>
      <div class="edit">${edited ? "(edited)" : ""}</div>
    </div>

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

      <button class="copy-option">
        <span class="fa-solid fas fa-copy"></span> Copy
      </button>

      <button class="delete-option danger">
        <span class="fa-solid far fa-trash-alt"></span> Delete
      </button>

      <button class="report-option danger">
        <span class="fa-solid fas fa-exclamation-triangle"></span> Report
      </button>
    </div>`;

  if (data.badges && typeof data.badges === "object") {
    const badgeContainer = el.querySelector(".badges");

    Object.entries(data.badges).forEach(([badgeName, state]) => {
      if (state === true) {
        const img = document.createElement("img");
        img.className = "badge-icon";
        img.src = `../Assets/Badges/${badgeName}.png`;
        img.dataset.badge = badgeName;
        badgeContainer.appendChild(img);
      }
    });
  }

  const meta = el.querySelector(".meta");
  const info = el.querySelector(".info-row");
  if (isMe) {
    meta.insertBefore(meta.querySelector(".badges"), meta.querySelector("strong"));
    info.insertBefore(info.querySelector(".edit"), info.querySelector(".time"));
  } else {
    meta.appendChild(meta.querySelector(".badges"));
    info.appendChild(info.querySelector(".edit"));
  }

  if (!isInitialLoading) {
    renderReactions(el, data);
    longPressListener(el);
    swipeToReply(el);
  }

  return el;
}

function updateMessageElement(data) {
  const id = data.id;
  messages[id] = data;

  const el = domCache[id];
  if (!el) return;

  const content = el.querySelector(".bubble-content");
  if (!content) return;

  const replyBubble = content.querySelector(".reply-bubble");
  content.innerHTML = "";

  if (replyBubble) {
    content.appendChild(replyBubble);
  }

  content.insertAdjacentHTML("beforeend", formatMessageText(data.text));

  renderReplyBubble(data);
  renderReactions(el, data);

  const timeEl = el.querySelector(".time");
  if (timeEl && !timeEl.classList.contains("hidden")) {
    timeEl.dataset.timestamp = data.time;
    timeEl.textContent = timeAgo(data.time);
  }

  const editEl = el.querySelector(".edit");
  if (editEl) {
    if (data.edited) {
      editEl.textContent = "(edited)";
      editEl.classList.remove("hidden");
    } else {
      editEl.textContent = "";
      editEl.classList.add("hidden");
    }
  }

  requestAnimationFrame(() => {
    positionActions(el);
    positionIcons(el);
  });
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
  domCache[id] = el;

  insertMessage(el, data.time);
  checkDateSeparator(el, data.time);

  renderReplyBubble(data);
  renderReactions(el, data);

  if (!isInitialLoading) {
    regroupAround(el);
  }
  
  reactionListener(id);
  actionMenuHandler(el, id, data);
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

/* ================= FIREBASE LISTENERS (PARTIAL LOAD)================= */
let messagesInitialized = false;
async function initMessageLoading() {
  if (messagesInitialized) return;
  messagesInitialized = true;

  const loadStart = performance.now();

  const messagesSnap = await messagesRef.orderByChild("time").limitToLast(PAGE_SIZE).once("value")
  const messageItems = [];
  messagesSnap.forEach(snap => { messageItems.push({ type: "msg", id: snap.key, ...snap.val() }); });
  messageItems.sort((a, b) => a.time - b.time);

  oldestLoadedMessageTime = messageItems[0]?.time ?? null;
  newestLoadedMessageTime = messageItems.at(-1)?.time ?? null;

  const levelsSnap = await levelLogsRef.orderByChild("time").startAt(oldestLoadedMessageTime).endAt(newestLoadedMessageTime).once("value");
  const timeline = [...messageItems];
  levelsSnap.forEach(child => { timeline.push({ type: "level", id: child.key, ...child.val() }); });
  timeline.sort((a, b) => a.time - b.time);

  const fragment = document.createDocumentFragment();
  let lastDateLabel = null;

  for (const item of timeline) {
    const label = formatDateLabel(item.time);
    if (label !== lastDateLabel) {
      fragment.appendChild(createDateSeparator(label));
      lastDateLabel = label;
    }

    if (item.type === "msg") {
      const info = allUsers[item.senderId] || {};
      const msg = { ...item, name: info.username || "Unknown User" };
      messages[item.id] = msg;

      const el = createMessageElement({
        ...msg,
        icon: info.profileIcon || "zendra_blue",
        googlePhotoURL: info.google?.IconURL || null,
        badges: info.badges || {}
      });

      domCache[item.id] = el;
      fragment.appendChild(el);

      renderReplyBubble(msg);

      if (pendingReplies[item.id]) {
        for (const replyMsgId of pendingReplies[item.id]) {
          renderReplyBubble(messages[replyMsgId]);
        }
        delete pendingReplies[item.id];
      }

      if (msg.replyToId && !messages[msg.replyToId]) {
        (pendingReplies[msg.replyToId] ??= []).push(msg.id);
      }
    } else {
      levelEventCache[item.id] = true;
      fragment.appendChild(createLevelSeparator(item));
    }
  }
  
  messagesEl.appendChild(fragment);
  const msgEls = [...messagesEl.querySelectorAll(".msg")];

  requestAnimationFrame(() => {
    for (const el of msgEls) {
      const id = el.dataset.id;
      const msg = messages[id];
      if (!msg) continue;

      actionMenuHandler(el, id, msg);
      reactionListener(id);
      longPressListener(el);
      swipeToReply(el);
    }
  });

  requestAnimationFrame(() => {
    regroupMessages();

    for (const el of msgEls) {
      const msg = messages[el.dataset.id];
      if (msg?.reactions) {
        renderReactions(el, msg);
      }
      positionActions(el);
      positionIcons(el);
    }

    messagesViewport.scrollTop = messagesViewport.scrollHeight;
  });
  
  isInitialLoading = false;
  const loadEnd = performance.now();
  console.log(`[LOAD] Loaded ${timeline.length} items in ${(loadEnd - loadStart).toFixed(2)}ms`);

  messagesRef.limitToLast(1).on("child_added", snap => {
    const id = snap.key;
    if (domCache[id]) return

    const msg = snap.val();
    messages[id] = { id, ...msg };
    const info = allUsers[msg.senderId] || {};

    appendMessage({
      ...msg,
      id,
      name: info.username || "Unknown User",
      icon: info.profileIcon || "zendra_blue",
      googlePhotoURL: info.google?.IconURL || null,
      badges: info.badges || {}
    });

    const isMe = msg.senderId === accountId;
    if (isMe && messagesViewport) {
      hideNewMsgIndicator();
      messagesViewport.scrollTop = messagesViewport.scrollHeight;
    } else if (messagesViewport) {
      if (userIsAtBottom) {
        messagesViewport.scrollTop = messagesViewport.scrollHeight;
        hideNewMsgIndicator();
      } else {
        unreadCount++;
        updateNewMsgIndicator();
      }
    }
  });

  messagesRef.on("child_changed", snap => {
    const id = snap.key;
    const incoming = snap.val();
    const prev = messages[id] || {};
    const msg = { ...prev, ...incoming, id };

    messages[id] = msg;
    const el = domCache[id];
    if (!el) return;

    updateMessageElement(msg);
    updateReplyBubble(id);
  });

  messagesRef.on("child_removed", snap => {
    const id = snap.key;
    const el = domCache[id];
    if (!el) return;

    el.remove();
    delete domCache[id];
    delete messages[id];

    regroupMessages();
  });

  levelLogsRef.limitToLast(1).on("child_added", snap => {
    const id = snap.key;
    if (levelEventCache[id]) return;

    const data = snap.val();
    levelEventCache[id] = true;
    
    const el = { id, ...data };
    insertMessage(createLevelSeparator(el), el.time);
  });
};

async function loadOlderMessages() {
  const loadStart = performance.now();
  if (isLoadingOlder || !oldestLoadedMessageTime) return;
  isLoadingOlder = true;

  const viewport = messagesViewport;
  const container = messagesEl;

  const prevScrollHeight = container.scrollHeight;
  const prevScrollTop = viewport.scrollTop;

  const msgSnap = await messagesRef.orderByChild("time").endBefore(oldestLoadedMessageTime).limitToLast(PAGE_SIZE).once("value");
  if (!msgSnap.exists()) return isLoadingOlder = false;
  const olderMessages = [];
  msgSnap.forEach(snap => { olderMessages.push({ type: "msg", id: snap.key, ...snap.val() }); });
  olderMessages.sort((a, b) => a.time - b.time);

  const newOldestTime = olderMessages[0].time;

  const levelsSnap = await levelLogsRef.orderByChild("time").startAt(newOldestTime).endBefore(oldestLoadedMessageTime).once("value");
  const timeline = [...olderMessages];
  levelsSnap.forEach(snap => { timeline.push({ type: "level", id: snap.key, ...snap.val() }); });
  timeline.sort((a, b) => a.time - b.time);

  const fragment = document.createDocumentFragment();
  let lastDateLabel = null;

  for (const item of timeline) {
    const label = formatDateLabel(item.time);
    if (label !== lastDateLabel) {
      fragment.appendChild(createDateSeparator(label));
      lastDateLabel = label;
    }

    if (item.type === "msg") {
      if (messages[item.id]) continue;

      const info = allUsers[item.senderId] || {};
      const msg = { ...item, name: info.username || "Unknown User" };
      messages[item.id] = msg;

      const el = createMessageElement({
        ...msg,
        icon: info.profileIcon || "zendra_blue",
        badges: info.badges || {}
      });

      domCache[item.id] = el;
      fragment.appendChild(el);

      renderReplyBubble(msg);

      if (pendingReplies[item.id]) {
        for (const replyMsgId of pendingReplies[item.id]) {
          renderReplyBubble(messages[replyMsgId]);
        }
        delete pendingReplies[item.id];
      }

      if (msg.replyToId && !messages[msg.replyToId]) {
        (pendingReplies[msg.replyToId] ??= []).push(msg.id);
      }
    } else {
      if (levelEventCache[item.id]) continue;
      levelEventCache[item.id] = true;
      fragment.appendChild(createLevelSeparator(item));
    }
  }

  container.prepend(fragment);

  const newScrollHeight = container.scrollHeight;
  viewport.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);

  const msgEls = [...container.querySelectorAll(".msg")];

  requestAnimationFrame(() => {
    for (const el of msgEls) {
      const id = el.dataset.id;
      const msg = messages[id];
      if (!msg) continue;

      actionMenuHandler(el, id, msg);
      reactionListener(id);
      longPressListener(el);
      swipeToReply(el);
    }
  });

  requestAnimationFrame(() => {
    regroupMessages();

    for (const el of msgEls) {
      const msg = messages[el.dataset.id];
      if (msg?.reactions) renderReactions(el, msg);
      positionActions(el);
      positionIcons(el);
    }
  });

  oldestLoadedMessageTime = newOldestTime;
  isLoadingOlder = false;

  const loadEnd = performance.now();
  console.log(`[LOAD] Loaded ${timeline.length} items in ${(loadEnd - loadStart).toFixed(2)}ms`);
}

messagesViewport.addEventListener("scroll", () => {
  if (messagesViewport.scrollTop < LOAD_THRESHOLD && !isLoadingOlder) {
    loadOlderMessages();
  }
});

/* ================= MESSAGES HANDLER ================= */
function sendMessage() {
  if (!authReady || !user) return pendingSend = true;
  if (editingId) return finishEditMessage();
  if (!messageInput) return console.error("[ERROR] Message Input:", err);
  if (Date.now() < heatSystem.lockedUntil) return;

  const text = messageInput.value.trim();
  if (!text) return;
  if (text.length > MESSAGE_CHAR_LIMIT) return updateCharLimitIndicator();

  const finalText = profanityFilter(text, accountId);

  const newMsg = {
    senderId: accountId,
    text: finalText,
    time: Date.now(),
    edited: false,
    replyToId: replyToId || null
  };

  let heat = 12;
  heat += Math.min(20, text.length / 20);

  if (heatSystem.heat > 80) heat *= 1.3;
  if (heatSystem.heat > 150) heat *= 1.6;

  applyHeat(heat);

  const newRef = messagesRef.push();
  newMsg.id = newRef.key;

  replyToId = null;
  document.getElementById("reply-bar").classList.add("hidden");
  typingStatus(false);

  newRef.set(newMsg).catch(err => console.error("[ERROR] Sending Message:", err));
  messageInput.value = "";

  const u = usersRef.child(accountId);
  u.transaction(data => {
    if (!data) return data;

    if (!data.experience) {
      data.experience = { level: 1, zxp: 0, messageCount: 0 };
    }

    data.experience.messageCount++;
    data.experience.zxp += ZXP_PER_MESSAGE;

    const currentLevel = data.experience.level || 1;
    const requiredZxp = zxpLevel(currentLevel);

    if (data.experience.zxp >= requiredZxp) {
      const newLevel = currentLevel + 1;
      data.experience.zxp -= requiredZxp;
      data.experience.level = newLevel;

      levelLogsRef.push({
        accountId,
        level: newLevel,
        time: Date.now()
      });

      const badgeToUnlock = LEVEL_BADGES[newLevel];
      if (badgeToUnlock && data.badges[badgeToUnlock] !== true) {
        data.badges[badgeToUnlock] = false;
      }
    }

    updateCharLimitIndicator();
    return data;
  });
}

function beginEditMessage(id) {
  editingId = id;
  originalText = messages[id]?.text || "";

  if (!messageInput) {
      console.error("[ERROR] Message Input:", err);
      return;
  }

  messageInput.value = originalText;
  messageInput.focus();
  sendBtn.textContent = "Save Edit";
  commandBtn.style.display = "none";
  updateCharLimitIndicator();

  if (!document.getElementById("cancelEditBtn")) {
    const cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelEditBtn";
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "cancel-edit-btn";
    cancelBtn.style.marginLeft = "3px";
    cancelBtn.style.marginRight = "3px";
    cancelBtn.onclick = cancelEdit;
    sendBtn.insertAdjacentElement("afterend", cancelBtn);
  }
}

function finishEditMessage() {
  if (!messageInput) return cancelEdit();

  const newText = messageInput.value.trim();
  if (!newText || !editingId) return cancelEdit();
  if (newText === originalText) return cancelEdit();

  const finalText = profanityFilter(newText, accountId);
  messagesRef.child(editingId).update({ text: finalText, edited: true }).catch(console.error);

  cancelEdit();
}

function cancelEdit() {
  editingId = null;
  originalText = "";

  if (messageInput) messageInput.value = "";
  if (sendBtn) sendBtn.textContent = "Send";
  if (commandBtn) commandBtn.style.display = "block";
  const cancelBtn = document.getElementById("cancelEditBtn");
  if (cancelBtn) cancelBtn.remove();
  updateCharLimitIndicator();
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

function triggerReplySwipe(msgEl, deltaX) {
  msgEl.style.transition = "transform 0.25s ease";
  msgEl.style.transform = `translateX(${deltaX > 0 ? 35 : -35}px)`;
  setTimeout(() => { msgEl.style.transform = ""; msgEl.style.transition = ""; }, 250);
  startReply(msgEl);
}

function renderReplyBubble(msg) {
  const el = domCache[msg.id];
  if (!el) return;

  const container = el.querySelector(".bubble-content");
  if (!container) return;

  if (!msg.replyToId) {
    container.querySelector(".reply-bubble")?.remove();
    return;
  }

  let bubble = container.querySelector(".reply-bubble");
  if (!bubble) {
    bubble = document.createElement("div");
    bubble.className = "reply-bubble loading";
    container.prepend(bubble);
  }

  const original = messages[msg.replyToId];
  if (!original) {
    bubble.classList.add("loading");

    (pendingReplies[msg.replyToId] ??= []).push(msg.id);
    return;
  }

  bubble.classList.remove("loading");
  bubble.dataset.replyJump = msg.replyToId;

  bubble.innerHTML = `
    <strong>${escapeHtml(original.name)}</strong>
    <div class="reply-snippet">
      ${escapeHtml(original.text.slice(0, 80))}
      ${original.edited ? " (edited)" : ""}
    </div>
  `;
}

function updateReplyBubble(editedMsgId) {
  for (const id in messages) {
    const msg = messages[id];
    if (msg.replyToId === editedMsgId) renderReplyBubble(msg);
  }
}

function typingStatus(isTyping) {
  const ref = firebase.database().ref("users/" + accountId + "/typing");
  ref.set({ typing: isTyping, ts: Date.now() });
}

function updateTypingIndicator(typingStates) {
  const el = document.getElementById("typingIndicator");
  const now = Date.now();

  const typingUsers = Object.entries(typingStates)
    .filter(([uid, data]) => uid !== accountId)
    .filter(([_, data]) => data.typing?.typing)
    .filter(([_, data]) => data.typing?.ts > now - 4000);

  if (typingUsers.length === 0) {
    el.classList.remove("show");
    return;
  }

  let text;
  if (typingUsers.length === 1) {
    text = `${typingUsers[0][1].username} is typing`;
  } else {
    text = `${typingUsers.length} people are typing`;
  }

  el.innerHTML = `
    <span>${text}</span>
    <div class="typing-dots">
      <span></span><span></span><span></span>
    </div>`;

  el.classList.add("show");
  updateIndicatorRow();
}

function updateCharLimitIndicator() {
  const len = messageInput.value.length;
  const remaining = MESSAGE_CHAR_LIMIT - len;

  charLimitEl.classList.remove("show", "warn", "limit");

  if (remaining <= CHAR_WARNING_AT) {
    if (remaining <= 0) {
      charLimitEl.textContent = `Character limit reached (${MESSAGE_CHAR_LIMIT})`;
      charLimitEl.classList.add("limit");
    } else {
      charLimitEl.textContent = `${remaining} characters remaining`;
      charLimitEl.classList.add("warn");
    }
    charLimitEl.classList.add("show");
  }

  updateIndicatorRow();
}

function updateIndicatorRow() {
  const row = document.getElementById("indicatorRow");
  const typingShow = document.getElementById("typingIndicator").classList.contains("show");
  const charShow = document.getElementById("charLimitIndicator").classList.contains("show");

  row.classList.toggle("active", typingShow || charShow);
}

function updateNewMsgIndicator() {
  if (!newMsgIndicator) return;
  if (unreadCount <= 0) {
    hideNewMsgIndicator();
    return;
  }

  const textEl = document.getElementById("newMsgText");
  textEl.textContent = `↓ ${unreadCount} New Message${unreadCount > 1 ? "s" : ""} ↓`;
  newMsgIndicator.classList.add("show");
  newMsgIndicator.style.display = "block";
}

function hideNewMsgIndicator() {
  unreadCount = 0;
  if (!newMsgIndicator) return;

  newMsgIndicator.classList.remove("show");
  setTimeout(() => {
    if (newMsgIndicator.classList.contains("show"))
      newMsgIndicator.style.display = "none";
  }, 200);
}

sendBtn.onclick = () => {
  if (Date.now() - lastSendAt < MESSAGE_RATE_LIMIT) return;
  lastSendAt = Date.now();
  sendMessage();
};

newMsgIndicator.onclick = () => {
  hideNewMsgIndicator();
  if (messagesViewport) messagesViewport.scrollTop = messagesViewport.scrollHeight;
};

messagesEl.addEventListener("click", e => {
  const bubble = e.target.closest(".reply-bubble");
  if (!bubble) return;

  const targetId = bubble.dataset.replyJump;
  if (!targetId) return;

  const targetEl = document.getElementById("msg-" + targetId);
  if (!targetEl) return;

  targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
});

messagesEl.addEventListener("pointerup", e => {
  const bubble = e.target.closest(".reply-bubble");
  if (!bubble) return;

  const targetId = bubble.dataset.replyJump;
  if (!targetId) return;

  const targetEl = document.getElementById("msg-" + targetId);
  if (!targetEl) return;

  targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (Date.now() - lastSendAt < MESSAGE_RATE_LIMIT) return;
    lastSendAt = Date.now();
    sendMessage();
  }
});

window.addEventListener("keydown", (e) => {
  const isModifier = e.ctrlKey || e.metaKey;

  if (isModifier && e.key === ",") {
    e.preventDefault();
    initAccountSettings();
    settingsModal.classList.remove("hidden");
  }

  if (isModifier && e.key.toLowerCase() === "e") {
    e.preventDefault();
    
    const isOpen = emojiMenu.classList.toggle("open");
    if (isOpen) {
      renderAllEmojis();
      const searchInput = emojiMenu.querySelector("input");
      if (searchInput) searchInput.focus();
    } else {
      emojiReactionTarget = null;
      emojiOpenedFromReaction = false;
    }
  }
  
  if (e.key === "Escape") {
    settingsModal.classList.add("hidden");
    emojiMenu.classList.remove("open");
    emojiReactionTarget = null;
    emojiOpenedFromReaction = false;
  }
});

messageInput.addEventListener("input", () => {
  const now = Date.now();
  if (now - lastTyping > 1500) {
    typingStatus(true);
    lastTyping = now;
  }

  if (messageInput.value.length > MESSAGE_CHAR_LIMIT) {
    messageInput.value = messageInput.value.slice(0, MESSAGE_CHAR_LIMIT);
  }

  updateCharLimitIndicator();
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => { typingStatus(false); }, 1500);
});

document.getElementById("cancel-reply").onclick = () => {
  replyToId = null;
  document.getElementById("reply-bar").classList.add("hidden");
};

/* ================= GROUPING & ALIGNMENTS ================= */
function positionIcons(msgEl) {
  const bubble = msgEl.querySelector(".bubble");
  const profileIcon = msgEl.querySelector(".profile-icon");
  if (!bubble || !profileIcon) return;

  const bubbleRect = bubble.getBoundingClientRect();
  const msgRect = msgEl.getBoundingClientRect();
  const centerY = bubbleRect.top + bubbleRect.height / 2 - msgRect.top;

  profileIcon.style.top = centerY + "px";
  profileIcon.style.transform = "translateY(-50%)";

  if (msgEl.classList.contains("me")) {
    profileIcon.style.right = -25 + "px";
    profileIcon.style.left = "auto";
  } else {
    profileIcon.style.left = -25 + "px";
    profileIcon.style.right = "auto";
  }
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
    actions.style.right = (bubbleWidth + 15) + "px";
    actions.style.left = "auto";
  } else {
    actions.style.left = (bubbleWidth + 15) + "px";
    actions.style.right = "auto";
  }
}

function positionMenu(el, menuBtn, menu) {
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
function hideIcon(el) {
  const d = el.querySelector(".profile-icon");
  if (d) d.classList.add("hidden");
}
function showIcon(el) {
  const d = el.querySelector(".profile-icon");
  if (d) d.classList.remove("hidden");
}

function isSeparator(el) {
  return el?.classList?.contains("level-separator") || el?.classList?.contains("date-separator");
}

function previousMessage(el) {
  let p = el.previousElementSibling;
  while (p) {
    if (p.classList.contains("msg")) return p;
    if (isSeparator(p)) return null;
    p = p.previousElementSibling;
  }
  return null;
}

function nextMessage(el) {
  let n = el.nextElementSibling;
  while (n) {
    if (n.classList.contains("msg")) return n;
    if (isSeparator(n)) return null;
    n = n.nextElementSibling;
  }
  return null;
}

function regroupAround(el) {
  const prev = previousMessage(el);
  const next = nextMessage(el);

  if (prev) regroupSingle(prev);
  regroupSingle(el);
  if (next) regroupSingle(next);
}

function regroupSingle(cur) {
  if (!cur || !cur.classList.contains("msg")) return;

  const prev = previousMessage(cur);
  const next = nextMessage(cur);

  const curMsg = messages[cur.dataset.id];
  const prevMsg = prev ? messages[prev.dataset.id] : null;
  const nextMsg = next ? messages[next.dataset.id] : null;

  const sameAsPrev = prevMsg && isSameGroup(prevMsg, curMsg);
  const sameAsNext = nextMsg && isSameGroup(curMsg, nextMsg);

  cur.classList.remove("single", "first-in-group", "grouped", "last-in-group");

  if (!sameAsPrev && !sameAsNext) {
    cur.classList.add("single");
    showMeta(cur); showIcon(cur); showTime(cur);
  } else if (!sameAsPrev && sameAsNext) {
    cur.classList.add("first-in-group");
    showMeta(cur); hideIcon(cur); hideTime(cur);
  } else if (sameAsPrev && sameAsNext) {
    cur.classList.add("grouped");
    hideMeta(cur); hideIcon(cur); hideTime(cur);
  } else {
    cur.classList.add("last-in-group");
    hideMeta(cur); showIcon(cur); showTime(cur);
  }

  positionActions(cur);
  positionIcons(cur);
}

function regroupMessages() {
  const msgs = [...messagesViewport.querySelectorAll(".msg")];

  for (const cur of msgs) {
    const prev = previousMessage(cur);
    const next = nextMessage(cur);

    const curMsg = messages[cur.dataset.id];
    const prevMsg = prev ? messages[prev.dataset.id] : null;
    const nextMsg = next ? messages[next.dataset.id] : null;

    const sameAsPrev = prevMsg && isSameGroup(prevMsg, curMsg);
    const sameAsNext = nextMsg && isSameGroup(curMsg, nextMsg);

    cur.classList.remove("single", "first-in-group", "grouped", "last-in-group" );

    // CASE 1 - Single
    if (!sameAsPrev && !sameAsNext) {
      cur.classList.add("single");
      showMeta(cur);
      showIcon(cur);
      showTime(cur);
      continue;
    }

    // CASE 2 - First in group
    if (!sameAsPrev && sameAsNext) {
      cur.classList.add("first-in-group");
      showMeta(cur);
      hideIcon(cur);
      hideTime(cur);
      continue;
    }

    // CASE 3 - Middle in group
    if (sameAsPrev && sameAsNext) {
      cur.classList.add("grouped");
      hideMeta(cur);
      hideIcon(cur);
      hideTime(cur);
      continue;
    }

    // CASE 4 - Last in group
    if (sameAsPrev && !sameAsNext) {
      cur.classList.add("last-in-group");
      hideMeta(cur);
      showIcon(cur);
      showTime(cur);
      continue;
    }
  }

  requestAnimationFrame(() => {
    for (let el of msgs) {
      positionActions(el);
      positionIcons(el);
    }
  });
}

/* ================= MODERATIONS ================= */
function enableTimeoutUI(until) {
  if (isTimedOut) return;
  isTimedOut = true;

  document.body.classList.add("timed-out");

  inputBar.classList.add("hidden");
  timeoutBar.style.display = "flex";

  updateTimeoutText(until);

  clearTimeout(timeoutTimer);
  timeoutTimer = setInterval(() => updateTimeoutText(until), 1000);
}

function disableTimeoutUI() {
  if (!isTimedOut) return;
  isTimedOut = false;

  document.body.classList.remove("timed-out");

  inputBar.classList.remove("hidden");
  timeoutBar.style.display = "none";

  clearTimeout(timeoutTimer);
}

function updateTimeoutText(until) {
  const now = Date.now();
  let remaining = until - now;

  if (remaining <= 0) {
    disableTimeoutUI();
    return;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const timeLeft = hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`;
  const till = new Date(until).toLocaleString().replace(",", "");

  timeoutEndEl.innerHTML = `${timeLeft} <span class="timeout-till">(till ${till})</span>`;
}

function enableBannedUI() {
  const chat = document.getElementById("chat-area");
  const banned = document.getElementById("banned-screen");

  if (chat) chat.style.display = "none";
  banned.style.display = "flex";
  inputBar.style.display = "none";
}

function disableBannedUI() {
  const chat = document.getElementById("chat-area");
  const banned = document.getElementById("banned-screen");

  banned.style.display = "none"
  inputBar.style.display = "";
  if (chat) chat.style.display = "";
}

function sessionListener(accountId) {
  if (!accountId) return;
  const sessionRef = usersRef.child(accountId).child("sessionVersion");
  sessionListenerRef = sessionRef;

  sessionRef.on("value", snap => {
    if (isLoggingOut) return;
    if (!snap.exists()) return;

    const remoteVersion = snap.val();
    const localVersion = Number(localStorage.getItem("z_sessionVersion"));

    if (!localVersion) {
      localStorage.setItem("z_sessionVersion", remoteVersion);
      return;
    }

    if (remoteVersion !== localVersion) {
      forceLogout("Your session has been ended by an administrator.");
    }
  });
}

function forceLogout(reason) {
  if (isLoggingOut) return;
  isLoggingOut = true;
  console.warn("[AUTH] Forced logout:", reason);

  if (accountId) {
    firebase.database().ref("presence").child(accountId).remove();
  }

  if (sessionListenerRef) {
    sessionListenerRef.off();
    sessionListenerRef = null;
  }

  localStorage.removeItem("z_sessionVersion");
  alert(reason);

  firebase.auth().signOut().then(() => {
    location.reload();
  });
}

/* ================= HEAT SPAM SYSTEM ================= */
function applyHeat(amount) {
  const now = Date.now();
  const delta = now - heatSystem.lastAction;
  heatSystem.lastAction = now;

  if (delta < 2000) amount *= 2.3;
  else if (delta < 3000) amount *= 2.8;
  else if (delta < 4000) amount *= 1.2;

  heatSystem.heat = Math.min(heatSystem.maxHeat, heatSystem.heat + amount);

  // updateHeatUI();

  /* if (window.innerWidth >= 900) {
    if (heatSystem.heat >= 80 && heatSystem.heat < 100) {
      warningIndicator.textContent = `⚠️ Slow down or you may be timed out.`;
      warningIndicator.classList.add("show");
      updateIndicatorRow();
      setTimeout(() => {
        warningIndicator.textContent = "";
        warningIndicator.classList.remove("show");
        updateIndicatorRow();
      }, 8000);
    }
  } */

  if (heatSystem.heat >= 100) {
    triggerTimeout();
  }
}

function updateHeatUI() {
  const pct = Math.min(100, heatSystem.heat);
  document.getElementById("heat-fill").style.width = pct + "%";
  document.getElementById("heat-percent").textContent = Math.round(pct) + "%";
}

async function triggerTimeout() {
  let duration;
  if (heatSystem.heat < 140) duration = 60_000;
  else if (heatSystem.heat < 200) duration = 5 * 60_000; // 5 min
  else if (heatSystem.heat < 260) duration = 10 * 60_000; // 10 min
  else duration = 60 * 60_000;

  heatSystem.heat *= 0.8;
  const until = Date.now() + duration;
  heatSystem.lockedUntil = until;

  await usersRef.child(accountId).update({ timeout: until });

  moderationLogsRef.push({
    moderation: "spam",
    durations: duration,
    accountId,
    time: Date.now()
  });

  alert(`You have been timed out for ${Math.round(duration / 60000)} minute(s).`);
}

/* ================= SETTINGS HANDLER ================= */
function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--text1", theme.text1);
  root.style.setProperty("--text2", theme.text2);
  root.style.setProperty("--text3", theme.text3);
  root.style.setProperty("--sidebar", theme.sidebar);
  root.style.setProperty("--input", theme.input);
  root.style.setProperty("--inputArea", theme.inputArea);
  root.style.setProperty("--sendButton", theme.sendButton);
  root.style.setProperty("--sendButtonHover", theme.sendButtonHover);
  root.style.setProperty("--sendButtonShadow", theme.sendButtonShadow);
  root.style.setProperty("--actionMenu", theme.actionMenu);
  root.style.setProperty("--bubble-me", theme.bubbleMe);
  root.style.setProperty("--bubble-other", theme.bubbleOther);
}

function initAccountSettings() {
  const user = allUsers?.[accountId];
  if (!user) return;

  accountUsername.textContent = user.username || "Unknown User";

  const level = user.experience?.level || 0;
  const zxp = user.experience?.zxp || 0;
  const max = zxpLevel(level);

  levelText.textContent = level;
  xpText.textContent = `${zxp} / ${max} ZXP`;

  const progress = Math.min((zxp / max), 1);
  xpFill.style.width = `${progress * 100}%`;

  renderBadgeDropdown(user.badges || {});
  renderEquippedBadge(allUsers[accountId].badges);
  renderIconPage();
  renderThemePage();
}

function renderBadgeDropdown(badges) {
  badgeDropdown.innerHTML = "";

  let equippedBadge = null;
  const badgeEntries = Object.entries(badges);

  badgeEntries.forEach(([name, equipped]) => {
    if (equipped) equippedBadge = name;

    const item = document.createElement("div");
    item.className = "badge-item" + (equipped ? " equipped" : "");

    item.innerHTML = `
      <img src="../Assets/Badges/${name}.png" />
      <span>${formatBadgeName(name)}</span>`;

    item.onclick = () => equipBadge(name);
    badgeDropdown.appendChild(item);
  });

  if (equippedBadge) {
    const unequip = document.createElement("div");
    unequip.className = "badge-item unequip";
    unequip.innerHTML = `
      <img src="../Assets/Badges/Unequip.png" />
      <span>Unequip Badge</span>`;
    unequip.onclick = () => equipBadge(null);
    badgeDropdown.appendChild(unequip);
  }
}

function renderEquippedBadge(badges) {
  let equipped = null;
  Object.entries(badges).forEach(([name, state]) => {
    if (state === true) equipped = name;
  });

  if (!equipped) {
    equippedBadgeEl.innerHTML = "None ▾";
    return;
  }

  equippedBadgeEl.innerHTML = `
    <img src="../Assets/Badges/${equipped}.png" class="badge-icon" style="vertical-align: middle;"/>
    <span>${formatBadgeName(equipped)} ▾</span>`;
}

async function equipBadge(badgeName) {
  const updates = {};
  const userBadges = allUsers?.[accountId]?.badges;
  if (!userBadges) return;

  Object.keys(userBadges).forEach(b => {
    updates[`badges/${b}`] = (b === badgeName);
  });

  await usersRef.child(accountId).update(updates);

  Object.keys(userBadges).forEach(b => {
    allUsers[accountId].badges[b] = (b === badgeName);
  });

  settingsUpdate = true;
  badgeDropdown.classList.add("hidden");

  initAccountSettings();
}

function renderIconPage() {
  iconGrid.innerHTML = "";
  googleIconWrapper.innerHTML = "";
  const userData = allUsers[accountId];

  const equipped = userData?.profileIcon || "zendra_blue";

  if (userData?.google?.IconURL) {
    const label = document.createElement("span");
    label.textContent = "Google Icon: ";
    label.style.marginRight = "12px";
    label.style.opacity = "0.7";

    const googleImg = document.createElement("img");
    googleImg.src = userData.google.IconURL;
    googleImg.className = "profile-icon-option google-avatar standalone";
    googleImg.dataset.icon = "google";

    if (equipped === "google") {
      googleImg.classList.add("selected");
    }

    googleImg.onclick = () => equipIcon("google");

    googleIconWrapper.innerHTML = "";
    googleIconWrapper.appendChild(label);
    googleIconWrapper.appendChild(googleImg);
  }

  const start = iconIndex * ICONS_PER_PAGE;
  const pageIcons = PROFILE_ICONS.slice(start, start + ICONS_PER_PAGE);

  pageIcons.forEach(iconName => {
    const img = document.createElement("img");
    img.src = `../Assets/Icons/${iconName}.png`;
    img.className = "profile-icon-option";
    img.dataset.icon = iconName;

    if (iconName === equipped) {
      img.classList.add("selected");
    }

    img.onclick = () => equipIcon(iconName);
    iconGrid.appendChild(img);
  });
}

function equipIcon(iconName) {
  equippedIcon = iconName;
  settingsUpdate = true;
  firebase.database().ref(`users/${accountId}/profileIcon`).set(iconName);
  renderIconPage();
}

async function renderThemePage() {
  themeTrack.innerHTML = "";

  const snap = await usersRef.child(accountId).child("chatTheme").once("value");
  const currentTheme = snap.val() || "dark";

  const start = themeIndex * THEMES_PER_PAGE;
  const pageThemes = THEME_LIST.slice(start, start + THEMES_PER_PAGE);

  pageThemes.forEach(theme => {
    const card = document.createElement("div");
    card.className = "theme-card";
    card.dataset.theme = theme.id;

    if (theme.id === currentTheme) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <img src="../Assets/Themes/${theme.img}">
      <div class="theme-name">${theme.label}</div>`;

    card.onclick = async () => {
      if (!THEMES[theme.id]) return;

      applyTheme(THEMES[theme.id]);
      await usersRef.child(accountId).update({ chatTheme: theme.id });

      document.querySelectorAll(".theme-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
    };

    themeTrack.appendChild(card);
  });

  const maxPage = Math.ceil(THEME_LIST.length / THEMES_PER_PAGE) - 1;

  document.getElementById("themePrev").disabled = themeIndex <= 0;
  document.getElementById("themeNext").disabled = themeIndex >= maxPage;
}

function updateGoogleUI(user) {
  const googleProviderData = user.providerData.find(p => p.providerId === "google.com");

  if (googleProviderData) {
    googleActionBtn.dataset.connected = "true";
    googleActionBtn.classList.add("connected");
    googleActionBtn.style.pointerEvents = "none";

    document.getElementById("googleBtnText").textContent = "Google Connected";
    document.getElementById("googleStatus").textContent = "Connected Email: " + googleProviderData.email;
  } else {
    googleActionBtn.dataset.connected = "false";
    googleActionBtn.classList.remove("connected");
    googleActionBtn.style.pointerEvents = "auto";

    document.getElementById("googleBtnText").textContent = "Connect to Google";
    document.getElementById("googleStatus").textContent = "Not connected. Connect your Google account to enable secure login and account recovery.";
  }
}

googleActionBtn.addEventListener("click", async () => {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const isConnected = googleActionBtn.dataset.connected === "true";
  if (isConnected) return;

  try {
    await user.linkWithPopup(googleProvider);
    const googleData = user.providerData.find(p => p.providerId === "google.com");

    await usersRef.child(user.uid).update({
      google: {
        IconURL: googleData.photoURL || null,
        email: googleData.email,
        emailVerified: googleData.emailVerified || true
      },
      authProvider: "google"
    });
    alert("Successfully connected Google to your Zentral account!");
    location.reload();
    updateGoogleUI(firebase.auth().currentUser);
  } catch (error) {
    console.error("Google link error:", error);
  }
});

badgeButton.onclick = () => {
  badgeDropdown.classList.toggle("hidden");
};

themePrev.onclick = () => {
  if (themeIndex > 0) {
    themeIndex--;
    renderThemePage();
  }
};

themeNext.onclick = () => {
  const maxPage = Math.ceil(THEME_LIST.length / THEMES_PER_PAGE) - 1;
  if (themeIndex < maxPage) {
    themeIndex++;
    renderThemePage();
  }
};

iconPrev.onclick = () => {
  if (iconIndex > 0) {
    iconIndex--;
    renderIconPage();
  }
};

iconNext.onclick = () => {
  const maxPage = Math.ceil(PROFILE_ICONS.length / ICONS_PER_PAGE) - 1;
  if (iconIndex < maxPage) {
    iconIndex++;
    renderIconPage();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  settingsBtn.addEventListener("click", () => {
    initAccountSettings();
    settingsModal.classList.remove("hidden");
  });

  closeSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
    
    if (settingsUpdate) location.reload();
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
      if (settingsUpdate) location.reload();
    }
  });
});

/* ================= ACTION MENU HANDLER ================= */
function actionMenuHandler(el, id, data) {
  const menuBtn = el.querySelector(".menu-btn");
  const replyBtn = el.querySelector(".reply-btn");

  const menu = el.querySelector(".action-menu");
  const editBtn = menu.querySelector(".edit-option");
  const reactBtn = menu.querySelector(".react-option");
  const copyBtn = menu.querySelector(".copy-option");
  const deleteBtn = menu.querySelector(".delete-option");
  const reportBtn = menu.querySelector(".report-option");

  const isMe = data.senderId === accountId;
  const canModify = isMe && canModifyMessage(data);

  menuBtn.onclick = (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.contains("open");
    closeAllMenus({ except: isOpen ? null : menu });
    menu.classList.toggle("open");
    if (menu.classList.contains("open")) positionMenu(el, menuBtn, menu);
  };

  replyBtn.onclick = () => {
    startReply(el);
    closeMenu(menu);
  };

  if (canModify) {
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
  
  copyBtn.onclick = async () => {
    await copyMessageText(data.text);
    closeMenu(menu);
  };
  
  if (canModify) {
    deleteBtn.onclick = () => {
      messagesRef.child(id).remove().catch(console.error);
      closeMenu(menu);
    };
  } else {
    deleteBtn.style.display = "none";
  }

  if (!isMe) {
    reportBtn.onclick = () => {
      openReportPage({ id, senderId: data.senderId, text: data.text });
      closeMenu(menu);
    };
  } else {
    reportBtn.style.display = "none";
  }
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

function mobileActionMenuHandler(action, msgEl) {
  const id = msgEl.dataset.id;
  const msgData = messages[id];
  if (!msgData) return;
  const isMe = msgData.senderId === accountId;

  switch (action) {
    case "reply":
      startReply(msgEl);
      break;
    case "edit":
      if (isMe && canModifyMessage(msgData)) {
        beginEditMessage(id);
      }
      break;
    case "react":
      openReactionPicker(msgEl)
      break;
    case "copy":
      copyMessageText(msgData.text);
      break;
    case "delete":
      if (isMe && canModifyMessage(msgData)) {
        messagesRef.child(id).remove().catch(console.error);
      }
      break;
    case "report":
      openReportPage({ id, senderId: msgData.senderId, text: msgData.text });
      break;
  }
  closeMobileActionMenu();
}

function openMobileActionMenu(msgEl) {
  if (suppressNextActionMenu) {
    suppressNextActionMenu = false;
    return;
  }

  currentMobileMsg = msgEl;
  const id = msgEl.dataset.id;
  const msgData = messages[id];
  if (!msgData) return;

  const isMe = msgData.senderId === accountId;
  const canModify = isMe && canModifyMessage(msgData);

  document.querySelector('[data-action="edit"]').style.display = canModify ? "block" : "none";
  document.querySelector('[data-action="delete"]').style.display = canModify ? "block" : "none";
  document.querySelector('[data-action="report"]').style.display = isMe ? "none" : "block";

  sheet.classList.add("open");
  sheet.style.transform = "translateY(0)";
  backdrop.classList.add("show");
}

function closeMobileActionMenu() {
  sheet.classList.remove("open");
  sheet.style.transform = "";
  backdrop.classList.remove("show");
  backdrop.style.pointerEvents = "none";
  currentMobileMsg = null;
  setTimeout(() => { backdrop.style.pointerEvents = ""; }, 300);
}

function canModifyMessage(msg) {
  if (!msg?.time) return false;
  return Date.now() - msg.time <= EDIT_DELETE_LIMIT;
}

async function copyMessageText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    console.error("[ERROR] Failed to copy message:", e);
  }
}

document.querySelectorAll(".sheet-option").forEach(opt => {
  opt.addEventListener("click", () => {
    if (currentMobileMsg) mobileActionMenuHandler(opt.dataset.action, currentMobileMsg);
  });
});

document.querySelector(".sheet-cancel").addEventListener("click", closeMobileActionMenu);
backdrop.addEventListener("click",  closeMobileActionMenu);

/* ================= REACTION MENU HANDLER ================= */
if (picker && picker.parentNode !== document.body) {
  document.body.appendChild(picker);
  picker.classList.remove("hidden");
  picker.style.display = "none";
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

  if (top < margin) top = rect.bottom + 10;
  if (msgEl.classList.contains("me")) {
    left = rect.right - pickerRect.width;
  } else {
    left = rect.left;
  }

  left = Math.max(margin, Math.min(left, window.innerWidth - pickerRect.width - margin));
  top = Math.max(margin, Math.min(top, window.innerHeight - pickerRect.height - margin));

  picker.style.left = `${Math.round(left)}px`;
  picker.style.top = `${Math.round(top)}px`;

  requestAnimationFrame(() => {
    picker.style.visibility = "visible";
    picker.style.pointerEvents = "auto";
    picker.classList.add("show");
  });
}

function closeReactionPicker() {
  if (!picker) return;

  picker.classList.remove("show");
  picker.style.pointerEvents = "none";

  setTimeout(() => {
    if (!picker.classList.contains("show"))
      picker.style.display = "none";
  }, 150);

  pickerTarget = null;
}

function renderReactions(msgEl, data) {
  const container = msgEl.querySelector(".reaction-badges");
  if (!container) return;

  container.innerHTML = "";
  if (!data?.reactions) return;

  Object.keys(data.reactions).forEach(emoji => {
    const usersObj = data.reactions[emoji];
    if (!usersObj) return;

    const users = Object.keys(usersObj);
    if (!users.length) return;

    const isMine = !!usersObj[accountId];

    const badge = document.createElement("div");
    badge.className = "reaction-badge" + (isMine ? " mine" : "");
    badge.dataset.emoji = emoji;
    badge.innerHTML = `${emoji} <span>${users.length}</span>`;

    container.appendChild(badge);
  });
}

function toggleReaction(msgEl, emoji) {
  const msgId = msgEl.dataset.id;
  const emojiRef = messagesRef.child(msgId).child("reactions").child(emoji);
  if (isTimedOut) return;

  let heat = 6;
  if (heatSystem.heat > 80) heat *= 1.4;
  if (heatSystem.heat > 150) heat *= 1.7;

  emojiRef.child(accountId).once("value").then(snap => {
    if (snap.exists()) {
      emojiRef.child(accountId).remove().then(() => {
        emojiRef.once("value").then(s => {
          if (!s.exists()) emojiRef.remove();
        });
        applyHeat(heat);
      });
    } else {
      emojiRef.child(accountId).set(true);
      applyHeat(heat);
    }
  });
}

function reactionListener(msgId) {
  if (reactionListeners.has(msgId)) return;
  reactionListeners.add(msgId);

  const reactionsRef = messagesRef.child(msgId).child("reactions");

  reactionsRef.on("value", snap => {
    const msg = messages[msgId];
    if (!msg) return;
    msg.reactions = snap.val() || null;

    const el = domCache[msgId];
    if (!el) return;

    renderReactions(el, msg);
  });
}

function badgeMsgEl(badge) {
  return ( badge.closest(".msg") || badge.parentNode?.closest?.(".msg") || badge.parentElement?.closest?.(".msg") || null );
}

if (picker) {
  picker.querySelectorAll(".react").forEach(el => {
    el.onclick = (ev) => {
      ev.stopPropagation();

      if (!pickerTarget) return closeReactionPicker();
      toggleReaction(pickerTarget, el.textContent);
      closeReactionPicker();
    };
  });
}

/* ================= TOOLTIP HANDLER ================= */
function showReactionTooltip(badge, msgData, emoji) {
  const usersObj = msgData.reactions?.[emoji];
  if (!usersObj) return;

  const usernames = Object.keys(usersObj)
    .map(uid => { return `<b>${allUsers?.[uid]?.username || "Unknown User"}</b>` })
    .sort((a, b) => {
      const aa = a.replace(/<\/?b>/g, "");
      const bb = b.replace(/<\/?b>/g, "");
      return aa.localeCompare(bb);
    });

  tooltip.innerHTML = "Reacted by " + usernames.join(", ");

  tooltip.style.visibility = "hidden";
  tooltip.style.opacity = "0";
  tooltip.style.display = "block";

  // tooltip.style.left = "-9999px";
  // tooltip.style.top = "-9999px";

  const tipRect = tooltip.getBoundingClientRect();
  const badgeRect = badge.getBoundingClientRect();

  const msgEl = badgeMsgEl(badge);
  const isMe = msgEl && msgEl.classList.contains("me");

  let top = badgeRect.top - tipRect.height;
  let left = isMe ? badgeRect.right - tipRect.width : badgeRect.left;

  left = Math.max(6, Math.min(left, window.innerWidth - tipRect.width - 6));
  top = Math.max(6, Math.min(top, window.innerHeight - tipRect.height - 6));

  tooltip.style.left = Math.round(left) + "px";
  tooltip.style.top = Math.round(top) + "px";

  requestAnimationFrame(() => {
    tooltip.style.visibility = "visible";
    tooltip.style.opacity = "";
    tooltip.classList.add("show");
  });
}

function hideReactionTooltip() {
  if (!tooltip) return;
  tooltip.classList.remove("show");
  setTimeout(() => {
    if (!tooltip.classList.contains("show")) {
      tooltip.style.visibility = "hidden";
      tooltip.style.opacity = "0";
    }
  }, 150);
}

function showBadgeTooltip(badge, badgeName) {
  badgeTooltip.innerHTML = formatBadgeName(badgeName);

  badgeTooltip.style.visibility = "hidden";
  badgeTooltip.style.opacity = "0";
  badgeTooltip.style.display = "block";

  const tipRect = badgeTooltip.getBoundingClientRect();
  const badgeRect = badge.getBoundingClientRect();

  let top = badgeRect.top - tipRect.height;
  let left = badgeRect.left;

  left = Math.max(6, Math.min(left, window.innerWidth - tipRect.width - 6));
  top = Math.max(6, Math.min(top, window.innerHeight - tipRect.height - 6));

  badgeTooltip.style.left = Math.round(left) + "px";
  badgeTooltip.style.top = Math.round(top) + "px";

  requestAnimationFrame(() => {
    badgeTooltip.style.visibility = "visible";
    badgeTooltip.style.opacity = "";
    badgeTooltip.classList.add("show");
  });
}

function hideBadgeTooltip() {
  if (!badgeTooltip) return;
  badgeTooltip.classList.remove("show");
  setTimeout(() => {
    if (!badgeTooltip.classList.contains("show")) {
      badgeTooltip.style.visibility = "hidden";
      badgeTooltip.style.opacity = "0";
    }
  }, 150);
}

/* ================= REPORT HANDLERS ================= */
function openReportPage(message) {
  activeReport = message;
  selectedReason = null;
  customReasonInput.value = "";
  reportStatusEl.textContent = "";
  customReasonInput.classList.add("hidden");
  reportSubmit.disabled = false; 

  document.querySelectorAll(".report-option").forEach(b => b.classList.remove("selected"));

  reportModal.classList.remove("hidden");
  reportBackdrop.classList.add("show");
}

function closeReportPage() {
  reportModal.classList.add("hidden");
  reportBackdrop.classList.remove("show");
  activeReport = null;
}

async function canSubmitReport() {
  const now = Date.now();
  const since = now - REPORT_WINDOW;

  const snap = await moderationLogsRef.orderByChild("time").startAt(since).once("value");

  let count = 0;
  let oldestTime = null;

  snap.forEach(child => {
    const log = child.val();

    if (log.moderation === "report" && log.reporterId === accountId) {
      count++;

      if (!oldestTime || log.time < oldestTime) {
        oldestTime = log.time;
      }
    }
  });

  if (count >= REPORT_LIMIT && oldestTime) {
    reportStatusEl.textContent = `Too many reports. Try again later.`;
    reportStatusEl.classList.remove("report-success");
    return false;
  }

  return true;
}

reportSubmit.onclick = async () => {
  if (!activeReport || !selectedReason) {
    reportStatusEl.textContent = "Please select a reason.";
    return;
  }

  const finalReason = selectedReason === "Other" ? customReasonInput.value.trim() : selectedReason;

  if (!finalReason) return;
  reportStatusEl.textContent = "";

  const allowed = await canSubmitReport();
  if (!allowed) return;

  await moderationLogsRef.push({
    moderation: "report",
    reporterId: accountId,
    messageId: activeReport.id,
    reason: finalReason,
    time: Date.now()
  });

  reportStatusEl.innerHTML = "Report Sent Successfully.<br>Admin will review the message.";
  reportStatusEl.classList.add("report-success");
  reportSubmit.disabled = true;

  setTimeout(() => { closeReportPage(); }, 3000);
};

reportBackdrop.onclick = closeReportPage;
reportCancel.onclick = closeReportPage;

document.querySelectorAll(".report-option").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".report-option").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    selectedReason = btn.dataset.reason;

    if (selectedReason === "Other") {
      customReasonInput.classList.remove("hidden");
    } else {
      customReasonInput.classList.add("hidden");
      customReasonInput.value = "";
    }
  };
});

/* ================= EVENT HANDLERS ================= */
const isDesktop = () => window.innerWidth > 900;
const isMobile = () => window.innerWidth <= 900;

function getBadgeTarget(target) {
  return target.closest(".badge-icon, .reaction-badge");
}

function isBadge(el) {
  return el?.classList.contains("badge-icon");
}

function isReaction(el) {
  return el?.classList.contains("reaction-badge");
}

document.addEventListener("mouseover", (e) => {
  if (!isDesktop()) return;

  const el = getBadgeTarget(e.target);
  if (!el) {
    hideBadgeTooltip();
    hideReactionTooltip();
    return;
  }

  if (isBadge(el)) {
    const name = el.dataset.badge;
    if (!name) return;

    clearTimeout(badgeTooltipTimer);
    badgeTooltipTimer = setTimeout(() => showBadgeTooltip(el, name), 500);
  }

  if (isReaction(el)) {
    const emoji = el.dataset.emoji;
    const msgEl = badgeMsgEl(el);
    const msg = messages[msgEl?.dataset.id];
    if (!msg) return;

    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(() => showReactionTooltip(el, msg, emoji), 250);
  }
});

document.addEventListener("mouseout", (e) => {
  if (!e.relatedTarget || !badgeTooltip.contains(e.relatedTarget)) {
    hideBadgeTooltip();
  }
  if (!e.relatedTarget || !tooltip.contains(e.relatedTarget)) {
    hideReactionTooltip();
  }
});

document.addEventListener("pointerdown", (ev) => {
  if (!isMobile()) return;

  const el = getBadgeTarget(ev.target);
  if (!el) return;

  badgePress.badge = el;
  badgePress.long = false;
  badgePress.startedAt = Date.now();

  badgePress.timer = setTimeout(() => {
    badgePress.long = true;

    if (isBadge(el)) {
      showBadgeTooltip(el, el.dataset.badge);
    } else if (isReaction(el)) {
      const msgEl = badgeMsgEl(el);
      const msg = messages[msgEl?.dataset.id];
      if (msg) showReactionTooltip(el, msg, el.dataset.emoji);
    }
  }, 350);
}, { passive: true });

document.addEventListener("pointerup", (ev) => {
  clearTimeout(badgePress.timer);

  const el = ev.target.closest(".reaction-badge");
  if (!el || el !== badgePress.badge) {
    badgePress.badge = null;
    return;
  }

  if (!badgePress.long) {
    const msgEl = badgeMsgEl(el);
    if (msgEl) toggleReaction(msgEl, el.dataset.emoji);
  }

  badgePress.badge = null;
});

document.addEventListener("touchstart", (e) => {
  if (e.target.closest(".reaction-badge") || e.target.closest(".badges") || e.target.closest(".meta") || e.target.closest(".profile-icon")) {
    e.stopPropagation();
  }
}, { passive: true });

document.addEventListener("click", (e) => {
  const target = e.target;

  if (isDesktop()) {
    const reaction = target.closest(".reaction-badge");
    if (reaction) {
      e.stopPropagation();
      suppressNextActionMenu = true;

      const msgEl = badgeMsgEl(reaction);
      if (msgEl) toggleReaction(msgEl, reaction.dataset.emoji);
      return;
    }
  }

  if (!target.closest(".badge-selector")) {
    badgeDropdown.classList.add("hidden");
  }

  if (!target.closest("#reaction-picker") && !target.closest(".action-menu")) {
    closeReactionPicker?.();
    closeAllMenus?.();
  }
}, true);

window.addEventListener("scroll", () => {
  hideBadgeTooltip();
  hideReactionTooltip();
}, { passive: true });

messagesViewport?.addEventListener("scroll", () => {
  const distanceFromBottom = messagesViewport.scrollHeight - messagesViewport.scrollTop - messagesViewport.clientHeight;
  const atBottom = distanceFromBottom < 20;
  userIsAtBottom = atBottom;

  if (atBottom) {
    hideNewMsgIndicator();
    jumpBtn?.classList.remove("show");
  } else {
    if (distanceFromBottom > 150) jumpBtn?.classList.add("show");
    else jumpBtn?.classList.remove("show");
  }

  hasScrolledSinceTouch = true;
  clearTimeout(pressTimer);
  clearTimeout(tooltipPressTimer);

  hideReactionTooltip();
  hideBadgeTooltip();
  closeReactionPicker();
}, { passive: true });

window.addEventListener("resize", () => {
  if (resizeTimer) cancelAnimationFrame(resizeTimer);
  resizeTimer = requestAnimationFrame(() => {
    document.querySelectorAll(".msg").forEach(positionActions);
    document.querySelectorAll(".msg").forEach(positionIcons);
  });
});

function longPressListener(msgEl) {
  if (!msgEl) return;
  let pressTimer;

  const start = (e) => {
    hasScrolledSinceTouch = false;

    if ([".reaction-badge",".badges",".badge",".meta",".meta *",".profile-icon"].some(sel => e.target.closest(sel))) return;

    if (!(window.innerWidth <= 900)) return;
    if (hasScrolledSinceTouch) return;

    try { e.preventDefault(); } catch (err) { }

    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    pressTimer = setTimeout(() => { openMobileActionMenu(msgEl); }, 420);
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

function swipeToReply(msgEl) {
  let startX = 0;
  let swiping = false;
  const isMine = msgEl.classList.contains("me");

  const TRIGGER_DISTANCE = 120;
  const MAX_DRAG = 60; // 80

  msgEl.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    swiping = true;
  });

  msgEl.addEventListener("touchmove", e => {
    if (!swiping) return;
    const deltaX = e.touches[0].clientX - startX;

    if (isMine && deltaX > 0) return;
    if (!isMine && deltaX < 0) return;

    if (Math.abs(deltaX) < MAX_DRAG) {
      msgEl.style.transform = `translateX(${deltaX}px)`;
    }

    if (!isMine && deltaX > TRIGGER_DISTANCE) {
      swiping = false;
      triggerReplySwipe(msgEl, deltaX);
      return;
    }

    if (isMine && deltaX < -TRIGGER_DISTANCE) {
      swiping = false;
      triggerReplySwipe(msgEl, deltaX);
      return;
    }
  });

  msgEl.addEventListener("touchend", () => {
    msgEl.style.transform = "";
    msgEl.style.transition = "transform 0.15s ease";
    setTimeout(() => (msgEl.style.transition = ""), 150);
    swiping = false;
  });
}

function chatSideBar() {
  if (!sidebar || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    if (isMobile()) {
      const isOpen = sidebar.classList.toggle("open");
      if (backdrop) backdrop.classList.toggle("show", isOpen);
    } else {
      sidebar.classList.toggle("collapsed");
      sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("show");
    }
  });

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("open");
      backdrop.classList.remove("show");
    });
  }

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("show");
    }

    if (isMobile()) {
      sidebar.classList.remove("collapsed");
    }
  });
}

jumpBtn?.addEventListener("click", () => {
  messagesViewport.scrollTo({
    top: messagesViewport.scrollHeight,
    behavior: "smooth"
  });

  jumpBtn.classList.remove("show");
  hideNewMsgIndicator();
});

document.addEventListener("DOMContentLoaded", chatSideBar);

/* ================= JOIN & PRESENCE ================= */
async function join(name) {
  if (!authReady || !user) {
    pendingJoin = { name };
    return;
  }

  if (!firebase.auth().currentUser) {
    console.log("[JOIN] No authenticated user — aborting");
    return;
  }

  accountId = user.uid;
  displayName = (name || "").trim() || "Guest";

  if (promptEl) promptEl.style.display = "none";
  const userRef = usersRef.child(accountId);

  try {
    const snap = await userRef.once("value");

    if (!snap.exists()) {
      if (user.email) {
        const emailQuery = await usersRef.orderByChild("email").equalTo(user.email).once("value");

        if (emailQuery.exists()) {
          alert("An account with this Google email already exists.");
          await firebase.auth().signOut();
          return;
        }
      }

      console.log("[JOIN] Creating new account:", accountId);

      const payload = {
        username: displayName,
        sessionVersion: 1,
        chatTheme: "dark",
        profileIcon: "zendra_blue",
        experience: {
          level: 1,
          zxp: 0,
          messageCount: 0
        },
        badges: { Starter: true },
        typing: { typing: false, ts: 0 },
        created: Date.now(),
        lastActive: Date.now(),
        timeout: 0
      };

      await userRef.set(payload);
      location.reload();
    } else {
      console.log("[JOIN] Existing account:", accountId);
      await userRef.update({ lastActive: Date.now() });
      const userData = snap.val();
      localStorage.setItem("z_sessionVersion", userData.sessionVersion);

      if (userData?.chatTheme && THEMES[userData.chatTheme]) {
        applyTheme(THEMES[userData.chatTheme]);
      } else {
        applyTheme(THEMES.dark);
      }
    }

    if (await userHasAccount(accountId)) {
      sessionListener(accountId);
      attachPresenceListener();
    }
    console.log("[JOIN] Complete — active UID:", accountId);
  } catch (err) {
    console.error("[JOIN ERROR]", err);
  }
}

function attachPresenceListener() {
  if (presenceListenerAttached) return;
  presenceListenerAttached = true;
  presenceRef.on("value", snap => {
    renderPresence(snap.val() || {});
  });
}

async function userHasAccount(uid) {
  const snap = await usersRef.child(uid).once("value");
  return snap.exists();
}

let connectedRef = null;

function setupPresence(uid) {
  if (!uid) return;
  if (connectedRef) connectedRef.off();
  if (myPresenceRef) myPresenceRef.onDisconnect().cancel();

  connectedRef = firebase.database().ref(".info/connected");
  myPresenceRef = firebase.database().ref("presence").child(uid);

  connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
      myPresenceRef.onDisconnect().remove().then(() => { myPresenceRef.set(Date.now()); });
    }
  });
}

function refreshPresenceUI() {
  firebase.database().ref("presence").once("value").then(snap => {
    renderPresence(snap.val() || {});
  });
}

function renderPresence(list) {
  const entries = Object.entries(list);

  if (presenceEl) presenceEl.innerHTML = "";
  if (onlineCountEl) onlineCountEl.textContent = entries.length + " online";

  for (const [uid] of entries) {
    const userData = allUsers[uid] || {};
    const name = userData.username || "Unknown User";
    const icon = userData.profileIcon || "zendra_blue";
    const googlePhoto = userData.google?.IconURL || null;
    const equippedBadge = getEquippedBadge(userData.badges);

    const el = document.createElement("div");
    el.className = "presence-item";

    el.innerHTML = `
      <div class="presence-left">
        ${icon === "google" && googlePhoto ? `<img class="presence-icon google-avatar" src="${googlePhoto}" />` : `<img class="presence-icon" src="../Assets/Icons/${icon}.png" />`}
        <div class="presence-name-wrapper">
          <div class="presence-name">${escapeHtml(name)}</div>
          ${equippedBadge ? `
            <div class="presence-badge">
              <img src="../Assets/Badges/${equippedBadge}.png" />
              <span>${formatBadgeName(equippedBadge).replace(" Badge", "")}</span>
            </div>` : ""}
        </div>
      </div>`;

    presenceEl.appendChild(el);
  }
}

joinBtn.onclick = async () => {
  const n = promptName.value.trim();
  const validRegex = /^[A-Za-z0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/;
  promptErrorEl.textContent = "";

  if (n.length < 3) {
    promptErrorEl.textContent = "Username must be at least 3 characters.";
    return;
  }

  if (n.length > 15) {
    promptErrorEl.textContent = "Username must be at most 15 characters.";
    return;
  }

  if (!validRegex.test(n)) {
    promptErrorEl.textContent = "Username can only contain letters, numbers, and symbols.";
    return;
  }

  try {
    const snap = await usersRef.orderByChild("username").once("value");
    let exists = false;

    snap.forEach((child) => {
      if (child.val().username.toLowerCase() === name.toLowerCase()) {
        exists = true;
        return true;
      }
    });

    if (exists) {
      promptErrorEl.textContent = "That username is already taken.";
    }
  } catch (err) {
    promptErrorEl.textContent = "Error checking username.";
    return;
  }

  join(n);
};

googleBtn.onclick = async () => {
  promptErrorEl.textContent = "";

  try {
    const result = await firebase.auth().signInWithPopup(googleProvider);
    const user = result.user;
    const userRef = usersRef.child(user.uid);
    const snap = await userRef.once("value");

    if (snap.exists()) {
      promptEl.style.display = "none";
      join();
      return;
    }

    showGoogleUsernamePrompt(user);
  } catch (err) {
    if (err.code === "auth/popup-closed-by-user") return;
    console.error(err);
    promptErrorEl.textContent = "Google login failed. Please try again.";
  }
};

function showGoogleUsernamePrompt(user) {
  promptEl.style.display = "none";
  googlePrompt.style.display = "flex";
  googleInput.value = user.displayName || "";
  googleInput.focus();
}

googleConfirm.onclick = async () => {
  const name = googleInput.value.trim();
  const validRegex = /^[A-Za-z0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/;
  googleError.textContent = "";

  if (name.length < 3) {
    googleError.textContent = "Username must be at least 3 characters.";
    return;
  }

  if (name.length > 15) {
    googleError.textContent = "Username must be at most 15 characters.";
    return;
  }

  if (!validRegex.test(name)) {
    googleError.textContent = "Username can only contain letters, numbers, and symbols.";
    return;
  }

  try {
    const snap = await usersRef.orderByChild("username").once("value");
    let exists = false;

    snap.forEach((child) => {
      if (child.val().username.toLowerCase() === name.toLowerCase()) {
        exists = true;
        return true;
      }
    });

    if (exists) googleError.textContent = "That username is already taken.";

    const user = firebase.auth().currentUser;
    const uid = user.uid;
    const googleProviderData = user.providerData.find(p => p.providerId === "google.com");

    await usersRef.child(uid).set({
      username: name,
      sessionVersion: 1,
      chatTheme: "dark",
      profileIcon: "zendra_blue",

      google: googleProviderData ? {
        IconURL: googleProviderData.photoURL || null,
        email: googleProviderData.email || null,
        emailVerified: googleProviderData.emailVerified || false
      } : null,

      authProvider: "google",

      experience: {
        level: 1,
        zxp: 0,
        messageCount: 0
      },

      badges: { Starter: true },
      typing: { typing: false, ts: 0 },

      created: Date.now(),
      lastActive: Date.now(),
      timeout: 0,
    });

    googlePrompt.style.display = "none";
    location.reload();
    join(name);
  } catch (err) {
    console.error(err);
    googleError.textContent = "Error creating account. Try again.";
  }
};

setInterval(() => {
  if (heatSystem.heat > 0) {
    heatSystem.heat = Math.max(0, heatSystem.heat - heatSystem.decayRate);
    // updateHeatUI();
  }
}, 1000);

setInterval(() => {
  const timeEls = Array.from(document.querySelectorAll(".time"));
  const last = timeEls.slice(-120);
  for (const el of last) {
    const ts = Number(el.dataset.timestamp);
    if (!ts) continue;
    if (!el.classList.contains("hidden")) el.textContent = timeAgo(ts);
  }
}, 30000);

const setAppHeight = () => {
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${vh}px`);
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", setAppHeight);
  window.visualViewport.addEventListener("scroll", setAppHeight);
}
setAppHeight();

let lastVH = window.visualViewport.height;
window.visualViewport.addEventListener("resize", () => {
  const vh = window.visualViewport.height;
  if (vh < lastVH) {
    document.body.style.overflow = "hidden";
    messagesScroll.scrollTop += 280;
  } else document.body.style.overflow = "";
  lastVH = vh;
});