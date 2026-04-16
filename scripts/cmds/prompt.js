const axios = require("axios");

const baseApi = "https://azadx69x.is-a.dev/api/prompt";

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p"],
    version: "0.0.5",
    role: 0,
    author: "Azadx69x",
    category: "ai",
    cooldowns: 3,
    guide: { en: "Reply to an image to generate an AI prompt" }
  },

  onStart: async ({ api, event }) => {
    const { threadID, messageID, messageReply } = event;
    
    if (
      !messageReply ||
      !messageReply.attachments ||
      messageReply.attachments.length === 0 ||
      !messageReply.attachments[0].url
    ) {
      return api.sendMessage("⚠️ Please reply to an image to generate a prompt.", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const imageUrl = messageReply.attachments[0].url;
      const apiUrl = `${baseApi}?url=${encodeURIComponent(imageUrl)}`;
      
      const response = await axios.get(apiUrl);
      const json = response.data;
      
      if (!json || !json.data || !json.data.prompt) {
        throw new Error("❌ No prompt found.");
      }

      const promptText = json.data.prompt;
      
      await api.sendMessage({ body: `🐦 Generated Prompt:\n\n${promptText}`, skipFontStyle: true }, threadID, messageID);
      
      api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);

      let msg = "Error while generating prompt.";
      if (e.response?.data?.error) msg = e.response.data.error;
      else if (e.message) msg = e.message;

      api.sendMessage(msg, threadID, messageID);
    }
  }
};
