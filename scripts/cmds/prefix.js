const fs = require("fs-extra");
const { utils } = global;

const BOT_NAME = "X69X BOT V2"; // Don't change
const PREFIX_CHECK_GIF = "https://i.ibb.co/5X9T2dDN/image0.gif";

function getBDDate() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

function formatDate(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return {
    day: date.getDate(),
    month: months[date.getMonth()],
    year: date.getFullYear(),
    dayName: days[date.getDay()],
    formatted: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  };
}

async function getUserFirstName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    if (userInfo[userID]?.name) return userInfo[userID].name.split(" ")[0] || userInfo[userID].name;
  } catch (err) {
    console.error("[prefix.js - getUserFirstName]", err);
  }
  return "User";
}

module.exports = {
  config: {
    name: "prefix",
    version: "0.0.8",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: "Change or check bot prefix in your chat or globally",
    category: "config",
    guide: {
      en: "{pn} <new prefix>: change prefix in your chat\n"
        + "Example: {pn} #\n"
        + "{pn} <new prefix> -g: change prefix globally (admin only)\n"
        + "Example: {pn} # -g\n"
        + "{pn} reset: reset prefix in your chat\n"
        + "{pn} or just type 'prefix' to check current prefix",
      vi: "{pn} <new prefix>: change prefix in your chat\n"
        + "Example: {pn} #\n"
        + "{pn} <new prefix> -g: change prefix globally (admin only)\n"
        + "Example: {pn} # -g\n"
        + "{pn} reset: reset prefix in your chat\n"
        + "{pn} or just type 'prefix' to check current prefix"
    }
  },

  langs: {
    en: {
      reset: "✅ Prefix has been reset to default: %1",
      onlyAdmin: "⛔ Only admin can change system-wide prefix",
      confirmGlobal: "Please react to confirm system-wide prefix change",
      confirmThisThread: "Please react to confirm thread prefix change",
    },
    vi: {
      reset: "Đã reset prefix về mặc định: %1",
      onlyAdmin: "Chỉ admin mới có thể thay đổi prefix toàn hệ thống",
      confirmGlobal: "Vui lòng react để xác nhận thay đổi prefix toàn hệ thống",
      confirmThisThread: "Vui lòng react để xác nhận thay đổi prefix nhóm chat",
    }
  },
  
  onStart: async function (ctx) {
    try {
      const { message, role, args, event, threadsData, getLang, api, commandName } = ctx;
      if (!args[0]) return message.SyntaxError?.();

      const now = getBDDate();
      const currentTime = formatTime(now);
      const currentDate = formatDate(now);
      const userName = await getUserFirstName(api, event.senderID);
      
      if (args[0] === "reset") {
        await threadsData.set(event.threadID, null, "data.prefix");
        return message.reply(`
┍━━━[  🤖 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧  ]━━━◊
┋
┋➥ 😀 Hey ${userName}
┋
┋➥ 🕰️ Time : ${currentTime}
┋➥ 🌊 Date : ${currentDate.formatted}
┋➥ 🌤️ Day  : ${currentDate.dayName}
┋➥ 🔧 Prefix has been reset to default: ${global.GoatBot.config.prefix}
┋➥ 😊 ${BOT_NAME} AT YOUR SERVICE
┕━━━━━━━━━━━━━━━━━━━━━◊
`.trim());
      }

      const newPrefix = args[0];
      if (!newPrefix || newPrefix.length > 5) return message.reply("⛔ Invalid prefix. Use 1-5 characters only.");

      const formSet = {
        commandName,
        author: event.senderID,
        newPrefix,
        timestamp: Date.now(),
        setGlobal: args[1] === "-g"
      };

      if (formSet.setGlobal && role < 2) return message.reply(getLang("onlyAdmin"));
      const confirmText = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");

      const boxConfirm = `
┍━━━[  🤖 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧  ]━━━◊
┋
┋➥ 😀 Hey ${userName}
┋
┋➥ 🕰️ Time : ${currentTime}
┋➥ 🌊 Date : ${currentDate.formatted}
┋➥ 🌤️ Day  : ${currentDate.dayName}
┋➥ 🔧 New Prefix : ${newPrefix}
┋➥ 📝 Action    : ${confirmText}
┋➥ 😊 ${BOT_NAME} AT YOUR SERVICE
┕━━━━━━━━━━━━━━━━━━━━━◊
`.trim();

      return message.reply(boxConfirm, (err, info) => {
        if (err) return console.error("[prefix.js - reply error]", err);
        if (!global.GoatBot.onReaction) global.GoatBot.onReaction = new Map();
        formSet.messageID = info.messageID;
        formSet.userName = userName;
        global.GoatBot.onReaction.set(info.messageID, formSet);

        setTimeout(() => global.GoatBot.onReaction?.delete(info.messageID), 30 * 60 * 1000);
      });
    } catch (err) {
      console.error("[prefix.js - onStart]", err);
      const now = getBDDate();
      const currentTime = formatTime(now);
      const currentDate = formatDate(now);
      message.reply(`
┍━━━[  🤖 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧  ]━━━◊
┋
┋➥ ⚠️ ERROR OCCURRED
┋➥ 🕰️ Time : ${currentTime}
┋➥ 🌊 Date : ${currentDate.formatted}
┋➥ 🌤️ Day  : ${currentDate.dayName}
┋➥ 📝 Message: ${err.message || "Unknown error"}
┋➥ 😊 ${BOT_NAME} AT YOUR SERVICE
┕━━━━━━━━━━━━━━━━━━━━━◊
`.trim());
    }
  },
  
  onReaction: async function (ctx) {
    try {
      const { message, event, Reaction, threadsData, api } = ctx;
      if (!Reaction || event.userID !== Reaction.author) return;

      const { newPrefix, setGlobal, messageID, userName } = Reaction;
      const changedByName = userName || await getUserFirstName(api, event.userID);
      const now = getBDDate();
      const currentTime = formatTime(now);
      const currentDate = formatDate(now);

      if (setGlobal) global.GoatBot.config.prefix = newPrefix;
      else await threadsData.set(event.threadID, newPrefix, "data.prefix");
      if (setGlobal) await fs.writeFile(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));

      const boxSuccess = `
┍━━━[  🤖 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧  ]━━━◊
┋
┋➥ 😀 Hey ${changedByName}
┋
┋➥ 🕰️ Time : ${currentTime}
┋➥ 🌊 Date : ${currentDate.formatted}
┋➥ 🌤️ Day  : ${currentDate.dayName}
┋➥ 🔧 New Prefix : ${newPrefix}
┋➥ 😊 ${BOT_NAME} AT YOUR SERVICE
┕━━━━━━━━━━━━━━━━━━━━━◊
`.trim();

      await message.reply(boxSuccess);
      try { await message.unsend(messageID); } catch {}
      global.GoatBot.onReaction?.delete(messageID);

    } catch (err) {
      console.error("[prefix.js - onReaction]", err);
    }
  },
  
  onChat: async function (ctx) {
    try {
      const { event, message, api, threadsData } = ctx;
      const msgBody = (event.body || '').trim().toLowerCase();
      if (msgBody !== "prefix") return;

      const userName = await getUserFirstName(api, event.senderID);
      const threadPrefix = await threadsData.get(event.threadID, "data.prefix").catch(() => null);
      const chatPrefix = threadPrefix || global.GoatBot.config.prefix;
      const now = getBDDate();
      const currentTime = formatTime(now);
      const currentDate = formatDate(now);

      const boxMessage = `
┍━━━[  🤖 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧  ]━━━◊
┋
┋➥ 😀 Hey ${userName}
┋
┋➥ 🕰️ Time : ${currentTime}
┋➥ 🌊 Date : ${currentDate.formatted}
┋➥ 🌤️ Day  : ${currentDate.dayName}
┋➥ 🌐 Global Prefix: ${global.GoatBot.config.prefix}
┋➥ 🛸 Chat Prefix  : ${chatPrefix}
┋➥ 😊 ${BOT_NAME} AT YOUR SERVICE
┕━━━━━━━━━━━━━━━━━━━━━◊
`.trim();

      let stream = null;
      try { stream = await utils.getStreamFromURL(PREFIX_CHECK_GIF); } catch {}
      return message.reply(stream ? { body: boxMessage, attachment: stream } : boxMessage);

    } catch (err) {
      console.error("[prefix.js - onChat]", err);
    }
  },
  
  onLoad: function() {
    if (global.prefixCleanupInterval) clearInterval(global.prefixCleanupInterval);
    global.prefixCleanupInterval = setInterval(() => {
      if (!global.GoatBot.onReaction) return;
      const now = Date.now();
      for (const [messageID, data] of global.GoatBot.onReaction.entries()) {
        if (now - (data.timestamp || 0) > 30 * 60 * 1000) global.GoatBot.onReaction.delete(messageID);
      }
    }, 10 * 60 * 1000);
  },

  onUnload: function() {
    if (global.prefixCleanupInterval) {
      clearInterval(global.prefixCleanupInterval);
      delete global.prefixCleanupInterval;
    }
  }
};
