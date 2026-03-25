const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");
const axios = require('axios');

function fancyText(text, style = "bold") {
  const fonts = {
    bold: {
      a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵",
      i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽",
      q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅",
      y: "𝘆", z: "𝘇",
      A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛",
      I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣",
      Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫",
      Y: "𝗬", Z: "𝗭",
      0: "𝟬", 1: "𝟭", 2: "𝟮", 3: "𝟯", 4: "𝟰", 5: "𝟱", 6: "𝟲", 7: "𝟳",
      8: "𝟴", 9: "𝟵"
    }
  };
  return text.split('').map(c => fonts[style][c] || c).join('');
}

module.exports = {
  config: {
    name: "developer",
    aliases: ["dev"],
    version: "2.0",
    author: "Azadx69x",
    countDown: 5,
    role: 5,
    description: { en: "Add, remove developer role" },
    category: "owner",
    guide: { en: "{pn} [add/remove/list]" }
  },

  langs: {
    en: {
      missingIdAdd: fancyText("⚠️ | Reply / tag / UID required to add developer"),
      missingIdRemove: fancyText("⚠️ | Reply / tag / UID required to remove developer"),
    }
  },

  onStart: async function ({ message, args, usersData, event, api }) {
    let devArray = config.developer || config.devUsers || config.developers || [];
    devArray = devArray.filter(uid => uid && uid.toString().trim() !== "" && !isNaN(uid));

    const getUserInfo = async (uid) => {
      try {
        try { const name = await usersData.getName(uid); if (name && name !== "Unknown User" && name !== "null") return { uid, name }; } catch {}
        try { const userInfo = await api.getUserInfo(uid); if (userInfo && userInfo[uid]) return { uid, name: userInfo[uid].name || userInfo[uid].firstName || "Unknown User" }; } catch {}
        try { const response = await axios.get(`https://graph.facebook.com/${uid}?fields=name&access_token=EAABwzLixnjYBO`, { timeout: 5000 }); if (response.data && response.data.name) return { uid, name: response.data.name }; } catch {}
        try { const response = await axios.get(`https://facebook.com/${uid}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 3000 });
          const titleMatch = response.data.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) { let name = titleMatch[1].replace('| Facebook','').trim(); if (name && !name.includes('Facebook') && name.length > 1) return { uid, name }; } } catch {}
        return { uid, name: `User_${uid.substring(0, 8)}` };
      } catch { return { uid, name: `User_${uid.substring(0, 8)}` }; }
    };

    const getUIDs = () => {
      let uids = [];
      if (event.mentions && Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
      else if (event.messageReply && event.messageReply.senderID) uids.push(event.messageReply.senderID);
      else if (args.length > 1) uids = args.slice(1).filter(id => !isNaN(id) && id.trim() !== "");
      else if (args[0] === "add" && args.length === 1) uids.push(event.senderID);
      return [...new Set(uids.map(id => id.toString().trim()))];
    };

    const sub = (args[0] || "").toLowerCase();

    if (sub === "list" || sub === "-l") {
      if (!devArray.length) return message.reply(fancyText("⚠️ | No developers found"));
      const devs = await Promise.all(devArray.map(uid => getUserInfo(uid)));
      const response = devs.map((dev, i) => `${i+1}. ${dev.name} (${dev.uid})`).join("\n");
      return message.reply(fancyText(`👨‍💻 Developer List:\n${response}`));
    }

    if (sub === "add" || sub === "-a") {
      const uids = getUIDs();
      if (!uids.length) return message.reply(this.langs.en.missingIdAdd);
      const added = [], already = [];
      let newDevArray = [...devArray];
      for (const uid of uids) { if (newDevArray.includes(uid)) already.push(uid); else { newDevArray.push(uid); added.push(uid); } }
      if (added.length > 0) { config.developer = newDevArray; config.devUsers = newDevArray; this.saveConfig();
        const addedInfo = await Promise.all(added.map(uid => getUserInfo(uid)));
        await message.reply(fancyText(`✅ Added developer role for ${added.length} user(s):\n${addedInfo.map(i => `• ${i.name} (${i.uid})`).join("\n")}`));
      }
      if (already.length > 0) { const alreadyInfo = await Promise.all(already.map(uid => getUserInfo(uid)));
        return message.reply(fancyText(`⚠️ Already developers:\n${alreadyInfo.map(i => `• ${i.name} (${i.uid})`).join("\n")}`)); }
      return;
    }

    if (sub === "remove" || sub === "-r") {
      const uids = getUIDs();
      if (!uids.length) return message.reply(this.langs.en.missingIdRemove);
      const removed = [], notDev = [];
      let newDevArray = [...devArray];
      for (const uid of uids) { const index = newDevArray.indexOf(uid); if (index !== -1) { newDevArray.splice(index,1); removed.push(uid); } else notDev.push(uid); }
      if (removed.length > 0) { config.developer = newDevArray; config.devUsers = newDevArray; this.saveConfig();
        const removedInfo = await Promise.all(removed.map(uid => getUserInfo(uid)));
        await message.reply(fancyText(`✅ Removed developer role for ${removed.length} user(s):\n${removedInfo.map(i => `• ${i.name} (${i.uid})`).join("\n")}`));
      }
      if (notDev.length > 0) { const notDevInfo = await Promise.all(notDev.map(uid => getUserInfo(uid)));
        return message.reply(fancyText(`⚠️ Not developers:\n${notDevInfo.map(i => `• ${i.name} (${i.uid})`).join("\n")}`)); }
      return;
    }

    if (sub === "fixnames" || sub === "-fn") {
      if (!devArray.length) return message.reply(fancyText("⚠️ | No developers to fix"));
      const devs = await Promise.all(devArray.map(uid => getUserInfo(uid)));
      const report = devs.map((dev,i) => `${i+1}. ${dev.name} (${dev.uid})`).join("\n");
      return message.reply(fancyText(`🛠️ Fixed Developer Names:\n${report}`));
    }

    return message.reply(fancyText("❌ Invalid command"));
  },

  saveConfig: function() {
    try { writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2)); console.log(fancyText("✅ Config saved successfully")); }
    catch (error) { console.error(fancyText("❌ Error saving config:"), error); }
  }
};
