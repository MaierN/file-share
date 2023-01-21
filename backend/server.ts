import { Socket } from "socket.io";
import {
  ClientToServerEvents,
  Id,
  ServerToClientEvents,
} from "../shared/types";
import { addEventHandler } from "./validation";
import { addObserver, getState, mutState } from "./syncState";
import { memoize } from "proxy-memoize";

function generateId(): Id {
  const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1
  const LENGTH = 8;

  let id = "";
  for (let i = 0; i < LENGTH; i++) {
    id += CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }

  if (getState().connectedClients.hasOwnProperty(id)) {
    return generateId();
  }

  return id;
}

interface InterServerEvents {}

interface SocketData {}

function handleClient(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
) {
  const clientId = generateId();
  console.log(`client ${clientId} connected`);

  mutState((draft) => {
    draft.connectedClients[clientId] = {
      id: clientId,
      connectedTo: undefined,
    };
  });

  const observerRm = addObserver(
    memoize((state) => state.connectedClients[clientId]),
    (state, diff) => {
      if (diff.length) {
        socket.emit("diffState", diff);
      } else {
        socket.emit("initState", state);
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`client ${clientId} disconnected`);

    observerRm();
    mutState((draft) => {
      const client = draft.connectedClients[clientId];
      if (client.connectedTo !== undefined) {
        draft.connectedClients[client.connectedTo.otherId].connectedTo =
          undefined;
      }
      delete draft.connectedClients[clientId];
    });
  });

  addEventHandler(socket, "connectTo", (otherId) => {
    // TODO rate limit

    console.log(`client ${clientId} wants to connect to ${otherId}`);

    if (clientId === otherId) {
      console.error("client cannot connect to itself");
      return;
    }

    const client = getState().connectedClients[clientId];
    if (client.connectedTo !== undefined) {
      console.error("client already connected to someone");
      return;
    }

    if (!getState().connectedClients.hasOwnProperty(otherId)) {
      console.error("other client not found");
      return;
    }

    const otherClient = getState().connectedClients[otherId];

    if (otherClient.connectedTo !== undefined) {
      console.error("other client already connected to someone");
      return;
    }

    mutState((draft) => {
      draft.connectedClients[clientId].connectedTo = {
        otherId,
        isMaster: true,
      };
      draft.connectedClients[otherId].connectedTo = {
        otherId: clientId,
        isMaster: false,
      };
    });

    console.log("connection established");
  });

  addEventHandler(socket, "disconnectFrom", (a) => {
    console.log(`client ${clientId} wants to disconnect`);

    const client = getState().connectedClients[clientId];
    if (client.connectedTo === undefined) {
      console.error("client is not connected to anyone");
      return;
    }

    mutState((draft) => {
      const client = draft.connectedClients[clientId];
      draft.connectedClients[client.connectedTo!.otherId].connectedTo =
        undefined;
      client.connectedTo = undefined;

      console.log("disconnect done");
    });
  });

  addEventHandler(socket, "rtcDescription", (description) => {
    console.log(`client ${clientId} wants to send rtc description`);

    const client = getState().connectedClients[clientId];
    if (client.connectedTo === undefined) {
      console.error("client is not connected to anyone");
      return;
    }

    mutState((draft) => {
      const client = draft.connectedClients[clientId];
      draft.connectedClients[
        client.connectedTo!.otherId
      ].connectedTo!.otherRtcDescription = description;
    });

    console.log(`rtc description sent to ${client.connectedTo.otherId}`);
  });

  addEventHandler(socket, "rtcIceCandidate", (candidate) => {
    console.log(`client ${clientId} wants to send rtc ice candidate`);

    const client = getState().connectedClients[clientId];
    if (client.connectedTo === undefined) {
      console.error("client is not connected to anyone");
      return;
    }

    mutState((draft) => {
      const client = draft.connectedClients[clientId];
      draft.connectedClients[
        client.connectedTo!.otherId
      ].connectedTo!.otherLastIceCandidate = candidate;
    });

    console.log(`rtc ice candidate sent to ${client.connectedTo.otherId}`);
  });
}

export { handleClient };
export type { InterServerEvents, SocketData };