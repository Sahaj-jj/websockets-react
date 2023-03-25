import React, { useEffect, useState, useRef } from "react";
import { json, useLocation, useParams } from "react-router-dom";
import { useWebSocket } from "../websocket-provider";

function Game() {
  const { gameId } = useParams();
  const { socket, clientId, setClientId } = useWebSocket();

  const [isStarted, setIsStarted] = useState(false);

  const [game, setGame] = useState({
    clients: [],
    board: [],
    hostId: "",
  });

  const joinGame = (clientId: string) => {
    if (socket.readyState === 0) {
      return;
    }
    socket.send(
      JSON.stringify({
        method: "join",
        clientId,
        gameId,
      })
    );
  };

  const startGame = () => {
    socket.send(
      JSON.stringify({
        method: "start",
        gameId,
      })
    );
  };

  const playGame = (ballId: string) => {
    socket.send(
      JSON.stringify({
        method: "play",
        gameId,
        clientId,
        ballId,
      })
    );
  };

  const getColorById = (clientId: string) => {
    const client = game.clients.find((client) => client.clientId === clientId);
    if (!client) {
      return "grey";
    }
    return client?.color;
  };

  const handleMessage = (message: any) => {
    const jsonData = JSON.parse(message.data);
    switch (jsonData.method) {
      case "connect":
        setClientId(jsonData.clientId);
        joinGame(jsonData.clientId);
        break;

      case "join":
        setGame(jsonData.game);
        break;

      case "broadcast":
        setGame(jsonData.game);
        if (!isStarted) {
          setIsStarted(true);
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const handleOpen = () => {
      joinGame(clientId);
    };

    socket.addEventListener("message", handleMessage);

    handleOpen();

    return () => {
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("open", handleOpen);
    };
  }, [clientId, gameId, socket]);

  return (
    <div className="layout-cont">
      {isStarted && (
        <div className="time-left">{Math.round(game.timeLeft)}</div>
      )}
      <div className="clients">
        {game.clients.map((client) => (
          <div
            key={client.clientId}
            className="client"
            data-color={getColorById(client.clientId)}
          >
            {client.clientId}
          </div>
        ))}
        {game.hostId === clientId && !isStarted && (
          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
        )}
      </div>
      {game.board?.length > 0 && (
        <div className="board">
          {game.board.map((cell) => (
            <button
              key={cell.ballId}
              className="cell"
              onClick={() => playGame(cell.ballId)}
              data-color={getColorById(cell.clientId)}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Game;
