const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["i"],
    version: "1.9",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Convert an image to image URL" },
    longDescription: { en: "Upload image to Imgbb by replying to a photo or sending it directly" },
    category: "tools",
    guide: { en: "{pn} reply to an image or send an image directly" }
  },

  onStart: async function({ api, event }) {
    let attachment = event.messageReply?.attachments?.[0] || event.attachments?.[0];
    if (!attachment) return api.sendMessage('Please reply to a valid image.', event.threadID, event.messageID);

    const imageUrl = attachment.url || attachment.previewUrl;
    if (!imageUrl) return api.sendMessage('Please reply to a valid image.', event.threadID, event.messageID);

    try {
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');

      const form = new FormData();
      form.append('key', 'd579af626f6e98719d175780e78a9e16');
      form.append('image', imageBuffer.toString('base64'));

      const response = await axios.post('https://api.imgbb.com/1/upload', form, { headers: form.getHeaders() });
      const result = response.data.data;
        
      return api.sendMessage(result.url, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage('❌ Failed to upload image to Imgbb.', event.threadID, event.messageID);
    }
  }
};
