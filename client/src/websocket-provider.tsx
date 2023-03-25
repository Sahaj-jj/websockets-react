import { createContext, useContext, useEffect, useReducer } from "react";

type WebSocketContextType = {
  socket: WebSocket | null;
  clientId: string;
  // Add other important stuff here
};

type WebSocketAction =
  | { type: "SET_SOCKET"; payload: WebSocket }
  | { type: "SET_CLIENT_ID"; payload: string };
// Add other action types here

const initialState: WebSocketContextType = {
  socket: null,
  clientId: "",
  // Add initial values for other important stuff here
};

const WebSocketContext = createContext<WebSocketContextType>({
  ...initialState,
});

interface WebSocketProviderProps {
  url: string;
  children: React.ReactNode;
}

function webSocketReducer(
  state: WebSocketContextType,
  action: WebSocketAction
) {
  switch (action.type) {
    case "SET_SOCKET":
      return {
        ...state,
        socket: action.payload,
      };
    case "SET_CLIENT_ID":
      return {
        ...state,
        clientId: action.payload,
      };
    // Add cases for other action types here
    default:
      return state;
  }
}

function WebSocketProvider({ url, children }: WebSocketProviderProps) {
  const [state, dispatch] = useReducer(webSocketReducer, initialState);

  useEffect(() => {
    const socket = new WebSocket(url);
    dispatch({ type: "SET_SOCKET", payload: socket });

    return () => {
      // socket.close();
    };
  }, [url]);

  if (!state.socket) {
    return <div>Loading</div>;
  }

  const value = [state, dispatch];

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("WebSocket not initialized");
  }

  const [state, dispatch] = context;

  // Add other methods to update important stuff here
  const setClientId = (clientId: string) => {
    dispatch({ type: "SET_CLIENT_ID", payload: clientId });
  };

  return {
    socket: state.socket,
    clientId: state.clientId,
    setClientId,
    // Add other updated stuff here
  };
}

export { WebSocketProvider, useWebSocket };
