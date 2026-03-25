const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "album",
    aliases: ["al"],
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 2,
    role: 0,
    shortDescription: "𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨 Random",
    longDescription: "Random album videos",
    category: "media"
  },

  albumSystem: new Map(),
  albumBaseUrl: null,
  videoQueue: new Map(),

  categoryMap: {
    "𝐀𝐙𝐀𝐃𝐗𝟔𝟗𝐗𝐅𝐅": "Azadx69xff",
    "𝐀𝐧𝐢𝐦𝐞": "anime",
    "𝐀𝐨𝐓": "aot",
    "𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞": "attitude",
    "𝐁𝐚𝐛𝐲": "baby",
    "𝐂𝐚𝐭": "cat",
    "𝐂𝐨𝐮𝐩𝐥𝐞": "couple",
    "𝐃𝐫𝐚𝐠𝐨𝐧𝐁𝐚𝐥𝐥": "dragonball",
    "𝐅𝐥𝐨𝐰𝐞𝐫": "flower",
    "𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥": "football",
    "𝐅𝐫𝐞𝐞𝐅𝐢𝐫𝐞": "freefire",
    "𝐅𝐫𝐢𝐞𝐧𝐝𝐬": "friends",
    "𝐅𝐮𝐧𝐧𝐲": "funny",
    "𝐇𝐨𝐫𝐧𝐲": "horny",
    "𝐇𝐨𝐭": "hot",
    "𝐈𝐬𝐥𝐚𝐦𝐢𝐜": "islamic",
    "𝐋𝐨𝐅𝐈": "lofi",
    "𝐋𝐨𝐯𝐞": "love",
    "𝐋𝐲𝐫𝐢𝐜𝐬": "lyrics",
    "𝐒𝐚𝐝": "sad"
  },

  async loadAlbumBaseUrl() {
    if (this.albumBaseUrl) return;
    try {
      const res = await axios.get(
        "https://raw.githubusercontent.com/ncazad/Azad69x/main/baseApiUrl.json"
      );
      this.albumBaseUrl = res.data.album?.replace(/\/$/, "") || null;
      console.log("Album API base URL loaded:", this.albumBaseUrl);
    } catch (e) {
      console.error("Failed to load album base URL:", e.message);
      this.albumBaseUrl = null;
    }
  },

  async fetchAlbumVideo(category) {
    await this.loadAlbumBaseUrl();
    if (!this.albumBaseUrl) return null;

    if (!this.videoQueue.has(category) || this.videoQueue.get(category).length === 0) {
      try {
        const res = await axios.get(`${this.albumBaseUrl}/api/album?category=${encodeURIComponent(category)}`, {
          timeout: 10000
        });

        let videos = [];
        if (res.data?.url) videos.push(res.data.url);
        if (res.data?.videos?.length) videos = videos.concat(res.data.videos);
        if (res.data?.data?.url) videos.push(res.data.data.url);
        if (res.data?.data?.videos?.length) videos = videos.concat(res.data.data.videos);
        if (Array.isArray(res.data)) videos = res.data;

        videos = videos.filter(url => url && (url.includes('http://') || url.includes('https://')));

        if (!videos.length) return null;

        this.videoQueue.set(category, this.shuffleArray(videos));
      } catch (e) {
        console.error(`Failed to fetch video for ${category}:`, e.message);
        return null;
      }
    }

    const queue = this.videoQueue.get(category);
    if (!queue || queue.length === 0) return null;

    const videoUrl = queue.shift();
    this.videoQueue.set(category, queue);
    return videoUrl;
  },

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  async uploadToCatbox(videoPath) {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(videoPath));

    try {
      const res = await axios.post("https://catbox.moe/user/api.php", form, { 
        headers: form.getHeaders(),
        timeout: 30000 
      });
      return res.data.trim();
    } finally {
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }
  },

  getCategoryMessage(category, displayName) {
    const messages = {
      "Azadx69xff": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐙𝐀𝐃𝐗𝟔𝟗𝐗𝐅𝐅 𝐕𝐢𝐝𝐞𝐨 <🐼",
      "anime": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐧𝐢𝐦𝐞 𝐕𝐢𝐝𝐞𝐨 <🎌",
      "aot": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐨𝐓 𝐕𝐢𝐝𝐞𝐨 <⚡",
      "attitude": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞 𝐕𝐢𝐝𝐞𝐨 <☠️",
      "baby": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐁𝐚𝐛𝐲 𝐕𝐢𝐝𝐞𝐨 <🐥",
      "cat": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐚𝐭 𝐕𝐢𝐝𝐞𝐨 <🐱",
      "couple": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐂𝐨𝐮𝐩𝐥𝐞 𝐕𝐢𝐝𝐞𝐨 <💑",
      "dragonball": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐃𝐫𝐚𝐠𝐨𝐧𝐁𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 <🐉",
      "flower": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐥𝐨𝐰𝐞𝐫 𝐕𝐢𝐝𝐞𝐨 <🌸",
      "football": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐨𝐨𝐭𝐛𝐚𝐥𝐥 𝐕𝐢𝐝𝐞𝐨 <⚽",
      "freefire": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐫𝐞𝐞 𝐅𝐢𝐫𝐞 𝐕𝐢𝐝𝐞𝐨 <🔥",
      "friends": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐕𝐢𝐝𝐞𝐨 <👭",
      "funny": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐅𝐮𝐧𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 <🤣",
      "horny": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐇𝐨𝐫𝐧𝐲 𝐕𝐢𝐝𝐞𝐨 <🥵",
      "hot": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝟏𝟖+ 𝐕𝐢𝐝𝐞𝐨 <💦",
      "islamic": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐈𝐬𝐥𝐚𝐦𝐢𝐜 𝐕𝐢𝐝𝐞𝐨 <🕋",
      "lofi": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐅𝐈 𝐕𝐢𝐝𝐞𝐨 <🎶",
      "love": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐨𝐯𝐞 𝐕𝐢𝐝𝐞𝐨 <🤍",
      "lyrics": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐋𝐲𝐫𝐢𝐜𝐬 𝐕𝐢𝐝𝐞𝐨 <🎵",
      "sad": "𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 𝐒𝐚𝐝 𝐕𝐢𝐝𝐞𝐨 <😢"
    };
    return messages[category] || `𝐇𝐞𝐫𝐞 𝐲𝐨𝐮𝐫 ${displayName} 𝐕𝐢𝐝𝐞𝐨 <🎬`;
  },

  onStart: async function ({ message, event, args }) {
    const displayNames = Object.keys(this.categoryMap);
    const itemsPerPage = 10;
    const page = parseInt(args[0]) || 1;
    const totalPages = Math.ceil(displayNames.length / itemsPerPage);

    if (page < 1 || page > totalPages) 
      return message.reply("❌ Invalid page number!");

    const startIndex = (page - 1) * itemsPerPage;
    const categoriesToShow = displayNames.slice(startIndex, startIndex + itemsPerPage);

    let text = "𐙚━━━━━━━━━━━━━━𐙚\n";
    text += "🎀𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨🎀\n";
    text += "𐙚━━━━━━━━━━━━━━𐙚\n\n";

    categoriesToShow.forEach((cat, i) => {
      text += ` ➥${startIndex + i + 1}. ${cat}\n`;
    });

    text += "𐙚━━━━━━━━━━━━━━𐙚\n";
    text += `📄 𝐏𝐚𝐠𝐞: ${page}/${totalPages}\n`;
    text += "💬 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 𝐭𝐨 𝐠𝐞𝐭 𝐚 𝐯𝐢𝐝𝐞𝐨 🐱\n";
    text += "𐙚━━━━━━━━━━━━━━𐙚";

    const sent = await message.reply(text);

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "album",
      author: event.senderID,
      pageCategories: categoriesToShow.map(cat => this.categoryMap[cat]),
      pageDisplayNames: categoriesToShow,
      messageID: sent.messageID
    });
  },

  onReply: async function ({ message, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    const num = parseInt(event.body);
    if (isNaN(num) || num < 1) return message.reply("❌ Please reply with a valid number!");

    const index = num - 1;
    const category = Reply.pageCategories[index];
    const displayName = Reply.pageDisplayNames[index];
    if (!category) return message.reply("❌ Invalid number!");

    let stream = null;
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const videoUrl = await this.fetchAlbumVideo(category);
      if (!videoUrl) break;
      try {
        stream = await global.utils.getStreamFromURL(videoUrl);
        if (stream) break;
      } catch {}
    }

    if (!stream) return message.reply(`❌ No video found for ${displayName}.`);

    try { await message.unsend(Reply.messageID); } catch {}

    const categoryMessage = this.getCategoryMessage(category, displayName);

    try {
      await message.reply({ body: categoryMessage, attachment: stream });
    } catch (e) {
      return message.reply(`❌ Error sending video: ${e.message}`);
    }
  }
};
