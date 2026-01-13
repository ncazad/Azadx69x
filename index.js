const { spawn } = require("child_process");
const log = require("./logger/log.js");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// keep-alive route (Render requirement)
app.get("/", (req, res) => {
  res.send("Goat Bot is running");
});

app.listen(PORT, () => {
  console.log("HTTP server running on port", PORT);
});

// ---- BOT LAUNCHER ----
let restartCount = 0;
const MAX_RESTARTS = 5;

function startProject() {
  if (restartCount >= MAX_RESTARTS) {
    log.err("INDEX", `Too many crashes (${restartCount}). Bot stopped.`);
    return;
  }

  const child = spawn("node", ["azadx69x.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: process.env // Render env 그대로
  });

  child.on("close", (code) => {
    if (code !== 0) {
      restartCount++;
      log.info(`Goat.js crashed (${code}). Restarting ${restartCount}/${MAX_RESTARTS}`);
      setTimeout(startProject, 3000);
    }
  });

  child.on("error", (err) => {
    log.err("INDEX", "Failed to start azadx69x.js", err);
  });
}

startProject();
