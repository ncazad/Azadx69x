const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: { en: "View commands list with categories or command details" },
    category: "info"
  },

  onStart: async function({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const commandName = (args[0] || "").toLowerCase();
    const cmd = commands.get(commandName) || commands.get(aliases.get(commandName));

    function roleTextToString(role) {  
      return role === 0 ? "🔓 All Users"  
        : role === 1 ? "🛡 Group Admins"  
        : "👑 Bot Admins";  
    }  

    if (cmd) {
      const cfg = cmd.config;
      const name = cfg.name;
      const desc = typeof cfg.description === "string" ? cfg.description : cfg.description?.en || "No description";
      const author = cfg.author || "Unknown";
      const guideBody = typeof cfg.guide?.en === "string" ? cfg.guide.en.replace(/\{pn\}/g, prefix + name) : "No usage info";
      const version = cfg.version || "1.0";
      const roleOfCommand = cfg.role || 0;
      const aliasesString = cfg.aliases?.length ? cfg.aliases.join(", ") : "None";
      const cooldown = cfg.countDown || 1;
      const category = cfg.category || "Uncategorized";

      const msg = `╭───⊙
│ 🧘‍♂️ Command: ${name}
│ 📝 Desc: ${desc}
│ 🗿 Author: ${author}
│ ⚙️ Guide: ${guideBody}
│ 🌀 Version: ${version}
│ 🔐 Role: ${roleTextToString(roleOfCommand)}
│ 🏷️ Aliases: ${aliasesString}
│ ⏱️ Cooldown: ${cooldown}s
│ 🗂️ Category: ${category}
╰──────────────⊙`;

      return message.reply(msg);
    }

    const page = parseInt(args[0]) || 1;
    const numberOfOnePage = 30;

    const categories = {};
    for (const [, cmd] of commands) {
      if (cmd.config.role > 1 && role < cmd.config.role) continue;
      const cat = cmd.config.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config.name);
    }

    const categoryNames = Object.keys(categories).sort();

    const allCommands = [];
    for (const cat of categoryNames) {
      for (const name of categories[cat]) {
        allCommands.push({ name, category: cat });
      }
    }

    if (!allCommands.length) return message.reply("⚠️ No commands available.");

    const totalPage = Math.ceil(allCommands.length / numberOfOnePage);
    if (page < 1 || page > totalPage)
      return message.reply(`⚠️ Page ${page} does not exist. Only ${totalPage} pages.`);

    const start = (page - 1) * numberOfOnePage;
    const commandsToShow = allCommands.slice(start, start + numberOfOnePage);

    let msg = `☠️_X69X HELP MENU_☠️\n\n`;
    let lastCategory = "";

    for (const cmd of commandsToShow) {
      if (cmd.category !== lastCategory) {
        msg += `╭───⊙ 🗂️ ${cmd.category.toUpperCase()} 🤼‍♂️\n`;
        lastCategory = cmd.category;
      }
      msg += `│ 📝 ${cmd.name}\n`;
    }

    msg += `╰──────────────⊙\n`;

    msg += `🗂️ Total Commands: ${allCommands.length}\n`;
    msg += `⚡ Prefix: '${prefix}'\n`;
    msg += `👤 Developer: Azadx69x\n`;
    msg += `💬 Use ${prefix}help <command> to see detailed info\n`;
    msg += `📄 Page: ${page}/${totalPage}`;

    return message.reply(msg);
  }
} 
