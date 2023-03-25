import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Game from "./routes/game";
import { WebSocketProvider } from "./websocket-provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WebSocketProvider url="ws://localhost:9090">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/games/:gameId" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  </React.StrictMode>
);
