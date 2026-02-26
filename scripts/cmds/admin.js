const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
    config: {
        name: "admin",
        aliases: ["ad"],
        version: "1.3",
        author: "Azadx69x",
        countDown: 5,
        role: 0,
        shortDescription: {
            en: "Add, remove or view the admin list"
        },
        longDescription: {
            en: "Manage bot admins — add/remove/view"
        },
        category: "admin",
        guide: {
            en:
`Usage:
{pn} list
{pn} add <uid|tag|reply>
{pn} remove <uid|tag|reply>`
        }
    },

    langs: {
        en: {
            listAdmin:
`┍━━━[ 👨‍💻 Admin ]━━━◊
%1
┕━━━━━━━━━◊`,

            noAdmin: "⚠️ No admins found!",

            added:
`┍━━━[ ✅ Added Admin ]━━━◊
%2
┕━━━━━━━━━◊`,

            alreadyAdmin:
`┍━━━[ ⚠️ Already Admin ]━━━◊
%2
┕━━━━━━━━━◊`,

            removed:
`┍━━━[ ❌ Removed Admin ]━━━◊
%2
┕━━━━━━━━━◊`,

            notAdmin:
`┍━━━[ ⚠️ Not Admin ]━━━◊
%2
┕━━━━━━━━━◊`,

            missingIdAdd: "⚠️ Tag/reply/UID needed to add admin.",
            missingIdRemove: "⚠️ Tag/reply/UID needed to remove admin.",

            notAllowed: "⛔ You are not allowed to use this!"
        }
    },

    onStart: async function ({ message, args, event, usersData, getLang }) {
        const senderID = event.senderID;

        const formatAdmin = async (uid) => {
            const name = await usersData.getName(uid);
            return `┋➥ • ${name}\n┋➥ • (${uid})`;
        };
        
        if (args[0] === "list" || args[0] === "-l") {
            if (config.adminBot.length === 0)
                return message.reply(getLang("noAdmin"));

            const adminList = await Promise.all(config.adminBot.map(formatAdmin));
            return message.reply(getLang("listAdmin", adminList.join("\n")));
        }
        
        if (["add", "-a", "remove", "-r"].includes(args[0])) {
            if (!config.adminBot.includes(senderID))
                return message.reply(getLang("notAllowed"));
        }
        
        if (args[0] === "add" || args[0] === "-a") {
            let uids = [];

            if (Object.keys(event.mentions).length)
                uids = Object.keys(event.mentions);
            else if (event.type === "message_reply")
                uids = [event.messageReply.senderID];
            else
                uids = args.filter(a => !isNaN(a));

            if (!uids.length)
                return message.reply(getLang("missingIdAdd"));

            const newAdmins = [];
            const alreadyAdmins = [];

            for (const uid of uids) {
                if (config.adminBot.includes(uid))
                    alreadyAdmins.push(uid);
                else
                    newAdmins.push(uid);
            }

            config.adminBot.push(...newAdmins);
            writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            const newList = await Promise.all(newAdmins.map(formatAdmin));
            const alreadyList = await Promise.all(alreadyAdmins.map(formatAdmin));

            return message.reply(
                (newList.length ? getLang("added", newList.join("\n")) : "") +
                (alreadyList.length ? "\n" + getLang("alreadyAdmin", alreadyList.join("\n")) : "")
            );
        }
        
        if (args[0] === "remove" || args[0] === "-r") {
            let uids = [];

            if (Object.keys(event.mentions).length)
                uids = Object.keys(event.mentions);
            else if (event.type === "message_reply")
                uids = [event.messageReply.senderID];
            else
                uids = args.filter(a => !isNaN(a));

            if (!uids.length)
                return message.reply(getLang("missingIdRemove"));

            const removed = [];
            const notAdmins = [];

            for (const uid of uids) {
                if (config.adminBot.includes(uid)) {
                    removed.push(uid);
                    config.adminBot.splice(config.adminBot.indexOf(uid), 1);
                } else {
                    notAdmins.push(uid);
                }
            }

            writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            const removedList = await Promise.all(removed.map(formatAdmin));
            const notList = await Promise.all(notAdmins.map(formatAdmin));

            return message.reply(
                (removedList.length ? getLang("removed", removedList.join("\n")) : "") +
                (notList.length ? "\n" + getLang("notAdmin", notList.join("\n")) : "")
            );
        }
        
        return message.reply("Use: list / add / remove");
    }
};
