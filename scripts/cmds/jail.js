const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "jail",
		version: "1.1",
		author: "yourlove",
		countDown: 5,
		role: 0,
		shortDescription: "Jail image",
		longDescription: "Jail image",
		category: "fun",
		guide: {
			en: "{pn} @tag"
		}
	},

	langs: {
		vi: {
			noTag: "Bạn phải tag người bạn muốn tù"
		},
		en: {
			noTag: "tag or reply to the rapist message"
		}
	},

	onStart: async function ({ event, message, usersData, args, getLang }) {
		const uid = event.senderID;
		const uid1 = event.messageReply ? event.messageReply.senderID : null;
		const uid2 = Object.keys(event.mentions)[0];
		const uids = uid1 || uid2;
		if (!uids)
			return message.reply(getLang("noTag"));
		const avatarURL1 = await usersData.getAvatarUrl(uid);
		const avatarURL2 = await usersData.getAvatarUrl(uids);
		const img = await new DIG.Jail().getImage(avatarURL2);
		const pathSave = `${__dirname}/tmp/${uid2}_Jail.png`;
		fs.writeFileSync(pathSave, Buffer.from(img));
		const content = args.join(' ').replace(Object.keys(event.mentions)[0], "");
		message.reply({
			body: `${(content || "welcome rapist to jail😈")} 🚔`,
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};
