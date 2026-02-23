const axios = require("axios");

module.exports = {
  config: {
    name: "mnm",
    aliases: [],
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    shortDescription: "𝐌𝐍𝐌 𝐞𝐟𝐟𝐞𝐜𝐭 𝐨𝐧 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐩𝐢𝐜",
    longDescription: "𝐀𝐩𝐩𝐥𝐲 𝐌𝐍𝐌 𝐞𝐟𝐟𝐞𝐜𝐭 𝐭𝐨 𝐮𝐬𝐞𝐫'𝐬 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐩𝐢𝐜𝐭𝐮𝐫𝐞",
    category: "fun",
    guide: {
      en: "{pn} (𝐫𝐞𝐩𝐥𝐲 𝐨𝐫 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐨𝐫 𝐧𝐨𝐧𝐞)"
    }
  },

  onStart: async function ({ event, message, args, usersData }) {
    try {

      let targetID =
        (event.type === "message_reply" && event.messageReply?.senderID) ||
        (event.mentions && Object.keys(event.mentions)[0]) ||
        event.senderID;

      const name = await usersData.getName(targetID).catch(() => "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐔𝐬𝐞𝐫");
      const avatarURL = await usersData.getAvatarUrl(targetID);
      
      const apiURL = `https://azadx69x-all-apis-top.vercel.app/api/mnm?image=${encodeURIComponent(avatarURL)}`;
      const stream = await global.utils.getStreamFromURL(apiURL);
      
      const replyText = `🦧 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐭𝐡𝐞 𝑴𝑵𝑴 𝐞𝐟𝐟𝐞𝐜𝐭 𝐨𝐟 ${name}’𝐬`;

      return message.reply({
        body: replyText,
        attachment: stream
      });

    } catch (err) {
      console.error("MNM CMD ERROR:", err);

      return message.reply("❌ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐌𝐍𝐌 𝐢𝐦𝐚𝐠𝐞.");
    }
  }
};
