import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import { Server as IOServer } from "socket.io";
import { handleClient, SocketData } from "../../backend/server";
import type { InterServerEvents } from "../../backend/server";
import {
  ClientToServerEvents,
  Id,
  ServerToClientEvents,
} from "../../shared/types";

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  console.log("creating socketIO server");
  const io = new IOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    {},
    SocketData
  >(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    handleClient(socket);
  });

  res.end();
}
