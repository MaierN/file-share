import { Operation } from "fast-json-patch";
import { z } from "zod";
import { ClientState } from "../backend/syncState";
import { Untrusted, validators } from "../backend/validation";

type Id = string;

type ServerMessage = {
  type: "error" | "info";
  text: string;
};

interface ServerToClientEvents {
  initState: (state: ClientState) => void;
  diffState: (diff: Operation[]) => void;
  showMessage: (message: ServerMessage) => void;
}

type ClientToServerEvents = {
  [EventName in keyof typeof validators]: (
    arg: Untrusted<z.infer<typeof validators[EventName]>>
  ) => void;
};

export type { Id, ServerToClientEvents, ClientToServerEvents };
