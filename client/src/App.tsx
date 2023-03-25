import { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { useWebSocket } from "./websocket-provider";

function App() {
  const [gameId, setGameId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const { socket, clientId, setClientId } = useWebSocket();
  const navigate = useNavigate();

  function joinGame(gameId: string) {
    navigate(`/games/${gameId}`);
  }

  const handleMessage = (message: any) => {
    const jsonData = JSON.parse(message.data);
    switch (jsonData.method) {
      case "connect":
        setClientId(jsonData.clientId);
        break;
      case "create":
        setGameId(jsonData.game.id);
        joinGame(jsonData.game.id);
      default:
        break;
    }
  };

  useEffect(() => {
    socket.addEventListener("message", handleMessage);
    // return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  function createGame() {
    socket.send(
      JSON.stringify({
        method: "create",
        clientId,
      })
    );
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  function handleInputKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      joinGame(gameId);
    }
  }

  return (
    <div className="layout-cont">
      <div className="button-container">
        <button className="create-button" onClick={createGame}>
          Create Game
        </button>
      </div>
      <div className="input-container">
        <input
          type="text"
          className="input-field"
          placeholder="Enter game ID"
          value={inputValue}
          onChange={handleInputChange}
        />
        <button className="join-button" onClick={() => joinGame(inputValue)}>
          Join Game
        </button>
      </div>
    </div>
  );
}

export default App;
