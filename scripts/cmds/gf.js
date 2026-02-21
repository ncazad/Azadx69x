const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "gf",
    aliases: ["bf", "love", "crush"],
    author: "Azadx69x",
    version: "0.0.7",
    role: 0,
    category: "fun",
    shortDescription: "🎀 Find your perfect gf/bf!",
    longDescription: "Creates a stunning romantic your match",
    guide: "{p}{n} — Find your GF/BF/Crush"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      let senderName = senderData.name || "You";
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;
      
      const myData = users.find(user => user.id === event.senderID);
      let myGender = myData?.gender?.toUpperCase() || (Math.random() > 0.5 ? "MALE" : "FEMALE");
      
      let matchCandidates = users.filter(u => u.id !== event.senderID);
      if (myGender === "MALE") {
        matchCandidates = matchCandidates.filter(u => u.gender === "FEMALE");
      } else if (myGender === "FEMALE") {
        matchCandidates = matchCandidates.filter(u => u.gender === "MALE");
      }
      
      if (!matchCandidates.length) {
        matchCandidates = users.filter(u => u.id !== event.senderID);
      }
      
      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      let matchName = selectedMatch.name;
      
      const width = 1200;
      const height = 750;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0a0f1e");   
      gradient.addColorStop(0.3, "#1a2639");  
      gradient.addColorStop(0.7, "#2a3b4f"); 
      gradient.addColorStop(1, "#1e2a3a");   
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.beginPath();
      ctx.moveTo(20, 20);
      ctx.lineTo(80, 20);
      ctx.lineTo(50, 60);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(width - 20, 20);
      ctx.lineTo(width - 80, 20);
      ctx.lineTo(width - 50, 60);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(20, height - 20);
      ctx.lineTo(80, height - 20);
      ctx.lineTo(50, height - 60);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(width - 20, height - 20);
      ctx.lineTo(width - 80, height - 20);
      ctx.lineTo(width - 50, height - 60);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 15;
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(150 + i * 120, 200 + (i % 3) * 150, 80, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      
      ctx.shadowBlur = 5;
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 2 + 1,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 20;
      ctx.filter = 'blur(2px)';
      ctx.fillRect(0, 0, width, 100);
      
      ctx.fillRect(0, height - 100, width, 100);
      ctx.filter = 'none';
      ctx.shadowBlur = 0;
      
      ctx.font = 'bold 60px "Poppins", "Arial", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.fillText('✦ SOULMATES ✦', width/2 - 280, 70);
      ctx.shadowBlur = 0;
      
      const senderAvatar = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const partnerAvatar = await loadImage(
        `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      
      function drawLuxuryCircle(ctx, img, x, y, size) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 30;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 + 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 8; i++) {
          let angle = (i * Math.PI * 2) / 8;
          let dotX = x + size / 2 + (size / 2 + 15) * Math.cos(angle);
          let dotY = y + size / 2 + (size / 2 + 15) * Math.sin(angle);
          ctx.beginPath();
          ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
        
        ctx.shadowBlur = 0;
      }
      
      drawLuxuryCircle(ctx, senderAvatar, 150, 180, 240);
      drawLuxuryCircle(ctx, partnerAvatar, width - 390, 180, 240);
      
      function drawLuxuryNamePlate(ctx, name, x, y, width, height) {
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        const plateGradient = ctx.createLinearGradient(x, y, x + width, y + height);
        plateGradient.addColorStop(0, 'rgba(26, 26, 46, 0.9)');
        plateGradient.addColorStop(0.5, 'rgba(45, 55, 75, 0.9)');
        plateGradient.addColorStop(1, 'rgba(26, 26, 46, 0.9)');
        
        ctx.fillStyle = plateGradient;
        
        ctx.beginPath();
        ctx.moveTo(x + 20, y);
        ctx.lineTo(x + width - 20, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + 15);
        ctx.lineTo(x + width, y + height - 15);
        ctx.quadraticCurveTo(x + width, y + height, x + width - 20, y + height);
        ctx.lineTo(x + 20, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - 15);
        ctx.lineTo(x, y + 15);
        ctx.quadraticCurveTo(x, y, x + 20, y);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        const textGradient = ctx.createLinearGradient(x + 10, y + 10, x + width - 10, y + height - 10);
        textGradient.addColorStop(0, '#ffffff');
        textGradient.addColorStop(1, '#ffd700');
        
        ctx.font = 'bold 30px "Poppins", "Arial", sans-serif';
        ctx.fillStyle = textGradient;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        
        let textWidth = ctx.measureText(name).width;
        ctx.fillText(name, x + (width - textWidth)/2, y + 45);
        
        ctx.font = '15px "Arial"';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('✦', x + 15, y + 30);
        ctx.fillText('✦', x + width - 30, y + 30);
        ctx.fillText('✦', x + 15, y + height - 10);
        ctx.fillText('✦', x + width - 30, y + height - 10);
        
        ctx.shadowBlur = 0;
      }
      
      drawLuxuryNamePlate(ctx, senderName, 120, 460, 300, 65);
      drawLuxuryNamePlate(ctx, matchName, width - 420, 460, 300, 65);
      
      function drawLuxuryHeart(ctx, centerX, centerY, size) {
        ctx.save();
        
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 40;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size * 0.5);
        ctx.bezierCurveTo(
          centerX - size * 0.6, centerY - size * 0.9,
          centerX - size * 1.2, centerY + size * 0.2,
          centerX, centerY + size * 0.9
        );
        ctx.bezierCurveTo(
          centerX + size * 1.2, centerY + size * 0.2,
          centerX + size * 0.6, centerY - size * 0.9,
          centerX, centerY - size * 0.5
        );
        
        const heartGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
        heartGradient.addColorStop(0, '#ff6b6b');
        heartGradient.addColorStop(0.5, '#ff4757');
        heartGradient.addColorStop(1, '#c44569');
        ctx.fillStyle = heartGradient;
        ctx.fill();
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        ctx.restore();
      }
      
      drawLuxuryHeart(ctx, width / 2, 330, 90);
      
      ctx.shadowBlur = 20;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#ff6b6b' : '#ffd700';
        ctx.beginPath();
        ctx.arc(width / 2 - 150 + i * 100, 250 + i * 30, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const lovePercent = Math.floor(Math.random() * 31) + 70;
      
      ctx.shadowBlur = 20;
      ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(width / 2, 560, 150, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.font = 'bold 35px "Poppins", "Arial", sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffffff';
      ctx.fillText(`♡ ${lovePercent}% MATCH ♡`, width/2 - 160, 570);
      
      ctx.font = 'italic 22px "Georgia", serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 5;
      ctx.fillText('"Two souls, one heart"', width/2 - 120, 650);
      
      ctx.shadowBlur = 0;
      
      const outputPath = path.join(__dirname, "gf_card.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const messageText = `🦋 𝗬𝗼𝘂𝗿 𝗥𝗮𝗻𝗱𝗼𝗺 𝗚𝗙/𝗕𝗙 𝗠𝗮𝘁𝗰𝗵 

╔══════════════════════╗
    💮 𝐘𝐎𝐔𝐑 𝐏𝐄𝐑𝐅𝐄𝐂𝐓 𝐒𝐎𝐔𝐋𝐌𝐀𝐓𝐄 💮
╚══════════════════════╝

🎀 𝗬𝗼𝘂: ${senderName}
🎀 𝗠𝗮𝘁𝗰𝗵: ${matchName}

━━━━━━━━━━━━━━━━━━━━━
   🎀 𝗖𝗼𝗺𝗽𝗮𝘁𝗶𝗯𝗶𝗹𝗶𝘁𝘆: ${lovePercent}% 🦋
━━━━━━━━━━━━━━━━━━━━━`;

        api.sendMessage(
          { body: messageText, attachment: fs.createReadStream(outputPath) },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (error) {
      api.sendMessage(
        "❌ An error occurred while generating the match card.\n" + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
