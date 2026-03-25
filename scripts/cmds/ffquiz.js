const axios = require("axios");

module.exports = {
  config: {
    name: "ffquiz",
    aliases: ["ffqz"],
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    category: "game",
    description: "🎮 Free Fire Quiz"
  },

  onStart: async function({ api, event, usersData }) {
    try {
      if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
      
      const response = await axios.get("https://azadx69x-all-apis-top.vercel.app/api/ffquiz");
      const q = response.data.quiz;
      
      const options = {
        A: q.options[0].replace(/^A\.?\s*/, ""),
        B: q.options[1].replace(/^B\.?\s*/, ""),
        C: q.options[2].replace(/^C\.?\s*/, ""),
        D: q.options[3].replace(/^D\.?\s*/, "")
      };
      
      const quizMsg = `🔥──➤ 𝗙𝗙 𝐐𝐔𝐈𝐙 🔥
❓ ${q.question}

🅰️ 𝗔) ${options.A}
🅱️ 𝗕) ${options.B}
🅾️ 𝗖) ${options.C}
🅳️ 𝗗) ${options.D}

⏰ 𝗛𝘂𝗿𝗿𝘆! 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝐀, 𝐁, 𝐂 or 𝐃`;
      
      const msg = await api.sendMessage(quizMsg, event.threadID, event.messageID);
      
      global.GoatBot.onReply.set(msg.messageID, {
        type: "reply",
        commandName: this.config.name,
        author: event.senderID,
        messageID: msg.messageID,
        correctAnswer: q.answer.toUpperCase()
      });
      
      setTimeout(() => {
        try { api.unsendMessage(msg.messageID); } catch {}
        global.GoatBot.onReply.delete(msg.messageID);
      }, 60000);

    } catch (error) {
      if (error.response && error.response.status === 429) {
        api.sendMessage("⚠️ 𝗦𝗲𝗿𝘃𝗲𝗿 𝗯𝘂𝘀𝘆, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗮 𝗳𝗲𝘄 𝘀𝗲𝗰𝗼𝗻𝗱𝘀 𝗮𝗻𝗱 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.", event.threadID, event.messageID);
      } else {
        api.sendMessage(`❌ 𝗘𝗿𝗿𝗼𝗿: ${error.message}`, event.threadID, event.messageID);
      }
    }
  },

  onReply: async function({ api, event, Reply, usersData }) {
    if (!Reply) return;

    const { correctAnswer, author } = Reply;

    if (event.senderID !== author)
      return api.sendMessage("🐸 𝗘𝗶 𝗾𝘂𝗶𝘇 𝘁𝗺𝗿 𝗻𝗮, 𝗰𝗵𝘂𝗱𝗹𝗶𝗻𝗴 𝗽𝗼𝗻𝗴!", event.threadID, event.messageID);

    const userReply = event.body.trim().toUpperCase();

    if (!["A","B","C","D"].includes(userReply))
      return api.sendMessage("❌ 𝗥𝗲𝗽𝗹𝘆 𝗼𝗻𝗹𝘆 𝐀, 𝐁, 𝐂 𝗼𝗿 𝐃!", event.threadID, event.messageID);

    const userData = await usersData.get(author);
    const rewardCoins = 500;
    const rewardExp = 121;
    
    try { await api.unsendMessage(Reply.messageID); } catch {}
    global.GoatBot.onReply.delete(Reply.messageID);

    if (userReply === correctAnswer.toUpperCase()) {
      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: userData.data
      });

      return api.sendMessage(
        `✅ 𝗖𝗼𝗿𝗿𝗲𝗰𝘁 𝗔𝗻𝘀𝘄𝗲𝗿!
🎁 +${rewardCoins} 𝗖𝗼𝗶𝗻𝘀
⭐ +${rewardExp} 𝗘𝗫𝗣`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `❌ 𝗪𝗿𝗼𝗻𝗴 𝗔𝗻𝘀𝘄𝗲𝗿!
✔ 𝗥𝗶𝗴𝗵𝘁 𝗔𝗻𝘀𝘄𝗲𝗿: ${correctAnswer.toUpperCase()}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
