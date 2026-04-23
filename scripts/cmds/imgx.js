const axios = require("axios");

module.exports = {
  config: {
    name: "imgx",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Generate image",
    longDescription: "Generate AI image",
    category: "image",
    guide: "{pn} [prompt]"
  },

  onStart: async function ({ api, event, args }) {

    const react = (e) => api.setMessageReaction(e, event.messageID, () => {}, true);

    try {
      const prompt = args.join(" ");

      if (!prompt) {
        react("⚠️");
        return api.sendMessage("⚠️ | Please provide a prompt", event.threadID);
      }

      react("⏳");

      const url = `https://azadx69x.is-a.dev/api/magicstudio?prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(url, { responseType: "stream" });

      react("✅");

      api.sendMessage({
        body: `🖼️ MagicStudio image Generated!\n📝 Prompt: ${prompt}`,
        attachment: res.data
      }, event.threadID);

    } catch (e) {
      console.log(e);
      react("❌");
      api.sendMessage("❌ | Failed to generate image", event.threadID);
    }
  }
};
