const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    author: "Azadx69x",// api by mahmud
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: { en: "Generates a 'hacking' image using API." },
  },

  baseApi: async () => {
    const base = await axios.get(
      "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
    );
    return base.data.mahmud;
  },

  onStart: async function ({ api, event }) {
    try {
      const baseApi = await this.baseApi();

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const outPath = path.join(cacheDir, `hack_${Date.now()}.png`);

      const id = Object.keys(event.mentions)[0] || event.senderID;
      const userInfo = await api.getUserInfo(id);
      const name = userInfo[id].name;

      const finalImage = await axios.get(
        `${baseApi}/api/hack?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`,
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(outPath, finalImage.data);
        
      const replyText = `
┏━━🛡️ 𝐇𝐀𝐂𝐊 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 ━━┓
🎯 Target: ${name}
🖥️ Hack Completed Successfully!
📨 Check Your Inbox My Lord!
┗━━━━━━━━━━━━━━━━━┛`;

      await api.sendMessage(
        {
          body: replyText,
          attachment: fs.createReadStream(outPath),
        },
        event.threadID,
        () => fs.unlinkSync(outPath),
        event.messageID
      );

    } catch (e) {
      console.log(e);
      return api.sendMessage(
        "❌ Error generating hack image!",
        event.threadID,
        event.messageID
      );
    }
  },
};
