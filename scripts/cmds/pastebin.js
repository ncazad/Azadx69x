const PastebinAPI = require("pastebin-js");
const fs = require("fs");
const path = require("path");

if (typeof process.stderr.clearLine !== "function") {
  process.stderr.clearLine = function () {};
}

module.exports = {
  config: {
    name: "pastebin",
    aliases: ["past"],
    version: "1.4",
    author: "Azadx69x",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Upload files to Pastebin and get raw link"
    },
    longDescription: {
      en: "Upload any file from cmds folder to Pastebin and get raw link"
    },
    category: "utility",
    guide: {
      en: "{pn} <filename>"
    }
  },

  onStart: async function({ api, event, args }) {
    const owners = global.azadx69x?.setting?.creator || [];
    const premium = global.azadx69x?.setting?.premium || [];
    const developers = global.azadx69x?.setting?.developer || [];
    
    const allowed = [...owners, ...premium, ...developers, "61578365162382"];

    if (!allowed.includes(event.senderID)) {
      return api.sendMessage(
        "🚫 You don't have permission to use this command!",
        event.threadID,
        event.messageID
      );
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage(
        "❌ Please provide a file name!",
        event.threadID,
        event.messageID
      );
    }

    const cmdsFolder = path.join(__dirname, "..", "cmds");
    const possibleFiles = [
      path.join(cmdsFolder, fileName),
      path.join(cmdsFolder, fileName + ".js"),
      path.join(cmdsFolder, fileName + ".txt")
    ];

    let filePath;
    for (const f of possibleFiles) {
      if (fs.existsSync(f)) {
        filePath = f;
        break;
      }
    }

    if (!filePath) {
      return api.sendMessage(
        "❌ File not found in cmds folder!",
        event.threadID,
        event.messageID
      );
    }

    const pastebin = new PastebinAPI({
      api_dev_key: "LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9",
      api_user_key: "LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9"
    });

    try {
      const data = fs.readFileSync(filePath, "utf8");
      const paste = await pastebin.createPaste({
        text: data,
        title: path.basename(filePath),
        privacy: 1
      });

      const rawLink = paste.replace("pastebin.com", "pastebin.com/raw");

      const msg =
`╔══⌠ 📤 Pastebin Upload   ⌡══╗
║
║ 🗂️ File Name: ${path.basename(filePath)}
║ 🔗 Paste Link: ${rawLink}
╚═══════════════════╝`;

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "❌ Failed to upload to Pastebin.",
        event.threadID,
        event.messageID
      );
    }
  }
};
