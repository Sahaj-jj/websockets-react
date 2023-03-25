import http from "http";
import { server as websocketServer } from "websocket";
import path from "path";
import express from "express";

const __dirname = path.resolve();
const app = express();
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});
app.listen(9091);

const httpServer = http.createServer();
httpServer.listen(9090, () => {
  console.log("Listening on port 9090");
});

// state
const clients = {}; // key = clientId
const games = {}; // key = gameId
const colorMap = { 0: "red", 1: "blue", 2: "green" };

const server = new websocketServer({
  httpServer,
});

server.on("request", (request) => {
  // connection request by client
  const connection = request.accept(null, request.origin);

  connection.on("open", () => console.log("opened!"));
  connection.on("close", () => console.log("closed!"));

  connection.on("message", (message) => {
    // message sent by client
    try {
      const result = JSON.parse(message.utf8Data);
      console.log(result);

      const clientId = result.clientId;
      const gameId = result.gameId;
      const method = result.method;

      if (method === "create") {
        const gamePayload = createGame(clientId);
        clients[clientId].connection.send(JSON.stringify(gamePayload));
      } else if (method === "join") {
        joinGame(clientId, gameId);
      } else if (method === "start") {
        startGame(gameId);
      } else if (method === "play") {
        playBall(clientId, gameId, result.ballId);
      }
    } catch (ex) {
      console.log(ex);
    }
  });

  const clientId = guid();
  clients[clientId] = { connection };

  const payload = { method: "connect", clientId };
  connection.send(JSON.stringify(payload));
});

function createGame(hostId) {
  const game = {
    id: guid(),
    hostId,
    balls: 20,
    clients: [],
  };

  games[game.id] = game;

  return { method: "create", game };
}

function joinGame(clientId, gameId) {
  const game = games[gameId];
  if (game.clients?.length >= 3) {
    throw new Error("Max players reached");
  }

  if (
    game.clients.find((client) => client.clientId === clientId) === undefined
  ) {
    const color = colorMap[game.clients?.length];
    game.clients.push({ clientId, color });

    // notify all clients about a new joinee
    game.clients.forEach((client) => {
      clients[client.clientId].connection.send(
        JSON.stringify({ method: "join", game })
      );
    });
  }
}

function startGame(gameId) {
  const game = games[gameId];
  game.board = [];
  for (let i = 0; i < 20; i++) {
    game.board.push({ ballId: i, clientId: "" });
  }

  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsedTime = (Date.now() - startTime) / 1000;

    if (elapsedTime > 30) {
      clearInterval(interval);
    }

    game.timeLeft = 30 - elapsedTime;
    broadcastGame(gameId);
  }, 100);
}

function playBall(clientId, gameId, ballId) {
  const game = games[gameId];
  const cell = game.board.find((cell) => cell.ballId === ballId);
  cell.clientId = clientId;
}

function broadcastGame(gameId) {
  games[gameId].clients.forEach((client) => {
    clients[client.clientId].connection.send(
      JSON.stringify({
        method: "broadcast",
        game: games[gameId],
      })
    );
  });
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function guid() {
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}
