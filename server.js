const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
  let filePath = "./public" + (req.url === "/" ? "/index.html" : req.url);
  let extname = path.extname(filePath);

  let contentType = "text/html";
  if (extname === ".js") contentType = "text/javascript";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not Found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

const wss = new WebSocket.Server({ server });

let currentOwner = null;

wss.on("connection", ws => {
  ws.id = Math.random().toString(36).slice(2);

  // 接続時にロック状態を通知
  ws.send(JSON.stringify({
    type: "lock",
    locked: currentOwner !== null
  }));

  ws.on("message", msg => {
    const data = JSON.parse(msg);

    if (data.type === "start") {
      if (currentOwner === null) {
        currentOwner = ws.id;

        broadcast({ type: "lock", locked: true });
        broadcast({ type: "start", pitch: data.pitch });
      }
    }

    if (data.type === "stop") {
      if (currentOwner === ws.id) {
        currentOwner = null;

        broadcast({ type: "stop" });
        broadcast({ type: "lock", locked: false });
      }
    }
  });

  ws.on("close", () => {
    if (currentOwner === ws.id) {
      currentOwner = null;
      broadcast({ type: "stop" });
      broadcast({ type: "lock", locked: false });
    }
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

