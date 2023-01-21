import useEffectOnce from "../../hooks/useEffectOnce";
import { useRtcContext } from "../RtcHandler/RtcHandler";
import { useSocketContext } from "../SocketHandler/SocketHandler";

export default function SegmentConnected() {
  const { serverState } = useSocketContext();
  const connectedTo = serverState.connectedTo!;
  const { send, lastMessage } = useRtcContext();

  useEffectOnce(() => {
    send("hello from " + serverState.id);
  });

  return (
    <div>
      This device&apos;s code: {serverState.id}, Other device&apos;s code:{" "}
      {connectedTo.otherId}, Last message: {lastMessage}
    </div>
  );
}
