const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

let games = {};

// 🎨 Background Themes
const backgrounds = {
  neon: {
    primary: "#0f0f1a",
    grid: "#9b59b6",
    xColor: "#3498db",
    oColor: "#e67e22",
    titleBg: "#8e44ad"
  },
  cyberpunk: {
    primary: "#1a1a2e",
    grid: "#00ff9d",
    xColor: "#ff0080",
    oColor: "#00eeff",
    titleBg: "#16213e"
  },
  sunset: {
    primary: "#1d2671",
    grid: "#ff9a00",
    xColor: "#ff416c",
    oColor: "#ff4b2b",
    titleBg: "#c33764"
  },
  galaxy: {
    primary: "#0c0c2e",
    grid: "#8a2be2",
    xColor: "#4169e1",
    oColor: "#ff1493",
    titleBg: "#4b0082"
  },
  forest: {
    primary: "#0a2f1c",
    grid: "#2e8b57",
    xColor: "#32cd32",
    oColor: "#ffd700",
    titleBg: "#228b22"
  }
};

// 🎮 Theme Selection Function
function getRandomTheme() {
  const themes = Object.keys(backgrounds);
  return backgrounds[themes[Math.floor(Math.random() * themes.length)]];
}

// 🖼️ Board Render Function
async function renderBoard(board, playerXName, playerOName) {
  const canvas = createCanvas(500, 600);
  const ctx = canvas.getContext("2d");
  
  // Random Theme Selection
  const theme = getRandomTheme();
  
  // Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, 500, 600);
  gradient.addColorStop(0, theme.primary);
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 500, 600);
  
  // Title Bar - Gradient
  const titleGradient = ctx.createLinearGradient(0, 0, 500, 80);
  titleGradient.addColorStop(0, theme.titleBg);
  titleGradient.addColorStop(1, "#000000");
  ctx.fillStyle = titleGradient;
  ctx.fillRect(0, 0, 500, 80);
  
  // Title Text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px 'Arial'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Player Names Styled
  ctx.fillStyle = theme.xColor;
  ctx.fillText(`${playerXName}`, 125, 40);
  ctx.fillStyle = "#ffffff";
  ctx.fillText("🆚", 250, 40);
  ctx.fillStyle = theme.oColor;
  ctx.fillText(`${playerOName}`, 375, 40);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px 'Arial'";
  ctx.fillText("(X)", 125, 65);
  ctx.fillText("(O)", 375, 65);
  
  // Board Background
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fillRect(50, 100, 400, 400);
  
  // Neon Grid Lines
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 5;
  ctx.shadowColor = theme.grid;
  ctx.shadowBlur = 20;
  
  // Vertical Lines
  ctx.beginPath();
  ctx.moveTo(183, 120);
  ctx.lineTo(183, 480);
  ctx.moveTo(316, 120);
  ctx.lineTo(316, 480);
  
  // Horizontal Lines
  ctx.moveTo(50, 220);
  ctx.lineTo(450, 220);
  ctx.moveTo(50, 360);
  ctx.lineTo(450, 360);
  ctx.stroke();
  
  // Cell Numbers (Light)
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.font = "20px 'Arial'";
  
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = 50 + col * 133 + 67;
    const y = 100 + row * 140 + 70;
    ctx.fillText(i + 1, x - 60, y - 40);
  }
  
  // X and O Symbols
  ctx.font = "bold 90px 'Arial'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  for (let i = 0; i < 9; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = 50 + col * 133 + 67;
    const y = 100 + row * 140 + 70;
    
    if (board[i] === "X") {
      ctx.fillStyle = theme.xColor;
      ctx.shadowColor = theme.xColor;
      ctx.shadowBlur = 25;
      ctx.fillText("✗", x, y);
    } else if (board[i] === "O") {
      ctx.fillStyle = theme.oColor;
      ctx.shadowColor = theme.oColor;
      ctx.shadowBlur = 25;
      ctx.fillText("○", x, y);
    }
  }
  
  // Border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 100, 400, 400);
  
  // Bottom Info
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "16px 'Arial'";
  ctx.fillText("Reply with numbers 1-9 to play", 250, 550);
  ctx.fillText("📱 Mobile: Use 1-9 keys", 250, 580);
  
  return canvas.toBuffer();
}

