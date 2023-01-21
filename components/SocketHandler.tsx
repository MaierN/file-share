import {
  useEffect,
  ReactNode,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import {
  ClientToServerEvents,
  Id,
  ServerToClientEvents,
} from "../shared/types";
import LoadingIndicator from "./LoadingIndicator/LoadingIndicator";

type SocketContextType = {
  connected: boolean;
  selfId: Id;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("no SocketContext.Provider found");
  }
  return context;
}

function SocketHandler({ children }: { children: ReactNode }) {
  const socket = useRef<null | Socket<
    ServerToClientEvents,
    ClientToServerEvents
  >>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [selfId, setSelfId] = useState<Id | undefined>(undefined);

  useEffect(() => {
    async function connect() {
      console.log("connecting...");

      await fetch("/api/socket");
      socket.current = io();

      socket.current.on("connect", () => {
        console.log("connected");
        setConnected(true);
      });

      socket.current.on("disconnect", () => {
        console.log("disconnected");
        setConnected(false);
      });

      socket.current.on("selfId", (id) => {
        console.log("selfId", id);
        setSelfId(id);
      });
    }
    const f = connect();

    return () => {
      f.then(() => {
        socket.current?.disconnect();
      });
    };
  }, []);

  if (!connected || selfId === undefined) {
    return <LoadingIndicator />;
  }

  return (
    <SocketContext.Provider value={{ connected, selfId }}>
      {children}
    </SocketContext.Provider>
  );
}

export { useSocketContext, SocketHandler };
