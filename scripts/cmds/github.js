const axios = require("axios");

module.exports = {
  config: {
    name: "github",
    aliases: [],
    version: "1.1",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    shortDescription: "Get GitHub user info",
    longDescription: "Fetch GitHub user info and show profile data with fancy text",
    category: "owner",
    guide: {
      en: "{pn} <username>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (!args[0]) {
        return api.sendMessage(
          "⛔ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐆𝐢𝐭𝐇𝐮𝐛 𝐮𝐬𝐞𝐫𝐧𝐚𝐦𝐞.",
          event.threadID,
          event.messageID
        );
      }

      const username = args[0];
      const apiURL = `https://azadx69x-all-apis-top.vercel.app/api/github?user=${encodeURIComponent(username)}`;

      const res = await axios.get(apiURL);
      const data = res.data.data;

      if (!data) {
        return api.sendMessage(
          `❌ 𝐍𝐨 𝐆𝐢𝐭𝐇𝐮𝐛 𝐮𝐬𝐞𝐫 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐮𝐬𝐞𝐫𝐧𝐚𝐦𝐞: ${username}`,
          event.threadID,
          event.messageID
        );
      }
      
      const replyText = `
𝐆𝐢𝐭𝐇𝐮𝐛 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 𝐈𝐧𝐟𝐨 👀
🧑‍💻 𝐍𝐚𝐦𝐞: ${data.name || "𝐍𝐨𝐧𝐞"}
👤 𝐔𝐬𝐞𝐫: ${data.user || "𝐍𝐨𝐧𝐞"}
🏢 𝐂𝐨𝐦𝐩𝐚𝐧𝐲: ${data.company || "𝐍𝐨𝐧𝐞"}
🌐 𝐁𝐥𝐨𝐠: ${data.blog || "𝐍𝐨𝐧𝐞"}
📍 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧: ${data.location || "𝐍𝐨𝐧𝐞"}
📧 𝐄𝐦𝐚𝐢𝐥: ${data.email || "𝐍𝐨𝐧𝐞"}
📝 𝐁𝐢𝐨: ${data.bio || "𝐍𝐨𝐧𝐞"}
🐦 𝐓𝐰𝐢𝐭𝐭𝐞𝐫: ${data.twitter || "𝐍𝐨𝐭 𝐬𝐞𝐭"}
📦 𝐏𝐮𝐛𝐥𝐢𝐜 𝐑𝐞𝐩𝐨𝐬: ${data.public_repos || 0}
🗃 𝐏𝐮𝐛𝐥𝐢𝐜 𝐆𝐢𝐬𝐭𝐬: ${data.public_gists || 0}
👥 𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬: ${data.followers || 0}
👣 𝐅𝐨𝐥𝐥𝐨𝐰𝐢𝐧𝐠: ${data.following || 0}
📆 𝐂𝐫𝐞𝐚𝐭𝐞𝐝: ${new Date(data.created_at).toDateString()}
🔄 𝐔𝐩𝐝𝐚𝐭𝐞𝐝: ${new Date(data.updated_at).toDateString()}
`;

      await api.sendMessage(
        {
          body: replyText,
          attachment: await global.utils.getStreamFromURL(data.avatar)
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("[GITHUB CMD ERROR]", err);
      return api.sendMessage(
        "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐭 𝐆𝐢𝐭𝐇𝐮𝐛 𝐮𝐬𝐞𝐫 𝐢𝐧𝐟𝐨.",
        event.threadID,
        event.messageID
      );
    }
  }
};
