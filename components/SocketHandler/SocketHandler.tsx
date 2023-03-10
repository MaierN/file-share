import {
  useEffect,
  ReactNode,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { flushSync } from "react-dom";
import { Socket } from "socket.io-client";
import io from "socket.io-client";
import {
  ClientToServerEvents,
  Id,
  ServerToClientEvents,
} from "../../shared/types";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import { ClientState } from "../../backend/syncState";
import produce from "immer";
import { applyPatch } from "fast-json-patch";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useEffectOnce from "../../hooks/useEffectOnce";

const SocketContext = createContext<
  | {
      connected: boolean;
      serverState: ClientState;
      socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    }
  | undefined
>(undefined);

function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("no SocketContext.Provider found");
  }
  return context;
}

function SocketHandler({ children }: { children: ReactNode }) {
  const socket = useRef<
    Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  >(undefined);
  const [connected, setConnected] = useState<boolean>(false);
  const [serverState, _setServerState] = useState<ClientState | undefined>(
    undefined
  );
  const router = useRouter();

  useEffectOnce(() => {
    function setServerState(arg: Parameters<typeof _setServerState>[0]) {
      flushSync(() => {
        _setServerState(arg);
      });
    }

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

      socket.current.on("initState", (state) => {
        console.log("initState", state);
        setServerState(state);
      });

      socket.current.on("diffState", (diff) => {
        setServerState((prevState) =>
          produce(prevState, (draft) => {
            applyPatch(draft, diff);
          })
        );
      });

      socket.current.on("showMessage", (message) => {
        console.log("showMessage:", message.type, message.text);
        if (message.type === "error") {
          toast.error(message.text);
        } else {
          toast.info(message.text);
        }
      });

      socket.current.on("redirect", (path: string) => {
        console.log("redirecting to", path);
        router.replace(path);
      });
    }
    const f = connect();

    return () => {
      f.then(() => {
        console.log("disconnecting...");
        socket.current?.disconnect();
      });
    };
  });

  useEffect(() => {
    console.log("serverState:", serverState);
  }, [serverState]);

  if (!connected || socket.current === undefined || serverState === undefined) {
    return <LoadingIndicator />;
  }

  return (
    <SocketContext.Provider
      value={{ connected, serverState, socket: socket.current }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export { useSocketContext, SocketHandler };
