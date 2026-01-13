const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

// Keep-alive route
app.get('/', (req, res) => {
  res.send('Bot is running and alive!');
});

app.listen(PORT, () => {
  console.log(`Keep-alive server running on port ${PORT}`);
});
