const axios = require("axios");

module.exports = {
  config: {
    name: "fakechat",
    aliases: ["fc"],
    version: "1.0",
    author: "error",
    countDown: 5,
    role: 0,
    shortDescription: "fakechat",
    longDescription: "generate fakechat",
    category: "fun",
    guide: {
      en: "{pn} @tag or reply to a message"
    }
  },

  langs: {
    en: {
      noTag: "you must tag or reply to a message",
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      const text = args.join(" ");
      let uid = Object.keys(event.mentions || {})[0];

      if (!uid && event.type === "message_reply") {
        uid = event.messageReply.senderID;
      }

      if (!uid) return message.reply(getLang("noTag"));

      if (uid === "100068909067279") {
        return message.reply("Muri khaw baby");
      }

      const avatar = await usersData.getAvatarUrl(uid);
      
      const hasan = "https://hasan-all-apis.onrender.com";

      const imgurl = await axios.get(`${hasan}/imgbb?imageUrl=${encodeURIComponent(avatar)}`);

      const pic = imgurl.data.imageUrl;
      const userName = await usersData.getName(uid);
      

      const response = await axios.get(
        `${hasan}/fc?msg=${encodeURIComponent(text)}&name=${encodeURIComponent(userName)}&url=${encodeURIComponent(pic)}`,
        { responseType: "stream" }
      );

      message.reply({ attachment: response.data });

    } catch (error) {
      console.error("API Request Failed:", error);
      message.reply("fetching some error please try again later");
    }
  }
};
