type Id = string;

interface ServerToClientEvents {
  selfId: (id: Id) => void;
}

interface ClientToServerEvents {
  linkToId: (id: Id) => void;
}

interface SocketData {
  id: Id;
}

export type { Id, ServerToClientEvents, ClientToServerEvents, SocketData };