// 🏆 Check Winner
function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  
  for (let line of wins) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  
  if (board.every(cell => cell)) return "draw";
  return null;
}

// ⏰ Timer Reset
function resetTimer(gameId, message) {
  const game = games[gameId];
  if (!game) return;

  if (game.timeout) clearTimeout(game.timeout);

  game.timeout = setTimeout(() => {
    if (games[gameId]) {
      delete games[gameId];
      message.reply({
        body: "⏰ Time's up! Game cancelled.\nType /ttt to start a new game.",
        attachment: null
      });
    }
  }, 120000); // 2 minutes
}

// 📊 Score Tracking (Will save to userData.js)
async function updateScore(usersData, playerId, result) {
  try {
    // Load current user data
    const userData = await usersData.get(playerId);
    
    // If Tic Tac Toe score doesn't exist, create it
    if (!userData.ttt) {
      userData.ttt = {
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        winStreak: 0,
        maxWinStreak: 0,
        points: 0
      };
    }
    
    // Update score
    if (result === "win") {
      userData.ttt.wins++;
      userData.ttt.winStreak++;
      userData.ttt.points += 10; // 10 points for win
      if (userData.ttt.winStreak > userData.ttt.maxWinStreak) {
        userData.ttt.maxWinStreak = userData.ttt.winStreak;
      }
    } else if (result === "loss") {
      userData.ttt.losses++;
      userData.ttt.winStreak = 0; // Reset streak on loss
      userData.ttt.points += 1; // 1 point for loss
    } else if (result === "draw") {
      userData.ttt.draws++;
      userData.ttt.winStreak = 0; // Reset streak on draw
      userData.ttt.points += 5; // 5 points for draw
    }
    
    // Total game count
    userData.ttt.totalGames = userData.ttt.wins + userData.ttt.losses + userData.ttt.draws;
    
    // Calculate winRate
    userData.ttt.winRate = userData.ttt.totalGames > 0 
      ? Math.round((userData.ttt.wins / userData.ttt.totalGames) * 100) 
      : 0;
    
    // Save updated data
    await usersData.set(playerId, userData);
    
  } catch (error) {
    console.error("Error updating score in userData:", error);
  }
}

// 📈 Get Score Function
async function getScore(usersData, playerId) {
  try {
    const userData = await usersData.get(playerId);
    
    // If Tic Tac Toe data doesn't exist
    if (!userData.ttt) {
      return {
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0,
        winRate: 0,
        winStreak: 0,
        maxWinStreak: 0,
        points: 0
      };
    }
    
    return userData.ttt;
  } catch (error) {
    console.error("Error getting score from userData:", error);
    return {
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      winRate: 0,
      winStreak: 0,
      maxWinStreak: 0,
      points: 0
    };
  }
}

