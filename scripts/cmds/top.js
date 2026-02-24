const axios = require("axios");

function formatMoney(num) {
if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/.0$/, '') + "T";
if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/.0$/, '') + "B";
if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/.0$/, '') + "M";
if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/.0$/, '') + "K";
return num.toString();
}

module.exports = {
config: {
name: "top",
aliases: ["toprich"],
version: "1.2",
author: "Azadx69x",
countDown: 5,
role: 0,
shortDescription: "Show top 15 richest users",
longDescription: "Show money top 15 richest leaderboard.",
category: "economy",
guide: "{p}top"
},

onStart: async function ({ message, usersData }) {
try {
const allUsers = await usersData.getAll();
if (allUsers.length === 0) return message.reply("No user data available!");

const sorted = allUsers  
    .sort((a, b) => (b.money || 0) - (a.money || 0))  
    .slice(0, 15);  

  let text = "━━━━━━━━━━━━━━━━━━━━\n";  
  text += "  🏆 𝗧𝗢𝗣 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 🏆\n";  
  text += "━━━━━━━━━━━━━━━━━━━━\n\n";  

  const medals = ["👑", "🥈", "🥉"];  
  for (let i = 0; i < 3 && i < sorted.length; i++) {  
    const u = sorted[i];  
    text += `━━━━━━━━━━━━━━━━━━━━\n${medals[i]} 𝗧𝗢𝗣 = ${i + 1}\n`;  
    text += `👤 𝗡𝗮𝗺𝗲: ${u.name || "Unknown"}\n`;  
    text += `🏅 𝗥𝗮𝗻𝗸: #${i + 1}\n`;  
    text += `💰 𝗠𝗼𝗻𝗲𝘆: ${formatMoney(u.money || 0)}₵\n`;  
  }  

  text += "━━━━━━━━━━━━━━━━━━━━\n";  
  text += "🔐 𝗢𝗧𝗛𝗘𝗥 𝗣𝗟𝗔𝗬𝗘𝗥𝗦\n";  
  text += "━━━━━━━━━━━━━━━━━━━━\n";  

  for (let i = 3; i < sorted.length; i++) {  
    const u = sorted[i];  
    text += `↘️ Top = ${i + 1}\n👤 ${u.name || "Unknown"}\n🪙 ${formatMoney(u.money || 0)}₵\n`;  
    text += "━━━━━━━━━━━━━━━━━━━━\n";  
  }  

  const urls = [  
    "https://files.catbox.moe/to847c.jpeg",  
    "https://files.catbox.moe/kzae2x.jpeg",  
    "https://files.catbox.moe/1edyib.jpeg"  
  ];  
  const randomUrl = urls[Math.floor(Math.random() * urls.length)];  
  const res = await axios.get(randomUrl, { responseType: "stream" });  

  await message.reply({  
    body: text,  
    attachment: res.data  
  });  
} catch {  
  message.reply("❌ Error showing leaderboard!");  
}

}
};
