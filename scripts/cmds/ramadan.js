const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "ramadan",
    version: "0.0.9",
    author: "Azadx69x",
    role: 0,
    shortDescription: "Shows Ramadan timings for Bangladesh",
    longDescription: "auto ramadan day (API based)",
    category: "islamic"
  },

  onStart: async function ({ message, args }) {
    const city = args.join(" ").toLowerCase();

    if (!city)
      return message.reply("📌 Usage: ramadan <city>");

    const apiUrl = `https://azadx69x-all-apis-top.vercel.app/api/ramadan?city=${city}`;

    try {
      const res = await axios.get(apiUrl);
      const d = res.data;

      if (!d.success) {
        return message.reply(`❌ Error: ${d.message}`);
      }

      const imagePath = await generateRamadanImage(d);
      
      await message.reply({
        body: `🕋 RAMADAN TIMINGS FOR ${d.city.toUpperCase()}`,
        attachment: fs.createReadStream(imagePath)
      });

      setTimeout(() => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }, 5000);

    } catch (e) {
      console.log(e);
      message.reply("❌ Unable to fetch Ramadan info. Try again later.");
    }
  }
};

async function generateRamadanImage(data) {
  const width = 900;
  const height = 1200;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#0B1026';
  ctx.fillRect(0, 0, width, height);
  
  drawStars(ctx, width, height);
  
  drawBigMoon(ctx, 700, 150, 90);
  
  drawSmallMoon(ctx, 180, 100, 30);
  
  drawMosque(ctx, width, height);
  
  drawLanterns(ctx, width, height);
  
  drawIslamicPattern(ctx, width);
  
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 58px "Arial", sans-serif';
  ctx.fillText('RAMADAN', width / 2, 90);
  ctx.fillText('KAREEM', width / 2, 145);
  
  drawLocationCard(ctx, data, width);
  
  drawDateCard(ctx, data, width);
  
  drawTimeBoxes(ctx, data, width);
  
  if (data.message) {
    drawMessageBox(ctx, data.message, width);
  }
  
  drawFooter(ctx, width, height);
  
  const fileName = `ramadan_${Date.now()}.png`;
  const filePath = path.join(__dirname, 'cache', fileName);
  
  if (!fs.existsSync(path.join(__dirname, 'cache'))) {
    fs.mkdirSync(path.join(__dirname, 'cache'), { recursive: true });
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filePath, buffer);
  
  return filePath;
}

