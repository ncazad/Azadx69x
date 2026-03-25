const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");
const os = require("os");

module.exports = {
  config: {
    name: "up3",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    shortDescription: "bot stats image",
    longDescription: "Uptime, ping, CPU load, owner info with canvas image",
    category: "image",
    guide: "{p}up3"
  },

  onStart: async function ({ event, message, api }) {
    try {
      const pingMsg = await message.reply({
        body: `⚡ 𝐂𝐡𝐞𝐜𝐤𝐢𝐧𝐠 𝐩𝐢𝐧𝐠...`
      });
      
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

      const ping = Date.now() - event.timestamp;
      const cpuUsage = os.loadavg()[0].toFixed(2);
      const owner = "Azadx69x";
      
      const canvas = Canvas.createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");
      
      const bgUrl = "https://i.imgur.com/UtV4VNy.jpeg";
      const bgImg = await Canvas.loadImage(bgUrl);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(0,0,0,0.25)");
      gradient.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.shadowBlur = 8;

      const leftMargin = 40;
      let startY = 120;
      
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 60px Sans";
      ctx.fillText("𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒", leftMargin, startY);
      
      const infoTexts = [
        `𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeStr}`,
        `𝐏𝐢𝐧𝐠: ${ping} ms`,
        `𝐂𝐏𝐔 𝐋𝐨𝐚𝐝: ${cpuUsage}`,
        `𝐎𝐰𝐧𝐞𝐫: ${owner}`
      ];

      ctx.fillStyle = "#F0F0F0";
      ctx.font = "bold 40px Sans";
      startY += 80;

      const spacing = 70;
      infoTexts.forEach(text => {
        ctx.fillText(text, leftMargin, startY);
        startY += spacing;
      });
      
      const filePath = path.join(__dirname, "up3.png");
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
      
      const bodyText = `
✿•≫────•『𝐗69𝐗 𝐁𝐎𝐓』•────≪•✿
⏳ 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeStr}
📶 𝐏𝐢𝐧𝐠: ${ping} ms
🖥 𝐂𝐏𝐔 𝐋𝐨𝐚𝐝: ${cpuUsage}
👑 𝐎𝐰𝐧𝐞𝐫: ${owner}
✿•≫───────────────≪•✿
`;
      
      await message.reply({
        body: bodyText,
        attachment: fs.createReadStream(filePath)
      });
      
      setTimeout(() => {
        api.unsendMessage(pingMsg.messageID).catch(() => {});
      }, 3000);
      
      fs.unlinkSync(filePath);

    } catch (err) {
      console.error("Command error:", err);
      return message.reply(`❌ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐟𝐞𝐭𝐜𝐡`);
    }
  }
};
