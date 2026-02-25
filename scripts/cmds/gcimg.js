const axios = require("axios");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
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
    return ctx;
}

async function getAvatarUrls(userIDs) {
    let avatarURLs = [];

    for (let userID of userIDs) {
        try {
            const shortUrl = `https://graph.facebook.com/${userID}/picture?height=1000&width=1000&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const d = await axios.get(shortUrl);
            avatarURLs.push(d.request.res.responseUrl);
        } catch {
            avatarURLs.push("https://i.ibb.co/qk0bnY8/363492156.png");
        }
    }

    return avatarURLs;
}

module.exports = {
    config: {
        name: "gcimg",
        aliases: ["gcimage"],
        version: "0.0.7",
        author: "Azadx69x",
        countDown: 5,
        role: 0,
        description: "Generate Group Card",
        category: "IMAGE",
        guide: {
            en: "Usage: gcimg [page number] [options]\n" +
                 "Options:\n" +
                 "  --color <color> : Text color (default: white)\n" +
                 "  --admin <color> : Admin border color (default: yellow)\n" +
                 "  --member <color> : Member border color (default: cyan)\n" +
                 "  --glow <color> : Glow effect color (default: none)\n" +
                 "  --opacity <0-1> : Background overlay opacity (default: 0.6)\n" +
                 "Example: gcimg 2 --color white --glow gold --opacity 0.5"
        }
    },

    onStart: async function ({ api, args, event, message }) {
        try {
            let textColor = "white";
            let memberColor = "cyan";
            let adminColor = "yellow";
            let glow = false;
            let page = 1;
            let overlayOpacity = 0.6;
            
            for (let i = 0; i < args.length; i++) {
                if (args[i].startsWith("--")) {
                    switch(args[i]) {
                        case "--color": textColor = args[++i]; break;
                        case "--admin": adminColor = args[++i]; break;
                        case "--member": memberColor = args[++i]; break;
                        case "--glow": glow = args[++i]; break;
                        case "--opacity": overlayOpacity = parseFloat(args[++i]); break;
                    }
                } else if (!isNaN(args[i])) {
                    page = parseInt(args[i]);
                }
            }
            
            const threadInfo = await api.getThreadInfo(event.threadID);
            const allMembers = await getAvatarUrls(threadInfo.participantIDs);
            const admins = await getAvatarUrls(threadInfo.adminIDs.map(a => a.id));
            
            const membersPerPage = 20;
            const totalPages = Math.ceil(allMembers.length / membersPerPage);
            
            if (page < 1 || page > totalPages) {
                return message.reply(`❌ Invalid page number! Total pages: ${totalPages}`);
            }
            
            const startIndex = (page - 1) * membersPerPage;
            const endIndex = Math.min(startIndex + membersPerPage, allMembers.length);
            const members = allMembers.slice(startIndex, endIndex);
            
            const width = 3200;
            const height = 2000;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");
            
            const backgroundImageUrl = "https://i.imgur.com/yBWS5ju.jpeg";
            
            try {
                const bgImage = await loadImage(backgroundImageUrl);
                
                ctx.drawImage(bgImage, 0, 0, width, height);
                
                ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
                ctx.fillRect(0, 0, width, height);
                
                const gradientOverlay = ctx.createLinearGradient(0, 0, width, height);
                gradientOverlay.addColorStop(0, `rgba(0,0,0,0.2)`);
                gradientOverlay.addColorStop(1, `rgba(0,0,0,0.4)`);
                ctx.fillStyle = gradientOverlay;
                ctx.fillRect(0, 0, width, height);
                
            } catch (error) {
                console.log("Background image error, using gradient fallback:", error.message);
                
                const centerX = width / 2;
                const centerY = height / 2;
                const bgGradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, Math.max(width, height)
                );
                bgGradient.addColorStop(0, "#000000");
                bgGradient.addColorStop(0.5, "#1a1a1a");
                bgGradient.addColorStop(1, "#333333");
                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, width, height);
            }
            
            ctx.strokeStyle = textColor;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.2;
            
            const corners = [
                [100, 100], [width - 100, 100],
                [100, height - 100], [width - 100, height - 100]
            ];
            
            corners.forEach(([x, y]) => {
                ctx.beginPath();
                ctx.arc(x, y, 80, 0, Math.PI * 2);
                ctx.strokeStyle = textColor;
                ctx.stroke();
            });
            
            ctx.globalAlpha = 1;
            
            if (threadInfo.imageSrc) {
                try {
                    const grpImg = await loadImage(threadInfo.imageSrc);
                    
                    ctx.save();
                    ctx.shadowColor = "rgba(255,255,255,0.3)";
                    ctx.shadowBlur = 30;
                    
                    ctx.beginPath();
                    ctx.arc(width / 2, 200, 150, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255,255,255,0.1)";
                    ctx.fill();
                    ctx.restore();
                    
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(width / 2, 200, 140, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(grpImg, (width / 2) - 140, 60, 280, 280);
                    ctx.restore();
                    
                    ctx.strokeStyle = "rgba(255,255,255,0.5)";
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(width / 2, 200, 140, 0, Math.PI * 2);
                    ctx.stroke();
                    
                } catch (e) {
                    console.log("Group image error:", e);
                }
            }
            
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            
            ctx.font = "bold 80px 'Arial', 'sans-serif'";
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            
            let groupName = threadInfo.threadName || "Unnamed Group";
            if (groupName.length > 30) {
                groupName = groupName.substring(0, 27) + "...";
            }
            ctx.fillText(groupName, width / 2, 380);
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            const cardWidth = 800;
            const cardHeight = 150;
            const cardX = width/2 - cardWidth/2;
            const cardY = 430;
            
            ctx.fillStyle = "rgba(255,255,255,0.12)";
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 25;
            ctx.shadowOffsetX = 8;
            ctx.shadowOffsetY = 8;
            roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 35);
            ctx.fill();
            
            const borderGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
            borderGradient.addColorStop(0, `rgba(255,255,255,0.4)`);
            borderGradient.addColorStop(0.5, `rgba(255,255,255,0.6)`);
            borderGradient.addColorStop(1, `rgba(255,255,255,0.4)`);
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 4;
            ctx.shadowColor = "transparent";
            roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 35);
            ctx.stroke();
            
            ctx.strokeStyle = "rgba(255,255,255,0.15)";
            ctx.lineWidth = 2;
            ctx.setLineDash([12, 12]);
            roundRect(ctx, cardX + 12, cardY + 12, cardWidth - 24, cardHeight - 24, 25);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.shadowColor = "rgba(0,0,0,0.7)";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            
            ctx.font = "bold 48px 'Arial', 'sans-serif'";
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.fillText(` ${allMembers.length} Members  |   ${admins.length} Admins`, width / 2, 505);
            
            ctx.font = "42px 'Arial', 'sans-serif'";
            ctx.fillStyle = textColor;
            ctx.fillText(`Page ${page} of ${totalPages}`, width / 2, 560);
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            ctx.font = "bold 50px Arial";
            ctx.fillStyle = textColor;
            ctx.textAlign = "left";
            ctx.fillText("MEMBERS", 120, 650);
            
            ctx.strokeStyle = memberColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(120, 670);
            ctx.lineTo(500, 670);
            ctx.stroke();
            
            let x = 120;
            let y = 720;
            const size = 180;
            const perRow = 5;
            const spacing = 40;
            
            for (let i = 0; i < members.length; i++) {
                try {
                    ctx.save();
                    
                    ctx.shadowColor = "rgba(0,0,0,0.3)";
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 3;
                    
                    ctx.fillStyle = "rgba(255,255,255,0.15)";
                    roundRect(ctx, x - 10, y - 10, size + 20, size + 60, 20);
                    ctx.fill();
                    
                    ctx.shadowColor = "transparent";
                    
                    const img = await loadImage(members[i]);
                    
                    if (glow) {
                        ctx.shadowColor = glow;
                        ctx.shadowBlur = 20;
                    }
                    
                    ctx.beginPath();
                    ctx.arc(x + size/2, y + size/2, size/2 - 8, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(img, x, y, size, size);
                    
                    ctx.shadowColor = "transparent";
                    
                    ctx.strokeStyle = memberColor;
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(x + size/2, y + size/2, size/2 - 8, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    ctx.fillStyle = "rgba(0,0,0,0.7)";
                    ctx.beginPath();
                    ctx.arc(x + 35, y + 35, 20, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = textColor;
                    ctx.font = "bold 20px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText(`#${startIndex + i + 1}`, x + 35, y + 40);
                    
                    ctx.restore();
                    
                } catch (e) {
                    console.log("Member avatar error:", e);
                }
                
                x += size + spacing;
                if ((i + 1) % perRow === 0) {
                    x = 120;
                    y += size + spacing + 30;
                }
            }
            
            let ax = 2200;
            let ay = 650;
            
            ctx.save();
            ctx.font = "bold 50px Arial";
            ctx.fillStyle = adminColor;
            ctx.textAlign = "left";
            ctx.fillText("ADMIN", ax, ay);
            
            ctx.strokeStyle = adminColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(ax, ay + 20);
            ctx.lineTo(ax + 350, ay + 20);
            ctx.stroke();
            
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            roundRect(ctx, ax - 20, ay + 30, 700, 900, 25);
            ctx.fill();
            
            ctx.strokeStyle = adminColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 8]);
            roundRect(ctx, ax - 20, ay + 30, 700, 900, 25);
            ctx.stroke();
            ctx.setLineDash([]);
            
            let adminY = ay + 70;
            
            for (let i = 0; i < Math.min(admins.length, 5); i++) {
                try {
                    const img = await loadImage(admins[i]);
                    
                    ctx.save();
                    
                    ctx.shadowColor = "rgba(0,0,0,0.3)";
                    ctx.shadowBlur = 8;
                    ctx.shadowOffsetX = 3;
                    ctx.shadowOffsetY = 3;
                    
                    ctx.fillStyle = "rgba(255,255,255,0.15)";
                    roundRect(ctx, ax, adminY, 650, 150, 15);
                    ctx.fill();
                    
                    ctx.shadowColor = "transparent";
                    
                    if (glow) {
                        ctx.shadowColor = glow;
                        ctx.shadowBlur = 15;
                    }
                    
                    roundRect(ctx, ax + 20, adminY + 10, 120, 120, 15);
                    ctx.clip();
                    ctx.drawImage(img, ax + 20, adminY + 10, 120, 120);
                    
                    ctx.shadowColor = "transparent";
                    
                    ctx.strokeStyle = adminColor;
                    ctx.lineWidth = 3;
                    roundRect(ctx, ax + 20, adminY + 10, 120, 120, 15);
                    ctx.stroke();
                    
                    ctx.font = "bold 30px Arial";
                    ctx.fillStyle = adminColor;
                    ctx.fillText(`Admin #${i + 1}`, ax + 160, adminY + 50);
                    
                    ctx.font = "40px Arial";
                    ctx.fillStyle = adminColor;
                    ctx.fillText("👑", ax + 550, adminY + 80);
                    
                    ctx.restore();
                    
                    adminY += 170;
                } catch (e) {
                    console.log("Admin avatar error:", e);
                }
            }
            
            ctx.restore();
            
            ctx.shadowColor = adminColor;
            ctx.shadowBlur = 15;
            
            const footerGradient = ctx.createLinearGradient(200, height - 80, width - 200, height - 80);
            footerGradient.addColorStop(0, textColor);
            footerGradient.addColorStop(0.5, adminColor);
            footerGradient.addColorStop(1, memberColor);
            
            ctx.strokeStyle = footerGradient;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(300, height - 80);
            ctx.lineTo(width - 300, height - 80);
            ctx.stroke();
            
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            
            ctx.font = "30px Arial";
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.textAlign = "center";
            ctx.fillText("⚡ Ghudling pong gcimg command", width / 2, height - 40);
            
            const imgPath = __dirname + `/gc_${Date.now()}.jpg`;
            const buffer = canvas.toBuffer("image/jpeg");
            fs.writeFileSync(imgPath, buffer);
            
            let replyMsg = `✨ 𝗚𝗿𝗼𝘂𝗽 𝗖𝗮𝗿𝗱 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 \n\n`;

            replyMsg += `📌 𝗚𝗿𝗼𝘂𝗽: ${threadInfo.threadName || "Unnamed"}\n`;
            replyMsg += `👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${allMembers.length}\n`;
            replyMsg += `👑 𝗔𝗱𝗺𝗶𝗻𝘀: ${admins.length}\n`;
            replyMsg += `📄 𝗣𝗮𝗴𝗲: ${page}/${totalPages}\n\n`;

            if (page < totalPages) {
                replyMsg += `➡️ 𝗡𝗲𝘅𝘁 𝗣𝗮𝗴𝗲: gcimg ${page + 1}\n`;
                replyMsg += `⬅️ 𝗣𝗿𝗲𝘃 𝗣𝗮𝗴𝗲: gcimg ${page - 1}`;
            } else if (page > 1) {
                replyMsg += `⬅️ 𝗣𝗿𝗲𝘃 𝗣𝗮𝗴𝗲: gcimg ${page - 1}`;
            } else {
                replyMsg += `✅ 𝗧𝗵𝗶𝘀 𝗶𝘀 𝘁𝗵𝗲 𝗼𝗻𝗹𝘆 𝗽𝗮𝗴𝗲`;
            }
            
            message.reply({
                body: replyMsg,
                attachment: fs.createReadStream(imgPath)
            });

            setTimeout(() => fs.unlinkSync(imgPath), 5000);

        } catch (err) {
            console.log(err);
            message.reply(`❌ Error: ${err.message}`);
        }
    }
};

function adjustColor(color, percent) {
    if (color.startsWith('#')) {
        let R = parseInt(color.substring(1,3), 16);
        let G = parseInt(color.substring(3,5), 16);
        let B = parseInt(color.substring(5,7), 16);
        
        R = Math.min(255, Math.max(0, R + percent));
        G = Math.min(255, Math.max(0, G + percent));
        B = Math.min(255, Math.max(0, B + percent));
        
        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }
    return color;
}
