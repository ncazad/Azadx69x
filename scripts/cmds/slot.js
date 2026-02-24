module.exports = {
  config: {
    name: "slot",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 3,
    role: 0,
    description: "🎰 Slot Machine",
    category: "game",
    guide: { en: "Use: {pn} [bet amount]" }
  },

  onStart: async function({ message, event, args, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    const formatMoney = (amount) => {
      if (isNaN(amount)) return "💲0";
      amount = Number(amount);
      const scales = [
        { value: 1e15, suffix: 'Q', color: '🌈' },
        { value: 1e12, suffix: 'T', color: '✨' },
        { value: 1e9, suffix: 'B', color: '💎' },
        { value: 1e6, suffix: 'M', color: '💰' },
        { value: 1e3, suffix: 'k', color: '💵' }
      ];
      const scale = scales.find(s => amount >= s.value);
      if (scale) return `${scale.color}${(amount / scale.value).toFixed(2)}${scale.suffix}`;
      return `💲${amount.toLocaleString()}`;
    };

    if (isNaN(bet) || bet <= 0) return message.reply("⛔ 𝐄𝐧𝐭𝐞𝐫 𝐛𝐞𝐭 𝐚𝐦𝐨𝐮𝐧𝐭!");

    let user = await usersData.get(senderID);
    if (!user) user = { money: 1000 };
    if (user.money < bet) return message.reply(`🔴 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐟𝐮𝐧𝐝𝐬! 𝐍𝐞𝐞𝐝 ${formatMoney(bet - user.money)} 𝐦𝐨𝐫𝐞.`);

    user.money -= bet;

    const symbols = [
      { emoji: "🍒", weight: 30 },
      { emoji: "🍋", weight: 25 },
      { emoji: "🍇", weight: 20 },
      { emoji: "🍉", weight: 15 },
      { emoji: "⭐", weight: 7 },
      { emoji: "7️⃣", weight: 3 }
    ];

    const roll = () => {
      const total = symbols.reduce((s, e) => s + e.weight, 0);
      let rand = Math.random() * total;
      for (const s of symbols) {
        if (rand < s.weight) return s.emoji;
        rand -= s.weight;
      }
      return symbols[0].emoji;
    };

    const slot1 = roll(), slot2 = roll(), slot3 = roll();

    let multiplier = 1, winnings = 0, outcome = "", winType = "";

    if (slot1 === slot2 && slot2 === slot3) {
      multiplier = 5 + Math.floor(Math.random() * 4);
      winnings = bet * multiplier;
      outcome = "💀 𝐌𝐄𝐆𝐀 𝐉𝐀𝐂𝐊𝐏𝐎𝐓! TRIPLE " + slot1;
      winType = `🔥 𝐌𝐀𝐗 𝐖𝐈𝐍 ×${multiplier}`;
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      multiplier = 2 + Math.floor(Math.random() * 3);
      winnings = bet * multiplier;
      outcome = "✨ 𝐍𝐈𝐂𝐄! 2 𝐌𝐀𝐓𝐂𝐇𝐈𝐍𝐆 𝐒𝐘𝐌𝐁𝐎𝐋𝐒";
      winType = `🌟 𝐖𝐈𝐍 ×${multiplier}`;
    } else if (Math.random() < 0.5) {
      multiplier = 1.5;
      winnings = bet * multiplier;
      outcome = "🎯 𝐋𝐔𝐂𝐊𝐘 𝐒𝐏𝐈𝐍!";
      winType = "🍀 𝐒𝐌𝐀𝐋𝐋 𝐖𝐈𝐍";
    } else {
      multiplier = 1;
      winnings = -bet;
      outcome = "💸 𝐁𝐄𝐓𝐓𝐄𝐑 𝐋𝐔𝐂𝐊 𝐍𝐄𝐗𝐓 𝐓𝐈𝐌𝐄!";
      winType = "😓 𝐋𝐎𝐒𝐒 ×1";
    }

    if (winnings > 0) user.money += winnings;
    await usersData.set(senderID, user);
    const finalBalance = user.money;
    
    const slotBox = 
      `🎰 𝐒𝐋𝐎𝐓 𝐌𝐀𝐂𝐇𝐈𝐍𝐄 ─────────────\n` +
      `   【 ${slot1} · ${slot2} · ${slot3} 】        ─────────────\n`;

    const msgContent = 
      `${slotBox}` +
      `\n📉 𝐑𝐄𝐒𝐔𝐋𝐓: ${outcome}\n` +
      `${winType ? ` ${winType}\n` : ""}` +
      `${winnings >= 0 ? `🏆 𝐖𝐎𝐍 ×${multiplier}: ${formatMoney(winnings)}\n` : `💔 𝐋𝐎𝐒𝐓 ×1: ${formatMoney(bet)}\n`}` +
      `🪙 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: ${formatMoney(finalBalance)}\n` +
      ``;

    return message.reply(msgContent);
  }
};
