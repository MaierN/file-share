import { Socket } from "socket.io";
import { z } from "zod";
import {
  ClientToServerEvents,
  Id,
  ServerToClientEvents,
} from "../shared/types";
import { SocketData } from "./server";

type Untrusted<T> = T | { __brand: "UNTRUSTED" };

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

const validators = {
  connectTo: z.string().transform((id) => id as Id),
  disconnectFrom: z.void(),
  rtcDescription: z.string(),
  rtcIceCandidate: z.string(),
};

function validateEvent<EventName extends keyof typeof validators>(
  eventName: EventName,
  data: Untrusted<z.infer<typeof validators[EventName]>>
): ValidationResult<z.infer<typeof validators[EventName]>> {
  return validators[eventName].safeParse(data);
}

function addEventHandler<EventName extends keyof typeof validators>(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>,
  name: EventName,
  callback: (arg: z.infer<typeof validators[EventName]>) => void
) {
  // TODO create issue on socket.io
  // @ts-expect-error
  socket.on(name, (arg: any) => {
    const res = validateEvent(name, arg);
    if (res.success) {
      callback(res.data);
    } else {
      console.error(
        `error while validating ${name} with input ${JSON.stringify(arg)}:`,
        res.error
      );
    }
  });
}

export type { Untrusted };
export { validators, addEventHandler };
