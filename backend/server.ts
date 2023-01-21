import { Socket } from "socket.io";
import { Id } from "../shared/types";

const usedIds = new Set<Id>();

function generateId(): Id {
  const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1
  const LENGTH = 8;

  let id = "";
  for (let i = 0; i < LENGTH; i++) {
    id += CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }

  if (usedIds.has(id)) {
    return generateId();
  }

  usedIds.add(id);
  return id;
}

function freeId(id: Id) {
  usedIds.delete(id);
}

interface InterServerEvents {}

function handleClient(socket: Socket) {
  console.log("client connected");

  socket.data.id = generateId();

  socket.on("disconnect", () => {
    console.log("client disconnected");
    freeId(socket.data.id);
  });

  socket.on("linkToId", (message) => {
    console.log("message received", message);
  });

  socket.emit("selfId", socket.data.id);
}

export { handleClient };
export type { InterServerEvents };