function drawBigMoon(ctx, x, y, radius) {
  ctx.fillStyle = '#FFE55C';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#0B1026';
  ctx.beginPath();
  ctx.arc(x - 25, y - 10, radius - 10, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#FFF9C4';
  ctx.beginPath();
  ctx.arc(x + 5, y, radius - 20, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSmallMoon(ctx, x, y, radius) {
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#0B1026';
  ctx.beginPath();
  ctx.arc(x - 8, y - 3, radius - 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars(ctx, width, height) {
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.6;
    const size = Math.random() * 2 + 1;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMosque(ctx, width, height) {
  ctx.fillStyle = '#2C3A5F';
  ctx.fillRect(width/2 - 150, height - 280, 300, 200);
  
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.arc(width/2, height - 280, 60, 0, Math.PI);
  ctx.fill();
  
  ctx.fillStyle = '#2C3A5F';
  ctx.fillRect(width/2 - 220, height - 320, 30, 240);
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.arc(width/2 - 205, height - 320, 20, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#2C3A5F';
  ctx.fillRect(width/2 + 190, height - 320, 30, 240);
  ctx.fillStyle = '#DAA520';
  ctx.beginPath();
  ctx.arc(width/2 + 205, height - 320, 20, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#FFD700';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(width/2 - 80 + i*60, height - 220, 25, 35);
  }
}

function drawLanterns(ctx, width, height) {
  ctx.fillStyle = '#B8860B';
  ctx.beginPath();
  ctx.moveTo(50, height - 200);
  ctx.lineTo(80, height - 250);
  ctx.lineTo(110, height - 200);
  ctx.fill();
  
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(80, height - 180, 20, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#B8860B';
  ctx.beginPath();
  ctx.moveTo(width - 110, height - 200);
  ctx.lineTo(width - 80, height - 250);
  ctx.lineTo(width - 50, height - 200);
  ctx.fill();
  
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(width - 80, height - 180, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawIslamicPattern(ctx, width) {
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.2)';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(width/2, 30, 100 + i*30, 0, Math.PI);
    ctx.stroke();
  }
}

function drawLocationCard(ctx, data, width) {
  const boxX = width/2 - 200;
  const boxY = 180;
  const boxW = 400;
  const boxH = 70;
  
  ctx.fillStyle = 'rgba(26, 31, 53, 0.95)';
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 20);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 32px "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`📍 ${data.city.toUpperCase()}`, width/2, boxY + boxH/2);
}

function drawDateCard(ctx, data, width) {
  const boxX = width/2 - 300;
  const boxY = 270;
  const boxW = 600;
  const boxH = 100;
  
  ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 20);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#87CEEB';
  ctx.font = 'bold 28px "Arial", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(`📅 ${data.date}`, width/2, boxY + 30);
  
  ctx.fillStyle = '#98FB98';
  ctx.font = 'bold 28px "Arial", sans-serif';
  ctx.fillText(`🕌 Ramadan Day: ${data.ramadan_day ?? "N/A"}`, width/2, boxY + 70);
}

function drawTimeBoxes(ctx, data, width) {
  const sehriBoxX = width/2 - 250;
  const sehriBoxY = 390;
  const sehriBoxW = 500;
  const sehriBoxH = 160;
  
  ctx.fillStyle = 'rgba(0, 100, 200, 0.2)';
  ctx.strokeStyle = '#4169E1';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, sehriBoxX, sehriBoxY, sehriBoxW, sehriBoxH, 30);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#E0FFFF';
  ctx.font = 'bold 36px "Arial", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('SEHRI', width/2, sehriBoxY + 40);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px "Arial", sans-serif';
  ctx.fillText(data.data.sehri, width/2, sehriBoxY + 95);
  
  ctx.fillStyle = '#87CEEB';
  ctx.font = '22px "Arial", sans-serif';
  ctx.fillText('Last eating time', width/2, sehriBoxY + 135);
  
  const iftarBoxX = width/2 - 250;
  const iftarBoxY = 570;
  const iftarBoxW = 500;
  const iftarBoxH = 160;
  
  ctx.fillStyle = 'rgba(200, 100, 0, 0.2)';
  ctx.strokeStyle = '#FF8C00';
  drawRoundedRect(ctx, iftarBoxX, iftarBoxY, iftarBoxW, iftarBoxH, 30);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#FFB6C1';
  ctx.font = 'bold 36px "Arial", sans-serif';
  ctx.fillText('IFTAR', width/2, iftarBoxY + 40);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px "Arial", sans-serif';
  ctx.fillText(data.data.iftar, width/2, iftarBoxY + 95);
  
  ctx.fillStyle = '#FFA07A';
  ctx.font = '22px "Arial", sans-serif';
  ctx.fillText('Breaking fast time', width/2, iftarBoxY + 135);
}

function drawMessageBox(ctx, message, width) {
  const boxX = width/2 - 300;
  const boxY = 750;
  const boxW = 600;
  const boxH = 80;
  
  ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
  ctx.strokeStyle = '#FFD700';
  drawRoundedRect(ctx, boxX, boxY, boxW, boxH, 20);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#FFD700';
  ctx.font = 'italic 24px "Arial", sans-serif';
  ctx.textBaseline = 'middle';
  
  if (message.length > 40) {
    ctx.fillText(message.substring(0, 40), width/2, boxY + 25);
    ctx.fillText(message.substring(40), width/2, boxY + 55);
  } else {
    ctx.fillText(message, width/2, boxY + boxH/2);
  }
}

function drawFooter(ctx, width, height) {
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(width/4, height - 100);
  ctx.lineTo(width * 3/4, height - 100);
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
  ctx.font = 'bold 28px "Arial", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('RAMADAN MUBARAK', width/2, height - 55);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '20px "Arial", sans-serif';
  ctx.fillText('May Allah accept your fasting', width/2, height - 20);
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
