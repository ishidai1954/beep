const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

// HTTPサーバー（HTMLを配信）
const server = http.createServer((req, res) => {
  const html = fs.readFileSync("index.html");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
});

// WebSocket（押した通知を全員に送る）
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("beep");
      }
    });
  });
});

// サーバー起動
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running");
});
