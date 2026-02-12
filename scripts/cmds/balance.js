const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");

try {
  registerFont(path.join(__dirname, "fonts", "Poppins-Bold.ttf"), { family: "Poppins", weight: "bold" });
  registerFont(path.join(__dirname, "fonts", "Poppins-Regular.ttf"), { family: "Poppins" });
  registerFont(path.join(__dirname, "fonts", "Poppins-SemiBold.ttf"), { family: "Poppins", weight: "600" });
  registerFont(path.join(__dirname, "fonts", "Montserrat-Bold.ttf"), { family: "Montserrat", weight: "bold" });
} catch (e) {}

const { config } = global.GoatBot;

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money"],
    version: "3.0",
    author: "Mahi",
    countDown: 1,
    role: 0,
    description: "Premium banking system with futuristic design",
    category: "economy",
    guide: { en: "" }
  },

  onStart: async function ({ message, usersData, event, args, api }) {
    const senderID = event.senderID;
    const allowedUIDs = [config.adminBot, ...config.adminBot];

    const formatMoney = (num) => {
      const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
      let unit = 0;
      let number = Number(num);

      while (number >= 1000 && unit < units.length - 1) {
        number /= 1000;
        unit++;
      }

      return `${number.toFixed(2)}${units[unit]}`;
    };

    const isValidAmount = (value) => {
      const num = Number(value);
      return !isNaN(num) && num > 0;
    };

    const getTargetUID = () => {
      if (event.messageReply) return event.messageReply.senderID;
      if (Object.keys(event.mentions).length > 0) return Object.keys(event.mentions)[0];
      if (!isNaN(args[1])) return args[1];
      return null;
    };

    const getAmount = () => args[args.length - 1];

    const createHexagon = (ctx, x, y, size, color, stroke = false) => {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (stroke) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.restore();
    };

    if (args[0] === "help") {
      const canvas = createCanvas(1000, 600);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
      gradient.addColorStop(0, "#000814");
      gradient.addColorStop(0.5, "#001d3d");
      gradient.addColorStop(1, "#003566");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1000, 600);

      for (let i = 0; i < 15; i++) {
        createHexagon(ctx, Math.random() * 1000, Math.random() * 600, 20 + Math.random() * 30, "rgba(0, 255, 255, 0.03)", true);
      }

      ctx.fillStyle = "#00ffff";
      ctx.font = "bold 48px Montserrat, Arial";
      ctx.fillText("💠 BANKING SYSTEM", 280, 100);

      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(280, 120);
      ctx.lineTo(720, 120);
      ctx.stroke();

      const commands = [
        "🔹 {pn} → View your balance",
        "🔹 {pn} @user → View other's balance",
        "🔹 {pn} transfer UID amount → Send money",
        "🔹 {pn} request amount → Request from admin",
        "🔹 {pn} add UID amount → Admin add money",
        "🔹 {pn} delete UID amount → Admin remove money"
      ];

      ctx.fillStyle = "#ffffff";
      ctx.font = "26px Poppins, Arial";
      for (let i = 0; i < commands.length; i++) {
        ctx.fillText(commands[i], 150, 200 + (i * 55));
      }

      ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
      ctx.font = "italic 20px Arial";
      ctx.fillText("Quantum Banking v3.0 • Designed by Mahi", 300, 560);

      const buffer = canvas.toBuffer("image/png");
      const imagePath = path.join(__dirname, "tmp", `help_${Date.now()}.png`);
      if (!fs.existsSync(path.join(__dirname, "tmp"))) fs.mkdirSync(path.join(__dirname, "tmp"));
      fs.writeFileSync(imagePath, buffer);

      message.reply({
        attachment: fs.createReadStream(imagePath)
      });

      setTimeout(() => {
        try { fs.unlinkSync(imagePath); } catch (e) {}
      }, 5000);
      return;
    }

    if (args[0] === "add") {
      if (!allowedUIDs.includes(senderID)) return message.reply("❌ Permission denied.");
      
      const targetUID = getTargetUID();
      const amount = getAmount();

      if (!targetUID) return message.reply("❌ User not found.");
      if (!isValidAmount(amount)) return message.reply("❌ Invalid amount.");

      const userData = await usersData.get(targetUID) || { money: "0" };
      const userName = userData.name || "Unknown";
      const newBalance = (Number(userData.money) + Number(amount)).toString();