module.exports = {
  config: {
    name: "ttt",
    aliases: ["tictactoe", "xoxo", "tttgame"],
    version: "4.5",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Play Tic Tac Toe with amazing themes",
    longDescription: "Play Tic Tac Toe with beautiful neon themes, score tracking in userData.js",
    category: "game",
    guide: {
      en: "{pn} @mention → Start game\nReply with 1-9 to play\n{pn} score → Check your score\n{pn} leaderboard → Top players"
    }
  },

  onStart: async function ({ message, event, usersData, args }) {
    // Score check option
    if (args[0] === "score" || args[0] === "rank") {
      const playerId = event.senderID;
      const playerName = await usersData.getName(playerId);
      const score = await getScore(usersData, playerId);
      
      let scoreMsg = `🏆 ${playerName}'s Tic Tac Toe Score:\n`;
      scoreMsg += "━━━━━━━━━━━━━━━━━━\n\n";
      scoreMsg += `✅ Wins: ${score.wins}\n`;
      scoreMsg += `❌ Losses: ${score.losses}\n`;
      scoreMsg += `🤝 Draws: ${score.draws}\n`;
      scoreMsg += `📊 Total Games: ${score.totalGames}\n`;
      scoreMsg += `⭐ Points: ${score.points}\n\n`;
      scoreMsg += `🎯 Win Rate: ${score.winRate}%\n`;
      scoreMsg += `🔥 Current Streak: ${score.winStreak} wins\n`;
      scoreMsg += `⚡ Max Streak: ${score.maxWinStreak} wins\n`;
      scoreMsg += "\n━━━━━━━━━━━━━━━━━━";
      
      return message.reply(scoreMsg);
    }
    
    // Leaderboard display
    if (args[0] === "leaderboard" || args[0] === "lb" || args[0] === "top") {
      try {
        // Load all user data
        const allUsersData = await usersData.getAll();
        const leaderboard = [];
        
        // Check TTT score for each user
        for (const [userId, userData] of allUsersData) {
          if (userData.ttt && userData.ttt.totalGames > 0) {
            leaderboard.push({
              userId,
              name: userData.name || "Unknown",
              wins: userData.ttt.wins,
              points: userData.ttt.points || 0,
              totalGames: userData.ttt.totalGames,
              winRate: userData.ttt.winRate || 0
            });
          }
        }
        
        // Sort by points (you can change to winRate if preferred)
        leaderboard.sort((a, b) => b.points - a.points);
        
        let leaderboardMsg = "🏆 Tic Tac Toe Leaderboard:\n";
        leaderboardMsg += "━━━━━━━━━━━━━━━━━━\n\n";
        
        if (leaderboard.length === 0) {
          leaderboardMsg += "📭 No scores yet!\nBe the first to play using /ttt\n";
        } else {
          // Show only top 10
          const topPlayers = leaderboard.slice(0, 10);
          
          for (let i = 0; i < topPlayers.length; i++) {
            const player = topPlayers[i];
            const rankEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            
            leaderboardMsg += `${rankEmoji} ${player.name}\n`;
            leaderboardMsg += `   ⭐ ${player.points} pts | 📊 ${player.winRate}% win rate\n\n`;
          }
        }
        
        leaderboardMsg += "━━━━━━━━━━━━━━━━━━";
        return message.reply(leaderboardMsg);
        
      } catch (error) {
        console.error("Error creating leaderboard:", error);
        return message.reply("❌ Error showing leaderboard.");
      }
    }
    
    // Cancel game option
    if (args[0] === "cancel" || args[0] === "end") {
      const gameId = `${event.threadID}`;
      if (games[gameId]) {
        clearTimeout(games[gameId].timeout);
        delete games[gameId];
        return message.reply("✅ Current game cancelled.");
      } else {
        return message.reply("❌ No active game found.");
      }
    }

    const mentions = Object.keys(event.mentions);
    if (mentions.length === 0) {
      const helpMsg = `❌ Please mention someone to start the game!\n\n📝 Usage:\n`;
      helpMsg += `/ttt @friend → Start a new game\n`;
      helpMsg += `/ttt score → Check your score\n`;
      helpMsg += `/ttt leaderboard → View top players\n`;
      helpMsg += `/ttt cancel → Cancel current game`;
      
      return message.reply(helpMsg);
    }

    const playerX = event.senderID;
    const playerO = mentions[0];
    
    // Prevent playing with yourself
    if (playerX === playerO) {
      return message.reply("❌ You cannot play against yourself! Please mention someone else.");
    }

    const playerXName = await usersData.getName(playerX);
    const playerOName = await usersData.getName(playerO);

    const gameId = `${event.threadID}_${Date.now()}`;
    
    // Check if a game is already running in this thread
    for (const id in games) {
      if (id.startsWith(event.threadID)) {
        return message.reply("⚠️ A game is already running in this group!\nType /ttt cancel to end it.");
      }
    }

    games[gameId] = {
      board: Array(9).fill(null),
      players: { X: playerX, O: playerO },
      names: { X: playerXName, O: playerOName },
      turn: "X",
      timeout: null,
      startTime: Date.now(),
      theme: getRandomTheme()
    };

    resetTimer(gameId, message);

    try {
      const img = await renderBoard(games[gameId].board, playerXName, playerOName);
      const filePath = path.join(__dirname, `ttt_${gameId}.png`);
      fs.writeFileSync(filePath, img);

      await message.reply({
        body: `🎮 Tic Tac Toe Game Started!\n\n❌ ${playerXName} → X\n⭕ ${playerOName} → O\n\n🎯 First move: X (${playerXName})\n\n📌 Reply with numbers 1-9 to play`,
        attachment: fs.createReadStream(filePath)
      });

      // Delete file
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 10000);

    } catch (error) {
      console.error("Error creating game:", error);
      delete games[gameId];
      message.reply("❌ Error creating game. Please try again.");
    }
  },

  onChat: async function ({ message, event, usersData }) {
    // Check only for numbers
    if (typeof event.body !== 'string') return;
    
    const trimmed = event.body.trim();
    if (!/^[1-9]$/.test(trimmed)) return;
    
    const move = parseInt(trimmed);
    
    // Find current thread's game
    let gameId = null;
    for (const id in games) {
      if (id.startsWith(event.threadID)) {
        gameId = id;
        break;
      }
    }
    
    if (!gameId) return;
    
    const game = games[gameId];
    if (!game) return;

    // Check if user is a player in the game
    const player = Object.keys(game.players).find(
      key => game.players[key] === event.senderID
    );

    if (!player) {
      return message.reply("❌ You are not a player in this game!");
    }

    if (game.turn !== player) {
      return message.reply(`⏳ It's ${game.names[game.turn]}'s turn!`);
    }

    const index = move - 1;
    if (game.board[index]) {
      return message.reply("❌ This cell is already filled!");
    }

    // Make move
    game.board[index] = player;
    game.turn = game.turn === "X" ? "O" : "X";

    resetTimer(gameId, message);

    const winner = checkWinner(game.board);
    
    try {
      const img = await renderBoard(game.board, game.names.X, game.names.O);
      const filePath = path.join(__dirname, `ttt_${gameId}_${Date.now()}.png`);
      fs.writeFileSync(filePath, img);

      if (winner) {
        clearTimeout(game.timeout);
        
        let resultMessage = "";
        let attachment = fs.createReadStream(filePath);
        
        if (winner === "draw") {
          resultMessage = `🤝 Game Ended in a Draw!\n\n`;
          resultMessage += `${game.names.X} (X) 🆚 ${game.names.O} (O)\n`;
          resultMessage += `⏱️ Time: ${Math.round((Date.now() - game.startTime) / 1000)} seconds\n\n`;
          resultMessage += `✅ Type /ttt to start a new game`;
          
          // Update score in userData.js
          await updateScore(usersData, game.players.X, "draw");
          await updateScore(usersData, game.players.O, "draw");
          
        } else {
          const winnerName = game.names[winner];
          const loser = winner === "X" ? "O" : "X";
          const loserName = game.names[loser];
          
          resultMessage = `🏆 ${winnerName} (${winner}) Wins!\n\n`;
          resultMessage += `🎉 Congratulations ${winnerName}!\n`;
          resultMessage += `😔 Better luck next time ${loserName}\n`;
          resultMessage += `⏱️ Time: ${Math.round((Date.now() - game.startTime) / 1000)} seconds\n\n`;
          resultMessage += `✅ Type /ttt to start a new game`;
          
          // Update score in userData.js
          await updateScore(usersData, game.players[winner], "win");
          await updateScore(usersData, game.players[loser], "loss");
        }
        
        await message.reply({
          body: resultMessage,
          attachment: attachment
        });
        
        delete games[gameId];
        
      } else {
        await message.reply({
          body: `🎯 Now it's ${game.names[game.turn]}'s turn (${game.turn})\n\n📌 Reply with numbers 1-9`,
          attachment: fs.createReadStream(filePath)
        });
      }
      
      // Delete file
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 10000);

    } catch (error) {
      console.error("Error processing move:", error);
      message.reply("❌ Error updating game.");
    }
  },
  
  onExit: function () {
    // Clear all timers when bot exits
    for (const gameId in games) {
      if (games[gameId].timeout) {
        clearTimeout(games[gameId].timeout);
      }
    }
  }
};
