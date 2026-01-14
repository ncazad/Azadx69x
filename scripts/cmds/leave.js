const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "leave",
    aliases: ["l"],
    version: "2.0", 
    author: "VexKshitiz",
    countDown: 5,
    role: 2,
    shortDescription: "Bot will leave a group chat",
    longDescription: "",
    category: "admin",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const groupList = await api.getThreadList(300, null, ['INBOX']); 

      const filteredList = groupList.filter(group => group.threadName !== null);

      if (filteredList.length === 0) {
        api.sendMessage('No group chats found.', event.threadID);
      } else {
        const formattedList = filteredList.map((group, index) =>
          `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}`
        );

       
        const start = 0;
        const currentList = formattedList.slice(start, start + 5);

        const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${currentList.join("\n")}\n╰───────────ꔪ`;

        const sentMessage = await api.sendMessage(message, event.threadID);
        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: 'leave',
          messageID: sentMessage.messageID,
          author: event.senderID,
          start,
        });
      }
    } catch (error) {
      console.error("Error listing group chats", error);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, commandName, start } = Reply;

    if (event.senderID !== author) {
      return;
    }

    const userInput = args.join(" ").trim().toLowerCase();

    if (userInput === 'next') {
  
      const nextPageStart = start + 5;
      const nextPageEnd = nextPageStart + 5;

      try {
        const groupList = await api.getThreadList(300, null, ['INBOX']);
        const filteredList = groupList.filter(group => group.threadName !== null);

        if (nextPageStart >= filteredList.length) {
          api.sendMessage('End of list reached.', event.threadID, event.messageID);
          return;
        }

        const currentList = filteredList.slice(nextPageStart, nextPageEnd).map((group, index) =>
          `${nextPageStart + index + 1}. ${group.threadName}\n𝐓𝐈𝐃: ${group.threadID}`
        );

        const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${currentList.join("\n")}\n╰───────────ꔪ`;

        const sentMessage = await api.sendMessage(message, event.threadID);
        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: 'leave',
          messageID: sentMessage.messageID,
          author: event.senderID,
          start: nextPageStart,
        });

      } catch (error) {
        console.error("Error listing group chats", error);
        api.sendMessage('An error occurred while listing group chats.', event.threadID, event.messageID);
      }

    } else if (userInput === 'previous') {
  
      const prevPageStart = Math.max(start - 5, 0);
      const prevPageEnd = prevPageStart + 5;

      try {
        const groupList = await api.getThreadList(300, null, ['INBOX']);
        const filteredList = groupList.filter(group => group.threadName !== null);

        if (prevPageStart < 0) {
          api.sendMessage('Already at the beginning of the list.', event.threadID, event.messageID);
          return;
        }

        const currentList = filteredList.slice(prevPageStart, prevPageEnd).map((group, index) =>
          `${prevPageStart + index + 1}. ${group.threadName}\n𝐓𝐈𝐃: ${group.threadID}`
        );

        const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n${currentList.join("\n")}\n╰───────────ꔪ`;

        const sentMessage = await api.sendMessage(message, event.threadID);
        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: 'leave',
          messageID: sentMessage.messageID,
          author: event.senderID,
          start: prevPageStart,
        });

      } catch (error) {
        console.error("Error listing group chats", error);
        api.sendMessage('An error occurred while listing group chats.', event.threadID, event.messageID);
      }

    } else if (!isNaN(userInput)) {
  
      const groupIndex = parseInt(userInput, 10);

      try {
        const groupList = await api.getThreadList(300, null, ['INBOX']);
        const filteredList = groupList.filter(group => group.threadName !== null);

        if (groupIndex <= 0 || groupIndex > filteredList.length) {
          api.sendMessage('Invalid group number.\nPlease choose a number within the range.', event.threadID, event.messageID);
          return;
        }

        const selectedGroup = filteredList[groupIndex - 1];
        const groupID = selectedGroup.threadID;

        const botUserId = api.getCurrentUserID();
        await api.removeUserFromGroup(botUserId, groupID);

        api.sendMessage(`Left the group chat: ${selectedGroup.threadName}`, event.threadID, event.messageID);

      } catch (error) {
        console.error("Error leaving group chat", error);
        api.sendMessage('An error occurred while leaving the group chat.\nPlease try again later.', event.threadID, event.messageID);
      }

    } else {
      api.sendMessage('Invalid input.\nPlease provide a valid number or reply with "next" or "previous".', event.threadID, event.messageID);
    }

   
    global.GoatBot.onReply.delete(event.messageID);
  },
};
